import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";

vi.mock("ioredis", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      connect: vi.fn(),
      quit: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
      eval: vi.fn(),
      script: vi.fn(),
      scan: vi.fn(),
      del: vi.fn(),
      pttl: vi.fn(),
    })),
  };
});

vi.mock("@komunaid/database", () => {
  const handlers: Record<string, any> = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  };
  const prisma: any = new Proxy({}, {
    get(_: any, _table: string) { return handlers; },
  });
  return { prisma };
});

const mockAdminRateLimiter = vi.fn();

vi.mock("../../../src/services/rate-limiter", () => ({
  adminMutationRateLimiter: (...args: any[]) => mockAdminRateLimiter(...args),
  apiRateLimiter: vi.fn(),
  rateLimitMiddleware: vi.fn(() => vi.fn()),
}));

import { adminMutationRateLimiter } from "../../../src/middleware/admin-rate-limit";

type TestEnv = { Variables: { user: { id: string } } };

describe("Admin Rate Limit Middleware", () => {
  let app: Hono<TestEnv>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono<TestEnv>();
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));
  });

  it("should skip rate limiting when no auth user", async () => {
    mockAdminRateLimiter.mockResolvedValue({
      allowed: true,
      remaining: 29,
      resetAt: Date.now() + 60000,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.status).toBe(200);
    expect(mockAdminRateLimiter).not.toHaveBeenCalled();
  });

  it("should call rate limiter when auth user is present", async () => {
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: true,
      remaining: 29,
      resetAt: Date.now() + 60000,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.status).toBe(200);
    expect(mockAdminRateLimiter).toHaveBeenCalledWith("admin-1");
  });

  it("should set rate limit headers when allowed", async () => {
    const resetAt = Date.now() + 60000;
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: true,
      remaining: 29,
      resetAt,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.headers.get("X-RateLimit-Limit")).toBe("30");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("29");
    expect(res.headers.get("X-RateLimit-Reset")).toBe(String(resetAt));
  });

  it("should return 429 when rate limit exceeded", async () => {
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Terlalu banyak operasi mutasi. Coba lagi nanti.");
  });

  it("should set Retry-After header when retryAfter is defined", async () => {
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
      retryAfter: 30000,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
  });

  it("should not set Retry-After header when retryAfter is undefined", async () => {
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
      retryAfter: undefined,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeNull();
  });

  it("should call next when allowed", async () => {
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: true,
      remaining: 29,
      resetAt: Date.now() + 60000,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("should not set Retry-After header when allowed", async () => {
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: true,
      remaining: 5,
      resetAt: Date.now() + 60000,
      retryAfter: 5000,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.headers.get("Retry-After")).toBeNull();
  });

  it("should handle remaining=0 when allowed", async () => {
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: true,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("1");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("should ceil the Retry-After value in seconds", async () => {
    app = new Hono<TestEnv>();
    app.use("*", async (c, next) => {
      c.set("user", { id: "admin-1" });
      await next();
    });
    app.use("*", adminMutationRateLimiter());
    app.post("/admin/test", (c) => c.json({ ok: true }));

    mockAdminRateLimiter.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
      retryAfter: 2500,
    });

    const res = await app.request("/admin/test", { method: "POST" });
    expect(res.headers.get("Retry-After")).toBe("3");
  });
});
