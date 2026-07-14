import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Icon, Input, Textarea } from "@mirae/ui";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { MAX_FAQ_ITEMS, type FaqItem } from "@mirae/shared";
import { artistApi } from "../../lib/api.ts";

const KEY = ["artist", "me"];

export function AboutEditor() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: KEY, queryFn: artistApi.me });
  const [about, setAbout] = useState("");
  const [faq, setFaq] = useState<FaqItem[]>([]);

  useEffect(() => {
    if (!profile) return;
    setAbout(profile.about ?? "");
    setFaq(profile.faq ?? []);
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      artistApi.update({
        about,
        faq: faq.filter((f) => f.q.trim() && f.a.trim()),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const setItem = (i: number, patch: Partial<FaqItem>) =>
    setFaq((f) => f.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const addItem = () =>
    setFaq((f) => (f.length >= MAX_FAQ_ITEMS ? f : [...f, { q: "", a: "" }]));
  const removeItem = (i: number) => setFaq((f) => f.filter((_, j) => j !== i));

  return (
    <section className="flex flex-col gap-6">
      <p className="text-sm text-fg-subtle">
        A longer intro and answers to common questions, shown on your public
        page.
      </p>

      {/* About */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-fg">About</label>
        <Textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Tell visitors about your work, process, what you love to draw…"
          rows={5}
          className="resize-none"
        />
      </div>

      {/* FAQ */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-fg">FAQ</label>
          <Button
            size="sm"
            variant="outline"
            onClick={addItem}
            disabled={faq.length >= MAX_FAQ_ITEMS}
          >
            <Icon icon={Add01Icon} size={15} strokeWidth={1.8} />
            Add question
          </Button>
        </div>

        {faq.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-fg-subtle">
            No questions yet — add turnaround, revisions, usage rights…
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {faq.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={item.q}
                    onChange={(e) => setItem(i, { q: e.target.value })}
                    placeholder="Question"
                    className="h-9 flex-1 font-medium"
                  />
                  <button
                    type="button"
                    aria-label="Remove question"
                    onClick={() => removeItem(i)}
                    className="grid size-9 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon icon={Delete02Icon} size={16} />
                  </button>
                </div>
                <Textarea
                  value={item.a}
                  onChange={(e) => setItem(i, { a: e.target.value })}
                  placeholder="Answer"
                  rows={2}
                  className="resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
        {save.isSuccess && !save.isPending && (
          <span className="text-sm text-emerald-600">Saved</span>
        )}
      </div>
    </section>
  );
}
