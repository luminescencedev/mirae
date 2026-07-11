import { useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "../../lib/commissions.ts";

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
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
  const next = idx >= 0 && idx < STATUS_ORDER.length - 1
    ? STATUS_ORDER[idx + 1]
    : null;

  const setStatus = useMutation({
    mutationFn: (status: CommissionStatus) =>
      commissionsApi.update(item.id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commissions"] }),
  });

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
                <span className={cn("size-1.5 rounded-full", STATUS_META[s].dot)} />
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
