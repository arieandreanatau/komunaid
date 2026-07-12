import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../../../src/middleware/validate";

describe("Validate Middleware", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(0).optional(),
  });

  const querySchema = z.object({
    page: z.string().transform(Number).optional(),
    search: z.string().optional(),
  });

  const paramSchema = z.object({
    id: z.string().uuid(),
  });

  describe("body validation", () => {
    it("should pass valid body and set validated data", async () => {
      app.post("/test", validate(userSchema), (c) => {
        const data = (c as any).get("validated");
        return c.json({ data });
      });

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "john@test.com" }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data.name).toBe("John");
      expect(body.data.email).toBe("john@test.com");
    });

    it("should return 400 for invalid body", async () => {
      app.post("/test", validate(userSchema), (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", email: "not-an-email" }),
      });

      expect(res.status).toBe(400);
      const body = await res.json() as any;
      expect(body.success).toBe(false);
      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
    });

    it("should return 400 for empty body", async () => {
      app.post("/test", validate(userSchema), (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 for invalid JSON", async () => {
      app.post("/test", validate(userSchema), (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      });

      expect(res.status).toBe(400);
      const body = await res.json() as any;
      expect(body.success).toBe(false);
      expect(body.errors).toBeDefined();
      expect(body.errors[0].field).toBe("body");
      expect(body.errors[0].message).toContain("JSON");
    });

    it("should include field path in errors", async () => {
      app.post("/test", validate(userSchema), (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test", email: "bad" }),
      });

      const body = await res.json() as any;
      const emailError = body.errors.find((e: any) => e.field === "email");
      expect(emailError).toBeDefined();
    });

    it("should handle nested field paths", async () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string().min(1),
        }),
      });

      app.post("/test", validate(nestedSchema), (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { name: "" } }),
      });

      const body = await res.json() as any;
      expect(body.errors[0].field).toBe("user.name");
    });

    it("should pass optional fields as undefined", async () => {
      app.post("/test", validate(userSchema), (c) => {
        const data = (c as any).get("validated");
        return c.json({ data });
      });

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "John", email: "john@test.com" }),
      });

      const body = await res.json() as any;
      expect(body.data.age).toBeUndefined();
    });
  });

  describe("query validation", () => {
    it("should validate query parameters", async () => {
      app.get("/test", validate(querySchema, "query"), (c) => {
        const data = (c as any).get("validated");
        return c.json({ data });
      });

      const res = await app.request("/test?page=1&search=test");
      expect(res.status).toBe(200);
      const body = await res.json() as any;
      expect(body.data.page).toBe(1);
      expect(body.data.search).toBe("test");
    });

    it("should pass empty query params", async () => {
      app.get("/test", validate(querySchema, "query"), (c) => c.json({ ok: true }));

      const res = await app.request("/test");
      expect(res.status).toBe(200);
    });
  });

  describe("param validation", () => {
    it("should validate path parameters", async () => {
      app.get("/test/:id", validate(paramSchema, "param"), (c) => c.json({ ok: true }));

      const res = await app.request("/test/550e8400-e29b-41d4-a716-446655440000");
      expect(res.status).toBe(200);
    });

    it("should reject invalid path parameters", async () => {
      app.get("/test/:id", validate(paramSchema, "param"), (c) => c.json({ ok: true }));

      const res = await app.request("/test/not-a-uuid");
      expect(res.status).toBe(400);
    });
  });

  describe("edge cases", () => {
    it("should handle boolean coercion in query", async () => {
      const boolSchema = z.object({ active: z.string() });
      app.get("/test", validate(boolSchema, "query"), (c) => {
        return c.json({ data: (c as any).get("validated") });
      });

      const res = await app.request("/test?active=true");
      expect(res.status).toBe(200);
    });

    it("should handle array query params", async () => {
      const arrSchema = z.object({ tags: z.string() });
      app.get("/test", validate(arrSchema, "query"), (c) => c.json({ ok: true }));

      const res = await app.request("/test?tags=a");
      expect(res.status).toBe(200);
    });

    it("should return proper error format", async () => {
      app.post("/test", validate(userSchema), (c) => c.json({ ok: true }));

      const res = await app.request("/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const body = await res.json() as any;
      expect(body).toHaveProperty("success", false);
      expect(body).toHaveProperty("message", "Validation Error");
      expect(body).toHaveProperty("errors");
      expect(Array.isArray(body.errors)).toBe(true);
    });
  });
});
