import { createFileRoute } from "@tanstack/react-router";
import { RequestForm } from "../../components/public/RequestForm.tsx";

function RequestRoute() {
  const { handle } = Route.useParams();
  return <RequestForm handle={handle} />;
}

// Public request form — usemirae.com/@handle/request.
export const Route = createFileRoute("/$handle/request")({
  component: RequestRoute,
});
