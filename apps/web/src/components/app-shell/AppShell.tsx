import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  motion,
} from "motion/react";
import { Badge, Button, Icon, Mark, cn } from "@mirae/ui";
import {
  DashboardSquare01Icon,
  InboxIcon,
  Package01Icon,
  PaintBrush01Icon,
  Logout01Icon,
  Search01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  Store01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { IconData } from "../mockups/seed.ts";
import { signOut, useSession } from "../../lib/auth-client.ts";
import { requestsApi } from "../../lib/api.ts";
import { CommandPalette } from "./CommandPalette.tsx";
import { NotificationsMenu } from "./NotificationsMenu.tsx";
import { BottomNav } from "./BottomNav.tsx";
import { MobileMenu } from "./MobileMenu.tsx";
import { AppTour, type TourStep } from "./AppTour.tsx";
import { OnboardingDock } from "./OnboardingDock.tsx";

const TOUR_KEY = "mirae-tour-done";
const TOUR_STEPS: TourStep[] = [
  {
    target: "nav-overview",
    to: "/app/overview",
    title: "This is your Overview",
    body: "Your studio at a glance — active work, new requests, earnings. You always land here.",
  },
  {
    target: "onboarding-dock",
    to: "/app/overview",
    title: "Your setup progress",
    body: "This ring tracks your studio setup. Open it anytime to see what's left and jump straight there.",
    place: "top",
  },
  {
    target: "nav-studio-page",
    to: "/app/overview",
    title: "Your public studio",
    body: "The Studio page is everything visitors see at usemirae.com/@you — let's open it.",
  },
  {
    target: "studio-tabs",
    to: "/app/studio-page",
    title: "Set it all up here",
    body: "Profile, portfolio, links, commissions, appearance — switch tabs and the preview updates live.",
  },
  {
    target: "studio-view",
    to: "/app/studio-page",
    title: "Share your studio",
    body: "Preview it or open your public page anytime, then drop the link in your bio.",
  },
  {
    target: "nav-requests",
    to: "/app/overview",
    title: "Requests land here",
    body: "When someone requests a commission from your page, you'll manage it here — from brief to delivery.",
  },
];

const NAV_ROW = 36; // h-9
const NAV_STEP = NAV_ROW + 2; // + gap-0.5

// Mirae's product nav → the /app/* routes.
const NAV: { label: string; icon: IconData; to: string }[] = [
  { label: "Overview", icon: DashboardSquare01Icon, to: "/app/overview" },
  { label: "Requests", icon: InboxIcon, to: "/app/requests" },
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
  newRequests,
}: {
  collapsed: boolean;
  activeIndex: number;
  newRequests: number;
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
          data-tour={`nav-${item.to.replace("/app/", "")}`}
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
          {item.label === "Requests" && newRequests > 0 && !collapsed && (
            <Badge variant="accent" className="ml-auto mr-1">
              {newRequests}
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
  const [paletteOpen, setPaletteOpen] = useState(false);
  // First-run guided tour (skippable, shown once).
  const [tourOpen, setTourOpen] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem(TOUR_KEY),
  );

  // Start collapsed on small screens so the sidebar doesn't crowd the content.
  useEffect(() => {
    if (window.matchMedia("(max-width: 768px)").matches) setOpen(false);
  }, []);

  // ⌘K / Ctrl+K opens the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: requestsApi.list,
  });
  const newRequests = requests.filter((r) => r.status === "new").length;

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
      <a
        href="#main-content"
        className="sr-only rounded-md bg-fg px-3 py-2 text-sm font-medium text-canvas focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <aside
        className={cn(
          "hidden shrink-0 flex-col overflow-hidden border-r border-border transition-[width] duration-200 ease-out md:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <div className="flex h-14 items-center px-4">
          <span className="grid size-9 shrink-0 place-items-center">
            <Mark className="h-4 w-auto text-fg" />
          </span>
          <Label
            collapsed={collapsed}
            className="pl-1 font-semibold tracking-tight"
          >
            Mirae
          </Label>
        </div>

        <div className="px-4">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-full items-center rounded-md text-sm text-fg-subtle outline-none ring-1 ring-inset ring-border transition-[color,box-shadow] hover:text-fg hover:ring-border-strong focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <span className="grid size-9 shrink-0 place-items-center">
              <Icon icon={Search01Icon} size={16} strokeWidth={1.8} />
            </span>
            <Label collapsed={collapsed} className="flex-1 text-left">
              Search
            </Label>
            {!collapsed && (
              <kbd className="mr-2 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-fg-subtle">
                ⌘K
              </kbd>
            )}
          </button>
        </div>

        <div className="mt-3 flex-1 px-4">
          <NavList
            collapsed={collapsed}
            activeIndex={activeIndex}
            newRequests={newRequests}
          />
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
        <header
          className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm text-fg-muted"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-8 md:inline-flex"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Icon
              icon={open ? SidebarLeft01Icon : SidebarRight01Icon}
              size={18}
              strokeWidth={1.7}
            />
          </Button>
          {/* Mobile: mark + current page */}
          <div className="flex items-center gap-2 md:hidden">
            <Link to="/app/overview" aria-label="Mirae">
              <Mark className="h-4 w-auto text-fg" />
            </Link>
            <span className="text-fg-subtle">/</span>
            <span className="font-medium text-fg">{current}</span>
          </div>
          {/* Desktop: breadcrumb */}
          <span className="hidden md:inline">Studio</span>
          <span className="hidden text-fg-subtle md:inline">/</span>
          <span className="hidden text-fg md:inline">{current}</span>
          <div className="ml-auto flex items-center gap-1">
            <NotificationsMenu />
            <MobileMenu
              userName={userName}
              userEmail={userEmail}
              onSearch={() => setPaletteOpen(true)}
              onSignOut={handleSignOut}
            />
          </div>
        </header>

        <div
          id="main-content"
          data-lenis-prevent
          className="flex-1 overflow-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          {children}
        </div>
      </main>

      <BottomNav
        items={NAV}
        activeIndex={activeIndex}
        newRequests={newRequests}
      />

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <OnboardingDock />

      {tourOpen && (
        <AppTour
          steps={TOUR_STEPS}
          onClose={() => {
            localStorage.setItem(TOUR_KEY, "1");
            setTourOpen(false);
          }}
        />
      )}
    </div>
  );
}
