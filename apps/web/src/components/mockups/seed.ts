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

export type Column = {
  name: string;
  dot: string;
  count: number;
  items: Commission[];
};

export const COLUMNS: Column[] = [
  {
    name: "New request",
    dot: "bg-amber-500",
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
    dot: "bg-accent-500",
    count: 3,
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
        statusDot: "bg-accent-500",
        statusLabel: "Sketch",
      },
      {
        client: "Mai Tanaka",
        type: "Emote set (5)",
        tags: [{ label: "Twitch", variant: "teal" }],
        price: "$150",
        due: "3d",
        statusDot: "bg-accent-500",
        statusLabel: "Line art",
      },
      {
        client: "Ludo",
        type: "Sticker sheet",
        tags: [{ label: "Illustration", variant: "violet" }],
        price: "$110",
        due: "6d",
        statusDot: "bg-accent-500",
        statusLabel: "Sketch",
      },
    ],
  },
  {
    name: "Review",
    dot: "bg-violet-500",
    count: 2,
    items: [
      {
        client: "Nadia",
        type: "Album cover",
        tags: [{ label: "Illustration", variant: "violet" }],
        price: "$260",
        due: "Client review",
        statusDot: "bg-violet-500",
        statusLabel: "Revision 1",
      },
      {
        client: "Sora",
        type: "Reference sheet",
        tags: [{ label: "Illustration", variant: "violet" }],
        price: "$200",
        due: "2d",
        statusDot: "bg-violet-500",
        statusLabel: "Final review",
      },
    ],
  },
  {
    name: "Delivered",
    dot: "bg-emerald-500",
    count: 2,
    items: [
      {
        client: "Kenji",
        type: "Profile icon",
        tags: [{ label: "Illustration", variant: "violet" }],
        price: "$60",
        due: "Delivered",
        statusDot: "bg-emerald-500",
        statusLabel: "Delivered",
      },
      {
        client: "Priya",
        type: "Event poster",
        tags: [
          { label: "Illustration", variant: "violet" },
          { label: "Commercial", variant: "amber" },
        ],
        price: "$340",
        due: "Delivered",
        statusDot: "bg-emerald-500",
        statusLabel: "Delivered",
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
    text: "Mai Tanaka's emote set moved to Line art",
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

// --- Requests inbox ---------------------------------------------------------

export type RequestStatus = "new" | "accepted" | "declined";

export type CommissionRequest = {
  id: string;
  client: string;
  type: string;
  budget: string;
  message: string;
  time: string;
  status: RequestStatus;
};

// --- Public artist page -----------------------------------------------------

export type StudioStatus = "open" | "closed" | "waitlist";

export type CommissionType = {
  name: string;
  blurb: string;
  from: string;
  turnaround: string;
  slots?: string;
};

export const ARTIST = {
  handle: "rainaoki",
  name: "Rain Aoki",
  tagline: "Character illustrator · semi-realistic & anime",
  bio: "I take on character illustrations, key visuals and emote sets. Two revision rounds included. Commercial licensing available.",
  status: "open" as StudioStatus,
  commissionTypes: [
    {
      name: "Character illustration",
      blurb: "Full-body or half-body, rendered. Refs welcome.",
      from: "€150",
      turnaround: "~2 weeks",
      slots: "3 slots open",
    },
    {
      name: "Emote / sticker set",
      blurb: "Sets of 3–10 for Twitch, Discord or Telegram.",
      from: "€90",
      turnaround: "~1 week",
      slots: "2 slots open",
    },
    {
      name: "Key visual (commercial)",
      blurb: "Illustration for a launch, cover or campaign.",
      from: "€400",
      turnaround: "3–4 weeks",
    },
  ] satisfies CommissionType[],
};

export const STUDIO_STATUS_META: Record<
  StudioStatus,
  { label: string; dot: string; variant: "emerald" | "amber" | "neutral" }
> = {
  open: {
    label: "Open for commissions",
    dot: "bg-emerald-500",
    variant: "emerald",
  },
  waitlist: { label: "Waitlist only", dot: "bg-amber-500", variant: "amber" },
  closed: { label: "Closed", dot: "bg-fg-subtle", variant: "neutral" },
};

export const REQUESTS: CommissionRequest[] = [
  {
    id: "r1",
    client: "Ava Chen",
    type: "Full-body character",
    budget: "€150–200",
    message:
      "Hi! I'd love a full-body illustration of my OC in a dynamic pose. Semi-realistic, cool tones. Refs attached.",
    time: "10m",
    status: "new",
  },
  {
    id: "r2",
    client: "Marco",
    type: "Chibi pair",
    budget: "€80–100",
    message:
      "Two chibis of me and my partner for our anniversary. Cute, soft palette. No rush — end of month is fine.",
    time: "1h",
    status: "new",
  },
  {
    id: "r3",
    client: "Léa Fontaine",
    type: "Profile banner",
    budget: "€120",
    message:
      "Twitch banner matching my emote set. Purple/teal, my mascot cat included. Sizes in the brief.",
    time: "3h",
    status: "new",
  },
  {
    id: "r4",
    client: "Stellar Co.",
    type: "Key visual",
    budget: "€400+",
    message:
      "Commercial key visual for a game launch. Need a quote + timeline for a licensed illustration.",
    time: "1d",
    status: "accepted",
  },
  {
    id: "r5",
    client: "Anon",
    type: "NSFW request",
    budget: "—",
    message: "Outside what I take on — declined politely.",
    time: "2d",
    status: "declined",
  },
];
