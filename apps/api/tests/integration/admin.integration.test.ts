import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", () => {
  const prisma = {
    user: { findUnique: vi.fn(), findMany: vi.fn(async () => []), count: vi.fn(async () => 0), update: vi.fn() },
    userRole: { findMany: vi.fn(async () => []), findUnique: vi.fn(async () => null), create: vi.fn(), delete: vi.fn(), count: vi.fn(async () => 0) },
    community: { findMany: vi.fn(async () => []), count: vi.fn(async () => 0), findUnique: vi.fn(async () => null) },
    organization: { findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    event: { findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    auditLog: { findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    report: { findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    activityHistory: { findMany: vi.fn(async () => []) },
    notification: { create: vi.fn(async () => ({})), findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    notificationTemplate: { findMany: vi.fn(async () => []) },
    category: { findUnique: vi.fn(async () => null), findMany: vi.fn(async () => []), create: vi.fn(async ({ data }: any) => ({ id: "cat-1", ...data })), update: vi.fn(), delete: vi.fn() },
    $queryRaw: vi.fn(async () => [{ count: 0 }]),
    $transaction: vi.fn(async (fn: any) => { if (typeof fn === "function") return fn(prisma); return Promise.all(fn); }),
  };
  return { prisma };
});

vi.mock("pino", () => ({
  default: vi.fn(() => ({
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis(),
  })),
}));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: vi.fn(async () => ({ id: "email-id" })) } })),
}));
vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn(() => ({ sendMail: vi.fn(async () => ({})) })) },
}));

import { prisma } from "@komunaid/database";
import { adminRoutes } from "../../src/routes/admin/index";

async function generateToken(payload: any): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

describe("Admin Integration Tests", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.onError((err, c) => {
      if (err.message === "Unauthorized") {
        return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, 401);
      }
      if (err.message === "Forbidden") {
        return c.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, 403);
      }
      return c.json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" } }, 500);
    });
    app.route("/api/v1/admin", adminRoutes);
  });

  describe("Authentication", () => {
    it("should return 401 without auth token", async () => {
      const res = await app.request("/api/v1/admin/dashboard");
      expect(res.status).toBe(401);
    });

    it("should return 403 for non-admin user", async () => {
      const token = await generateToken({ sub: "user-1", email: "user@test.com", name: "User", username: "user", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      const res = await app.request("/api/v1/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(403);
    });
  });

  describe("Dashboard", () => {
    it("should return dashboard data for admin with correct stats", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      (prisma.user.count as any).mockResolvedValue(100);
      (prisma.community.count as any).mockResolvedValue(25);
      (prisma.organization.count as any).mockResolvedValue(10);
      (prisma.event.count as any).mockResolvedValue(50);
      (prisma.report.count as any).mockResolvedValue(3);
      (prisma.$queryRaw as any).mockResolvedValue([{ count: 5 }]);

      const res = await app.request("/api/v1/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.stats.totalUsers).toBe(100);
      expect(body.data.stats.totalCommunities).toBe(25);
      expect(body.data.stats.totalOrganizations).toBe(10);
      expect(body.data.stats.totalEvents).toBe(50);
      expect(body.data.stats.pendingReports).toBe(3);
      expect(Array.isArray(body.data.recentActivity)).toBe(true);
      expect(Array.isArray(body.data.recentAudit)).toBe(true);
      expect(Array.isArray(body.data.recentReports)).toBe(true);
    });
  });

  describe("User Management", () => {
    it("should list users for admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      (prisma.user.findMany as any).mockResolvedValue([
        {
          id: "u1", name: "A", username: "a", email: "a@x.com", avatar: null, status: "ACTIVE",
          createdAt: new Date(), roles: [{ role: "MEMBER" }],
          _count: { joinedCommunities: 2, registeredEvents: 3, createdCommunities: 1, createdOrganizations: 0 },
        },
      ]);
      (prisma.user.count as any).mockResolvedValue(1);

      const res = await app.request("/api/v1/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].email).toBe("a@x.com");
      expect(body.data[0].communityCount).toBe(2);
      expect(body.data[0].roles).toEqual(["MEMBER"]);
      expect(body.pagination.total).toBe(1);
    });
  });

  describe("Roles", () => {
    it("should list roles for admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);

      const res = await app.request("/api/v1/admin/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("Communities Management", () => {
    it("should list communities for admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      (prisma.community.findMany as any).mockResolvedValue([]);
      (prisma.community.count as any).mockResolvedValue(0);

      const res = await app.request("/api/v1/admin/communities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("Organizations Management", () => {
    it("should list organizations for admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      (prisma.organization.findMany as any).mockResolvedValue([]);
      (prisma.organization.count as any).mockResolvedValue(0);

      const res = await app.request("/api/v1/admin/organizations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("Events Management", () => {
    it("should list events for admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      (prisma.event.findMany as any).mockResolvedValue([]);
      (prisma.event.count as any).mockResolvedValue(0);

      const res = await app.request("/api/v1/admin/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("Audit Logs", () => {
    it("should list audit logs for admin", async () => {
      const token = await generateToken({ sub: "admin-audit", email: "admin-audit@test.com", name: "Admin", username: "admin-audit", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
      (prisma.auditLog.findMany as any).mockResolvedValue([]);
      (prisma.auditLog.count as any).mockResolvedValue(0);

      const res = await app.request("/api/v1/admin/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("Notifications", () => {
    it("should list notifications for admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      (prisma.notification.findMany as any).mockResolvedValue([]);

      const res = await app.request("/api/v1/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("Categories", () => {
    it("should list categories for admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      (prisma.category.findMany as any).mockResolvedValue([]);

      const res = await app.request("/api/v1/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });
});
