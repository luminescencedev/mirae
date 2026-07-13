import { useEffect, useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Icon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@mirae/ui";
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import {
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  type AppearanceSection,
  type StudioAppearance,
} from "@mirae/shared";
import { artistApi } from "../../lib/api.ts";

const SECTION_LABELS: Record<AppearanceSection, string> = {
  links: "Featured links",
  about: "About",
  work: "Selected work",
  commissions: "Commissions",
  faq: "FAQ",
  elsewhere: "Elsewhere links",
};

function SectionRow({ id }: { id: AppearanceSection }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        onPointerDown={(e) => controls.start(e)}
        className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-md text-fg-subtle hover:bg-surface-muted hover:text-fg active:cursor-grabbing"
      >
        <Icon icon={DragDropVerticalIcon} size={14} />
      </button>
      <span className="text-sm text-fg">{SECTION_LABELS[id]}</span>
    </Reorder.Item>
  );
}

const KEY = ["artist", "me"];

const ACCENTS: StudioAppearance["accent"][] = [
  "blue",
  "lavender",
  "rose",
  "mint",
  "amber",
  "mono",
];
const TYPO: StudioAppearance["typography"][] = ["clean", "editorial", "soft"];
const HERO: StudioAppearance["heroLayout"][] = ["cover", "split", "minimal"];
const PORTFOLIO: StudioAppearance["portfolioLayout"][] = [
  "editorial",
  "grid",
  "compact",
];
const RADIUS: StudioAppearance["imageRadius"][] = ["soft", "medium", "minimal"];

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-fg">{label}</span>
      {children}
    </div>
  );
}

function PickSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="w-40 capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="capitalize">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AppearanceEditor() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: KEY, queryFn: artistApi.me });
  const [cfg, setCfg] = useState<StudioAppearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    if (profile?.appearance) setCfg(normalizeAppearance(profile.appearance));
  }, [profile]);

  const set = <K extends keyof StudioAppearance>(
    k: K,
    v: StudioAppearance[K],
  ) => setCfg((c) => ({ ...c, [k]: v }));

  const save = useMutation({
    mutationFn: () => artistApi.update({ appearance: cfg }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return (
    <section className="flex flex-col">
      <p className="text-sm text-fg-subtle">
        How your public page looks — applies live.
      </p>

      <div className="mt-3 divide-y divide-border">
        <Row label="Accent">
          <PickSelect
            value={cfg.accent}
            options={ACCENTS}
            onChange={(v) => set("accent", v)}
          />
        </Row>
        <Row label="Typography">
          <PickSelect
            value={cfg.typography}
            options={TYPO}
            onChange={(v) => set("typography", v)}
          />
        </Row>
        <Row label="Hero layout">
          <PickSelect
            value={cfg.heroLayout}
            options={HERO}
            onChange={(v) => set("heroLayout", v)}
          />
        </Row>
        <Row label="Portfolio layout">
          <PickSelect
            value={cfg.portfolioLayout}
            options={PORTFOLIO}
            onChange={(v) => set("portfolioLayout", v)}
          />
        </Row>
        <Row label="Image corners">
          <PickSelect
            value={cfg.imageRadius}
            options={RADIUS}
            onChange={(v) => set("imageRadius", v)}
          />
        </Row>
        <Row label="Show bio">
          <Switch
            checked={cfg.showBio}
            onCheckedChange={(v) => set("showBio", v)}
          />
        </Row>
        <Row label="Show links">
          <Switch
            checked={cfg.showSocials}
            onCheckedChange={(v) => set("showSocials", v)}
          />
        </Row>
        <Row label="Show “Powered by Mirae”">
          <Switch
            checked={cfg.showPoweredBy}
            onCheckedChange={(v) => set("showPoweredBy", v)}
          />
        </Row>
      </div>

      {/* Section order */}
      <div className="mt-6">
        <p className="mb-1 text-sm font-medium text-fg">Section order</p>
        <p className="mb-3 text-xs text-fg-subtle">
          Drag to reorder the blocks on your public page.
        </p>
        <Reorder.Group
          as="div"
          axis="y"
          values={cfg.sectionOrder}
          onReorder={(v) =>
            set("sectionOrder", v as StudioAppearance["sectionOrder"])
          }
          className="flex flex-col gap-1.5"
        >
          {cfg.sectionOrder.map((s) => (
            <SectionRow key={s} id={s} />
          ))}
        </Reorder.Group>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save appearance"}
        </Button>
        {save.isSuccess && !save.isPending && (
          <span className="text-sm text-emerald-600">Saved</span>
        )}
      </div>
    </section>
  );
}
