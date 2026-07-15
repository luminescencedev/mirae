import { useState } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Button, Input } from "@mirae/ui";
import { AuthLayout, Field } from "../components/marketing/AuthLayout.tsx";
import { authClient, signUp } from "../lib/auth-client.ts";
import { betaApi } from "../lib/api.ts";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signUp.email({ name, email, password });
    if (res.error) {
      setLoading(false);
      setError(res.error.message ?? "Could not create your account.");
      return;
    }
    // Redeem the pending invite now that the account exists (no-op if the gate
    // is off). A failure here shouldn't strand the new account on this page.
    await betaApi.redeem().catch(() => undefined);
    setLoading(false);
    navigate({ to: "/onboarding" });
  }

  return (
    <AuthLayout
      title="Create your studio"
      subtitle="Start managing commissions in one calm workspace."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-fg hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Field label="Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rain Aoki"
            required
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();
    if (data) throw redirect({ to: "/app" });
    // Closed beta: no invitation → send back to the access gate. The server
    // enforces this too (403 on signup) — this is just the friendly redirect.
    const status = await betaApi.status().catch(() => null);
    if (status?.closedBeta && !status.pendingInvite)
      throw redirect({ to: "/beta-access" });
  },
  component: Signup,
});
