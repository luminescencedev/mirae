import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { CommissionTypesEditor } from "../../components/app-shell/CommissionTypesEditor.tsx";

function StudioPage() {
  return (
    <>
      <PageHeader
        title="Studio page"
        subtitle="Your public page and the commissions you offer."
      />
      <div className="px-6 py-6">
        <CommissionTypesEditor />
      </div>
    </>
  );
}

export const Route = createFileRoute("/app/studio-page")({
  component: StudioPage,
});
