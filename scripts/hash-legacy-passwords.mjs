// One-time migration: replaces legacy plaintext `password` values with scrypt hashes
// (same format as lib/passwords.ts) and bumps tokenVersion so old sessions are revoked.
// Usage: node --env-file=.env.local scripts/hash-legacy-passwords.mjs
import { randomBytes, scrypt } from "node:crypto";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (use --env-file=.env.local).");
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const hash = password => new Promise((resolve, reject) => {
  const salt = randomBytes(16);
  scrypt(password, salt, 64, { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }, (error, derived) =>
    error ? reject(error) : resolve(`scrypt$n=17,r=8,p=1$${salt.toString("base64url")}$${derived.toString("base64url")}`));
});

let migrated = 0;
for (const table of ["lms_managers", "lms_teachers", "lms_students"]) {
  const response = await fetch(`${url}/rest/v1/${table}?select=id,data&data->>password=not.is.null`, { headers });
  if (!response.ok) throw new Error(`${table}: ${response.status} ${await response.text()}`);
  for (const { id, data } of await response.json()) {
    if (typeof data.password !== "string" || !data.password) continue;
    const patch = { password: null, tokenVersion: (Number(data.tokenVersion) || 0) + 1 };
    if (!data.passwordHash) patch.passwordHash = await hash(data.password);
    const result = await fetch(`${url}/rest/v1/rpc/lms_patch`, { method: "POST", headers, body: JSON.stringify({ p_table: table, p_id: id, p_patch: patch, p_previous: {} }) });
    if (!result.ok) throw new Error(`${table}/${id}: ${result.status} ${await result.text()}`);
    migrated++;
  }
}
console.log(`Migrated ${migrated} account(s).`);
