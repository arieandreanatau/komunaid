import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./app";
import { createChildLogger } from "./lib/logger";

const log = createChildLogger("server");

const port = parseInt(process.env.API_PORT || "3001", 10);

log.info(`KomunaID API running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
