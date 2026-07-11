import { useQuery } from "@tanstack/react-query";
import { Icon, cn } from "@mirae/ui";
import { CubeIcon } from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import { publicApi } from "../../lib/api.ts";
import { STATUS_META, dueLabel, euro } from "../../lib/commissions.ts";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-lg px-6 py-12">{children}</div>
      <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-1.5 px-6 pb-12 text-xs text-fg-subtle">
        <Icon icon={CubeIcon} size={13} />
        Powered by
        <Link to="/" className="font-medium text-fg-muted hover:text-fg">
          Mirae
        </Link>
      </div>
    </div>
  );
}

export function PortalPage({ token }: { token: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal", token],
    queryFn: () => publicApi.portal(token),
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle shadow-soft">
          Loading…
        </div>
      </Shell>
    );
  }

  if (isError || !data) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <h1 className="text-lg font-semibold text-fg">Nothing here</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            This portal link is invalid or has expired.
          </p>
        </div>
      </Shell>
    );
  }

  const { commission, artist, quote } = data;
  const meta = STATUS_META[commission.status];

  return (
    <Shell>
      <p className="text-sm text-fg-subtle">
        {artist ? `${artist.displayName}'s studio` : "Commission"}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">
        {commission.title}
      </h1>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-fg-muted ring-1 ring-border">
        <span className={cn("size-1.5 rounded-full", meta.dot)} />
        {meta.label}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs text-fg-subtle">Price</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-fg">
            {euro(commission.priceCents)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs text-fg-subtle">Paid</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-fg">
            {euro(commission.paidCents)}
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs text-fg-subtle">Deadline</p>
          <p className="mt-1 text-sm font-medium text-fg">
            {dueLabel(commission.deadline)}
          </p>
        </div>
      </div>

      {quote && (
        <div className="mt-3 rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">Quote</p>
            <span className="text-xs capitalize text-fg-muted">
              {quote.status}
            </span>
          </div>
          <p className="mt-1 text-lg font-semibold tabular-nums text-fg">
            {euro(quote.totalCents)}
          </p>
        </div>
      )}
    </Shell>
  );
}
