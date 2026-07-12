import { defineConfig } from "vitest/config";
import path from "path";

process.env.JWT_SECRET = "test-integration-secret";
process.env.NODE_ENV = "test";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts"],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
  resolve: {
    alias: {
      "@komunaid/database": path.resolve(__dirname, "../../packages/database/src"),
      "@komunaid/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@komunaid/utils": path.resolve(__dirname, "../../packages/utils/src"),
    },
  },
});
