import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TooltipProvider } from "@mirae/ui";

export const Route = createRootRoute({
  component: () => (
    <TooltipProvider delayDuration={200}>
      <Outlet />
    </TooltipProvider>
  ),
});
