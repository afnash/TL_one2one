// Browser data access goes through this app's /api routes, which check the
// signed session and talk to Supabase with a server-only key.
export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init, cache: "no-store", credentials: "same-origin", signal: init.signal || AbortSignal.timeout(20000),
      headers: { ...(init.body && typeof init.body === "string" ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch (cause) {
    if (cause instanceof Error && cause.name === "AbortError" && init.signal?.aborted) throw cause;
    if (cause instanceof Error && cause.name === "TimeoutError") throw new Error("The server took too long to respond. Check your connection and try again.");
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `Request failed (${response.status})`);
  }
  const body = await response.text();
  return body ? JSON.parse(body) as T : undefined as T;
}

export async function uploadMaterial(file: File): Promise<string> {
  if (file.size > 50 * 1024 * 1024) throw new Error("Maximum file size is 50 MB.");
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiRequest<{ url: string }>("/api/upload", { method: "POST", body: formData, signal: AbortSignal.timeout(120000) });
  return data.url;
}

// Only same-site paths, http(s) links and inert data: files (older uploads) are
// rendered; javascript:, HTML/SVG data: URLs and other schemes become "".
export function safeResourceUrl(value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (/^data:(application\/pdf|image\/(png|jpeg|gif|webp)|video\/mp4|text\/plain)[;,]/i.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}
