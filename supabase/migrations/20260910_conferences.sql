-- Conference capability tokens are separate from the prototype's public LMS data.
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

revoke all on function public.conference_create(text,text,text) from public;
revoke all on function public.conference_read(text) from public;
revoke all on function public.conference_update(text,text,integer,text,jsonb) from public;
grant execute on function public.conference_create(text,text,text) to anon, authenticated;
grant execute on function public.conference_read(text) to anon, authenticated;
grant execute on function public.conference_update(text,text,integer,text,jsonb) to anon, authenticated;

