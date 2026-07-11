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
  {
    name: "Delivered",
    dot: "bg-emerald-500",
    statuses: ["delivered", "archived"],
  },
];

// Condensed client-facing milestones (indexes into STATUS_ORDER).
const MILESTONES: { label: string; at: number }[] = [
  { label: "New request", at: 0 },
  { label: "Quote sent", at: 1 },
  { label: "Queued", at: 3 },
  { label: "In progress", at: 4 },
  { label: "Review", at: 5 },
  { label: "Delivered", at: 8 },
];

export type MilestoneState = "done" | "active" | "todo";

// Milestone list with each step's state for the current commission status.
export function milestones(
  status: CommissionStatus,
): { label: string; state: MilestoneState }[] {
  const idx = STATUS_ORDER.indexOf(status);
  return MILESTONES.map((m, i) => {
    const nextAt = MILESTONES[i + 1]?.at ?? Infinity;
    if (idx >= nextAt) return { label: m.label, state: "done" };
    if (idx >= m.at) return { label: m.label, state: "active" };
    return { label: m.label, state: "todo" };
  });
}

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
