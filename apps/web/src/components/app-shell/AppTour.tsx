import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@mirae/ui";

const EASE = [0.23, 1, 0.32, 1] as const;

export type TourStep = {
  /** Element to spotlight (data-tour="..." value). */
  target: string;
  title: string;
  body: string;
  /** Navigate here before showing the step (so the target exists on-screen). */
  to?: string;
  /** Preferred popover placement; auto-flips if there's no room. */
  place?: "top" | "bottom";
};

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8; // spotlight padding around the target

function measure(sel: string): Rect | null {
  // A target may exist twice (sidebar + bottom nav) — use the visible one.
  const els = document.querySelectorAll(`[data-tour="${sel}"]`);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0)
      return { top: r.top, left: r.left, width: r.width, height: r.height };
  }
  return null;
}

/** Guided product tour: dims the app, spotlights one element at a time, and an
 *  accompanying card explains it. Navigates across the app between steps.
 *  Always skippable. */
export function AppTour({
  steps,
  onClose,
}: {
  steps: TourStep[];
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[i];
  const last = i === steps.length - 1;

  // On every step: navigate (if needed), clear the old spotlight, then poll for
  // the new target so route/layout changes settle. Keyed on `i` only so both
  // directions re-measure identically.
  useEffect(() => {
    if (step.to) navigate({ to: step.to });
    setRect(null);
    // Poll for the target — a route change may lazy-load the chunk + fetch data,
    // so keep looking for up to ~5s (not just a few frames).
    let tries = 0;
    const id = setInterval(() => {
      const r = measure(step.target);
      if (r) {
        setRect(r);
        if (r.top < 0 || r.top > window.innerHeight) {
          document
            .querySelector(`[data-tour="${step.target}"]`)
            ?.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        clearInterval(id);
      } else if (++tries > 60) {
        clearInterval(id);
      }
    }, 80);
    const onMove = () => {
      const r = measure(step.target);
      if (r) setRect(r);
    };
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => onClose();

  // Card position: below the target if room, else above; clamped to viewport.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const cardW = Math.min(320, vw - 24);
  let cardTop = 0;
  let cardLeft = 12;
  if (rect) {
    const below = rect.top + rect.height + PAD + 12;
    const wantTop =
      step.place === "top" || below > vh - 180
        ? rect.top - PAD - 12 - 160
        : below;
    cardTop = Math.max(12, Math.min(wantTop, vh - 200));
    cardLeft = Math.max(
      12,
      Math.min(rect.left + rect.width / 2 - cardW / 2, vw - cardW - 12),
    );
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dim + spotlight cutout (box-shadow fills the screen; the hole is clear) */}
      {rect ? (
        <motion.div
          className="pointer-events-none absolute rounded-xl"
          initial={false}
          animate={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
          transition={{ duration: 0.35, ease: EASE }}
          style={{ boxShadow: "0 0 0 100vmax rgba(15,17,23,0.60)" }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(15,17,23,0.60)]" />
      )}
      {/* Click-blocker over the dimmed area (keeps the tour focused) */}
      <div className="absolute inset-0" onClick={() => {}} />

      {/* Ring around the spotlight */}
      {rect && (
        <motion.div
          className="pointer-events-none absolute rounded-xl ring-2 ring-white/80"
          initial={false}
          animate={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
          transition={{ duration: 0.35, ease: EASE }}
        />
      )}

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="absolute w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-surface p-4 shadow-panel"
          style={{ top: cardTop, left: cardLeft }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
              Step {i + 1} of {steps.length}
            </span>
            <button
              type="button"
              onClick={finish}
              className="text-xs font-medium text-fg-subtle underline-offset-2 hover:text-fg hover:underline"
            >
              Skip tutorial
            </button>
          </div>
          <h3 className="mt-2 text-sm font-semibold tracking-tight text-fg">
            {step.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">
            {step.body}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {i > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setI((v) => Math.max(0, v - 1))}
              >
                Back
              </Button>
            )}
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => (last ? finish() : setI((v) => v + 1))}
            >
              {last ? "Finish" : "Next"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
