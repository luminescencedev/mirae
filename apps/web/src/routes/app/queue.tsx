import { createFileRoute } from "@tanstack/react-router";
import { Button, Icon, Tabs, TabsList, TabsTrigger } from "@mirae/ui";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { QueueView } from "../../components/app-shell/views/QueueView.tsx";

function Queue() {
  return (
    <>
      <PageHeader
        title="Commission queue"
        subtitle="5 active commissions · 2 awaiting your quote"
        action={
          <Button>
            <Icon icon={Add01Icon} strokeWidth={1.8} />
            New commission
          </Button>
        }
      />
      <div className="px-6 pt-5">
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="px-6 py-6">
        <QueueView />
      </div>
    </>
  );
}

export const Route = createFileRoute("/app/queue")({ component: Queue });
