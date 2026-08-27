import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app";
import { createChildLogger } from "./lib/logger";
import { cleanupExpiredKeys, closeRedisConnection } from "./services/rate-limiter";
import { cleanupExpiredTokens } from "./services/refresh-token";
import { rolloverStaleEvents } from "./services/event-rollover";

const log = createChildLogger("server");

const port = parseInt(process.env.API_PORT || "3001", 10);

const server = serve({
  fetch: app.fetch,
  port,
});

log.info(`KomunaID API running on port ${port}`);

const CLEANUP_INTERVAL = 60 * 60 * 1000;
const cleanupId = setInterval(async () => {
  try {
    await cleanupExpiredKeys();
    await cleanupExpiredTokens();
  } catch (err) {
    log.error({ err }, "cleanup job failed");
  }
  try {
    const result = await rolloverStaleEvents();
    if (result.ongoing > 0 || result.completed > 0) {
      log.info(result, "event rollover applied");
    }
  } catch (err) {
    log.error({ err }, "event rollover job failed");
  }
}, CLEANUP_INTERVAL);

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
