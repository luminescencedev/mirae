import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../../components/app-shell/ComingSoon.tsx";

export const Route = createFileRoute("/app/clients")({
  component: () => <ComingSoon title="Clients" />,
});
