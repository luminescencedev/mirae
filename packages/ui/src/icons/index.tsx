import { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

// Crafted thin line icons (currentColor, rounded caps) — Mirae house style,
// from Arthur's portfolio. Prefer these + lucide-react for the rest.

/** Curved branch/return arrow — marks a continuation / "same as previous". */
export function BranchReturnIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3 1 V7 Q3 9.5 5.5 9.5 H11 M8 7 L11 9.5 L8 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Enter / return key glyph — for submit hints and command palettes. */
export function EnterKeyIcon({ size = 15, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 11l-4 4l4 4m-4 -4h11a4 4 0 0 0 0 -8h-1" />
    </svg>
  );
}
