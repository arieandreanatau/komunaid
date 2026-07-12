import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@komunaid/database", () => {
  const handlers: Record<string, any> = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    groupBy: vi.fn(async () => []),
    $transaction: vi.fn(async (fn: any) => {
      if (typeof fn === "function") {
        const tx = new Proxy(handlers, {
          get(target: any, prop: string) {
            return target[prop] || vi.fn();
          },
        });
        return fn(tx);
      }
      return Promise.all(fn);
    }),
  };
  const prisma = new Proxy({} as any, {
    get(_: any, table: string) {
      if (table.startsWith("$")) {
        return handlers[table] || vi.fn();
      }
      return handlers;
    },
  });

  return { prisma };
});

vi.mock("../../../src/lib/logger", () => ({
  createChildLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

import { getActiveSessions, revokeSession } from "../../../src/services/refresh-token";
import { prisma } from "@komunaid/database";

describe("Refresh Token - Sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveSessions", () => {
    it("should return mapped sessions with correct fields", async () => {
      const mockSessions = [
        {
          id: "sess-1",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          fingerprint: "fp-1",
          createdAt: new Date("2025-01-15"),
        },
      ];
      (prisma.refreshToken.findMany as any).mockResolvedValue(mockSessions);

      const result = await getActiveSessions("user-1");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "sess-1",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
        fingerprint: "fp-1",
        createdAt: new Date("2025-01-15"),
      });
    });

    it("should return empty array when no sessions", async () => {
      (prisma.refreshToken.findMany as any).mockResolvedValue([]);

      const result = await getActiveSessions("user-1");

      expect(result).toEqual([]);
    });

    it("should query with isRevoked=false and expiresAt > now", async () => {
      (prisma.refreshToken.findMany as any).mockResolvedValue([]);

      await getActiveSessions("user-1");

      expect(prisma.refreshToken.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
            isRevoked: false,
            expiresAt: expect.objectContaining({ gt: expect.any(Date) }),
          }),
        })
      );
    });

    it("should map null optional fields to undefined", async () => {
      const mockSessions = [
        {
          id: "sess-1",
          ipAddress: null,
          userAgent: null,
          fingerprint: null,
          createdAt: new Date("2025-01-15"),
        },
      ];
      (prisma.refreshToken.findMany as any).mockResolvedValue(mockSessions);

      const result = await getActiveSessions("user-1");

      expect(result[0].ipAddress).toBeUndefined();
      expect(result[0].userAgent).toBeUndefined();
      expect(result[0].fingerprint).toBeUndefined();
    });

    it("should query with distinct on familyId and order by createdAt desc", async () => {
      (prisma.refreshToken.findMany as any).mockResolvedValue([]);

      await getActiveSessions("user-1");

      expect(prisma.refreshToken.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          distinct: ["familyId"],
          orderBy: { createdAt: "desc" },
        })
      );
    });
  });

  describe("revokeSession", () => {
    it("should return true when session found and family revoked", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        familyId: "fam-1",
        isRevoked: false,
        userId: "user-1",
      });
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 3 });

      const result = await revokeSession("sess-1");

      expect(result).toBe(true);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: "fam-1", isRevoked: false },
        data: { isRevoked: true },
      });
    });

    it("should return false when session not found", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue(null);

      const result = await revokeSession("nonexistent-sess");

      expect(result).toBe(false);
    });

    it("should return false when userId doesn't match", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        familyId: "fam-1",
        isRevoked: false,
        userId: "user-1",
      });

      const result = await revokeSession("sess-1", "user-2");

      expect(result).toBe(false);
    });

    it("should proceed when userId matches", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        familyId: "fam-1",
        isRevoked: false,
        userId: "user-1",
      });
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 2 });

      const result = await revokeSession("sess-1", "user-1");

      expect(result).toBe(true);
    });

    it("should return false when family has no active tokens to revoke", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        familyId: "fam-1",
        isRevoked: false,
        userId: "user-1",
      });
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 0 });

      const result = await revokeSession("sess-1");

      expect(result).toBe(false);
    });

    it("should proceed when no userId is provided", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        familyId: "fam-3",
        isRevoked: false,
        userId: "user-1",
      });
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 1 });

      const result = await revokeSession("sess-1");

      expect(result).toBe(true);
    });
  });
});
