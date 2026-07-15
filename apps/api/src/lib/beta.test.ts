import { describe, expect, it } from "vitest";
import type { AuthEnv } from "../auth.ts";
import {
  INVITE_COOKIE,
  clearInviteCookie,
  closedBetaEnabled,
  generateCode,
  hashCode,
  inviteCookie,
  normalizeCode,
  readCookie,
  readInvite,
  signInvite,
} from "./beta.ts";

const env = (over: Partial<AuthEnv> = {}) =>
  ({
    DATABASE_URL: "x",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost",
    BETA_CODE_PEPPER: "pepper",
    ...over,
  }) as AuthEnv;

describe("closedBetaEnabled", () => {
  it("is ON by default (fail closed) and when unset/empty", () => {
    expect(closedBetaEnabled(env({ CLOSED_BETA_ENABLED: undefined }))).toBe(
      true,
    );
    expect(closedBetaEnabled(env({ CLOSED_BETA_ENABLED: "" }))).toBe(true);
    expect(closedBetaEnabled(env({ CLOSED_BETA_ENABLED: "true" }))).toBe(true);
  });

  it("is OFF only for the exact string 'false'", () => {
    expect(closedBetaEnabled(env({ CLOSED_BETA_ENABLED: "false" }))).toBe(
      false,
    );
    expect(closedBetaEnabled(env({ CLOSED_BETA_ENABLED: "FALSE" }))).toBe(true);
    expect(closedBetaEnabled(env({ CLOSED_BETA_ENABLED: "0" }))).toBe(true);
  });
});

describe("normalizeCode", () => {
  it("uppercases and strips dashes/spaces/punctuation", () => {
    expect(normalizeCode("mirae-abcd-efgh-jklm")).toBe("MIRAEABCDEFGHJKLM");
    expect(normalizeCode("  MIRAE ABCD ")).toBe("MIRAEABCD");
  });
});

describe("hashCode", () => {
  it("is deterministic for the same normalized code + pepper", async () => {
    const a = await hashCode("mirae-abcd-efgh-jklm", env());
    const b = await hashCode("MIRAE ABCD EFGH JKLM", env());
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes when the pepper changes (peppered)", async () => {
    const a = await hashCode("MIRAE-ABCD", env({ BETA_CODE_PEPPER: "p1" }));
    const b = await hashCode("MIRAE-ABCD", env({ BETA_CODE_PEPPER: "p2" }));
    expect(a).not.toBe(b);
  });

  it("differs across different codes", async () => {
    const a = await hashCode("MIRAE-AAAA", env());
    const b = await hashCode("MIRAE-BBBB", env());
    expect(a).not.toBe(b);
  });
});

describe("generateCode", () => {
  it("matches MIRAE-XXXX-XXXX-XXXX with an unambiguous alphabet", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateCode()).toMatch(
        /^MIRAE-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/,
      );
    }
  });

  it("does not collide across many draws", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(generateCode());
    expect(seen.size).toBe(1000);
  });
});

describe("signed invite cookie", () => {
  it("round-trips the session id", async () => {
    const signed = await signInvite("sess-123", env());
    expect(await readInvite(signed, env())).toBe("sess-123");
  });

  it("rejects a tampered payload", async () => {
    const signed = await signInvite("sess-123", env());
    const tampered = signed.replace("sess-123", "sess-999");
    expect(await readInvite(tampered, env())).toBeNull();
  });

  it("rejects a tampered signature", async () => {
    const signed = await signInvite("sess-123", env());
    expect(await readInvite(`${signed}00`, env())).toBeNull();
  });

  it("rejects a value signed with a different secret", async () => {
    const signed = await signInvite(
      "sess-123",
      env({ BETTER_AUTH_SECRET: "a" }),
    );
    expect(
      await readInvite(signed, env({ BETTER_AUTH_SECRET: "b" })),
    ).toBeNull();
  });

  it("rejects malformed values", async () => {
    expect(await readInvite(undefined, env())).toBeNull();
    expect(await readInvite("no-dot", env())).toBeNull();
  });
});

describe("cookie helpers", () => {
  it("sets HttpOnly + SameSite=Lax, and Secure only over https", () => {
    const c = inviteCookie("v", true);
    expect(c).toContain(`${INVITE_COOKIE}=v`);
    expect(c).toContain("HttpOnly");
    expect(c).toContain("SameSite=Lax");
    expect(c).toContain("Secure");
    expect(inviteCookie("v", false)).not.toContain("Secure");
  });

  it("clears with Max-Age=0", () => {
    expect(clearInviteCookie(false)).toContain("Max-Age=0");
  });

  it("reads a single cookie out of a Cookie header", () => {
    const header = `other=1; ${INVITE_COOKIE}=abc.def; last=2`;
    expect(readCookie(header, INVITE_COOKIE)).toBe("abc.def");
    expect(readCookie(undefined, INVITE_COOKIE)).toBeUndefined();
    expect(readCookie("nope=1", INVITE_COOKIE)).toBeUndefined();
  });
});
