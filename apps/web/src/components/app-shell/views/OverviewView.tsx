import { motion } from "motion/react";
import { Badge, Button, Icon } from "@mirae/ui";
import { ACTIVITY, NEEDS_ATTENTION, STATS } from "../../mockups/seed.ts";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function OverviewView() {
  return (
    <div className="flex flex-col gap-6">
      {/* KPI stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
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
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-fg tabular-nums">
                {s.value}
              </span>
              {s.delta && (
                <span
                  className={
                    s.positive === false
                      ? "text-xs font-medium text-rose-600"
                      : "text-xs font-medium text-emerald-600"
                  }
                >
                  {s.delta}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Needs attention */}
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold">Needs your attention</h2>
            <Badge variant="amber">{NEEDS_ATTENTION.length}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {NEEDS_ATTENTION.map((c) => (
              <div
                key={c.client + c.type}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-soft"
              >
                <span className="size-8 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">
                    {c.type}
                  </p>
                  <p className="truncate text-xs text-fg-muted">
                    {c.client} · {c.due}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {c.price}
                </span>
                <Button size="sm">Send quote</Button>
              </div>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
          <div className="rounded-xl border border-border bg-surface p-1 shadow-soft">
            {ACTIVITY.map((a) => (
              <div
                key={a.text}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-sunken text-fg-muted">
                  <Icon icon={a.icon} size={15} strokeWidth={1.8} />
                </span>
                <p className="flex-1 text-sm leading-snug text-fg">{a.text}</p>
                <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
