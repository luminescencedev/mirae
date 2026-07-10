import { motion } from "motion/react";
import { Badge, Icon, cn } from "@mirae/ui";
import { Add01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { COLUMNS, type Commission } from "../../mockups/seed.ts";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function CommissionCard({
  item,
  onSelect,
}: {
  item: Commission;
  onSelect?: (c: Commission) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="cursor-pointer rounded-lg border border-border bg-surface p-3 text-left shadow-soft outline-none transition-shadow hover:shadow-panel focus-visible:ring-2 focus-visible:ring-accent-500"
    >
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
    </button>
  );
}

export function QueueView({
  onSelect,
}: {
  onSelect?: (c: Commission) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col, ci) => (
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
            <span className="text-xs text-fg-subtle">{col.count}</span>
            <div className="ml-auto flex items-center gap-1 text-fg-subtle">
              <button className="rounded p-0.5 hover:text-fg">
                <Icon icon={Add01Icon} size={16} strokeWidth={1.8} />
              </button>
              <button className="rounded p-0.5 hover:text-fg">
                <Icon icon={MoreHorizontalIcon} size={16} strokeWidth={1.8} />
              </button>
            </div>
          </div>
          {col.items.map((it) => (
            <CommissionCard
              key={it.client + it.type}
              item={it}
              onSelect={onSelect}
            />
          ))}
        </motion.section>
      ))}
    </div>
  );
}
