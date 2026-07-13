import { type ComponentProps, type ReactNode } from "react";
import { cn } from "../utils/cn.ts";

// A calm inline spinner (respects reduced motion via a slow, subtle spin).
export function Spinner({
  className,
  ...props
}: ComponentProps<"span"> & { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-border border-t-fg-muted motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

// Centered loading block for panels/lists.
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid place-items-center gap-3 p-12 text-sm text-fg-subtle">
      <Spinner />
      {label}
    </div>
  );
}

// Empty state: optional icon, title, hint, and an action slot.
export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center gap-2 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="mb-1 text-fg-subtle [&_svg]:size-6">{icon}</div>}
      <p className="text-sm font-medium text-fg">{title}</p>
      {hint && <p className="max-w-xs text-sm text-fg-subtle">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Error state with an optional retry.
export function ErrorState({
  title = "Something went wrong",
  hint,
  onRetry,
}: {
  title?: string;
  hint?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="grid place-items-center gap-2 px-6 py-12 text-center">
      <p className="text-sm font-medium text-red-600">{title}</p>
      {hint && <p className="max-w-xs text-sm text-fg-subtle">{hint}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg outline-none transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          Try again
        </button>
      )}
    </div>
  );
}
