import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell/AppShell.tsx";
import { authClient } from "../lib/auth-client.ts";

// /app layout. In dev this lives at /app; in production the Worker serves it
// on app.usemirae.com (host wiring at deploy, Sprint 4). Child screens render
// into the AppShell's Outlet. Protected — no session → redirect to /login.
export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: "/login" });
  },
  component: () => (
    <div className="h-dvh">
      <AppShell>
        <Outlet />
      </AppShell>
    </div>
  ),
});
