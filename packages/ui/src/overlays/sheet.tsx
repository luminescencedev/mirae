import { type ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../utils/cn.ts";

// Right-side slide-over (Radix Dialog). Overlay fades; the panel slides in
// from the right. Use for detail panels / editors alongside a list.
//
// Non-modal by default: a modal Radix Dialog sets `body { pointer-events:
// none }`, which freezes anything portaled over it (notably sonner toasts —
// no swipe-to-dismiss after reopen). We keep the dimmed overlay + close-on-
// outside via the DismissableLayer, just without the body pointer lock. Pass
// `modal` to override.
export function Sheet(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root modal={false} {...props} />;
}
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      {/* Manual dim — Radix's Overlay only renders for modal dialogs, and this
         Sheet is non-modal (see Sheet). This keeps the backdrop. */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] animate-[mirae-fade-in_200ms_ease-out]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-panel outline-none data-[state=open]:animate-[mirae-slide-in-right_320ms_cubic-bezier(0.32,0.72,0,1)] data-[state=closed]:animate-[mirae-slide-out-right_260ms_ease-in]",
          className,
        )}
        // Don't dismiss / disturb drag when interacting with a toast over the
        // sheet. Guard both pointer + focus outside so the toast stays fully
        // interactive across open/close cycles.
        onPointerDownOutside={(e) => {
          if (
            (e.target as HTMLElement | null)?.closest("[data-sonner-toaster]")
          )
            e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (
            (e.target as HTMLElement | null)?.closest("[data-sonner-toaster]")
          )
            e.preventDefault();
        }}
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
