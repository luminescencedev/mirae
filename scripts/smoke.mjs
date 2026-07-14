#!/usr/bin/env node
// Post-deploy smoke test (TRUST-018). Hits the health endpoints + a public
// page and fails fast if anything is down. Run after `wrangler deploy`:
//   node scripts/smoke.mjs               # defaults to https://usemirae.com
//   BASE_URL=https://app.usemirae.com node scripts/smoke.mjs

const BASE = (process.env.BASE_URL ?? "https://usemirae.com").replace(/\/$/, "");

const checks = [
  { path: "/health", expect: (r, body) => r.ok && body.includes("ok") },
  { path: "/api/health", expect: (r, body) => r.ok && body.includes("ok") },
  { path: "/robots.txt", expect: (r) => r.ok },
];

let failed = 0;
for (const check of checks) {
  const url = `${BASE}${check.path}`;
  try {
    const res = await globalThis.fetch(url, { redirect: "manual" });
    const body = await res.text();
    const ok = check.expect(res, body);
    console.log(`${ok ? "✓" : "✗"} ${check.path} → ${res.status}`);
    if (!ok) failed++;
  } catch (err) {
    console.log(`✗ ${check.path} → ${err.message}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\nSmoke test FAILED (${failed} check(s)).`);
  process.exit(1);
}
console.log("\nSmoke test passed.");
