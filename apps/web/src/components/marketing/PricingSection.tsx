import { Link } from "@tanstack/react-router";
import { Badge, Button, Icon, cn } from "@mirae/ui";
import { Tick02Icon } from "@hugeicons/core-free-icons";

const TIERS = [
  {
    name: "Starter",
    price: "€0",
    note: "Free forever",
    features: [
      "1 commission at a time",
      "Public page + request form",
      "Client portal",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "€12",
    note: "per month",
    features: [
      "Unlimited commissions",
      "Queue + revisions",
      "Quotes & payment tracking",
      "Delivery pages",
    ],
    featured: true,
  },
  {
    name: "Studio",
    price: "€29",
    note: "per month",
    features: ["Everything in Pro", "Custom branding", "Priority support"],
    featured: false,
  },
];

/** Pricing block — lives as a section of the single-page landing (#pricing). */
export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-24">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Simple, subscription pricing
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-fg-muted">
          Mirae never takes a cut of your commission revenue. A flat monthly
          price — nothing per transaction.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={cn(
              "flex flex-col rounded-2xl border bg-surface p-6 shadow-soft",
              t.featured
                ? "border-accent-300 ring-1 ring-accent-300/40"
                : "border-border",
            )}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-fg">{t.name}</h3>
              {t.featured && <Badge variant="accent">Popular</Badge>}
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tracking-tight text-fg">
                {t.price}
              </span>
              <span className="text-sm text-fg-muted">{t.note}</span>
            </div>
            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {t.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-fg-muted"
                >
                  <Icon
                    icon={Tick02Icon}
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-accent-600"
                  />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant={t.featured ? "default" : "outline"}
              className="mt-6 w-full"
            >
              <Link to="/signup" reloadDocument>
                Get started
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
