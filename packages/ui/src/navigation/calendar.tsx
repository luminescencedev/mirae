import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "../icons/icon.tsx";
import { cn } from "../utils/cn.ts";

const EASE = [0.23, 1, 0.32, 1] as const;

const WEEKDAYS = [
  { s: "M", l: "Mo" },
  { s: "T", l: "Tu" },
  { s: "W", l: "We" },
  { s: "T", l: "Th" },
  { s: "F", l: "Fr" },
  { s: "S", l: "Sa" },
  { s: "S", l: "Su" },
];

/** Local yyyy-m-d key. Exported so callers can build the `markers` map. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

export type CalendarProps = {
  selected?: Date | null;
  onSelect?: (date: Date) => void;
  /** Which month to show first (uncontrolled). Defaults to selected or today. */
  defaultMonth?: Date;
  /** dayKey → dot color classes (e.g. ["bg-accent-500"]). Rendered under the day. */
  markers?: Map<string, string[]>;
  /** `lg` fills desktop space with taller rows + bigger day circles. */
  size?: "default" | "lg";
  className?: string;
};

export function Calendar({
  selected,
  onSelect,
  defaultMonth,
  markers,
  size = "default",
  className,
}: CalendarProps) {
  const reduce = useReducedMotion();
  const today = new Date();
  const [cursor, setCursor] = useState(() => {
    const base = defaultMonth ?? selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [dir, setDir] = useState(0);

  const lead = (cursor.getDay() + 6) % 7;
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - lead);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const shift = (delta: number) => {
    setDir(delta);
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  const lg = size === "lg";
  const monthSlide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: dir * 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: dir * -40 },
      };
  // Unique layoutId per Calendar instance so multiple calendars don't clash.
  const uid = useRef(Math.random().toString(36).slice(2)).current;

  return (
    <div className={cn("select-none", className)}>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "font-semibold tracking-tight text-fg",
            lg ? "text-base" : "text-sm",
          )}
        >
          {cursor.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="grid size-7 place-items-center rounded-md text-fg-muted outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-500 active:scale-90"
          >
            <Icon icon={ArrowLeft01Icon} size={15} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shift(1)}
            className="grid size-7 place-items-center rounded-md text-fg-muted outline-none transition-colors hover:bg-surface-muted hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-500 active:scale-90"
          >
            <Icon icon={ArrowRight01Icon} size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="pb-1 text-center text-[11px] font-medium text-fg-subtle"
          >
            {d.l}
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={`${cursor.getFullYear()}-${cursor.getMonth()}`}
            {...monthSlide}
            transition={{ duration: 0.26, ease: EASE }}
            className="grid grid-cols-7 gap-0.5"
          >
            {days.map((date) => {
              const inMonth = date.getMonth() === cursor.getMonth();
              const isToday = sameDay(date, today);
              const isSelected = !!selected && sameDay(date, selected);
              const dots = markers?.get(dayKey(date)) ?? [];
              return (
                <button
                  type="button"
                  key={dayKey(date)}
                  onClick={() => onSelect?.(date)}
                  className={cn(
                    "group relative flex items-center justify-center outline-none",
                    lg ? "h-12 lg:h-14" : "h-9",
                  )}
                >
                  {/* Sliding selection block (shared layout → glides between days) */}
                  {isSelected && (
                    <motion.span
                      layoutId={`cal-sel-${uid}-${cursor.getFullYear()}-${cursor.getMonth()}`}
                      transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                      className={cn(
                        "absolute inset-0 m-auto rounded-lg bg-accent-500",
                        lg ? "size-9 lg:size-10" : "size-8",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 grid place-items-center rounded-lg tabular-nums transition-colors group-focus-visible:ring-2 group-focus-visible:ring-accent-500",
                      lg ? "size-9 text-sm lg:size-10" : "size-8 text-[13px]",
                      isSelected
                        ? "font-medium text-white"
                        : isToday
                          ? "font-semibold text-accent-700 ring-1 ring-inset ring-accent-500/50 group-hover:bg-accent-50"
                          : inMonth
                            ? "text-fg group-hover:bg-surface-muted"
                            : "text-fg-subtle/40 group-hover:bg-surface-muted",
                    )}
                  >
                    {date.getDate()}
                  </span>
                  {dots.length > 0 && (
                    <span className="absolute bottom-0.5 z-10 flex gap-0.5">
                      {dots.slice(0, 3).map((c, di) => (
                        <span
                          key={di}
                          className={cn(
                            "size-1 rounded-full",
                            isSelected ? "bg-white/80" : c,
                          )}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export type DatePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  /** Extra content rendered under the calendar (e.g. a Clear button). */
  footer?: ReactNode;
};

/** Styled date field — a button that opens a Calendar in a lightweight popover.
 *  No dependency on a popover lib; closes on outside-click and Escape. */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent-500",
          value ? "text-fg" : "text-fg-subtle",
        )}
      >
        <Icon
          icon={Calendar03Icon}
          size={15}
          strokeWidth={1.8}
          className="shrink-0 text-fg-subtle"
        />
        <span className="min-w-0 flex-1 truncate text-left">
          {value
            ? value.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(null);
            }}
            className="rounded p-0.5 text-fg-subtle transition-colors hover:text-fg"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -4, scale: 0.97, filter: "blur(2px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -4, scale: 0.97, filter: "blur(2px)" }
            }
            transition={{ duration: 0.16, ease: EASE }}
            className="absolute left-0 top-full z-50 mt-1.5 w-[min(17rem,calc(100vw-2rem))] origin-top rounded-xl border border-border bg-surface p-3 shadow-panel"
          >
            <Calendar
              selected={value}
              onSelect={(d) => {
                onChange?.(d);
                setOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
