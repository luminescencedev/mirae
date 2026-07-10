import { PageHeader } from "./PageHeader.tsx";

/** Placeholder for /app screens not built yet (WEB-005+). */
export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} subtitle="Coming soon." />
      <div className="grid place-items-center px-6 py-24 text-sm text-fg-subtle">
        This screen lands in a later sprint.
      </div>
    </>
  );
}
