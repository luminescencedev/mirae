import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { ProfileEditor } from "../../components/app-shell/ProfileEditor.tsx";
import { PortfolioManager } from "../../components/app-shell/PortfolioManager.tsx";
import { LinkManager } from "../../components/app-shell/LinkManager.tsx";
import { AppearanceEditor } from "../../components/app-shell/AppearanceEditor.tsx";
import { CommissionTypesEditor } from "../../components/app-shell/CommissionTypesEditor.tsx";

function StudioPage() {
  return (
    <>
      <PageHeader
        title="Studio page"
        subtitle="Your public page and the commissions you offer."
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-6">
        <ProfileEditor />
        <AppearanceEditor />
        <PortfolioManager />
        <LinkManager />
        <CommissionTypesEditor />
      </div>
    </>
  );
}

export const Route = createFileRoute("/app/studio-page")({
  component: StudioPage,
});
