import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");

process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", () => {
  const users = new Map<string, any>();
  let idCounter = 1;
  const createId = () => `id-${idCounter++}`;

  const prisma = {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.email) return Array.from(users.values()).find((u) => u.email === where.email) || null;
        if (where.username) return Array.from(users.values()).find((u) => u.username === where.username) || null;
        if (where.id) return users.get(where.id) || null;
        return null;
      }),
      findMany: vi.fn(async () => Array.from(users.values())),
      create: vi.fn(async ({ data }: any) => {
        const id = createId();
        const user = {
          id,
          name: data.name,
          email: data.email,
          username: data.username,
          password: data.password,
          tokenVersion: 0,
          status: "ACTIVE",
          deletedAt: null,
          avatar: null,
          phone: null,
          bio: null,
          location: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: data.roles?.create ? [{ role: data.roles.create.role }] : [],
          interests: [],
          ...data,
        };
        users.set(id, user);
        return user;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const user = users.get(where.id);
        if (!user) throw new Error("Not found");
        Object.assign(user, data);
        return user;
      }),
    },
    userRole: { findMany: vi.fn(async () => []) },
    communityMember: { findUnique: vi.fn(async () => null), count: vi.fn(async () => 0) },
    organizationMember: { findUnique: vi.fn(async () => null), count: vi.fn(async () => 0) },
    auditLog: { create: vi.fn(async () => ({})), findMany: vi.fn(async () => []), count: vi.fn(async () => 0) },
    loginHistory: { create: vi.fn(async () => ({})) },
    activityHistory: { create: vi.fn(async () => ({})) },
    notification: { create: vi.fn(async () => ({})), createMany: vi.fn(async () => ({ count: 0 })) },
    refreshToken: {
      create: vi.fn(async () => ({})),
      findUnique: vi.fn(async () => null),
      findMany: vi.fn(async () => []),
      updateMany: vi.fn(async () => ({ count: 0 })),
      deleteMany: vi.fn(async () => ({ count: 0 })),
      groupBy: vi.fn(async () => []),
    },
    $transaction: vi.fn(async (fn: any) => {
      if (typeof fn === "function") return fn(prisma);
      return Promise.all(fn);
    }),
    $queryRaw: vi.fn(async () => []),
  };

  return { prisma };
});

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn(async () => ({ id: "email-id" })) },
  })),
}));

vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn(() => ({ sendMail: vi.fn(async () => ({})) })) },
}));

vi.mock("pino", () => ({
  default: vi.fn(() => ({
    info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));

import { prisma } from "@komunaid/database";
import { authRoutes } from "../../src/routes/auth";
import bcrypt from "bcryptjs";

async function generateToken(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

describe("Auth Integration Tests", () => {
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
      if (err.message === "Not Found") {
        return c.json({ success: false, error: { code: "NOT_FOUND", message: "Not Found" } }, 404);
      }
      return c.json({ success: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" } }, 500);
    });
    app.route("/api/v1/auth", authRoutes);
  });

  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const res = await app.request("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          username: `testuser_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: "Test1234",
          confirmPassword: "Test1234",
        }),
      });

      expect(res.status).toBe(201);
    });

    it("should return 400 for invalid email", async () => {
      const res = await app.request("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test",
          username: "testuser",
          email: "not-email",
          password: "Test1234",
          confirmPassword: "Test1234",
        }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for mismatched passwords", async () => {
      const res = await app.request("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test",
          username: "testuser",
          email: "test@example.com",
          password: "Test1234",
          confirmPassword: "Different5678",
        }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for weak password", async () => {
      const res = await app.request("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test",
          username: "testuser",
          email: "test@example.com",
          password: "weak",
          confirmPassword: "weak",
        }),
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid username", async () => {
      const res = await app.request("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test",
          username: "ab",
          email: "test@example.com",
          password: "Test1234",
          confirmPassword: "Test1234",
        }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /login", () => {
    it("should login with email successfully", async () => {
      const hash = await bcrypt.hash("Test1234", 1);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        name: "Test User",
        password: hash,
        status: "ACTIVE",
        deletedAt: null,
        tokenVersion: 0,
        roles: [{ role: "MEMBER" }],
      });

      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "test@example.com", password: "Test1234" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
    });

    it("should return 401 for wrong password", async () => {
      const hash = await bcrypt.hash("Test1234", 1);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        name: "Test User",
        password: hash,
        status: "ACTIVE",
        deletedAt: null,
        tokenVersion: 0,
        roles: [{ role: "MEMBER" }],
      });

      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "test@example.com", password: "Wrong1234" }),
      });

      expect(res.status).toBe(401);
    });

    it("should return 401 for non-existent user", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "nobody@example.com", password: "Test1234" }),
      });

      expect(res.status).toBe(401);
    });

    it("should return 403 for suspended user", async () => {
      const hash = await bcrypt.hash("Test1234", 1);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "suspended@example.com",
        username: "suspended",
        name: "Suspended User",
        password: hash,
        status: "SUSPENDED",
        deletedAt: null,
        tokenVersion: 0,
        roles: [{ role: "MEMBER" }],
      });

      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "suspended@example.com", password: "Test1234" }),
      });

      expect(res.status).toBe(403);
    });

    it("should return 403 for deactivated user", async () => {
      const hash = await bcrypt.hash("Test1234", 1);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "deactivated@example.com",
        username: "deactivated",
        name: "Deactivated User",
        password: hash,
        status: "DEACTIVATED",
        deletedAt: null,
        tokenVersion: 0,
        roles: [{ role: "MEMBER" }],
      });

      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "deactivated@example.com", password: "Test1234" }),
      });

      expect(res.status).toBe(403);
    });

    it("should return 403 for deleted user", async () => {
      const hash = await bcrypt.hash("Test1234", 1);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "deleted@example.com",
        username: "deleted",
        name: "Deleted User",
        password: hash,
        status: "ACTIVE",
        deletedAt: new Date(),
        tokenVersion: 0,
        roles: [{ role: "MEMBER" }],
      });

      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "deleted@example.com", password: "Test1234" }),
      });

      expect(res.status).toBe(403);
    });

    it("should login with username", async () => {
      const hash = await bcrypt.hash("Test1234", 1);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
        name: "Test User",
        password: hash,
        status: "ACTIVE",
        deletedAt: null,
        tokenVersion: 0,
        roles: [{ role: "MEMBER" }],
      });

      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "testuser", password: "Test1234" }),
      });

      expect(res.status).toBe(200);
    });

    it("should return 400 for missing fields", async () => {
      const res = await app.request("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /refresh", () => {
    it("should return 401 without refresh token cookie", async () => {
      const res = await app.request("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /logout", () => {
    it("should return 401 without auth token", async () => {
      const res = await app.request("/api/v1/auth/logout", {
        method: "POST",
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /me", () => {
    it("should return 401 without auth token", async () => {
      const res = await app.request("/api/v1/auth/me");
      expect(res.status).toBe(401);
    });

    it("should return user data with valid token", async () => {
      const token = await generateToken({
        sub: "user-1",
        email: "test@example.com",
        name: "Test User",
        username: "testuser",
        type: "access",
        tokenVersion: 0,
      });

      (prisma.user.findUnique as any).mockImplementation(async ({ where }: any) => {
        if (where.id === "user-1") {
          return {
            id: "user-1",
            email: "test@example.com",
            username: "testuser",
            name: "Test User",
            status: "ACTIVE",
            phone: null,
            bio: null,
            location: null,
            avatar: null,
            tokenVersion: 0,
            roles: [{ role: "MEMBER" }],
            interests: [],
            createdAt: new Date(),
          };
        }
        return { tokenVersion: 0 };
      });

      const res = await app.request("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe("test@example.com");
    });
  });

  describe("PUT /change-password", () => {
    it("should return 401 without auth token", async () => {
      const res = await app.request("/api/v1/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: "Old1234", newPassword: "New1234" }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("POST /forgot-password", () => {
    it("should always return 200 (prevents email enumeration)", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const res = await app.request("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "nonexistent@example.com" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.success).toBe(true);
    });

    it("should return 400 for invalid email format", async () => {
      const res = await app.request("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-email" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /reset-password", () => {
    it("should return 400 for invalid token", async () => {
      const res = await app.request("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "invalid-token", password: "New12345" }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /sessions", () => {
    it("should return 401 without auth token", async () => {
      const res = await app.request("/api/v1/auth/sessions");
      expect(res.status).toBe(401);
    });
  });
});
