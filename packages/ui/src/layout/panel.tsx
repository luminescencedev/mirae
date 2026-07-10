import { type ComponentProps } from "react";
import { cn } from "../utils/cn.ts";

// Structural surface for larger regions/sections (app-shell areas). Single
// clean border + soft shadow, generous radius — a calm container that lets
// the double-bezel Cards inside it be the focal points.
export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface shadow-soft",
        className,
      )}
      {...props}
    />
  );
}
