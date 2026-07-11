import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider, TooltipProvider } from "@mirae/ui";
import { queryClient } from "../lib/query.ts";

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TooltipProvider delayDuration={200}>
          <Outlet />
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  ),
});
