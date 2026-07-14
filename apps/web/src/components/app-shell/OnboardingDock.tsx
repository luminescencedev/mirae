import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Icon, cn, useToast } from "@mirae/ui";
import {
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import {
  artistApi,
  commissionTypesApi,
  linksApi,
  portfolioApi,
} from "../../lib/api.ts";

const DISMISS_KEY = "mirae-onboarding-dismissed";
const EASE = [0.23, 1, 0.32, 1] as const;

/** Persistent floating onboarding widget (bottom-right): a green progress ring
 *  you can expand into the step list. Auto-hides when complete or dismissed. */
export function OnboardingDock() {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISS_KEY) === "1",
  );
  const [open, setOpen] = useState(false);

  const profileQ = useQuery({ queryKey: ["artist", "me"], queryFn: artistApi.me });
  const typesQ = useQuery({
    queryKey: ["commission-types"],
    queryFn: commissionTypesApi.list,
  });
  const portfolioQ = useQuery({
    queryKey: ["portfolio"],
    queryFn: portfolioApi.list,
  });
  const linksQ = useQuery({ queryKey: ["artist-links"], queryFn: linksApi.list });

  const profile = profileQ.data;
  if (dismissed || !profile) return null;

  const steps = [
    {
      label: "Add your photo & bio",
      done: !!profile.avatarR2Key && !!profile.bio,
    },
    { label: "Create a commission type", done: (typesQ.data?.length ?? 0) > 0 },
    {
      label: "Publish a project",
      done:
        (portfolioQ.data?.filter((p) => p.visibility === "published").length ??
          0) > 0,
    },
    { label: "Add your links", done: (linksQ.data?.length ?? 0) > 0 },
    { label: "Open for commissions", done: profile.status === "open" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = Math.round((doneCount / total) * 100);
  if (doneCount === total) return null; // fully set up

  const share = async () => {
    const url = `${window.location.origin}/@${profile.handle}`;
    try {
      await navigator.clipboard?.writeText(url);
      toast({ title: "Studio link copied", variant: "success" });
    } catch {
      toast({ title: url });
    }
  };

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-3"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) + 5rem)",
      }}
      data-tour="onboarding-dock"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="w-[min(19rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl border border-border bg-surface shadow-panel"
          >
            <div className="flex items-center gap-3 border-b border-border p-4">
              <ProgressRing pct={pct} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-tight text-fg">
                  Set up your studio
                </p>
                <p className="text-xs text-fg-subtle">
                  {doneCount} of {total} done
                </p>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => {
                  localStorage.setItem(DISMISS_KEY, "1");
                  setDismissed(true);
                }}
                className="grid size-7 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
              >
                <Icon icon={Cancel01Icon} size={15} />
              </button>
            </div>

            <ul className="flex flex-col p-2">
              {steps.map((s, i) => (
                <li key={s.label}>
                  <Link
                    to="/app/studio-page"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-500",
                    )}
                  >
                    <span className="grid size-5 shrink-0 place-items-center">
                      <AnimatePresence mode="wait" initial={false}>
                        {s.done ? (
                          <motion.span
                            key="done"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              bounce: 0.5,
                              duration: 0.4,
                              delay: i * 0.04,
                            }}
                            className="text-emerald-600"
                          >
                            <Icon
                              icon={CheckmarkCircle02Icon}
                              size={20}
                              strokeWidth={1.8}
                            />
                          </motion.span>
                        ) : (
                          <span
                            key="todo"
                            className="size-4 rounded-full border border-border-strong"
                          />
                        )}
                      </AnimatePresence>
                    </span>
                    <span
                      className={cn(
                        "flex-1",
                        s.done
                          ? "text-fg-muted line-through decoration-fg-subtle/50"
                          : "text-fg",
                      )}
                    >
                      {s.label}
                    </span>
                    {!s.done && (
                      <Icon
                        icon={ArrowRight01Icon}
                        size={15}
                        strokeWidth={1.8}
                        className="text-fg-subtle transition-transform group-hover:translate-x-0.5"
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={share}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-fg outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-500 active:scale-[0.99]"
              >
                <Icon icon={Copy01Icon} size={15} strokeWidth={1.8} />
                Copy studio link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle — the progress ring, always visible */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "Hide setup" : "Studio setup"}
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-3 shadow-panel outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <ProgressRing pct={pct} small />
        <span className="text-sm font-medium text-fg">
          Setup {doneCount}/{total}
        </span>
      </motion.button>
    </div>
  );
}

function ProgressRing({ pct, small }: { pct: number; small?: boolean }) {
  const size = small ? 32 : 40;
  return (
    <span
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-surface-muted"
          strokeWidth="3.5"
        />
        <motion.circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-emerald-500"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={100}
          initial={false}
          animate={{ strokeDasharray: `${pct} 100` }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </svg>
      <span
        className={cn(
          "absolute font-semibold tabular-nums text-fg",
          small ? "text-[10px]" : "text-xs",
        )}
      >
        {pct}%
      </span>
    </span>
  );
}
