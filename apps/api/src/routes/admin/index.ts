import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { requirePlatformAdmin } from "../../middleware/rbac";
import { adminMutationRateLimiter } from "../../middleware/admin-rate-limit";
import type { AuthUser } from "../../middleware/auth";

import { dashboardRoutes } from "./dashboard";
import { usersRoutes } from "./users";
import { rolesRoutes } from "./roles";
import { communitiesRoutes } from "./communities";
import { organizationsRoutes } from "./organizations";
import { eventsRoutes } from "./events";
import { volunteersRoutes } from "./volunteers";
import { reportsRoutes } from "./reports";
import { categoriesRoutes } from "./categories";
import { settingsRoutes } from "./settings";
import { auditRoutes } from "./audit";
import { notificationsRoutes } from "./notifications";
import { securityRoutes } from "./security";
import { cmsRoutes } from "./cms";

type Env = { Variables: { user: AuthUser; validated: any; userRoles: string[] } };

export const adminRoutes = new Hono<Env>();

adminRoutes.use("*", authMiddleware);
adminRoutes.use("*", requirePlatformAdmin());
adminRoutes.use("*", async (c, next) => {
  const method = c.req.method;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return next();
  }
  return adminMutationRateLimiter()(c, next);
});

adminRoutes.route("/", dashboardRoutes);
adminRoutes.route("/", usersRoutes);
adminRoutes.route("/", rolesRoutes);
adminRoutes.route("/", communitiesRoutes);
adminRoutes.route("/", organizationsRoutes);
adminRoutes.route("/", eventsRoutes);
adminRoutes.route("/", volunteersRoutes);
adminRoutes.route("/", reportsRoutes);
adminRoutes.route("/", categoriesRoutes);
adminRoutes.route("/", settingsRoutes);
adminRoutes.route("/", auditRoutes);
adminRoutes.route("/", notificationsRoutes);
adminRoutes.route("/", securityRoutes);
adminRoutes.route("/", cmsRoutes);
