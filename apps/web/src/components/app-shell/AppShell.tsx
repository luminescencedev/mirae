import { useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import {
  Badge,
  Button,
  Icon,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from "@mirae/ui";
import {
  Add01Icon,
  CubeIcon,
  DashboardSquare01Icon,
  InboxIcon,
  MoreHorizontalIcon,
  Notification03Icon,
  Package01Icon,
  PaintBrush01Icon,
  PanelLeftIcon,
  PanelRightIcon,
  Search01Icon,
  Store01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

type IconType = typeof InboxIcon;
type TagVariant = "blue" | "violet" | "teal" | "amber" | "emerald";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const NAV_ROW = 36; // h-9
const NAV_STEP = NAV_ROW + 2; // + gap-0.5

// Mirae's real product nav (mirrors the /app/* routes in docs/ARCHITECTURE.md).
const NAV: { label: string; icon: IconType; badge?: number }[] = [
  { label: "Overview", icon: DashboardSquare01Icon },
  { label: "Requests", icon: InboxIcon, badge: 3 },
  { label: "Queue", icon: PaintBrush01Icon },
  { label: "Clients", icon: UserGroupIcon },
  { label: "Deliveries", icon: Package01Icon },
  { label: "Studio page", icon: Store01Icon },
];

// Collapsing label: the icon lives in a fixed slot; only the text retracts in
// width + opacity (CSS), so nothing ever jumps. Matches the 4esElo sidebar.
function Label({
  collapsed,
  className,
  children,
}: {
  collapsed: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-out",
        collapsed ? "max-w-0 opacity-0" : "max-w-[170px] opacity-100",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Vertical nav: one bar springs behind the hovered row, resting on the active
 *  row. Icons in fixed slots; collapsed → icons only + hover tooltip. */
function NavList({
  collapsed,
  active,
  onSelect,
}: {
  collapsed: boolean;
  active: number;
  onSelect: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const barIndex = hovered ?? active;
  const y = useMotionValue(barIndex * NAV_STEP);

  useEffect(() => {
    const target = barIndex * NAV_STEP;
    if (reduce) {
      y.set(target);
      return;
    }
    const controls = animate(y, target, {
      type: "spring",
      stiffness: 420,
      damping: 38,
    });
    return () => controls.stop();
  }, [barIndex, reduce, y]);

  return (
    <nav
      className="relative flex flex-col gap-0.5"
      onMouseLeave={() => setHovered(null)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 rounded-md bg-surface-sunken transition-[width] duration-200 ease-out"
        style={{ y, height: NAV_ROW, width: collapsed ? NAV_ROW : "100%" }}
      />
      {NAV.map((item, i) => (
        <button
          key={item.label}
          onClick={() => onSelect(i)}
          onMouseEnter={() => setHovered(i)}
          className={cn(
            "group relative z-10 flex h-9 w-full items-center rounded-md text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500",
            active === i ? "text-fg" : "text-fg-muted hover:text-fg",
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center">
            <Icon icon={item.icon} size={18} strokeWidth={1.7} />
          </span>
          <Label collapsed={collapsed}>{item.label}</Label>
          {item.badge != null && !collapsed && (
            <Badge variant="accent" className="ml-auto mr-1">
              {item.badge}
            </Badge>
          )}
          {collapsed && (
            <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-fg opacity-0 shadow-panel transition-opacity duration-150 group-hover:opacity-100">
              {item.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

type Commission = {
  client: string;
  type: string;
  tags: { label: string; variant: TagVariant }[];
  price: string;
  due: string;
  statusDot: string;
  statusLabel: string;
};

const COLUMNS: { name: string; count: number; items: Commission[] }[] = [
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

function CommissionCard({ item }: { item: Commission }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-soft transition-shadow hover:shadow-panel">
      <div className="flex items-center gap-2">
        <span className="size-5 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
        <span className="text-xs text-fg-muted">{item.client}</span>
      </div>
      <h4 className="mt-2 text-sm font-medium tracking-tight text-fg">
        {item.type}
      </h4>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {item.tags.map((t) => (
          <Badge key={t.label} variant={t.variant}>
            {t.label}
          </Badge>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-2.5 text-xs text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", item.statusDot)} />
          {item.statusLabel}
        </span>
        <span className="ml-auto tabular-nums">{item.due}</span>
        <span className="font-semibold text-fg tabular-nums">{item.price}</span>
      </div>
    </div>
  );
}

/** AppShell prototype — collapsible sidebar + commission queue. UI-005. */
export function AppShell() {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(2); // Queue
  const collapsed = !open;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas text-fg">
      {/* One collapsible sidebar — icons in fixed slots, labels retract */}
      <aside
        className={cn(
          "flex shrink-0 flex-col overflow-hidden border-r border-border transition-[width] duration-200 ease-out",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center px-4">
          <span className="grid size-9 shrink-0 place-items-center">
            <span className="flex size-8 items-center justify-center rounded-md bg-fg text-white">
              <Icon icon={CubeIcon} size={18} />
            </span>
          </span>
          <Label
            collapsed={collapsed}
            className="pl-1 font-semibold tracking-tight"
          >
            Mirae
          </Label>
        </div>

        {/* Search */}
        <div className="px-4">
          <button
            className={cn(
              "flex h-9 w-full items-center rounded-md text-sm text-fg-subtle outline-none ring-1 ring-inset ring-border transition-[color,box-shadow] hover:text-fg hover:ring-border-strong focus-visible:ring-2 focus-visible:ring-accent-500",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center">
              <Icon icon={Search01Icon} size={16} strokeWidth={1.8} />
            </span>
            <Label collapsed={collapsed}>Search</Label>
          </button>
        </div>

        {/* Nav */}
        <div className="mt-3 flex-1 px-4">
          <NavList collapsed={collapsed} active={active} onSelect={setActive} />
        </div>

        {/* User */}
        <div className="flex h-14 items-center border-t border-border px-4">
          <span className="grid size-9 shrink-0 place-items-center">
            <span className="size-8 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
          </span>
          <Label collapsed={collapsed} className="min-w-0 pl-1">
            <span className="block truncate text-sm font-medium">
              Sandra Marx
            </span>
            <span className="block truncate text-xs text-fg-subtle">
              Studio · Pro
            </span>
          </Label>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm text-fg-muted">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Icon
              icon={open ? PanelLeftIcon : PanelRightIcon}
              size={18}
              strokeWidth={1.7}
            />
          </Button>
          <span>Studio</span>
          <span className="text-fg-subtle">/</span>
          <span className="text-fg">Queue</span>
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg">
              <Icon icon={Notification03Icon} size={18} strokeWidth={1.7} />
            </button>
          </div>
        </header>

        <div className="flex items-end justify-between px-6 pt-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Commission queue
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              5 active commissions · 2 awaiting your quote
            </p>
          </div>
          <Button>
            <Icon icon={Add01Icon} strokeWidth={1.8} />
            New commission
          </Button>
        </div>

        <div className="px-6 pt-5">
          <Tabs defaultValue="board">
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {COLUMNS.map((col, ci) => (
              <motion.section
                key={col.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: ci * 0.07,
                  ease: EASE_OUT,
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-2 px-1">
                  <span className="text-sm font-semibold">{col.name}</span>
                  <span className="text-xs text-fg-subtle">{col.count}</span>
                  <div className="ml-auto flex items-center gap-1 text-fg-subtle">
                    <button className="rounded p-0.5 hover:text-fg">
                      <Icon icon={Add01Icon} size={16} strokeWidth={1.8} />
                    </button>
                    <button className="rounded p-0.5 hover:text-fg">
                      <Icon
                        icon={MoreHorizontalIcon}
                        size={16}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                </div>
                {col.items.map((it) => (
                  <CommissionCard key={it.client + it.type} item={it} />
                ))}
              </motion.section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
