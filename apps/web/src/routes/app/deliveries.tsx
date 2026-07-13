import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, Icon, LoadingState } from "@mirae/ui";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { commissionsApi } from "../../lib/api.ts";
import { dueLabel, euro } from "../../lib/commissions.ts";

function DeliveriesView() {
  const {
    data: commissions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["commissions"], queryFn: commissionsApi.list });

  const delivered = commissions.filter((c) => c.status === "delivered");

  if (isLoading) return <LoadingState label="Loading deliveries…" />;
  if (isError)
    return (
      <ErrorState hint="Couldn’t load deliveries." onRetry={() => refetch()} />
    );
  if (delivered.length === 0)
    return (
      <EmptyState
        title="No deliveries yet"
        hint="Commissions you mark as delivered show up here."
        action={
          <Link
            to="/app/queue"
            className="text-sm font-medium text-accent-700 hover:text-accent-800"
          >
            Go to the queue
          </Link>
        }
      />
    );

  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      {delivered.map((c) => (
        <Link
          key={c.id}
          to="/app/queue"
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon icon={CheckmarkCircle02Icon} size={18} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{c.title}</p>
            <p className="truncate text-xs text-fg-muted">
              {c.clientName ?? "—"}
            </p>
          </div>
          <span className="w-20 text-right text-xs tabular-nums text-fg-muted">
            {dueLabel(c.deadline)}
          </span>
          <span className="w-16 text-right text-sm font-semibold tabular-nums text-fg">
            {euro(c.priceCents)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function Deliveries() {
  return (
    <>
      <PageHeader title="Deliveries" subtitle="Commissions you've delivered." />
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <DeliveriesView />
      </div>
    </>
  );
}

export const Route = createFileRoute("/app/deliveries")({
  component: Deliveries,
});
