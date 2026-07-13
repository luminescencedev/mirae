import { type ReactNode } from "react";
import { Toaster, toast as sonnerToast } from "sonner";
import {
  Alert02Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "../icons/icon.tsx";

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

// Mounts sonner's Toaster: top-right, richColors, light theme, Hugeicons for
// each type, and its native interactions — hover to expand a stack, swipe a
// toast to the side to dismiss.
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        theme="light"
        richColors
        icons={{
          success: <Icon icon={CheckmarkCircle02Icon} size={18} />,
          error: <Icon icon={AlertCircleIcon} size={18} />,
          warning: <Icon icon={Alert02Icon} size={18} />,
          info: <Icon icon={InformationCircleIcon} size={18} />,
          loading: (
            <span className="inline-flex animate-spin motion-reduce:animate-none">
              <Icon icon={Loading03Icon} size={18} />
            </span>
          ),
        }}
      />
    </>
  );
}
