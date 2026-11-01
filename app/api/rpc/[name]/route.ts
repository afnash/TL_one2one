import { NextResponse } from "next/server";
import { loadScope, materialVisible, sanitize, type Row } from "@/lib/data-access";
import { rateLimited } from "@/lib/rate-limit";
import { getSession, sameOrigin } from "@/lib/session";
import { publicError, SupabaseError, supabaseAdminRequest } from "@/lib/supabase-server";

type Context = { params: Promise<{ name: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const RPCS = ["search_materials", "conference_create", "conference_read", "conference_update"];

export async function POST(request: Request, context: Context) {
  const { name } = await context.params;
  if (!RPCS.includes(name)) return fail("Unknown function", 404);
  if (!sameOrigin(request)) return fail("Invalid origin", 403);
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);
  // Search is the expensive call; conference RPCs are polled by the UI so they get a higher cap.
  const limit = name === "search_materials" ? 60 : name === "conference_create" ? 20 : 600;
  if (rateLimited(`rpc:${name}:${session.id}`, limit, 60 * 1000)) return fail("Too many requests. Slow down and retry shortly.", 429);
  const parameters = await request.json().catch(() => null);
  if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) return fail("Invalid request", 400);

  if (name === "conference_create") {
    if (session.role !== "TEACHER") return fail("Only teachers can host a conference", 403);
    // Host identity comes from the session, never from the request body.
    parameters.p_teacher_id = session.id;
  }
  if (name === "search_materials" && (typeof parameters.p_query !== "string" || parameters.p_query.length > 200)) return fail("Invalid search", 400);
  try {
    const result = await supabaseAdminRequest<unknown>(`/rest/v1/rpc/${name}`, { method: "POST", body: JSON.stringify(parameters) });
    if (name !== "search_materials") return NextResponse.json(result);
    // Search runs over all materials; return only what this user may read.
    const scope = await loadScope(session);
    return NextResponse.json(Array.isArray(result) ? (result as Row[]).filter(row => materialVisible(scope, row)).map(sanitize) : []);
  } catch (error) {
    if (error instanceof SupabaseError && ["PGRST202", "42883", "42P01"].includes(error.code || "")) return fail("Database setup is pending", 503);
    return fail(publicError(error, "Request failed"), 400);
  }
}
