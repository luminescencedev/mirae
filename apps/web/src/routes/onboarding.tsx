import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Button, Input } from "@mirae/ui";
import { AuthLayout, Field } from "../components/marketing/AuthLayout.tsx";
import { authClient } from "../lib/auth-client.ts";
import { artistApi } from "../lib/api.ts";

function Onboarding() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, displayName }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not create your studio.");
      return;
    }
    navigate({ to: "/app" });
  }

  return (
    <AuthLayout
      title="Set up your studio"
      subtitle="Pick the handle for your public page and request form."
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Field label="Studio handle">
          <div className="flex h-9 w-full items-center overflow-hidden rounded-md border border-border transition-colors focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/25">
            <span className="flex h-full select-none items-center border-r border-border bg-surface-muted px-2.5 text-sm text-fg-subtle">
              @
            </span>
            <input
              value={handle}
              onChange={(e) =>
                setHandle(
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              placeholder="rainaoki"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-fg outline-none placeholder:text-fg-subtle"
              required
            />
          </div>
          <span className="text-xs text-fg-subtle">
            usemirae.com/@{handle || "rainaoki"}
          </span>
        </Field>
        <Field label="Display name">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Rain Aoki"
            required
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? "Creating…" : "Open my studio"}
        </Button>
      </form>
    </AuthLayout>
  );
}

// Must be signed in to onboard.
export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (!data) throw redirect({ to: "/login" });
    // Already have a studio → straight to the app.
    const profile = await artistApi.me();
    if (profile) throw redirect({ to: "/app" });
  },
  component: Onboarding,
});
