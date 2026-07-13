import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Mark } from "@mirae/ui";

/** Centered auth shell (login / signup / onboarding). */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface-sunken px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <Mark className="h-6 w-auto text-fg" />
          <span className="text-base font-semibold tracking-tight">Mirae</span>
        </Link>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
          <h1 className="text-lg font-semibold tracking-tight text-fg">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
          <div className="mt-5">{children}</div>
        </div>
        {footer && (
          <p className="mt-4 text-center text-sm text-fg-muted">{footer}</p>
        )}
      </div>
    </div>
  );
}

/** Labeled field wrapper. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}
