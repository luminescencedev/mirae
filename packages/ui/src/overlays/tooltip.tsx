import { type ComponentProps } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../utils/cn.ts";

// Tooltip (Radix) on Mirae tokens. Fast (125ms), origin-aware pop. Wrap the
// app (or a toolbar) in TooltipProvider; delayDuration gates the first hover.
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md bg-fg px-2 py-1 text-xs font-medium text-white shadow-soft [transform-origin:var(--radix-tooltip-content-transform-origin)] data-[state=delayed-open]:animate-[mirae-pop-in_125ms_var(--ease-out)] data-[state=closed]:animate-[mirae-pop-out_100ms_ease-in]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
