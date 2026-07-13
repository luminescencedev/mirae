import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider, TooltipProvider } from "@mirae/ui";
import { SmoothScroll } from "../components/SmoothScroll.tsx";
import { queryClient } from "../lib/query.ts";

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll />
      <ToastProvider>
        <TooltipProvider delayDuration={200}>
          <Outlet />
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  ),
});
