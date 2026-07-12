import { defineConfig } from "vitest/config";
import path from "path";

process.env.JWT_SECRET = "test-secret";

export default defineConfig({
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
