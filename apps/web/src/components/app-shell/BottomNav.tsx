import { Link } from "@tanstack/react-router";
import { Icon, cn } from "@mirae/ui";
import type { IconData } from "../mockups/seed.ts";

export type NavItem = { label: string; icon: IconData; to: string };

/** Mobile bottom tab bar (hidden on md+). Every /app destination is reachable. */
export function BottomNav({
  items,
  activeIndex,
  newRequests,
}: {
  items: NavItem[];
  activeIndex: number;
  newRequests: number;
}) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item, i) => {
        const active = i === activeIndex;
        return (
          <Link
            key={item.label}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500",
              active ? "text-accent-600" : "text-fg-subtle",
            )}
          >
            <span className="relative grid size-6 place-items-center">
              <Icon icon={item.icon} size={20} strokeWidth={active ? 2 : 1.7} />
              {item.label === "Requests" && newRequests > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-accent-500 px-1 text-[9px] font-semibold leading-4 text-white">
                  {newRequests}
                </span>
              )}
            </span>
            <span className="max-w-full truncate px-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
