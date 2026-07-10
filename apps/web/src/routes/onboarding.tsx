import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Input } from "@mirae/ui";
import { AuthLayout, Field } from "../components/marketing/AuthLayout.tsx";

function Onboarding() {
  return (
    <AuthLayout
      title="Set up your studio"
      subtitle="Pick the handle for your public page and request form."
    >
      <form className="flex flex-col gap-4">
        <Field label="Studio handle">
          <div className="flex h-9 w-full items-center overflow-hidden rounded-md border border-border transition-colors focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/25">
            <span className="flex h-full select-none items-center border-r border-border bg-surface-muted px-2.5 text-sm text-fg-subtle">
              @
            </span>
            <input
              placeholder="rainaoki"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-fg outline-none placeholder:text-fg-subtle"
            />
          </div>
          <span className="text-xs text-fg-subtle">usemirae.com/@rainaoki</span>
        </Field>
        <Field label="Display name">
          <Input placeholder="Rain Aoki" />
        </Field>
        <Button asChild className="mt-1 w-full">
          <Link to="/app">Open my studio</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/onboarding")({ component: Onboarding });
