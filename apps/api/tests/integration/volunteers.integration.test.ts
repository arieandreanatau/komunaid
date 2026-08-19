import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", () => {
  const prisma: any = {
    user: { findUnique: vi.fn() },
    communityMember: { findUnique: vi.fn() },
    organizationMember: { findUnique: vi.fn() },
    volunteerOpportunity: { findUnique: vi.fn(), update: vi.fn() },
    volunteerPosition: { updateMany: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    auditLog: { create: vi.fn() },
    activityHistory: { create: vi.fn() },
  };
  return { prisma };
});

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));

import { prisma } from "@komunaid/database";
import { volunteerRoutes } from "../../src/routes/volunteers";

async function token() {
  return new SignJWT({ sub: "user-1", email: "user@test.local", name: "User", username: "user", type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

describe("Volunteer opportunity position isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
    (prisma.volunteerOpportunity.findUnique as any).mockResolvedValue({
      id: "opportunity-1", title: "Opportunity", status: "DRAFT", deletedAt: null,
      event: { id: "event-1", communityId: "community-1", organizationId: null, createdById: "user-1" },
    });
    (prisma.communityMember.findUnique as any).mockResolvedValue({ role: "OWNER", status: "ACTIVE", deletedAt: null });
    (prisma.volunteerOpportunity.update as any).mockResolvedValue({ id: "opportunity-1", title: "Opportunity", slug: "opportunity", status: "DRAFT" });
    (prisma.volunteerPosition.findMany as any).mockResolvedValue([]);
    (prisma.auditLog.create as any).mockResolvedValue({});
  });

  it("rejects position ID belonging to another opportunity", async () => {
    (prisma.volunteerPosition.findMany as any).mockResolvedValue([]);
    const app = new Hono();
    app.route("/api/v1/volunteer", volunteerRoutes);
    const response = await app.request("/api/v1/volunteer/opportunity-1", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ positions: [{ id: "position-other", name: "Helper", requiredQty: 1 }] }),
    });

    expect(response.status).toBe(404);
    expect(prisma.volunteerPosition.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["position-other"] }, opportunityId: "opportunity-1" },
      select: { id: true },
    });
    expect(prisma.volunteerOpportunity.update).not.toHaveBeenCalled();
    expect(prisma.volunteerPosition.updateMany).not.toHaveBeenCalled();
  });
});
