import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-session";
import { safeEqual } from "@/lib/passwords";
import { clientIp, limitReached, recordFailure } from "@/lib/rate-limit";
import { adminTokenVersion, createSessionToken, sameOrigin, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

const WINDOW = 15 * 60 * 1000;

export async function GET() { return NextResponse.json({ admin: await isAdmin() }); }

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  // There is a single admin account, so the global key is also the per-username limit
  // and holds even when an attacker rotates IPs or spoofs forwarding headers.
  const ip = clientIp(request);
  const keys: [string, number][] = [["admin:all", 30], ...(ip ? [[`admin:${ip}`, 10] as [string, number]] : [])];
  if (keys.some(([key, limit]) => limitReached(key, limit, WINDOW))) return NextResponse.json({ error: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429 });
  const username = process.env.ADMIN_USERNAME, password = process.env.ADMIN_PASSWORD;
  if (!username || !password || password.length < 12) return NextResponse.json({ error: "Admin sign-in is disabled. Set ADMIN_USERNAME and ADMIN_PASSWORD (12+ characters) in .env.local." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const validUser = safeEqual(String(body.username ?? ""), username);
  const validPassword = safeEqual(String(body.password ?? ""), password);
  if (!validUser || !validPassword) {
    recordFailure(...keys.map(([key]) => [key, WINDOW] as [string, number]));
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }
  try {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, createSessionToken({ role: "SUPERADMIN", id: "admin-1" }, adminTokenVersion()), sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Admin sign-in failed:", error);
    return NextResponse.json({ error: "Sign-in failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete("lms_admin");
  return response;
}
