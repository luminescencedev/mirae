import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Icon, Input, cn } from "@mirae/ui";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
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

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-fg">
            Portfolio
          </h2>
          <p className="text-sm text-fg-subtle">
            Your work, shown first on your public page. Drafts stay private.
          </p>
        </div>
      </div>

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
        <p className="py-8 text-center text-sm text-fg-subtle">Loading…</p>
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
}: {
  project: PortfolioProject;
  onChanged: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [title, setTitle] = useState(project.title);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await portfolioApi.uploadAsset(project.id, file);
      }
      onChanged();
    } finally {
      setUploading(false);
    }
  };

  const published = project.visibility === "published";

  return (
    <div className="rounded-xl border border-border bg-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title.trim() && title.trim() !== project.title)
              patch.mutate({ title: title.trim() });
          }}
          className="h-9 min-w-40 flex-1"
        />

        <select
          value={project.projectType}
          onChange={(e) =>
            patch.mutate({ projectType: e.target.value as ProjectType })
          }
          className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-fg outline-none focus-visible:border-accent-500"
        >
          {Object.entries(TYPE_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={project.visibility}
          onChange={(e) =>
            patch.mutate({ visibility: e.target.value as ProjectVisibility })
          }
          className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-fg outline-none focus-visible:border-accent-500"
        >
          {Object.entries(VISIBILITY_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>

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
          <IconButton
            label="Delete project"
            onClick={() => {
              if (confirm(`Delete "${project.title}" and its images?`))
                remove.mutate();
            }}
            danger
            icon={Delete02Icon}
          />
        </div>
      </div>

      {/* Assets */}
      <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
        {project.assets.map((asset) => (
          <div
            key={asset.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-muted"
          >
            <img
              src={assetUrl(asset.id)}
              alt={asset.altText ?? ""}
              className="size-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => removeAsset.mutate(asset.id)}
              className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Icon icon={Delete02Icon} size={14} />
            </button>
          </div>
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

function IconButton({
  label,
  onClick,
  icon,
  disabled,
  danger,
  active,
}: {
  label: string;
  onClick?: () => void;
  icon: Parameters<typeof Icon>[0]["icon"];
  disabled?: boolean;
  danger?: boolean;
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
          : danger
            ? "text-fg-subtle hover:bg-red-50 hover:text-red-600"
            : "text-fg-subtle hover:bg-surface-muted hover:text-fg",
      )}
    >
      <Icon icon={icon} size={16} />
    </button>
  );
}
