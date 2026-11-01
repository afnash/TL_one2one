import { NextResponse } from "next/server";
import { getSession, sameOrigin, SESSION_COOKIE } from "@/lib/session";

export async function GET() { return NextResponse.json({ session: await getSession() }); }

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete("lms_admin");
  return response;
}
