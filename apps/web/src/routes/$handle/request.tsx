import { createFileRoute } from "@tanstack/react-router";

function RequestForm() {
  const { handle } = Route.useParams();
  return (
    <div className="grid min-h-screen place-items-center bg-surface-sunken px-6 text-sm text-fg-subtle">
      Request form for {handle} — coming in WEB-009.
    </div>
  );
}

export const Route = createFileRoute("/$handle/request")({
  component: RequestForm,
});
