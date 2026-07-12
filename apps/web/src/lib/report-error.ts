// Structured client error reporting. In production a compact report is sent to
// the Worker (which logs it as structured JSON via /api/client-errors); in dev
// nothing leaves the machine — we just console.error.

type ErrorScope = "root" | "route" | "window" | "promise";
type ReportMeta = { scope: ErrorScope; componentStack?: string };

export function reportError(error: unknown, meta: ReportMeta) {
  const err = error instanceof Error ? error : new Error(String(error));

  if (import.meta.env.DEV) {
    console.error(`[${meta.scope}]`, err, meta.componentStack ?? "");
    return;
  }

  const payload = JSON.stringify({
    scope: meta.scope,
    message: err.message,
    stack: err.stack,
    componentStack: meta.componentStack,
    url: window.location.href,
  });

  // sendBeacon survives navigation/unload; fall back to keepalive fetch.
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/client-errors",
        new Blob([payload], { type: "application/json" }),
      );
    } else {
      void fetch("/api/client-errors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    // Reporting must never throw.
  }
}

// Catch errors that escape React (async callbacks, event handlers, rejected
// promises) — the render-tree boundaries only see render/lifecycle errors.
export function installGlobalErrorReporting() {
  window.addEventListener("error", (e) =>
    reportError(e.error ?? e.message, { scope: "window" }),
  );
  window.addEventListener("unhandledrejection", (e) =>
    reportError(e.reason, { scope: "promise" }),
  );
}
