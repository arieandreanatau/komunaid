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
      id: "msg-created", createdAt: new Date(), updatedAt: new Date(), status: "PENDING", ...data,
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
  contactFormRateLimiter: vi.fn(async () => ({ allowed: true, success: true, remaining: 10, resetAt: Date.now() + 60000 })),
  adminMutationRateLimiter: vi.fn(async () => ({ allowed: true, remaining: 29, resetAt: Date.now() + 60000 })),
}));

vi.mock("../../../src/middleware/rbac", () => ({
  requirePlatformAdmin: () => async (c: any, next: any) => { await next(); },
  requireSuperAdmin: () => async (c: any, next: any) => { await next(); },
}));

import { prisma } from "@komunaid/database";
import { contactMessageRoutes } from "../../../src/routes/contact-messages";

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
    if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
    return findUniqueResult !== undefined ? findUniqueResult : null;
  });
}

describe("Contact Message Routes", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.onError((err, c) => {
      if (err.message === "Unauthorized") return c.json({ success: false }, 401);
      if (err.message === "Forbidden") return c.json({ success: false }, 403);
      return c.json({ success: false }, 500);
    });
    app.route("/contact-messages", contactMessageRoutes);
  });

  describe("POST /", () => {
    it("should create a contact message", async () => {
      const res = await app.request("/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe", email: "john@example.com",
          subject: "Test Subject", message: "Hello", category: "GENERAL",
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
    });

    it("should return 400 for missing required fields", async () => {
      const res = await app.request("/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Nama, email, subjek, dan pesan wajib diisi");
    });

    it("should return 400 for invalid email", async () => {
      const res = await app.request("/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "not-an-email", subject: "Test", message: "Hello" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toBe("Format email tidak valid");
    });

    it("should default category to GENERAL when invalid", async () => {
      const res = await app.request("/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "john@example.com", subject: "Test", message: "Hello", category: "INVALID" }),
      });
      expect(res.status).toBe(201);
      expect(prisma.contactMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ category: "GENERAL" }) })
      );
    });

    it("should lowercase and trim email", async () => {
      mockAuth();
      const res = await app.request("/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "JOHN@EXAMPLE.COM", subject: "Test", message: "Hello" }),
      });
      expect(res.status).toBe(201);
      expect(prisma.contactMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ email: "john@example.com" }) })
      );
    });

    it("should not require authentication", async () => {
      const res = await app.request("/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Guest", email: "g@e.com", subject: "Test", message: "Hello" }),
      });
      expect(res.status).toBe(201);
    });

    it("should accept valid category values", async () => {
      const categories = ["GENERAL", "FEEDBACK", "COMPLAINT", "SUGGESTION", "PARTNERSHIP", "OTHER"];
      for (const cat of categories) {
        vi.clearAllMocks();
        const res = await app.request("/contact-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "John", email: "john@example.com", subject: "Test", message: "Hello", category: cat }),
        });
        expect(res.status).toBe(201);
        expect(prisma.contactMessage.create).toHaveBeenCalledWith(
          expect.objectContaining({ data: expect.objectContaining({ category: cat }) })
        );
      }
    });
  });

  describe("GET /admin", () => {
    it("should return 401 without auth", async () => {
      const res = await app.request("/contact-messages/admin");
      expect(res.status).toBe(401);
    });

    it("should return paginated messages for admin", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      (prisma.contactMessage.findMany as any).mockResolvedValue([
        { id: "m1", name: "John", email: "j@e.com", subject: "Hi", status: "PENDING" },
      ]);
      (prisma.contactMessage.count as any).mockResolvedValue(1);

      const res = await app.request("/contact-messages/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.pagination.total).toBe(1);
    });

    it("should filter by status", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      (prisma.contactMessage.findMany as any).mockResolvedValue([]);
      (prisma.contactMessage.count as any).mockResolvedValue(0);

      await app.request("/contact-messages/admin?status=PENDING", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(prisma.contactMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: "PENDING" }) })
      );
    });

    it("should filter by search term", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth();
      (prisma.contactMessage.findMany as any).mockResolvedValue([]);
      (prisma.contactMessage.count as any).mockResolvedValue(0);

      await app.request("/contact-messages/admin?search=john", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(prisma.contactMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([{ name: { contains: "john" } }]),
          }),
        })
      );
    });
  });

  describe("GET /admin/:id", () => {
    it("should return message and mark as read if PENDING", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.contactMessage.update as any).mockResolvedValue({ id: "m1", status: "READ" });
      mockAuth({ id: "m1", name: "John", status: "PENDING" });

      const res = await app.request("/contact-messages/admin/m1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      expect(prisma.contactMessage.update).toHaveBeenCalledWith({
        where: { id: "m1" },
        data: { status: "READ" },
      });
    });

    it("should return 404 when message not found", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth(null);

      const res = await app.request("/contact-messages/admin/nonexistent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toBe("Pesan tidak ditemukan");
    });

    it("should not mark as read if already READ", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth({ id: "m1", status: "READ" });

      await app.request("/contact-messages/admin/m1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(prisma.contactMessage.update).not.toHaveBeenCalled();
    });
  });

  describe("PUT /admin/:id", () => {
    it("should update message status", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.contactMessage.update as any).mockResolvedValue({ id: "m1", status: "REPLIED" });
      mockAuth({ id: "m1", status: "READ" });

      const res = await app.request("/contact-messages/admin/m1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REPLIED" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });

    it("should handle reply", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.contactMessage.update as any).mockResolvedValue({ id: "m1", reply: "Thanks!" });
      mockAuth({ id: "m1", status: "READ" });

      const res = await app.request("/contact-messages/admin/m1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reply: "Thanks for contacting us!" }),
      });
      expect(res.status).toBe(200);
    });

    it("should return 404 when message not found", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth(null);

      const res = await app.request("/contact-messages/admin/nonexistent", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REPLIED" }),
      });
      expect(res.status).toBe(404);
    });

    it("should set status to REPLIED when reply is provided", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth({ id: "m1", status: "READ" });

      await app.request("/contact-messages/admin/m1", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reply: "Test reply" }),
      });
      expect(prisma.contactMessage.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: "REPLIED" }) })
      );
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/contact-messages/admin/m1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REPLIED" }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /admin/:id", () => {
    it("should delete a message", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth({ id: "m1", subject: "Test" });

      const res = await app.request("/contact-messages/admin/m1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.message).toBe("Pesan berhasil dihapus");
      expect(prisma.contactMessage.delete).toHaveBeenCalledWith({ where: { id: "m1" } });
    });

    it("should return 404 when message not found", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth(null);

      const res = await app.request("/contact-messages/admin/nonexistent", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
    });

    it("should create audit log on delete", async () => {
      const token = await generateToken({ sub: "admin-1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth({ id: "m1", subject: "Spam Report" });

      await app.request("/contact-messages/admin/m1", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/contact-messages/admin/m1", { method: "DELETE" });
      expect(res.status).toBe(401);
    });
  });
});
