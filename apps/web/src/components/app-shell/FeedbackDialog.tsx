import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { Button, Icon, Textarea, cn } from "@mirae/ui";
import {
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

/** Beta feedback modal — opened from the account/overflow menus. Quick
 *  sentiment + note, tagged with the current route for triage. */
export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: () =>
      feedbackApi.submit(message.trim(), sentiment, window.location.pathname),
  });

  // Reset a moment after close so the panel doesn't flicker on the way out.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setMessage("");
      setSentiment(null);
      send.reset();
    }, 250);
    return () => clearTimeout(t);
  }, [open, send]);

  // Close on Escape.
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
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Send feedback"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-panel"
          >
            {send.isSuccess ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
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
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <form
                className="p-5"
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
                    onClick={() => onOpenChange(false)}
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
        </div>
      )}
    </AnimatePresence>
  );
}
