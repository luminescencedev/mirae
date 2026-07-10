import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Button,
  Icon,
  Sheet,
  SheetContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mirae/ui";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { CommissionDetail } from "../../components/app-shell/CommissionDetail.tsx";
import { QueueView } from "../../components/app-shell/views/QueueView.tsx";
import { QueueListView } from "../../components/app-shell/views/QueueListView.tsx";
import type { Commission } from "../../components/mockups/seed.ts";

const ENTER = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] as const },
};

function Queue() {
  const [selected, setSelected] = useState<Commission | null>(null);

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
      <div className="px-6 py-6">
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="board" className="mt-5">
            <QueueView onSelect={setSelected} />
          </TabsContent>
          <TabsContent value="list" className="mt-5">
            <motion.div {...ENTER}>
              <QueueListView onSelect={setSelected} />
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
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <SheetContent>
          {selected && <CommissionDetail item={selected} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

export const Route = createFileRoute("/app/queue")({ component: Queue });
