import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Icon,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  useToast,
} from "@mirae/ui";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  requestsApi,
  type InboxRequest,
  type RequestStatus,
} from "../../lib/api.ts";

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

// The public form folds an optional deadline into the message as
// "Deadline: <x>\n\n<brief>" — pull it back out for display.
function splitMessage(message: string): {
  deadline: string | null;
  brief: string;
} {
  const m = message.match(/^Deadline:\s*(.+?)\n\n([\s\S]*)$/);
  if (m) return { deadline: m[1], brief: m[2] };
  return { deadline: null, brief: message };
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-fg-subtle">{label}</p>
      <div className="text-sm text-fg">{children}</div>
    </div>
  );
}

export function RequestDetail({
  req,
  onDone,
}: {
  req: InboxRequest;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const badge = STATUS_BADGE[req.status];
  const { deadline, brief } = splitMessage(req.message);
  const submitted = new Date(req.createdAt).toLocaleString();

  const decline = useMutation({
    mutationFn: () => requestsApi.setStatus(req.id, "declined"),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["requests"] });
      toast({ title: "Request declined", variant: "default" });
      onDone();
    },
  });

  // Accept → create a commission and drop it in the queue.
  const accept = useMutation({
    mutationFn: () => requestsApi.convert(req.id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["requests"] }),
        qc.invalidateQueries({ queryKey: ["commissions"] }),
      ]);
      toast({
        title: "Request accepted",
        description: "Added to your commission queue.",
        variant: "success",
      });
      onDone();
    },
  });

  const busy = accept.isPending || decline.isPending;

  return (
    <>
      <SheetHeader className="pr-12">
        <p className="text-xs text-fg-subtle">Request</p>
        <SheetTitle className="mt-0.5">{req.clientName}</SheetTitle>
        <div className="mt-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </SheetHeader>

      <SheetBody className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Row label="Email">
            <a
              href={`mailto:${req.clientEmail}`}
              className="text-accent-700 hover:underline"
            >
              {req.clientEmail}
            </a>
          </Row>
          <Row label="Submitted">{submitted}</Row>
          <Row label="Commission type">{req.commissionTypeName ?? "—"}</Row>
          <Row label="Budget">
            <span className="tabular-nums">{req.budget ?? "—"}</span>
          </Row>
          {deadline && <Row label="Deadline">{deadline}</Row>}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Brief</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-fg-muted">
            {brief}
          </p>
        </div>
      </SheetBody>

      {req.status === "new" && (
        <SheetFooter className="flex-col items-stretch gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={busy}
              onClick={() => decline.mutate()}
            >
              <Icon icon={Cancel01Icon} strokeWidth={2} />
              Decline
            </Button>
            <Button
              className="flex-1"
              disabled={busy}
              onClick={() => accept.mutate()}
            >
              <Icon icon={Tick02Icon} strokeWidth={2} />
              {accept.isPending ? "Accepting…" : "Accept & add to queue"}
            </Button>
          </div>
          {accept.isError && (
            <p className="text-sm text-red-600">
              {(accept.error as Error).message}
            </p>
          )}
        </SheetFooter>
      )}
    </>
  );
}
