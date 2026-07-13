import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "@mirae/ui";
import { LinkSquare02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { ProfileEditor } from "../../components/app-shell/ProfileEditor.tsx";
import { AboutEditor } from "../../components/app-shell/AboutEditor.tsx";
import { InsightsPanel } from "../../components/app-shell/InsightsPanel.tsx";
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
  { value: "about", label: "About & FAQ" },
  { value: "appearance", label: "Appearance" },
  { value: "insights", label: "Insights" },
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
  // Mobile has no room for the side-by-side split — toggle editor vs preview.
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  // Horizontal-scroll affordance for the tab strip (edge fades when scrollable).
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabScroll, setTabScroll] = useState({ left: false, right: false });
  const updateTabScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setTabScroll({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  };
  useEffect(() => {
    updateTabScroll();
    window.addEventListener("resize", updateTabScroll);
    return () => window.removeEventListener("resize", updateTabScroll);
  }, []);

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
        className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6"
      >
        {/* Mobile: toggle between editing and the live preview */}
        <div className="mb-4 flex rounded-lg bg-surface-muted p-1 lg:hidden">
          {(["edit", "preview"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMobileView(v)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-sm font-medium capitalize outline-none transition-colors",
                mobileView === v
                  ? "bg-surface text-fg shadow-soft"
                  : "text-fg-muted",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "relative min-w-0 max-w-full self-start",
            mobileView === "preview" && "hidden lg:block",
          )}
        >
          <TabsList
            ref={tabsRef}
            onScroll={updateTabScroll}
            className="max-w-full overflow-x-auto"
          >
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="shrink-0 whitespace-nowrap"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Edge fades — hint that the strip scrolls */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-1 left-0 w-8 rounded-l-lg bg-gradient-to-r from-canvas to-transparent transition-opacity lg:hidden",
              tabScroll.left ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-1 right-0 w-8 rounded-r-lg bg-gradient-to-l from-canvas to-transparent transition-opacity lg:hidden",
              tabScroll.right ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:items-stretch">
          {/* Left half — the active editor (scrolls on its own) */}
          <div
            className={cn(
              "min-w-0 flex-1 lg:overflow-y-auto lg:px-1 lg:py-1",
              mobileView === "preview" && "hidden lg:block",
            )}
          >
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
            <TabsContent value="about">
              <AboutEditor />
            </TabsContent>
            <TabsContent value="appearance">
              <AppearanceEditor />
            </TabsContent>
            <TabsContent value="insights">
              <InsightsPanel />
            </TabsContent>
          </div>

          {/* Right half — live preview of the public page */}
          <aside
            className={cn(
              "h-full flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface-sunken shadow-soft lg:flex",
              mobileView === "preview" ? "flex" : "hidden",
            )}
          >
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
