import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "../components/marketing/Landing.tsx";

// Marketing home — usemirae.com/
export const Route = createFileRoute("/")({
  component: Landing,
});
