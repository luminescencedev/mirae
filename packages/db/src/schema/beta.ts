import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { artistProfiles } from "./studio.ts";

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
