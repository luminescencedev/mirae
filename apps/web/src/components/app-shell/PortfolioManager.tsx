import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Badge,
  Button,
  Icon,
  Input,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
  cn,
} from "@mirae/ui";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  Image01Icon,
  StarIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import {
  assetUrl,
  portfolioApi,
  type PortfolioProject,
  type ProjectType,
  type ProjectVisibility,
} from "../../lib/api.ts";
import {
  useDragOrder,
  type DragHandleProps,
  type DragRowProps,
} from "../../lib/use-drag-order.ts";

const KEY = ["portfolio"];

const TYPE_LABELS: Record<ProjectType, string> = {
  illustration: "Illustration",
  character_design: "Character design",
  vtuber: "VTuber",
  emote: "Emote / sticker",
  concept_art: "Concept art",
  animation: "Animation",
  other: "Other",
};

const VISIBILITY_LABELS: Record<ProjectVisibility, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function PortfolioManager() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });
  const { data: projects, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: portfolioApi.list,
  });

  const [title, setTitle] = useState("");
  const create = useMutation({
    mutationFn: () => portfolioApi.create(title.trim()),
    onSuccess: () => {
      setTitle("");
      invalidate();
    },
  });

  const reorder = useMutation({
    mutationFn: portfolioApi.reorder,
    onSuccess: invalidate,
  });

  // Local ordering so motion's Reorder can animate live; persisted on release.
  const [order, setOrder] = useState<PortfolioProject[]>([]);
  useEffect(() => {
    if (projects) setOrder(projects);
  }, [projects]);
  const orderRef = useRef(order);
  orderRef.current = order;
  const commit = () => reorder.mutate(orderRef.current.map((p) => p.id));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    reorder.mutate(next.map((p) => p.id));
  };

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-fg-subtle">
        Your work, shown first on your public page. Drafts stay private.
      </p>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) create.mutate();
        }}
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New project title…"
          className="max-w-xs"
        />
        <Button type="submit" disabled={!title.trim() || create.isPending}>
          <Icon icon={Add01Icon} size={16} />
          Add project
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-2 border-b border-border p-3">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-44" />
                <Skeleton className="h-9 w-32" />
              </div>
              <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="aspect-square" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !projects?.length ? (
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <div className="text-fg-subtle [&_svg]:size-6">
            <Icon icon={Image01Icon} size={24} />
          </div>
          <p className="text-sm font-medium text-fg">No projects yet</p>
          <p className="max-w-xs text-sm text-fg-subtle">
            Add your first project, then upload images to it.
          </p>
        </div>
      ) : (
        <Reorder.Group
          as="div"
          axis="y"
          values={order}
          onReorder={setOrder}
          className="flex flex-col gap-4"
        >
          {order.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              onChanged={invalidate}
              onCommit={commit}
              onMoveUp={i > 0 ? () => move(i, -1) : undefined}
              onMoveDown={i < order.length - 1 ? () => move(i, 1) : undefined}
            />
          ))}
        </Reorder.Group>
      )}
    </section>
  );
}

function ProjectCard({
  project,
  onChanged,
  onCommit,
  onMoveUp,
  onMoveDown,
}: {
  project: PortfolioProject;
  onChanged: () => void;
  onCommit: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const dragControls = useDragControls();
  const [dragging, setDragging] = useState(false);
  // Motion's onDragEnd is unreliable with dragControls; end the lift + persist
  // on the global pointerup instead.
  useEffect(() => {
    if (!dragging) return;
    const up = () => {
      setDragging(false);
      onCommit();
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [dragging, onCommit]);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [failed, setFailed] = useState<File[]>([]);

  const patch = useMutation({
    mutationFn: (body: Parameters<typeof portfolioApi.update>[1]) =>
      portfolioApi.update(project.id, body),
    onSuccess: onChanged,
  });
  const remove = useMutation({
    mutationFn: () => portfolioApi.remove(project.id),
    onSuccess: onChanged,
  });
  const removeAsset = useMutation({
    mutationFn: (assetId: string) => portfolioApi.removeAsset(assetId),
    onSuccess: onChanged,
  });
  const setAlt = useMutation({
    mutationFn: (v: { id: string; altText: string }) =>
      portfolioApi.setAlt(v.id, v.altText),
    onSuccess: onChanged,
  });
  const reorderAssets = useMutation({
    mutationFn: portfolioApi.reorderAssets,
    onSuccess: onChanged,
  });
  const assetDrag = useDragOrder(project.assets, (ids) =>
    reorderAssets.mutate(ids),
  );

  const upload = async (list: File[]) => {
    if (!list.length) return;
    setUploading(true);
    setUploadPct(0);
    const errs: File[] = [];
    let done = 0;
    for (const file of list) {
      try {
        await portfolioApi.uploadAsset(project.id, file);
      } catch {
        errs.push(file);
      }
      done++;
      setUploadPct(Math.round((done / list.length) * 100));
    }
    setUploading(false);
    setUploadPct(0);
    setFailed(errs);
    onChanged();
  };

  const published = project.visibility === "published";

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface transition-shadow",
        dragging && "z-20 cursor-grabbing drag-lift",
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <button
          type="button"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          onPointerDown={(e) => {
            setDragging(true);
            dragControls.start(e);
          }}
          className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-fg-subtle hover:bg-surface-muted hover:text-fg active:cursor-grabbing"
        >
          <Icon icon={DragDropVerticalIcon} size={16} />
        </button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title.trim() && title.trim() !== project.title)
              patch.mutate({ title: title.trim() });
          }}
          className="h-9 min-w-40 flex-1"
        />

        <Select
          value={project.projectType}
          onValueChange={(v) => patch.mutate({ projectType: v as ProjectType })}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_LABELS).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={project.visibility}
          onValueChange={(v) =>
            patch.mutate({ visibility: v as ProjectVisibility })
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(VISIBILITY_LABELS).map(([v, label]) => (
              <SelectItem key={v} value={v}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {published && (
          <Badge variant={project.featured ? "accent" : "outline"}>
            {project.featured ? "Featured" : "Live"}
          </Badge>
        )}

        <div className="ml-auto flex items-center gap-1">
          <IconButton
            label={project.featured ? "Unfeature" : "Feature"}
            active={project.featured}
            onClick={() => patch.mutate({ featured: !project.featured })}
            icon={StarIcon}
          />
          <IconButton
            label="Move up"
            onClick={onMoveUp}
            disabled={!onMoveUp}
            icon={ArrowUp01Icon}
          />
          <IconButton
            label="Move down"
            onClick={onMoveDown}
            disabled={!onMoveDown}
            icon={ArrowDown01Icon}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                aria-label="Delete project"
                title="Delete project"
                className="grid size-8 place-items-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <Icon icon={Delete02Icon} size={16} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete “{project.title}”?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the project and its {project.assets.length} image
                  {project.assets.length === 1 ? "" : "s"}. This can’t be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-600/90"
                  onClick={() => remove.mutate()}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Description */}
      <div className="px-3 pt-3">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description !== (project.description ?? ""))
              patch.mutate({ description: description || null });
          }}
          placeholder="Description (optional) — what is this piece?"
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="flex items-center gap-3 px-3 pt-3 text-xs text-fg-subtle">
          <Progress value={uploadPct} className="flex-1" />
          <span className="tabular-nums">{uploadPct}%</span>
        </div>
      )}

      {/* Failed uploads — retry */}
      {!uploading && failed.length > 0 && (
        <div className="mx-3 mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <span>
            {failed.length} image{failed.length === 1 ? "" : "s"} failed to
            upload.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => {
              const retry = failed;
              setFailed([]);
              void upload(retry);
            }}
          >
            Retry
          </Button>
          <button
            type="button"
            className="text-red-600/70 hover:text-red-700"
            onClick={() => setFailed([])}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Assets */}
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
        {project.assets.map((asset) => (
          <AssetTile
            key={asset.id}
            asset={asset}
            isCover={project.coverAssetId === asset.id}
            onRemove={() => removeAsset.mutate(asset.id)}
            onSetAlt={(altText) => setAlt.mutate({ id: asset.id, altText })}
            onToggleCover={() =>
              patch.mutate({
                coverAssetId:
                  project.coverAssetId === asset.id ? null : asset.id,
              })
            }
            handleProps={assetDrag.handleProps(asset.id)}
            rowProps={assetDrag.rowProps(asset.id)}
          />
        ))}

        {/* Upload dropzone */}
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void upload(Array.from(e.dataTransfer.files));
          }}
          className={cn(
            "grid aspect-square place-items-center gap-1 rounded-lg border border-dashed text-center text-xs transition-colors",
            dragOver
              ? "border-accent-500 bg-accent-50 text-accent-600"
              : "border-border text-fg-subtle hover:border-border-strong hover:text-fg",
          )}
        >
          <Icon icon={Upload01Icon} size={18} />
          {uploading ? "Uploading…" : "Add images"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          multiple
          hidden
          onChange={(e) => {
            void upload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
    </Reorder.Item>
  );
}

function AssetTile({
  asset,
  isCover,
  onRemove,
  onSetAlt,
  onToggleCover,
  handleProps,
  rowProps,
}: {
  asset: PortfolioProject["assets"][number];
  isCover: boolean;
  onRemove: () => void;
  onSetAlt: (altText: string) => void;
  onToggleCover: () => void;
  handleProps: DragHandleProps;
  rowProps: DragRowProps;
}) {
  const [alt, setAlt] = useState(asset.altText ?? "");
  return (
    <div className="group flex flex-col gap-1.5">
      <div
        {...rowProps}
        className={cn(
          "relative aspect-square overflow-hidden rounded-lg border bg-surface-muted transition-shadow data-[dragging]:opacity-50 data-[drop-target]:ring-2 data-[drop-target]:ring-accent-500",
          isCover ? "border-accent-500 ring-1 ring-accent-500" : "border-border",
        )}
      >
        <img
          src={assetUrl(asset.id)}
          alt={asset.altText ?? ""}
          className="size-full object-cover"
          loading="lazy"
        />
        <button
          type="button"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          {...handleProps}
          className="absolute left-1.5 top-1.5 grid size-7 cursor-grab place-items-center rounded-md bg-black/55 text-white opacity-100 transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100 active:cursor-grabbing"
        >
          <Icon icon={DragDropVerticalIcon} size={14} />
        </button>
        <button
          type="button"
          aria-label="Remove image"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-md bg-black/60 text-white opacity-100 transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Icon icon={Delete02Icon} size={14} />
        </button>
        <button
          type="button"
          aria-label={isCover ? "Cover image" : "Set as cover"}
          title={isCover ? "Cover image" : "Set as cover"}
          onClick={onToggleCover}
          className={cn(
            "absolute bottom-1.5 left-1.5 grid size-7 place-items-center rounded-md transition-opacity",
            isCover
              ? "bg-accent-500 text-white opacity-100"
              : "bg-black/60 text-white opacity-100 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100",
          )}
        >
          <Icon icon={StarIcon} size={14} />
        </button>
        {isCover && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-accent-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
            Cover
          </span>
        )}
      </div>
      <Input
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={() => {
          if (alt !== (asset.altText ?? "")) onSetAlt(alt);
        }}
        placeholder="Alt text — describe the image"
        aria-label="Alt text"
        className="h-7 text-xs"
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  icon,
  disabled,
  active,
}: {
  label: string;
  onClick?: () => void;
  icon: Parameters<typeof Icon>[0]["icon"];
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-8 place-items-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-30",
        active
          ? "text-accent-600"
          : "text-fg-subtle hover:bg-surface-muted hover:text-fg",
      )}
    >
      <Icon icon={icon} size={16} />
    </button>
  );
}
