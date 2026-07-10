import { createFileRoute } from "@tanstack/react-router";
import { ArtistPage } from "../../components/public/ArtistPage.tsx";

function ArtistRoute() {
  const { handle } = Route.useParams();
  return <ArtistPage handle={handle} />;
}

// Public artist page — usemirae.com/@handle. The URL's "@" is part of the
// param value; ArtistPage strips it for display.
export const Route = createFileRoute("/$handle/")({ component: ArtistRoute });
