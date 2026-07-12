import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.JWT_SECRET = "test-unit-secret-key-for-jwt";

vi.mock("@komunaid/database", () => {
  const handlers: Record<string, any> = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
  };
  const prisma: any = new Proxy({}, {
    get(_: any, table: string) { return handlers; },
  });
  return { prisma };
});

import {
  generateAccessToken,
  authMiddleware,
  optionalAuthMiddleware,
  getRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} from "../../../src/middleware/auth";

describe("Auth Middleware - Additional Coverage", () => {
  let mockContext: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext = vi.fn();
    mockContext = {
      req: {
        header: vi.fn((name: string) => {
          if (name === "Cookie") return undefined;
          if (name === "Authorization") return undefined;
          return undefined;
        }),
      },
      header: vi.fn(),
      set: vi.fn(),
      get: vi.fn(),
    };
  });

  describe("getRefreshToken", () => {
    it("should return refresh token from cookie", () => {
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Cookie") return "refreshToken=rt-abc-123";
        return undefined;
      });
      expect(getRefreshToken(mockContext)).toBe("rt-abc-123");
    });

    it("should return null when no cookie header", () => {
      expect(getRefreshToken(mockContext)).toBeNull();
    });

    it("should return null when no refreshToken in cookie", () => {
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Cookie") return "otherCookie=value";
        return undefined;
      });
      expect(getRefreshToken(mockContext)).toBeNull();
    });
  });

  describe("authMiddleware with cookie token", () => {
    it("should pass when valid access token in cookie", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });

      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        0
      );
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Cookie") return `token=${token}`;
        return undefined;
      });

      await authMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should set user from cookie token", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });

      const token = await generateAccessToken(
        { id: "user-42", email: "cookie@test.com", name: "Cookie", username: "cookieuser" },
        0
      );
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Cookie") return `token=${token}`;
        return undefined;
      });

      await authMiddleware(mockContext, mockNext);
      expect(mockContext.set).toHaveBeenCalledWith("user", expect.objectContaining({
        id: "user-42",
        email: "cookie@test.com",
        name: "Cookie",
        username: "cookieuser",
      }));
    });
  });

  describe("optionalAuthMiddleware with cookie", () => {
    it("should set user when valid token in cookie", async () => {
      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Cookie") return `token=${token}`;
        return undefined;
      });

      await optionalAuthMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith("user", expect.objectContaining({ id: "user-1" }));
    });

    it("should continue when invalid cookie token", async () => {
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Cookie") return "token=invalid.token.here";
        return undefined;
      });

      await optionalAuthMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).not.toHaveBeenCalled();
    });
  });

  describe("authMiddleware with token version mismatch", () => {
    it("should throw when token version does not match DB version", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 5, status: "ACTIVE" });

      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        2
      );
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return `Bearer ${token}`;
        return undefined;
      });

      await expect(authMiddleware(mockContext, mockNext)).rejects.toThrow("Unauthorized");
    });

    it("should pass when token version matches DB version", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 3, status: "ACTIVE" });

      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        3
      );
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return `Bearer ${token}`;
        return undefined;
      });

      await authMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("clearTokenCookies", () => {
    it("should clear all 3 cookies", () => {
      clearTokenCookies(mockContext);
      const cookieCalls = mockContext.header.mock.calls.filter((c: any) => c[0] === "Set-Cookie");
      expect(cookieCalls).toHaveLength(3);
    });

    it("should clear access token cookie with maxAge=0", () => {
      clearTokenCookies(mockContext);
      const calls = mockContext.header.mock.calls;
      const accessClear = calls.find((c: any) => c[0] === "Set-Cookie" && c[1]?.includes("token=;"));
      expect(accessClear).toBeDefined();
      expect(accessClear[1]).toContain("Max-Age=0");
      expect(accessClear[1]).toContain("Path=/");
    });

    it("should clear refresh token from api path", () => {
      clearTokenCookies(mockContext);
      const calls = mockContext.header.mock.calls;
      const apiRefresh = calls.find(
        (c: any) => c[0] === "Set-Cookie" && c[1]?.includes("refreshToken=;") && c[1]?.includes("/api/v1/auth/refresh")
      );
      expect(apiRefresh).toBeDefined();
    });

    it("should clear refresh token from root path", () => {
      clearTokenCookies(mockContext);
      const calls = mockContext.header.mock.calls;
      const rootRefresh = calls.find(
        (c: any) => c[0] === "Set-Cookie" && c[1]?.includes("refreshToken=;") && c[1]?.includes("Path=/") && !c[1]?.includes("/api/")
      );
      expect(rootRefresh).toBeDefined();
    });
  });
});
