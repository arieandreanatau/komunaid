import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test-unit-secret-key-for-jwt";
});

vi.mock("@komunaid/database", () => {
  const handlers: Record<string, any> = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(async ({ data }: any) => ({
      id: "struct-created", createdAt: new Date(), updatedAt: new Date(), isActive: true, ...data,
    })),
    update: vi.fn(async ({ where, data }: any) => ({
      id: where?.id || "id", ...data, updatedAt: new Date(),
    })),
    delete: vi.fn(),
    count: vi.fn(async () => 0),
  };
  const prisma: any = new Proxy({}, {
    get(_: any, table: string) { return handlers; },
  });
  return { prisma };
});

vi.mock("pino", () => ({
  default: vi.fn(() => ({
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis(),
  })),
}));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn(async () => ({ id: "test-email-id" })) },
  })),
}));
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(async () => ({ messageId: "test-message-id" })),
    })),
  },
}));

vi.mock("ioredis", () => ({ default: vi.fn().mockImplementation(() => ({})) }));

vi.mock("../../../src/services/rate-limiter", () => ({
  adminMutationRateLimiter: vi.fn(async () => ({ allowed: true, remaining: 29, resetAt: Date.now() + 60000 })),
}));

vi.mock("../../../src/middleware/rbac", () => ({
  requirePlatformAdmin: () => async (c: any, next: any) => { await next(); },
  requireSuperAdmin: () => async (c: any, next: any) => { await next(); },
}));

import { prisma } from "@komunaid/database";
import { orgStructureRoutes } from "../../../src/routes/org-structure";

const JWT_SECRET = new TextEncoder().encode("test-unit-secret-key-for-jwt");

async function generateToken(payload: Record<string, any>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

function mockAuth(findUniqueResult?: any) {
  (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
    if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0 };
    return findUniqueResult !== undefined ? findUniqueResult : null;
  });
}

describe("Org Structure Routes", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.onError((err, c) => {
      if (err.message === "Unauthorized") return c.json({ success: false }, 401);
      if (err.message === "Forbidden") return c.json({ success: false }, 403);
      return c.json({ success: false }, 500);
    });
    app.route("/org-structure", orgStructureRoutes);
  });

  describe("GET /", () => {
    it("should return full structure tree", async () => {
      (prisma.organizationStructure.findMany as any).mockResolvedValue([
        { id: "s1", title: "Board", parentId: null, position: 0, isActive: true, children: [], organizationStructureMembers: [] },
      ]);

      const res = await app.request("/org-structure");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
    });

    it("should not require authentication", async () => {
      (prisma.organizationStructure.findMany as any).mockResolvedValue([]);
      const res = await app.request("/org-structure");
      expect(res.status).toBe(200);
    });

    it("should filter top-level structures (no parentId)", async () => {
      (prisma.organizationStructure.findMany as any).mockResolvedValue([
        { id: "s1", title: "Root", parentId: null, children: [], organizationStructureMembers: [] },
        { id: "s2", title: "Child", parentId: "s1", children: [], organizationStructureMembers: [] },
      ]);

      const res = await app.request("/org-structure");
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toBe("Root");
    });
  });

  describe("GET /flat", () => {
    it("should return flat list of structures", async () => {
      (prisma.organizationStructure.findMany as any).mockResolvedValue([
        { id: "s1", title: "Board", parent: null, organizationStructureMembers: [] },
        { id: "s2", title: "Director", parent: { id: "s1", title: "Board" }, organizationStructureMembers: [] },
      ]);

      const res = await app.request("/org-structure/flat");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
    });

    it("should not require authentication", async () => {
      (prisma.organizationStructure.findMany as any).mockResolvedValue([]);
      const res = await app.request("/org-structure/flat");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /admin/all", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/org-structure/admin/all");
      expect(res.status).toBe(401);
    });

    it("should return all structures for super admin", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth();
      (prisma.organizationStructure.findMany as any).mockResolvedValue([
        { id: "s1", title: "Board", members: [], _count: { children: 0, organizationStructureMembers: 0 } },
      ]);

      const res = await app.request("/org-structure/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
    });

    it("should return 401 for non-admin user (no token)", async () => {
      const res = await app.request("/org-structure/admin/all");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /admin", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/org-structure/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Board" }),
      });
      expect(res.status).toBe(401);
    });

    it("should create a structure as super admin", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth();

      const res = await app.request("/org-structure/admin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Board of Directors", description: "Main board", position: 0 }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Struktur organisasi berhasil dibuat");
    });

    it("should return 400 when title is missing", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth();

      const res = await app.request("/org-structure/admin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: "No title" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Title wajib diisi");
    });

    it("should create audit log on create", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth();

      await app.request("/org-structure/admin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Board" }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("PUT /admin/:id", () => {
    it("should update a structure", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "s1", title: "Old Board" });
      (prisma.organizationStructure.update as any).mockResolvedValue({ id: "s1", title: "New Board" });

      const res = await app.request("/org-structure/admin/s1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Board" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Struktur organisasi berhasil diupdate");
    });

    it("should return 404 when structure not found", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth(null);

      const res = await app.request("/org-structure/admin/nonexistent", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New" }),
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toBe("Struktur tidak ditemukan");
    });

    it("should return 400 when parentId equals id", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "s1", title: "Board" });

      const res = await app.request("/org-structure/admin/s1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: "s1" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Parent tidak boleh diri sendiri");
    });

    it("should create audit log on update", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "s1", title: "Old" });

      await app.request("/org-structure/admin/s1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New" }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("DELETE /admin/:id", () => {
    it("should delete a structure", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "s1", title: "Board" });

      const res = await app.request("/org-structure/admin/s1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Struktur organisasi berhasil dihapus");
      expect(prisma.organizationStructure.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
    });

    it("should return 404 when structure not found", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth(null);

      const res = await app.request("/org-structure/admin/nonexistent", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
    });

    it("should create audit log on delete", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "s1", title: "Board" });

      await app.request("/org-structure/admin/s1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/org-structure/admin/s1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /admin/:structureId/members", () => {
    it("should add a member to structure", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "s1", title: "Board" });

      const res = await app.request("/org-structure/admin/s1/members", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John Doe", position: "Director", email: "j@e.com", order: 1 }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Anggota struktur berhasil ditambahkan");
    });

    it("should return 400 when name or position is missing", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth();

      const res = await app.request("/org-structure/admin/s1/members", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Name dan position wajib diisi");
    });

    it("should return 404 when structure not found", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth(null);

      const res = await app.request("/org-structure/admin/s999/members", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", position: "Director" }),
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toBe("Struktur tidak ditemukan");
    });

    it("should create audit log on member creation", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "s1" });

      await app.request("/org-structure/admin/s1/members", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", position: "Director" }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("PUT /admin/members/:memberId", () => {
    it("should update a member", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "m1", name: "John" });
      (prisma.organizationStructureMember.update as any).mockResolvedValue({ id: "m1", name: "John Updated" });

      const res = await app.request("/org-structure/admin/members/m1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John Updated" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Anggota struktur berhasil diupdate");
    });

    it("should return 404 when member not found", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth(null);

      const res = await app.request("/org-structure/admin/members/nonexistent", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toBe("Anggota tidak ditemukan");
    });

    it("should create audit log on member update", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "m1", name: "Old Name" });

      await app.request("/org-structure/admin/members/m1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("DELETE /admin/members/:memberId", () => {
    it("should delete a member", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "m1", name: "John" });

      const res = await app.request("/org-structure/admin/members/m1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Anggota struktur berhasil dihapus");
      expect(prisma.organizationStructureMember.delete).toHaveBeenCalledWith({ where: { id: "m1" } });
    });

    it("should return 404 when member not found", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth(null);

      const res = await app.request("/org-structure/admin/members/nonexistent", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
    });

    it("should create audit log on member deletion", async () => {
      const token = await generateToken({ sub: "sa-1", email: "sa@b.com", name: "SA", username: "sa", type: "access" });
      mockAuth({ id: "m1", name: "John" });

      await app.request("/org-structure/admin/members/m1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/org-structure/admin/members/m1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });
});
