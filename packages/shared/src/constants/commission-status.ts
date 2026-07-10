// Commission lifecycle statuses. Keep in sync with the Postgres enum in
// packages/db (see docs/DATABASE.md).
export const COMMISSION_STATUSES = [
  "new_request",
  "quote_sent",
  "waiting_deposit",
  "queued",
  "sketch",
  "review",
  "revision",
  "final",
  "delivered",
  "archived",
] as const;

export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

// Request inbox statuses.
export const REQUEST_STATUSES = [
  "new",
  "accepted",
  "declined",
  "converted",
  "archived",
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

// Studio-level commission availability.
export const STUDIO_STATUSES = ["open", "closed", "waitlist"] as const;

export type StudioStatus = (typeof STUDIO_STATUSES)[number];
