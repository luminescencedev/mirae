import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell/AppShell.tsx";
import { authClient } from "../lib/auth-client.ts";
import { artistApi } from "../lib/api.ts";

// /app layout. In dev this lives at /app; in production the Worker serves it
// on app.usemirae.com. Child screens render into the AppShell's Outlet.
// Protected — no session → /login; no studio profile yet → /onboarding.
export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: "/login" });
    const profile = await artistApi.me();
    if (!profile) throw redirect({ to: "/onboarding" });
  },
  component: () => (
    <div className="h-dvh">
      <AppShell>
        <Outlet />
      </AppShell>
    </div>
  ),
});
