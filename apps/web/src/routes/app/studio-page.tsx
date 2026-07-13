import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mirae/ui";
import { LinkSquare02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { ProfileEditor } from "../../components/app-shell/ProfileEditor.tsx";
import { AppearanceEditor } from "../../components/app-shell/AppearanceEditor.tsx";
import { PortfolioManager } from "../../components/app-shell/PortfolioManager.tsx";
import { LinkManager } from "../../components/app-shell/LinkManager.tsx";
import { CommissionTypesEditor } from "../../components/app-shell/CommissionTypesEditor.tsx";
import { artistApi } from "../../lib/api.ts";

const TABS = [
  { value: "profile", label: "Profile" },
  { value: "portfolio", label: "Portfolio" },
  { value: "links", label: "Links" },
  { value: "commissions", label: "Commissions" },
  { value: "appearance", label: "Appearance" },
] as const;

function StudioPage() {
  const { data: profile, dataUpdatedAt } = useQuery({
    queryKey: ["artist", "me"],
    queryFn: artistApi.me,
  });
  const handle = profile?.handle;
  const [previewKey, setPreviewKey] = useState(0);
  // Reload the preview whenever the profile/appearance query refreshes (e.g.
  // after a save) or the user hits refresh manually.
  const iframeKey = `${dataUpdatedAt}_${previewKey}`;

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Studio page"
        subtitle="Everything a visitor sees at your public page."
        action={
          handle && (
            <Button asChild variant="outline" size="sm">
              <a href={`/@${handle}`} target="_blank" rel="noreferrer">
                <Icon icon={LinkSquare02Icon} size={15} />
                View page
              </a>
            </Button>
          )
        }
      />

      <Tabs
        defaultValue="profile"
        className="flex min-h-0 flex-1 flex-col px-6 py-6"
      >
        <TabsList className="shrink-0 self-start">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:items-stretch">
          {/* Left half — the active editor (scrolls on its own) */}
          <div className="min-w-0 flex-1 lg:overflow-y-auto lg:pr-1">
            <TabsContent value="profile">
              <ProfileEditor />
            </TabsContent>
            <TabsContent value="portfolio">
              <PortfolioManager />
            </TabsContent>
            <TabsContent value="links">
              <LinkManager />
            </TabsContent>
            <TabsContent value="commissions">
              <CommissionTypesEditor />
            </TabsContent>
            <TabsContent value="appearance">
              <AppearanceEditor />
            </TabsContent>
          </div>

          {/* Right half — live preview of the public page */}
          <aside className="hidden h-full flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-soft lg:flex">
            <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
              <span className="truncate font-mono text-xs text-fg-subtle">
                {handle ? `usemirae.com/@${handle}` : "preview"}
              </span>
              <button
                type="button"
                aria-label="Refresh preview"
                onClick={() => setPreviewKey((k) => k + 1)}
                className="grid size-7 place-items-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <Icon icon={RefreshIcon} size={14} />
              </button>
            </div>
            {handle ? (
              <iframe
                key={iframeKey}
                title="Public page preview"
                src={`/@${handle}`}
                className="size-full flex-1 border-0 bg-canvas"
              />
            ) : (
              <div className="grid flex-1 place-items-center text-sm text-fg-subtle">
                Loading…
              </div>
            )}
          </aside>
        </div>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/app/studio-page")({
  component: StudioPage,
});
