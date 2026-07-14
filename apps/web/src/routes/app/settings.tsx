import { createFileRoute } from "@tanstack/react-router";
import { Button, Icon } from "@mirae/ui";
import { Download04Icon } from "@hugeicons/core-free-icons";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";

function SettingsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and data."
      />
      <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-fg">Your data</h2>
          <p className="mt-1 max-w-prose text-sm text-fg-muted">
            Download everything in your studio — profile, portfolio, links,
            commissions, quotes, messages and revisions — as a JSON file.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <a href="/api/artists/me/export" download>
              <Icon icon={Download04Icon} size={15} />
              Export my data
            </a>
          </Button>
        </section>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});
