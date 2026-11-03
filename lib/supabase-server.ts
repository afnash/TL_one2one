import https from "node:https";
// Server-only Supabase access. The secret key bypasses RLS, so it must never be
// exposed through a NEXT_PUBLIC_ variable; every caller checks the session first.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseServerConfigured = Boolean(url && key);
export const supabaseUrl = url;

export class SupabaseError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) { super(message); }
}

// Messages raised on purpose by our SQL functions (`raise exception`, SQLSTATE
// P0001) are safe to show; anything else is logged and replaced by `fallback`.
export function publicError(error: unknown, fallback: string) {
  if (error instanceof SupabaseError && error.code === "P0001") return error.message;
  console.error(error);
  return fallback;
}

// Node's global fetch (undici) inside the Next.js server can leave connections to
// Supabase hanging until the timeout, so requests go through node:https with their
// own keep-alive agent instead.
const agent = new https.Agent({ keepAlive: true, keepAliveMsecs: 10_000, maxSockets: 64, timeout: 60_000 });

type Raw = { status: number; text: string };
function send(target: string, method: string, headers: Record<string, string>, body: string | undefined, timeoutMs: number, signal?: AbortSignal | null): Promise<Raw> {
  return new Promise((resolve, reject) => {
    const request = https.request(target, { method, headers, agent }, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => resolve({ status: response.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") }));
      response.on("error", reject);
    });
    const fail = (error: Error) => { request.destroy(); reject(error); };
    request.setTimeout(timeoutMs, () => fail(Object.assign(new Error("The database request timed out"), { name: "TimeoutError" })));
    request.on("error", reject);
    signal?.addEventListener("abort", () => fail(Object.assign(new Error("Aborted"), { name: "AbortError" })), { once: true });
    if (body !== undefined) request.write(body);
    request.end();
  });
}

export async function supabaseAdminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!url || !key) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY, then run supabase/schema.sql in Supabase and restart the app.");
  const method = init.method || "GET";
  const body = typeof init.body === "string" ? init.body : undefined;
  const headers: Record<string, string> = {
    apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
    ...(body ? { "Content-Type": "application/json", "Content-Length": String(Buffer.byteLength(body)) } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  // Reads are safe to repeat, so a stalled one is retried once on a fresh socket.
  const idempotent = method === "GET";
  let response: Raw;
  try {
    response = await send(`${url}${path}`, method, headers, body, idempotent ? 10_000 : 20_000, init.signal);
  } catch (cause) {
    if (!idempotent || init.signal) throw cause;
    response = await send(`${url}${path}`, method, headers, body, 10_000);
  }
  if (response.status < 200 || response.status >= 300) {
    const error = (() => { try { return JSON.parse(response.text); } catch { return {}; } })();
    throw new SupabaseError(error.message || error.error || `Supabase request failed (${response.status})`, response.status, error.code);
  }
  return response.text ? JSON.parse(response.text) as T : undefined as T;
}
