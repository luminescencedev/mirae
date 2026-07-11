import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, Icon, cn } from "@mirae/ui";
import {
  DashboardSquare01Icon,
  InboxIcon,
  PaintBrush01Icon,
  Package01Icon,
  Search01Icon,
  Store01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { commissionsApi, requestsApi } from "../../lib/api.ts";

type Result = {
  kind: string;
  label: string;
  hint?: string;
  to: string;
  icon: typeof InboxIcon;
};

const NAV: Result[] = [
  {
    kind: "Go to",
    label: "Overview",
    to: "/app/overview",
    icon: DashboardSquare01Icon,
  },
  { kind: "Go to", label: "Requests", to: "/app/requests", icon: InboxIcon },
  { kind: "Go to", label: "Queue", to: "/app/queue", icon: PaintBrush01Icon },
  { kind: "Go to", label: "Clients", to: "/app/clients", icon: UserGroupIcon },
  {
    kind: "Go to",
    label: "Deliveries",
    to: "/app/deliveries",
    icon: Package01Icon,
  },
  {
    kind: "Go to",
    label: "Studio page",
    to: "/app/studio-page",
    icon: Store01Icon,
  },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: commissions = [] } = useQuery({
    queryKey: ["commissions"],
    queryFn: commissionsApi.list,
    enabled: open,
  });
  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: requestsApi.list,
    enabled: open,
  });

  const results = useMemo<Result[]>(() => {
    const ql = q.trim().toLowerCase();
    const match = (s: string) => !ql || s.toLowerCase().includes(ql);
    const nav = NAV.filter((n) => match(n.label));
    const coms = commissions
      .filter((c) => match(c.title) || match(c.clientName ?? ""))
      .slice(0, 6)
      .map<Result>((c) => ({
        kind: "Commission",
        label: c.title,
        hint: c.clientName ?? undefined,
        to: "/app/queue",
        icon: PaintBrush01Icon,
      }));
    const reqs = requests
      .filter((r) => match(r.clientName) || match(r.commissionTypeName ?? ""))
      .slice(0, 6)
      .map<Result>((r) => ({
        kind: "Request",
        label: r.clientName,
        hint: r.commissionTypeName ?? undefined,
        to: "/app/requests",
        icon: InboxIcon,
      }));
    return [...nav, ...coms, ...reqs];
  }, [q, commissions, requests]);

  const go = (to: string) => {
    onOpenChange(false);
    setQ("");
    navigate({ to });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Search & navigate</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3.5">
          <Icon
            icon={Search01Icon}
            size={16}
            strokeWidth={1.8}
            className="text-fg-subtle"
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].to);
            }}
            placeholder="Search commissions, requests, or jump to a page…"
            className="h-12 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>
        <div className="max-h-80 overflow-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-fg-subtle">
              No matches.
            </p>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.kind}-${r.label}-${i}`}
                type="button"
                onClick={() => go(r.to)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted",
                )}
              >
                <Icon
                  icon={r.icon}
                  size={16}
                  strokeWidth={1.8}
                  className="shrink-0 text-fg-muted"
                />
                <span className="min-w-0 flex-1 truncate text-fg">
                  {r.label}
                  {r.hint && (
                    <span className="text-fg-subtle"> · {r.hint}</span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-fg-subtle">
                  {r.kind}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
