import { useRef, useState } from "react";
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

  const move = (index: number, dir: -1 | 1) => {
    if (!projects) return;
    const next = [...projects];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate(next.map((p) => p.id));
  };

  const drag = useDragOrder(projects ?? [], (ids) => reorder.mutate(ids));

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
        <div className="flex flex-col gap-4">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              onChanged={invalidate}
              onMoveUp={i > 0 ? () => move(i, -1) : undefined}
              onMoveDown={
                i < projects.length - 1 ? () => move(i, 1) : undefined
              }
              handleProps={drag.handleProps(project.id)}
              rowProps={drag.rowProps(project.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectCard({
  project,
  onChanged,
  onMoveUp,
  onMoveDown,
  handleProps,
  rowProps,
}: {
  project: PortfolioProject;
  onChanged: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  handleProps: DragHandleProps;
  rowProps: DragRowProps;
}) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [dragOver, setDragOver] = useState(false);

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

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading(true);
    setUploadPct(0);
    try {
      let done = 0;
      for (const file of list) {
        await portfolioApi.uploadAsset(project.id, file);
        done++;
        setUploadPct(Math.round((done / list.length) * 100));
      }
      onChanged();
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  };

  const published = project.visibility === "published";

  return (
    <div
      {...rowProps}
      className="rounded-xl border border-border bg-surface transition-shadow data-[dragging]:opacity-50 data-[drop-target]:ring-2 data-[drop-target]:ring-accent-500"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <button
          type="button"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          {...handleProps}
          className="grid size-8 shrink-0 cursor-grab place-items-center rounded-md text-fg-subtle hover:bg-surface-muted hover:text-fg active:cursor-grabbing"
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

      {/* Assets */}
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
        {project.assets.map((asset) => (
          <AssetTile
            key={asset.id}
            asset={asset}
            onRemove={() => removeAsset.mutate(asset.id)}
            onSetAlt={(altText) => setAlt.mutate({ id: asset.id, altText })}
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
            void upload(e.dataTransfer.files);
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
            void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function AssetTile({
  asset,
  onRemove,
  onSetAlt,
  handleProps,
  rowProps,
}: {
  asset: PortfolioProject["assets"][number];
  onRemove: () => void;
  onSetAlt: (altText: string) => void;
  handleProps: DragHandleProps;
  rowProps: DragRowProps;
}) {
  const [alt, setAlt] = useState(asset.altText ?? "");
  return (
    <div className="group flex flex-col gap-1.5">
      <div
        {...rowProps}
        className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-muted transition-shadow data-[dragging]:opacity-50 data-[drop-target]:ring-2 data-[drop-target]:ring-accent-500"
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
          className="absolute left-1.5 top-1.5 grid size-7 cursor-grab place-items-center rounded-md bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
        >
          <Icon icon={DragDropVerticalIcon} size={14} />
        </button>
        <button
          type="button"
          aria-label="Remove image"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Icon icon={Delete02Icon} size={14} />
        </button>
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
