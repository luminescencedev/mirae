import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { RequestsView } from "../../components/app-shell/views/RequestsView.tsx";

function Requests() {
  return (
    <>
      <PageHeader
        title="Requests"
        subtitle="Incoming commission requests from your clients."
      />
      <div className="px-6 py-6">
        <RequestsView />
      </div>
    </>
  );
}

export const Route = createFileRoute("/app/requests")({ component: Requests });
