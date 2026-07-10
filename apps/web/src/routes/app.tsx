import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell/AppShell.tsx";

// Private dashboard. In dev this lives at /app; in production the Worker
// serves it on app.usemirae.com (host wiring at deploy, Sprint 4).
export const Route = createFileRoute("/app")({
  component: () => (
    <div className="h-dvh">
      <AppShell />
    </div>
  ),
});
