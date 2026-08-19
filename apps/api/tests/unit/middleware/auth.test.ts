import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHash, randomBytes } from "crypto";

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
  generateResetToken,
  verifyToken,
  verifyTokenWithVersion,
  setTokenCookies,
  clearTokenCookies,
  authMiddleware,
  optionalAuthMiddleware,
  ensureSecrets,
} from "../../../src/middleware/auth";

describe("Auth Middleware", () => {
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

  describe("generateAccessToken", () => {
    it("should generate a valid JWT access token", async () => {
      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("should include tokenVersion in payload when provided", async () => {
      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        5
      );
      const payload = await verifyToken(token);
      expect(payload.tokenVersion).toBe(5);
    });

    it("should not include tokenVersion when undefined", async () => {
      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      const payload = await verifyToken(token);
      expect(payload.tokenVersion).toBeUndefined();
    });

    it("should set type to access", async () => {
      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      const payload = await verifyToken(token);
      expect(payload.type).toBe("access");
    });

    it("should embed user id as sub", async () => {
      const token = await generateAccessToken({
        id: "user-42",
        email: "a@b.com",
        name: "A",
        username: "a42",
      });
      const payload = await verifyToken(token);
      expect(payload.sub).toBe("user-42");
    });
  });

  describe("generateResetToken", () => {
    it("should generate a reset token with type reset", async () => {
      const token = await generateResetToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      }, 4);
      const payload = await verifyToken(token);
      expect(payload.type).toBe("reset");
      expect(payload.tokenVersion).toBe(4);
    });

    it("should include email in payload", async () => {
      const token = await generateResetToken({
        id: "user-1",
        email: "reset@test.com",
        name: "Test",
        username: "testuser",
      }, 0);
      const payload = await verifyToken(token);
      expect(payload.email).toBe("reset@test.com");
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", async () => {
      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      const payload = await verifyToken(token);
      expect(payload).toBeDefined();
      expect(payload.sub).toBe("user-1");
    });

    it("should reject an invalid token", async () => {
      await expect(verifyToken("invalid.token.here")).rejects.toThrow();
    });

    it("should reject an empty string token", async () => {
      await expect(verifyToken("")).rejects.toThrow();
    });

    it("should reject a tampered token", async () => {
      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      const tampered = token.slice(0, -5) + "XXXXX";
      await expect(verifyToken(tampered)).rejects.toThrow();
    });
  });

  describe("verifyTokenWithVersion", () => {
    it("should verify when versions match", async () => {
      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        3
      );
      const payload = await verifyTokenWithVersion(token, 3);
      expect(payload.tokenVersion).toBe(3);
    });

    it("should throw when versions mismatch", async () => {
      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        1
      );
      await expect(verifyTokenWithVersion(token, 5)).rejects.toThrow("Token version mismatch");
    });

    it("should succeed when token has no version and user version provided", async () => {
      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      const payload = await verifyTokenWithVersion(token, 0);
      expect(payload).toBeDefined();
    });
  });

  describe("setTokenCookies", () => {
    it("should set access token cookie and refresh token cookie", () => {
      setTokenCookies(mockContext, "access-token", "refresh-hash");
      expect(mockContext.header).toHaveBeenCalled();
      const calls = mockContext.header.mock.calls;
      expect(calls.length).toBeGreaterThanOrEqual(2);
    });

    it("should use httpOnly for access token", () => {
      setTokenCookies(mockContext, "access-token", "refresh-hash");
      const calls = mockContext.header.mock.calls;
      const accessCookie = calls.find((c: any) => c[0] === "Set-Cookie" && c[1]?.includes("token=access-token"));
      expect(accessCookie).toBeDefined();
      expect(accessCookie[1]).toContain("HttpOnly");
    });

    it("should set path / for access token", () => {
      setTokenCookies(mockContext, "access-token", "refresh-hash");
      const calls = mockContext.header.mock.calls;
      const accessCookie = calls.find((c: any) => c[0] === "Set-Cookie" && c[1]?.includes("token=access-token"));
      expect(accessCookie[1]).toContain("Path=/");
    });

    it("should set path /api/v1/auth/refresh for refresh token", () => {
      setTokenCookies(mockContext, "access-token", "refresh-hash");
      const calls = mockContext.header.mock.calls;
      const refreshCookie = calls.find((c: any) => c[0] === "Set-Cookie" && c[1]?.includes("refreshToken=refresh-hash"));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie[1]).toContain("Path=/api/v1/auth/refresh");
    });

    it("should set lax sameSite", () => {
      setTokenCookies(mockContext, "access-token", "refresh-hash");
      const calls = mockContext.header.mock.calls;
      for (const call of calls) {
        if (call[0] === "Set-Cookie") {
          expect(call[1]).toContain("SameSite=Lax");
        }
      }
    });
  });

  describe("clearTokenCookies", () => {
    it("should clear access and refresh tokens with maxAge=0", () => {
      clearTokenCookies(mockContext);
      const calls = mockContext.header.mock.calls;
      const accessClear = calls.find((c: any) => c[0] === "Set-Cookie" && c[1]?.includes("token=;"));
      expect(accessClear).toBeDefined();
      expect(accessClear[1]).toContain("Max-Age=0");
    });

    it("should clear refresh token from root path too", () => {
      clearTokenCookies(mockContext);
      const calls = mockContext.header.mock.calls;
      const rootRefresh = calls.find(
        (c: any) => c[0] === "Set-Cookie" && c[1]?.includes("refreshToken=;") && c[1]?.includes("Path=/") && !c[1]?.includes("/api/")
      );
      expect(rootRefresh).toBeDefined();
    });

    it("should make 3 Set-Cookie calls total", () => {
      clearTokenCookies(mockContext);
      const cookieCalls = mockContext.header.mock.calls.filter((c: any) => c[0] === "Set-Cookie");
      expect(cookieCalls).toHaveLength(3);
    });
  });

  describe("authMiddleware", () => {
    it("should throw Unauthorized when no token provided", async () => {
      await expect(authMiddleware(mockContext, mockNext)).rejects.toThrow("Unauthorized");
    });

    it("should throw Unauthorized for invalid token in cookie", async () => {
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Cookie") return "token=invalid.token.value";
        return undefined;
      });
      await expect(authMiddleware(mockContext, mockNext)).rejects.toThrow();
    });

    it("should throw Unauthorized for non-access token type", async () => {
      const resetToken = await generateResetToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      }, 0);
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Cookie") return `token=${resetToken}`;
        return undefined;
      });
      await expect(authMiddleware(mockContext, mockNext)).rejects.toThrow("Unauthorized");
    });

    it("should call next when valid Bearer token provided", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE" });

      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        0
      );
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return `Bearer ${token}`;
        return undefined;
      });

      await authMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith("user", expect.objectContaining({
        id: "user-1",
        email: "test@test.com",
      }));
    });

    it("should throw Unauthorized when user not found in DB", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return `Bearer ${token}`;
        return undefined;
      });

      await expect(authMiddleware(mockContext, mockNext)).rejects.toThrow("Unauthorized");
    });

    it("should throw Unauthorized for soft-deleted user (deletedAt set)", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({
        tokenVersion: 0,
        status: "ACTIVE",
        deletedAt: new Date("2026-01-01T00:00:00Z"),
      });

      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        0
      );
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return `Bearer ${token}`;
        return undefined;
      });

      await expect(authMiddleware(mockContext, mockNext)).rejects.toThrow("Unauthorized");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw Forbidden for suspended user", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({
        tokenVersion: 0,
        status: "SUSPENDED",
        deletedAt: null,
      });

      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        0
      );
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return `Bearer ${token}`;
        return undefined;
      });

      await expect(authMiddleware(mockContext, mockNext)).rejects.toThrow("Forbidden");
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuthMiddleware", () => {
    it("should call next without setting user when no token", async () => {
      await optionalAuthMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).not.toHaveBeenCalled();
    });

    it("should set user when valid token provided", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({ tokenVersion: 0, status: "ACTIVE", deletedAt: null });

      const token = await generateAccessToken({
        id: "user-1",
        email: "test@test.com",
        name: "Test",
        username: "testuser",
      });
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return `Bearer ${token}`;
        return undefined;
      });

      await optionalAuthMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).toHaveBeenCalledWith("user", expect.objectContaining({ id: "user-1" }));
    });

    it("should continue without user when token is invalid", async () => {
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return "Bearer bad.token.here";
        return undefined;
      });

      await optionalAuthMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).not.toHaveBeenCalled();
    });

    it("should continue without user for soft-deleted user (deletedAt set)", async () => {
      const { prisma } = await import("@komunaid/database");
      (prisma.user.findUnique as any).mockResolvedValue({
        tokenVersion: 0,
        status: "ACTIVE",
        deletedAt: new Date("2026-01-01T00:00:00Z"),
      });

      const token = await generateAccessToken(
        { id: "user-1", email: "test@test.com", name: "Test", username: "testuser" },
        0
      );
      mockContext.req.header.mockImplementation((name: string) => {
        if (name === "Authorization") return `Bearer ${token}`;
        return undefined;
      });

      await optionalAuthMiddleware(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockContext.set).not.toHaveBeenCalled();
    });
  });

  describe("ensureSecrets", () => {
    it("should not throw when called", () => {
      expect(() => ensureSecrets()).not.toThrow();
    });
  });
});
