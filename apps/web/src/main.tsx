import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ErrorBoundary } from "@mirae/ui";
import { routeTree } from "./routeTree.gen";
import { AppErrorFallback } from "./components/AppErrorFallback.tsx";
import { RouteErrorFallback } from "./components/RouteErrorFallback.tsx";
import "./styles/globals.css";

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
        console.error("[root] render error", error, info.componentStack)
      }
      fallback={(props) => <AppErrorFallback {...props} />}
    >
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);
