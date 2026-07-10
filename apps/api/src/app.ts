import { Hono } from "hono";
import { cors } from "hono/cors";
import { createChildLogger } from "./lib/logger";
import { securityHeaders, rateLimiter, requestSizeLimit } from "./middleware/security";
import { csrfProtection } from "./middleware/csrf";

import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { communityRoutes } from "./routes/communities";
import { organizationRoutes } from "./routes/organizations";
import { eventRoutes } from "./routes/events";
import { volunteerRoutes } from "./routes/volunteers";
import { reportRoutes } from "./routes/reports";
import { adminRoutes } from "./routes/admin";
import { categoryRoutes } from "./routes/categories";

const log = createChildLogger("server");

const app = new Hono();

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
    origin: (origin) => {
      const allowed = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim());
      if (!origin || allowed.includes(origin)) return origin;
      return allowed[0];
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposeHeaders: ["Set-Cookie", "X-CSRF-Token"],
  })
);
app.use("/api/v1/*", csrfProtection());

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
  } catch (err: any) {
    return c.json({ status: "not ready", database: "disconnected", error: err?.message || String(err) }, 503);
  }
});

app.get("/live", (c) => {
  return c.json({ status: "alive" });
});

const api = new Hono();

api.route("/auth", authRoutes);
api.route("/users", userRoutes);
api.route("/communities", communityRoutes);
api.route("/organizations", organizationRoutes);
api.route("/events", eventRoutes);
api.route("/volunteer", volunteerRoutes);
api.route("/reports", reportRoutes);
api.route("/admin", adminRoutes);
api.route("/categories", categoryRoutes);

app.route("/api/v1", api);

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

export default app;
