import { type ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";

type HugeiconsProps = ComponentProps<typeof HugeiconsIcon>;

export type IconProps = Omit<HugeiconsProps, "size" | "strokeWidth"> & {
  size?: number;
  strokeWidth?: number;
};

// Mirae icon — Hugeicons (Stroke Rounded) is the house family. Defaults tuned
// for the product: 20px / stroke 1.7. In dense/button contexts pass size={16}
// strokeWidth={1.8}. Brand logos (Discord/X/…) come from react-icons instead.
// See docs/DESIGN_SYSTEM.md.
export function Icon({ size = 20, strokeWidth = 1.7, ...props }: IconProps) {
  return <HugeiconsIcon size={size} strokeWidth={strokeWidth} {...props} />;
}
