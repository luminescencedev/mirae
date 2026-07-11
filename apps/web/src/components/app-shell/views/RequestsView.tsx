import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
  Sheet,
  SheetContent,
  cn,
} from "@mirae/ui";
import {
  requestsApi,
  type InboxRequest,
  type RequestStatus,
} from "../../../lib/api.ts";
import { RequestDetail } from "../RequestDetail.tsx";

type Filter = "all" | "new" | "accepted" | "declined";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
];

const STATUS_BADGE: Record<
  RequestStatus,
  { variant: "accent" | "emerald" | "neutral"; label: string }
> = {
  new: { variant: "accent", label: "New" },
  accepted: { variant: "emerald", label: "Accepted" },
  declined: { variant: "neutral", label: "Declined" },
  converted: { variant: "emerald", label: "Converted" },
  archived: { variant: "neutral", label: "Archived" },
};

// Compact relative time ("just now", "3h", "2d", or a date).
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

function RequestRow({
  req,
  onOpen,
}: {
  req: InboxRequest;
  onOpen: () => void;
}) {
  const badge = STATUS_BADGE[req.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full gap-3 p-4 text-left outline-none transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted"
    >
      <span className="size-9 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-fg">
            {req.clientName}
          </span>
          <Badge variant={badge.variant}>{badge.label}</Badge>
          <span className="ml-auto shrink-0 text-xs tabular-nums text-fg-subtle">
            {relativeTime(req.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-fg-muted">
          {req.commissionTypeName ?? "No type"}
          {req.budget && (
            <>
              {" · "}
              <span className="tabular-nums">{req.budget}</span>
            </>
          )}
        </p>
        <p className="mt-1.5 line-clamp-2 whitespace-pre-line text-sm text-fg-muted">
          {splitBrief(req.message)}
        </p>
      </div>
    </button>
  );
}

// Preview shows just the brief, not the folded-in "Deadline:" prefix.
function splitBrief(message: string): string {
  const m = message.match(/^Deadline:\s*.+?\n\n([\s\S]*)$/);
  return m ? m[1] : message;
}

export function RequestsView() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<InboxRequest | null>(null);
  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["requests"], queryFn: requestsApi.list });

  const rows = requests.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1">
        {FILTERS.map((f) => {
          const count =
            f.key === "all"
              ? requests.length
              : requests.filter((r) => r.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500",
                filter === f.key
                  ? "bg-surface-sunken text-fg"
                  : "text-fg-muted hover:bg-surface-muted hover:text-fg",
              )}
            >
              {f.label}
              <span className="text-xs text-fg-subtle">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
        {isLoading ? (
          <LoadingState label="Loading requests…" />
        ) : isError ? (
          <ErrorState
            hint="Couldn’t load your requests."
            onRetry={() => refetch()}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filter === "all" ? "No requests yet" : "Nothing here"}
            hint={
              filter === "all"
                ? "New commission requests from your public page land here."
                : "No requests with this status."
            }
          />
        ) : (
          rows.map((r) => (
            <RequestRow key={r.id} req={r} onOpen={() => setSelected(r)} />
          ))
        )}
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent>
          {selected && (
            <RequestDetail req={selected} onDone={() => setSelected(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
