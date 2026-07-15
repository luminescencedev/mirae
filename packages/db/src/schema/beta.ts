import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { artistProfiles } from "./studio.ts";
import { users } from "./auth.ts";

// Closed-beta invitation codes. Only a salted hash of the code is stored — the
// plaintext is shown once at creation and never persisted.
export const betaAccessCodes = pgTable("beta_access_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  codeHash: text("code_hash").notNull().unique(),
  label: text("label"),
  maxUses: integer("max_uses").notNull().default(1),
  uses: integer("uses").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdByUserId: text("created_by_user_id"),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Short-lived server-side pending invitation, created after a logged-out
// visitor verifies a code, consumed at signup. The signed cookie holds only
// this row's id.
export const betaInviteSessions = pgTable("beta_invite_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accessCodeId: uuid("access_code_id")
    .notNull()
    .references(() => betaAccessCodes.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Permanent beta membership — one row per authorized user. Account existence is
// NOT membership; this is.
export const betaMembers = pgTable("beta_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  accessCodeId: uuid("access_code_id").references(() => betaAccessCodes.id, {
    onDelete: "set null",
  }),
  grantedAt: timestamp("granted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

// In-app beta feedback submitted by artists from the feedback widget.
export const betaFeedback = pgTable("beta_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artistProfiles.id, { onDelete: "cascade" }),
  // Optional quick sentiment: "good" | "idea" | "bug".
  sentiment: text("sentiment"),
  message: text("message").notNull(),
  // The route the artist was on when they submitted (context for triage).
  page: text("page"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
