import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
const secret = () => { const value = process.env.ADMIN_SESSION_SECRET; if (!value) throw new Error("Set ADMIN_SESSION_SECRET in .env.local"); return value; };
export function createAdminToken() { const expires = String(Date.now() + 8 * 60 * 60 * 1000); return expires + "." + createHmac("sha256", secret()).update(expires).digest("hex"); }
export async function isAdmin() { const token = (await cookies()).get("lms_admin")?.value; if (!token) return false; const [expires, signature] = token.split("."); if (!expires || !signature || Number(expires) < Date.now()) return false; const expected = createHmac("sha256", secret()).update(expires).digest("hex"); return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); }
