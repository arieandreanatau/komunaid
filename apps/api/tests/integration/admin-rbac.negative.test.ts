import { describe, expect, it, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";
import { Hono } from "hono";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";
process.env.CSRF_SECRET = "test-csrf-secret";

vi.mock("@komunaid/database", () => {
  const prisma: any = {
    user: { findUnique: vi.fn() },
    userRole: { findMany: vi.fn() },
    auditLog: { findMany: vi.fn(), count: vi.fn() },
    setting: { findMany: vi.fn() },
    report: { count: vi.fn() },
  };
  return { prisma };
});

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));

import { prisma } from "@komunaid/database";
import { invalidateRoleCache } from "../../src/middleware/rbac";
import app from "../../src/app";

const CSRF_TOKEN = "b".repeat(64);

async function token(id: string, roles: string[]) {
  return new SignJWT({ sub: id, email: `${id}@test.local`, name: id, username: id, roles, type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

function headers(accessToken: string, mutation = false): Record<string, string> {
  if (mutation) {
    return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "Content-Length": "1024", Cookie: `csrf_token=${CSRF_TOKEN}`, "X-CSRF-Token": CSRF_TOKEN };
  }
  return { Authorization: `Bearer ${accessToken}` };
}

describe("Slice 4: admin RBAC negative cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ["member-1", "admin-1", "super-1"].forEach(invalidateRoleCache);
    (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
    (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
  });

  async function testAdminPath(accessToken: string, path: string, method = "GET"): Promise<number> {
    const response = await app.request(`/api/v1/admin${path}`, { method, headers: headers(accessToken, method !== "GET") });
    return response.status;
  }

  it("blocks MEMBER from every admin read endpoint", async () => {
    const tokenMember = await token("member-1", ["MEMBER"]);
    const paths = ["/users?limit=5", "/communities?limit=5", "/events?limit=5", "/volunteers?limit=5", "/settings", "/roles", "/audit-logs?limit=5"];
    for (const path of paths) {
      const status = await testAdminPath(tokenMember, path);
      expect(status).toBe(403);
    }
  });

  it("blocks PLATFORM_ADMIN from superadmin-only endpoints", async () => {
    const tokenAdmin = await token("admin-1", ["PLATFORM_ADMIN"]);
    (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
    const paths = ["/audit-logs?limit=5", "/dashboard/growth"];
    for (const path of paths) {
      const status = await testAdminPath(tokenAdmin, path);
      expect(status).toBe(403);
    }
  });

  it("allows PLATFORM_ADMIN on platform-level admin endpoints", async () => {
    const tokenAdmin = await token("admin-1", ["PLATFORM_ADMIN"]);
    (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
    (prisma.setting.findMany as any).mockResolvedValue([]);
    const status = await testAdminPath(tokenAdmin, "/settings");
    expect(status).toBe(200);
  });

  it("allows SUPER_ADMIN read endpoints", async () => {
    const tokenSuper = await token("super-1", ["SUPER_ADMIN"]);
    (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
    (prisma.auditLog.findMany as any).mockResolvedValue([]);
    (prisma.auditLog.count as any).mockResolvedValue(0);
    (prisma.setting.findMany as any).mockResolvedValue([]);
    const status = await testAdminPath(tokenSuper, "/audit-logs?limit=5");
    expect(status).toBe(200);
  });

  it("rules out spoofed role in JWT alone: roles array does not grant access without DB role", async () => {
    const tokenSpoofed = await token("member-1", ["SUPER_ADMIN"]);
    (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
    const status = await testAdminPath(tokenSpoofed, "/audit-logs?limit=5");
    expect(status).toBe(403);
  });
});