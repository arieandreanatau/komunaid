import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@komunaid/database", () => {
  const mockPrisma = {
    userRole: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    communityMember: {
      findUnique: vi.fn(),
    },
    organizationMember: {
      findUnique: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import {
  requireRole,
  requireAnyRole,
  requireSuperAdmin,
  requirePlatformAdmin,
  invalidateRoleCache,
} from "../../../src/middleware/rbac";
import { prisma } from "@komunaid/database";

describe("RBAC Middleware", () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    mockNext = vi.fn();
    mockContext = {
      get: vi.fn((key: string) => {
        if (key === "user") return { id: `user-${Date.now()}-${Math.random()}` };
        return undefined;
      }),
      set: vi.fn(),
      req: {
        param: vi.fn(),
        query: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("requireRole", () => {
    it("should throw Unauthorized when no user", async () => {
      mockContext.get.mockReturnValue(undefined);
      const middleware = requireRole("SUPER_ADMIN");
      await expect(middleware(mockContext, mockNext)).rejects.toThrow("Unauthorized");
    });

    it("should throw Forbidden when user lacks required role", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      const middleware = requireRole("SUPER_ADMIN");
      await expect(middleware(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should call next when user has required role", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
      const middleware = requireRole("SUPER_ADMIN");
      await middleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should accept any of multiple roles", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      const middleware = requireRole("SUPER_ADMIN", "PLATFORM_ADMIN");
      await middleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should set userRoles in context", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
      const middleware = requireRole("SUPER_ADMIN");
      await middleware(mockContext, mockNext);
      expect(mockContext.set).toHaveBeenCalledWith("userRoles", ["SUPER_ADMIN"]);
    });
  });

  describe("requireAnyRole", () => {
    it("should be an alias for requireRole", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      const middleware = requireAnyRole("SUPER_ADMIN");
      await expect(middleware(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should pass when user has one of the roles", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      const middleware = requireAnyRole("MEMBER", "PLATFORM_ADMIN");
      await middleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("requireSuperAdmin", () => {
    it("should require SUPER_ADMIN role", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      await expect(requireSuperAdmin()(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should pass for SUPER_ADMIN", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
      await requireSuperAdmin()(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("requirePlatformAdmin", () => {
    it("should accept SUPER_ADMIN", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);
      await requirePlatformAdmin()(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should accept PLATFORM_ADMIN", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "PLATFORM_ADMIN" }]);
      await requirePlatformAdmin()(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject MEMBER", async () => {
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);
      await expect(requirePlatformAdmin()(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });
  });

  describe("Role caching", () => {
    it("should cache roles and not query DB again within TTL", async () => {
      const stableUserId = `cache-test-${Date.now()}`;
      mockContext.get.mockReturnValue({ id: stableUserId });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      const middleware = requireRole("MEMBER");
      await middleware(mockContext, mockNext);
      expect(prisma.userRole.findMany).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(5000);
      mockNext.mockClear();
      (prisma.userRole.findMany as any).mockClear();
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      await middleware(mockContext, mockNext);
      expect(prisma.userRole.findMany).toHaveBeenCalledTimes(0);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should refresh cache after TTL expires", async () => {
      const stableUserId = `cache-refresh-${Date.now()}`;
      mockContext.get.mockReturnValue({ id: stableUserId });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      const middleware = requireRole("MEMBER");
      await middleware(mockContext, mockNext);

      vi.advanceTimersByTime(11000);
      mockNext.mockClear();
      (prisma.userRole.findMany as any).mockClear();
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "SUPER_ADMIN" }]);

      const middleware2 = requireRole("SUPER_ADMIN");
      await middleware2(mockContext, mockNext);
      expect(prisma.userRole.findMany).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("invalidateRoleCache", () => {
    it("should remove cached roles for user", async () => {
      const userId = `cache-inv-${Date.now()}`;
      mockContext.get.mockReturnValue({ id: userId });
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      const middleware = requireRole("MEMBER");
      await middleware(mockContext, mockNext);
      expect(prisma.userRole.findMany).toHaveBeenCalledTimes(1);

      invalidateRoleCache(userId);

      mockNext.mockClear();
      (prisma.userRole.findMany as any).mockClear();
      (prisma.userRole.findMany as any).mockResolvedValue([{ role: "MEMBER" }]);

      await middleware(mockContext, mockNext);
      expect(prisma.userRole.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
