import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader.tsx";

/** Shared shell for legal pages (privacy, terms) — draft content until reviewed
 *  by counsel before public launch. */
export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <p className="mb-3 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          Draft — pending legal review
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-fg">
          {title}
        </h1>
        <p className="mt-1 text-sm text-fg-subtle">Last updated {updated}</p>
        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-fg-muted [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-fg [&_a]:text-accent-700 [&_a:hover]:underline">
          {children}
        </div>
      </main>
    </div>
  );
}
