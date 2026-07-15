import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "../components/app-shell/AppShell.tsx";
import { betaApi } from "../lib/api.ts";

// /app layout. In dev this lives at /app; in production the Worker serves it
// on app.usemirae.com. Child screens render into the AppShell's Outlet.
// Protected — no session → /login; no beta access → /beta-access; no studio
// profile yet → /onboarding. A single /api/beta/status call answers all three
// (it reports auth + membership + onboarding), so guarded navigation doesn't
// hammer /api/auth/get-session.
export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const status = await betaApi.status().catch(() => null);
    if (!status?.authenticated) throw redirect({ to: "/login" });
    if (status.closedBeta && !status.hasBetaAccess)
      throw redirect({ to: "/beta-access" });
    if (status.needsOnboarding) throw redirect({ to: "/onboarding" });
  },
  component: () => (
    <div className="h-dvh">
      <AppShell>
        <Outlet />
      </AppShell>
    </div>
  ),
});
