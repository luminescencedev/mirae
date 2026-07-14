import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Icon, cn, useToast } from "@mirae/ui";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import {
  artistApi,
  commissionTypesApi,
  linksApi,
  portfolioApi,
} from "../../lib/api.ts";

const DISMISS_KEY = "mirae-launch-checklist-dismissed";
const EASE = [0.23, 1, 0.32, 1] as const;

/** Dashboard "launch checklist" — guides a new studio from empty to shareable
 *  without a forced wizard. Auto-hides once everything's done, or on dismiss. */
export function LaunchChecklist() {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISS_KEY) === "1",
  );

  const profileQ = useQuery({ queryKey: ["artist", "me"], queryFn: artistApi.me });
  const typesQ = useQuery({
    queryKey: ["commission-types"],
    queryFn: commissionTypesApi.list,
  });
  const portfolioQ = useQuery({
    queryKey: ["portfolio"],
    queryFn: portfolioApi.list,
  });
  const linksQ = useQuery({ queryKey: ["artist-links"], queryFn: linksApi.list });

  const profile = profileQ.data;
  if (dismissed || !profile) return null;

  const handle = profile.handle;
  const hasAvatar = !!profile.avatarR2Key;
  const hasTypes = (typesQ.data?.length ?? 0) > 0;
  const hasPublished =
    (portfolioQ.data?.filter((p) => p.visibility === "published").length ?? 0) >
    0;
  const hasLinks = (linksQ.data?.length ?? 0) > 0;
  const isOpen = profile.status === "open";

  const steps = [
    {
      label: "Add your photo & bio",
      done: hasAvatar && !!profile.bio,
      to: "/app/studio-page" as const,
    },
    {
      label: "Create a commission type",
      done: hasTypes,
      to: "/app/studio-page" as const,
    },
    {
      label: "Publish a portfolio project",
      done: hasPublished,
      to: "/app/studio-page" as const,
    },
    {
      label: "Add your links",
      done: hasLinks,
      to: "/app/studio-page" as const,
    },
    {
      label: "Open for commissions",
      done: isOpen,
      to: "/app/studio-page" as const,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  if (allDone) return null; // nothing left to guide

  const share = async () => {
    const url = `${window.location.origin}/@${handle}`;
    try {
      await navigator.clipboard?.writeText(url);
      toast({ title: "Studio link copied", variant: "success" });
    } catch {
      toast({ title: url });
    }
  };

  return (
    <motion.section
      data-tour="launch-checklist"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="rounded-xl border border-border bg-surface p-4 shadow-soft sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight text-fg">
            Get your studio ready
          </h2>
          <p className="mt-0.5 text-xs text-fg-subtle">
            {doneCount} of {steps.length} done — a complete studio converts more
            visitors.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
          className="grid size-7 shrink-0 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
        >
          <Icon icon={Cancel01Icon} size={15} />
        </button>
      </div>

      {/* Progress */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(doneCount / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: EASE }}
          className="h-full rounded-full bg-accent-500"
        />
      </div>

      <ul className="mt-4 flex flex-col gap-1">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              to={s.to}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-2 py-2 text-sm outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-500",
                s.done && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full",
                  s.done
                    ? "text-emerald-600"
                    : "border border-border-strong text-transparent",
                )}
              >
                {s.done && (
                  <Icon icon={CheckmarkCircle02Icon} size={20} strokeWidth={1.8} />
                )}
              </span>
              <span
                className={cn(
                  "flex-1",
                  s.done ? "text-fg-muted line-through" : "text-fg",
                )}
              >
                {s.label}
              </span>
              {!s.done && (
                <Icon
                  icon={ArrowRight01Icon}
                  size={15}
                  strokeWidth={1.8}
                  className="text-fg-subtle transition-transform group-hover:translate-x-0.5"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={share}
        className="mt-3 w-full rounded-lg border border-border py-2 text-sm font-medium text-fg outline-none transition-colors hover:border-accent-500 hover:text-accent-700 focus-visible:ring-2 focus-visible:ring-accent-500 active:scale-[0.99]"
      >
        Copy your studio link → usemirae.com/@{handle}
      </button>
    </motion.section>
  );
}
