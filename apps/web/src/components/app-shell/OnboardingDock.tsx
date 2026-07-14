import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Icon, Mark, cn, useToast } from "@mirae/ui";
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

const EASE = [0.23, 1, 0.32, 1] as const;

/** Persistent floating onboarding widget (bottom-right): a gradient progress
 *  ring you can expand into the step list. Stays until setup is complete;
 *  collapse/expand only (no permanent dismiss). */
export function OnboardingDock() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  // Draggable dock — remember which corner it settled in so the panel opens
  // inward (never off-screen).
  const boundsRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  // Set while dragging so the post-drag synthetic click doesn't toggle open.
  const draggingRef = useRef(false);
  const [place, setPlace] = useState<{ v: "up" | "down"; h: "left" | "right" }>(
    { v: "up", h: "right" },
  );
  const updatePlace = () => {
    const el = dockRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPlace({
      v: r.top + r.height / 2 > window.innerHeight / 2 ? "up" : "down",
      h: r.left + r.width / 2 > window.innerWidth / 2 ? "right" : "left",
    });
  };
  // Literal classes so Tailwind JIT keeps them.
  const ORIGIN = {
    "up-right": "origin-bottom-right",
    "up-left": "origin-bottom-left",
    "down-right": "origin-top-right",
    "down-left": "origin-top-left",
  } as const;

  const profileQ = useQuery({
    queryKey: ["artist", "me"],
    queryFn: artistApi.me,
  });
  const typesQ = useQuery({
    queryKey: ["commission-types"],
    queryFn: commissionTypesApi.list,
  });
  const portfolioQ = useQuery({
    queryKey: ["portfolio"],
    queryFn: portfolioApi.list,
  });
  const linksQ = useQuery({
    queryKey: ["artist-links"],
    queryFn: linksApi.list,
  });

  const profile = profileQ.data;
  if (!profile) return null;

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

  // Allowed drag box — excludes the top header and bottom tab bar so the dock
  // can only live in the central area, never over the chrome.
  return (
    <div
      ref={boundsRef}
      className="pointer-events-none fixed inset-x-3 bottom-20 top-[calc(env(safe-area-inset-top)+3.75rem)] z-40 md:bottom-4"
    >
      <motion.div
        ref={dockRef}
        drag
        dragConstraints={boundsRef}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={() => {
          draggingRef.current = true;
        }}
        onDragEnd={updatePlace}
        data-tour="onboarding-dock"
        className="pointer-events-auto absolute bottom-0 right-0"
      >
        {/* Panel is absolute → opening never resizes/moves the toggle. */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: EASE }}
              className={cn(
                "absolute w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-panel",
                place.v === "up" ? "bottom-full mb-3" : "top-full mt-3",
                place.h === "right" ? "right-0" : "left-0",
                ORIGIN[`${place.v}-${place.h}`],
              )}
            >
              <div className="relative border-b border-border p-5 text-center">
                <button
                  type="button"
                  aria-label="Collapse"
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-3 grid size-7 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
                >
                  <Icon icon={Cancel01Icon} size={15} />
                </button>
                <Mark className="mx-auto mb-3 h-5 w-auto text-fg" />
                <p className="text-base font-semibold tracking-tight text-fg">
                  You're almost there
                </p>
                <p className="mx-auto mt-1 max-w-[15rem] text-xs text-fg-subtle">
                  Finish setup, then share your studio.
                </p>
                <SegmentedBar pct={pct} className="mt-4 justify-center" />
                <p className="mt-2 text-xs font-medium text-accent-700">
                  {pct}% complete
                </p>
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

        {/* Toggle — always visible. Draggable handle: hold to move, tap to
            open; the post-drag click is swallowed. */}
        <motion.button
          type="button"
          onClick={() => {
            if (draggingRef.current) {
              draggingRef.current = false;
              return;
            }
            setOpen((v) => !v);
          }}
          whileTap={{ scale: 0.96 }}
          aria-label={open ? "Hide setup" : "Studio setup"}
          className="flex cursor-grab items-center gap-2.5 rounded-full border border-border bg-surface py-2 pl-3.5 pr-4 shadow-panel outline-none focus-visible:ring-2 focus-visible:ring-accent-500 active:cursor-grabbing"
        >
          <ProgressRing pct={pct} />
          <span className="text-sm font-medium tabular-nums text-fg">
            {doneCount}/{total}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

// Ramp filled ticks from deep navy → accent blue (echoes the OG card gradient).
const RAMP_FROM = [30, 39, 73]; // #1e2749 (accent-950)
const RAMP_TO = [107, 147, 240]; // #6b93f0 (accent-500)
function rampColor(t: number): string {
  const c = RAMP_FROM.map((a, k) => Math.round(a + (RAMP_TO[k] - a) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// Small gradient progress ring for the collapsed toggle (no % label).
function ProgressRing({ pct, size = 22 }: { pct: number; size?: number }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
        <defs>
          <linearGradient id="mirae-dock-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e2749" />
            <stop offset="100%" stopColor="#6b93f0" />
          </linearGradient>
        </defs>
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          className="stroke-surface-muted"
          strokeWidth="5.5"
        />
        <motion.circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="url(#mirae-dock-ring)"
          strokeWidth="5.5"
          strokeLinecap="round"
          pathLength={100}
          initial={false}
          animate={{ strokeDasharray: `${pct} 100` }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </svg>
    </span>
  );
}

function SegmentedBar({
  pct,
  count = 28,
  className,
}: {
  pct: number;
  count?: number;
  className?: string;
}) {
  const filled = Math.round((pct / 100) * count);
  return (
    <div className={cn("flex items-center gap-[3px]", className)}>
      {Array.from({ length: count }).map((_, i) => {
        const on = i < filled;
        const t = filled <= 1 ? 1 : i / (filled - 1);
        return (
          <span
            key={i}
            className={cn(
              "h-4 w-[3px] rounded-full transition-colors duration-300 ease-out",
              !on && "bg-surface-muted",
            )}
            style={{
              transitionDelay: `${i * 15}ms`,
              backgroundColor: on ? rampColor(t) : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
