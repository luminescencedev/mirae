import { type ComponentProps } from "react";
import { cn } from "../utils/cn.ts";

// A calm loading placeholder. Pulse respects reduced-motion (globals.css).
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-muted", className)}
      {...props}
    />
  );
}
