import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, LoadingState } from "@mirae/ui";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { requestsApi } from "../../lib/api.ts";

type Client = { email: string; name: string; count: number; lastAt: string };

function ClientsView() {
  const {
    data: requests = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["requests"], queryFn: requestsApi.list });

  // Clients are derived from the requests they've sent (grouped by email).
  const byEmail = new Map<string, Client>();
  for (const r of requests) {
    const key = r.clientEmail.toLowerCase();
    const cur = byEmail.get(key);
    if (cur) {
      cur.count += 1;
      if (r.createdAt > cur.lastAt) {
        cur.lastAt = r.createdAt;
        cur.name = r.clientName;
      }
    } else {
      byEmail.set(key, {
        email: r.clientEmail,
        name: r.clientName,
        count: 1,
        lastAt: r.createdAt,
      });
    }
  }
  const clients = [...byEmail.values()].sort((a, b) =>
    a.lastAt < b.lastAt ? 1 : -1,
  );

  if (isLoading) return <LoadingState label="Loading clients…" />;
  if (isError)
    return (
      <ErrorState hint="Couldn’t load clients." onRetry={() => refetch()} />
    );
  if (clients.length === 0)
    return (
      <EmptyState
        title="No clients yet"
        hint="People who send you a request will show up here."
      />
    );

  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      {clients.map((c) => (
        <div key={c.email} className="flex items-center gap-3 px-4 py-3">
          <span className="size-8 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{c.name}</p>
            <a
              href={`mailto:${c.email}`}
              className="truncate text-xs text-accent-700 hover:underline"
            >
              {c.email}
            </a>
          </div>
          <span className="text-xs text-fg-subtle">
            {c.count} request{c.count === 1 ? "" : "s"}
          </span>
        </div>
      ))}
    </div>
  );
}

function Clients() {
  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Everyone who has sent you a request."
      />
      <div className="px-6 py-6">
        <ClientsView />
      </div>
    </>
  );
}

export const Route = createFileRoute("/app/clients")({ component: Clients });
