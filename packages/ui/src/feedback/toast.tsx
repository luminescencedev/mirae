import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../utils/cn.ts";

type ToastVariant = "default" | "success" | "error";
type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};
type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

// useToast() → toast({ title, description?, variant? }). No-op-safe if the
// provider is absent (returns a stub) so components stay decoupled.
export function useToast() {
  const push = useContext(ToastContext);
  return { toast: push ?? (() => {}) };
}

const DOT: Record<ToastVariant, string> = {
  default: "bg-fg-muted",
  success: "bg-emerald-500",
  error: "bg-red-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: ToastInput) => {
    const id = crypto.randomUUID();
    setToasts((cur) => [
      ...cur,
      {
        id,
        title: t.title,
        description: t.description,
        variant: t.variant ?? "default",
      },
    ]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-border bg-surface p-3.5 shadow-panel"
            >
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  DOT[t.variant],
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-fg">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-fg-muted">
                    {t.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
