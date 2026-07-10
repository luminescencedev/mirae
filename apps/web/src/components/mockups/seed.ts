import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  InboxIcon,
  Money03Icon,
  PaintBrush01Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons";

// Seed data for the dashboard preview mockup (UI-007). Static, no backend —
// mirrors what /app/overview + /app/queue will show once wired (Sprint 3+).

export type IconData = typeof InboxIcon;
export type TagVariant = "blue" | "violet" | "teal" | "amber" | "emerald";

export type Commission = {
  client: string;
  type: string;
  tags: { label: string; variant: TagVariant }[];
  price: string;
  due: string;
  statusDot: string;
  statusLabel: string;
};

export const COLUMNS: { name: string; count: number; items: Commission[] }[] = [
  {
    name: "New request",
    count: 2,
    items: [
      {
        client: "Ava Chen",
        type: "Full-body character",
        tags: [
          { label: "Illustration", variant: "violet" },
          { label: "Commercial", variant: "amber" },
        ],
        price: "$180",
        due: "Quote due 2d",
        statusDot: "bg-amber-500",
        statusLabel: "Needs quote",
      },
      {
        client: "Marco",
        type: "Chibi pair",
        tags: [{ label: "Illustration", variant: "violet" }],
        price: "$90",
        due: "1d",
        statusDot: "bg-amber-500",
        statusLabel: "Needs quote",
      },
    ],
  },
  {
    name: "In progress",
    count: 2,
    items: [
      {
        client: "Stellar Co.",
        type: "Key visual",
        tags: [
          { label: "Illustration", variant: "violet" },
          { label: "Commercial", variant: "amber" },
        ],
        price: "$420",
        due: "5d",
        statusDot: "bg-emerald-500",
        statusLabel: "Sketch",
      },
      {
        client: "Rin",
        type: "Emote set (5)",
        tags: [{ label: "Twitch", variant: "teal" }],
        price: "$150",
        due: "3d",
        statusDot: "bg-emerald-500",
        statusLabel: "Line art",
      },
    ],
  },
  {
    name: "Review",
    count: 1,
    items: [
      {
        client: "Nadia",
        type: "Album cover",
        tags: [{ label: "Illustration", variant: "violet" }],
        price: "$260",
        due: "Client review",
        statusDot: "bg-accent-500",
        statusLabel: "Revision 1",
      },
    ],
  },
];

export type Stat = {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: IconData;
};

export const STATS: Stat[] = [
  {
    label: "Active commissions",
    value: "5",
    delta: "+2",
    icon: PaintBrush01Icon,
  },
  { label: "Awaiting quote", value: "2", icon: Alert02Icon },
  {
    label: "This month",
    value: "$1,240",
    delta: "+18%",
    icon: Money03Icon,
  },
  {
    label: "Avg turnaround",
    value: "6d",
    delta: "-1d",
    positive: true,
    icon: Clock01Icon,
  },
];

export type Activity = { icon: IconData; text: string; time: string };

export const ACTIVITY: Activity[] = [
  { icon: InboxIcon, text: "Ava Chen sent a new request", time: "10m" },
  {
    icon: PaintBrush01Icon,
    text: "Rin's emote set moved to Line art",
    time: "1h",
  },
  {
    icon: CheckmarkCircle02Icon,
    text: "Nadia approved the Album cover sketch",
    time: "3h",
  },
  {
    icon: Package01Icon,
    text: "Delivered Key visual draft to Stellar Co.",
    time: "1d",
  },
];

// Commissions that need the artist's attention now (awaiting a quote).
export const NEEDS_ATTENTION = COLUMNS[0].items;
