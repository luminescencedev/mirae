import { type ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../utils/cn.ts";

// Modal dialog (Radix) on Mirae tokens. Overlay fades; content zooms from
// center (modals stay centered — not origin-aware, per emil-design-eng).
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] data-[state=open]:animate-[mirae-fade-in_150ms_ease-out] data-[state=closed]:animate-[mirae-fade-out_120ms_ease-in]",
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-surface p-6 shadow-panel outline-none data-[state=open]:animate-[mirae-pop-in_160ms_var(--ease-out)] data-[state=closed]:animate-[mirae-pop-out_130ms_ease-in]",
          className,
        )}
        // Don't dismiss / disturb drag when interacting with a toast over the
        // dialog.
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
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
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

export function DialogDescription({
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
