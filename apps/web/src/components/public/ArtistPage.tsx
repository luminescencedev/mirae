import { Link } from "@tanstack/react-router";
import { Badge, Button, Icon, cn } from "@mirae/ui";
import { ArrowRight01Icon, CubeIcon } from "@hugeicons/core-free-icons";
import { ARTIST, STUDIO_STATUS_META } from "../mockups/seed.ts";

/** Public artist page — usemirae.com/@handle. */
export function ArtistPage({ handle }: { handle: string }) {
  const status = STUDIO_STATUS_META[ARTIST.status];
  const display = handle.replace(/^@/, "");

  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Profile card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="size-20 shrink-0 rounded-2xl bg-gradient-to-br from-accent-300 to-accent-500" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-fg">
                  {ARTIST.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-fg-muted">
                  <span className={cn("size-1.5 rounded-full", status.dot)} />
                  {status.label}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-fg-subtle">@{display}</p>
              <p className="mt-3 text-sm text-fg-muted">{ARTIST.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {ARTIST.bio}
              </p>
              <Button asChild className="mt-5">
                <Link to="/$handle/request" params={{ handle }}>
                  Request a commission
                  <Icon icon={ArrowRight01Icon} strokeWidth={1.8} />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Commission types */}
        <h2 className="mb-3 mt-10 text-sm font-semibold text-fg">
          What I take on
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ARTIST.commissionTypes.map((c) => (
            <div
              key={c.name}
              className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-fg">{c.name}</h3>
                {c.slots && <Badge variant="emerald">{c.slots}</Badge>}
              </div>
              <p className="mt-1.5 flex-1 text-sm text-fg-muted">{c.blurb}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div>
                  <p className="text-xs text-fg-subtle">From</p>
                  <p className="text-base font-semibold tabular-nums text-fg">
                    {c.from}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-fg-subtle">Turnaround</p>
                  <p className="text-sm text-fg-muted">{c.turnaround}</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/$handle/request" params={{ handle }}>
                    Request
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Powered by */}
        <div className="mt-10 flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
          <Icon icon={CubeIcon} size={13} />
          Powered by
          <Link to="/" className="font-medium text-fg-muted hover:text-fg">
            Mirae
          </Link>
        </div>
      </div>
    </div>
  );
}
