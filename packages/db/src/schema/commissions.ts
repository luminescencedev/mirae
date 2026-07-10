import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { commissionStatus, requestStatus } from "./enums.ts";
import { artistProfiles, clients, commissionTypes } from "./studio.ts";

// Incoming request from the public form (no account needed for the client).
export const commissionRequests = pgTable("commission_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artistProfiles.id, { onDelete: "cascade" }),
  commissionTypeId: uuid("commission_type_id").references(
    () => commissionTypes.id,
    { onDelete: "set null" },
  ),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  budget: text("budget"),
  message: text("message").notNull(),
  status: requestStatus("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// A tracked commission (converted from an accepted request, or created direct).
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artistProfiles.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  requestId: uuid("request_id").references(() => commissionRequests.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  status: commissionStatus("status").notNull().default("queued"),
  priceCents: integer("price_cents"),
  paidCents: integer("paid_cents").notNull().default(0),
  deadline: timestamp("deadline", { withTimezone: true }),
  portalToken: text("portal_token").unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// A quote for a commission (manual amount; line items below).
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  commissionId: uuid("commission_id")
    .notNull()
    .references(() => commissions.id, { onDelete: "cascade" }),
  totalCents: integer("total_cents").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft | sent | accepted
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const quoteItems = pgTable("quote_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  amountCents: integer("amount_cents").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Files attached to a commission (references, WIP, deliverables) — R2 keys.
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  commissionId: uuid("commission_id")
    .notNull()
    .references(() => commissions.id, { onDelete: "cascade" }),
  kind: text("kind").notNull().default("reference"), // reference | wip | deliverable
  key: text("key").notNull(),
  name: text("name").notNull(),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Delivery page for a finished commission (token-addressed, no login).
export const deliveries = pgTable("deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  commissionId: uuid("commission_id")
    .notNull()
    .unique()
    .references(() => commissions.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  message: text("message"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Activity log — key changes on a commission.
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  artistId: uuid("artist_id")
    .notNull()
    .references(() => artistProfiles.id, { onDelete: "cascade" }),
  commissionId: uuid("commission_id").references(() => commissions.id, {
    onDelete: "cascade",
  }),
  type: text("type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
