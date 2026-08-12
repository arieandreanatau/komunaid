import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("test-integration-secret");
process.env.JWT_SECRET = "test-integration-secret";

vi.mock("@komunaid/database", () => {
  const prisma: any = {
    user: { findUnique: vi.fn() },
    userRole: { findMany: vi.fn() },
    communityMember: { findUnique: vi.fn() },
    volunteerProgram: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findUniqueOrThrow: vi.fn() },
    volunteerProgramOrganizerAccess: { findUnique: vi.fn(), upsert: vi.fn() },
    volunteerProgramApplication: { count: vi.fn() },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(async (fn: any) => typeof fn === "function" ? fn(prisma) : Promise.all(fn)),
  };
  return { prisma };
});

vi.mock("pino", () => ({ default: vi.fn(() => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn().mockReturnThis() })) }));
vi.mock("pino-pretty", () => ({ default: vi.fn(() => ({})) }));

import { prisma } from "@komunaid/database";
import { invalidateRoleCache } from "../../src/middleware/rbac";
import app from "../../src/app";

const CSRF_TOKEN = "a".repeat(64);

async function token(id: string, roles: string[] = ["MEMBER"]) {
  return new SignJWT({ sub: id, email: `${id}@test.local`, name: id, username: id, roles, type: "access" })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("15m").sign(JWT_SECRET);
}

function authHeaders(accessToken: string, mutation = false): Record<string, string> {
  if (mutation) {
    return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "Content-Length": "1024", Cookie: `csrf_token=${CSRF_TOKEN}`, "X-CSRF-Token": CSRF_TOKEN };
  }
  return { Authorization: `Bearer ${accessToken}` };
}

function program(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-08-01T00:00:00.000Z");
  return {
    id: "program-1", organizerType: "INDEPENDENT", organizerUserId: "owner-1", status: "REVISION_REQUIRED", reviewedAt: now, updatedAt: now,
    deletedAt: null, capacity: 10, registrationDeadline: null, startDate: new Date("2026-09-01T00:00:00.000Z"), endDate: new Date("2026-09-02T00:00:00.000Z"),
    reviewNote: "Lengkapi lokasi", accesses: [], _count: { applications: 0 }, community: null, organizerUser: { id: "owner-1", name: "Owner", avatar: null },
    ...overrides,
  };
}

describe("Volunteer program route authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ["coordinator-1", "owner-1", "self-admin", "admin-2"].forEach(invalidateRoleCache);
    (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });
    (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
    (prisma.volunteerProgram.findMany as any).mockResolvedValue([]);
    (prisma.volunteerProgramApplication.count as any).mockResolvedValue(0);
    (prisma.auditLog.create as any).mockResolvedValue({});
  });

  it("isolates coordinator community program discovery", async () => {
    const accessToken = await token("coordinator-1");
    (prisma.communityMember.findUnique as any).mockImplementation(({ where }: any) => where.communityId_userId.communityId === "community-a" ? { role: "VOLUNTEER_COORDINATOR", status: "ACTIVE", deletedAt: null } : null);
    const denied = await app.request("/api/v1/volunteer-programs/communities/community-b", { headers: authHeaders(accessToken) });
    expect(denied.status).toBe(403);
    expect(prisma.volunteerProgram.findMany).not.toHaveBeenCalled();
    const allowed = await app.request("/api/v1/volunteer-programs/communities/community-a", { headers: authHeaders(accessToken) });
    expect(allowed.status).toBe(200);
    expect(prisma.volunteerProgram.findMany).toHaveBeenCalledWith({ where: { communityId: "community-a", organizerType: "COMMUNITY", deletedAt: null }, include: { _count: { select: { applications: true } } }, orderBy: { updatedAt: "desc" } });
  });

  it("rejects superadmin self-review before mutation", async () => {
    const accessToken = await token("self-admin", ["SUPER_ADMIN"]);
    (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
    (prisma.volunteerProgram.findUnique as any).mockResolvedValue(program({ organizerUserId: "self-admin", status: "UNDER_REVIEW" }));
    const response = await app.request("/api/v1/volunteer-programs/program-1/review", { method: "POST", headers: authHeaders(accessToken, true), body: JSON.stringify({ action: "APPROVE" }) });
    expect(response.status).toBe(403);
    expect(prisma.volunteerProgram.updateMany).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("requires saved revision before resubmit", async () => {
    const accessToken = await token("owner-1");
    const current = program();
    (prisma.volunteerProgram.findUnique as any).mockImplementation(async () => current);
    (prisma.volunteerProgram.update as any).mockImplementation(async ({ data }: any) => Object.assign(current, data, { updatedAt: new Date("2026-08-02T00:00:00.000Z") }));
    const blocked = await app.request("/api/v1/volunteer-programs/program-1/resubmit", { method: "POST", headers: authHeaders(accessToken, true) });
    expect(blocked.status).toBe(400);
    const update = await app.request("/api/v1/volunteer-programs/program-1", { method: "PATCH", headers: authHeaders(accessToken, true), body: JSON.stringify({ description: "Deskripsi proposal sudah direvisi sesuai arahan." }) });
    expect(update.status).toBe(200);
    const resubmitted = await app.request("/api/v1/volunteer-programs/program-1/resubmit", { method: "POST", headers: authHeaders(accessToken, true) });
    expect(resubmitted.status).toBe(200);
    expect(prisma.volunteerProgram.update).toHaveBeenLastCalledWith({ where: { id: "program-1" }, data: { status: "UNDER_REVIEW", reviewNote: null } });
  });

  it("returns conflict when another superadmin already reviewed proposal", async () => {
    const accessToken = await token("admin-2", ["SUPER_ADMIN"]);
    (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
    (prisma.volunteerProgram.findUnique as any).mockResolvedValue(program({ status: "UNDER_REVIEW", organizerUserId: "owner-1" }));
    (prisma.volunteerProgram.updateMany as any).mockResolvedValue({ count: 0 });
    const response = await app.request("/api/v1/volunteer-programs/program-1/review", { method: "POST", headers: authHeaders(accessToken, true), body: JSON.stringify({ action: "APPROVE", note: "Disetujui" }) });
    expect(response.status).toBe(409);
    expect(prisma.volunteerProgram.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(prisma.volunteerProgramOrganizerAccess.upsert).not.toHaveBeenCalled();
  });
});
