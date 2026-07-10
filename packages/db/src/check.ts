import { neon } from "@neondatabase/serverless";

// Quick Neon connectivity check: `pnpm db:check` (root). Confirms DATABASE_URL
// reaches the branch before wiring migrations.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = neon(url);
const rows =
  await sql`select 1 as ok, current_database() as db, version() as version`;
console.log("✓ Neon connection OK");
console.log(rows[0]);
