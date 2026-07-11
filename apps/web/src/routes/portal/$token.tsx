import { createFileRoute } from "@tanstack/react-router";
import { PortalPage } from "../../components/public/PortalPage.tsx";

function PortalRoute() {
  const { token } = Route.useParams();
  return <PortalPage token={token} />;
}

// Public client portal — usemirae.com/portal/:token (no login).
export const Route = createFileRoute("/portal/$token")({
  component: PortalRoute,
});
