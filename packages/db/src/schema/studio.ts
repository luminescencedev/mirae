import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { StudioAppearance } from "@mirae/shared";
import { studioStatus } from "./enums.ts";
import { users } from "./auth.ts";

// The artist's studio profile — one per user.
export const artistProfiles = pgTable("artist_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  handle: text("handle").notNull().unique(),
  displayName: text("display_name").notNull(),
  tagline: text("tagline"),
  bio: text("bio"),
  // Profile media (R2 object keys; served via the API). Nullable until set.
  avatarR2Key: text("avatar_r2_key"),
  coverR2Key: text("cover_r2_key"),
  // Public-studio appearance config (validated in the app layer via
  // normalizeAppearance). Null → defaults.
  appearance: jsonb("appearance").$type<StudioAppearance>(),
  status: studioStatus("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Landing-page waitlist signups (pre-launch email capture).
export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// A client the artist works with (found off-platform).
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artistProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  discord: text("discord"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// A commission offering shown on the public page. Money in integer cents.
export const commissionTypes = pgTable("commission_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artistProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  blurb: text("blurb"),
  priceFromCents: integer("price_from_cents"),
  turnaround: text("turnaround"),
  slots: integer("slots"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
