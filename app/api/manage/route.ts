import { NextResponse } from "next/server";
import { createAdminToken, isAdmin } from "@/lib/admin-session";
export async function GET() { return NextResponse.json({ admin: await isAdmin() }); }
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const body = await request.json();
  if (body.username !== "admin" || body.password !== "admin123") return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("lms_admin", createAdminToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", maxAge: 28800, path: "/" });
  return response;
}
export async function DELETE() { const response = NextResponse.json({ ok: true }); response.cookies.delete("lms_admin"); return response; }
