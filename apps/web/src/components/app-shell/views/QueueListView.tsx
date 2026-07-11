import { cn } from "@mirae/ui";
import { type QueueCommission } from "../../../lib/api.ts";
import { STATUS_META, dueLabel, euro } from "../../../lib/commissions.ts";

export function QueueListView({
  commissions,
  onSelect,
}: {
  commissions: QueueCommission[];
  onSelect?: (c: QueueCommission) => void;
}) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      {commissions.length === 0 ? (
        <div className="grid place-items-center p-12 text-sm text-fg-subtle">
          No commissions yet.
        </div>
      ) : (
        commissions.map((r) => {
          const meta = STATUS_META[r.status];
          return (
            <button
              type="button"
              key={r.id}
              onClick={() => onSelect?.(r)}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500"
            >
              <span className="size-7 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {r.title}
                </p>
                <p className="truncate text-xs text-fg-muted">
                  {r.clientName ?? "—"}
                </p>
              </div>
              <span className="hidden w-28 items-center gap-1.5 text-xs text-fg-muted sm:inline-flex">
                <span className={cn("size-1.5 rounded-full", meta.dot)} />
                {meta.label}
              </span>
              <span className="w-20 text-right text-xs tabular-nums text-fg-muted">
                {dueLabel(r.deadline)}
              </span>
              <span className="w-14 text-right text-sm font-semibold tabular-nums text-fg">
                {euro(r.priceCents)}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
