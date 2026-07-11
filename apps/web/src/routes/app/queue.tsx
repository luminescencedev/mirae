import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Sheet,
  SheetContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mirae/ui";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { CommissionDetail } from "../../components/app-shell/CommissionDetail.tsx";
import { QueueView } from "../../components/app-shell/views/QueueView.tsx";
import { QueueListView } from "../../components/app-shell/views/QueueListView.tsx";
import { commissionsApi } from "../../lib/api.ts";

const ENTER = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] as const },
};

function Queue() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["commissions"],
    queryFn: commissionsApi.list,
  });

  const selected = commissions.find((c) => c.id === selectedId) ?? null;
  const active = commissions.filter(
    (c) => c.status !== "delivered" && c.status !== "archived",
  ).length;

  return (
    <>
      <PageHeader
        title="Commission queue"
        subtitle={
          isLoading
            ? "Loading…"
            : `${commissions.length} commission${commissions.length === 1 ? "" : "s"} · ${active} active`
        }
      />
      <div className="px-6 py-6">
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="board" className="mt-5">
            <QueueView
              commissions={commissions}
              onSelect={(c) => setSelectedId(c.id)}
            />
          </TabsContent>
          <TabsContent value="list" className="mt-5">
            <motion.div {...ENTER}>
              <QueueListView
                commissions={commissions}
                onSelect={(c) => setSelectedId(c.id)}
              />
            </motion.div>
          </TabsContent>
          <TabsContent value="calendar" className="mt-5">
            <motion.div
              {...ENTER}
              className="grid place-items-center rounded-xl border border-dashed border-border py-20 text-sm text-fg-subtle"
            >
              Calendar view — coming soon
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelectedId(null)}
      >
        <SheetContent>
          {selected && <CommissionDetail item={selected} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

export const Route = createFileRoute("/app/queue")({ component: Queue });
