import { Link } from "@tanstack/react-router";
import { Button, Icon } from "@mirae/ui";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { DashboardPreview } from "./DashboardPreview.tsx";
import { PricingSection } from "./PricingSection.tsx";
import { SiteHeader } from "./SiteHeader.tsx";

/** Marketing landing — Atlasflow-style: white, minimal header, headline +
 *  black/white CTAs, framed product preview on a pastel-blue glow. UI-006. */
export function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />

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
            <Button asChild size="lg">
              <Link to="/signup" reloadDocument>
                Open your studio
                <Icon icon={ArrowUpRight01Icon} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/app" reloadDocument>
                View demo
              </Link>
            </Button>
          </div>
        </section>

        {/* Product preview on a pastel-blue glow */}
        <section className="relative mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-6 -z-0 h-[460px] w-[960px] max-w-full -translate-x-1/2 rounded-full bg-accent-400/25 blur-[120px]"
          />
          {/* Double bezel — translucent blurred outer shell with a pastel
              accent tint + ring; inner core holds the product preview. The
              preview is a fixed-size desktop "screenshot" scaled down + centered
              on small screens so it never crops to a broken half-layout. */}
          <div className="relative z-10 mx-auto max-w-7xl rounded-[28px] border border-white/60 bg-accent-50/40 p-2 shadow-panel ring-1 ring-inset ring-accent-300/30 backdrop-blur-md">
            <div className="relative h-[230px] overflow-hidden rounded-[20px] border border-border bg-surface sm:h-[380px] md:h-[500px] lg:h-[760px]">
              <div className="absolute left-1/2 top-0 h-[760px] w-[1216px] origin-top -translate-x-1/2 scale-[0.3] sm:scale-[0.5] md:scale-[0.66] lg:scale-100">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pricing (single-page section) */}
      <PricingSection />

      {/* Closing CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-28 text-center">
        <div className="rounded-2xl border border-border bg-surface-muted px-8 py-14">
          <h2 className="text-2xl font-semibold tracking-tight text-fg">
            Ready to run your studio calmly?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-fg-muted">
            Set up your public page, take requests, and manage every commission
            in one place.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/signup" reloadDocument>
              Open your studio
              <Icon icon={ArrowUpRight01Icon} />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-fg-subtle">
          <span>© Mirae</span>
          <span>Your private commission studio.</span>
        </div>
      </footer>
    </div>
  );
}
