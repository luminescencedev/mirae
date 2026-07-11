import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Icon, Input, Textarea, cn } from "@mirae/ui";
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  CubeIcon,
} from "@hugeicons/core-free-icons";
import { Field } from "../marketing/AuthLayout.tsx";
import { publicApi } from "../../lib/api.ts";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-xl px-6 py-12">{children}</div>
    </div>
  );
}

export function RequestForm({ handle }: { handle: string }) {
  const display = handle.replace(/^@/, "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["studio", display.toLowerCase()],
    queryFn: () => publicApi.studio(handle),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [brief, setBrief] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      publicApi.submitRequest(handle, {
        clientName: name,
        clientEmail: email,
        commissionTypeId: typeId,
        budget: budget.trim() || null,
        deadline: deadline.trim() || null,
        message: brief,
      }),
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle shadow-soft">
          Loading…
        </div>
      </Shell>
    );
  }

  if (isError || !data) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <h1 className="text-lg font-semibold text-fg">Studio not found</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            No studio at <span className="font-medium">@{display}</span>.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">Back to Mirae</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const { profile, commissionTypes } = data;
  const closed = profile.status === "closed";

  return (
    <Shell>
      <Link
        to="/$handle"
        params={{ handle }}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <Icon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
        {profile.displayName} · @{profile.handle}
      </Link>

      {submit.isSuccess ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon icon={CheckmarkCircle02Icon} size={26} strokeWidth={1.8} />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-fg">
            Request sent
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
            {profile.displayName} will review your request and reply with a
            quote. You’ll get an email when they respond.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/$handle" params={{ handle }}>
              Back to profile
            </Link>
          </Button>
        </div>
      ) : closed ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <h1 className="text-lg font-semibold text-fg">Requests are closed</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            {profile.displayName} isn’t taking commissions right now.
          </p>
          <Button asChild variant="outline" className="mt-5">
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
            Tell {profile.displayName} what you have in mind — no account
            needed.
          </p>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex"
                  required
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </Field>
            </div>

            {commissionTypes.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fg">
                  Commission type
                </span>
                <div className="flex flex-wrap gap-2">
                  {commissionTypes.map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() =>
                        setTypeId((cur) => (cur === ct.id ? null : ct.id))
                      }
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500",
                        typeId === ct.id
                          ? "border-accent-500 bg-accent-50 text-accent-700"
                          : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                      )}
                    >
                      {ct.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Budget">
                <Input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="€150–200"
                />
              </Field>
              <Field label="Deadline (optional)">
                <Input
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Flexible"
                />
              </Field>
            </div>

            <Field label="Brief">
              <Textarea
                rows={5}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Describe your idea, character, references, palette…"
                required
              />
            </Field>

            <p className="text-xs text-fg-subtle">
              You can add reference links in the brief. By sending, you agree to{" "}
              {profile.displayName}’s terms.
            </p>

            {submit.isError && (
              <p className="text-sm text-red-600">
                {(submit.error as Error).message}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-1"
              disabled={submit.isPending}
            >
              {submit.isPending ? "Sending…" : "Send request"}
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
    </Shell>
  );
}
