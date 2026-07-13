import { Badge, Button, Icon, Mark } from "@mirae/ui";
import {
  DashboardSquare01Icon,
  InboxIcon,
  Notification03Icon,
  Package01Icon,
  PaintBrush01Icon,
  PanelLeftIcon,
  Search01Icon,
  Store01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { ACTIVITY, NEEDS_ATTENTION, STATS } from "../mockups/seed.ts";

const NAV = [
  {
    label: "Overview",
    icon: DashboardSquare01Icon,
    badge: undefined as number | undefined,
  },
  { label: "Requests", icon: InboxIcon, badge: 3 },
  { label: "Queue", icon: PaintBrush01Icon, badge: undefined },
  { label: "Clients", icon: UserGroupIcon, badge: undefined },
  { label: "Deliveries", icon: Package01Icon, badge: undefined },
  { label: "Studio page", icon: Store01Icon, badge: undefined },
];

/**
 * Static, non-interactive "screenshot" of the dashboard for the landing hero.
 * Deliberately limited — no collapse/view-switching/state — just the look of
 * the product. The real shell lives at /app (components/app-shell/AppShell).
 */
export function DashboardPreview() {
  return (
    <div className="flex h-full w-full select-none overflow-hidden bg-canvas text-fg">
      {/* Sidebar (static, expanded) */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <Mark className="h-5 w-auto text-fg" />
          <span className="text-sm font-semibold tracking-tight">Mirae</span>
        </div>
        <div className="px-4">
          <div className="flex h-9 cursor-pointer items-center gap-2 rounded-md px-2.5 text-sm text-fg-subtle ring-1 ring-inset ring-border transition hover:ring-border-strong active:scale-[0.99]">
            <Icon icon={Search01Icon} size={16} strokeWidth={1.8} />
            Search
          </div>
        </div>
        <nav className="mt-3 flex flex-col gap-0.5 px-4">
          {NAV.map((n, i) => (
            <div
              key={n.label}
              className={
                i === 0
                  ? "flex h-9 cursor-pointer items-center gap-2.5 rounded-md bg-surface-sunken px-2.5 text-sm font-medium text-fg transition active:scale-[0.98]"
                  : "flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm font-medium text-fg-muted transition hover:bg-surface-muted hover:text-fg active:scale-[0.98]"
              }
            >
              <Icon icon={n.icon} size={18} strokeWidth={1.7} />
              <span>{n.label}</span>
              {n.badge != null && (
                <Badge variant="accent" className="ml-auto">
                  {n.badge}
                </Badge>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 border-t border-border px-4 py-3">
          <span className="size-8 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Rain Aoki</p>
            <p className="truncate text-xs text-fg-subtle">Studio · Pro</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm text-fg-muted">
          <span className="flex size-8 cursor-pointer items-center justify-center rounded-md text-fg-subtle transition hover:bg-surface-muted hover:text-fg active:scale-95">
            <Icon icon={PanelLeftIcon} size={18} strokeWidth={1.7} />
          </span>
          <span>Studio</span>
          <span className="text-fg-subtle">/</span>
          <span className="text-fg">Overview</span>
          <span className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-md text-fg-subtle transition hover:bg-surface-muted hover:text-fg active:scale-95">
            <Icon icon={Notification03Icon} size={18} strokeWidth={1.7} />
          </span>
        </div>

        <div className="px-6 pt-6">
          <h1 className="text-2xl font-semibold tracking-tight">Hello, Rain</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Here's your studio today.
          </p>
        </div>

        <div className="flex flex-col gap-6 px-6 py-6">
          {/* KPI stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="cursor-pointer rounded-xl border border-border bg-surface p-4 shadow-soft transition hover:shadow-panel active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
                    {s.label}
                  </span>
                  <span className="flex size-7 items-center justify-center rounded-md bg-surface-sunken text-fg-muted">
                    <Icon icon={s.icon} size={16} strokeWidth={1.8} />
                  </span>
                </div>
                <div className="mt-2.5 text-2xl font-semibold tracking-tight tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            <section className="lg:col-span-3">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold">New requests</h2>
                <Badge variant="amber">{NEEDS_ATTENTION.length}</Badge>
              </div>
              <div className="flex flex-col gap-2">
                {NEEDS_ATTENTION.map((c) => (
                  <div
                    key={c.client + c.type}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-soft transition hover:shadow-panel active:scale-[0.99]"
                  >
                    <span className="size-8 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.type}</p>
                      <p className="truncate text-xs text-fg-muted">
                        {c.client} · {c.due}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {c.price}
                    </span>
                    <Button size="sm">Send quote</Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="lg:col-span-2">
              <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
              <div className="rounded-xl border border-border bg-surface p-1 shadow-soft">
                {ACTIVITY.map((a) => (
                  <div
                    key={a.text}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-surface-muted active:scale-[0.99]"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-fg-muted">
                      <Icon icon={a.icon} size={15} strokeWidth={1.8} />
                    </span>
                    <p className="flex-1 text-sm leading-snug">{a.text}</p>
                    <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                      {a.time}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
