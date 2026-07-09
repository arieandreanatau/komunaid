import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import dotenv from "dotenv";
import { createChildLogger } from "./lib/logger";
import { securityHeaders, rateLimiter, requestSizeLimit } from "./middleware/security";
import { csrfProtection } from "./middleware/csrf";

import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { communityRoutes } from "./routes/communities";
import { organizationRoutes } from "./routes/organizations";
import { eventRoutes } from "./routes/events";
import { reportRoutes } from "./routes/reports";
import { adminRoutes } from "./routes/admin";
import { categoryRoutes } from "./routes/categories";

dotenv.config();

const log = createChildLogger("server");

const app = new Hono();

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  log.info({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: `${duration}ms`,
  }, "request");
});

app.use("*", securityHeaders);
app.use("*", rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use("*", requestSizeLimit("10mb"));
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Set-Cookie"],
  })
);
app.use("/api/v1/*", csrfProtection());

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (c) => {
  return c.json({
    name: "KomunaID API",
    version: "0.1.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/ready", async (c) => {
  try {
    const { prisma } = await import("@komunaid/database");
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ status: "ready", database: "connected" });
  } catch {
    return c.json({ status: "not ready", database: "disconnected" }, 503);
  }
});

app.get("/live", (c) => {
  return c.json({ status: "alive" });
});

// ==========================================
// API ROUTES
// ==========================================

const api = new Hono();

api.route("/auth", authRoutes);
api.route("/users", userRoutes);
api.route("/communities", communityRoutes);
api.route("/organizations", organizationRoutes);
api.route("/events", eventRoutes);
api.route("/reports", reportRoutes);
api.route("/admin", adminRoutes);
api.route("/categories", categoryRoutes);

app.route("/api/v1", api);

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.onError((err, c) => {
  log.error({ err, method: c.req.method, path: c.req.path }, "unhandled error");

  if (err.message === "Unauthorized") {
    return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, 401);
  }

  if (err.message === "Forbidden") {
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, 403);
  }

  if (err.message === "Not Found") {
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
  }

  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message,
      },
    },
    500
  );
});

app.notFound((c) => {
  return c.json(
    { success: false, error: { code: "NOT_FOUND", message: "Not Found" } },
    404
  );
});

// ==========================================
// SERVER
// ==========================================

const port = parseInt(process.env.API_PORT || "3001", 10);

log.info(`KomunaID API running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
