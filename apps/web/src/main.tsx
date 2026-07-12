import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ErrorBoundary } from "@mirae/ui";
import { routeTree } from "./routeTree.gen";
import { AppErrorFallback } from "./components/AppErrorFallback.tsx";
import { RouteErrorFallback } from "./components/RouteErrorFallback.tsx";
import {
  installGlobalErrorReporting,
  reportError,
} from "./lib/report-error.ts";
import "./styles/globals.css";

installGlobalErrorReporting();

const router = createRouter({
  routeTree,
  defaultErrorComponent: RouteErrorFallback,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary
      onError={(error, info) =>
        reportError(error, {
          scope: "root",
          componentStack: info.componentStack ?? undefined,
        })
      }
      fallback={(props) => <AppErrorFallback {...props} />}
    >
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);
