import { type ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "../utils/variants.ts";
import { cn } from "../utils/cn.ts";

// shadcn/ui Button, mapped onto Mirae tokens. Child svgs auto-size to 16px and
// padding tightens when an icon is present (has-[>svg]). `asChild` renders the
// styles onto another element via Radix Slot. See docs/DESIGN_SYSTEM.md.
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 focus-visible:border-accent-500 focus-visible:ring-[3px] focus-visible:ring-accent-500/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-fg text-white shadow-xs hover:bg-fg/90",
        secondary:
          "bg-surface-sunken text-fg shadow-xs hover:bg-surface-sunken/70",
        outline:
          "border border-border bg-surface shadow-xs hover:bg-surface-muted hover:text-fg",
        ghost: "text-fg hover:bg-surface-muted",
        accent: "bg-accent-500 text-white shadow-xs hover:bg-accent-600",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-600/90 focus-visible:ring-red-600/40",
        link: "text-fg underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
