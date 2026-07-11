import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button, Input } from "@mirae/ui";
import { SiteHeader } from "../components/marketing/SiteHeader.tsx";
import { waitlistApi } from "../lib/api.ts";

function Waitlist() {
  const [email, setEmail] = useState("");
  const join = useMutation({ mutationFn: () => waitlistApi.join(email) });

  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-fg">
          Join the early list
        </h1>
        <p className="mt-4 text-lg text-fg-muted">
          Mirae is in private beta. Leave your email and we'll invite you as
          spots open up.
        </p>

        {join.isSuccess ? (
          <div className="mt-8 rounded-xl border border-border bg-surface px-6 py-5 text-sm text-fg shadow-soft">
            You're on the list — we'll email you when a spot opens. ✦
          </div>
        ) : (
          <form
            className="mt-8 flex w-full max-w-md items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) join.mutate();
            }}
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="flex-1"
            />
            <Button type="submit" disabled={join.isPending}>
              {join.isPending ? "Joining…" : "Join"}
            </Button>
          </form>
        )}

        {join.isError && (
          <p className="mt-3 text-sm text-red-600">
            {(join.error as Error).message}
          </p>
        )}
        <p className="mt-3 text-xs text-fg-subtle">
          No spam — just your invite when it's ready.
        </p>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/waitlist")({ component: Waitlist });
