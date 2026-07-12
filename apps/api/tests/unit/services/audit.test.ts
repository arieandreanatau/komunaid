import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@komunaid/database", () => {
  const handlers: Record<string, any> = {
    create: vi.fn(async ({ data }: any) => ({ id: "audit-1", createdAt: new Date(), ...data })),
    findMany: vi.fn(async () => []),
    count: vi.fn(async () => 0),
  };
  const prisma: any = new Proxy({}, {
    get(_: any, table: string) { return handlers; },
  });
  return { prisma };
});

import { createAuditLog, getAuditLogs, AuditActions } from "../../../src/services/audit";
import { prisma } from "@komunaid/database";

describe("Audit Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAuditLog", () => {
    it("should create an audit log entry", async () => {
      await createAuditLog({
        userId: "user-1",
        actionType: "USER_REGISTER",
        resourceName: "User",
        resourceId: "user-1",
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          actionType: "USER_REGISTER",
          resourceName: "User",
          resourceId: "user-1",
        }),
      });
    });

    it("should include beforeData when provided", async () => {
      await createAuditLog({
        userId: "user-1",
        actionType: "USER_UPDATE",
        resourceName: "User",
        resourceId: "user-1",
        beforeData: { name: "Old Name" },
        afterData: { name: "New Name" },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          beforeData: { name: "Old Name" },
          afterData: { name: "New Name" },
        }),
      });
    });

    it("should include ipAddress when provided", async () => {
      await createAuditLog({
        userId: "user-1",
        actionType: "USER_LOGIN",
        resourceName: "User",
        resourceId: "user-1",
        ipAddress: "127.0.0.1",
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ ipAddress: "127.0.0.1" }),
      });
    });

    it("should not throw when prisma fails", async () => {
      (prisma.auditLog.create as any).mockRejectedValue(new Error("DB error"));
      await expect(
        createAuditLog({
          userId: "user-1",
          actionType: "TEST",
          resourceName: "Test",
          resourceId: "1",
        })
      ).resolves.toBeUndefined();
    });

    it("should handle null beforeData/afterData", async () => {
      await createAuditLog({
        userId: "user-1",
        actionType: "TEST",
        resourceName: "Test",
        resourceId: "1",
        beforeData: null,
        afterData: null,
      });

      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("getAuditLogs", () => {
    it("should return paginated audit logs", async () => {
      (prisma.auditLog.findMany as any).mockResolvedValue([
        { id: "log-1", actionType: "USER_LOGIN" },
      ]);
      (prisma.auditLog.count as any).mockResolvedValue(1);

      const result = await getAuditLogs({ page: 1, limit: 10 });

      expect(result.logs).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it("should filter by resourceName", async () => {
      await getAuditLogs({ resourceName: "User" });
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ resourceName: "User" }),
        })
      );
    });

    it("should filter by resourceId", async () => {
      await getAuditLogs({ resourceId: "user-1" });
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ resourceId: "user-1" }),
        })
      );
    });

    it("should filter by userId", async () => {
      await getAuditLogs({ userId: "user-1" });
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: "user-1" }),
        })
      );
    });

    it("should filter by actionType", async () => {
      await getAuditLogs({ actionType: "USER_LOGIN" });
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ actionType: "USER_LOGIN" }),
        })
      );
    });

    it("should use default pagination", async () => {
      await getAuditLogs({});
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        })
      );
    });

    it("should calculate total pages correctly", async () => {
      (prisma.auditLog.count as any).mockResolvedValue(55);
      const result = await getAuditLogs({ limit: 10 });
      expect(result.totalPages).toBe(6);
    });
  });

  describe("AuditActions", () => {
    it("should have user actions", () => {
      expect(AuditActions.USER_REGISTER).toBe("USER_REGISTER");
      expect(AuditActions.USER_LOGIN).toBe("USER_LOGIN");
      expect(AuditActions.USER_LOGOUT).toBe("USER_LOGOUT");
    });

    it("should have community actions", () => {
      expect(AuditActions.COMMUNITY_CREATE).toBe("COMMUNITY_CREATE");
      expect(AuditActions.COMMUNITY_APPROVE).toBe("COMMUNITY_APPROVE");
    });

    it("should have event actions", () => {
      expect(AuditActions.EVENT_CREATE).toBe("EVENT_CREATE");
      expect(AuditActions.EVENT_PUBLISH).toBe("EVENT_PUBLISH");
    });

    it("should have admin actions", () => {
      expect(AuditActions.ROLE_CHANGE).toBe("ROLE_CHANGE");
      expect(AuditActions.FORCE_LOGOUT).toBe("FORCE_LOGOUT");
    });

    it("should be immutable - no update/delete functions", () => {
      expect((AuditActions as any).updateAuditLog).toBeUndefined();
      expect((AuditActions as any).deleteAuditLog).toBeUndefined();
    });
  });
});
