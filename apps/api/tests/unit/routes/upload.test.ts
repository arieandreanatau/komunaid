import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", () => {
  const prisma: any = {
    user: { findUnique: vi.fn(async () => ({ tokenVersion: 0, status: "ACTIVE", deletedAt: null })) },
    auditLog: { create: vi.fn(async () => ({})) },
  };
  return { prisma };
});

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));

vi.mock("node:fs/promises", () => ({ writeFile: vi.fn(async () => {}), mkdir: vi.fn(async () => {}) }));

import { uploadRoutes } from "../../../src/routes/upload";

async function token(): Promise<string> {
  return new SignJWT({ sub: "user-1", email: "u@test.local", name: "U", username: "u", type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

function jpegBuffer(): Buffer {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
}

function pngBuffer(): Buffer {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
}

describe("Upload route security guards (SEC-02)", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.onError((err: any, c) => {
      if (err.message === "Unauthorized") return c.json({ success: false, error: { code: "UNAUTHORIZED" } }, 401);
      if (err.message === "Forbidden") return c.json({ success: false, error: { code: "FORBIDDEN" } }, 403);
      return c.json({ success: false, error: { code: "INTERNAL_SERVER_ERROR" } }, 500);
    });
    app.route("/upload", uploadRoutes);
  });

  it("rejects unauthenticated upload", async () => {
    const form = new FormData();
    form.append("file", new File([jpegBuffer()], "x.jpg", { type: "image/jpeg" }));
    const res = await app.request("/upload", { method: "POST", body: form });
    expect(res.status).toBe(401);
  });

  it("rejects disallowed MIME type", async () => {
    const form = new FormData();
    form.append("file", new File([Buffer.from("<script>alert(1)</script>")], "evil.html", { type: "text/html" }));
    const res = await app.request("/upload", { method: "POST", headers: { Authorization: `Bearer ${await token()}` }, body: form });
    expect(res.status).toBe(400);
  });

  it("rejects MIME spoof: type says jpeg but content is html", async () => {
    const form = new FormData();
    form.append("file", new File([Buffer.from("<html>not an image</html>")], "x.jpg", { type: "image/jpeg" }));
    const res = await app.request("/upload", { method: "POST", headers: { Authorization: `Bearer ${await token()}` }, body: form });
    expect(res.status).toBe(400);
  });

  it("accepts genuine PNG", async () => {
    const form = new FormData();
    form.append("file", new File([pngBuffer()], "x.png", { type: "image/png" }));
    const res = await app.request("/upload", { method: "POST", headers: { Authorization: `Bearer ${await token()}` }, body: form });
    expect(res.status).toBe(200);
  });
});