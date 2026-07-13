import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogContent,
  Icon,
  Mark,
  cn,
} from "@mirae/ui";
import { ArrowRight01Icon, Link01Icon } from "@hugeicons/core-free-icons";
import { STUDIO_STATUS_META } from "../mockups/seed.ts";
import {
  publicApi,
  trackLinkClick,
  type PublicAsset,
  type PublicLink,
} from "../../lib/api.ts";

const euro = (cents: number | null) =>
  cents == null ? "—" : `€${(cents / 100).toLocaleString()}`;

// Scroll-triggered fade-up; still (no transform) under reduced-motion.
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const rm = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={rm ? false : { opacity: 0, y: 14 }}
      whileInView={rm ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function ArtistPage({ handle }: { handle: string }) {
  const display = handle.replace(/^@/, "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["studio", display.toLowerCase()],
    queryFn: () => publicApi.studio(handle),
  });
  const [lightbox, setLightbox] = useState<PublicAsset | null>(null);

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-surface-sunken text-sm text-fg-subtle">
        Loading…
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="grid min-h-dvh place-items-center bg-surface-sunken px-6">
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <h1 className="text-lg font-semibold text-fg">Studio not found</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            No studio at <span className="font-medium">@{display}</span>.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">Back to Mirae</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { profile, commissionTypes, projects, links } = data;
  const status = STUDIO_STATUS_META[profile.status];
  const isClosed = profile.status === "closed";
  const isWaitlist = profile.status === "waitlist";
  const ctaLabel = isWaitlist ? "Join the waitlist" : "Request a commission";

  const featuredLinks = links.filter(
    (l) => l.featured || l.style === "featured" || l.style === "card",
  );
  const simpleLinks = links.filter((l) => !featuredLinks.includes(l));

  return (
    <div className="min-h-dvh bg-surface-sunken pb-16">
      {/* Cover */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-accent-200 to-accent-400 sm:h-56">
        {profile.coverUrl && (
          <img
            src={profile.coverUrl}
            alt=""
            className="size-full object-cover"
          />
        )}
      </div>

      <div className="mx-auto max-w-3xl px-5">
        {/* Hero */}
        <Reveal>
          <div className="-mt-12 flex flex-col items-start gap-4 sm:-mt-14">
            <span className="rounded-3xl ring-4 ring-surface-sunken">
              <Avatar
                src={profile.avatarUrl}
                name={profile.displayName}
                size={96}
                className="rounded-3xl"
              />
            </span>
            <div className="w-full">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight text-fg">
                  {profile.displayName}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-fg-muted shadow-soft">
                  <span className={cn("size-1.5 rounded-full", status.dot)} />
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-fg-subtle">@{profile.handle}</p>
              {profile.tagline && (
                <p className="mt-3 max-w-prose text-[15px] text-fg-muted">
                  {profile.tagline}
                </p>
              )}
              {profile.bio && (
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-fg-subtle">
                  {profile.bio}
                </p>
              )}
              {!isClosed && (
                <Button asChild size="lg" className="mt-5">
                  <Link to="/$handle/request" params={{ handle }}>
                    {ctaLabel}
                    <Icon icon={ArrowRight01Icon} strokeWidth={1.8} />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Reveal>

        {/* Featured links */}
        {featuredLinks.length > 0 && (
          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {featuredLinks.map((l, i) => (
              <Reveal key={l.id} delay={i * 0.04}>
                <LinkCard link={l} featured />
              </Reveal>
            ))}
          </div>
        )}

        {/* Portfolio */}
        {projects.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-sm font-semibold text-fg">Work</h2>
            <div className="flex flex-col gap-10">
              {projects.map((project) => (
                <Reveal key={project.id}>
                  <article>
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <h3 className="text-base font-semibold tracking-tight text-fg">
                        {project.title}
                      </h3>
                      {project.featured && (
                        <Badge variant="accent">Featured</Badge>
                      )}
                    </div>
                    {project.description && (
                      <p className="mb-3 max-w-prose text-sm text-fg-muted">
                        {project.description}
                      </p>
                    )}
                    {project.assets.length > 0 && (
                      <div
                        className={cn(
                          "grid gap-2.5",
                          project.assets.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-2 sm:grid-cols-3",
                        )}
                      >
                        {project.assets.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => setLightbox(asset)}
                            className="group relative overflow-hidden rounded-xl border border-border bg-surface-muted outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                            style={{ aspectRatio: "4 / 3" }}
                          >
                            <img
                              src={asset.url}
                              alt={asset.altText ?? project.title}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Commission types */}
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold text-fg">What I take on</h2>
          {commissionTypes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-fg-subtle">
              No commission types listed yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {commissionTypes.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.04}>
                  <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-fg">
                        {c.name}
                      </h3>
                      {c.slots != null && (
                        <Badge variant="emerald">{c.slots} slots</Badge>
                      )}
                    </div>
                    {c.blurb && (
                      <p className="mt-1.5 flex-1 text-sm text-fg-muted">
                        {c.blurb}
                      </p>
                    )}
                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-border pt-3">
                      <div>
                        <p className="text-lg font-semibold tabular-nums text-fg">
                          {euro(c.priceFromCents)}
                        </p>
                        <p className="text-xs text-fg-subtle">
                          {c.turnaround ?? "flexible"}
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant={isClosed ? "outline" : "default"}
                        disabled={isClosed}
                      >
                        <Link to="/$handle/request" params={{ handle }}>
                          {isClosed
                            ? "Closed"
                            : isWaitlist
                              ? "Waitlist"
                              : "Request"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* Simple links */}
        {simpleLinks.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-sm font-semibold text-fg">Elsewhere</h2>
            <div className="flex flex-col gap-2">
              {simpleLinks.map((l) => (
                <LinkCard key={l.id} link={l} />
              ))}
            </div>
          </section>
        )}

        {/* Powered by */}
        <div className="mt-14 flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
          <Mark className="h-3 w-auto" />
          Powered by
          <Link to="/" className="font-medium text-fg-muted hover:text-fg">
            Mirae
          </Link>
        </div>
      </div>

      {/* Lightbox */}
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
    </div>
  );
}

function LinkCard({
  link,
  featured = false,
}: {
  link: PublicLink;
  featured?: boolean;
}) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackLinkClick(link.id)}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 outline-none transition-all hover:border-border-strong hover:shadow-soft focus-visible:ring-2 focus-visible:ring-accent-500",
        featured ? "py-4" : "py-3",
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-muted text-fg-subtle">
        <Icon icon={Link01Icon} size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate font-medium text-fg",
            featured ? "text-[15px]" : "text-sm",
          )}
        >
          {link.title}
        </span>
        {link.platform && link.platform !== "custom" && (
          <span className="block truncate text-xs text-fg-subtle">
            {link.platform}
          </span>
        )}
      </span>
      <Icon
        icon={ArrowRight01Icon}
        size={16}
        className="text-fg-subtle transition-transform group-hover:translate-x-0.5"
      />
    </a>
  );
}
