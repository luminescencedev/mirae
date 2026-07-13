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

// Mounts sonner's Toaster — stock top-right, richColors, light theme.
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors theme="light" />
    </>
  );
}
