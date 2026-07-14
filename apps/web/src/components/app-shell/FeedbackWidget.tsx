import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@mirae/ui";
import { BubbleChatIcon } from "@hugeicons/core-free-icons";
import { FeedbackForm } from "./FeedbackForm.tsx";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Desktop-only floating feedback button + anchored mini popover. On mobile
 *  feedback lives in the top-right overflow menu (FeedbackDialog) instead. */
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-[calc(16rem+1rem)] z-40 hidden flex-col items-start gap-3 md:flex">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="w-80 origin-bottom-left overflow-hidden rounded-2xl border border-border bg-surface shadow-panel"
          >
            <FeedbackForm onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Send feedback"
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-2 pl-3 pr-4 text-sm font-medium text-fg-muted shadow-panel outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <Icon icon={BubbleChatIcon} size={16} strokeWidth={1.8} />
        Feedback
      </motion.button>
    </div>
  );
}
