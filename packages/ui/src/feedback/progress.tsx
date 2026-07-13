import { type ComponentProps } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../utils/cn.ts";

// Progress (Radix) on Mirae tokens. `value` is 0–100.
export function Progress({
  value = 0,
  className,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & { value?: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <ProgressPrimitive.Root
      value={pct}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-surface-muted",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-accent-500 transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
