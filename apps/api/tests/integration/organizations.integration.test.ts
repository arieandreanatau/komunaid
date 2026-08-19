import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", () => {
  const prisma: any = {
    user: { findUnique: vi.fn() },
    organization: { findUnique: vi.fn() },
    organizationMember: { findUnique: vi.fn() },
    joinRequest: { findUnique: vi.fn(), update: vi.fn() },
  };
  return { prisma };
});

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));

import { prisma } from "@komunaid/database";
import { organizationRoutes } from "../../src/routes/organizations";

async function token() {
  return new SignJWT({ sub: "user-2", email: "user@test.local", name: "User", username: "user", type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

describe("Private organization access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
    (prisma.organization.findUnique as any).mockResolvedValue({
      id: "org-1", ownerId: "user-1", status: "APPROVED", visibility: "PRIVATE", deletedAt: null,
    });
  });

  it("rejects suspended or deleted membership", async () => {
    (prisma.organizationMember.findUnique as any).mockResolvedValue({ role: "MEMBER", status: "ACTIVE", deletedAt: new Date() });
    const app = new Hono();
    app.route("/api/v1/organizations", organizationRoutes);
    const response = await app.request("/api/v1/organizations/private", { headers: { Authorization: `Bearer ${await token()}` } });

    expect(response.status).toBe(403);
  });

  it("returns 422 and does not mutate for invalid join request action", async () => {
    (prisma.organizationMember.findUnique as any).mockResolvedValue({
      role: "ADMIN",
      status: "ACTIVE",
      deletedAt: null,
    });
    const app = new Hono();
    app.route("/api/v1/organizations", organizationRoutes);

    const response = await app.request("/api/v1/organizations/org-1/join-requests/request-1", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${await token()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "delete" }),
    });

    expect(response.status).toBe(422);
    expect(prisma.joinRequest.findUnique).not.toHaveBeenCalled();
    expect(prisma.joinRequest.update).not.toHaveBeenCalled();
  });

  it("filters private and deleted events from public organization detail", async () => {
    (prisma.organization.findUnique as any).mockResolvedValue({
      id: "org-1", ownerId: "user-1", status: "APPROVED", visibility: "PUBLIC", deletedAt: null,
      owner: {}, members: [], events: [], categories: [], tags: [], settings: null, _count: { members: 0, events: 0 },
    });
    const app = new Hono();
    app.route("/api/v1/organizations", organizationRoutes);

    const response = await app.request("/api/v1/organizations/public-org");

    expect(response.status).toBe(200);
    expect(prisma.organization.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        events: expect.objectContaining({
          where: expect.objectContaining({ status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null }),
        }),
      }),
    }));
  });
});
