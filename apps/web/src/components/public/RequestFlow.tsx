import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { Button, Icon, Input, Textarea, cn } from "@mirae/ui";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import {
  publicApi,
  trackStudioEvent,
  type CommissionType,
} from "../../lib/api.ts";

const EASE = [0.23, 1, 0.32, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const euro = (c: number | null) =>
  c == null ? "—" : `€${(c / 100).toLocaleString()}`;

type Draft = {
  typeId: string | null;
  brief: string;
  budget: string;
  deadline: string;
  name: string;
  email: string;
};

const EMPTY: Draft = {
  typeId: null,
  brief: "",
  budget: "",
  deadline: "",
  name: "",
  email: "",
};

const STEPS = ["Type", "Brief", "You", "Review"] as const;

/** Reusable multi-step commission request flow (used by the drawer + the
 *  standalone /@handle/request page). Fiverr-like: a commission type must be
 *  chosen. Draft persists to localStorage so a refresh doesn't lose progress. */
export function RequestFlow({
  handle,
  studioName,
  types,
  initialTypeId = null,
  onDone,
}: {
  handle: string;
  studioName: string;
  types: CommissionType[];
  initialTypeId?: string | null;
  onDone?: () => void;
}) {
  const reduce = useReducedMotion();
  const storageKey = `mirae-request-${handle.replace(/^@/, "")}`;

  // Analytics: the flow starting = a request start.
  useEffect(() => {
    trackStudioEvent(handle, "request_start");
  }, [handle]);

  const [draft, setDraft] = useState<Draft>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return { ...EMPTY, ...(JSON.parse(saved) as Draft) };
      } catch {
        // ignore malformed draft
      }
    }
    return { ...EMPTY, typeId: initialTypeId };
  });
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  // Prefill the clicked type even if a draft existed without one.
  useEffect(() => {
    if (initialTypeId) setDraft((d) => (d.typeId ? d : { ...d, typeId: initialTypeId }));
  }, [initialTypeId]);

  // Persist the draft (cleared on success).
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // storage may be unavailable (private mode) — non-fatal
    }
  }, [draft, storageKey]);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [touched, setTouched] = useState(false);

  const selectedType = useMemo(
    () => types.find((t) => t.id === draft.typeId) ?? null,
    [types, draft.typeId],
  );

  // Per-step validity.
  const stepValid = [
    !!draft.typeId,
    draft.brief.trim().length > 0,
    draft.name.trim().length > 0 && EMAIL_RE.test(draft.email.trim()),
    true,
  ];

  const submit = useMutation({
    mutationFn: () =>
      publicApi.submitRequest(handle, {
        clientName: draft.name.trim(),
        clientEmail: draft.email.trim(),
        commissionTypeId: draft.typeId,
        budget: draft.budget.trim() || null,
        deadline: draft.deadline.trim() || null,
        message: draft.brief.trim(),
      }),
    onSuccess: () => {
      trackStudioEvent(handle, "request_submit");
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    },
  });

  const go = (d: 1 | -1) => {
    if (d === 1 && !stepValid[step]) {
      setTouched(true);
      return;
    }
    setTouched(false);
    setDir(d);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d)));
  };

  if (submit.isSuccess) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <motion.span
          initial={reduce ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
          className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
        >
          <Icon icon={CheckmarkCircle02Icon} size={28} strokeWidth={1.8} />
        </motion.span>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-fg">
          Request sent
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-fg-muted">
          {studioName} will review it and reply with a quote by email. You can
          close this.
        </p>
        {onDone && (
          <Button variant="outline" className="mt-6" onClick={onDone}>
            Done
          </Button>
        )}
      </div>
    );
  }

  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: dir * 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -24 },
      };

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1">
            <span
              className={cn(
                "h-1 rounded-full transition-colors",
                i <= step ? "bg-accent-500" : "bg-surface-muted",
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                i === step ? "text-accent-700" : "text-fg-subtle",
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            {...slide}
            transition={{ duration: 0.22, ease: EASE }}
            className="flex flex-col gap-4"
          >
            {step === 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-fg-muted">
                  Pick what you’d like to commission.
                </p>
                {types.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set("typeId", t.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500",
                      draft.typeId === t.id
                        ? "border-accent-500 bg-accent-50/60 ring-1 ring-accent-500"
                        : "border-border hover:border-border-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-full border",
                        draft.typeId === t.id
                          ? "border-accent-500 bg-accent-500"
                          : "border-border-strong",
                      )}
                    >
                      {draft.typeId === t.id && (
                        <span className="size-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-fg">
                        {t.name}
                      </span>
                      {t.turnaround && (
                        <span className="block truncate text-xs text-fg-subtle">
                          {t.turnaround}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-fg">
                      {euro(t.priceFromCents)}
                    </span>
                  </button>
                ))}
                {touched && !stepValid[0] && (
                  <p className="text-xs text-red-600">
                    Choose a commission type to continue.
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-fg">Brief</span>
                  <Textarea
                    rows={5}
                    value={draft.brief}
                    onChange={(e) => set("brief", e.target.value)}
                    placeholder="Describe your idea, character, palette, reference links…"
                    autoFocus
                  />
                  {touched && !stepValid[1] && (
                    <span className="text-xs text-red-600">
                      A brief is required.
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-fg">Budget</span>
                    <Input
                      value={draft.budget}
                      onChange={(e) => set("budget", e.target.value)}
                      placeholder="€150–200"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-fg">Deadline</span>
                    <Input
                      value={draft.deadline}
                      onChange={(e) => set("deadline", e.target.value)}
                      placeholder="Flexible"
                    />
                  </label>
                </div>
                <p className="text-xs text-fg-subtle">
                  Reference file uploads are coming soon — paste links in the
                  brief for now.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-fg">Your name</span>
                  <Input
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Alex"
                    autoFocus
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-fg">Email</span>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={draft.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@email.com"
                  />
                </label>
                {touched && !stepValid[2] && (
                  <p className="text-xs text-red-600">
                    A name and a valid email are required.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <dl className="flex flex-col divide-y divide-border rounded-xl border border-border">
                {[
                  ["Commission", selectedType?.name ?? "—"],
                  ["Price from", euro(selectedType?.priceFromCents ?? null)],
                  ["Budget", draft.budget || "—"],
                  ["Deadline", draft.deadline || "Flexible"],
                  ["Name", draft.name],
                  ["Email", draft.email],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-4 px-3.5 py-2.5"
                  >
                    <dt className="text-xs uppercase tracking-wide text-fg-subtle">
                      {k}
                    </dt>
                    <dd className="min-w-0 flex-1 truncate text-right text-sm font-medium text-fg">
                      {v}
                    </dd>
                  </div>
                ))}
                <div className="px-3.5 py-2.5">
                  <dt className="text-xs uppercase tracking-wide text-fg-subtle">
                    Brief
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-sm text-fg-muted">
                    {draft.brief}
                  </dd>
                </div>
              </dl>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {submit.isError && (
        <p className="text-sm text-red-600">
          {(submit.error as Error).message}
        </p>
      )}

      {/* Nav */}
      <div className="flex items-center gap-2">
        {step > 0 && (
          <Button variant="ghost" onClick={() => go(-1)}>
            <Icon icon={ArrowLeft01Icon} strokeWidth={1.8} />
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button className="ml-auto flex-1" onClick={() => go(1)}>
            Continue
            <Icon icon={ArrowRight01Icon} strokeWidth={1.8} />
          </Button>
        ) : (
          <Button
            className="ml-auto flex-1"
            disabled={submit.isPending}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? "Sending…" : "Send request"}
          </Button>
        )}
      </div>
    </div>
  );
}
