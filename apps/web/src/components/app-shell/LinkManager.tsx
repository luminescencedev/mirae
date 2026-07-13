import { useState } from "react";
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
  Button,
  Icon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  cn,
} from "@mirae/ui";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  Link01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import {
  linksApi,
  type ArtistLink,
  type LinkStyle,
  type LinkType,
} from "../../lib/api.ts";

const KEY = ["artist-links"];

const TYPE_LABELS: Record<LinkType, string> = {
  social: "Social",
  shop: "Shop",
  support: "Support",
  video: "Video",
  stream: "Stream",
  newsletter: "Newsletter",
  contact: "Contact",
  custom: "Custom",
};

const STYLE_LABELS: Record<LinkStyle, string> = {
  simple: "Simple",
  card: "Card",
  media: "Media",
  featured: "Featured",
};

const PLATFORMS = [
  "instagram",
  "x",
  "bluesky",
  "tiktok",
  "twitch",
  "youtube",
  "discord",
  "patreon",
  "kofi",
  "artstation",
  "website",
  "email",
  "custom",
];

export function LinkManager() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });
  const { data: links, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: linksApi.list,
  });

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const create = useMutation({
    mutationFn: () => linksApi.create({ title: title.trim(), url: url.trim() }),
    onSuccess: () => {
      setTitle("");
      setUrl("");
      invalidate();
    },
    onError: (e: Error) => alert(e.message),
  });

  const reorder = useMutation({
    mutationFn: linksApi.reorder,
    onSuccess: invalidate,
  });
  const move = (index: number, dir: -1 | 1) => {
    if (!links) return;
    const next = [...links];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    reorder.mutate(next.map((l) => l.id));
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-fg">Links</h2>
        <p className="text-sm text-fg-subtle">
          Your shop, socials and anything else — shown on your public page.
        </p>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim() && url.trim()) create.mutate();
        }}
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Label (e.g. Ko-fi)"
          className="min-w-40 flex-1"
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL or email"
          className="min-w-48 flex-1"
        />
        <Button
          type="submit"
          disabled={!title.trim() || !url.trim() || create.isPending}
        >
          <Icon icon={Add01Icon} size={16} />
          Add link
        </Button>
      </form>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : !links?.length ? (
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <div className="text-fg-subtle">
            <Icon icon={Link01Icon} size={22} />
          </div>
          <p className="text-sm font-medium text-fg">No links yet</p>
          <p className="max-w-xs text-sm text-fg-subtle">
            Add your first link — a shop, a social, a support page.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {links.map((link, i) => (
            <LinkRow
              key={link.id}
              link={link}
              onChanged={invalidate}
              onMoveUp={i > 0 ? () => move(i, -1) : undefined}
              onMoveDown={i < links.length - 1 ? () => move(i, 1) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function LinkRow({
  link,
  onChanged,
  onMoveUp,
  onMoveDown,
}: {
  link: ArtistLink;
  onChanged: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);

  const patch = useMutation({
    mutationFn: (body: Parameters<typeof linksApi.update>[1]) =>
      linksApi.update(link.id, body),
    onSuccess: onChanged,
  });
  const remove = useMutation({
    mutationFn: () => linksApi.remove(link.id),
    onSuccess: onChanged,
  });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-muted text-fg-subtle">
        <Icon icon={Link01Icon} size={15} />
      </span>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          if (title.trim() && title !== link.title)
            patch.mutate({ title: title.trim() });
        }}
        className="h-8 min-w-32 flex-1"
      />
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => {
          if (url.trim() && url !== link.url) patch.mutate({ url: url.trim() });
        }}
        className="h-8 min-w-40 flex-[2]"
      />

      <Select
        value={link.platform ?? "custom"}
        onValueChange={(v) => patch.mutate({ platform: v })}
      >
        <SelectTrigger className="h-8 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={link.type}
        onValueChange={(v) => patch.mutate({ type: v as LinkType })}
      >
        <SelectTrigger className="h-8 w-28">
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
        value={link.style}
        onValueChange={(v) => patch.mutate({ style: v as LinkStyle })}
      >
        <SelectTrigger className="h-8 w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STYLE_LABELS).map(([v, label]) => (
            <SelectItem key={v} value={v}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-1.5">
        <label className="flex items-center gap-1.5 text-xs text-fg-subtle">
          <Switch
            checked={link.enabled}
            onCheckedChange={(v) => patch.mutate({ enabled: v })}
          />
        </label>
        <IconBtn
          label={link.featured ? "Unfeature" : "Feature"}
          active={link.featured}
          icon={StarIcon}
          onClick={() => patch.mutate({ featured: !link.featured })}
        />
        <IconBtn
          label="Move up"
          icon={ArrowUp01Icon}
          onClick={onMoveUp}
          disabled={!onMoveUp}
        />
        <IconBtn
          label="Move down"
          icon={ArrowDown01Icon}
          onClick={onMoveDown}
          disabled={!onMoveDown}
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label="Delete link"
              title="Delete link"
              className="grid size-8 place-items-center rounded-md text-fg-subtle outline-none transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <Icon icon={Delete02Icon} size={15} />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{link.title}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the link from your public page. This can’t be
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
  );
}

function IconBtn({
  label,
  icon,
  onClick,
  disabled,
  active,
}: {
  label: string;
  icon: Parameters<typeof Icon>[0]["icon"];
  onClick?: () => void;
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
      <Icon icon={icon} size={15} />
    </button>
  );
}
