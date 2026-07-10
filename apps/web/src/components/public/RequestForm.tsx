import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button, Icon, Input, Textarea, cn } from "@mirae/ui";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  CubeIcon,
} from "@hugeicons/core-free-icons";
import { ARTIST } from "../mockups/seed.ts";
import { Field } from "../marketing/AuthLayout.tsx";

export function RequestForm({ handle }: { handle: string }) {
  const display = handle.replace(/^@/, "");
  const [type, setType] = useState(ARTIST.commissionTypes[0].name);
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-xl px-6 py-12">
        <Link
          to="/$handle"
          params={{ handle }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          <Icon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
          {ARTIST.name} · @{display}
        </Link>

        {sent ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Icon icon={CheckmarkCircle02Icon} size={26} strokeWidth={1.8} />
            </span>
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-fg">
              Request sent
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
              {ARTIST.name} will review your request and reply with a quote.
              You'll get an email when they respond.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/$handle" params={{ handle }}>
                Back to profile
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
            <h1 className="text-xl font-semibold tracking-tight text-fg">
              Request a commission
            </h1>
            <p className="mt-1 text-sm text-fg-muted">
              Tell {ARTIST.name} what you have in mind — no account needed.
            </p>

            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name">
                  <Input placeholder="Alex" required />
                </Field>
                <Field label="Email">
                  <Input type="email" placeholder="you@email.com" required />
                </Field>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fg">
                  Commission type
                </span>
                <div className="flex flex-wrap gap-2">
                  {ARTIST.commissionTypes.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setType(c.name)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500",
                        type === c.name
                          ? "border-accent-500 bg-accent-50 text-accent-700"
                          : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Budget">
                  <Input placeholder="€150–200" />
                </Field>
                <Field label="Deadline (optional)">
                  <Input placeholder="Flexible" />
                </Field>
              </div>

              <Field label="Brief">
                <Textarea
                  rows={5}
                  placeholder="Describe your idea, character, references, palette…"
                  required
                />
              </Field>

              <p className="text-xs text-fg-subtle">
                You can add reference links in the brief. By sending, you agree
                to {ARTIST.name}'s terms.
              </p>

              <Button type="submit" size="lg" className="mt-1">
                Send request
              </Button>
            </form>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
          <Icon icon={CubeIcon} size={13} />
          Powered by
          <Link to="/" className="font-medium text-fg-muted hover:text-fg">
            Mirae
          </Link>
        </div>
      </div>
    </div>
  );
}
