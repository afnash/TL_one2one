import { NextResponse } from "next/server";
import { fetchRow } from "@/lib/data-access";
import { deriveSecret, getSession } from "@/lib/session";
import { publicError } from "@/lib/supabase-server";

type Context = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const ids = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && !!item) : []);

// WebRTC signaling goes over Supabase Realtime broadcast. Only participants of the
// session learn its channel name (an HMAC of the session id) and the peer IDs they
// should accept offers/answers from, plus a secret key per peer pair for message tags.
export async function GET(_request: Request, context: Context) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);
  const { id } = await context.params;
  try {
    const row = await fetchRow("lms_sessions", id);
    const hostId = typeof row?.teacherId === "string" ? row.teacherId : "";
    const students = row ? [...new Set([...(typeof row.studentId === "string" && row.studentId ? [row.studentId] : []), ...ids(row.studentIds)])] : [];
    if (!row || ![hostId, ...students].includes(session.id)) return fail("You are not part of this session", 403);
    // Pairwise keys: the host shares one key with each student and students share none with
    // each other, so signaling messages are authenticated per sender (see lib/webrtc.ts).
    // Each caller receives only the keys for pairs it belongs to.
    const talksTo = session.id === hostId ? students : [hostId];
    const keys = Object.fromEntries(talksTo.map(peer => [peer, deriveSecret(`webrtc-pair:${id}:${hostId}:${session.id === hostId ? peer : session.id}`)]));
    return NextResponse.json({ channel: `session_${deriveSecret(`webrtc:${id}`).slice(0, 32)}`, hostId, peers: [hostId, ...students], keys });
  } catch (error) {
    return fail(publicError(error, "Unable to join the session"), 502);
  }
}
