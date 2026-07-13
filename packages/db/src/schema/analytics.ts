import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { artistProfiles } from "./studio.ts";

// Privacy-friendly public-studio events. No cookies, no stored IPs — a daily
// per-visitor hash (IP+UA+day+salt, computed server-side and discarded) lets us
// estimate unique views without identifying anyone. See docs.
export const studioEvents = pgTable(
  "studio_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artistProfiles.id, { onDelete: "cascade" }),
    // view | link_click | request_start | request_submit
    type: text("type").notNull(),
    // Set for link_click events (which link was clicked).
    linkId: uuid("link_id"),
    // Daily-rotating visitor hash — dedupes unique views, not personal.
    sessionHash: text("session_hash"),
    // Referrer host only (e.g. "instagram.com") — never the full URL.
    refHost: text("ref_host"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("studio_events_artist_created_idx").on(t.artistId, t.createdAt),
    index("studio_events_artist_type_idx").on(t.artistId, t.type),
  ],
);
