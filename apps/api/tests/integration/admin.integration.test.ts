import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", async () => {
  const { prisma } = await import("../support/mock");
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

import { prisma, db } from "../support/mock";
import { aCommunity, aUser } from "../support/builders";
import { adminRoutes } from "../../src/routes/admin/index";
import { LifecycleTransitionError } from "../../src/services/lifecycle-transition";

async function generateToken(payload: any): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

describe("Admin Integration Tests", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    db.reset();
    app = new Hono();
    app.onError((err, c) => {
      if (err.message === "Unauthorized") {
        return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, 401);
      }
      if (err.message === "Forbidden") {
        return c.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, 403);
      }
      if (err instanceof LifecycleTransitionError) {
        return c.json({ success: false, error: { code: err.code, message: "Status telah berubah, silakan muat ulang" } }, 409);
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

    it("should return 403 when a member tries to open admin community detail", async () => {
      const token = await generateToken({ sub: "member-1", email: "member@test.com", name: "Member", username: "member", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      const res = await app.request("/api/v1/admin/communities/comm-1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(403);
    });

    it("should return community detail for a platform admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1", name: "Komunitas Buku", slug: "komunitas-buku",
        status: "PENDING", visibility: "PUBLIC", deletedAt: null,
        owner: { id: "u1", name: "Owner", email: "o@x.com", avatar: null, phone: null },
        categories: [], tags: [], settings: null, members: [],
        _count: { members: 1, events: 0, joinRequests: 0 },
      });

      const res = await app.request("/api/v1/admin/communities/comm-1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.data.slug).toBe("komunitas-buku");
    });

    it("should approve a pending community and activate its owner membership", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      const owner = aUser(db, { id: "u1" });
      aCommunity(db, { id: "comm-1", name: "Komunitas Buku", slug: "komunitas-buku", ownerId: owner.id, status: "PENDING" })
        .withMember({ id: owner.id as string }, { id: "m-1", role: "OWNER", status: "PENDING" });

      const res = await app.request("/api/v1/admin/communities/comm-1/approve", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json() as any;
      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(db.tables.community.all().find((r: any) => r.id === "comm-1")?.status).toBe("APPROVED");
      expect(db.tables.communityMember.all().find((r: any) => r.id === "m-1")?.status).toBe("ACTIVE");
    });

    // COMMUNITY_TRANSITIONS (services/lifecycle-transition.ts) only allows
    // PENDING -> APPROVED; a community sent back for revision must go through
    // PENDING again (owner resubmission) before it can be approved. Consuming
    // the shared transition table narrows the old bespoke handler, which also
    // accepted REVISION_REQUIRED directly — see the task report.
    it("should reject approving a REVISION_REQUIRED community with 400 instead of skipping resubmission", async () => {
      const token = await generateToken({ sub: "admin-1", email: "admin@test.com", name: "Admin", username: "admin", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      const owner = aUser(db, { id: "u2" });
      aCommunity(db, { id: "comm-2", ownerId: owner.id, status: "REVISION_REQUIRED" });

      const res = await app.request("/api/v1/admin/communities/comm-2/approve", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(400);
      expect(db.tables.community.all().find((r: any) => r.id === "comm-2")?.status).toBe("REVISION_REQUIRED");
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
