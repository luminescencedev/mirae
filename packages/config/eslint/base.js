import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

// Shared Mirae ESLint base (flat config). Non-type-aware for speed; add
// type-aware configs per package later if needed.
export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/.turbo/**",
      "**/.wrangler/**",
      "**/node_modules/**",
      "**/*.gen.ts",
      "**/worker-configuration.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.es2022 },
    },
  },
  // Config/tooling files run in Node.
  {
    files: ["**/*.config.{js,ts}", "**/drizzle.config.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
