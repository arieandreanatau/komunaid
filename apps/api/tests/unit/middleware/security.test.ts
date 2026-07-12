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

import { securityHeaders, requestSizeLimit } from "../../../src/middleware/security";

describe("Security Middleware", () => {
  describe("securityHeaders", () => {
    let app: Hono;

    beforeEach(() => {
      app = new Hono();
      app.use("*", securityHeaders);
      app.get("/test", (c) => c.json({ ok: true }));
      app.post("/test", (c) => c.json({ ok: true }));
    });

    it("should set X-Content-Type-Options to nosniff", async () => {
      const res = await app.request("/test");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });

    it("should set X-Frame-Options to DENY", async () => {
      const res = await app.request("/test");
      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("should set X-XSS-Protection to 1; mode=block", async () => {
      const res = await app.request("/test");
      expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });

    it("should set Referrer-Policy to strict-origin-when-cross-origin", async () => {
      const res = await app.request("/test");
      expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    });

    it("should set Permissions-Policy with denied camera, microphone, geolocation", async () => {
      const res = await app.request("/test");
      expect(res.headers.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    });

    it("should set Strict-Transport-Security header", async () => {
      const res = await app.request("/test");
      expect(res.headers.get("Strict-Transport-Security")).toBe(
        "max-age=31536000; includeSubDomains; preload"
      );
    });

    it("should set Content-Security-Policy header", async () => {
      const res = await app.request("/test");
      const csp = res.headers.get("Content-Security-Policy");
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
    });

    it("should set all 7 security headers", async () => {
      const res = await app.request("/test");
      const headers = [
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Referrer-Policy",
        "Permissions-Policy",
        "Strict-Transport-Security",
        "Content-Security-Policy",
      ];
      for (const header of headers) {
        expect(res.headers.get(header)).toBeDefined();
      }
    });

    it("should call next (return 200)", async () => {
      const res = await app.request("/test");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
    });

    it("should apply to POST requests too", async () => {
      const res = await app.request("/test", { method: "POST" });
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    });
  });

  describe("requestSizeLimit", () => {
    let app: Hono;

    beforeEach(() => {
      app = new Hono();
      app.use("*", requestSizeLimit());
      app.get("/test", (c) => c.json({ ok: true }));
      app.post("/test", (c) => c.json({ ok: true }));
      app.put("/test", (c) => c.json({ ok: true }));
      app.delete("/test", (c) => c.json({ ok: true }));
      app.on("HEAD", "/test", (c) => c.json({ ok: true }));
      app.on("OPTIONS", "/test", (c) => c.json({ ok: true }));
    });

    it("should allow GET requests without content-length", async () => {
      const res = await app.request("/test");
      expect(res.status).toBe(200);
    });

    it("should allow HEAD requests without content-length", async () => {
      const res = await app.request("/test", { method: "HEAD" });
      expect(res.status).toBe(200);
    });

    it("should allow OPTIONS requests without content-length", async () => {
      const res = await app.request("/test", { method: "OPTIONS" });
      expect(res.status).toBe(200);
    });

    it("should return 411 when POST has no content-length and no transfer-encoding", async () => {
      const res = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: { "content-type": "application/json" },
      });
      expect(res.status).toBe(411);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("Request tanpa Content-Length atau Transfer-Encoding");
    });

    it("should allow POST when content-length is within limit", async () => {
      const res = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "100",
        },
      });
      expect(res.status).toBe(200);
    });

    it("should return 413 when content-length exceeds limit", async () => {
      const res = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "10485761",
        },
      });
      expect(res.status).toBe(413);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe("Request terlalu besar");
    });

    it("should allow POST when transfer-encoding is present", async () => {
      const res = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "transfer-encoding": "chunked",
        },
      });
      expect(res.status).toBe(200);
    });

    it("should return 413 for PUT when content-length exceeds limit", async () => {
      app = new Hono();
      app.use("*", requestSizeLimit());
      app.put("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "PUT",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "99999999",
        },
      });
      expect(res.status).toBe(413);
    });

    it("should return 413 for DELETE when content-length exceeds limit", async () => {
      app = new Hono();
      app.use("*", requestSizeLimit());
      app.delete("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "DELETE",
        headers: {
          "content-length": "99999999",
        },
      });
      expect(res.status).toBe(413);
    });
  });

  describe("requestSizeLimit with custom sizes", () => {
    it("should accept '1kb' limit", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("1kb"));
      app.post("/test", (c) => c.json({ ok: true }));

      const overLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "1025",
        },
      });
      expect(overLimit.status).toBe(413);

      const withinLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "1024",
        },
      });
      expect(withinLimit.status).toBe(200);
    });

    it("should accept '500b' limit", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("500b"));
      app.post("/test", (c) => c.json({ ok: true }));

      const overLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "501",
        },
      });
      expect(overLimit.status).toBe(413);

      const withinLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "500",
        },
      });
      expect(withinLimit.status).toBe(200);
    });

    it("should accept '1gb' limit", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("1gb"));
      app.post("/test", (c) => c.json({ ok: true }));

      const withinLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "1073741824",
        },
      });
      expect(withinLimit.status).toBe(200);

      const overLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "1073741825",
        },
      });
      expect(overLimit.status).toBe(413);
    });

    it("should accept '2.5mb' limit", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("2.5mb"));
      app.post("/test", (c) => c.json({ ok: true }));

      const maxBytes = Math.floor(2.5 * 1024 * 1024);
      const withinLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": String(maxBytes),
        },
      });
      expect(withinLimit.status).toBe(200);

      const overLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": String(maxBytes + 1),
        },
      });
      expect(overLimit.status).toBe(413);
    });

    it("should default to 10mb for invalid format", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("invalid"));
      app.post("/test", (c) => c.json({ ok: true }));

      const withinLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": String(10 * 1024 * 1024),
        },
      });
      expect(withinLimit.status).toBe(200);

      const overLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": String(10 * 1024 * 1024 + 1),
        },
      });
      expect(overLimit.status).toBe(413);
    });

    it("should default to 10mb for empty string", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit(""));
      app.post("/test", (c) => c.json({ ok: true }));

      const withinLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": String(10 * 1024 * 1024),
        },
      });
      expect(withinLimit.status).toBe(200);
    });

    it("should default to 10mb for numeric-only string", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("5000"));
      app.post("/test", (c) => c.json({ ok: true }));

      const withinLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": String(10 * 1024 * 1024),
        },
      });
      expect(withinLimit.status).toBe(200);
    });

    it("should handle size with space between number and unit", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("1 kb"));
      app.post("/test", (c) => c.json({ ok: true }));

      const overLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "1025",
        },
      });
      expect(overLimit.status).toBe(413);
    });

    it("should handle uppercase unit", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("1KB"));
      app.post("/test", (c) => c.json({ ok: true }));

      const overLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": "1025",
        },
      });
      expect(overLimit.status).toBe(413);
    });

    it("should handle case-insensitive units (MB, Kb, Gb)", async () => {
      const app = new Hono();
      app.use("*", requestSizeLimit("1Mb"));
      app.post("/test", (c) => c.json({ ok: true }));

      const withinLimit = await app.request("/test", {
        method: "POST",
        body: "data",
        headers: {
          "content-type": "application/json",
          "content-length": String(1024 * 1024),
        },
      });
      expect(withinLimit.status).toBe(200);
    });
  });
});
