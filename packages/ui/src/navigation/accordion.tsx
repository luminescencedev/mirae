import { type ComponentProps } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "../utils/cn.ts";

// Accordion (Radix) on Mirae tokens. Smooth height animation via the measured
// content-height var (keyframes in globals.css); respects reduced-motion.
export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 items-center justify-between gap-3 px-4 py-3.5 text-left outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-500",
          className,
        )}
        {...props}
      >
        {children}
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-fg-subtle transition-transform duration-200 ease-out group-data-[state=open]:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="overflow-hidden data-[state=closed]:[animation:mirae-acc-up_0.2s_ease] data-[state=open]:[animation:mirae-acc-down_0.22s_ease]"
      {...props}
    >
      <div className={cn("border-t border-border p-4", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}
