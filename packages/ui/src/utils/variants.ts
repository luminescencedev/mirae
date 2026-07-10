// Variant helpers. Components define their variants with `cva` and derive
// prop types with `VariantProps`, imported from here so there is a single
// source across the design system (never import class-variance-authority
// directly in components). Pair with `cn` for Tailwind conflict resolution.
export { cva, cx, type VariantProps } from "class-variance-authority";
