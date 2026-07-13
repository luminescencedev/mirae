import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Icon,
  Input,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
  cn,
} from "@mirae/ui";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { publicApi, type CommissionType } from "../../lib/api.ts";

const euro = (cents: number | null) =>
  cents == null ? "—" : `€${(cents / 100).toLocaleString()}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fiverr-like request flow: pick a commission type (required, artist-fixed
// price), write a brief, leave contact details, send. One focused drawer.
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
  const [typeId, setTypeId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      publicApi.submitRequest(handle, {
        clientName: name.trim(),
        clientEmail: email.trim(),
        commissionTypeId: typeId,
        message: brief.trim(),
      }),
  });

  // Preselect on open (the clicked type, or the only type); reset on close.
  useEffect(() => {
    if (open) {
      setTypeId(initialTypeId ?? (types.length === 1 ? types[0].id : null));
    } else {
      setName("");
      setEmail("");
      setBrief("");
      submit.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selected = types.find((t) => t.id === typeId) ?? null;
  const valid =
    !!typeId && name.trim() && EMAIL_RE.test(email.trim()) && brief.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-lg">
        <SheetHeader>
          <SheetTitle>Request a commission</SheetTitle>
          <SheetDescription>
            Tell {studioName} what you have in mind — no account needed.
          </SheetDescription>
        </SheetHeader>

        {submit.isSuccess ? (
          <SheetBody className="grid place-items-center py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <span className="text-emerald-600">
                <Icon icon={CheckmarkCircle02Icon} size={40} />
              </span>
              <p className="text-base font-semibold text-fg">Request sent</p>
              <p className="max-w-xs text-sm text-fg-muted">
                {studioName} will get back to you by email. You can close this.
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </SheetBody>
        ) : (
          <>
            <SheetBody className="flex flex-col gap-6">
              {/* 1 — type (required, fixed price) */}
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 text-sm font-medium text-fg">
                  Choose a type
                </legend>
                {types.length === 0 && (
                  <p className="text-sm text-fg-subtle">
                    No commission types available.
                  </p>
                )}
                {types.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTypeId(t.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500",
                      typeId === t.id
                        ? "border-accent-500 bg-accent-50"
                        : "border-border hover:border-border-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-full border",
                        typeId === t.id
                          ? "border-accent-500"
                          : "border-border-strong",
                      )}
                    >
                      {typeId === t.id && (
                        <span className="size-2 rounded-full bg-accent-500" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">
                        {t.name}
                      </span>
                      {t.turnaround && (
                        <span className="block text-xs text-fg-subtle">
                          {t.turnaround}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-fg">
                      {euro(t.priceFromCents)}
                    </span>
                  </button>
                ))}
              </fieldset>

              {/* 2 — brief */}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fg">Brief</span>
                <Textarea
                  rows={4}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="What do you want? Style, references (links), usage…"
                />
              </label>

              {/* 3 — contact */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-fg">Your name</span>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-fg">Email</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>

              {submit.isError && (
                <p className="text-sm text-red-600">
                  {(submit.error as Error).message}
                </p>
              )}
            </SheetBody>

            <SheetFooter className="flex-col items-stretch gap-2">
              {selected && (
                <p className="text-center text-xs text-fg-subtle">
                  You’re requesting <b className="text-fg">{selected.name}</b> ·{" "}
                  <b className="text-fg">{euro(selected.priceFromCents)}</b>
                </p>
              )}
              <Button
                onClick={() => submit.mutate()}
                disabled={!valid || submit.isPending}
              >
                {submit.isPending ? "Sending…" : "Send request"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
