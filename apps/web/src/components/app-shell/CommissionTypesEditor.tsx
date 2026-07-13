import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  Input,
  Textarea,
} from "@mirae/ui";
import {
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { commissionTypesApi, type CommissionType } from "../../lib/api.ts";

const KEY = ["commission-types"];

const euro = (cents: number | null) =>
  cents == null ? "—" : `€${(cents / 100).toLocaleString()}`;

type FormState = {
  name: string;
  price: string;
  turnaround: string;
  slots: string;
  blurb: string;
};

const EMPTY: FormState = {
  name: "",
  price: "",
  turnaround: "",
  slots: "",
  blurb: "",
};

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-fg">{children}</span>;
}

export function CommissionTypesEditor() {
  const qc = useQueryClient();
  const { data: types, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: commissionTypesApi.list,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CommissionType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const set = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const save = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name.trim(),
        blurb: form.blurb.trim() || null,
        priceFromCents: form.price
          ? Math.round(Number(form.price) * 100)
          : null,
        turnaround: form.turnaround.trim() || null,
        slots: form.slots ? Number(form.slots) : null,
      };
      return editing
        ? commissionTypesApi.update(editing.id, body)
        : commissionTypesApi.create(body);
    },
    onSuccess: () => {
      invalidate();
      setOpen(false);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => commissionTypesApi.remove(id),
    onSuccess: invalidate,
  });

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function openEdit(t: CommissionType) {
    setEditing(t);
    setForm({
      name: t.name,
      price: t.priceFromCents != null ? String(t.priceFromCents / 100) : "",
      turnaround: t.turnaround ?? "",
      slots: t.slots != null ? String(t.slots) : "",
      blurb: t.blurb ?? "",
    });
    setOpen(true);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-fg-subtle">
          Fixed-price services visitors can request from your public page.
        </p>
        <Button size="sm" onClick={openAdd}>
          <Icon icon={Add01Icon} strokeWidth={1.8} />
          Add type
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle shadow-soft">
          Loading…
        </div>
      ) : !types || types.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-fg-muted">No commission types yet.</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={openAdd}
          >
            <Icon icon={Add01Icon} strokeWidth={1.8} />
            Add your first
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
          {types.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-fg">
                    {t.name}
                  </span>
                  {t.slots != null && (
                    <Badge variant="emerald">{t.slots} slots</Badge>
                  )}
                </div>
                {t.blurb && (
                  <p className="mt-0.5 truncate text-xs text-fg-muted">
                    {t.blurb}
                  </p>
                )}
              </div>
              <span className="w-24 text-right text-xs text-fg-muted">
                {t.turnaround ?? "—"}
              </span>
              <span className="w-16 text-right text-sm font-semibold tabular-nums text-fg">
                {euro(t.priceFromCents)}
              </span>
              <button
                onClick={() => openEdit(t)}
                aria-label="Edit"
                className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
              >
                <Icon icon={Edit02Icon} size={16} strokeWidth={1.8} />
              </button>
              <button
                onClick={() => remove.mutate(t.id)}
                aria-label="Delete"
                className="rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface-muted hover:text-red-600"
              >
                <Icon icon={Delete02Icon} size={16} strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit commission type" : "New commission type"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <label className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Character illustration"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <Label>From (€)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="150"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <Label>Slots</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.slots}
                  onChange={(e) => set("slots", e.target.value)}
                  placeholder="3"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <Label>Turnaround</Label>
              <Input
                value={form.turnaround}
                onChange={(e) => set("turnaround", e.target.value)}
                placeholder="~2 weeks"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <Label>Blurb</Label>
              <Textarea
                rows={2}
                value={form.blurb}
                onChange={(e) => set("blurb", e.target.value)}
                placeholder="Full-body or half-body, rendered."
              />
            </label>
            {save.error && (
              <p className="text-sm text-red-600">
                {(save.error as Error).message}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
