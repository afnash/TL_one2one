import { NextResponse } from "next/server";
import { authorizeDelete, authorizeWrite, Denied, fetchRow, invalidateScope, isAccountTable, isTable, loadScope, preparePatch, readVisible, stripSecrets } from "@/lib/data-access";
import { rateLimited } from "@/lib/rate-limit";
import { forgetAccount, getSession, sameOrigin } from "@/lib/session";
import { publicError, supabaseAdminRequest } from "@/lib/supabase-server";
import type { UserRole } from "@/types";

type Context = { params: Promise<{ table: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const MAX_BODY = 4 * 1024 * 1024;
const PAGE = 500;
const ROLE_OF: Record<string, UserRole> = { lms_managers: "MANAGER", lms_teachers: "TEACHER", lms_students: "STUDENT" };

async function authorize(request: Request, context: Context, mutating: boolean) {
  const { table } = await context.params;
  if (!isTable(table)) return { error: fail("Unknown collection", 404) };
  if (mutating && !sameOrigin(request)) return { error: fail("Invalid origin", 403) };
  const session = await getSession();
  if (!session) return { error: fail("Sign in to continue", 401) };
  return { table, session };
}

const denied = (error: unknown, fallback: string, status: number) =>
  error instanceof Denied ? fail(error.message, error.status) : fail(publicError(error, fallback), status);

export async function GET(request: Request, context: Context) {
  const auth = await authorize(request, context, false);
  if (auth.error) return auth.error;
  // Per user and collection; far above normal polling (a few requests per 10s).
  if (rateLimited(`data:${auth.session.id}:${auth.table}`, 120, 60 * 1000)) return fail("Too many requests. Slow down and retry shortly.", 429);
  const offset = Math.max(0, Math.floor(Number(new URL(request.url).searchParams.get("offset")) || 0));
  try {
    const scope = await loadScope(auth.session);
    return NextResponse.json(await readVisible(scope, auth.table, offset, PAGE));
  } catch (error) { return denied(error, "Unable to load data", 502); }
}

export async function POST(request: Request, context: Context) {
  const auth = await authorize(request, context, true);
  if (auth.error) return auth.error;
  if (rateLimited(`data-write:${auth.session.id}`, 600, 60 * 1000)) return fail("Too many changes. Slow down and retry shortly.", 429);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return fail("Change is too large", 413);
  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY) return fail("Change is too large", 413);
  let body: { id?: unknown; patch?: unknown; previous?: unknown } | null = null;
  try { body = JSON.parse(raw); } catch { /* handled below */ }
  const id = body?.id;
  if (typeof id !== "string" || !id || id.length > 200 || !body?.patch || typeof body.patch !== "object" || Array.isArray(body.patch)) return fail("Invalid record", 400);
  try {
    const scope = await loadScope(auth.session, true);
    const existing = await fetchRow(auth.table, id);
    const result = await authorizeWrite(scope, auth.table, id, existing, body.patch as Record<string, unknown>);
    const patch = await preparePatch(auth.table, id, result.patch, existing);
    if (!Object.keys(patch).length) return NextResponse.json({ ok: true });
    // `previous` only steers merging of set-like fields; authorization above used the stored row.
    const previous = { ...stripSecrets(body.previous as Record<string, unknown>), ...result.previous };
    await supabaseAdminRequest("/rest/v1/rpc/lms_patch", { method: "POST", body: JSON.stringify({ p_table: auth.table, p_id: id, p_patch: patch, p_previous: previous }) });
    if (isAccountTable(auth.table) && "tokenVersion" in patch) forgetAccount(ROLE_OF[auth.table], id);
    invalidateScope(auth.session);
    return NextResponse.json({ ok: true });
  } catch (error) { return denied(error, "Unable to save changes", 400); }
}

export async function DELETE(request: Request, context: Context) {
  const auth = await authorize(request, context, true);
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return fail("Invalid record", 400);
  try {
    const existing = await fetchRow(auth.table, id);
    if (!existing) return NextResponse.json({ ok: true });
    authorizeDelete(await loadScope(auth.session, true), auth.table, existing);
    await supabaseAdminRequest(`/rest/v1/${auth.table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
    if (isAccountTable(auth.table)) forgetAccount(ROLE_OF[auth.table], id);
    invalidateScope(auth.session);
    return NextResponse.json({ ok: true });
  } catch (error) { return denied(error, "Unable to delete this record", 502); }
}
