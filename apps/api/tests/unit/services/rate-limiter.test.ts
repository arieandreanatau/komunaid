import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@komunaid/database", () => ({
  prisma: {},
}));

vi.mock("ioredis", () => ({
  default: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    quit: vi.fn(),
    disconnect: vi.fn(),
    eval: vi.fn(),
    script: vi.fn(),
    scan: vi.fn(),
    pttl: vi.fn(),
    del: vi.fn(),
    on: vi.fn(),
  })),
}));

import {
  createRateLimiter,
  createSlidingWindowRateLimiter,
  createExponentialBackoffLimiter,
  closeRedisConnection,
  getIP,
} from "../../../src/services/rate-limiter";
import { Hono } from "hono";

describe("Rate Limiter Service", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createRateLimiter (in-memory fallback)", () => {
    it("should allow requests within limit", async () => {
      const limiter = createRateLimiter("test", 60000, 5);

      const result = await limiter("ip-1");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should block requests exceeding limit", async () => {
      const limiter = createRateLimiter("test-block", 60000, 2);

      await limiter("ip-1");
      await limiter("ip-1");
      const result = await limiter("ip-1");

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it("should reset counter after window expires", async () => {
      const limiter = createRateLimiter("test-reset", 1000, 1);

      await limiter("ip-1");
      const blocked = await limiter("ip-1");
      expect(blocked.allowed).toBe(false);

      vi.advanceTimersByTime(1100);
      const afterReset = await limiter("ip-1");
      expect(afterReset.allowed).toBe(true);
    });

    it("should track different identifiers separately", async () => {
      const limiter = createRateLimiter("test-sep", 60000, 1);

      await limiter("ip-1");
      const ip1Result = await limiter("ip-1");
      expect(ip1Result.allowed).toBe(false);

      const ip2Result = await limiter("ip-2");
      expect(ip2Result.allowed).toBe(true);
    });

    it("should include resetAt timestamp", async () => {
      const limiter = createRateLimiter("test-resetAt", 60000, 5);

      const result = await limiter("ip-1");
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it("should set remaining to 0 when exceeded", async () => {
      const limiter = createRateLimiter("test-remaining", 60000, 1);

      await limiter("ip-1");
      const result = await limiter("ip-1");
      expect(result.remaining).toBe(0);
    });

    it("should use different keys for different limiter instances", async () => {
      const limiter1 = createRateLimiter("key-a", 60000, 1);
      const limiter2 = createRateLimiter("key-b", 60000, 1);

      await limiter1("ip-1");
      const r1 = await limiter1("ip-1");
      expect(r1.allowed).toBe(false);

      const r2 = await limiter2("ip-1");
      expect(r2.allowed).toBe(true);
    });
  });

  describe("createExponentialBackoffLimiter (in-memory)", () => {
    it("should allow first attempt", async () => {
      const limiter = createExponentialBackoffLimiter("bo-test", 1000, 3);

      const result = await limiter("user-1");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("should block after max attempts", async () => {
      const limiter = createExponentialBackoffLimiter("bo-block", 1000, 2);

      await limiter("user-1");
      await limiter("user-1");
      const result = await limiter("user-1");

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    it("should use exponential backoff window", async () => {
      const limiter = createExponentialBackoffLimiter("bo-backoff", 1000, 5);

      await limiter("user-1");
      vi.advanceTimersByTime(100);
      const r2 = await limiter("user-1");

      expect(r2.allowed).toBe(true);
    });

    it("should reset after backoff window expires", async () => {
      const limiter = createExponentialBackoffLimiter("bo-reset", 1000, 2);

      await limiter("user-1");
      await limiter("user-1");
      const blocked = await limiter("user-1");
      expect(blocked.allowed).toBe(false);

      vi.advanceTimersByTime(4000);
      const afterReset = await limiter("user-1");
      expect(afterReset.allowed).toBe(true);
    });

    it("should track different identifiers separately", async () => {
      const limiter = createExponentialBackoffLimiter("bo-sep", 1000, 1);

      await limiter("user-1");
      const r1 = await limiter("user-1");
      expect(r1.allowed).toBe(false);

      const r2 = await limiter("user-2");
      expect(r2.allowed).toBe(true);
    });

    it("should cap backoff at 24 hours", async () => {
      const limiter = createExponentialBackoffLimiter("bo-cap", 86400000, 10);

      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(86400000 + 1000);
        await limiter("user-1");
      }

      const result = await limiter("user-1");
      expect(result.resetAt - Date.now()).toBeLessThanOrEqual(86400000 + 2000);
    });

    it("should decrement remaining correctly", async () => {
      const limiter = createExponentialBackoffLimiter("bo-remaining", 60000, 5);

      const r1 = await limiter("user-1");
      expect(r1.remaining).toBe(4);

      const r2 = await limiter("user-1");
      expect(r2.remaining).toBe(3);
    });

    it("should return 0 remaining when at limit", async () => {
      const limiter = createExponentialBackoffLimiter("bo-zero", 60000, 1);

      await limiter("user-1");
      const result = await limiter("user-1");
      expect(result.remaining).toBe(0);
    });
  });

  describe("createSlidingWindowRateLimiter (in-memory)", () => {
    it("should allow requests within window", async () => {
      const limiter = createSlidingWindowRateLimiter("sw-test", 60000, 5);

      const result = await limiter("ip-1");
      expect(result.allowed).toBe(true);
    });

    it("should block when window limit exceeded", async () => {
      const limiter = createSlidingWindowRateLimiter("sw-block", 60000, 2);

      await limiter("ip-1");
      await limiter("ip-1");
      const result = await limiter("ip-1");

      expect(result.allowed).toBe(false);
    });

    it("should allow after window expires", async () => {
      const limiter = createSlidingWindowRateLimiter("sw-reset", 1000, 1);

      await limiter("ip-1");
      vi.advanceTimersByTime(1100);
      const result = await limiter("ip-1");

      expect(result.allowed).toBe(true);
    });
  });

  describe("closeRedisConnection", () => {
    it("should not throw when no Redis client", async () => {
      await expect(closeRedisConnection()).resolves.toBeUndefined();
    });
  });

  describe("getIP", () => {
    afterEach(() => {
      delete process.env.TRUSTED_PROXIES;
    });

    it("ignores attacker-supplied proxy headers without trusted proxy mode", async () => {
      const app = new Hono();
      app.get("/", (c) => c.text(getIP(c)));

      const result = await app.request("/", {
        headers: { "X-Forwarded-For": "198.51.100.99", "X-Real-IP": "203.0.113.42" },
      });

      expect(await result.text()).toBe("unknown");
    });

    it("uses forwarded client IP only with trusted proxy mode", async () => {
      const app = new Hono();
      process.env.TRUSTED_PROXIES = "true";
      app.get("/trusted", (c) => c.text(getIP(c)));

      const result = await app.request("/trusted", {
        headers: { "X-Forwarded-For": "198.51.100.99, 10.0.0.1" },
      });

      expect(await result.text()).toBe("198.51.100.99");
    });
  });
});
