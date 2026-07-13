import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge, ErrorState, Icon, LoadingState, cn } from "@mirae/ui";
import {
  CheckmarkCircle02Icon,
  InboxIcon,
  Money03Icon,
  PaintBrush01Icon,
} from "@hugeicons/core-free-icons";
import { commissionsApi, requestsApi } from "../../../lib/api.ts";
import { STATUS_META, dueLabel, euro } from "../../../lib/commissions.ts";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function OverviewView() {
  const commissionsQ = useQuery({
    queryKey: ["commissions"],
    queryFn: commissionsApi.list,
  });
  const requestsQ = useQuery({
    queryKey: ["requests"],
    queryFn: requestsApi.list,
  });

  if (commissionsQ.isLoading || requestsQ.isLoading)
    return <LoadingState label="Loading your studio…" />;
  if (commissionsQ.isError || requestsQ.isError)
    return (
      <ErrorState
        hint="Couldn’t load your studio."
        onRetry={() => {
          commissionsQ.refetch();
          requestsQ.refetch();
        }}
      />
    );

  const commissions = commissionsQ.data ?? [];
  const requests = requestsQ.data ?? [];

  const active = commissions.filter(
    (c) => c.status !== "delivered" && c.status !== "archived",
  );
  const newRequests = requests.filter((r) => r.status === "new");
  const delivered = commissions.filter((c) => c.status === "delivered").length;
  const earnedCents = commissions.reduce((s, c) => s + (c.paidCents ?? 0), 0);

  const stats: { label: string; value: string; icon: typeof InboxIcon }[] = [
    { label: "Active", value: String(active.length), icon: PaintBrush01Icon },
    {
      label: "New requests",
      value: String(newRequests.length),
      icon: InboxIcon,
    },
    {
      label: "Delivered",
      value: String(delivered),
      icon: CheckmarkCircle02Icon,
    },
    { label: "Earned", value: euro(earnedCents), icon: Money03Icon },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: EASE_OUT }}
            className="rounded-xl border border-border bg-surface p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
                {s.label}
              </span>
              <span className="flex size-7 items-center justify-center rounded-md bg-surface-sunken text-fg-muted">
                <Icon icon={s.icon} size={16} strokeWidth={1.8} />
              </span>
            </div>
            <div className="mt-2.5 text-2xl font-semibold tracking-tight tabular-nums text-fg">
              {s.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* New requests */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold">New requests</h2>
            <Badge variant="amber">{newRequests.length}</Badge>
            <Link
              to="/app/requests"
              className="ml-auto text-xs font-medium text-accent-700 hover:text-accent-800"
            >
              View all
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-surface shadow-soft">
            {newRequests.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-fg-subtle">
                No new requests.
              </p>
            ) : (
              newRequests.slice(0, 5).map((r, i) => (
                <Link
                  key={r.id}
                  to="/app/requests"
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <span className="size-8 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">
                      {r.clientName}
                    </p>
                    <p className="truncate text-xs text-fg-muted">
                      {r.commissionTypeName ?? "No type"}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Active commissions */}
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold">Active commissions</h2>
            <span className="text-xs text-fg-subtle">{active.length}</span>
            <Link
              to="/app/queue"
              className="ml-auto text-xs font-medium text-accent-700 hover:text-accent-800"
            >
              Open queue
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
            {active.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-fg-subtle">
                No active commissions yet.
              </p>
            ) : (
              active.slice(0, 6).map((c, i) => {
                const meta = STATUS_META[c.status];
                return (
                  <Link
                    key={c.id}
                    to="/app/queue"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted",
                      i > 0 && "border-t border-border",
                    )}
                  >
                    <span className="size-7 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">
                        {c.title}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {c.clientName ?? "—"}
                      </p>
                    </div>
                    <span className="hidden items-center gap-1.5 text-xs text-fg-muted sm:inline-flex">
                      <span className={cn("size-1.5 rounded-full", meta.dot)} />
                      {meta.label}
                    </span>
                    <span className="w-16 text-right text-xs tabular-nums text-fg-muted">
                      {dueLabel(c.deadline)}
                    </span>
                    <span className="w-14 text-right text-sm font-semibold tabular-nums text-fg">
                      {euro(c.priceCents)}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
