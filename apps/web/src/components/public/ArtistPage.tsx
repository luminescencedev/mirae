import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
  Mark,
  Skeleton,
  cn,
} from "@mirae/ui";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { RequestDrawer } from "./RequestDrawer.tsx";
import demoBg from "../../assets/studio-demo-bg.png";
import {
  publicApi,
  trackLinkClick,
  type PublicAsset,
  type PublicStudio,
} from "../../lib/api.ts";

const euro = (cents: number | null) =>
  cents == null ? "—" : `€${(cents / 100).toLocaleString()}`;

const STATUS = {
  open: { label: "Open for commissions", dot: "bg-emerald-500" },
  waitlist: { label: "Waitlist open", dot: "bg-amber-500" },
  closed: { label: "Commissions closed", dot: "bg-fg-subtle" },
} as const;

// Accent presets → override the accent CSS vars the public page reads
// (button, focus ring, featured badge). `blue` is the default theme, no override.
const ACCENT_VARS: Record<string, Record<string, string>> = {
  blue: {},
  lavender: {
    "--color-accent-50": "#f5f3ff",
    "--color-accent-500": "#8b7cf0",
    "--color-accent-600": "#7c5fe0",
    "--color-accent-700": "#6248c0",
  },
  rose: {
    "--color-accent-50": "#fff1f5",
    "--color-accent-500": "#f2789a",
    "--color-accent-600": "#e0526f",
    "--color-accent-700": "#bd3f5c",
  },
  mint: {
    "--color-accent-50": "#f0fdf9",
    "--color-accent-500": "#3fbf97",
    "--color-accent-600": "#2fa681",
    "--color-accent-700": "#268567",
  },
  amber: {
    "--color-accent-50": "#fff9f0",
    "--color-accent-500": "#e79a3c",
    "--color-accent-600": "#d17f26",
    "--color-accent-700": "#a9631d",
  },
  mono: {
    "--color-accent-50": "#f4f4f5",
    "--color-accent-500": "#52525b",
    "--color-accent-600": "#3f3f46",
    "--color-accent-700": "#27272a",
  },
};

export function ArtistPage({ handle }: { handle: string }) {
  const display = handle.replace(/^@/, "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["studio", display.toLowerCase()],
    queryFn: () => publicApi.studio(handle),
  });
  const [lb, setLb] = useState<{ assets: PublicAsset[]; index: number } | null>(
    null,
  );
  const step = (d: 1 | -1) =>
    setLb((v) =>
      v
        ? { ...v, index: (v.index + d + v.assets.length) % v.assets.length }
        : v,
    );

  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb]);

  if (isLoading) return <StudioSkeleton />;
  if (isError || !data)
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas px-6">
        <div className="text-center">
          <h1 className="text-sm font-medium text-fg">Studio not found</h1>
          <p className="mt-1 text-sm text-fg-subtle">
            No studio at @{display}.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">Back to Mirae</Link>
          </Button>
        </div>
      </div>
    );

  const current = lb?.assets[lb.index] ?? null;
  return (
    <StudioView
      data={data}
      handle={handle}
      onOpen={(assets, index) => setLb({ assets, index })}
    >
      <Dialog open={!!lb} onOpenChange={(o) => !o && setLb(null)}>
        <DialogContent className="max-w-4xl overflow-hidden border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Artwork</DialogTitle>
          {current && (
            <div className="relative">
              <img
                src={current.url}
                alt={current.altText ?? ""}
                className="max-h-[82vh] w-full rounded-xl object-contain"
              />
              {lb && lb.assets.length > 1 && (
                <>
                  <LbNav side="left" onClick={() => step(-1)} />
                  <LbNav side="right" onClick={() => step(1)} />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 font-mono text-xs text-white">
                    {lb.index + 1} / {lb.assets.length}
                  </span>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StudioView>
  );
}

function LbNav({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous artwork" : "Next artwork"}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white outline-none transition-colors hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={side === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
      </svg>
    </button>
  );
}

function StudioSkeleton() {
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex w-full max-w-[35rem] flex-col gap-4 px-4 py-24 sm:px-8">
        <Skeleton className="size-16 rounded-2xl" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-4 h-10 w-44 rounded-md" />
        <div className="mt-8 grid grid-cols-3 gap-2">
          <Skeleton className="aspect-[4/3]" />
          <Skeleton className="aspect-[4/3]" />
          <Skeleton className="aspect-[4/3]" />
        </div>
      </div>
    </div>
  );
}

function StudioView({
  data,
  handle,
  onOpen,
  children,
}: {
  data: PublicStudio;
  handle: string;
  onOpen: (assets: PublicAsset[], index: number) => void;
  children: React.ReactNode;
}) {
  const rm = useReducedMotion();
  const { profile, commissionTypes, projects, links, featuredProjectId } = data;
  const ap = data.appearance;
  const radiusClass =
    ap.imageRadius === "minimal"
      ? "rounded-none"
      : ap.imageRadius === "medium"
        ? "rounded-md"
        : "rounded-xl";
  const galleryCols =
    ap.portfolioLayout === "grid"
      ? "grid-cols-2 sm:grid-cols-3"
      : ap.portfolioLayout === "compact"
        ? "grid-cols-3 sm:grid-cols-5"
        : "grid-cols-2 sm:grid-cols-3"; // editorial
  const status = STATUS[profile.status];
  const isClosed = profile.status === "closed";
  const [reqOpen, setReqOpen] = useState(false);
  const [reqType, setReqType] = useState<string | null>(null);
  const openReq = (typeId?: string) => {
    setReqType(typeId ?? null);
    setReqOpen(true);
  };
  // Featured project leads the Work section.
  const orderedProjects = featuredProjectId
    ? [...projects].sort(
        (a, b) =>
          (b.id === featuredProjectId ? 1 : 0) -
          (a.id === featuredProjectId ? 1 : 0),
      )
    : projects;

  // Cover art → the fixed full-bleed background (falls back to the demo image
  // so every page has atmosphere). Same technique as the reference portfolio:
  // background-size:cover, centered, fixed.
  const cover = profile.coverUrl ?? demoBg;
  const heroMode = ap.heroLayout; // "cover" | "split" | "minimal"

  const featured = links.filter((l) => l.featured || l.style !== "simple");
  const simple = links.filter((l) => !featured.includes(l));

  return (
    <div
      className="relative min-h-dvh bg-canvas"
      style={ACCENT_VARS[ap.accent] as React.CSSProperties}
    >
      {/* Fixed background art — only in the full-bleed "cover" hero */}
      {heroMode === "cover" && (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${cover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Soft scrim keeps the column readable over any image */}
          <div className="pointer-events-none fixed inset-0 z-0 bg-canvas/55" />
        </>
      )}

      {/* Centered column between two spacers — like the portfolio */}
      <motion.main
        className="relative z-10 flex w-full items-start px-4 py-12 sm:px-8 sm:py-24"
        initial={rm ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        <div className="hidden flex-1 md:block" />
        <div
          className="w-full max-w-[35rem] shrink-0"
          data-studio-typo={ap.typography}
        >
          {/* Split hero — cover art as a contained banner above the identity */}
          {heroMode === "split" && (
            <img
              src={cover}
              alt=""
              className="mb-8 h-44 w-full rounded-xl border border-border/70 object-cover shadow-soft"
            />
          )}
          {/* Identity */}
          <section className="mb-14">
            <Avatar
              src={profile.avatarUrl}
              name={profile.displayName}
              size={64}
              className="mb-4 rounded-2xl shadow-soft ring-2 ring-accent-500/35"
            />
            <h1 className="text-sm font-medium text-fg">
              {profile.displayName}
            </h1>
            {profile.tagline && (
              <p className="text-sm text-fg-subtle">{profile.tagline}</p>
            )}
            <div className="mt-3 flex items-center gap-2 text-sm text-fg-subtle">
              <span className={cn("size-1.5 rounded-full", status.dot)} />
              {status.label}
            </div>
            {ap.showBio && profile.bio && (
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-fg-muted">
                {profile.bio}
              </p>
            )}
            {!isClosed && commissionTypes.length > 0 && (
              <Button className="mt-6" onClick={() => openReq()}>
                Request a commission
                <Icon icon={ArrowRight01Icon} strokeWidth={1.8} />
              </Button>
            )}
          </section>

          {/* Featured links */}
          {ap.showSocials && featured.length > 0 && (
            <section className="mb-14 flex flex-col gap-2">
              {featured.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackLinkClick(l.id)}
                  className="group flex items-center gap-3 rounded-xl border border-border/70 bg-surface/85 px-4 py-3.5 text-sm backdrop-blur-sm transition-colors hover:border-accent-500"
                >
                  <span className="font-medium text-fg">{l.title}</span>
                  {l.platform && l.platform !== "custom" && (
                    <span className="font-mono text-xs text-fg-subtle">
                      {l.platform}
                    </span>
                  )}
                  <span className="ml-auto text-fg-subtle transition-all group-hover:translate-x-0.5 group-hover:text-accent-600">
                    ↗
                  </span>
                </a>
              ))}
            </section>
          )}

          {/* Selected work */}
          {projects.length > 0 && (
            <section className="mb-14">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-fg">
                <span className="size-1.5 rounded-full bg-accent-500" />
                Selected work
              </h2>
              <div className="flex flex-col gap-8">
                {orderedProjects.map((p) => (
                  <article key={p.id}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-medium text-fg">
                        {p.title}
                        {p.id === featuredProjectId && (
                          <span className="rounded-full bg-accent-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-accent-700">
                            Featured
                          </span>
                        )}
                      </h3>
                      <span className="font-mono text-xs text-fg-subtle">
                        {p.projectType.replace(/_/g, " ")}
                      </span>
                    </div>
                    {p.description && (
                      <p className="mb-3 max-w-[46ch] text-sm leading-relaxed text-fg-muted">
                        {p.description}
                      </p>
                    )}
                    {p.assets.length > 0 && (
                      <div
                        className={cn(
                          "grid gap-2",
                          p.assets.length === 1 &&
                            ap.portfolioLayout === "editorial"
                            ? "grid-cols-1"
                            : galleryCols,
                        )}
                      >
                        {p.assets.map((a, ai) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => onOpen(p.assets, ai)}
                            className={cn(
                              "group relative overflow-hidden border border-border/70 bg-surface-muted outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
                              radiusClass,
                            )}
                            style={{ aspectRatio: "4 / 3" }}
                          >
                            <img
                              src={a.url}
                              alt={a.altText ?? p.title}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Commissions — quiet fixed-price menu */}
          {commissionTypes.length > 0 && (
            <section className="mb-14">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-fg">
                <span className="size-1.5 rounded-full bg-accent-500" />
                Commissions
              </h2>
              <ul className="border-t border-border/70">
                {commissionTypes.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-4 border-b border-border/70 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg">{c.name}</p>
                      <p className="truncate text-xs text-fg-subtle">
                        {c.turnaround ?? "flexible"}
                        {c.slots != null ? ` · ${c.slots} slots` : ""}
                      </p>
                    </div>
                    <span className="ml-auto text-sm font-semibold tabular-nums text-fg">
                      {euro(c.priceFromCents)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isClosed}
                      onClick={() => openReq(c.id)}
                    >
                      Request
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Elsewhere */}
          {ap.showSocials && simple.length > 0 && (
            <section className="mb-14">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-fg">
                <span className="size-1.5 rounded-full bg-accent-500" />
                Elsewhere
              </h2>
              <ul className="flex flex-col">
                {simple.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackLinkClick(l.id)}
                      className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg"
                    >
                      {l.title}
                      <span className="ml-auto text-fg-subtle">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {ap.showPoweredBy && (
            <div className="flex items-center gap-1.5 text-xs text-fg-subtle">
              <Mark className="h-3 w-auto" />
              Powered by
              <Link to="/" className="font-medium text-fg-muted hover:text-fg">
                Mirae
              </Link>
            </div>
          )}
        </div>
        <div className="hidden flex-1 md:block" />
      </motion.main>

      <RequestDrawer
        handle={handle}
        studioName={profile.displayName}
        types={commissionTypes}
        open={reqOpen}
        onOpenChange={setReqOpen}
        initialTypeId={reqType}
      />
      {children}
    </div>
  );
}
