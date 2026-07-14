// Per-artist storage quota. Sums the artist's stored bytes (portfolio assets +
// commission files — the two unbounded, accumulating upload paths) so upload
// endpoints can reject once the artist is over budget. Avatars/covers/type
// images are small, single-slot and not summed.

import { eq, inArray, sql } from "drizzle-orm";
import {
  commissions,
  createDb,
  files,
  portfolioAssets,
  portfolioProjects,
} from "@mirae/db";

// Generous beta ceiling; revisit with billing (Sprint 25).
export const STORAGE_QUOTA_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

type Db = ReturnType<typeof createDb>;

export async function artistStorageBytes(
  db: Db,
  artistId: string,
): Promise<number> {
  let total = 0;

  const projects = await db
    .select({ id: portfolioProjects.id })
    .from(portfolioProjects)
    .where(eq(portfolioProjects.artistId, artistId));
  if (projects.length > 0) {
    const [row] = await db
      .select({
        sum: sql<number>`coalesce(sum(${portfolioAssets.sizeBytes}), 0)`,
      })
      .from(portfolioAssets)
      .where(
        inArray(
          portfolioAssets.projectId,
          projects.map((p) => p.id),
        ),
      );
    total += Number(row?.sum ?? 0);
  }

  const coms = await db
    .select({ id: commissions.id })
    .from(commissions)
    .where(eq(commissions.artistId, artistId));
  if (coms.length > 0) {
    const [row] = await db
      .select({ sum: sql<number>`coalesce(sum(${files.sizeBytes}), 0)` })
      .from(files)
      .where(
        inArray(
          files.commissionId,
          coms.map((c) => c.id),
        ),
      );
    total += Number(row?.sum ?? 0);
  }

  return total;
}

// True when adding `incoming` bytes would push the artist over quota.
export async function wouldExceedQuota(
  db: Db,
  artistId: string,
  incoming: number,
): Promise<boolean> {
  const used = await artistStorageBytes(db, artistId);
  return used + incoming > STORAGE_QUOTA_BYTES;
}
