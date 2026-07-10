import { Button, Icon } from "@mirae/ui";
import { ArrowUpRight01Icon, CubeIcon } from "@hugeicons/core-free-icons";
import { AppShell } from "../app-shell/AppShell.tsx";

const NAV = ["Product", "Pricing", "Docs"];

/** Marketing landing — Atlasflow-style: white, minimal header, headline +
 *  black/white CTAs, framed product preview on a pastel-blue glow. UI-006. */
export function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-fg text-white">
              <Icon icon={CubeIcon} size={16} />
            </span>
            <span className="text-sm font-semibold tracking-tight">Mirae</span>
          </a>
          <nav className="ml-2 hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a
                key={n}
                href="#"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
              >
                {n}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
            <Button size="sm">Sign up</Button>
          </div>
        </div>
      </header>

      <main className="px-6">
        {/* Hero */}
        <section className="mx-auto max-w-4xl pb-10 pt-20 text-center sm:pt-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Your private commission studio.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-fg-muted">
            Mirae helps digital artists manage requests, quotes, queues,
            revisions and deliveries in one calm workspace.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg">
              Open your studio
              <Icon icon={ArrowUpRight01Icon} />
            </Button>
            <Button variant="outline" size="lg">
              View demo
            </Button>
          </div>
        </section>

        {/* Product preview on a pastel-blue glow */}
        <section className="relative mx-auto max-w-7xl pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-6 -z-0 h-[460px] w-[960px] max-w-full -translate-x-1/2 rounded-full bg-accent-400/25 blur-[120px]"
          />
          {/* Double bezel — translucent blurred outer shell with a pastel
              accent tint + ring; inner core holds the product preview. */}
          <div className="relative z-10 mx-auto max-w-7xl rounded-[28px] border border-white/60 bg-accent-50/40 p-2 shadow-panel ring-1 ring-inset ring-accent-300/30 backdrop-blur-md">
            <div className="h-[760px] overflow-hidden rounded-[20px] border border-border bg-surface">
              <AppShell />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
