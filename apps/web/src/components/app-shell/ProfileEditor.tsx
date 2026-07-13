import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Icon, Input, Textarea, cn } from "@mirae/ui";
import { Image01Icon, Upload01Icon } from "@hugeicons/core-free-icons";
import { artistApi, type StudioStatus } from "../../lib/api.ts";

const KEY = ["artist", "me"];

const STATUSES: { value: StudioStatus; label: string; dot: string }[] = [
  { value: "open", label: "Open", dot: "bg-emerald-500" },
  { value: "waitlist", label: "Waitlist", dot: "bg-amber-500" },
  { value: "closed", label: "Closed", dot: "bg-fg-subtle" },
];

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-fg">{children}</span>;
}

export function ProfileEditor() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: KEY,
    queryFn: artistApi.me,
  });

  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<StudioStatus>("open");

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setTagline(profile.tagline ?? "");
    setBio(profile.bio ?? "");
    setStatus(profile.status);
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      artistApi.update({
        displayName,
        tagline: tagline.trim() || null,
        bio: bio.trim() || null,
        status,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const upload = useMutation({
    mutationFn: ({ kind, file }: { kind: "avatar" | "cover"; file: File }) =>
      artistApi.uploadMedia(kind, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: Error) => alert(e.message),
  });
  // Cache-bust the served media when it changes.
  const mediaUrl = (kind: "avatar" | "cover") =>
    profile
      ? `/api/studio/${profile.handle}/${kind}?v=${profile.updatedAt ?? ""}`
      : undefined;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle shadow-soft">
        Loading…
      </div>
    );
  }

  return (
    <form
      className="rounded-xl border border-border bg-surface p-5 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Profile</h2>
        {profile && (
          <span className="text-xs text-fg-subtle">
            usemirae.com/@{profile.handle}
          </span>
        )}
      </div>

      {/* Avatar + cover */}
      <div className="mt-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => avatarInput.current?.click()}
          className="group relative rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          aria-label="Change photo"
        >
          <Avatar
            src={profile?.avatarR2Key ? mediaUrl("avatar") : null}
            name={displayName}
            size={64}
            className="rounded-2xl"
          />
          <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Icon icon={Upload01Icon} size={16} />
          </span>
        </button>
        <div className="flex flex-col gap-1.5">
          <Label>Photo &amp; cover</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => avatarInput.current?.click()}
              disabled={upload.isPending}
            >
              <Icon icon={Upload01Icon} size={15} /> Photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => coverInput.current?.click()}
              disabled={upload.isPending}
            >
              <Icon icon={Image01Icon} size={15} />
              {profile?.coverR2Key ? "Change cover" : "Add cover"}
            </Button>
          </div>
        </div>
        <input
          ref={avatarInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload.mutate({ kind: "avatar", file: f });
            e.target.value = "";
          }}
        />
        <input
          ref={coverInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload.mutate({ kind: "cover", file: f });
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <Label>Display name</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Label>Tagline</Label>
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Character illustrator · semi-realistic & anime"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <Label>Bio</Label>
          <Textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What you take on, revision policy, licensing…"
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <Label>Commission status</Label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500",
                  status === s.value
                    ? "border-accent-500 bg-accent-50 text-accent-700"
                    : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                )}
              >
                <span className={cn("size-1.5 rounded-full", s.dot)} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
        {save.isSuccess && !save.isPending && (
          <span className="text-sm text-emerald-600">Saved</span>
        )}
      </div>
    </form>
  );
}
