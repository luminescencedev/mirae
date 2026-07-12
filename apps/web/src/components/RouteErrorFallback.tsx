import { type ErrorComponentProps } from "@tanstack/react-router";
import { ErrorState } from "@mirae/ui";
import { reportError } from "../lib/report-error.ts";

// Route-level fallback: a render error inside a route keeps the surrounding
// app shell mounted and shows an inline, retryable error state. Wired as the
// router's `defaultErrorComponent`.
export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  reportError(error, { scope: "route" });
  return (
    <ErrorState
      title="This page couldn’t load"
      hint="An unexpected error occurred. Try again in a moment."
      onRetry={reset}
    />
  );
}
