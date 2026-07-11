import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Icon,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
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
  const badge = STATUS_BADGE[req.status];
  const { deadline, brief } = splitMessage(req.message);
  const submitted = new Date(req.createdAt).toLocaleString();

  const setStatus = useMutation({
    mutationFn: (status: "accepted" | "declined") =>
      requestsApi.setStatus(req.id, status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["requests"] });
      onDone();
    },
  });

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
        <SheetFooter>
          <Button
            variant="outline"
            className="flex-1"
            disabled={setStatus.isPending}
            onClick={() => setStatus.mutate("declined")}
          >
            <Icon icon={Cancel01Icon} strokeWidth={2} />
            Decline
          </Button>
          <Button
            className="flex-1"
            disabled={setStatus.isPending}
            onClick={() => setStatus.mutate("accepted")}
          >
            <Icon icon={Tick02Icon} strokeWidth={2} />
            Accept
          </Button>
        </SheetFooter>
      )}
    </>
  );
}
