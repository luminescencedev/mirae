import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Icon } from "@mirae/ui";
import {
  CheckmarkCircle02Icon,
  CubeIcon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { publicApi } from "../../lib/api.ts";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-lg px-6 py-12">{children}</div>
      <div className="mx-auto flex max-w-lg items-center justify-center gap-1.5 px-6 pb-12 text-xs text-fg-subtle">
        <Icon icon={CubeIcon} size={13} />
        Powered by
        <Link to="/" className="font-medium text-fg-muted hover:text-fg">
          Mirae
        </Link>
      </div>
    </div>
  );
}

function fmtSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DeliveryPage({ token }: { token: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["delivery", token],
    queryFn: () => publicApi.delivery(token),
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle shadow-soft">
          Loading…
        </div>
      </Shell>
    );
  }

  if (isError || !data) {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-soft">
          <h1 className="text-lg font-semibold text-fg">Nothing here</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            This delivery link is invalid or has expired.
          </p>
        </div>
      </Shell>
    );
  }

  const { delivery, commission, artist, files } = data;

  return (
    <Shell>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8">
        {delivery.deliveredAt && (
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <Icon icon={CheckmarkCircle02Icon} size={13} strokeWidth={2} />
            Delivered
          </span>
        )}
        <p className="text-sm text-fg-subtle">
          {artist ? `${artist.displayName} · delivery` : "Delivery"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">
          {commission.title}
        </h1>
        {delivery.message && (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-fg-muted">
            {delivery.message}
          </p>
        )}

        <h2 className="mb-2 mt-6 text-sm font-semibold text-fg">Files</h2>
        {files.length === 0 ? (
          <p className="text-sm text-fg-subtle">No files yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {files.map((f) => (
              <li key={f.id}>
                <a
                  href={`/api/delivery/${token}/files/${f.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm transition-colors hover:border-border-strong"
                >
                  <Icon
                    icon={File01Icon}
                    size={18}
                    strokeWidth={1.8}
                    className="text-fg-muted"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-fg">
                    {f.name}
                  </span>
                  <span className="shrink-0 text-xs text-fg-subtle">
                    {fmtSize(f.sizeBytes)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Shell>
  );
}
