// In-memory fixed-window limiter: state is per server process and lost on
// restart, so use a shared store (e.g. Redis) when running several instances.
const buckets = new Map<string, { count: number; reset: number }>();

function bucket(key: string, windowMs: number) {
  const now = Date.now();
  let current = buckets.get(key);
  if (!current || current.reset < now) {
    if (buckets.size > 10000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
    current = { count: 0, reset: now + windowMs };
    buckets.set(key, current);
  }
  return current;
}

// Counts this call, then reports whether the key is over its limit.
export function rateLimited(key: string, limit: number, windowMs: number) {
  return ++bucket(key, windowMs).count > limit;
}

// For failure-only limits: check with `limitReached`, record with `recordFailure`.
export const limitReached = (key: string, limit: number, windowMs: number) => bucket(key, windowMs).count >= limit;
export function recordFailure(...keys: [string, number][]) { for (const [key, windowMs] of keys) bucket(key, windowMs).count++; }

// Resets a key (e.g. after a successful sign-in).
export function clearLimit(key: string) { buckets.delete(key); }

// X-Forwarded-For is client-controlled except for the entries appended by our own
// proxies. Forwarding headers are therefore ignored unless TRUSTED_PROXY_HOPS (the
// number of proxies in front of the app that append to X-Forwarded-For, e.g. 1 for
// Vercel or a single nginx) is set. With no trusted proxy the client address is
// unknown (null) and callers must rely on per-account limits only.
export function clientIp(request: Request): string | null {
  const hops = Math.floor(Number(process.env.TRUSTED_PROXY_HOPS));
  if (!(hops >= 1)) return null;
  const chain = (request.headers.get("x-forwarded-for") || "").split(",").map(value => value.trim()).filter(Boolean);
  return chain[chain.length - hops] || request.headers.get("x-real-ip") || null;
}

// Per-IP rate limit that quietly does nothing when the IP cannot be trusted.
export function ipRateLimited(request: Request, scope: string, limit: number, windowMs: number) {
  const ip = clientIp(request);
  return ip !== null && rateLimited(`${scope}:${ip}`, limit, windowMs);
}
