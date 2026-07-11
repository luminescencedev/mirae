import { createFileRoute } from "@tanstack/react-router";
import { DeliveryPage } from "../../components/public/DeliveryPage.tsx";

function DeliveryRoute() {
  const { token } = Route.useParams();
  return <DeliveryPage token={token} />;
}

// Public delivery page — usemirae.com/delivery/:token (no login).
export const Route = createFileRoute("/delivery/$token")({
  component: DeliveryRoute,
});
