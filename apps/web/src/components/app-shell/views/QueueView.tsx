import { motion } from "motion/react";
import { cn } from "@mirae/ui";
import { type QueueCommission } from "../../../lib/api.ts";
import {
  STATUS_META,
  dueLabel,
  euro,
  groupByColumn,
} from "../../../lib/commissions.ts";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function CommissionCard({
  item,
  onSelect,
}: {
  item: QueueCommission;
  onSelect?: (c: QueueCommission) => void;
}) {
  const meta = STATUS_META[item.status];
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="cursor-pointer rounded-lg border border-border bg-surface p-3 text-left shadow-soft outline-none transition-shadow hover:shadow-panel focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <div className="flex items-center gap-2">
        <span className="size-5 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
        <span className="text-xs text-fg-muted">
          {item.clientName ?? "—"}
        </span>
      </div>
      <h4 className="mt-2 text-sm font-medium tracking-tight text-fg">
        {item.title}
      </h4>
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-2.5 text-xs text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>
        <span className="ml-auto tabular-nums">{dueLabel(item.deadline)}</span>
        <span className="font-semibold text-fg tabular-nums">
          {euro(item.priceCents)}
        </span>
      </div>
    </button>
  );
}

export function QueueView({
  commissions,
  onSelect,
}: {
  commissions: QueueCommission[];
  onSelect?: (c: QueueCommission) => void;
}) {
  const columns = groupByColumn(commissions);
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {columns.map((col, ci) => (
        <motion.section
          key={col.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: ci * 0.07, ease: EASE_OUT }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 px-1">
            <span className={cn("size-1.5 rounded-full", col.dot)} />
            <span className="text-sm font-semibold">{col.name}</span>
            <span className="text-xs text-fg-subtle">{col.items.length}</span>
          </div>
          {col.items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-fg-subtle">
              Empty
            </div>
          ) : (
            col.items.map((it) => (
              <CommissionCard key={it.id} item={it} onSelect={onSelect} />
            ))
          )}
        </motion.section>
      ))}
    </div>
  );
}
