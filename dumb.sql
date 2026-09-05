-- OneToOne LMS: paste this entire file in the Supabase SQL Editor and Run.
-- No sample data. Re-runnable; existing rows are preserved.
-- TEMPORARY ROLE-ONLY MODE: anon policies deliberately allow shared read/write.
-- Anyone holding the public key can access these records. The /manage password
-- protects the admin pages, not the public Data API. Add Auth + ownership RLS
-- before using this project for confidential student information.
begin;

do $$
declare tab text;
begin
  foreach tab in array array['teachers','students','subjects','sessions','whiteboards','assignments','submissions','materials','sessionreports','notifications','profiles'] loop
    execute format('create table if not exists public.%I (id text primary key, data jsonb not null, updated_at timestamptz not null default now(), check (jsonb_typeof(data) = ''object''), check (data->>''id'' = id))', 'lms_' || tab);
    execute format('alter table public.%I enable row level security', 'lms_' || tab);
    execute format('drop policy if exists prototype_access on public.%I', 'lms_' || tab);
    execute format('create policy prototype_access on public.%I for all to anon, authenticated using (true) with check (true)', 'lms_' || tab);
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', 'lms_' || tab);
    execute format('create index if not exists %I on public.%I using gin(data)', 'lms_' || tab || '_data_idx', 'lms_' || tab);
  end loop;
end $$;

create unique index if not exists lms_submission_student_assignment on public.lms_submissions ((data->>'assignmentId'), (data->>'studentId'));
create unique index if not exists lms_report_session on public.lms_sessionreports ((data->>'sessionId'));
create index if not exists lms_students_teacher on public.lms_students ((data->>'teacherId'));
create index if not exists lms_sessions_teacher on public.lms_sessions ((data->>'teacherId'));

-- Merge changed fields atomically. Board element deltas are merged under a row
-- lock: simultaneous strokes with different IDs are never lost. Deleting a stroke
-- removes only IDs the editing client actually saw. Same-element edits use last write.
create or replace function public.lms_patch(p_table text, p_id text, p_patch jsonb, p_previous jsonb default '{}'::jsonb)
returns void language plpgsql security invoker set search_path = public as $$
declare existing jsonb; merged jsonb; changed jsonb; removed text[]; item jsonb;
begin
  if p_table <> all(array['lms_teachers','lms_students','lms_subjects','lms_sessions','lms_whiteboards','lms_assignments','lms_submissions','lms_materials','lms_sessionreports','lms_notifications','lms_profiles']) then
    raise exception 'Unsupported collection';
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
revoke all on function public.lms_patch(text,text,jsonb,jsonb) from public;
grant execute on function public.lms_patch(text,text,jsonb,jsonb) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-materials', 'study-materials', true, 52428800, array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','video/mp4','text/plain'])
on conflict (id) do nothing;
drop policy if exists lms_material_upload on storage.objects;
create policy lms_material_upload on storage.objects for insert to anon, authenticated with check (bucket_id = 'study-materials');
drop policy if exists lms_material_read on storage.objects;
create policy lms_material_read on storage.objects for select to anon, authenticated using (bucket_id = 'study-materials');
drop policy if exists lms_material_delete on storage.objects;
create policy lms_material_delete on storage.objects for delete to anon, authenticated using (bucket_id = 'study-materials');
notify pgrst, 'reload schema';
commit;
