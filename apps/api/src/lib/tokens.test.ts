import { describe, expect, it } from "vitest";
import { newToken } from "./tokens.ts";

describe("newToken", () => {
  it("is URL-safe (no +, /, or = padding)", () => {
    for (let i = 0; i < 50; i++) {
      expect(newToken()).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("is long enough to be unguessable (32 bytes → 43 base64url chars)", () => {
    expect(newToken().length).toBeGreaterThanOrEqual(43);
  });

  it("does not collide across many draws", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(newToken());
    expect(seen.size).toBe(1000);
  });
});
