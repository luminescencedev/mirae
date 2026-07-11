import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  cn,
} from "@mirae/ui";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { QuoteEditor } from "./QuoteEditor.tsx";
import { DeliverySection } from "./DeliverySection.tsx";
import {
  commissionsApi,
  type CommissionStatus,
  type QueueCommission,
} from "../../lib/api.ts";
import {
  STATUS_META,
  STATUS_ORDER,
  dueLabel,
  euro,
  milestones,
} from "../../lib/commissions.ts";

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3">
      <p className="text-xs text-fg-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-fg">{children}</p>
    </div>
  );
}

export function CommissionDetail({ item }: { item: QueueCommission }) {
  const qc = useQueryClient();
  const meta = STATUS_META[item.status];
  const idx = STATUS_ORDER.indexOf(item.status);
  const next =
    idx >= 0 && idx < STATUS_ORDER.length - 1 ? STATUS_ORDER[idx + 1] : null;

  const activityKey = ["commissions", item.id, "activity"];
  const { data: activity = [] } = useQuery({
    queryKey: activityKey,
    queryFn: () => commissionsApi.activity(item.id),
  });

  const invalidate = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["commissions"] }),
      qc.invalidateQueries({ queryKey: activityKey }),
    ]);

  const setStatus = useMutation({
    mutationFn: (status: CommissionStatus) =>
      commissionsApi.update(item.id, { status }),
    onSuccess: invalidate,
  });

  const pay = useMutation({
    mutationFn: (paidCents: number) =>
      commissionsApi.update(item.id, { paidCents }),
    onSuccess: invalidate,
  });

  const genPortal = useMutation({
    mutationFn: () => commissionsApi.generatePortal(item.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commissions"] }),
  });

  const portalUrl = item.portalToken
    ? `${window.location.origin}/portal/${item.portalToken}`
    : null;

  const price = item.priceCents ?? 0;
  const paidState =
    item.paidCents <= 0
      ? { label: "Unpaid", cls: "bg-surface-sunken text-fg-muted" }
      : price > 0 && item.paidCents >= price
        ? { label: "Paid", cls: "bg-emerald-50 text-emerald-700" }
        : { label: "Partial", cls: "bg-amber-50 text-amber-700" };

  return (
    <>
      <SheetHeader className="pr-12">
        <p className="text-xs text-fg-subtle">
          Client · {item.clientName ?? "—"}
        </p>
        <SheetTitle className="mt-0.5">{item.title}</SheetTitle>
        <div className="mt-2">
          <Badge variant="neutral">
            <span className={cn("mr-1.5 size-1.5 rounded-full", meta.dot)} />
            {meta.label}
          </Badge>
        </div>
      </SheetHeader>

      <SheetBody className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <Meta label="Price">{euro(item.priceCents)}</Meta>
          <Meta label="Paid">{euro(item.paidCents)}</Meta>
          <Meta label="Deadline">{dueLabel(item.deadline)}</Meta>
          <Meta label="Client email">
            {item.clientEmail ? (
              <a
                href={`mailto:${item.clientEmail}`}
                className="text-accent-700 hover:underline"
              >
                {item.clientEmail}
              </a>
            ) : (
              "—"
            )}
          </Meta>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Progress</p>
          <ol className="flex flex-col gap-0.5">
            {milestones(item.status).map((m) => (
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
                {m.state === "active" && (
                  <span className="ml-auto text-xs text-accent-700">
                    {meta.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Client portal</p>
          {portalUrl ? (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={portalUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-md border border-border bg-surface-muted px-2.5 py-1.5 text-xs text-fg-muted outline-none"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard?.writeText(portalUrl)}
              >
                Copy
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={genPortal.isPending}
              onClick={() => genPortal.mutate()}
            >
              {genPortal.isPending ? "Generating…" : "Generate portal link"}
            </Button>
          )}
        </div>

        <QuoteEditor commissionId={item.id} />

        <div>
          <div className="mb-3 flex items-center gap-2">
            <p className="text-sm font-semibold">Payment</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                paidState.cls,
              )}
            >
              {paidState.label}
            </span>
            <span className="ml-auto text-sm tabular-nums text-fg-muted">
              {euro(item.paidCents)} / {euro(item.priceCents)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pay.isPending || price <= 0}
              onClick={() => pay.mutate(Math.round(price / 2))}
            >
              Deposit 50%
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pay.isPending || price <= 0}
              onClick={() => pay.mutate(price)}
            >
              Mark paid
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={pay.isPending || item.paidCents === 0}
              onClick={() => pay.mutate(0)}
            >
              Clear
            </Button>
          </div>
          {price <= 0 && (
            <p className="mt-2 text-xs text-fg-subtle">
              Set a price (save a quote) to record payment.
            </p>
          )}
        </div>

        <DeliverySection commissionId={item.id} />

        <div>
          <p className="mb-3 text-sm font-semibold">Activity</p>
          {activity.length === 0 ? (
            <p className="text-sm text-fg-subtle">No activity yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border-strong" />
                  <div className="min-w-0">
                    <p className="text-sm text-fg">{a.message}</p>
                    <p className="text-xs text-fg-subtle">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </SheetBody>

      <SheetFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={setStatus.isPending}>
              Change status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_ORDER.map((s) => (
              <DropdownMenuItem
                key={s}
                onSelect={() => setStatus.mutate(s)}
                className={cn(s === item.status && "bg-surface-muted")}
              >
                <span
                  className={cn("size-1.5 rounded-full", STATUS_META[s].dot)}
                />
                {STATUS_META[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {next && (
          <Button
            className="flex-1"
            disabled={setStatus.isPending}
            onClick={() => setStatus.mutate(next)}
          >
            Advance to {STATUS_META[next].label}
            <Icon icon={ArrowRight01Icon} strokeWidth={1.8} />
          </Button>
        )}
      </SheetFooter>
    </>
  );
}
