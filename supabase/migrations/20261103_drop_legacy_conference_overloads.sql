-- Run once in the Supabase SQL Editor.
-- An earlier conference design left overloaded copies of these functions behind
-- (uuid / character varying parameters). With both versions present PostgREST
-- cannot pick one (PGRST203) and every conference call fails. The current
-- versions take text parameters and are defined in supabase/schema.sql.
drop function if exists public.conference_create(uuid, character varying, text);
drop function if exists public.conference_read(character varying);
drop function if exists public.conference_update(character varying, text, integer, character varying, jsonb);
notify pgrst, 'reload schema';
