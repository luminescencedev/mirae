import { type CommissionStatus, type QueueCommission } from "./api.ts";

// Per-status display metadata (label + status dot color).
export const STATUS_META: Record<
  CommissionStatus,
  { label: string; dot: string }
> = {
  new_request: { label: "New request", dot: "bg-amber-500" },
  quote_sent: { label: "Quote sent", dot: "bg-amber-500" },
  waiting_deposit: { label: "Waiting deposit", dot: "bg-amber-500" },
  queued: { label: "Queued", dot: "bg-accent-500" },
  sketch: { label: "Sketch", dot: "bg-accent-500" },
  review: { label: "Review", dot: "bg-violet-500" },
  revision: { label: "Revision", dot: "bg-violet-500" },
  final: { label: "Final", dot: "bg-accent-500" },
  delivered: { label: "Delivered", dot: "bg-emerald-500" },
  archived: { label: "Archived", dot: "bg-fg-subtle" },
};

// Ordered lifecycle — used for the detail timeline and "advance" action.
export const STATUS_ORDER: CommissionStatus[] = [
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
];

// Board columns group several statuses into one lane.
export const COLUMNS: {
  name: string;
  dot: string;
  statuses: CommissionStatus[];
}[] = [
  {
    name: "New",
    dot: "bg-amber-500",
    statuses: ["new_request", "quote_sent", "waiting_deposit"],
  },
  { name: "Queued", dot: "bg-accent-500", statuses: ["queued"] },
  {
    name: "In progress",
    dot: "bg-accent-500",
    statuses: ["sketch", "review", "revision", "final"],
  },
  { name: "Delivered", dot: "bg-emerald-500", statuses: ["delivered", "archived"] },
];

export function euro(cents: number | null): string {
  return cents == null ? "—" : `€${(cents / 100).toLocaleString()}`;
}

// A commission's deadline as a compact due label.
export function dueLabel(deadline: string | null): string {
  if (!deadline) return "No deadline";
  return new Date(deadline).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function groupByColumn(commissions: QueueCommission[]) {
  return COLUMNS.map((col) => ({
    ...col,
    items: commissions.filter((c) => col.statuses.includes(c.status)),
  }));
}
