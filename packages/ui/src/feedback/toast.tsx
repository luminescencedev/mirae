import { type ReactNode } from "react";
import { Toaster, toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "success" | "error";
type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

// useToast() → toast({ title, description?, variant? }), backed by sonner.
export function useToast() {
  const toast = (t: ToastInput) => {
    const opts = t.description ? { description: t.description } : undefined;
    if (t.variant === "success") sonnerToast.success(t.title, opts);
    else if (t.variant === "error") sonnerToast.error(t.title, opts);
    else sonnerToast(t.title, opts);
  };
  return { toast };
}

// Mounts sonner's Toaster at the bottom-left (keeps clear of the right-side
// Sheet / drawer so its actions stay clickable). Mirae radius + font.
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-left"
        closeButton
        toastOptions={{
          style: {
            background: "var(--color-surface, #fff)",
            color: "var(--color-fg, #121316)",
            border: "1px solid var(--color-border, #e7e8ec)",
            borderRadius: "12px",
            boxShadow:
              "0 1px 2px rgba(20,21,24,.06), 0 10px 30px rgba(20,21,24,.10)",
            fontFamily: "var(--font-sans, ui-sans-serif, system-ui)",
          },
        }}
      />
    </>
  );
}
