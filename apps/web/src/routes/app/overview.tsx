import { createFileRoute } from "@tanstack/react-router";
import { Button, Icon } from "@mirae/ui";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { OverviewView } from "../../components/app-shell/views/OverviewView.tsx";

function Overview() {
  return (
    <>
      <PageHeader
        title="Hello, Rain"
        subtitle="Here's your studio today."
        action={
          <Button>
            <Icon icon={Add01Icon} strokeWidth={1.8} />
            New commission
          </Button>
        }
      />
      <div className="px-6 py-6">
        <OverviewView />
      </div>
    </>
  );
}

export const Route = createFileRoute("/app/overview")({ component: Overview });
