import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Mark, Textarea, cn } from "@mirae/ui";
import { Link } from "@tanstack/react-router";
import { publicApi } from "../../lib/api.ts";
import {
  STATUS_META,
  dueLabel,
  euro,
  milestones,
} from "../../lib/commissions.ts";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-lg px-5 py-12 sm:px-6">{children}</div>
      <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-1.5 px-6 pb-12 text-xs text-fg-subtle">
        <Mark className="h-3 w-auto" />
        Powered by
        <Link to="/" className="font-medium text-fg-muted hover:text-fg">
          Mirae
        </Link>
      </div>
    </div>
  );
}

function Feedback({
  token,
  artistName,
}: {
  token: string;
  artistName: string;
}) {
  const [note, setNote] = useState("");
  const send = useMutation({
    mutationFn: () => publicApi.submitFeedback(token, note.trim()),
  });

  if (send.isSuccess) {
    return (
      <div className="mt-3 rounded-xl border border-border bg-surface p-5 text-center text-sm text-fg-muted shadow-soft">
        Thanks — your note was shared with {artistName}.
      </div>
    );
  }
  return (
    <form
      className="mt-3 rounded-xl border border-border bg-surface p-5 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        if (note.trim()) send.mutate();
      }}
    >
      <p className="mb-2 text-sm font-semibold text-fg">Leave a note</p>
      <Textarea
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="A question or feedback for the artist…"
      />
      {send.isError && (
        <p className="mt-2 text-sm text-red-600">
          {(send.error as Error).message}
        </p>
      )}
      <Button
        type="submit"
        size="sm"
        className="mt-3"
        disabled={!note.trim() || send.isPending}
      >
        {send.isPending ? "Sending…" : "Send note"}
      </Button>
    </form>
  );
}

export function PortalPage({ token }: { token: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portal", token],
    queryFn: () => publicApi.portal(token),
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
          <h1 className="text-lg font-semibold text-fg">Nothing here</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            This portal link is invalid or has expired.
          </p>
        </div>
      </Shell>
    );
  }

  const { commission, artist, quote } = data;
  const meta = STATUS_META[commission.status];

  return (
    <Shell>
      <p className="text-sm text-fg-subtle">
        {artist ? `${artist.displayName}'s studio` : "Commission"}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">
        {commission.title}
      </h1>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-fg-muted ring-1 ring-border">
        <span className={cn("size-1.5 rounded-full", meta.dot)} />
        {meta.label}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs text-fg-subtle">Price</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-fg">
            {euro(commission.priceCents)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs text-fg-subtle">Paid</p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-fg">
            {euro(commission.paidCents)}
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-border bg-surface p-4 shadow-soft">
          <p className="text-xs text-fg-subtle">Deadline</p>
          <p className="mt-1 text-sm font-medium text-fg">
            {dueLabel(commission.deadline)}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-surface p-5 shadow-soft">
        <p className="mb-3 text-sm font-semibold text-fg">Progress</p>
        <ol className="flex flex-col gap-0.5">
          {milestones(commission.status).map((m) => (
            <li key={m.label} className="flex items-center gap-3 py-1">
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full",
                  m.state === "active"
                    ? "bg-accent-500"
                    : m.state === "done"
                      ? "bg-emerald-500"
                      : "bg-surface-sunken ring-1 ring-inset ring-border",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    m.state !== "todo" ? "bg-white" : "bg-fg-subtle",
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-sm",
                  m.state === "active"
                    ? "font-medium text-fg"
                    : m.state === "done"
                      ? "text-fg-muted"
                      : "text-fg-subtle",
                )}
              >
                {m.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {quote && (
        <div className="mt-3 rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">Quote</p>
            <span className="text-xs capitalize text-fg-muted">
              {quote.status}
            </span>
          </div>
          <p className="mt-1 text-lg font-semibold tabular-nums text-fg">
            {euro(quote.totalCents)}
          </p>
        </div>
      )}

      <Feedback
        token={token}
        artistName={artist?.displayName ?? "the artist"}
      />
    </Shell>
  );
}
