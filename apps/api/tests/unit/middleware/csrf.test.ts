import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { csrfProtection } from "../../../src/middleware/csrf";

describe("CSRF Middleware", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  describe("GET requests", () => {
    it("should set CSRF token in response header for GET", async () => {
      app.use("*", csrfProtection());
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");
      expect(res.status).toBe(200);
      expect(res.headers.get("X-CSRF-Token")).toBeDefined();
      expect(res.headers.get("X-CSRF-Token")!.length).toBe(64);
    });

    it("should set csrf_token cookie", async () => {
      app.use("*", csrfProtection());
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test");
      const setCookies = res.headers.getSetCookie?.() || [];
      const csrfCookie = setCookies.find((c: string) => c.startsWith("csrf_token="));
      expect(csrfCookie).toBeDefined();
    });

    it("should reuse existing valid CSRF token from cookie", async () => {
      app.use("*", csrfProtection());
      app.get("/test", (c) => c.json({ ok: true }));

      const existingToken = "a".repeat(64);
      const res = await app.request("/test", {
        headers: { Cookie: `csrf_token=${existingToken}` },
      });
      expect(res.headers.get("X-CSRF-Token")).toBe(existingToken);
    });

    it("should generate new token when cookie has invalid length", async () => {
      app.use("*", csrfProtection());
      app.get("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        headers: { Cookie: "csrf_token=short" },
      });
      expect(res.headers.get("X-CSRF-Token")!.length).toBe(64);
      expect(res.headers.get("X-CSRF-Token")).not.toBe("short");
    });
  });

  describe("POST requests", () => {
    it("should return 403 when CSRF header is missing", async () => {
      app.use("*", csrfProtection());
      app.post("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", { method: "POST" });
      expect(res.status).toBe(403);
      const body = await res.json() as any;
      expect(body.message).toContain("CSRF");
    });

    it("should return 403 when cookie is missing", async () => {
      app.use("*", csrfProtection());
      app.post("/test", (c) => c.json({ ok: true }));

      const token = "a".repeat(64);
      const res = await app.request("/test", {
        method: "POST",
        headers: { "X-CSRF-Token": token },
      });
      expect(res.status).toBe(403);
    });

    it("should return 403 when CSRF header and cookie do not match", async () => {
      app.use("*", csrfProtection());
      app.post("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: {
          Cookie: "csrf_token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "X-CSRF-Token": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        },
      });
      expect(res.status).toBe(403);
    });

    it("should pass when CSRF token matches cookie", async () => {
      app.use("*", csrfProtection());
      app.post("/test", (c) => c.json({ ok: true }));

      const token = "c".repeat(64);
      const res = await app.request("/test", {
        method: "POST",
        headers: {
          Cookie: `csrf_token=${token}`,
          "X-CSRF-Token": token,
        },
      });
      expect(res.status).toBe(200);
    });

    it("should rotate CSRF token after successful POST", async () => {
      app.use("*", csrfProtection());
      app.post("/test", (c) => c.json({ ok: true }));

      const token = "d".repeat(64);
      const res = await app.request("/test", {
        method: "POST",
        headers: {
          Cookie: `csrf_token=${token}`,
          "X-CSRF-Token": token,
        },
      });
      const newToken = res.headers.get("X-CSRF-Token");
      expect(newToken).toBeDefined();
      expect(newToken).not.toBe(token);
      expect(newToken!.length).toBe(64);
    });
  });

  describe("HEAD/OPTIONS", () => {
    it("should treat HEAD like GET (set token)", async () => {
      app.use("*", csrfProtection());
      app.on("HEAD", "/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", { method: "HEAD" });
      expect(res.headers.get("X-CSRF-Token")).toBeDefined();
    });

    it("should treat OPTIONS like GET (set token)", async () => {
      app.use("*", csrfProtection());
      app.on("OPTIONS", "/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", { method: "OPTIONS" });
      expect(res.headers.get("X-CSRF-Token")).toBeDefined();
    });
  });

  describe("PUT/DELETE/PATCH", () => {
    it("should require CSRF for PUT", async () => {
      app.use("*", csrfProtection());
      app.put("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", { method: "PUT" });
      expect(res.status).toBe(403);
    });

    it("should require CSRF for DELETE", async () => {
      app.use("*", csrfProtection());
      app.delete("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", { method: "DELETE" });
      expect(res.status).toBe(403);
    });

    it("should require CSRF for PATCH", async () => {
      app.use("*", csrfProtection());
      app.patch("/test", (c) => c.json({ ok: true }));

      const res = await app.request("/test", { method: "PATCH" });
      expect(res.status).toBe(403);
    });

    it("should pass PUT with valid CSRF", async () => {
      app.use("*", csrfProtection());
      app.put("/test", (c) => c.json({ ok: true }));

      const token = "e".repeat(64);
      const res = await app.request("/test", {
        method: "PUT",
        headers: {
          Cookie: `csrf_token=${token}`,
          "X-CSRF-Token": token,
        },
      });
      expect(res.status).toBe(200);
    });
  });
});
