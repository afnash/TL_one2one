import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import type { UserRole } from "@/types";

const AREAS: Record<string, UserRole> = { admin: "SUPERADMIN", manager: "MANAGER", teacher: "TEACHER", student: "STUDENT" };
const SAFE_UPLOAD = /\.(pdf|docx?|png|jpe?g|mp4|txt)$/i;

// Server-side gate for role areas. Pages and API routes still check the
// session themselves; this stops other roles from loading the pages at all.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/uploads/")) {
    return SAFE_UPLOAD.test(pathname) ? NextResponse.next() : new NextResponse("Not found", { status: 404 });
  }
  const role = AREAS[pathname.split("/")[1]];
  if (!role) return NextResponse.next();
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (session?.role === role) return NextResponse.next();
  return NextResponse.redirect(new URL(role === "SUPERADMIN" ? "/manage" : "/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/teacher/:path*", "/student/:path*", "/uploads/:path*"],
};
