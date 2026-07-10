import { type ComponentProps } from "react";
import { cn } from "../utils/cn.ts";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg outline-none transition-[color,border-color,box-shadow] duration-150 ease-out placeholder:text-fg-subtle hover:border-border-strong focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
