import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@mirae/ui";
import { type CommissionType } from "../../lib/api.ts";
import { RequestFlow } from "./RequestFlow.tsx";

// Fiverr-like request flow in a slide-over (full-screen on mobile). The
// multi-step flow lives in RequestFlow, shared with the standalone page.
export function RequestDrawer({
  handle,
  studioName,
  types,
  open,
  onOpenChange,
  initialTypeId,
}: {
  handle: string;
  studioName: string;
  types: CommissionType[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialTypeId?: string | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="pr-0">
        <SheetHeader className="pr-12">
          <SheetTitle>Request a commission</SheetTitle>
          <SheetDescription>
            {studioName} · fixed-price services
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {open && (
            // key remounts the flow per open so step/draft state is fresh.
            <RequestFlow
              key={initialTypeId ?? "new"}
              handle={handle}
              studioName={studioName}
              types={types}
              initialTypeId={initialTypeId ?? null}
              onDone={() => onOpenChange(false)}
            />
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
