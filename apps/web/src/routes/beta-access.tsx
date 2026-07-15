import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Button, Input } from "@mirae/ui";
import { AuthLayout, Field } from "../components/marketing/AuthLayout.tsx";
import { betaApi } from "../lib/api.ts";

function BetaAccess() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await betaApi.verify(code.trim());
      if (res.next === "signup") navigate({ to: "/signup" });
      else if (res.next === "app") navigate({ to: "/app" });
      else navigate({ to: "/onboarding" });
    } catch {
      // Generic message — never reveal whether a code exists, is expired, or is
      // used. All failure modes read the same to an attacker.
      setError("That invitation code isn't valid.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Enter your invitation"
      subtitle="Mirae is in a closed beta with a small group of artists. Enter the invitation code we sent you to continue."
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Field label="Invitation code">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="MIRAE-XXXX-XXXX-XXXX"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? "Checking…" : "Continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/beta-access")({
  beforeLoad: async () => {
    // Already have a pending invite or the gate is off → skip straight to
    // signup. Authenticated members go to the app.
    const status = await betaApi.status().catch(() => null);
    if (!status) return;
    if (status.authenticated && status.hasBetaAccess)
      throw redirect({ to: status.needsOnboarding ? "/onboarding" : "/app" });
    if (!status.closedBeta || status.pendingInvite)
      throw redirect({ to: "/signup" });
  },
  component: BetaAccess,
});
