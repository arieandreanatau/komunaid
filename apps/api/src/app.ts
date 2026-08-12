import { Hono } from "hono";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { createChildLogger } from "./lib/logger";
import { securityHeaders, rateLimiter, requestSizeLimit } from "./middleware/security";
import { csrfProtection } from "./middleware/csrf";
import { ensureSecrets } from "./middleware/auth";
import { adminMutationRateLimiter } from "./middleware/admin-rate-limit";
import { dormantFeatureGuard } from "./middleware/dormant-features";
import { cleanupExpiredKeys } from "./services/rate-limiter";

import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { communityRoutes } from "./routes/communities";
import { organizationRoutes } from "./routes/organizations";
import { eventRoutes } from "./routes/events";
import { volunteerRoutes } from "./routes/volunteers";
import { volunteerProgramRoutes } from "./routes/volunteer-programs";
import { reportRoutes } from "./routes/reports";
import { adminRoutes } from "./routes/admin";
import { categoryRoutes } from "./routes/categories";
import { masterDataRoutes } from "./routes/master-data";
import { uploadRoutes } from "./routes/upload";
import { orgStructureRoutes } from "./routes/org-structure";
import { contactMessageRoutes } from "./routes/contact-messages";

const log = createChildLogger("server");

ensureSecrets();

const app = new Hono();

app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  try {
    log.info({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration: `${duration}ms`,
    }, "request");
  } catch {
    // logger failure should not crash the request
  }
});

app.use("*", securityHeaders);
app.use("*", compress());
app.use("*", rateLimiter);
app.use("*", requestSizeLimit("10mb"));
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim());
      if (!origin || allowed.includes(origin)) return origin;
      return undefined;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposeHeaders: ["Set-Cookie", "X-CSRF-Token"],
  })
);
app.use("/api/v1/*", (c, next) => {
  const path = c.req.path;
  const method = c.req.method;
  const csrfExemptPaths = [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
    "/api/v1/auth/refresh",
  ];
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && csrfExemptPaths.includes(path)) {
    return next();
  }
  return csrfProtection()(c, next);
});
app.use("/api/v1/*", dormantFeatureGuard());

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

import { openApiSpec } from "./docs/openapi";

const api = new Hono();

api.route("/auth", authRoutes);
api.route("/users", userRoutes);
api.route("/communities", communityRoutes);
api.route("/organizations", organizationRoutes);
api.route("/events", eventRoutes);
api.route("/volunteer", volunteerRoutes);
api.route("/volunteer-programs", volunteerProgramRoutes);
api.route("/reports", reportRoutes);
api.route("/admin", adminRoutes);
api.route("/categories", categoryRoutes);
api.route("/master-data", masterDataRoutes);
api.route("/upload", uploadRoutes);
api.route("/organization-structure", orgStructureRoutes);
api.route("/contact-messages", contactMessageRoutes);

// OpenAPI JSON spec
app.get("/api/v1/docs/openapi.json", (c) => {
  return c.json(openApiSpec);
});

// Swagger UI (CDN-based)
app.get("/api/v1/docs", (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KomunaID API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    SwaggerUIBundle({
      url: '/api/v1/docs/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'StandaloneLayout',
    });
  </script>
</body>
</html>`);
});

app.route("/api/v1", api);

app.onError((err, c) => {
  const isExpected = err.message === "Unauthorized" || err.message === "Forbidden" || err.message === "Not Found";

  try {
    if (isExpected) {
      log.info({ method: c.req.method, path: c.req.path, status: err.message }, "auth error");
    } else {
      log.error({ err, method: c.req.method, path: c.req.path }, "unhandled error");
    }
  } catch {
    // logger failure should not crash the error handler
  }

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
        message: "Internal Server Error",
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
