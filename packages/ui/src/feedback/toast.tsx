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
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontFamily: "var(--font-sans, ui-sans-serif, system-ui)",
          },
        }}
      />
    </>
  );
}
