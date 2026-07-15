import { Hono } from "hono";
import type { Context, Next } from "hono";
import { and, eq, isNull, sql } from "drizzle-orm";
import {
  artistProfiles,
  betaAccessCodes,
  betaInviteSessions,
  betaMembers,
  createDb,
} from "@mirae/db";
import { type AuthEnv } from "../auth.ts";
import { getUserId } from "../lib/session.ts";
import { audit, log } from "../lib/log.ts";
import { rateLimit } from "../lib/rate-limit.ts";
import {
  INVITE_COOKIE,
  INVITE_TTL_MS,
  clearInviteCookie,
  closedBetaEnabled,
  hashCode,
  inviteCookie,
  readCookie,
  readInvite,
  signInvite,
} from "../lib/beta.ts";

type Db = ReturnType<typeof createDb>;

export const betaRoutes = new Hono<{ Bindings: AuthEnv }>();

const secure = (c: Context) => new URL(c.req.url).protocol === "https:";

async function hasBetaMembership(db: Db, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: betaMembers.id })
    .from(betaMembers)
    .where(and(eq(betaMembers.userId, userId), isNull(betaMembers.revokedAt)))
    .limit(1);
  return !!row;
}

// Atomically claim one use of a code and grant membership. Returns true on
// success. The conditional UPDATE is the concurrency guard — two racing calls
// can't both push uses past maxUses.
async function grantMembership(
  db: Db,
  userId: string,
  accessCodeId: string,
): Promise<boolean> {
  if (await hasBetaMembership(db, userId)) return true; // idempotent
  const claimed = await db
    .update(betaAccessCodes)
    .set({ uses: sql`${betaAccessCodes.uses} + 1`, lastUsedAt: new Date() })
    .where(
      and(
        eq(betaAccessCodes.id, accessCodeId),
        isNull(betaAccessCodes.revokedAt),
        sql`${betaAccessCodes.uses} < ${betaAccessCodes.maxUses}`,
        sql`(${betaAccessCodes.expiresAt} IS NULL OR ${betaAccessCodes.expiresAt} > now())`,
      ),
    )
    .returning({ id: betaAccessCodes.id });
  if (claimed.length === 0) return false;
  await db
    .insert(betaMembers)
    .values({ userId, accessCodeId })
    .onConflictDoNothing();
  return true;
}

// Look up a currently-usable code by its hash (not revoked/expired/exhausted).
async function usableCode(db: Db, codeHash: string) {
  const [row] = await db
    .select()
    .from(betaAccessCodes)
    .where(eq(betaAccessCodes.codeHash, codeHash))
    .limit(1);
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) return null;
  if (row.uses >= row.maxUses) return null;
  return row;
}

async function ipHash(c: Context): Promise<string | null> {
  const ip = c.req.header("cf-connecting-ip");
  if (!ip) return null;
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(ip),
  );
  return [...new Uint8Array(buf)]
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// POST /api/beta/verify — validate a code. Logged-out → create a pending
// invite (cookie). Logged-in → redeem directly. Never reveals code metadata.
betaRoutes.post("/verify", rateLimit(), async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { code?: unknown };
  const raw = String(body.code ?? "");
  if (!raw.trim()) return c.json({ error: "Invalid invitation code." }, 400);

  const db = createDb(c.env.DATABASE_URL);
  const code = await usableCode(db, await hashCode(raw, c.env));
  if (!code) return c.json({ error: "Invalid invitation code." }, 400);

  const userId = await getUserId(c);
  if (userId) {
    const ok = await grantMembership(db, userId, code.id);
    if (!ok) return c.json({ error: "Invalid invitation code." }, 400);
    audit("beta_redeemed", { userId, direct: true });
    const [profile] = await db
      .select({ id: artistProfiles.id })
      .from(artistProfiles)
      .where(eq(artistProfiles.userId, userId))
      .limit(1);
    return c.json({ ok: true, next: profile ? "app" : "onboarding" });
  }

  // Logged out: reserve a short-lived pending invite bound to a signed cookie.
  const [session] = await db
    .insert(betaInviteSessions)
    .values({
      accessCodeId: code.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      ipHash: await ipHash(c),
    })
    .returning({ id: betaInviteSessions.id });
  c.header(
    "set-cookie",
    inviteCookie(await signInvite(session.id, c.env), secure(c)),
  );
  return c.json({ ok: true, next: "signup" });
});

// Read + validate the pending-invite cookie → the unconsumed session row.
async function pendingInvite(c: Context, db: Db) {
  const raw = readCookie(c.req.header("cookie"), INVITE_COOKIE);
  const id = await readInvite(raw, c.env);
  if (!id) return null;
  const [session] = await db
    .select()
    .from(betaInviteSessions)
    .where(eq(betaInviteSessions.id, id))
    .limit(1);
  if (!session || session.consumedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;
  return session;
}

// POST /api/beta/redeem — authenticated; consumes the pending invite created
// before signup and grants membership. Idempotent for existing members.
betaRoutes.post("/redeem", rateLimit(), async (c) => {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  const db = createDb(c.env.DATABASE_URL);

  if (await hasBetaMembership(db, userId))
    return c.json({ ok: true, next: "onboarding" });

  const session = await pendingInvite(c, db);
  if (!session) return c.json({ error: "No valid invitation." }, 400);

  const ok = await grantMembership(db, userId, session.accessCodeId);
  if (!ok) return c.json({ error: "No valid invitation." }, 400);
  await db
    .update(betaInviteSessions)
    .set({ consumedAt: new Date() })
    .where(eq(betaInviteSessions.id, session.id));
  c.header("set-cookie", clearInviteCookie(secure(c)));
  audit("beta_redeemed", { userId, direct: false });

  const [profile] = await db
    .select({ id: artistProfiles.id })
    .from(artistProfiles)
    .where(eq(artistProfiles.userId, userId))
    .limit(1);
  return c.json({ ok: true, next: profile ? "app" : "onboarding" });
});

// GET /api/beta/status — drives the frontend guards. No code metadata.
betaRoutes.get("/status", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const userId = await getUserId(c);
  const gate = closedBetaEnabled(c.env);
  if (!userId) {
    const pending = !!(await pendingInvite(c, db));
    return c.json({
      authenticated: false,
      hasBetaAccess: false,
      pendingInvite: pending,
      closedBeta: gate,
    });
  }
  const hasBetaAccess = !gate || (await hasBetaMembership(db, userId));
  const [profile] = await db
    .select({ id: artistProfiles.id })
    .from(artistProfiles)
    .where(eq(artistProfiles.userId, userId))
    .limit(1);
  return c.json({
    authenticated: true,
    hasBetaAccess,
    needsOnboarding: hasBetaAccess && !profile,
    closedBeta: gate,
  });
});

// Middleware for private artist API groups: when the gate is on, an
// authenticated user without beta membership gets 403. No session → falls
// through so the handler's own 401 applies. Never gates public/token routes.
export async function betaGate(c: Context, next: Next) {
  if (!closedBetaEnabled(c.env as AuthEnv)) return next();
  const userId = await getUserId(c);
  if (!userId) return next();
  const db = createDb((c.env as AuthEnv).DATABASE_URL);
  if (!(await hasBetaMembership(db, userId)))
    return c.json({ error: "Beta access required." }, 403);
  return next();
}

// Server-side signup guard: block Better Auth account creation unless a valid
// pending invite exists (when the gate is on). Prevents DB flooding by bots.
export async function signupAllowed(c: Context): Promise<boolean> {
  if (!closedBetaEnabled(c.env as AuthEnv)) return true;
  try {
    const db = createDb((c.env as AuthEnv).DATABASE_URL);
    // An already-authenticated user re-signing is not the flood vector.
    if (await getUserId(c)) return true;
    return !!(await pendingInvite(c, db));
  } catch (err) {
    log("error", "beta_signup_guard_failed", { error: String(err) });
    return false;
  }
}
