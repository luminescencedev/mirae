import { animate, motion, useMotionValue } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn.ts";

type HoverBarListProps<T> = {
  items: T[];
  keyOf: (item: T, index: number) => string;
  children: (item: T, index: number) => ReactNode;
  onSelect?: (item: T, index: number) => void;
  /** If provided each row is an `<a href>` (otherwise a `<button>`). */
  hrefOf?: (item: T, index: number) => string;
  external?: boolean;
  /** Row layout: side-by-side (default) or stacked. */
  orientation?: "horizontal" | "vertical";
  /** Index highlighted at rest (e.g. active tab). */
  activeIndex?: number;
  className?: string;
  rowClassName?: string;
};

/**
 * A single surface that springs behind the hovered (or active) row, instead of
 * a per-row hover. One animated bar, rows layered on top. Measures each row so
 * it works with variable widths (horizontal) or heights (vertical).
 * Adapted from Arthur's portfolio mechanism; light-theme tint. Motion polish
 * per emil-design-eng (spring, settle-in-place, no fade-from-nothing).
 */
export function HoverBarList<T>({
  items,
  keyOf,
  children,
  onSelect,
  hrefOf,
  external,
  orientation = "horizontal",
  activeIndex,
  className,
  rowClassName,
}: HoverBarListProps<T>) {
  const [hovered, setHovered] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const w = useMotionValue(0);
  const h = useMotionValue(0);
  const placed = useRef(false);

  const moveTo = (index: number | null) => {
    const target = index ?? activeIndex ?? null;
    if (target === null) return;
    const el = itemRefs.current[target];
    if (!el) return;
    const nx = el.offsetLeft;
    const ny = el.offsetTop;
    const nw = el.offsetWidth;
    const nh = el.offsetHeight;
    if (!placed.current) {
      // First placement: snap, don't animate from origin.
      x.set(nx);
      y.set(ny);
      w.set(nw);
      h.set(nh);
      placed.current = true;
    } else {
      const spring = { type: "spring" as const, stiffness: 420, damping: 38 };
      animate(x, nx, spring);
      animate(y, ny, spring);
      animate(w, nw, spring);
      animate(h, nh, spring);
    }
  };

  const enter = (index: number) => {
    moveTo(index);
    setHovered(index);
  };

  const leave = () => {
    setHovered(null);
    if (activeIndex != null) moveTo(activeIndex);
  };

  const visible = hovered !== null || activeIndex != null;

  return (
    <ul
      ref={listRef}
      onMouseLeave={leave}
      className={cn(
        "relative",
        orientation === "horizontal" ? "flex items-stretch" : "flex flex-col",
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 rounded-lg bg-surface-sunken"
        style={{ x, y, width: w, height: h }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.96,
        }}
        transition={{
          opacity: { duration: 0.18, ease: "easeOut" },
          scale: { duration: 0.22, ease: "easeOut" },
        }}
      />
      {items.map((item, index) => {
        const interactive = Boolean(hrefOf || onSelect);
        const rowClass = cn(
          "relative z-10 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors",
          hovered === index || (hovered === null && activeIndex === index)
            ? "text-fg"
            : "text-fg-muted",
          interactive &&
            "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
          rowClassName,
        );
        return (
          <li
            key={keyOf(item, index)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onMouseEnter={() => enter(index)}
          >
            {hrefOf ? (
              <a
                href={hrefOf(item, index)}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                onFocus={() => enter(index)}
                className={rowClass}
              >
                {children(item, index)}
              </a>
            ) : onSelect ? (
              <button
                type="button"
                onFocus={() => enter(index)}
                onClick={() => onSelect(item, index)}
                className={rowClass}
              >
                {children(item, index)}
              </button>
            ) : (
              <div className={rowClass}>{children(item, index)}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
