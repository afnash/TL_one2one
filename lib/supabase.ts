// Supabase's HTTP APIs keep this integration independent of an SDK version.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && key);

export async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!url || !key) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then run dumb.sql in Supabase and restart the app.");
  const response = await fetch(`${url}${path}`, {
    ...init, cache: "no-store", signal: init.signal || AbortSignal.timeout(20000),
    headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
      ...(init.body && typeof init.body === "string" ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || `Supabase request failed (${response.status})`);
  }
  const body = await response.text();
  return body ? JSON.parse(body) as T : undefined as T;
}

export async function uploadMaterial(file: File) {
  if (file.size > 50 * 1024 * 1024) throw new Error("Maximum file size is 50 MB.");
  const path = `${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await supabaseRequest(`/storage/v1/object/study-materials/${path}`, {
    method: "POST", body: file, headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  return `${url}/storage/v1/object/public/study-materials/${path}`;
}

export function safeResourceUrl(value: string) {
  const parsed = new URL(value);
  if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("Use an HTTP or HTTPS resource link.");
  return parsed.href;
}
