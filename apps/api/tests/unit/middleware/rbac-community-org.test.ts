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
  requireCommunityOfficer,
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
      set: vi.fn(),
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

    it("should throw Forbidden when membership is deleted", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "OWNER", status: "ACTIVE", deletedAt: new Date(),
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

  describe("requireCommunityOfficer", () => {
    it("passes and stashes the role for OWNER", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "OWNER",
        status: "ACTIVE",
      });
      await requireCommunityOfficer(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith("communityRole", "OWNER");
    });

    it("passes and stashes the role for ADMIN", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "ADMIN",
        status: "ACTIVE",
      });
      await requireCommunityOfficer(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith("communityRole", "ADMIN");
    });

    it("passes and stashes the role for EVENT_MANAGER (ticket #14, spec #12)", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "EVENT_MANAGER",
        status: "ACTIVE",
      });
      await requireCommunityOfficer(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith("communityRole", "EVENT_MANAGER");
    });

    it("passes and stashes the role for VOLUNTEER_COORDINATOR (ticket #14, spec #12)", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "VOLUNTEER_COORDINATOR",
        status: "ACTIVE",
      });
      await requireCommunityOfficer(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith("communityRole", "VOLUNTEER_COORDINATOR");
    });

    it("throws Forbidden and never calls next for a plain MEMBER", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "MEMBER",
        status: "ACTIVE",
      });
      await expect(requireCommunityOfficer(mockContext, mockNext)).rejects.toThrow("Forbidden");
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockContext.set).not.toHaveBeenCalled();
    });

    it("throws Forbidden when no membership is found (non-member)", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue(null);
      await expect(requireCommunityOfficer(mockContext, mockNext)).rejects.toThrow("Forbidden");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("throws Forbidden when no user", async () => {
      mockContext.get.mockReturnValue(undefined);
      await expect(requireCommunityOfficer(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("throws Forbidden when status is not ACTIVE, even for an officer role", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "EVENT_MANAGER",
        status: "SUSPENDED",
      });
      await expect(requireCommunityOfficer(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("throws Forbidden when the membership is soft-deleted, even for an officer role", async () => {
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "VOLUNTEER_COORDINATOR",
        status: "ACTIVE",
        deletedAt: new Date(),
      });
      await expect(requireCommunityOfficer(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });

    it("falls back to the query param for communityId", async () => {
      mockContext.req.param.mockReturnValue(undefined);
      mockContext.req.query.mockReturnValue("comm-query");
      (prisma.communityMember.findUnique as any).mockResolvedValue({
        role: "ADMIN",
        status: "ACTIVE",
      });
      await requireCommunityOfficer(mockContext, mockNext);
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

    it("should throw Forbidden when membership is deleted", async () => {
      (prisma.organizationMember.findUnique as any).mockResolvedValue({
        role: "ADMIN", status: "ACTIVE", deletedAt: new Date(),
      });
      await expect(requireOrganizationAdmin(mockContext, mockNext)).rejects.toThrow("Forbidden");
    });
  });
});
