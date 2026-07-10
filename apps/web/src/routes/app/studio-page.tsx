import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../../components/app-shell/ComingSoon.tsx";

export const Route = createFileRoute("/app/studio-page")({
  component: () => <ComingSoon title="Studio page" />,
});
