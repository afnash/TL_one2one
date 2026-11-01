import { NextResponse } from "next/server";
import { ACCOUNT_TABLES, checkAccountPassword, Denied, fetchRow, preparePatch } from "@/lib/data-access";
import { HashBusy } from "@/lib/passwords";
import { limitReached, recordFailure } from "@/lib/rate-limit";
import { accountTokenVersion, createSessionToken, forgetAccount, getSession, sameOrigin, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { publicError, supabaseAdminRequest } from "@/lib/supabase-server";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const WINDOW = 15 * 60 * 1000;

// A signed-in user changes their own email and/or password. Both require the current
// password, so a stolen session cookie alone cannot take over the account.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Invalid origin", 403);
  const session = await getSession();
  const entry = ACCOUNT_TABLES.find(item => item.role === session?.role);
  if (!session || !entry) return fail("Sign in to continue", 401);
  const key = `credentials:${session.id}`;
  if (limitReached(key, 5, WINDOW)) return fail("Too many attempts. Try again in 15 minutes.", 429);
  const body = await request.json().catch(() => ({}));
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const email = typeof body.email === "string" ? body.email : undefined;
  const newPassword = typeof body.newPassword === "string" && body.newPassword ? body.newPassword : undefined;
  if (!currentPassword) return fail("Enter your current password.", 400);
  if (email === undefined && newPassword === undefined) return fail("Nothing to change.", 400);
  try {
    const account = await fetchRow(entry.table, session.id);
    if (!account) return fail("Sign in to continue", 401);
    if (!await checkAccountPassword(entry.table, account, currentPassword)) {
      recordFailure([key, WINDOW]);
      return fail("Current password is incorrect.", 403);
    }
    const patch = await preparePatch(entry.table, session.id, { ...(email !== undefined ? { email } : {}), ...(newPassword ? { password: newPassword } : {}) }, account);
    await supabaseAdminRequest("/rest/v1/rpc/lms_patch", { method: "POST", body: JSON.stringify({ p_table: entry.table, p_id: session.id, p_patch: patch, p_previous: {} }) });
    const response = NextResponse.json({ ok: true });
    if ("tokenVersion" in patch) {
      // Other sessions are revoked; this browser gets a cookie for the new version.
      forgetAccount(session.role, session.id);
      response.cookies.set(SESSION_COOKIE, createSessionToken(session, accountTokenVersion(patch)), sessionCookieOptions);
    }
    return response;
  } catch (error) {
    if (error instanceof HashBusy) return fail(error.message, 503);
    return error instanceof Denied ? fail(error.message, error.status) : fail(publicError(error, "Unable to update sign-in details"), 400);
  }
}
