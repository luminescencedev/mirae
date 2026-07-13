import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@mirae/ui";
import { DEFAULT_APPEARANCE, type StudioAppearance } from "@mirae/shared";
import { artistApi } from "../../lib/api.ts";

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
    if (profile?.appearance) setCfg(profile.appearance);
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
    <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">Appearance</h2>
        <span className="text-xs text-fg-subtle">
          Applies to your public page
        </span>
      </div>

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
