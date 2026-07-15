// Closed-beta gate primitives: invite-code hashing/generation, the signed
// pending-invite cookie, and the enabled flag. DB flows live in routes/beta.ts.
// Only a salted hash of a code is ever stored; plaintext is shown once.

import type { AuthEnv } from "../auth.ts";

export const INVITE_COOKIE = "mirae_beta_invite";
export const INVITE_TTL_MS = 30 * 60 * 1000; // 30 min

// Gate is ON unless explicitly disabled — a pre-launch product should fail
// closed, not open.
export function closedBetaEnabled(env: AuthEnv): boolean {
  return env.CLOSED_BETA_ENABLED !== "false";
}

// Uppercase, strip everything but A–Z/0–9 (dashes/spaces/case don't matter).
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// SHA-256 over the normalized code + server pepper. Deterministic → used as the
// unique lookup key. Pepper must be set in production.
export async function hashCode(code: string, env: AuthEnv): Promise<string> {
  const pepper = env.BETA_CODE_PEPPER ?? "";
  const data = new TextEncoder().encode(`${normalizeCode(code)}:${pepper}`);
  return toHex(await crypto.subtle.digest("SHA-256", data));
}

// Human-friendly, high-entropy code: MIRAE-XXXX-XXXX-XXXX using an unambiguous
// alphabet (no 0/O/1/I). 12 chars × ~5 bits ≈ 60 bits.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateCode(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]);
  const g = (i: number) => chars.slice(i, i + 4).join("");
  return `MIRAE-${g(0)}-${g(4)}-${g(8)}`;
}

// --- Signed pending-invite cookie (holds only the invite-session id) ---------

async function hmac(value: string, env: AuthEnv): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.BETTER_AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return toHex(sig);
}

export async function signInvite(
  sessionId: string,
  env: AuthEnv,
): Promise<string> {
  return `${sessionId}.${await hmac(sessionId, env)}`;
}

// Constant-ish-time verify → returns the session id or null.
export async function readInvite(
  cookieValue: string | undefined,
  env: AuthEnv,
): Promise<string | null> {
  if (!cookieValue) return null;
  const dot = cookieValue.lastIndexOf(".");
  if (dot < 0) return null;
  const id = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  return (await hmac(id, env)) === sig ? id : null;
}

export function inviteCookie(value: string, secure: boolean): string {
  const attrs = [
    `${INVITE_COOKIE}=${value}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${Math.floor(INVITE_TTL_MS / 1000)}`,
  ];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

export function clearInviteCookie(secure: boolean): string {
  const attrs = [
    `${INVITE_COOKIE}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

// Parse a single cookie value out of a Cookie header.
export function readCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq) === name) return part.slice(eq + 1);
  }
  return undefined;
}
