import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, cn, dayKey } from "@mirae/ui";
import { type QueueCommission } from "../../../lib/api.ts";
import { STATUS_META, dueLabel, euro } from "../../../lib/commissions.ts";

const EASE = [0.23, 1, 0.32, 1] as const;

export function QueueCalendarView({
  commissions,
  onSelect,
}: {
  commissions: QueueCommission[];
  onSelect?: (c: QueueCommission) => void;
}) {
  const today = new Date();
  const [selected, setSelected] = useState<Date>(today);

  // Deadlines bucketed by day + a marker map for the calendar dots.
  const byDay = new Map<string, QueueCommission[]>();
  for (const c of commissions) {
    if (!c.deadline) continue;
    const k = dayKey(new Date(c.deadline));
    (byDay.get(k) ?? byDay.set(k, []).get(k)!).push(c);
  }
  const markers = new Map<string, string[]>();
  for (const [k, items] of byDay)
    markers.set(
      k,
      items.map((c) => STATUS_META[c.status].dot),
    );

  const selectedItems = byDay.get(dayKey(selected)) ?? [];

  // Upcoming deadlines (from today) — fills the agenda when the selected day
  // has none, so the panel is never empty.
  const startToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const upcoming = commissions
    .filter((c) => c.deadline && new Date(c.deadline).getTime() >= startToday)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, 6);

  const AgendaRow = ({
    c,
    i,
    showDate,
  }: {
    c: QueueCommission;
    i: number;
    showDate?: boolean;
  }) => (
    <motion.button
      type="button"
      onClick={() => onSelect?.(c)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: i * 0.04, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/40 px-3 py-2.5 text-left outline-none transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          STATUS_META[c.status].dot,
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">
          {c.title}
        </span>
        <span className="block truncate text-xs text-fg-subtle">
          {c.clientName ?? "—"}
          {showDate && c.deadline
            ? ` · ${new Date(c.deadline).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })}`
            : ` · ${dueLabel(c.deadline)}`}
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-fg">
        {euro(c.priceCents)}
      </span>
    </motion.button>
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 lg:flex-row lg:items-start">
      {/* Calendar */}
      <div className="min-w-0 flex-1 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-6">
        <Calendar
          size="lg"
          selected={selected}
          onSelect={setSelected}
          markers={markers}
        />
      </div>

      {/* Agenda — selected day, or upcoming when the day is empty */}
      <aside className="w-full shrink-0 rounded-2xl border border-border bg-surface p-4 shadow-soft lg:w-80">
        <p className="text-sm font-semibold tracking-tight text-fg">
          {selected.toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <p className="mt-0.5 text-xs text-fg-subtle">
          {selectedItems.length === 0
            ? "No deadlines this day"
            : `${selectedItems.length} deadline${selectedItems.length === 1 ? "" : "s"}`}
        </p>

        {selectedItems.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2">
            {selectedItems.map((c, i) => (
              <AgendaRow key={c.id} c={c} i={i} />
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">
              Upcoming
            </p>
            <div className="flex flex-col gap-2">
              {upcoming.map((c, i) => (
                <AgendaRow key={c.id} c={c} i={i} showDate />
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-fg-subtle">
            No upcoming deadlines. Set one on a commission.
          </p>
        )}
      </aside>
    </div>
  );
}
