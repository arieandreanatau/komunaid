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
    $queryRaw: vi.fn(async () => []),
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

import {
  hashToken,
  createRefreshTokenFamily,
  rotateRefreshToken,
  revokeTokenFamily,
  revokeAllUserTokens,
  revokeToken,
  validateRefreshToken,
  cleanupExpiredTokens,
} from "../../../src/services/refresh-token";
import { prisma } from "@komunaid/database";
import { createHash } from "crypto";

describe("Refresh Token Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hashToken", () => {
    it("should hash a token with SHA-256", () => {
      const token = "my-refresh-token";
      const hash = hashToken(token);
      const expected = createHash("sha256").update(token).digest("hex");
      expect(hash).toBe(expected);
    });

    it("should produce consistent hashes", () => {
      const h1 = hashToken("token-123");
      const h2 = hashToken("token-123");
      expect(h1).toBe(h2);
    });

    it("should produce different hashes for different inputs", () => {
      const h1 = hashToken("token-a");
      const h2 = hashToken("token-b");
      expect(h1).not.toBe(h2);
    });

    it("should produce a hex string of 64 chars", () => {
      const hash = hashToken("test");
      expect(hash.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });
  });

  describe("createRefreshTokenFamily", () => {
    it("should create a new refresh token family", async () => {
      (prisma.refreshToken.create as any).mockResolvedValue({ id: "token-1" });

      const result = await createRefreshTokenFamily("user-1");

      expect(result.tokenHash).toBeDefined();
      expect(result.familyId).toBeDefined();
      expect(result.tokenHash.length).toBe(128);
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("should pass fingerprint and IP to the token record", async () => {
      (prisma.refreshToken.create as any).mockResolvedValue({ id: "token-1" });

      await createRefreshTokenFamily("user-1", "fp-1", "127.0.0.1", "Mozilla/5.0");

      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-1",
          fingerprint: "fp-1",
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        }),
      });
    });

    it("should revoke oldest families when limit exceeded", async () => {
      const families = Array.from({ length: 11 }, (_, i) => ({
        familyId: `fam-${i}`,
      }));

      (prisma.refreshToken.groupBy as any).mockResolvedValue(families);
      (prisma.refreshToken.findMany as any).mockResolvedValue([
        { familyId: "fam-0" },
      ]);
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 1 });
      (prisma.refreshToken.create as any).mockResolvedValue({ id: "new-token" });

      const result = await createRefreshTokenFamily("user-1");

      expect(result.tokenHash).toBeDefined();
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });
  });

  describe("rotateRefreshToken", () => {
    it("should rotate a valid token", async () => {
      const oldHash = hashToken("old-token");
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        id: "t1",
        tokenHash: oldHash,
        familyId: "fam-1",
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000),
      });
      (prisma.$transaction as any).mockResolvedValue([{ id: "updated" }, { id: "created" }]);

      const result = await rotateRefreshToken(oldHash, "user-1");

      expect(result.reused).toBe(false);
      expect(result.newTokenHash).toBeDefined();
      expect(result.familyId).toBe("fam-1");
    });

    it("should detect reuse when token is revoked", async () => {
      const oldHash = hashToken("revoked-token");
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        id: "t1",
        tokenHash: oldHash,
        familyId: "fam-1",
        isRevoked: true,
        expiresAt: new Date(Date.now() + 86400000),
      });
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 3 });

      const result = await rotateRefreshToken(oldHash, "user-1");

      expect(result.reused).toBe(true);
      expect(result.familyId).toBe("fam-1");
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });

    it("should return reused=true when token not found", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue(null);

      const result = await rotateRefreshToken("nonexistent", "user-1");

      expect(result.reused).toBe(true);
      expect(result.newTokenHash).toBe("");
    });

    it("should return reused=true when token is expired", async () => {
      const oldHash = hashToken("expired-token");
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        id: "t1",
        tokenHash: oldHash,
        familyId: "fam-1",
        isRevoked: false,
        expiresAt: new Date(Date.now() - 86400000),
      });

      const result = await rotateRefreshToken(oldHash, "user-1");

      expect(result.reused).toBe(true);
    });

    it("should revoke entire family on reuse detection", async () => {
      const oldHash = hashToken("stolen-token");
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        id: "t1",
        tokenHash: oldHash,
        familyId: "fam-2",
        isRevoked: true,
        expiresAt: new Date(Date.now() + 86400000),
      });
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 5 });

      const result = await rotateRefreshToken(oldHash, "user-1");

      expect(result.reused).toBe(true);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { familyId: "fam-2", isRevoked: false },
          data: { isRevoked: true },
        })
      );
    });
  });

  describe("revokeTokenFamily", () => {
    it("should revoke all tokens in a family", async () => {
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 3 });

      const count = await revokeTokenFamily("fam-1");

      expect(count).toBe(3);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { familyId: "fam-1", isRevoked: false },
        data: { isRevoked: true },
      });
    });

    it("should return 0 when no tokens to revoke", async () => {
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 0 });

      const count = await revokeTokenFamily("fam-empty");
      expect(count).toBe(0);
    });
  });

  describe("revokeAllUserTokens", () => {
    it("should revoke all tokens for a user", async () => {
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 5 });

      const count = await revokeAllUserTokens("user-1");

      expect(count).toBe(5);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", isRevoked: false },
        data: { isRevoked: true },
      });
    });
  });

  describe("revokeToken", () => {
    it("should revoke a specific token", async () => {
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 1 });

      const result = await revokeToken("some-hash");
      expect(result).toBe(true);
    });

    it("should return false when no token revoked", async () => {
      (prisma.refreshToken.updateMany as any).mockResolvedValue({ count: 0 });

      const result = await revokeToken("nonexistent-hash");
      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      (prisma.refreshToken.updateMany as any).mockRejectedValue(new Error("DB error"));

      const result = await revokeToken("error-hash");
      expect(result).toBe(false);
    });
  });

  describe("validateRefreshToken", () => {
    it("should return valid for active non-expired token", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        userId: "user-1",
        familyId: "fam-1",
        fingerprint: "fp-1",
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await validateRefreshToken("valid-hash");

      expect(result.valid).toBe(true);
      expect(result.userId).toBe("user-1");
      expect(result.familyId).toBe("fam-1");
    });

    it("should return invalid for non-existent token", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue(null);

      const result = await validateRefreshToken("nonexistent");
      expect(result.valid).toBe(false);
    });

    it("should return invalid for revoked token", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        userId: "user-1",
        familyId: "fam-1",
        isRevoked: true,
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await validateRefreshToken("revoked-hash");
      expect(result.valid).toBe(false);
      expect(result.userId).toBe("user-1");
    });

    it("should return invalid for expired token", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        userId: "user-1",
        familyId: "fam-1",
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000),
      });

      const result = await validateRefreshToken("expired-hash");
      expect(result.valid).toBe(false);
    });

    it("should handle null fingerprint", async () => {
      (prisma.refreshToken.findUnique as any).mockResolvedValue({
        userId: "user-1",
        familyId: "fam-1",
        fingerprint: null,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await validateRefreshToken("hash");
      expect(result.fingerprint).toBeUndefined();
    });
  });

  describe("cleanupExpiredTokens", () => {
    it("should delete expired tokens", async () => {
      (prisma.refreshToken.deleteMany as any).mockResolvedValue({ count: 10 });

      const count = await cleanupExpiredTokens();
      expect(count).toBe(10);
    });

    it("should return 0 when no expired tokens", async () => {
      (prisma.refreshToken.deleteMany as any).mockResolvedValue({ count: 0 });

      const count = await cleanupExpiredTokens();
      expect(count).toBe(0);
    });
  });
});
