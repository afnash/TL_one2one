<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# sofiaa — project notes

Live one-to-one teaching platform: video, shared whiteboard, assignments, grading, session reports. Roles: student, teacher, manager, admin (super admin). Product background is in `PRODUCT_OVERVIEW.md`, setup and operations in `README.md`.

## Stack

- Next.js 16 (App Router, React 19, TypeScript), Tailwind CSS v4, shadcn/ui (radix, `radix-nova`), lucide icons.
- Supabase Postgres behind the server only. Data lives in `lms_*` tables as JSONB documents typed by `types/index.ts`.
- Route gating is in `proxy.ts` (this Next version renamed middleware to proxy and runs it on Node).

## Commands

- `npm run dev` starts the dev server on port 3000. Restart it after editing `.env.local`.
- `npx tsc --noEmit` and `npm run lint` must both pass with 0 errors before finishing a change.
- `node scripts/smoke.mjs http://localhost:3000` runs the API smoke test against a running server.
- `scripts/*-check.mjs` are database and feature checks (see `README.md`). `schema-check.mjs` reads `supabase/schema.sql`.
- Add components with `npx shadcn@latest add <name>`. Never accept the generated `cn` import from a package named `cn`; the project helper is `@/lib/utils`.

## Where things are

- `app/` pages by role: `student/`, `teacher/`, `manager/`, `admin/`; sign-in at `login/` and `manage/` (admin); `forgot-password/` only explains that an admin resets passwords.
- `app/api/` server routes: `auth/` (session, login, credentials), `data/` (generic table access), `rpc/`, `sessions/[id]/signaling`, `upload`, `code/run`, `manage`.
- `lib/` server and shared logic: `session.ts` (signed cookie), `passwords.ts` (scrypt, capped concurrency), `rate-limit.ts`, `data-access.ts` (all authorization), `remote-collection.ts` and `store.tsx` (client data layer), `webrtc.ts`, `conference.ts`.
- `components/ui/` shadcn components. `components/brand/` logo (`Brand`), auth page frame (`AuthShell`), scroll `Reveal`. `components/layout/` app shell, sidebar, header. `components/landing/` landing page pieces.
- `public/logo.png` is the transparent logo; `app/icon.png` the tab icon; `public/icon.jpg` the default avatar.

## Conventions

- Brand name is lowercase "sofiaa". Use `<Brand />`, never retype the wordmark. Do not add pill badges or fake statistics to marketing pages.
- Dashboards and list pages are built from `components/dashboard/parts.tsx` (`PageHeader`, `Section`, `Stat`, `ListRow`/`RowList`, `EmptyNote`); destructive actions use `ConfirmAction`. One primary button per page, no pill badges, no decorative icon chips, no fake statistics. People lists use `RosterManager`; profile settings use `ProfileCard` + `AccountSecurityForm`.
- Use shadcn components and semantic tokens (`bg-primary`, `text-muted-foreground`). The old `indigo-*` Tailwind scale is remapped to the brand blue in `app/globals.css`, so existing indigo classes are on-brand.
- Fonts: Outfit for headings and the wordmark feel (`font-heading`), DM Sans for body.
- The sidebar collapsed state lives in `components/layout/sidebar-state.ts` (module-level, persisted), so pages never flash expanded on navigation. Loading states use `Skeleton`, not text.
- Motion: 150ms for hover and press, 200–240ms for content entrances and tabs, 250ms for sheets and dialogs (closing 150ms), soft ease-out. Respect reduced motion. Use `<Reveal>` for scroll entrances.
- Authorization is decided on the server in `lib/data-access.ts` from the stored row, never from the client payload. UI role checks are convenience only.
- Writes from the UI go through `lib/remote-collection.ts`; await the server result before showing "saved".
- Secrets live in `.env.local` only (git-ignored). Never prefix server secrets with `NEXT_PUBLIC_`.

## Known gaps

- Group-session video: `useWebRTC` keeps one peer per student, but the session pages still render only one remote tile.
- The manager dashboard and manager pages have not been checked with a real manager account.
- Default avatars: records created before this change store `/icon.jpg` (the logo) as their avatar; lists should show initials instead.
- Signalling channel names are public; a full fix needs Supabase private channels.
- Code runner uses the public Judge0 instance; there is no TURN server.
