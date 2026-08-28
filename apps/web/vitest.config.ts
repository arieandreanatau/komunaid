import { defineConfig } from "vitest/config";
import path from "path";

process.env.JWT_SECRET = "test-secret";

export default defineConfig({
  // The app's own tsconfig.json sets "jsx": "preserve" (Next/SWC does the real
  // transform at build time). Vitest's esbuild transform needs an explicit
  // target, and since components here never import React (Next's automatic
  // runtime), the transform must be "automatic" too — otherwise every .tsx
  // component test fails with "React is not defined".
  esbuild: {
    jsx: "automatic",
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@komunaid/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
