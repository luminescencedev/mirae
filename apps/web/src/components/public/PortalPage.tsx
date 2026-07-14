import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Icon, Mark, Skeleton, Textarea, cn } from "@mirae/ui";
import { Add01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import {
  publicApi,
  type PortalThread,
  type PortalView,
} from "../../lib/api.ts";
import {
  STATUS_META,
  dueLabel,
  euro,
  milestones,
} from "../../lib/commissions.ts";

type PortalArtist = {
  displayName: string;
  handle: string;
  tagline: string | null;
  hasAvatar: boolean;
  hasCover: boolean;
} | null;

const avatarUrl = (handle: string) =>
  `/api/studio/${encodeURIComponent(handle)}/avatar`;
const coverUrl = (handle: string) =>
  `/api/studio/${encodeURIComponent(handle)}/cover`;

/** Studio avatar disc — real image when set, else an initial gradient. */
function StudioAvatar({
  artist,
  size,
}: {
  artist: PortalArtist;
  size: number;
}) {
  const initial = (artist?.displayName ?? "·").slice(0, 1).toUpperCase();
  if (artist?.hasAvatar) {
    return (
      <img
        src={avatarUrl(artist.handle)}
        alt={artist.displayName}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover ring-1 ring-black/5"
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-linear-to-br from-accent-300 to-accent-500 font-semibold text-white"
    >
      {initial}
    </span>
  );
}

/** Slim brand bar — anchors the client in the artist's studio, credits Mirae. */
function BrandBar({ artist }: { artist: PortalArtist }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <StudioAvatar artist={artist} size={28} />
          <span className="truncate text-sm font-medium text-fg">
            {artist ? `${artist.displayName}'s studio` : "Commission"}
          </span>
        </div>
        <Link
          to="/"
          className="flex shrink-0 items-center gap-1.5 text-xs text-fg-subtle transition-colors hover:text-fg-muted"
        >
          <Mark className="h-3 w-auto" />
          Mirae
        </Link>
      </div>
    </header>
  );
}

function Shell({
  artist,
  children,
}: {
  artist?: PortalArtist;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-sunken">
      <BrandBar artist={artist ?? null} />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer
        className="mx-auto flex max-w-xl items-center justify-center gap-1.5 px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-4 text-xs text-fg-subtle"
      >
        <Mark className="h-3 w-auto" />
        Powered by
        <Link to="/" className="font-medium text-fg-muted hover:text-fg">
          Mirae
        </Link>
      </footer>
    </div>
  );
}

/** Vertical connected milestone timeline for the client's view. */
function Timeline({ status }: { status: PortalView["commission"]["status"] }) {
  const steps = milestones(status);
  return (
    <ol className="relative flex flex-col">
      {steps.map((m, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={m.label} className="relative flex gap-3.5">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-2.75 top-6 h-[calc(100%-1rem)] w-px",
                  m.state === "done" ? "bg-emerald-400/60" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full",
                m.state === "done"
                  ? "bg-emerald-500 text-white"
                  : m.state === "active"
                    ? "bg-accent-500 text-white ring-4 ring-accent-500/15"
                    : "bg-surface-sunken ring-1 ring-inset ring-border",
              )}
            >
              {m.state === "done" ? (
                <Icon icon={Tick02Icon} size={13} strokeWidth={2.5} />
              ) : (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    m.state === "active" ? "bg-white" : "bg-fg-subtle",
                  )}
                />
              )}
            </span>
            <div className={cn("flex items-center gap-2", last ? "pb-0" : "pb-5")}>
              <span
                className={cn(
                  "text-sm",
                  m.state === "active"
                    ? "font-semibold text-fg"
                    : m.state === "done"
                      ? "text-fg-muted"
                      : "text-fg-subtle",
                )}
              >
                {m.label}
              </span>
              {m.state === "active" && (
                <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700">
                  Current
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** One conversation with its messages + an inline client reply box. */
function ThreadCard({
  token,
  artist,
  thread,
}: {
  token: string;
  artist: PortalArtist;
  thread: PortalThread;
}) {
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const send = useMutation({
    mutationFn: () => publicApi.replyThread(token, thread.id, reply.trim()),
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["portal", token] });
    },
  });
  const resolved = thread.status === "resolved";

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
          {thread.subject || "Conversation"}
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            resolved
              ? "bg-emerald-50 text-emerald-700"
              : "bg-accent-50 text-accent-700",
          )}
        >
          {resolved ? "Resolved" : "Open"}
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {thread.messages.map((m) => {
          const mine = m.authorRole === "client";
          return (
            <li
              key={m.id}
              className={cn("flex flex-col gap-1", mine && "items-end")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                  mine
                    ? "rounded-br-md bg-accent-500 text-white"
                    : "rounded-bl-md bg-surface-muted text-fg",
                )}
              >
                {m.body}
              </div>
              <span className="px-1 text-[11px] text-fg-subtle">
                {mine ? "You" : (artist?.displayName ?? "Artist")} ·{" "}
                {fmtTime(m.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>

      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (reply.trim()) send.mutate();
        }}
      >
        <Textarea
          rows={1}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply…"
          className="min-h-10 flex-1 resize-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!reply.trim() || send.isPending}
        >
          {send.isPending ? "…" : "Send"}
        </Button>
      </form>
    </div>
  );
}

/** New-topic composer (subject optional). */
function NewThread({ token }: { token: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const create = useMutation({
    mutationFn: () => publicApi.createThread(token, subject.trim(), body.trim()),
    onSuccess: () => {
      setSubject("");
      setBody("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["portal", token] });
    },
  });

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Icon icon={Add01Icon} size={15} />
        New message
      </Button>
    );
  }
  return (
    <form
      className="rounded-xl border border-border bg-surface p-4 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        if (body.trim()) create.mutate();
      }}
    >
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject (optional)"
        className="mb-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      />
      <Textarea
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="A question or feedback for the artist…"
        autoFocus
      />
      {create.isError && (
        <p className="mt-2 text-sm text-red-600">
          {(create.error as Error).message}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <Button type="submit" size="sm" disabled={!body.trim() || create.isPending}>
          {create.isPending ? "Sending…" : "Send"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Threads({
  token,
  artist,
  threads,
}: {
  token: string;
  artist: PortalArtist;
  threads: PortalThread[];
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-semibold text-fg">Messages</h2>
      <div className="flex flex-col gap-3">
        {threads.map((t) => (
          <ThreadCard key={t.id} token={token} artist={artist} thread={t} />
        ))}
        {threads.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-6 text-center text-sm text-fg-subtle">
            No messages yet. Ask the artist a question or share feedback.
          </p>
        )}
        <NewThread token={token} />
      </div>
    </section>
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
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-9 w-64" />
        <Skeleton className="mt-4 h-7 w-32 rounded-full" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="col-span-2 h-20 rounded-xl" />
        </div>
        <Skeleton className="mt-3 h-48 rounded-xl" />
      </Shell>
    );
  }

  if (isError || !data) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <span className="mx-auto mb-4 grid size-11 place-items-center rounded-full bg-surface-sunken text-fg-subtle">
            <Mark className="h-4 w-auto opacity-60" />
          </span>
          <h1 className="text-lg font-semibold text-fg">Nothing here</h1>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-fg-muted">
            This portal link is invalid or has expired. Ask the artist for a
            fresh link.
          </p>
        </div>
      </Shell>
    );
  }

  const { commission, artist, quote } = data;
  const meta = STATUS_META[commission.status];

  return (
    <Shell artist={artist}>
      {artist?.hasCover && (
        <div className="mb-5 h-28 overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-soft sm:h-32">
          <img
            src={coverUrl(artist.handle)}
            alt=""
            className="size-full object-cover"
          />
        </div>
      )}
      {artist?.tagline && (
        <p className="mb-1.5 text-sm text-fg-subtle">{artist.tagline}</p>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
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
        <p className="mb-4 text-sm font-semibold text-fg">Progress</p>
        <Timeline status={commission.status} />
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

      <Threads token={token} artist={artist} threads={data.threads} />
    </Shell>
  );
}
