import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "@mirae/ui";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import { requestsApi } from "../../lib/api.ts";

// Compact relative time.
function ago(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export function NotificationsMenu() {
  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: requestsApi.list,
  });
  const news = requests.filter((r) => r.status === "new");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Notifications${news.length ? ` (${news.length} new)` : ""}`}
          className="relative ml-auto rounded-md p-1.5 text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <Icon icon={Notification03Icon} size={18} strokeWidth={1.7} />
          {news.length > 0 && (
            <span className="absolute right-1 top-1 size-2 rounded-full bg-accent-500 ring-2 ring-surface" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {news.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-fg-subtle">
            You're all caught up.
          </p>
        ) : (
          news.slice(0, 8).map((r) => (
            <DropdownMenuItem key={r.id} asChild>
              <Link to="/app/requests" className="flex items-start gap-1">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-fg">
                    New request from {r.clientName}
                  </span>
                  <span className="block truncate text-xs text-fg-subtle">
                    {r.commissionTypeName ?? "No type"}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-fg-subtle">
                  {ago(r.createdAt)}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
