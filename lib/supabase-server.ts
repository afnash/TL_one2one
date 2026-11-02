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

export async function supabaseAdminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!url || !key) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY, then run supabase/schema.sql in Supabase and restart the app.");
  const send = (timeoutMs: number) => fetch(`${url}${path}`, {
    ...init, cache: "no-store", signal: init.signal || AbortSignal.timeout(timeoutMs),
    headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
      ...(init.body && typeof init.body === "string" ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  // Reads are safe to repeat: a pooled connection that went stale hangs until the
  // timeout, so retry once on a fresh socket instead of making the page wait 20s.
  const idempotent = !init.method || init.method === "GET";
  let response: Response;
  try {
    response = await send(idempotent ? 10000 : 20000);
  } catch (cause) {
    if (!idempotent || init.signal) throw cause;
    response = await send(10000);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new SupabaseError(error.message || error.error || `Supabase request failed (${response.status})`, response.status, error.code);
  }
  const body = await response.text();
  return body ? JSON.parse(body) as T : undefined as T;
}
