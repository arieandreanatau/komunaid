import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app";
import { createChildLogger } from "./lib/logger";
import { closeRedisConnection } from "./services/rate-limiter";
import { runAllJobs, JOB_CADENCE_MS } from "./services/scheduled-work";

const log = createChildLogger("server");

const port = parseInt(process.env.API_PORT || "3001", 10);

const server = serve({
  fetch: app.fetch,
  port,
});

log.info(`KomunaID API running on port ${port}`);

// Node standalone adapter for the scheduled-work module (see services/scheduled-work.ts):
// this process is long-lived, so it can just keep an interval timer. The Vercel
// topology has no equivalent process — see routes/cron.ts for that adapter.
const cleanupId = setInterval(() => {
  void runAllJobs();
}, JOB_CADENCE_MS);

function gracefulShutdown() {
  log.info("Shutting down gracefully...");
  clearInterval(cleanupId);
  closeRedisConnection().finally(() => {
    server.close(() => {
      log.info("Server closed");
      process.exit(0);
    });
    setTimeout(() => {
      log.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  });
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
