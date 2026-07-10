import { createFileRoute } from "@tanstack/react-router";
import { Button, Input } from "@mirae/ui";
import { SiteHeader } from "../components/marketing/SiteHeader.tsx";

function Waitlist() {
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
        <form className="mt-8 flex w-full max-w-md items-center gap-2">
          <Input type="email" placeholder="you@studio.com" className="flex-1" />
          <Button type="submit">Join</Button>
        </form>
        <p className="mt-3 text-xs text-fg-subtle">
          No spam — just your invite when it's ready.
        </p>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/waitlist")({ component: Waitlist });
