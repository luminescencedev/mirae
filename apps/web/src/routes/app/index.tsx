import { createFileRoute, redirect } from "@tanstack/react-router";

// /app → default to the overview.
export const Route = createFileRoute("/app/")({
  beforeLoad: () => {
    throw redirect({ to: "/app/overview" });
  },
});
