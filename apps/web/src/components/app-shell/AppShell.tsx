import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  motion,
} from "motion/react";
import { Badge, Button, Icon, cn } from "@mirae/ui";
import {
  CubeIcon,
  DashboardSquare01Icon,
  InboxIcon,
  Notification03Icon,
  Package01Icon,
  PaintBrush01Icon,
  PanelLeftIcon,
  PanelRightIcon,
  Logout01Icon,
  Search01Icon,
  Store01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { IconData } from "../mockups/seed.ts";
import { signOut, useSession } from "../../lib/auth-client.ts";

const NAV_ROW = 36; // h-9
const NAV_STEP = NAV_ROW + 2; // + gap-0.5

// Mirae's product nav → the /app/* routes.
const NAV: { label: string; icon: IconData; to: string; badge?: number }[] = [
  { label: "Overview", icon: DashboardSquare01Icon, to: "/app/overview" },
  { label: "Requests", icon: InboxIcon, to: "/app/requests", badge: 3 },
  { label: "Queue", icon: PaintBrush01Icon, to: "/app/queue" },
  { label: "Clients", icon: UserGroupIcon, to: "/app/clients" },
  { label: "Deliveries", icon: Package01Icon, to: "/app/deliveries" },
  { label: "Studio page", icon: Store01Icon, to: "/app/studio-page" },
];

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

function NavList({
  collapsed,
  activeIndex,
}: {
  collapsed: boolean;
  activeIndex: number;
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const barIndex = hovered ?? (activeIndex >= 0 ? activeIndex : 0);
  const y = useMotionValue(barIndex * NAV_STEP);

  const move = (i: number) => {
    const target = i * NAV_STEP;
    if (reduce) y.set(target);
    else animate(y, target, { type: "spring", stiffness: 420, damping: 38 });
  };

  return (
    <nav
      className="relative flex flex-col gap-0.5"
      onMouseLeave={() => {
        setHovered(null);
        if (activeIndex >= 0) move(activeIndex);
      }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 rounded-md bg-surface-sunken transition-[width] duration-200 ease-out"
        style={{ y, height: NAV_ROW, width: collapsed ? NAV_ROW : "100%" }}
      />
      {NAV.map((item, i) => (
        <Link
          key={item.label}
          to={item.to}
          onMouseEnter={() => {
            setHovered(i);
            move(i);
          }}
          className={cn(
            "group relative z-10 flex h-9 w-full items-center rounded-md text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500",
            i === activeIndex ? "text-fg" : "text-fg-muted hover:text-fg",
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
        </Link>
      ))}
    </nav>
  );
}

/** /app layout — collapsible sidebar + top bar; pages render into the Outlet. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const collapsed = !open;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const activeIndex = NAV.findIndex((n) => pathname.startsWith(n.to));
  const current = NAV[activeIndex]?.label ?? "Studio";
  const userName = session?.user?.name ?? "Your studio";
  const userEmail = session?.user?.email ?? "";

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-canvas text-fg">
      <aside
        className={cn(
          "flex shrink-0 flex-col overflow-hidden border-r border-border transition-[width] duration-200 ease-out",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
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

        <div className="px-4">
          <button className="flex h-9 w-full items-center rounded-md text-sm text-fg-subtle outline-none ring-1 ring-inset ring-border transition-[color,box-shadow] hover:text-fg hover:ring-border-strong focus-visible:ring-2 focus-visible:ring-accent-500">
            <span className="grid size-9 shrink-0 place-items-center">
              <Icon icon={Search01Icon} size={16} strokeWidth={1.8} />
            </span>
            <Label collapsed={collapsed}>Search</Label>
          </button>
        </div>

        <div className="mt-3 flex-1 px-4">
          <NavList collapsed={collapsed} activeIndex={activeIndex} />
        </div>

        <div className="flex h-14 items-center border-t border-border px-4">
          <span className="grid size-9 shrink-0 place-items-center">
            <span className="size-8 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
          </span>
          <Label collapsed={collapsed} className="min-w-0 flex-1 pl-1">
            <span className="block truncate text-sm font-medium">
              {userName}
            </span>
            <span className="block truncate text-xs text-fg-subtle">
              {userEmail || "Studio"}
            </span>
          </Label>
          {!collapsed && (
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <Icon icon={Logout01Icon} size={17} strokeWidth={1.7} />
            </button>
          )}
        </div>
      </aside>

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
          <span className="text-fg">{current}</span>
          <button className="ml-auto rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg">
            <Icon icon={Notification03Icon} size={18} strokeWidth={1.7} />
          </button>
        </header>

        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
