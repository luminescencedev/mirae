import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  Avatar,
  Button,
  Dialog,
  DialogContent,
  Icon,
  Mark,
  cn,
} from "@mirae/ui";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
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

export function ArtistPage({ handle }: { handle: string }) {
  const display = handle.replace(/^@/, "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["studio", display.toLowerCase()],
    queryFn: () => publicApi.studio(handle),
  });
  const [lightbox, setLightbox] = useState<PublicAsset | null>(null);

  if (isLoading)
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas text-sm text-fg-subtle">
        Loading…
      </div>
    );
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

  return (
    <StudioView data={data} handle={handle} onOpen={setLightbox}>
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {lightbox && (
            <img
              src={lightbox.url}
              alt={lightbox.altText ?? ""}
              className="max-h-[80vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </StudioView>
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
  onOpen: (a: PublicAsset) => void;
  children: React.ReactNode;
}) {
  const rm = useReducedMotion();
  const { profile, commissionTypes, projects, links } = data;
  const status = STATUS[profile.status];
  const isClosed = profile.status === "closed";

  // Cover art → the fixed full-bleed background (falls back to the demo image
  // so every page has atmosphere). Same technique as the reference portfolio:
  // background-size:cover, centered, fixed.
  const cover = profile.coverUrl ?? demoBg;

  const featured = links.filter((l) => l.featured || l.style !== "simple");
  const simple = links.filter((l) => !featured.includes(l));

  return (
    <div className="relative min-h-dvh bg-canvas">
      {/* Fixed background art */}
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

      {/* Centered column between two spacers — like the portfolio */}
      <motion.main
        className="relative z-10 flex w-full items-start px-4 py-12 sm:px-8 sm:py-24"
        initial={rm ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        <div className="hidden flex-1 md:block" />
        <div className="w-full max-w-[35rem] shrink-0">
          {/* Identity */}
          <section className="mb-14">
            <Avatar
              src={profile.avatarUrl}
              name={profile.displayName}
              size={64}
              className="mb-4 rounded-2xl shadow-soft"
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
            {profile.bio && (
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-fg-muted">
                {profile.bio}
              </p>
            )}
            {!isClosed && (
              <Button asChild className="mt-6">
                <Link to="/$handle/request" params={{ handle }}>
                  Request a commission
                  <Icon icon={ArrowRight01Icon} strokeWidth={1.8} />
                </Link>
              </Button>
            )}
          </section>

          {/* Featured links */}
          {featured.length > 0 && (
            <section className="mb-14 flex flex-col gap-2">
              {featured.map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackLinkClick(l.id)}
                  className="group flex items-center gap-3 rounded-xl border border-border/70 bg-surface/85 px-4 py-3.5 text-sm backdrop-blur-sm transition-colors hover:border-border-strong"
                >
                  <span className="font-medium text-fg">{l.title}</span>
                  {l.platform && l.platform !== "custom" && (
                    <span className="font-mono text-xs text-fg-subtle">
                      {l.platform}
                    </span>
                  )}
                  <span className="ml-auto text-fg-subtle transition-transform group-hover:translate-x-0.5">
                    ↗
                  </span>
                </a>
              ))}
            </section>
          )}

          {/* Selected work */}
          {projects.length > 0 && (
            <section className="mb-14">
              <h2 className="mb-4 text-sm font-medium text-fg">
                Selected work
              </h2>
              <div className="flex flex-col gap-8">
                {projects.map((p) => (
                  <article key={p.id}>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <h3 className="text-sm font-medium text-fg">{p.title}</h3>
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
                          p.assets.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-2 sm:grid-cols-3",
                        )}
                      >
                        {p.assets.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => onOpen(a)}
                            className="group relative overflow-hidden rounded-lg border border-border/70 bg-surface-muted outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
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
              <h2 className="mb-2 text-sm font-medium text-fg">Commissions</h2>
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
                      asChild
                      size="sm"
                      variant="outline"
                      disabled={isClosed}
                    >
                      <Link to="/$handle/request" params={{ handle }}>
                        Request
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Elsewhere */}
          {simple.length > 0 && (
            <section className="mb-14">
              <h2 className="mb-3 text-sm font-medium text-fg">Elsewhere</h2>
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

          <div className="flex items-center gap-1.5 text-xs text-fg-subtle">
            <Mark className="h-3 w-auto" />
            Powered by
            <Link to="/" className="font-medium text-fg-muted hover:text-fg">
              Mirae
            </Link>
          </div>
        </div>
        <div className="hidden flex-1 md:block" />
      </motion.main>

      {children}
    </div>
  );
}
