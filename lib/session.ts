import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { UserRole } from "@/types";
import { supabaseAdminRequest } from "./supabase-server";

// Signed, httpOnly session cookie. The browser can read its role only through
// /api/auth/session, so editing localStorage no longer grants access.
export const SESSION_COOKIE = "lms_session";
const MAX_AGE_SECONDS = 8 * 60 * 60;

export interface SessionIdentity { role: UserRole; id: string; }
// `tv` is the account's tokenVersion when the cookie was issued; bumping it on the
// record (password reset, deactivation) revokes every cookie issued before.
interface SessionPayload extends SessionIdentity { exp: number; tv?: string; }

const ROLES: UserRole[] = ["SUPERADMIN", "MANAGER", "TEACHER", "STUDENT"];
const ACCOUNT_TABLE: Partial<Record<UserRole, string>> = { MANAGER: "lms_managers", TEACHER: "lms_teachers", STUDENT: "lms_students" };

function secret() {
  const value = process.env.SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Set SESSION_SECRET (at least 32 characters) in .env.local");
  return value;
}

const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");
// Purpose-bound keys derived from the session secret (e.g. signaling channel names).
export const deriveSecret = (label: string) => createHmac("sha256", secret()).update(`derive:${label}`).digest("base64url");

// The admin has no database record: changing ADMIN_USERNAME/ADMIN_PASSWORD revokes its cookies.
export const adminTokenVersion = () => createHash("sha256").update(`${process.env.ADMIN_USERNAME}\n${process.env.ADMIN_PASSWORD}`).digest("base64url").slice(0, 16);
export const accountTokenVersion = (row: Record<string, unknown>) => String(Number(row.tokenVersion) || 0);

export function createSessionToken(identity: SessionIdentity, tokenVersion: string) {
  const payload: SessionPayload = { ...identity, exp: Date.now() + MAX_AGE_SECONDS * 1000, tv: tokenVersion };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function readToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  let expected: string;
  try { expected = sign(body); } catch { return null; }
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!ROLES.includes(payload.role) || typeof payload.id !== "string" || !payload.id || payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// Signature and expiry only (used by proxy.ts for page gating). API routes use getSession.
export function verifySessionToken(token: string | undefined): SessionIdentity | null {
  const payload = readToken(token);
  return payload ? { role: payload.role, id: payload.id } : null;
}

// Account state is re-read at most every few seconds per account: the client polls
// many endpoints, so this bounds the extra database reads while keeping revocation
// (password reset, deactivation, deletion) effective within ACCOUNT_CACHE_MS.
const ACCOUNT_CACHE_MS = 5000;
const accountCache = new Map<string, { valid: boolean; expires: number }>();

async function accountValid(payload: SessionPayload) {
  const table = ACCOUNT_TABLE[payload.role];
  if (!table) return payload.tv === adminTokenVersion();
  const key = `${payload.role}:${payload.id}:${payload.tv}`;
  const cached = accountCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.valid;
  const rows = await supabaseAdminRequest<{ data: { status?: string; tokenVersion?: unknown } }[]>(`/rest/v1/${table}?select=data&id=eq.${encodeURIComponent(payload.id)}`);
  const account = rows[0]?.data;
  const valid = Boolean(account && account.status !== "inactive" && accountTokenVersion(account) === payload.tv);
  if (accountCache.size > 5000) accountCache.clear();
  accountCache.set(key, { valid, expires: Date.now() + ACCOUNT_CACHE_MS });
  return valid;
}

export function forgetAccount(role: UserRole, id: string) {
  for (const key of accountCache.keys()) if (key.startsWith(`${role}:${id}:`)) accountCache.delete(key);
}

export async function getSession(): Promise<SessionIdentity | null> {
  const payload = readToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  try {
    return await accountValid(payload) ? { role: payload.role, id: payload.id } : null;
  } catch (error) {
    console.error("Session check failed:", error);
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", maxAge: MAX_AGE_SECONDS, path: "/",
};

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
