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
    create: vi.fn(async ({ data }: any) => ({ id: "created-id", createdAt: new Date(), updatedAt: new Date(), isActive: true, ...data })),
    update: vi.fn(async ({ where, data }: any) => ({ id: where?.id || "id", ...data, updatedAt: new Date() })),
    updateMany: vi.fn(async () => ({ count: 0 })),
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

import { prisma } from "@komunaid/database";
import { categoryRoutes } from "../../../src/routes/categories";

const JWT_SECRET = new TextEncoder().encode("test-unit-secret-key-for-jwt");

async function generateToken(payload: Record<string, any>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

function mockAdminAuth(opts?: { role?: string; findUniqueResult?: any }) {
  const role = opts?.role ?? "PLATFORM_ADMIN";
  const findUniqueResult = opts?.findUniqueResult;
  (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
    if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0 };
    return findUniqueResult !== undefined ? findUniqueResult : null;
  });
  (prisma.userRole.findMany as any).mockImplementation(async (args: any) => {
    if (args?.where?.userId !== undefined) return [{ role }];
    return [];
  });
}

describe("Category Routes", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.onError((err, c) => {
      if (err.message === "Unauthorized") return c.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, 401);
      if (err.message === "Forbidden") return c.json({ success: false, error: { code: "FORBIDDEN", message: "Forbidden" } }, 403);
      return c.json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" } }, 500);
    });
    app.route("/categories", categoryRoutes);
  });

  describe("GET /", () => {
    it("should return active categories (public)", async () => {
      (prisma.category.findMany as any).mockResolvedValue([
        { id: "c1", name: "Technology", slug: "technology", isActive: true },
        { id: "c2", name: "Health", slug: "health", isActive: true },
      ]);

      const res = await app.request("/categories");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
    });

    it("should not require authentication", async () => {
      (prisma.category.findMany as any).mockResolvedValue([]);
      const res = await app.request("/categories");
      expect(res.status).toBe(200);
    });

    it("should only query active categories", async () => {
      (prisma.category.findMany as any).mockResolvedValue([]);
      await app.request("/categories");
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: "asc" },
      });
    });

    it("should return empty array when no categories exist", async () => {
      (prisma.category.findMany as any).mockResolvedValue([]);
      const res = await app.request("/categories");
      const body = await res.json();
      expect(body.data).toEqual([]);
    });
  });

  describe("POST /", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Category" }),
      });
      expect(res.status).toBe(401);
    });

    it("should create a category as admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: null });

      const res = await app.request("/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Technology", description: "Tech stuff", icon: "laptop", type: "COMMUNITY" }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("Technology");
    });

    it("should generate slug from name", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: null });

      await app.request("/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My Category!" }),
      });
      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ slug: "my-category" }) })
      );
    });

    it("should return 409 for duplicate slug", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: { id: "existing", slug: "technology" } });

      const res = await app.request("/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Technology" }),
      });
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.message).toBe("Kategori sudah ada");
    });

    it("should default type to COMMUNITY when not specified", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: null });

      await app.request("/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });
      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ type: "COMMUNITY" }) })
      );
    });

    it("should create audit log", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: null });

      await app.request("/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test" }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("should return 400 for invalid data", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth();

      const res = await app.request("/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "X" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /:categoryId", () => {
    it("should update a category", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: { id: "cat-1", name: "Old", type: "COMMUNITY" } });
      (prisma.category.update as any).mockResolvedValue({ id: "cat-1", name: "Updated", type: "COMMUNITY", isActive: true });

      const res = await app.request("/categories/cat-1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("should return 404 when category not found", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: null });

      const res = await app.request("/categories/nonexistent", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toBe("Category not found");
    });

    it("should create audit log on update", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: { id: "cat-1", name: "Old", type: "COMMUNITY" } });

      await app.request("/categories/cat-1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New" }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("DELETE /:categoryId", () => {
    it("should soft delete a category", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: { id: "cat-1", name: "Test", isActive: true } });

      const res = await app.request("/categories/cat-1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Kategori berhasil dinonaktifkan");
      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: "cat-1" },
        data: { isActive: false },
      });
    });

    it("should return 404 when category not found", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: null });

      const res = await app.request("/categories/nonexistent", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
    });

    it("should create audit log on delete", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAdminAuth({ findUniqueResult: { id: "cat-1", name: "Test", isActive: true } });

      await app.request("/categories/cat-1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/categories/cat-1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });
});
