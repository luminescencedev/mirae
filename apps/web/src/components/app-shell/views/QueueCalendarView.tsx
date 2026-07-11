import { useState } from "react";
import { Button, Icon, cn } from "@mirae/ui";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { type QueueCommission } from "../../../lib/api.ts";
import { STATUS_META } from "../../../lib/commissions.ts";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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

// yyyy-mm-dd key in local time.
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
  // Monday-first offset.
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shift = (delta: number) => {
    const m = month + delta;
    if (m < 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else if (m > 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth(m);
  };

  const withDeadlines = commissions.filter((c) => c.deadline).length;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-sm font-semibold">
          {MONTHS[month]} {year}
        </h3>
        <span className="text-xs text-fg-subtle">
          {withDeadlines} with a deadline
        </span>
        <div className="ml-auto flex gap-1">
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
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-1 pb-1 text-center text-xs font-medium text-fg-subtle"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day == null)
            return <div key={`e${i}`} className="min-h-20 rounded-lg" />;
          const date = new Date(year, month, day);
          const items = byDay.get(dayKey(date)) ?? [];
          const isToday = dayKey(date) === dayKey(today);
          return (
            <div
              key={day}
              className={cn(
                "min-h-20 rounded-lg border border-border p-1.5",
                isToday ? "bg-accent-50" : "bg-surface-muted/40",
              )}
            >
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isToday ? "font-semibold text-accent-700" : "text-fg-subtle",
                )}
              >
                {day}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {items.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelect?.(c)}
                    className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] text-fg outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        STATUS_META[c.status].dot,
                      )}
                    />
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
                {items.length > 3 && (
                  <span className="px-1 text-[10px] text-fg-subtle">
                    +{items.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
