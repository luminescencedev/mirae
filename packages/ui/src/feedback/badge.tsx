import { type ComponentProps } from "react";
import { cva, type VariantProps } from "../utils/variants.ts";
import { cn } from "../utils/cn.ts";

// Small pill / tag chip. Neutral + accent for status, plus a soft colored
// palette for category tags (Web / Saas / Mobile …) like the reference
// dashboards. See docs/DESIGN_SYSTEM.md.
export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-sunken text-fg-muted",
        outline: "border border-border text-fg-muted",
        accent: "bg-accent-50 text-accent-700",
        blue: "bg-blue-50 text-blue-700",
        violet: "bg-violet-50 text-violet-700",
        teal: "bg-teal-50 text-teal-700",
        amber: "bg-amber-50 text-amber-700",
        rose: "bg-rose-50 text-rose-700",
        emerald: "bg-emerald-50 text-emerald-700",
        // status aliases
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
