import { useState } from "react";
import { motion } from "motion/react";
import { Button, Icon, cn } from "@mirae/ui";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { type QueueCommission } from "../../../lib/api.ts";
import { STATUS_META, dueLabel, euro } from "../../../lib/commissions.ts";

const WEEKDAYS = [
  { short: "M", long: "Mon" },
  { short: "T", long: "Tue" },
  { short: "W", long: "Wed" },
  { short: "T", long: "Thu" },
  { short: "F", long: "Fri" },
  { short: "S", long: "Sat" },
  { short: "S", long: "Sun" },
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// yyyy-m-d key in local time.
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function QueueCalendarView({
  commissions,
  onSelect,
}: {
  commissions: QueueCommission[];
  onSelect?: (c: QueueCommission) => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState<string>(dayKey(today));

  // Bucket commissions by deadline day.
  const byDay = new Map<string, QueueCommission[]>();
  for (const c of commissions) {
    if (!c.deadline) continue;
    const k = dayKey(new Date(c.deadline));
    const arr = byDay.get(k) ?? [];
    arr.push(c);
    byDay.set(k, arr);
  }

  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  };
  const goToday = () => {
    setMonth(today.getMonth());
    setYear(today.getFullYear());
    setSelected(dayKey(today));
  };

  const withDeadlines = commissions.filter((c) => c.deadline).length;
  const selectedItems = byDay.get(selected) ?? [];
  const selectedDate = (() => {
    const [y, m, d] = selected.split("-").map(Number);
    return new Date(y, m, d);
  })();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Calendar */}
      <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface p-3 shadow-soft sm:p-4">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight">
            {MONTHS[month]} {year}
          </h3>
          <span className="hidden text-xs text-fg-subtle sm:inline">
            {withDeadlines} with a deadline
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Previous month"
              onClick={() => shift(-1)}
            >
              <Icon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Next month"
              onClick={() => shift(1)}
            >
              <Icon icon={ArrowRight01Icon} size={16} strokeWidth={1.8} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d, i) => (
            <div
              key={i}
              className="pb-1 text-center text-[11px] font-medium text-fg-subtle"
            >
              <span className="sm:hidden">{d.short}</span>
              <span className="hidden sm:inline">{d.long}</span>
            </div>
          ))}
          {cells.map((day, i) => {
            if (day == null)
              return <div key={`e${i}`} className="rounded-lg" />;
            const date = new Date(year, month, day);
            const key = dayKey(date);
            const items = byDay.get(key) ?? [];
            const isToday = key === dayKey(today);
            const isSelected = key === selected;
            return (
              <button
                type="button"
                key={day}
                onClick={() => setSelected(key)}
                className={cn(
                  "flex min-h-11 flex-col rounded-lg border p-1 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 sm:min-h-20 sm:p-1.5",
                  isSelected
                    ? "border-accent-500 bg-accent-50/60 ring-1 ring-accent-500"
                    : isToday
                      ? "border-accent-500/40 bg-accent-50/40"
                      : items.length
                        ? "border-border bg-surface-muted/40 hover:border-border-strong"
                        : "border-transparent hover:bg-surface-muted/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center text-xs tabular-nums sm:size-auto sm:place-items-start",
                    isToday
                      ? "font-semibold text-accent-700"
                      : "text-fg-subtle",
                  )}
                >
                  {isToday ? (
                    <span className="grid size-5 place-items-center rounded-full bg-accent-500 text-[11px] font-semibold text-white sm:size-5">
                      {day}
                    </span>
                  ) : (
                    day
                  )}
                </span>

                {/* Desktop: event pills */}
                {items.length > 0 && (
                  <div className="mt-1 hidden flex-col gap-1 sm:flex">
                    {items.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="flex items-center gap-1 truncate rounded bg-surface px-1 py-0.5 text-[11px] text-fg shadow-soft"
                      >
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            STATUS_META[c.status].dot,
                          )}
                        />
                        <span className="truncate">{c.title}</span>
                      </span>
                    ))}
                    {items.length > 3 && (
                      <span className="px-1 text-[10px] text-fg-subtle">
                        +{items.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Mobile: colored dots */}
                {items.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-0.5 pt-0.5 sm:hidden">
                    {items.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className={cn(
                          "size-1.5 rounded-full",
                          STATUS_META[c.status].dot,
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected-day agenda */}
      <aside className="w-full shrink-0 rounded-xl border border-border bg-surface p-4 shadow-soft lg:w-72">
        <p className="text-sm font-semibold tracking-tight">
          {selectedDate.toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <p className="mt-0.5 text-xs text-fg-subtle">
          {selectedItems.length === 0
            ? "No deadlines"
            : `${selectedItems.length} deadline${selectedItems.length === 1 ? "" : "s"}`}
        </p>

        {selectedItems.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {selectedItems.map((c) => (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => onSelect?.(c)}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted/40 px-3 py-2.5 text-left outline-none transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <span
                  className={cn(
                    "mt-0.5 size-2 shrink-0 rounded-full",
                    STATUS_META[c.status].dot,
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg">
                    {c.title}
                  </span>
                  <span className="block truncate text-xs text-fg-subtle">
                    {c.clientName ?? "—"} · {dueLabel(c.deadline)}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-fg">
                  {euro(c.priceCents)}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
