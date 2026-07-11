export { createDb, type Database } from "./client.ts";

// Tables + enums (named), and the whole schema namespace for the client.
export * from "./schema/index.ts";
export * as schema from "./schema/index.ts";

import type {
  users,
  sessions,
  accounts,
  verifications,
  artistProfiles,
  waitlist,
  clients,
  commissionTypes,
  commissionRequests,
  commissions,
  quotes,
  quoteItems,
  files,
  deliveries,
  activityLogs,
} from "./schema/index.ts";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type NewArtistProfile = typeof artistProfiles.$inferInsert;
export type Waitlist = typeof waitlist.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type CommissionType = typeof commissionTypes.$inferSelect;
export type NewCommissionType = typeof commissionTypes.$inferInsert;
export type CommissionRequest = typeof commissionRequests.$inferSelect;
export type NewCommissionRequest = typeof commissionRequests.$inferInsert;
export type Commission = typeof commissions.$inferSelect;
export type NewCommission = typeof commissions.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;
export type FileRecord = typeof files.$inferSelect;
export type NewFileRecord = typeof files.$inferInsert;
export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
