import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Icon, Input, cn } from "@mirae/ui";
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { quotesApi, type QuoteStatus } from "../../lib/api.ts";

type Row = { label: string; amount: string; quantity: string };

const EMPTY: Row = { label: "", amount: "", quantity: "1" };

// Parse a euro input ("150", "150.50") to integer cents.
function toCents(amount: string): number {
  const n = Number(amount.replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

const euro = (cents: number) => `€${(cents / 100).toLocaleString()}`;

const STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
};

export function QuoteEditor({ commissionId }: { commissionId: string }) {
  const qc = useQueryClient();
  const key = ["commissions", commissionId, "quote"];
  const { data: quote, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => quotesApi.get(commissionId),
  });

  const [rows, setRows] = useState<Row[]>([EMPTY]);

  useEffect(() => {
    if (quote && quote.items.length) {
      setRows(
        quote.items.map((it) => ({
          label: it.label,
          amount: String(it.amountCents / 100),
          quantity: String(it.quantity),
        })),
      );
    }
  }, [quote]);

  const total = rows.reduce(
    (s, r) => s + toCents(r.amount) * (Number(r.quantity) || 1),
    0,
  );

  const save = useMutation({
    mutationFn: () =>
      quotesApi.save(
        commissionId,
        rows
          .filter((r) => r.label.trim())
          .map((r) => ({
            label: r.label.trim(),
            amountCents: toCents(r.amount),
            quantity: Number(r.quantity) || 1,
          })),
      ),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: key }),
        qc.invalidateQueries({ queryKey: ["commissions"] }),
      ]),
  });

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { ...EMPTY }]);
  const removeRow = (i: number) =>
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((_, j) => j !== i)));

  if (isLoading) {
    return <p className="text-sm text-fg-subtle">Loading quote…</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <p className="text-sm font-semibold">Quote</p>
        {quote && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              quote.status === "sent"
                ? "bg-accent-50 text-accent-700"
                : quote.status === "accepted"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-surface-sunken text-fg-muted",
            )}
          >
            {STATUS_LABEL[quote.status]}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={r.label}
              onChange={(e) => setRow(i, { label: e.target.value })}
              placeholder="Line item"
              className="flex-1"
            />
            <Input
              value={r.quantity}
              onChange={(e) =>
                setRow(i, { quantity: e.target.value.replace(/[^0-9]/g, "") })
              }
              inputMode="numeric"
              className="w-14 text-center"
              aria-label="Quantity"
            />
            <Input
              value={r.amount}
              onChange={(e) => setRow(i, { amount: e.target.value })}
              inputMode="decimal"
              placeholder="0"
              className="w-24 text-right tabular-nums"
              aria-label="Amount (€)"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              className="rounded-md p-1.5 text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg disabled:opacity-40"
              aria-label="Remove line"
            >
              <Icon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 outline-none hover:text-accent-800"
      >
        <Icon icon={Add01Icon} size={16} strokeWidth={1.8} />
        Add line
      </button>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-fg-muted">Total</span>
        <span className="text-lg font-semibold tabular-nums text-fg">
          {euro(total)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending || total === 0}
        >
          {save.isPending ? "Saving…" : "Save quote"}
        </Button>
        {save.isSuccess && !save.isPending && (
          <span className="text-sm text-emerald-600">Saved</span>
        )}
      </div>
    </div>
  );
}
