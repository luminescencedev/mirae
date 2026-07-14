import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FeedbackForm } from "./FeedbackForm.tsx";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Mobile feedback modal (bottom sheet), opened from the overflow menu. Desktop
 *  uses the anchored FeedbackWidget popover instead. */
export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:hidden">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => onOpenChange(false)}
          />
          {/* Remount the form each open so its local state resets cleanly. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Send feedback"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="relative mb-[env(safe-area-inset-bottom)] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-panel"
          >
            <FeedbackForm onClose={() => onOpenChange(false)} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
