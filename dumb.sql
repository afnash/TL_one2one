CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------
-- Table Definitions (Idempotent)
-- ----------------------------------------------------------------------

create table if not exists "public"."lms_assignments" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_assignments_pkey" primary key ("id"),
    constraint "lms_assignments_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_assignments_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_assignments" enable row level security;

create table if not exists "public"."lms_materials" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_materials_pkey" primary key ("id"),
    constraint "lms_materials_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_materials_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_materials" enable row level security;

create table if not exists "public"."lms_notifications" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_notifications_pkey" primary key ("id"),
    constraint "lms_notifications_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_notifications_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_notifications" enable row level security;

create table if not exists "public"."lms_profiles" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_profiles_pkey" primary key ("id"),
    constraint "lms_profiles_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_profiles_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_profiles" enable row level security;

create table if not exists "public"."lms_sessionreports" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_sessionreports_pkey" primary key ("id"),
    constraint "lms_sessionreports_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_sessionreports_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_sessionreports" enable row level security;

create table if not exists "public"."lms_sessions" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_sessions_pkey" primary key ("id"),
    constraint "lms_sessions_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_sessions_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_sessions" enable row level security;

create table if not exists "public"."lms_students" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_students_pkey" primary key ("id"),
    constraint "lms_students_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_students_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_students" enable row level security;

create table if not exists "public"."lms_subjects" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_subjects_pkey" primary key ("id"),
    constraint "lms_subjects_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_subjects_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_subjects" enable row level security;

create table if not exists "public"."lms_submissions" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_submissions_pkey" primary key ("id"),
    constraint "lms_submissions_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_submissions_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_submissions" enable row level security;

create table if not exists "public"."lms_teachers" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_teachers_pkey" primary key ("id"),
    constraint "lms_teachers_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_teachers_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_teachers" enable row level security;

create table if not exists "public"."lms_whiteboards" (
    "id" text not null,
    "data" jsonb not null,
    "updated_at" timestamp with time zone not null default now(),
    constraint "lms_whiteboards_pkey" primary key ("id"),
    constraint "lms_whiteboards_data_check" check (jsonb_typeof(data) = 'object'::text),
    constraint "lms_whiteboards_data_id_check" check ((data ->> 'id'::text) = id)
);

alter table "public"."lms_whiteboards" enable row level security;

-- ----------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS lms_assignments_data_idx ON public.lms_assignments USING gin (data);

CREATE INDEX IF NOT EXISTS lms_materials_data_idx ON public.lms_materials USING gin (data);

CREATE INDEX IF NOT EXISTS lms_notifications_data_idx ON public.lms_notifications USING gin (data);

CREATE INDEX IF NOT EXISTS lms_profiles_data_idx ON public.lms_profiles USING gin (data);

CREATE UNIQUE INDEX IF NOT EXISTS lms_report_session ON public.lms_sessionreports USING btree (((data ->> 'sessionId'::text)));

CREATE INDEX IF NOT EXISTS lms_sessionreports_data_idx ON public.lms_sessionreports USING gin (data);

CREATE INDEX IF NOT EXISTS lms_sessions_data_idx ON public.lms_sessions USING gin (data);

CREATE INDEX IF NOT EXISTS lms_sessions_teacher ON public.lms_sessions USING btree (((data ->> 'teacherId'::text)));

CREATE INDEX IF NOT EXISTS lms_students_data_idx ON public.lms_students USING gin (data);

CREATE INDEX IF NOT EXISTS lms_students_teacher ON public.lms_students USING btree (((data ->> 'teacherId'::text)));

CREATE INDEX IF NOT EXISTS lms_subjects_data_idx ON public.lms_subjects USING gin (data);

CREATE UNIQUE INDEX IF NOT EXISTS lms_submission_student_assignment ON public.lms_submissions USING btree (((data ->> 'assignmentId'::text)), ((data ->> 'studentId'::text)));

CREATE INDEX IF NOT EXISTS lms_submissions_data_idx ON public.lms_submissions USING gin (data);

CREATE INDEX IF NOT EXISTS lms_teachers_data_idx ON public.lms_teachers USING gin (data);

CREATE INDEX IF NOT EXISTS lms_whiteboards_data_idx ON public.lms_whiteboards USING gin (data);

-- ----------------------------------------------------------------------
-- Functions
-- ----------------------------------------------------------------------

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.lms_patch(p_table text, p_id text, p_patch jsonb, p_previous jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
end;
$function$
;

-- ----------------------------------------------------------------------
-- Permissions & Grants
-- ----------------------------------------------------------------------

grant delete on table "public"."lms_assignments" to "anon";
grant insert on table "public"."lms_assignments" to "anon";
grant references on table "public"."lms_assignments" to "anon";
grant select on table "public"."lms_assignments" to "anon";
grant trigger on table "public"."lms_assignments" to "anon";
grant truncate on table "public"."lms_assignments" to "anon";
grant update on table "public"."lms_assignments" to "anon";

grant delete on table "public"."lms_assignments" to "authenticated";
grant insert on table "public"."lms_assignments" to "authenticated";
grant references on table "public"."lms_assignments" to "authenticated";
grant select on table "public"."lms_assignments" to "authenticated";
grant trigger on table "public"."lms_assignments" to "authenticated";
grant truncate on table "public"."lms_assignments" to "authenticated";
grant update on table "public"."lms_assignments" to "authenticated";

grant delete on table "public"."lms_assignments" to "service_role";
grant insert on table "public"."lms_assignments" to "service_role";
grant references on table "public"."lms_assignments" to "service_role";
grant select on table "public"."lms_assignments" to "service_role";
grant trigger on table "public"."lms_assignments" to "service_role";
grant truncate on table "public"."lms_assignments" to "service_role";
grant update on table "public"."lms_assignments" to "service_role";

grant delete on table "public"."lms_materials" to "anon";
grant insert on table "public"."lms_materials" to "anon";
grant references on table "public"."lms_materials" to "anon";
grant select on table "public"."lms_materials" to "anon";
grant trigger on table "public"."lms_materials" to "anon";
grant truncate on table "public"."lms_materials" to "anon";
grant update on table "public"."lms_materials" to "anon";

grant delete on table "public"."lms_materials" to "authenticated";
grant insert on table "public"."lms_materials" to "authenticated";
grant references on table "public"."lms_materials" to "authenticated";
grant select on table "public"."lms_materials" to "authenticated";
grant trigger on table "public"."lms_materials" to "authenticated";
grant truncate on table "public"."lms_materials" to "authenticated";
grant update on table "public"."lms_materials" to "authenticated";

grant delete on table "public"."lms_materials" to "service_role";
grant insert on table "public"."lms_materials" to "service_role";
grant references on table "public"."lms_materials" to "service_role";
grant select on table "public"."lms_materials" to "service_role";
grant trigger on table "public"."lms_materials" to "service_role";
grant truncate on table "public"."lms_materials" to "service_role";
grant update on table "public"."lms_materials" to "service_role";

grant delete on table "public"."lms_notifications" to "anon";
grant insert on table "public"."lms_notifications" to "anon";
grant references on table "public"."lms_notifications" to "anon";
grant select on table "public"."lms_notifications" to "anon";
grant trigger on table "public"."lms_notifications" to "anon";
grant truncate on table "public"."lms_notifications" to "anon";
grant update on table "public"."lms_notifications" to "anon";

grant delete on table "public"."lms_notifications" to "authenticated";
grant insert on table "public"."lms_notifications" to "authenticated";
grant references on table "public"."lms_notifications" to "authenticated";
grant select on table "public"."lms_notifications" to "authenticated";
grant trigger on table "public"."lms_notifications" to "authenticated";
grant truncate on table "public"."lms_notifications" to "authenticated";
grant update on table "public"."lms_notifications" to "authenticated";

grant delete on table "public"."lms_notifications" to "service_role";
grant insert on table "public"."lms_notifications" to "service_role";
grant references on table "public"."lms_notifications" to "service_role";
grant select on table "public"."lms_notifications" to "service_role";
grant trigger on table "public"."lms_notifications" to "service_role";
grant truncate on table "public"."lms_notifications" to "service_role";
grant update on table "public"."lms_notifications" to "service_role";

grant delete on table "public"."lms_profiles" to "anon";
grant insert on table "public"."lms_profiles" to "anon";
grant references on table "public"."lms_profiles" to "anon";
grant select on table "public"."lms_profiles" to "anon";
grant trigger on table "public"."lms_profiles" to "anon";
grant truncate on table "public"."lms_profiles" to "anon";
grant update on table "public"."lms_profiles" to "anon";

grant delete on table "public"."lms_profiles" to "authenticated";
grant insert on table "public"."lms_profiles" to "authenticated";
grant references on table "public"."lms_profiles" to "authenticated";
grant select on table "public"."lms_profiles" to "authenticated";
grant trigger on table "public"."lms_profiles" to "authenticated";
grant truncate on table "public"."lms_profiles" to "authenticated";
grant update on table "public"."lms_profiles" to "authenticated";

grant delete on table "public"."lms_profiles" to "service_role";
grant insert on table "public"."lms_profiles" to "service_role";
grant references on table "public"."lms_profiles" to "service_role";
grant select on table "public"."lms_profiles" to "service_role";
grant trigger on table "public"."lms_profiles" to "service_role";
grant truncate on table "public"."lms_profiles" to "service_role";
grant update on table "public"."lms_profiles" to "service_role";

grant delete on table "public"."lms_sessionreports" to "anon";
grant insert on table "public"."lms_sessionreports" to "anon";
grant references on table "public"."lms_sessionreports" to "anon";
grant select on table "public"."lms_sessionreports" to "anon";
grant trigger on table "public"."lms_sessionreports" to "anon";
grant truncate on table "public"."lms_sessionreports" to "anon";
grant update on table "public"."lms_sessionreports" to "anon";

grant delete on table "public"."lms_sessionreports" to "authenticated";
grant insert on table "public"."lms_sessionreports" to "authenticated";
grant references on table "public"."lms_sessionreports" to "authenticated";
grant select on table "public"."lms_sessionreports" to "authenticated";
grant trigger on table "public"."lms_sessionreports" to "authenticated";
grant truncate on table "public"."lms_sessionreports" to "authenticated";
grant update on table "public"."lms_sessionreports" to "authenticated";

grant delete on table "public"."lms_sessionreports" to "service_role";
grant insert on table "public"."lms_sessionreports" to "service_role";
grant references on table "public"."lms_sessionreports" to "service_role";
grant select on table "public"."lms_sessionreports" to "service_role";
grant trigger on table "public"."lms_sessionreports" to "service_role";
grant truncate on table "public"."lms_sessionreports" to "service_role";
grant update on table "public"."lms_sessionreports" to "service_role";

grant delete on table "public"."lms_sessions" to "anon";
grant insert on table "public"."lms_sessions" to "anon";
grant references on table "public"."lms_sessions" to "anon";
grant select on table "public"."lms_sessions" to "anon";
grant trigger on table "public"."lms_sessions" to "anon";
grant truncate on table "public"."lms_sessions" to "anon";
grant update on table "public"."lms_sessions" to "anon";

grant delete on table "public"."lms_sessions" to "authenticated";
grant insert on table "public"."lms_sessions" to "authenticated";
grant references on table "public"."lms_sessions" to "authenticated";
grant select on table "public"."lms_sessions" to "authenticated";
grant trigger on table "public"."lms_sessions" to "authenticated";
grant truncate on table "public"."lms_sessions" to "authenticated";
grant update on table "public"."lms_sessions" to "authenticated";

grant delete on table "public"."lms_sessions" to "service_role";
grant insert on table "public"."lms_sessions" to "service_role";
grant references on table "public"."lms_sessions" to "service_role";
grant select on table "public"."lms_sessions" to "service_role";
grant trigger on table "public"."lms_sessions" to "service_role";
grant truncate on table "public"."lms_sessions" to "service_role";
grant update on table "public"."lms_sessions" to "service_role";

grant delete on table "public"."lms_students" to "anon";
grant insert on table "public"."lms_students" to "anon";
grant references on table "public"."lms_students" to "anon";
grant select on table "public"."lms_students" to "anon";
grant trigger on table "public"."lms_students" to "anon";
grant truncate on table "public"."lms_students" to "anon";
grant update on table "public"."lms_students" to "anon";

grant delete on table "public"."lms_students" to "authenticated";
grant insert on table "public"."lms_students" to "authenticated";
grant references on table "public"."lms_students" to "authenticated";
grant select on table "public"."lms_students" to "authenticated";
grant trigger on table "public"."lms_students" to "authenticated";
grant truncate on table "public"."lms_students" to "authenticated";
grant update on table "public"."lms_students" to "authenticated";

grant delete on table "public"."lms_students" to "service_role";
grant insert on table "public"."lms_students" to "service_role";
grant references on table "public"."lms_students" to "service_role";
grant select on table "public"."lms_students" to "service_role";
grant trigger on table "public"."lms_students" to "service_role";
grant truncate on table "public"."lms_students" to "service_role";
grant update on table "public"."lms_students" to "service_role";

grant delete on table "public"."lms_subjects" to "anon";
grant insert on table "public"."lms_subjects" to "anon";
grant references on table "public"."lms_subjects" to "anon";
grant select on table "public"."lms_subjects" to "anon";
grant trigger on table "public"."lms_subjects" to "anon";
grant truncate on table "public"."lms_subjects" to "anon";
grant update on table "public"."lms_subjects" to "anon";

grant delete on table "public"."lms_subjects" to "authenticated";
grant insert on table "public"."lms_subjects" to "authenticated";
grant references on table "public"."lms_subjects" to "authenticated";
grant select on table "public"."lms_subjects" to "authenticated";
grant trigger on table "public"."lms_subjects" to "authenticated";
grant truncate on table "public"."lms_subjects" to "authenticated";
grant update on table "public"."lms_subjects" to "authenticated";

grant delete on table "public"."lms_subjects" to "service_role";
grant insert on table "public"."lms_subjects" to "service_role";
grant references on table "public"."lms_subjects" to "service_role";
grant select on table "public"."lms_subjects" to "service_role";
grant trigger on table "public"."lms_subjects" to "service_role";
grant truncate on table "public"."lms_subjects" to "service_role";
grant update on table "public"."lms_subjects" to "service_role";

grant delete on table "public"."lms_submissions" to "anon";
grant insert on table "public"."lms_submissions" to "anon";
grant references on table "public"."lms_submissions" to "anon";
grant select on table "public"."lms_submissions" to "anon";
grant trigger on table "public"."lms_submissions" to "anon";
grant truncate on table "public"."lms_submissions" to "anon";
grant update on table "public"."lms_submissions" to "anon";

grant delete on table "public"."lms_submissions" to "authenticated";
grant insert on table "public"."lms_submissions" to "authenticated";
grant references on table "public"."lms_submissions" to "authenticated";
grant select on table "public"."lms_submissions" to "authenticated";
grant trigger on table "public"."lms_submissions" to "authenticated";
grant truncate on table "public"."lms_submissions" to "authenticated";
grant update on table "public"."lms_submissions" to "authenticated";

grant delete on table "public"."lms_submissions" to "service_role";
grant insert on table "public"."lms_submissions" to "service_role";
grant references on table "public"."lms_submissions" to "service_role";
grant select on table "public"."lms_submissions" to "service_role";
grant trigger on table "public"."lms_submissions" to "service_role";
grant truncate on table "public"."lms_submissions" to "service_role";
grant update on table "public"."lms_submissions" to "service_role";

grant delete on table "public"."lms_teachers" to "anon";
grant insert on table "public"."lms_teachers" to "anon";
grant references on table "public"."lms_teachers" to "anon";
grant select on table "public"."lms_teachers" to "anon";
grant trigger on table "public"."lms_teachers" to "anon";
grant truncate on table "public"."lms_teachers" to "anon";
grant update on table "public"."lms_teachers" to "anon";

grant delete on table "public"."lms_teachers" to "authenticated";
grant insert on table "public"."lms_teachers" to "authenticated";
grant references on table "public"."lms_teachers" to "authenticated";
grant select on table "public"."lms_teachers" to "authenticated";
grant trigger on table "public"."lms_teachers" to "authenticated";
grant truncate on table "public"."lms_teachers" to "authenticated";
grant update on table "public"."lms_teachers" to "authenticated";

grant delete on table "public"."lms_teachers" to "service_role";
grant insert on table "public"."lms_teachers" to "service_role";
grant references on table "public"."lms_teachers" to "service_role";
grant select on table "public"."lms_teachers" to "service_role";
grant trigger on table "public"."lms_teachers" to "service_role";
grant truncate on table "public"."lms_teachers" to "service_role";
grant update on table "public"."lms_teachers" to "service_role";

grant delete on table "public"."lms_whiteboards" to "anon";
grant insert on table "public"."lms_whiteboards" to "anon";
grant references on table "public"."lms_whiteboards" to "anon";
grant select on table "public"."lms_whiteboards" to "anon";
grant trigger on table "public"."lms_whiteboards" to "anon";
grant truncate on table "public"."lms_whiteboards" to "anon";
grant update on table "public"."lms_whiteboards" to "anon";

grant delete on table "public"."lms_whiteboards" to "authenticated";
grant insert on table "public"."lms_whiteboards" to "authenticated";
grant references on table "public"."lms_whiteboards" to "authenticated";
grant select on table "public"."lms_whiteboards" to "authenticated";
grant trigger on table "public"."lms_whiteboards" to "authenticated";
grant truncate on table "public"."lms_whiteboards" to "authenticated";
grant update on table "public"."lms_whiteboards" to "authenticated";

grant delete on table "public"."lms_whiteboards" to "service_role";
grant insert on table "public"."lms_whiteboards" to "service_role";
grant references on table "public"."lms_whiteboards" to "service_role";
grant select on table "public"."lms_whiteboards" to "service_role";
grant trigger on table "public"."lms_whiteboards" to "service_role";
grant truncate on table "public"."lms_whiteboards" to "service_role";
grant update on table "public"."lms_whiteboards" to "service_role";

revoke all on function "public"."lms_patch"(text, text, jsonb, jsonb) from public;
grant execute on function "public"."lms_patch"(text, text, jsonb, jsonb) to "anon";
grant execute on function "public"."lms_patch"(text, text, jsonb, jsonb) to "authenticated";
grant execute on function "public"."lms_patch"(text, text, jsonb, jsonb) to "service_role";

-- ----------------------------------------------------------------------
-- RLS Policies (Idempotent)
-- ----------------------------------------------------------------------

drop policy if exists "prototype_access" on "public"."lms_assignments";
create policy "prototype_access"
on "public"."lms_assignments"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_materials";
create policy "prototype_access"
on "public"."lms_materials"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_notifications";
create policy "prototype_access"
on "public"."lms_notifications"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_profiles";
create policy "prototype_access"
on "public"."lms_profiles"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_sessionreports";
create policy "prototype_access"
on "public"."lms_sessionreports"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_sessions";
create policy "prototype_access"
on "public"."lms_sessions"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_students";
create policy "prototype_access"
on "public"."lms_students"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_subjects";
create policy "prototype_access"
on "public"."lms_subjects"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_submissions";
create policy "prototype_access"
on "public"."lms_submissions"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_teachers";
create policy "prototype_access"
on "public"."lms_teachers"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_access" on "public"."lms_whiteboards";
create policy "prototype_access"
on "public"."lms_whiteboards"
as permissive
for all
to anon, authenticated
using (true)
with check (true);

-- ----------------------------------------------------------------------
-- Storage
-- ----------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-materials', 'study-materials', true, 52428800, array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','video/mp4','text/plain'])
on conflict (id) do nothing;

drop policy if exists "lms_material_upload" on "storage"."objects";
create policy "lms_material_upload"
on "storage"."objects"
as permissive
for insert
to anon, authenticated
with check ((bucket_id = 'study-materials'::text));

drop policy if exists "lms_material_read" on "storage"."objects";
create policy "lms_material_read"
on "storage"."objects"
as permissive
for select
to anon, authenticated
using ((bucket_id = 'study-materials'::text));

drop policy if exists "lms_material_delete" on "storage"."objects";
create policy "lms_material_delete"
on "storage"."objects"
as permissive
for delete
to anon, authenticated
using ((bucket_id = 'study-materials'::text));


-- Conference rooms (also available as a standalone migration).
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
