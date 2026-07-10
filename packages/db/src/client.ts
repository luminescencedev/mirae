import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index.ts";

// Neon serverless HTTP driver + Drizzle. Required for Cloudflare Workers,
// which cannot open raw TCP connections (see docs/DECISIONS.md). Pass the
// connection string explicitly — no top-level env access, so this stays
// portable between the Worker runtime and local tooling.
export function createDb(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle({ client: sql, schema });
}

export type Database = ReturnType<typeof createDb>;
