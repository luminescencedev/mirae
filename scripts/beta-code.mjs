#!/usr/bin/env node
// Closed-beta invitation code admin CLI. Codes are stored only as a salted
// SHA-256 hash (BETA_CODE_PEPPER) — the plaintext is printed ONCE at creation
// and can never be recovered. Reuses the exact hash/generation the Worker uses
// (apps/api/src/lib/beta.ts) so codes always validate.
//
// Run with env loaded (DATABASE_URL + BETA_CODE_PEPPER):
//   pnpm beta:code:create -- --label "Rain Aoki" --uses 1 --expires-days 14
//   pnpm beta:code:list
//   pnpm beta:code:revoke -- <id>
//
// Direct: node --env-file=.env scripts/beta-code.mjs create --label "…"

import { betaAccessCodes, createDb, eq } from "../packages/db/src/index.ts";
import { generateCode, hashCode } from "../apps/api/src/lib/beta.ts";

const pepper = process.env.BETA_CODE_PEPPER ?? "";
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is not set. Run via `pnpm beta:code:*`.");
  process.exit(1);
}
if (!pepper) {
  console.error(
    "BETA_CODE_PEPPER is not set — codes created now won't validate against the Worker. Set it first.",
  );
  process.exit(1);
}

const env = { BETA_CODE_PEPPER: pepper };
const db = createDb(dbUrl);

// Tiny flag parser: `--key value` and `--flag`.
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--") continue; // lone separator (pnpm forwards it literally)
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        out[key] = next;
        i++;
      } else out[key] = true;
    } else out._ = [...(out._ ?? []), a];
  }
  return out;
}

const [cmd, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

function fmtDate(d) {
  return d ? new Date(d).toISOString().slice(0, 16).replace("T", " ") : "—";
}

async function create() {
  const label = typeof args.label === "string" ? args.label : null;
  const maxUses = args.uses ? Math.max(1, parseInt(args.uses, 10)) : 1;
  const days = args["expires-days"] ? parseInt(args["expires-days"], 10) : null;
  const expiresAt =
    days && days > 0 ? new Date(Date.now() + days * 86400_000) : null;

  const code = generateCode();
  const codeHash = await hashCode(code, env);
  const [row] = await db
    .insert(betaAccessCodes)
    .values({ codeHash, label, maxUses, expiresAt })
    .returning({ id: betaAccessCodes.id });

  console.log("\n  Invitation code created — copy it now, it is not stored:\n");
  console.log(`    ${code}\n`);
  console.log(`    id        ${row.id}`);
  if (label) console.log(`    label     ${label}`);
  console.log(`    max uses  ${maxUses}`);
  console.log(`    expires   ${expiresAt ? fmtDate(expiresAt) : "never"}\n`);
}

async function list() {
  const rows = await db.select().from(betaAccessCodes);
  if (rows.length === 0) {
    console.log("No invitation codes yet.");
    return;
  }
  rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  console.log(
    "\n  id                                    uses    expires           status    label",
  );
  console.log("  " + "-".repeat(92));
  for (const r of rows) {
    const status = r.revokedAt
      ? "revoked"
      : r.expiresAt && new Date(r.expiresAt) <= new Date()
        ? "expired"
        : r.uses >= r.maxUses
          ? "used"
          : "active";
    console.log(
      `  ${r.id}  ${String(`${r.uses}/${r.maxUses}`).padEnd(6)}  ${fmtDate(
        r.expiresAt,
      ).padEnd(16)}  ${status.padEnd(8)}  ${r.label ?? ""}`,
    );
  }
  console.log("");
}

async function revoke() {
  const id = args._?.[0];
  if (!id) {
    console.error("Usage: beta:code:revoke -- <id>");
    process.exit(1);
  }
  const updated = await db
    .update(betaAccessCodes)
    .set({ revokedAt: new Date() })
    .where(eq(betaAccessCodes.id, id))
    .returning({ id: betaAccessCodes.id });
  if (updated.length === 0) console.error(`No code with id ${id}.`);
  else console.log(`Revoked ${id}.`);
}

const commands = { create, list, revoke };
const run = commands[cmd];
if (!run) {
  console.error("Usage: beta-code <create|list|revoke> [args]");
  process.exit(1);
}
await run();
process.exit(0);
