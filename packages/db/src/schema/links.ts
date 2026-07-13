import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { linkStyle, linkType } from "./enums.ts";
import { artistProfiles } from "./studio.ts";

// A link on the artist's public studio (link-in-bio). Owner-scoped; only
// enabled links render publicly. `clicks` is an aggregate counter (no visitor
// identity). See docs/product/PUBLIC_STUDIO_SPEC.md §5.
export const artistLinks = pgTable(
  "artist_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artistProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    // Free-text platform key for icon mapping (instagram, x, kofi, custom…).
    platform: text("platform"),
    type: linkType("type").notNull().default("custom"),
    style: linkStyle("style").notNull().default("simple"),
    position: integer("position").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    enabled: boolean("enabled").notNull().default(true),
    // Aggregate click count (privacy-friendly; no per-visitor data).
    clicks: integer("clicks").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("artist_links_artist_idx").on(t.artistId),
    index("artist_links_artist_position_idx").on(t.artistId, t.position),
  ],
);
