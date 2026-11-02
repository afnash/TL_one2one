import { randomBytes, scrypt, timingSafeEqual, createHash, type ScryptOptions } from "node:crypto";

const rawScrypt = (password: string, salt: Buffer, length: number, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scrypt(password, salt, length, options, (error, key) => error ? reject(error) : resolve(key)));

// Each current-cost hash needs 128 MiB and a libuv thread, so concurrent hashing is
// capped (HASH_CONCURRENCY, default 2) with a short wait queue (HASH_QUEUE, default 8).
// Beyond that callers get HashBusy instead of exhausting memory.
export class HashBusy extends Error {
  constructor() { super("The server is busy. Please try again in a moment."); }
}
const MAX_ACTIVE = Math.max(1, Number(process.env.HASH_CONCURRENCY) || 2);
const MAX_WAITING = Math.max(0, Number(process.env.HASH_QUEUE) || 8);
let active = 0;
const waiting: (() => void)[] = [];
async function scryptAsync(password: string, salt: Buffer, length: number, options: ScryptOptions) {
  if (active >= MAX_ACTIVE) {
    if (waiting.length >= MAX_WAITING) throw new HashBusy();
    await new Promise<void>(resolve => waiting.push(resolve));
  } else active++;
  try {
    return await rawScrypt(password, salt, length, options);
  } finally {
    const next = waiting.shift();
    if (next) next(); // hand the slot straight to the next waiter
    else active--;
  }
}

// N=2^17, r=8 needs 128 MiB per hash (128*N*r bytes), above Node's 32 MiB default maxmem.
const COST = { log2N: 17, r: 8, p: 1 };
const LEGACY = { log2N: 14, r: 8, p: 1 };
const options = ({ log2N, r, p }: typeof COST): ScryptOptions => ({ N: 2 ** log2N, r, p, maxmem: 256 * 1024 * 1024 });

// Stored as "scrypt$n=17,r=8,p=1$<salt>$<hash>" (base64url). Hashes from before
// the cost upgrade ("scrypt$<salt>$<hash>") used Node's defaults and still verify.
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64, options(COST));
  return `scrypt$n=${COST.log2N},r=${COST.r},p=${COST.p}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

function parse(stored: string) {
  const parts = stored.split("$");
  if (parts[0] !== "scrypt") return null;
  if (parts.length === 3) return { cost: LEGACY, salt: parts[1], hash: parts[2] };
  const match = parts.length === 4 && /^n=(\d+),r=(\d+),p=(\d+)$/.exec(parts[1]);
  if (!match) return null;
  const cost = { log2N: Number(match[1]), r: Number(match[2]), p: Number(match[3]) };
  if (cost.log2N < 10 || cost.log2N > 17 || cost.r < 1 || cost.r > 16 || cost.p < 1 || cost.p > 4) return null;
  return { cost, salt: parts[2], hash: parts[3] };
}

export async function verifyPassword(password: string, stored: string) {
  const parsed = parse(stored);
  if (!parsed || !parsed.salt || !parsed.hash) return false;
  const expected = Buffer.from(parsed.hash, "base64url");
  if (!expected.length) return false;
  const actual = await scryptAsync(password, Buffer.from(parsed.salt, "base64url"), expected.length, options(parsed.cost));
  return timingSafeEqual(actual, expected);
}

export const needsRehash = (stored: string) => parse(stored)?.cost.log2N !== COST.log2N;

// Spends the same time as a real check so unknown emails are not distinguishable by timing.
const DUMMY = { salt: randomBytes(16), length: 64 };
export async function dummyVerify(password: string) {
  await scryptAsync(password, DUMMY.salt, DUMMY.length, options(COST));
  return false;
}

// Constant-time comparison for values of any length (env admin password, legacy plaintext).
export function safeEqual(a: string, b: string) {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}
