import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { Button, Icon, Textarea, cn } from "@mirae/ui";
import {
  BubbleChatIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { feedbackApi } from "../../lib/api.ts";

const EASE = [0.23, 1, 0.32, 1] as const;

const SENTIMENTS = [
  { key: "good", label: "Love", emoji: "😍" },
  { key: "idea", label: "Idea", emoji: "💡" },
  { key: "bug", label: "Bug", emoji: "🐞" },
] as const;

/** Floating beta-feedback widget (bottom-left) — quick sentiment + note,
 *  tagged with the current route for triage. */
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: () =>
      feedbackApi.submit(message.trim(), sentiment, window.location.pathname),
  });

  const close = () => {
    setOpen(false);
    // Reset shortly after the panel animates out.
    setTimeout(() => {
      setMessage("");
      setSentiment(null);
      send.reset();
    }, 250);
  };

  return (
    <div className="fixed bottom-20 left-4 z-40 flex flex-col items-start gap-3 md:bottom-4 md:left-[calc(16rem+1rem)]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="w-[min(20rem,calc(100vw-2rem))] origin-bottom-left overflow-hidden rounded-2xl border border-border bg-surface shadow-panel"
          >
            {send.isSuccess ? (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <span className="text-emerald-600">
                  <Icon
                    icon={CheckmarkCircle02Icon}
                    size={28}
                    strokeWidth={1.8}
                  />
                </span>
                <p className="text-sm font-medium text-fg">Thank you!</p>
                <p className="text-xs text-fg-subtle">
                  Your feedback helps shape the beta.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={close}
                >
                  Done
                </Button>
              </div>
            ) : (
              <form
                className="p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (message.trim()) send.mutate();
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-fg">
                    Share feedback
                  </p>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={close}
                    className="grid size-7 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
                  >
                    <Icon icon={Cancel01Icon} size={15} />
                  </button>
                </div>
                <div className="mb-3 flex gap-2">
                  {SENTIMENTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() =>
                        setSentiment(sentiment === s.key ? null : s.key)
                      }
                      className={cn(
                        "flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 text-xs transition-colors",
                        sentiment === s.key
                          ? "border-accent-500 bg-accent-50 text-accent-700"
                          : "border-border text-fg-muted hover:bg-surface-muted",
                      )}
                    >
                      <span className="text-base leading-none">{s.emoji}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's working, what's not, an idea…"
                  autoFocus
                />
                {send.isError && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {(send.error as Error).message}
                  </p>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="mt-3 w-full"
                  disabled={!message.trim() || send.isPending}
                >
                  {send.isPending ? "Sending…" : "Send feedback"}
                </Button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Send feedback"
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-2 pl-3 pr-4 text-sm font-medium text-fg-muted shadow-panel outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <Icon icon={BubbleChatIcon} size={16} strokeWidth={1.8} />
        Feedback
      </motion.button>
    </div>
  );
}
