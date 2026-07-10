import {
  Badge,
  Button,
  Icon,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  cn,
} from "@mirae/ui";
import { ArrowRight01Icon, Message01Icon } from "@hugeicons/core-free-icons";
import type { Commission } from "../mockups/seed.ts";

const STAGES = [
  "New request",
  "Quote sent",
  "In progress",
  "Review",
  "Delivered",
];

// Map a commission's status label to its stage index.
function stageIndex(label: string): number {
  if (label === "Needs quote") return 1;
  if (label === "Sketch" || label === "Line art") return 2;
  if (label === "Revision 1" || label === "Final review") return 3;
  if (label === "Delivered") return 4;
  return 0;
}

export function CommissionDetail({ item }: { item: Commission }) {
  const current = stageIndex(item.statusLabel);

  return (
    <>
      <SheetHeader className="pr-12">
        <p className="text-xs text-fg-subtle">Client · {item.client}</p>
        <SheetTitle className="mt-0.5">{item.type}</SheetTitle>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.tags.map((t) => (
            <Badge key={t.label} variant={t.variant}>
              {t.label}
            </Badge>
          ))}
        </div>
      </SheetHeader>

      <SheetBody className="flex flex-col gap-6">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface-muted p-3">
            <p className="text-xs text-fg-subtle">Quote</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-fg">
              {item.price}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-muted p-3">
            <p className="text-xs text-fg-subtle">Deadline</p>
            <p className="mt-1 text-lg font-semibold text-fg">{item.due}</p>
          </div>
        </div>

        {/* Status timeline */}
        <div>
          <p className="mb-3 text-sm font-semibold">Status</p>
          <ol className="flex flex-col gap-0.5">
            {STAGES.map((s, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={s} className="flex items-center gap-3 py-1">
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full",
                      active
                        ? "bg-accent-500"
                        : done
                          ? "bg-emerald-500"
                          : "bg-surface-sunken ring-1 ring-inset ring-border",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        active || done ? "bg-white" : "bg-fg-subtle",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      active
                        ? "font-medium text-fg"
                        : done
                          ? "text-fg-muted"
                          : "text-fg-subtle",
                    )}
                  >
                    {s}
                  </span>
                  {active && (
                    <span className="ml-auto text-xs text-accent-700">
                      {item.statusLabel}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Brief */}
        <div>
          <p className="mb-2 text-sm font-semibold">Brief</p>
          <p className="text-sm leading-relaxed text-fg-muted">
            {item.client} requested a {item.type.toLowerCase()}. References
            attached in the client portal; palette and pose notes included. Two
            revision rounds agreed.
          </p>
        </div>
      </SheetBody>

      <SheetFooter>
        <Button variant="outline" className="flex-1">
          <Icon icon={Message01Icon} strokeWidth={1.8} />
          Message
        </Button>
        <Button className="flex-1">
          Advance status
          <Icon icon={ArrowRight01Icon} strokeWidth={1.8} />
        </Button>
      </SheetFooter>
    </>
  );
}
