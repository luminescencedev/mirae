import { type ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../utils/cn.ts";

// Right-side slide-over (Radix Dialog). Overlay fades; the panel slides in
// from the right. Use for detail panels / editors alongside a list.
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] data-[state=open]:animate-[mirae-fade-in_200ms_ease-out] data-[state=closed]:animate-[mirae-fade-out_150ms_ease-in]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-panel outline-none data-[state=open]:animate-[mirae-slide-in-right_320ms_cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-[mirae-slide-out-right_260ms_ease-in]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1 text-fg-muted outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("border-b border-border px-5 py-4", className)}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-base font-semibold tracking-tight text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-fg-muted", className)}
      {...props}
    />
  );
}

export function SheetBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-auto px-5 py-4", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}
