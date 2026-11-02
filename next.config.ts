import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";
const jitsi = `https://${process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si"}`;
const supabase = (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin; } catch { return ""; } })();

// Inline scripts stay allowed because Next.js injects them without nonces here; the
// policy still blocks plugins, foreign base URLs, framing by other sites and
// connections to hosts other than this app and Supabase (REST, Storage, Realtime wss).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${jitsi}${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${supabase ? ` ${supabase} ${supabase.replace(/^http/, "ws")}` : ""}${dev ? " ws:" : ""}`,
  // Video embeds (YouTube/Vimeo/teacher-supplied https links), Jitsi and the Google Docs viewer.
  "frame-src 'self' https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const security = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: `camera=(self "${jitsi}"), microphone=(self "${jitsi}"), display-capture=(self "${jitsi}"), geolocation=(), payment=()` },
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: security },
      {
        // Uploaded files are user content: never let the browser sniff them into HTML.
        source: "/uploads/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },
};

export default nextConfig;
