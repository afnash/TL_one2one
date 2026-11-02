# sofiaa

Student and teacher workspaces backed by the Supabase Data and Storage APIs, with password sign-in and signed session cookies.

## Setup

1. Open your Supabase project's SQL Editor, paste all of [supabase/schema.sql](./supabase/schema.sql), and Run. The script is transactional and can be re-run without deleting existing rows. It creates no sample users, sessions, assignments, or notes.
2. Set the values shown in [.env.example](./.env.example) in .env.local. The supplied project URL and publishable key are already configured locally. Also set the server-only SUPABASE_SECRET_KEY, SESSION_SECRET, ADMIN_USERNAME and ADMIN_PASSWORD. Never give these a NEXT_PUBLIC_ prefix.
3. Restart with npm run dev (use npm.cmd run dev in PowerShell if script execution is disabled).
4. Open /manage and sign in with ADMIN_USERNAME and ADMIN_PASSWORD from .env.local. Give every account a password of 8+ characters (accounts without one cannot sign in). Add teachers and students. Edit a student to assign a teacher and subjects.
5. Open /login and sign in with the email and password an administrator set for the account. Your role decides which portal opens (student, teacher, manager). The session is an httpOnly signed cookie; nothing about the account is kept in localStorage.

## Workflows

- Teachers can add students, claim unassigned students, and schedule classes for one or multiple learners. Assignments support individual, multiple, or the teacher's entire roster; choose Assignment or Homework when creating work.
- A class has a shared board and optional external Meet/Zoom meeting URL. Use the meeting URL for audio/video; the built-in video tile is a local device preview, not a remote video-call transport.
- Board changes are polled every two seconds while the browser is visible. The SQL RPC locks each board row and merges changed/deleted element IDs so simultaneous independent strokes are preserved. Concurrent changes to the same element use last write. Raise-hand and writing-permission lists also merge atomically. Teachers can grant/revoke writing access in group classes; individual learners can write directly.
- Editable boards accept pasted clipboard images. Images are resized for shared storage, placed in the visible center, and selected automatically; use the Select tool to drag them. Canvas wheel and trackpad gestures pan the board without scrolling its fixed editor toolbar.
- Students receive a separate persistent submission board copied from the assignment's question board. Teachers annotate it, enter marks and feedback, and return a reviewed submission. Submitted boards are read-only for students.
- Materials support real file uploads up to 50 MB and HTTP(S) links, including YouTube. Private YouTube links still require access granted by the video owner. Resources assigned to ALL are visible to the uploading teacher's students. Removing a library record currently leaves its uploaded file in Storage.
- Profile edits, rosters, sessions, whiteboards, grades, materials, and reports persist through per-record API updates. The UI shows saving/failure states; failed changes require reload and retry. Analytics derive from stored classes and submissions, with empty states when no records exist.

## Database structure

The lms_* tables store a text primary key, a JSONB data document matching types/index.ts, and updated_at. This preserves the existing rich canvas and question model without flattening it into hundreds of columns. GIN indexes support document queries. Submission and report uniqueness is enforced by indexes. lms_patch applies atomic field and board-element patches. No Supabase Auth users are created.

## Temporary access model

Security model: the database is locked. Row Level Security is enabled on every table and the public (anon/publishable) key has no access; only the Next.js server reaches the database, using the server-only SUPABASE_SECRET_KEY after verifying the signed HttpOnly session cookie (app/api/*, lib/data-access.ts enforces per-role read/write scope). The materials bucket is public: files are readable by anyone holding their URL.

Operations notes:
- Keep secrets in `.env.local` (note the leading dot; `env.local` is also git-ignored). Rotate SESSION_SECRET if a file ever sat outside .gitignore or was shared.
- Legacy plaintext passwords are no longer accepted at sign-in. Run `node --env-file=.env.local scripts/hash-legacy-passwords.mjs` once to hash them (or set `ALLOW_PLAINTEXT_PASSWORDS=true` temporarily, then unset it).
- Behind a reverse proxy set `TRUSTED_PROXY_HOPS` (e.g. 1) so per-IP rate limits use the real client address; when unset, forwarding headers are ignored and only per-account limits apply. Rate limits and the password-hashing queue (`HASH_CONCURRENCY`, `HASH_QUEUE`) are per process; use a shared store when running several instances.
- Video signaling messages are authenticated with per-pair keys issued by /api/sessions/[id]/signaling and need a secure context (https or localhost) for WebCrypto. Add a TURN server for restrictive networks.

The publishable key cannot execute DDL; schema creation must be done in the SQL Editor or using a separate privileged database connection. The app follows the [Supabase REST API](https://supabase.com/docs/guides/api) and [API key](https://supabase.com/docs/guides/getting-started/api-keys) conventions.

## Verification

- npm run build
- npm run lint
- SQL checks: node scripts/schema-check.mjs /absolute/path/to/@electric-sql/pglite (a separately installed optional test runtime; the database is in memory). This validates the complete script, re-runs, stale-client board edits, hand raises, permission changes, grading bounds, uniqueness, and anon access without touching Supabase.
- With a local server running: node scripts/smoke.mjs http://localhost:3000
- After SQL setup, verify with real profiles: use two separate browser profiles, schedule a group class, draw simultaneously, grant/revoke raised-hand access, submit and grade work, upload a PDF, and reload both workspaces. No test or seed records are inserted automatically into the shared Supabase project.

## CS live coding

Open a CS / Computer Science live class as its teacher or student, then select **Live coding** beside **Whiteboard**. Subject IDs and custom subject names are recognized when their subject record has code CS. Teachers start as the editor and can pass the editing turn to any class participant. One participant edits and runs at a time; all participants see shared source, stdin, and the latest output. Completed classes retain read-only code, and source can be downloaded.

The workspace uses the existing lms_sessions JSON document and two-second polling; no schema change or compiler API key is needed. The fields are codeDocument, codeEditorId, and codeRun. Code execution calls the same-origin /api/code/run route, which forwards validated programs to the [Judge0 API](https://ce.judge0.com/docs). No API key is currently required by this endpoint. Source, stdin and output use Base64 for Unicode support. Runs have time limits and queue polling; public-service availability and rate limits apply. Execution failures appear locally and preserve the last shared result. This uses the existing prototype identity/permission model described above; editing turns are UI controls, not authenticated database locks or simultaneous character merging.

Verify with two browser profiles: start a CS class, open Live coding in both, edit and run Python, pass the turn to the student, enter stdin, and confirm the teacher sees updates and output. Change the code after running to see the stale-output notice. Switch back to the whiteboard and confirm strokes remain. Reload to check persistence; end the class to check read-only behavior. A non-CS class should show only the whiteboard. Compiler and permission checks: node scripts/coding-check.mjs.

## Conferences

The **Conference** sidebar tab is available to teachers and students. A teacher creates a titled conference and shares its 16-character join code. Any signed-in teacher or student with that code can join the group video and view the host's board. Membership in the host's student roster is not required. The host alone gets board editing and End conference controls. Copy the code to share it; leaving keeps the room open, while ending it disconnects embedded video and freezes the board for everyone on their next poll.

**Database setup:** run [supabase/migrations/20260910_conferences.sql](./supabase/migrations/20260910_conferences.sql) once in Supabase's SQL Editor. It is also included in supabase/schema.sql for fresh setups. The migration adds a private conference_rooms table and narrowly scoped create/read/update RPCs. Direct anonymous/authenticated table access is revoked; a join code permits reading a room, while only a separate random host credential can save or end it. Only its SHA-256 hash is stored in the database. Revision checks reject stale writes from a second host tab. Never add this table to the generic lms_patch allowlist or public read/write policies.

The host credential is retained in this browser's local storage, scoped to the teacher and room. Rejoin from the same browser/profile using the code to regain controls. Room creation requires a signed-in teacher session; the host identity comes from the session. Join codes grant viewing access, so share them only with intended participants.

Video uses the [Jitsi iframe API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/). The default meet.jit.si service requires the first participant/host to sign in to create the video meeting; guests can wait for the host and join without a Jitsi account. Set NEXT_PUBLIC_JITSI_DOMAIN to your own Jitsi hostname if desired. Camera and microphone start muted and permissions are handled by Jitsi. Jitsi's moderator rules are separate from the app's host-only whiteboard. Ending the LMS conference closes its embedded calls; independently opened Jitsi windows must be ended using Jitsi controls. Availability and participant capacity depend on the chosen Jitsi service.

Validate the database in isolation: node scripts/conference-check.mjs /path/to/@electric-sql/pglite. Then use two browser profiles to create/join by code, connect video, draw as host, confirm participant view-only controls, reload/rejoin as host, and end the room. The board syncs every two seconds; this is not a remote video-call test until real participants connect.
