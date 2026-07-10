import base from "@mirae/config/eslint/base";
import react from "@mirae/config/eslint/react";

// Monorepo-wide flat config. Base applies everywhere; the React override
// (hooks + refresh) rides on top for .tsx (only apps/web has them).
export default [
  ...base,
  react,
  // Fast Refresh only matters for the app dev server, not the component
  // library — variant files there legitimately co-export cva helpers.
  {
    files: ["packages/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  // TanStack Router route files must export `Route` alongside the component.
  {
    files: ["apps/web/src/routes/**/*.{ts,tsx}"],
    rules: { "react-refresh/only-export-components": "off" },
  },
];
