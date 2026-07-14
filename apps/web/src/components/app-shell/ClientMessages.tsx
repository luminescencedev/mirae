import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Textarea, cn } from "@mirae/ui";
import { commissionsApi, type PortalThread } from "../../lib/api.ts";

function fmt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Thread({
  commissionId,
  thread,
}: {
  commissionId: string;
  thread: PortalThread;
}) {
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const key = ["commission-threads", commissionId];
  const send = useMutation({
    mutationFn: () =>
      commissionsApi.replyThread(commissionId, thread.id, reply.trim()),
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: key });
    },
  });
  const resolved = thread.status === "resolved";

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
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
      <ul className="flex flex-col gap-2">
        {thread.messages.map((m) => {
          const mine = m.authorRole === "artist";
          return (
            <li
              key={m.id}
              className={cn("flex flex-col gap-0.5", mine && "items-end")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-1.5 text-sm",
                  mine
                    ? "rounded-br-sm bg-accent-500 text-white"
                    : "rounded-bl-sm bg-surface-muted text-fg",
                )}
              >
                {m.body}
              </div>
              <span className="px-1 text-[11px] text-fg-subtle">
                {mine ? "You" : "Client"} · {fmt(m.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>
      <form
        className="mt-2 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (reply.trim()) send.mutate();
        }}
      >
        <Textarea
          rows={1}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to the client…"
          className="min-h-9 flex-1 resize-none"
        />
        <Button type="submit" size="sm" disabled={!reply.trim() || send.isPending}>
          {send.isPending ? "…" : "Send"}
        </Button>
      </form>
    </div>
  );
}

/** Artist-facing view of the client's portal message threads. */
export function ClientMessages({ commissionId }: { commissionId: string }) {
  const { data } = useQuery({
    queryKey: ["commission-threads", commissionId],
    queryFn: () => commissionsApi.threads(commissionId),
  });
  const threads = data?.threads ?? [];

  return (
    <div>
      <p className="mb-3 text-sm font-semibold">Client messages</p>
      {threads.length === 0 ? (
        <p className="text-sm text-fg-subtle">No client messages yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {threads.map((t) => (
            <Thread key={t.id} commissionId={commissionId} thread={t} />
          ))}
        </div>
      )}
    </div>
  );
}
