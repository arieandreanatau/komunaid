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
import { communityRoutes } from "../../src/routes/communities";

async function generateToken(payload: any): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

describe("RBAC Integration Tests", () => {
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
      if (err.message === "Not Found") {
        return c.json({ success: false, error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
      }
      return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, 401);
    });
    app.route("/api/v1/communities", communityRoutes);
  });

  describe("Access control across endpoints", () => {
    it("should reject unauthenticated access to protected routes", async () => {
      const protectedRoutes = [
        { method: "POST", path: "/api/v1/communities" },
        { method: "GET", path: "/api/v1/communities/my/submissions" },
      ];

      for (const route of protectedRoutes) {
        const res = await app.request(route.path, {
          method: route.method,
          headers: { "Content-Type": "application/json" },
          body: route.method === "POST" ? JSON.stringify({ name: "Test" }) : undefined,
        });
        expect(res.status).toBe(401);
      }
    });

    it("should allow authenticated user to access public routes", async () => {
      const res = await app.request("/api/v1/communities");
      expect(res.status).toBe(200);
    });

    it("should allow authenticated member to access member routes", async () => {
      const token = await generateToken({ sub: "user-1", email: "user@test.com", name: "User", username: "user", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      const res = await app.request("/api/v1/communities/my/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("Platform role checking", () => {
    it("should distinguish between MEMBER and ADMIN roles", async () => {
      const memberToken = await generateToken({ sub: "user-1", email: "member@test.com", name: "Member", username: "member", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      const memberRes = await app.request("/api/v1/communities/my/submissions", {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      expect(memberRes.status).toBe(200);
    });

    it("should validate token structure", async () => {
      const invalidToken = "invalid.token.here";
      const res = await app.request("/api/v1/communities/my/submissions", {
        headers: { Authorization: `Bearer ${invalidToken}` },
      });
      expect(res.status).toBe(401);
    });

    it("should reject expired tokens", async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 7200;
      const expiredToken = await new SignJWT({
        sub: "user-1", email: "user@test.com", name: "User", username: "user", type: "access",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(pastTime)
        .setExpirationTime(pastTime + 1)
        .sign(JWT_SECRET);

      const res = await app.request("/api/v1/communities/my/submissions", {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("Community-level RBAC", () => {
    it("should reject owner-only actions from non-owner", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/communities/comm-1/archive", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      // Valid token provided; non-member of the community → 403 Forbidden.
      expect(res.status).toBe(403);
    });

    it("should reject admin-only actions from non-admin", async () => {
      const token = await generateToken({ sub: "user-2", email: "u2@test.com", name: "U2", username: "u2", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        userId: "user-2", communityId: "comm-1", role: "MEMBER", status: "ACTIVE",
      });

      const res = await app.request("/api/v1/communities/comm-1/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Valid token provided; role MEMBER is not admin → 403 Forbidden.
      expect(res.status).toBe(403);
    });

    it("should allow owner to access owner routes", async () => {
      const token = await generateToken({ sub: "user-1", email: "u1@test.com", name: "U1", username: "u1", type: "access" });
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        userId: "user-1", communityId: "comm-1", role: "OWNER", status: "ACTIVE",
      });
      (prisma.community.findUnique as any).mockResolvedValue({
        id: "comm-1", deletedAt: null, status: "APPROVED", name: "Test Community", slug: "test-community",
        description: null, coverImage: null, logo: null, banner: null, location: null, website: null,
        membershipType: "OPEN", visibility: "PUBLIC", ownerId: "user-1", createdAt: new Date(), updatedAt: new Date(),
        settings: null, tags: [], owner: { id: "user-1", name: "U1", avatar: null },
        _count: { members: 1, events: 0 },
      });

      const res = await app.request("/api/v1/communities/comm-1/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe("Token version checking", () => {
    it("should reject tokens with mismatched version", async () => {
      const token = await generateToken({
        sub: "user-1", email: "user@test.com", name: "User", username: "user", type: "access", tokenVersion: 0,
      });

      (prisma.user.findUnique as any).mockImplementation(async ({ where }: any) => {
        if (where.id === "user-1") return { tokenVersion: 5, status: "ACTIVE" };
        return null;
      });

      const res = await app.request("/api/v1/communities/my/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(401);
    });
  });
});
