import { Badge, SheetBody, SheetHeader, SheetTitle, cn } from "@mirae/ui";
import { type QueueCommission } from "../../lib/api.ts";
import { STATUS_META, dueLabel, euro } from "../../lib/commissions.ts";

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3">
      <p className="text-xs text-fg-subtle">{label}</p>
      <p className="mt-1 text-sm font-semibold text-fg">{children}</p>
    </div>
  );
}

export function CommissionDetail({ item }: { item: QueueCommission }) {
  const meta = STATUS_META[item.status];

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
    </>
  );
}
