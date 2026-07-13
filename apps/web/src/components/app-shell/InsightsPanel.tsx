import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ErrorState, LoadingState, cn } from "@mirae/ui";
import { analyticsApi } from "../../lib/api.ts";

const EASE = [0.23, 1, 0.32, 1] as const;

export function InsightsPanel() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: analyticsApi.get,
  });

  if (isLoading) return <LoadingState label="Loading insights…" />;
  if (isError || !data)
    return (
      <ErrorState hint="Couldn’t load insights." onRetry={() => refetch()} />
    );

  const stats = [
    { label: "Views", value: data.views, sub: `${data.uniqueViews} unique` },
    { label: "Link clicks", value: data.linkClicks, sub: "outbound" },
    {
      label: "Requests",
      value: data.requestSubmits,
      sub: `${data.requestStarts} started`,
    },
    {
      label: "Conversion",
      value: `${data.conversion}%`,
      sub: "views → requests",
    },
  ];

  const max = Math.max(1, ...data.byDay.map((d) => d.count));

  return (
    <section className="flex flex-col gap-6">
      <p className="text-sm text-fg-subtle">
        Last 30 days · privacy-friendly (no cookies, no personal data).
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
            className="rounded-xl border border-border bg-surface p-4 shadow-soft"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
              {s.label}
            </span>
            <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-fg">
              {s.value}
            </div>
            <div className="mt-0.5 text-xs text-fg-subtle">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Views over time */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
        <p className="mb-3 text-sm font-semibold text-fg">
          Views · last 14 days
        </p>
        <div className="flex h-28 items-end gap-1">
          {data.byDay.map((d) => (
            <div
              key={d.day}
              className="group relative flex flex-1 flex-col justify-end"
              title={`${d.day}: ${d.count}`}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.count / max) * 100}%` }}
                transition={{ duration: 0.4, ease: EASE }}
                className={cn(
                  "w-full rounded-t bg-accent-500/80",
                  d.count === 0 && "bg-surface-muted",
                )}
                style={{ minHeight: 2 }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-fg-subtle">
          <span>{data.byDay[0]?.day.slice(5)}</span>
          <span>{data.byDay.at(-1)?.day.slice(5)}</span>
        </div>
      </div>

      {/* Top referrers */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
        <p className="mb-3 text-sm font-semibold text-fg">Top referrers</p>
        {data.topReferrers.length === 0 ? (
          <p className="text-sm text-fg-subtle">
            No referrer data yet — shares will show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.topReferrers.map((r) => (
              <li
                key={r.host}
                className="flex items-center gap-3 text-sm text-fg"
              >
                <span className="min-w-0 flex-1 truncate">{r.host}</span>
                <span className="tabular-nums text-fg-subtle">{r.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
