import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Icon } from "@mirae/ui";
import { Cancel01Icon, File01Icon } from "@hugeicons/core-free-icons";
import { commissionsApi } from "../../lib/api.ts";

function fmtSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DeliverySection({ commissionId }: { commissionId: string }) {
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const deliveryKey = ["commissions", commissionId, "delivery"];
  const filesKey = ["commissions", commissionId, "files"];

  const { data: delivery } = useQuery({
    queryKey: deliveryKey,
    queryFn: () => commissionsApi.delivery(commissionId),
  });
  const { data: files = [] } = useQuery({
    queryKey: filesKey,
    queryFn: () => commissionsApi.files(commissionId),
  });

  const prepare = useMutation({
    mutationFn: () => commissionsApi.ensureDelivery(commissionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: deliveryKey }),
  });
  const upload = useMutation({
    mutationFn: (file: File) => commissionsApi.uploadFile(commissionId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesKey }),
  });
  const remove = useMutation({
    mutationFn: (fileId: string) =>
      commissionsApi.removeFile(commissionId, fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesKey }),
  });

  const url = delivery
    ? `${window.location.origin}/delivery/${delivery.token}`
    : null;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold">Delivery</p>

      {!delivery ? (
        <Button
          size="sm"
          variant="outline"
          disabled={prepare.isPending}
          onClick={() => prepare.mutate()}
        >
          {prepare.isPending ? "Preparing…" : "Prepare delivery"}
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={url ?? ""}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-md border border-border bg-surface-muted px-2.5 py-1.5 text-xs text-fg-muted outline-none"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => url && navigator.clipboard?.writeText(url)}
            >
              Copy
            </Button>
          </div>

          {files.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm"
                >
                  <Icon
                    icon={File01Icon}
                    size={16}
                    strokeWidth={1.8}
                    className="text-fg-muted"
                  />
                  <span className="min-w-0 flex-1 truncate text-fg">
                    {f.name}
                  </span>
                  <span className="shrink-0 text-xs text-fg-subtle">
                    {fmtSize(f.sizeBytes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove.mutate(f.id)}
                    disabled={remove.isPending}
                    className="rounded p-1 text-fg-subtle outline-none hover:bg-surface hover:text-fg"
                    aria-label="Remove file"
                  >
                    <Icon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload.mutate(f);
              e.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={upload.isPending}
            onClick={() => fileInput.current?.click()}
          >
            {upload.isPending ? "Uploading…" : "Upload file"}
          </Button>
        </div>
      )}
    </div>
  );
}
