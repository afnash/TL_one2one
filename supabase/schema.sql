-- sofiaa: paste this entire file in the Supabase SQL Editor and Run.
-- No sample data. Re-runnable; existing rows are preserved.
-- LOCKED MODE: the public (anon/publishable) key has no access to any table,
-- function or storage write. The Next.js server reaches the database with
-- SUPABASE_SECRET_KEY after checking the signed session cookie (app/api/*).
-- Passwords are stored only as scrypt hashes in data->>'passwordHash'.
begin;

do $$
declare tab text;
begin
  foreach tab in array array['managers','teachers','students','subjects','sessions','whiteboards','assignments','submissions','materials','sessionreports','notifications','profiles'] loop
    execute format('create table if not exists public.%I (id text primary key, data jsonb not null, updated_at timestamptz not null default now(), check (jsonb_typeof(data) = ''object''), check (data->>''id'' = id))', 'lms_' || tab);
    execute format('alter table public.%I enable row level security', 'lms_' || tab);
    execute format('drop policy if exists prototype_access on public.%I', 'lms_' || tab);
    execute format('revoke all on public.%I from public, anon, authenticated', 'lms_' || tab);
    execute format('grant select, insert, update, delete on public.%I to service_role', 'lms_' || tab);
    execute format('create index if not exists %I on public.%I using gin(data)', 'lms_' || tab || '_data_idx', 'lms_' || tab);
  end loop;
end $$;

create unique index if not exists lms_submission_student_assignment on public.lms_submissions ((data->>'assignmentId'), (data->>'studentId'));
create unique index if not exists lms_report_session on public.lms_sessionreports ((data->>'sessionId'));
create index if not exists lms_students_teacher on public.lms_students ((data->>'teacherId'));
create index if not exists lms_students_manager on public.lms_students ((data->>'managerId'));
create index if not exists lms_teachers_manager on public.lms_teachers ((data->>'managerId'));
create index if not exists lms_sessions_teacher on public.lms_sessions ((data->>'teacherId'));
create index if not exists lms_materials_subject on public.lms_materials ((data->>'subject'));
create index if not exists lms_materials_topic on public.lms_materials ((data->>'topic'));
create index if not exists lms_materials_keywords on public.lms_materials using gin ((data->'keywords'));

-- Value sanity checks (NOT VALID: enforced for new writes, existing rows are not rescanned).
-- A score must be a number between 0 and the submission's maxScore; a due date, when set,
-- must be an ISO calendar date. The API (lib/data-access.ts) validates the same rules first.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'lms_submissions_score_range') then
    alter table public.lms_submissions add constraint lms_submissions_score_range check (
      case when data ? 'score' and jsonb_typeof(data->'score') <> 'null'
        then jsonb_typeof(data->'score') = 'number' and (data->>'score')::numeric >= 0
          and (data->>'score')::numeric <= case when jsonb_typeof(data->'maxScore') = 'number' then (data->>'maxScore')::numeric else 1000000 end
        else true end) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'lms_assignments_due_date_format') then
    alter table public.lms_assignments add constraint lms_assignments_due_date_format check (
      coalesce(data->>'dueDate', '') = '' or data->>'dueDate' ~ '^\d{4}-\d{2}-\d{2}$') not valid;
  end if;
end $$;

-- RAG Study Materials Keyword & Context Search RPC. % _ and \ in the query (and
-- in stored keywords) are escaped so they match literally instead of as wildcards.
create or replace function public.search_materials(p_query text)
returns setof jsonb language sql stable set search_path = public as $$
  with q as (
    select trim(p_query) as raw,
      '%' || replace(replace(replace(trim(p_query), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  )
  select m.data from public.lms_materials m, q
  where p_query is not null and length(q.raw) > 0
    and (
      m.data->>'subject' ilike q.pattern
      or m.data->>'topic' ilike q.pattern
      or m.data->>'title' ilike q.pattern
      or m.data->>'description' ilike q.pattern
      or exists (
        select 1 from jsonb_array_elements_text(coalesce(m.data->'keywords', '[]'::jsonb)) kw
        where kw ilike q.pattern
          or q.raw ilike '%' || replace(replace(replace(kw, '\', '\\'), '%', '\%'), '_', '\_') || '%'
      )
    )
  order by m.updated_at desc;
$$;
revoke all on function public.search_materials(text) from public, anon, authenticated;
grant execute on function public.search_materials(text) to service_role;

-- Merge changed fields atomically. Board element deltas are merged under a row
-- lock: simultaneous strokes with different IDs are never lost. Deleting a stroke
-- removes only IDs the editing client actually saw. Same-element edits use last write.
create or replace function public.lms_patch(p_table text, p_id text, p_patch jsonb, p_previous jsonb default '{}'::jsonb)
returns void language plpgsql security invoker set search_path = public as $$
declare existing jsonb; merged jsonb; changed jsonb; removed text[]; item jsonb;
begin
  if p_table <> all(array['lms_managers','lms_teachers','lms_students','lms_subjects','lms_sessions','lms_whiteboards','lms_assignments','lms_submissions','lms_materials','lms_sessionreports','lms_notifications','lms_profiles']) then
    raise exception 'Unsupported collection: %', p_table;
  end if;
  if p_id is null or length(p_id) = 0 or jsonb_typeof(p_patch) <> 'object' then raise exception 'Invalid record'; end if;
  -- An advisory lock also serializes simultaneous first inserts for the same ID.
  perform pg_advisory_xact_lock(hashtextextended(p_table || ':' || p_id, 0));
  execute format('select data from public.%I where id=$1 for update', p_table) into existing using p_id;
  merged := coalesce(existing, '{}'::jsonb) || p_patch || jsonb_build_object('id', p_id);
  if p_table = 'lms_whiteboards' and existing is not null and p_patch ? 'elements' then
    select coalesce(jsonb_agg(n.value), '[]'::jsonb) into changed
    from jsonb_array_elements(p_patch->'elements') n
    where not exists (select 1 from jsonb_array_elements(coalesce(p_previous->'elements','[]'::jsonb)) o where o.value = n.value);
    select coalesce(array_agg(o.value->>'id'), array[]::text[]) into removed
    from jsonb_array_elements(coalesce(p_previous->'elements','[]'::jsonb)) o
    where not exists (select 1 from jsonb_array_elements(p_patch->'elements') n where n.value->>'id' = o.value->>'id');
    select coalesce(jsonb_agg(e.value), '[]'::jsonb) into item
    from jsonb_array_elements(coalesce(existing->'elements','[]'::jsonb)) e
    where not (e.value->>'id' = any(removed))
      and not exists (select 1 from jsonb_array_elements(changed) c where c.value->>'id' = e.value->>'id');
    merged := jsonb_set(merged, '{elements}', item || changed);
  end if;
  -- Raised hands and permissions also merge as sets across browsers.
  if p_table = 'lms_sessions' and existing is not null then
    foreach p_table in array array['raisedHands','writerIds'] loop
      if p_patch ? p_table then
        select coalesce(jsonb_agg(v), '[]'::jsonb) into item from (
          select value as v from jsonb_array_elements(coalesce(existing->p_table,'[]'::jsonb))
          where value not in (select value from jsonb_array_elements(coalesce(p_previous->p_table,'[]'::jsonb)) where value not in (select value from jsonb_array_elements(p_patch->p_table)))
          union select value from jsonb_array_elements(p_patch->p_table) where value not in (select value from jsonb_array_elements(coalesce(p_previous->p_table,'[]'::jsonb)))
        ) values_to_merge;
        merged := jsonb_set(merged, array[p_table], item);
      end if;
    end loop;
    p_table := 'lms_sessions';
  end if;
  if p_table = 'lms_submissions' and merged->>'status' = 'REVIEWED' then
    if (merged->>'score')::numeric < 0 or (merged->>'score')::numeric > (merged->>'maxScore')::numeric then raise exception 'Marks must be between zero and the maximum score'; end if;
  end if;
  execute format('insert into public.%I (id,data) values ($1,$2) on conflict (id) do update set data=excluded.data, updated_at=now()', p_table) using p_id, merged;
end $$;
revoke all on function public.lms_patch(text,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.lms_patch(text,text,jsonb,jsonb) to service_role;

-- Conference tables & RPCs
create table if not exists public.conference_rooms (
  code text primary key,
  host_token_hash bytea not null,
  revision integer not null default 0,
  data jsonb not null
);
alter table public.conference_rooms enable row level security;
revoke all on public.conference_rooms from public, anon, authenticated;

create or replace function public.conference_create(p_teacher_id text, p_title text, p_host_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare room_code text; room_data jsonb; host_name text;
begin
  if p_host_token is null or length(p_host_token) < 32 or length(p_host_token) > 200 then
    raise exception 'Invalid host credential';
  end if;
  if p_title is null or length(trim(p_title)) < 1 or length(p_title) > 120 then
    raise exception 'Enter a conference title (maximum 120 characters)';
  end if;
  select data->>'name' into host_name from public.lms_teachers where id = p_teacher_id;
  if host_name is null then raise exception 'A teacher profile is required to host'; end if;
  room_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
  room_data := jsonb_build_object('code', room_code, 'title', trim(p_title),
    'hostId', p_teacher_id, 'hostName', host_name, 'status', 'LIVE',
    'createdAt', now(), 'videoRoom', 'OneToOneConference' || replace(gen_random_uuid()::text, '-', ''),
    'board', jsonb_build_object('id', 'conference-' || room_code, 'title', trim(p_title),
      'subject', 'Conference', 'teacherId', p_teacher_id, 'category', 'LIVE_CLASS',
      'lastEdited', now(), 'elements', '[]'::jsonb));
  insert into public.conference_rooms(code, host_token_hash, data)
    values(room_code, sha256(convert_to(p_host_token, 'UTF8')), room_data);
  return room_data || jsonb_build_object('revision', 0);
end;
$$;

create or replace function public.conference_read(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  select data || jsonb_build_object('revision', revision) into result
    from public.conference_rooms where code = p_code;
  if result is null then raise exception 'Conference not found. Check the join code.'; end if;
  return result;
end;
$$;

create or replace function public.conference_update(p_code text, p_host_token text, p_revision integer, p_action text, p_elements jsonb default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare room public.conference_rooms%rowtype;
begin
  select * into room from public.conference_rooms where code = p_code for update;
  if not found or p_host_token is null or room.host_token_hash <> sha256(convert_to(p_host_token, 'UTF8')) then
    raise exception 'Only the conference host can change this room';
  end if;
  if room.data->>'status' <> 'LIVE' then raise exception 'This conference has ended'; end if;
  if p_revision is null or p_revision <> room.revision then raise exception 'The board changed in another host tab. Reload before editing.'; end if;
  if p_action = 'board' then
    if p_elements is null or jsonb_typeof(p_elements) <> 'array' or octet_length(p_elements::text) > 2000000 then
      raise exception 'Invalid board or board exceeds 2 MB';
    end if;
    room.data := jsonb_set(room.data, '{board,elements}', p_elements);
    room.data := jsonb_set(room.data, '{board,lastEdited}', to_jsonb(now()));
  elsif p_action = 'end' then
    room.data := room.data || jsonb_build_object('status', 'ENDED', 'endedAt', now());
  else raise exception 'Unsupported conference action';
  end if;
  update public.conference_rooms set data = room.data, revision = room.revision + 1 where code = p_code;
  return room.data || jsonb_build_object('revision', room.revision + 1);
end;
$$;

revoke all on function public.conference_create(text,text,text) from public, anon, authenticated;
revoke all on function public.conference_read(text) from public, anon, authenticated;
revoke all on function public.conference_update(text,text,integer,text,jsonb) from public, anon, authenticated;
grant execute on function public.conference_create(text,text,text) to service_role;
grant execute on function public.conference_read(text) to service_role;
grant execute on function public.conference_update(text,text,integer,text,jsonb) to service_role;

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-materials', 'study-materials', true, 52428800, array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','video/mp4','text/plain'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- Public bucket: files are readable by URL. Uploads go through /api/upload with
-- the secret key, so anon/authenticated get no insert, list or delete policy.
drop policy if exists lms_material_upload on storage.objects;
drop policy if exists lms_material_read on storage.objects;
drop policy if exists lms_material_delete on storage.objects;
notify pgrst, 'reload schema';
commit;

-- ONE-TIME MAINTENANCE (do not run as part of setup). Legacy rows may still hold a
-- plaintext `password`. Sign-in NO LONGER accepts plaintext (unless the temporary env
-- flag ALLOW_PLAINTEXT_PASSWORDS=true is set). PREFERRED: run
--   node --env-file=.env.local scripts/hash-legacy-passwords.mjs
-- which hashes each legacy password so users keep their login. Only if you would rather
-- discard them, run this block once: accounts without a passwordHash then need an
-- admin/manager to set a new password, and bumping tokenVersion signs out open sessions.
-- begin;
-- do $$
-- declare tab text;
-- begin
--   foreach tab in array array['lms_managers','lms_teachers','lms_students'] loop
--     execute format($f$update public.%I set data = (data - 'password')
--       || jsonb_build_object('tokenVersion', coalesce((data->>'tokenVersion')::int, 0) + 1), updated_at = now()
--       where data ? 'password'$f$, tab);
--   end loop;
-- end $$;
-- commit;
