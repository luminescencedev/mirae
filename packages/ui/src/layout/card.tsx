import { type ComponentProps } from "react";
import { cn } from "../utils/cn.ts";

// Clean content card — one thin border, generous radius, whisper-soft shadow.
// shadcn/Linear-level restraint. Adapts to light/dark via semantic tokens.
// (A heavier double-bezel treatment lives behind the `bezel` prop for the
// rare hero surface.) See docs/DESIGN_SYSTEM.md.
export function Card({
  className,
  bezel = false,
  children,
  ...props
}: ComponentProps<"div"> & { bezel?: boolean }) {
  if (bezel) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-surface-muted p-1.5 shadow-panel",
          className,
        )}
        {...props}
      >
        <div className="rounded-[14px] border border-border/60 bg-surface">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1 p-5", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-sm font-semibold tracking-tight text-fg", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm text-fg-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center p-5 pt-0", className)} {...props} />
  );
}
