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
    create: vi.fn(async ({ data }: any) => ({ id: "created-id", createdAt: new Date(), updatedAt: new Date(), status: "OPEN", ...data })),
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
import { reportRoutes } from "../../../src/routes/reports";

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

describe("Report Routes", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.onError((err, c) => {
      if (err.message === "Unauthorized") return c.json({ success: false }, 401);
      if (err.message === "Forbidden") return c.json({ success: false }, 403);
      return c.json({ success: false }, 500);
    });
    app.route("/reports", reportRoutes);
  });

  describe("POST /", () => {
    it("should create a report successfully", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });
      (prisma.report.findFirst as any).mockResolvedValue(null);

      const res = await app.request("/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "USER", targetId: "t1", reason: "SPAM", description: "spam" }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
    });

    it("should return 409 for duplicate report", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });
      (prisma.report.findFirst as any).mockResolvedValue({ id: "existing", reporterId: "u1", targetType: "USER", targetId: "t1", status: "OPEN" });

      const res = await app.request("/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "USER", targetId: "t1", reason: "SPAM" }),
      });
      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.message).toBe("Anda sudah melaporkan ini");
    });

    it("should create audit log on report creation", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });
      (prisma.report.findFirst as any).mockResolvedValue(null);

      await app.request("/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "COMMUNITY", targetId: "c1", reason: "HARASSMENT" }),
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "USER", targetId: "t1", reason: "SPAM" }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 400 for invalid targetType", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });

      const res = await app.request("/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "INVALID", targetId: "t1", reason: "SPAM" }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for missing required fields", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });

      const res = await app.request("/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it("should allow optional description", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });
      (prisma.report.findFirst as any).mockResolvedValue(null);

      const res = await app.request("/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "EVENT", targetId: "e1", reason: "INAPPROPRIATE_CONTENT" }),
      });
      expect(res.status).toBe(201);
    });
  });

  describe("GET /:reportId", () => {
    it("should return report by ID for owner", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });
      (prisma.report.findUnique as any).mockResolvedValue({
        id: "r1", reporterId: "u1", targetType: "USER", targetId: "t1",
        reason: "SPAM", description: "desc", status: "OPEN",
        reviewNote: null, reviewedAt: null, createdAt: new Date(),
      });

      const res = await app.request("/reports/r1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe("r1");
    });

    it("should return 404 when report not found", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth(null);

      const res = await app.request("/reports/nonexistent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.message).toBe("Laporan tidak ditemukan");
    });

    it("should return 403 when not the owner", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      (prisma.user.findUnique as any).mockImplementation(async (args: any) => {
        if (args?.select?.tokenVersion !== undefined) return { tokenVersion: 0, status: "ACTIVE" };
        return null;
      });
      (prisma.report.findUnique as any).mockResolvedValue({
        id: "r1", reporterId: "other-user", targetType: "USER", targetId: "t1", reason: "SPAM", status: "OPEN",
      });

      const res = await app.request("/reports/r1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.message).toBe("Tidak memiliki akses");
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/reports/r1");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /my", () => {
    it("should be shadowed by /:reportId route (matches as reportId=my)", async () => {
      const token = await generateToken({ sub: "u1", email: "a@b.com", name: "A", username: "a", type: "access" });
      mockAuth(null);

      const res = await app.request("/reports/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
    });

    it("should return 401 without auth", async () => {
      const res = await app.request("/reports/my");
      expect(res.status).toBe(401);
    });
  });
});
