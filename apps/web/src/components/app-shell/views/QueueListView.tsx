import { Badge, cn } from "@mirae/ui";
import { COLUMNS, type Commission } from "../../mockups/seed.ts";

const ROWS = COLUMNS.flatMap((c) =>
  c.items.map((item) => ({ ...item, stage: c.name, dot: c.dot })),
);

export function QueueListView({
  onSelect,
}: {
  onSelect?: (c: Commission) => void;
}) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      {ROWS.map((r) => (
        <button
          type="button"
          key={r.client + r.type}
          onClick={() => onSelect?.(r)}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500"
        >
          <span className="size-7 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{r.type}</p>
            <p className="truncate text-xs text-fg-muted">{r.client}</p>
          </div>
          <div className="hidden items-center gap-1.5 md:flex">
            {r.tags.map((t) => (
              <Badge key={t.label} variant={t.variant}>
                {t.label}
              </Badge>
            ))}
          </div>
          <span className="hidden w-28 items-center gap-1.5 text-xs text-fg-muted sm:inline-flex">
            <span className={cn("size-1.5 rounded-full", r.dot)} />
            {r.stage}
          </span>
          <span className="w-20 text-right text-xs tabular-nums text-fg-muted">
            {r.due}
          </span>
          <span className="w-14 text-right text-sm font-semibold tabular-nums text-fg">
            {r.price}
          </span>
        </button>
      ))}
    </div>
  );
}
