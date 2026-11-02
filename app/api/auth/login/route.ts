import { NextResponse } from "next/server";
import { checkAccountPassword, findAccountsByEmail, normalizeEmail } from "@/lib/data-access";
import { dummyVerify, HashBusy } from "@/lib/passwords";
import { clearLimit, clientIp, rateLimited } from "@/lib/rate-limit";
import { accountTokenVersion, createSessionToken, sameOrigin, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { supabaseAdminRequest } from "@/lib/supabase-server";

const REDIRECTS = { MANAGER: "/manager/dashboard", TEACHER: "/teacher/dashboard", STUDENT: "/student/dashboard" } as const;
const WINDOW = 15 * 60 * 1000;
const INVALID = "Invalid email or password. Please verify your credentials.";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "Please provide both email and password." }, { status: 400 });
  if (email.length > 254 || password.length > 256) return NextResponse.json({ error: INVALID }, { status: 401 });
  // Attempts are counted BEFORE any hashing, so a flood cannot burn CPU/memory first.
  // Per account (any IP, stops distributed guessing), per account+IP, and per IP (spraying).
  // The IP is only known when TRUSTED_PROXY_HOPS is configured; otherwise forwarding
  // headers are ignored and only the per-account limit applies.
  const ip = clientIp(request);
  const keys: [string, number][] = [[`login-acct:${email}`, 20]];
  if (ip) keys.push([`login:${email}:${ip}`, 10], [`login-ip:${ip}`, 60]);
  if (keys.some(([key, limit]) => rateLimited(key, limit, WINDOW))) {
    return NextResponse.json({ error: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429 });
  }

  try {
    const matches = await findAccountsByEmail(email);
    if (!matches.length) await dummyVerify(password);
    for (const { table, role, account } of matches) {
      if (!await checkAccountPassword(table, account, password)) continue;
      if (account.status === "inactive") return NextResponse.json({ error: "This account is inactive. Contact your administrator." }, { status: 403 });
      await supabaseAdminRequest("/rest/v1/lms_profiles?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ id: account.id, data: { id: account.id, role, name: account.name, lastLoginAt: new Date().toISOString() } }) });
      for (const [key] of keys.slice(0, 2)) clearLimit(key); // a successful sign-in resets the account counters
      const response = NextResponse.json({ role, id: account.id, redirect: REDIRECTS[role] });
      response.cookies.set(SESSION_COOKIE, createSessionToken({ role, id: account.id }, accountTokenVersion(account)), sessionCookieOptions);
      return response;
    }
  } catch (error) {
    if (error instanceof HashBusy) return NextResponse.json({ error: error.message }, { status: 503, headers: { "Retry-After": "5" } });
    console.error("Sign-in failed:", error);
    return NextResponse.json({ error: "Sign-in failed. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ error: INVALID }, { status: 401 });
}
