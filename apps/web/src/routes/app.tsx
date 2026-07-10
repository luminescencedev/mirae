import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell/AppShell.tsx";

// /app layout. In dev this lives at /app; in production the Worker serves it
// on app.usemirae.com (host wiring at deploy, Sprint 4). Child screens render
// into the AppShell's Outlet.
export const Route = createFileRoute("/app")({
  component: () => (
    <div className="h-dvh">
      <AppShell>
        <Outlet />
      </AppShell>
    </div>
  ),
});
