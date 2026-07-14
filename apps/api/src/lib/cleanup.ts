// Orphaned-object sweep: R2 objects with no referencing DB row. The common
// path (row delete → object delete, avatar/cover replace) is handled inline;
// this is a bounded, conservative safety net run from a daily cron. It only
// deletes objects older than a grace window so in-flight uploads are never hit.

import {
  artistProfiles,
  commissionTypes,
  createDb,
  files,
  portfolioAssets,
} from "@mirae/db";

type Env = { DATABASE_URL: string; FILES: R2Bucket };

const GRACE_MS = 24 * 60 * 60 * 1000; // don't touch objects newer than 24h
const MAX_DELETES = 200; // cap deletes per run

export async function sweepOrphans(env: Env): Promise<number> {
  const db = createDb(env.DATABASE_URL);

  // Gather every referenced R2 key into a lookup set.
  const referenced = new Set<string>();
  const add = (v: string | null | undefined) => {
    if (v) referenced.add(v);
  };
  for (const r of await db.select({ k: files.key }).from(files)) add(r.k);
  for (const r of await db
    .select({ k: portfolioAssets.r2Key })
    .from(portfolioAssets))
    add(r.k);
  for (const r of await db
    .select({ a: artistProfiles.avatarR2Key, c: artistProfiles.coverR2Key })
    .from(artistProfiles)) {
    add(r.a);
    add(r.c);
  }
  for (const r of await db
    .select({ k: commissionTypes.imageR2Key })
    .from(commissionTypes))
    add(r.k);

  const cutoff = Date.now() - GRACE_MS;
  let deleted = 0;
  let cursor: string | undefined;

  do {
    const page = await env.FILES.list({ limit: 1000, cursor });
    const orphans = page.objects
      .filter((o) => !referenced.has(o.key))
      .filter((o) => o.uploaded.getTime() < cutoff)
      .map((o) => o.key)
      .slice(0, MAX_DELETES - deleted);
    if (orphans.length > 0) {
      await env.FILES.delete(orphans);
      deleted += orphans.length;
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor && deleted < MAX_DELETES);

  return deleted;
}
