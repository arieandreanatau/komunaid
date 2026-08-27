import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const testJwtSecret = "test-playwright-jwt-secret-32-characters-minimum";
process.env.JWT_SECRET = testJwtSecret;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  expect: { timeout: 15_000 },
  timeout: 60_000,
  // Next dev on Windows shares one RSC manifest across browser projects.
  // Parallel workers can corrupt that manifest and produce false E2E failures.
  workers: 1,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "set NODE_ENV=test&& set JWT_SECRET=test-playwright-jwt-secret-32-characters-minimum&& pnpm build&& pnpm start",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
       ...process.env,
       JWT_SECRET: testJwtSecret,
       NODE_ENV: "test",
     },
  },
});
