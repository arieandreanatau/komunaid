import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@komunaid/database", () => {
  const mockPrisma = {
    userRole: { findMany: vi.fn().mockResolvedValue([]) },
    communityMember: { findUnique: vi.fn() },
    organizationMember: { findUnique: vi.fn() },
  };
  return { prisma: mockPrisma };
});

import {
  requireCommunityOwner,
  requireCommunityAdmin,
  requireOrganizationOwner,
  requireOrganizationAdmin,
} from "../../../src/middleware/rbac";
import { prisma } from "@komunaid/database";

describe("Community & Organization RBAC Middleware", () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext = vi.fn();
    mockContext = {
      get: vi.fn((key: string) => {
        if (key === "user") return { id: "user-1" };
        return undefined;
      }),
      req: {
        param: vi.fn((name: string) => {
          if (name === "communityId") return "comm-1";
          if (name === "organizationId") return "org-1";
          return undefined;
        }),
        query: vi.fn(),
      },
    };
  });

  describe("requireCommunityOwner", () => {
    it("should pass when user is OWNER with ACTIVE status", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "OWNER",
        status: "ACTIVE",
      });
      await requireCommunityOwner(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw Forbidden when no user", async () => {
      mockContext.get.mockReturnValue(undefined);
      await expect(requireCommunityOwner(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when no communityId", async () => {
      mockContext.req.param.mockReturnValue(undefined);
      mockContext.req.query.mockReturnValue(undefined);
      await expect(requireCommunityOwner(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when no membership found", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);
      await expect(requireCommunityOwner(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when role is ADMIN", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "ADMIN",
        status: "ACTIVE",
      });
      await expect(requireCommunityOwner(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when status is SUSPENDED", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "OWNER",
        status: "SUSPENDED",
      });
      await expect(requireCommunityOwner(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should fall back to query param for communityId", async () => {
      mockContext.req.param.mockReturnValue(undefined);
      mockContext.req.query.mockReturnValue("comm-query");
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "OWNER",
        status: "ACTIVE",
      });
      await requireCommunityOwner(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(prisma.communityMember.findUnique).toHaveBeenCalledWith({
        where: {
          communityId_userId: {
            communityId: "comm-query",
            userId: "user-1",
          },
        },
      });
    });
  });

  describe("requireCommunityAdmin", () => {
    it("should pass when user is OWNER with ACTIVE status", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "OWNER",
        status: "ACTIVE",
      });
      await requireCommunityAdmin(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should pass when user is ADMIN with ACTIVE status", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "ADMIN",
        status: "ACTIVE",
      });
      await requireCommunityAdmin(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw Forbidden when role is MEMBER", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "MEMBER",
        status: "ACTIVE",
      });
      await expect(requireCommunityAdmin(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when status is not ACTIVE", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "ADMIN",
        status: "SUSPENDED",
      });
      await expect(requireCommunityAdmin(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when no membership", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);
      await expect(requireCommunityAdmin(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });
  });

  describe("requireOrganizationOwner", () => {
    it("should pass when user is OWNER with ACTIVE status", async () => {
      (prisma.organizationMember.findUnique as any).mockResolvedValue({
        role: "OWNER",
        status: "ACTIVE",
      });
      await requireOrganizationOwner(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw Forbidden when no user", async () => {
      mockContext.get.mockReturnValue(undefined);
      await expect(requireOrganizationOwner(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when no membership", async () => {
      (prisma.organizationMember.findUnique as any).mockResolvedValue(null);
      await expect(requireOrganizationOwner(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when role is ADMIN", async () => {
      (prisma.organizationMember.findUnique as any).mockResolvedValue({
        role: "ADMIN",
        status: "ACTIVE",
      });
      await expect(requireOrganizationOwner(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should fall back to query param for organizationId", async () => {
      mockContext.req.param.mockReturnValue(undefined);
      mockContext.req.query.mockReturnValue("org-query");
      (prisma.organizationMember.findUnique as any).mockResolvedValue({
        role: "OWNER",
        status: "ACTIVE",
      });
      await requireOrganizationOwner(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(prisma.organizationMember.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_userId: {
            organizationId: "org-query",
            userId: "user-1",
          },
        },
      });
    });
  });

  describe("requireOrganizationAdmin", () => {
    it("should pass when OWNER with ACTIVE", async () => {
      (prisma.organizationMember.findUnique as any).mockResolvedValue({
        role: "OWNER",
        status: "ACTIVE",
      });
      await requireOrganizationAdmin(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should pass when ADMIN with ACTIVE", async () => {
      (prisma.organizationMember.findUnique as any).mockResolvedValue({
        role: "ADMIN",
        status: "ACTIVE",
      });
      await requireOrganizationAdmin(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw Forbidden when MEMBER", async () => {
      (prisma.organizationMember.findUnique as any).mockResolvedValue({
        role: "MEMBER",
        status: "ACTIVE",
      });
      await expect(requireOrganizationAdmin(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("should throw Forbidden when status not ACTIVE", async () => {
      (prisma.organizationMember.findUnique as any).mockResolvedValue({
        role: "ADMIN",
        status: "INACTIVE",
      });
      await expect(requireOrganizationAdmin(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });
  });
});
