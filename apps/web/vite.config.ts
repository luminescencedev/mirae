import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev: Vite serves the web app on :5173 and proxies /api/* to the local
// Wrangler instance (:8787), mirroring the single-Worker production setup
// where Hono handles /api/* and the static assets binding serves this build.
export default defineConfig({
  plugins: [
    // Must run before the React plugin — generates src/routeTree.gen.ts.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
