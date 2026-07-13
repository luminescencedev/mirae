import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { projectType, projectVisibility } from "./enums.ts";
import { artistProfiles } from "./studio.ts";

// A portfolio project — a piece (or set) of the artist's work shown on the
// public studio. Owner-scoped via artistId; only `published` is public.
export const portfolioProjects = pgTable(
  "portfolio_projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artistProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    projectType: projectType("project_type").notNull().default("illustration"),
    visibility: projectVisibility("visibility").notNull().default("draft"),
    // Manual ordering within the artist's portfolio (lower = earlier).
    position: integer("position").notNull().default(0),
    // At most one featured project per artist (enforced in the app layer).
    featured: boolean("featured").notNull().default(false),
    // The asset shown first / as the project's cover. Nulled if that asset is
    // deleted.
    coverAssetId: uuid("cover_asset_id").references(
      (): AnyPgColumn => portfolioAssets.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [
    index("portfolio_projects_artist_idx").on(t.artistId),
    index("portfolio_projects_artist_visibility_idx").on(
      t.artistId,
      t.visibility,
    ),
    index("portfolio_projects_artist_position_idx").on(t.artistId, t.position),
    unique("portfolio_projects_artist_slug_key").on(t.artistId, t.slug),
  ],
);

// An image belonging to a portfolio project. Stored in R2; row deleted with
// the project (R2 objects cleaned up in the app layer — see API extension).
export const portfolioAssets = pgTable(
  "portfolio_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => portfolioProjects.id, { onDelete: "cascade" }),
    r2Key: text("r2_key").notNull(),
    mimeType: text("mime_type").notNull(),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes"),
    altText: text("alt_text"),
    position: integer("position").notNull().default(0),
    // Tiny base64 placeholder for blur-up loading.
    blurData: text("blur_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("portfolio_assets_project_idx").on(t.projectId),
    index("portfolio_assets_project_position_idx").on(t.projectId, t.position),
  ],
);
