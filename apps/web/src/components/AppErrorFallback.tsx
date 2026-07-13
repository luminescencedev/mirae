import { Button, Mark } from "@mirae/ui";

// Full-screen, calm fallback for unrecoverable client crashes. Used by the
// top-level ErrorBoundary in main.tsx. `reset` retries the render; a hard
// reload is offered as a fallback when re-rendering keeps failing.
export function AppErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <Mark className="h-7 w-auto text-fg" />
        <div className="space-y-1">
          <h1 className="text-base font-semibold tracking-tight text-fg">
            Something broke on our side
          </h1>
          <p className="text-sm text-fg-subtle">
            The page hit an unexpected error. Try again, or reload if it keeps
            happening.
          </p>
        </div>
        {import.meta.env.DEV && error.message && (
          <pre className="max-w-full overflow-x-auto rounded-md border border-border bg-surface-muted px-3 py-2 text-left text-xs text-fg-muted">
            {error.message}
          </pre>
        )}
        <div className="flex items-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
