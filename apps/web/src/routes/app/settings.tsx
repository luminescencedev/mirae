import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Icon,
} from "@mirae/ui";
import { Download04Icon } from "@hugeicons/core-free-icons";
import { PageHeader } from "../../components/app-shell/PageHeader.tsx";
import { artistApi } from "../../lib/api.ts";
import { signOut } from "../../lib/auth-client.ts";

function DangerZone() {
  const navigate = useNavigate();
  const del = useMutation({
    mutationFn: () => artistApi.deleteAccount(),
    onSuccess: async () => {
      await signOut();
      navigate({ to: "/" });
    },
  });

  return (
    <section className="rounded-xl border border-red-200 bg-surface p-5 shadow-soft">
      <h2 className="text-sm font-semibold text-red-700">Delete account</h2>
      <p className="mt-1 max-w-prose text-sm text-fg-muted">
        Permanently delete your studio and everything in it — profile,
        portfolio, links, commissions, quotes and messages. This can't be
        undone. Export your data first if you want a copy.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-red-200 text-red-700 hover:bg-red-50"
          >
            Delete my account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your studio and all associated data. This
              action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {del.isError && (
            <p role="alert" className="text-sm text-red-600">
              {(del.error as Error).message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-600/90"
              onClick={(e) => {
                e.preventDefault();
                del.mutate();
              }}
            >
              {del.isPending ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function SettingsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" subtitle="Manage your account and data." />
      <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-fg">Your data</h2>
          <p className="mt-1 max-w-prose text-sm text-fg-muted">
            Download everything in your studio — profile, portfolio, links,
            commissions, quotes, messages and revisions — as a JSON file.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <a href="/api/artists/me/export" download>
              <Icon icon={Download04Icon} size={15} />
              Export my data
            </a>
          </Button>
        </section>

        <DangerZone />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});
