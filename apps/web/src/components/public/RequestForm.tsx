import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button, Icon, Mark } from "@mirae/ui";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { publicApi } from "../../lib/api.ts";
import { RequestFlow } from "./RequestFlow.tsx";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-sunken">
      <div className="mx-auto max-w-xl px-5 py-12 sm:px-6">{children}</div>
    </div>
  );
}

/** Standalone /@handle/request page — the same multi-step flow as the drawer,
 *  full-page (for direct links / no-JS-drawer contexts). */
export function RequestForm({ handle }: { handle: string }) {
  const display = handle.replace(/^@/, "");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["studio", display.toLowerCase()],
    queryFn: () => publicApi.studio(handle),
  });

  if (isLoading)
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle shadow-soft">
          Loading…
        </div>
      </Shell>
    );

  if (isError || !data)
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <h1 className="text-lg font-semibold text-fg">Studio not found</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            No studio at <span className="font-medium">@{display}</span>.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">Back to Mirae</Link>
          </Button>
        </div>
      </Shell>
    );

  const { profile, commissionTypes } = data;
  const closed = profile.status === "closed" || commissionTypes.length === 0;

  return (
    <Shell>
      <Link
        to="/$handle"
        params={{ handle }}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <Icon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
        {profile.displayName} · @{profile.handle}
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
        {closed ? (
          <div className="text-center">
            <h1 className="text-lg font-semibold text-fg">
              Requests are closed
            </h1>
            <p className="mt-1.5 text-sm text-fg-muted">
              {profile.displayName} isn’t taking commissions right now.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/$handle" params={{ handle }}>
                Back to profile
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-fg">
              Request a commission
            </h1>
            <p className="mt-1 mb-5 text-sm text-fg-muted">
              Tell {profile.displayName} what you have in mind — no account
              needed.
            </p>
            <RequestFlow
              handle={handle}
              studioName={profile.displayName}
              types={commissionTypes}
            />
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-fg-subtle">
        <Mark className="h-3 w-auto" />
        Powered by
        <Link to="/" className="font-medium text-fg-muted hover:text-fg">
          Mirae
        </Link>
      </div>
    </Shell>
  );
}
