import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Icon, Textarea, cn } from "@mirae/ui";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { feedbackApi } from "../../lib/api.ts";

const SENTIMENTS = [
  { key: "good", label: "Love", emoji: "😍" },
  { key: "idea", label: "Idea", emoji: "💡" },
  { key: "bug", label: "Bug", emoji: "🐞" },
] as const;

/** Shared feedback panel content (sentiment + note + submit + success state).
 *  Wrapped by the desktop popover (FeedbackWidget) and the mobile dialog
 *  (FeedbackDialog). `onClose` dismisses the container. */
export function FeedbackForm({ onClose }: { onClose: () => void }) {
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const send = useMutation({
    mutationFn: () =>
      feedbackApi.submit(message.trim(), sentiment, window.location.pathname),
  });

  if (send.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <span className="text-emerald-600">
          <Icon icon={CheckmarkCircle02Icon} size={28} strokeWidth={1.8} />
        </span>
        <p className="text-sm font-medium text-fg">Thank you!</p>
        <p className="text-xs text-fg-subtle">
          Your feedback helps shape the beta.
        </p>
        <Button size="sm" variant="outline" className="mt-1" onClick={onClose}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <form
      className="p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (message.trim()) send.mutate();
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-fg">Share feedback</p>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
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
            onClick={() => setSentiment(sentiment === s.key ? null : s.key)}
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
  );
}
