import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { OverviewView } from "../../components/app-shell/views/OverviewView.tsx";
import { useSession } from "../../lib/auth-client.ts";

function Overview() {
  const { data: session } = useSession();
  const first = session?.user?.name?.split(" ")[0];

  return (
    <>
      <PageHeader
        title={first ? `Hello, ${first}` : "Overview"}
        subtitle="Here's your studio today."
      />
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <OverviewView />
      </div>
    </>
  );
}

export const Route = createFileRoute("/app/overview")({ component: Overview });
