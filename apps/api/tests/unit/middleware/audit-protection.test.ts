import { describe, it, expect, vi, beforeEach } from "vitest";
import { auditLogProtection } from "../../../src/middleware/audit-protection";

describe("Audit Protection Middleware", () => {
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext = vi.fn().mockImplementation(async (params: any) => params);
  });

  describe("AuditLog model", () => {
    it("should allow create on AuditLog", async () => {
      const middleware = auditLogProtection();
      const params = { action: "create", model: "AuditLog" };
      const result = await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
      expect(result).toEqual(params);
    });

    it("should allow findMany on AuditLog", async () => {
      const middleware = auditLogProtection();
      const params = { action: "findMany", model: "AuditLog" };
      const result = await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
      expect(result).toEqual(params);
    });

    it("should allow findUnique on AuditLog", async () => {
      const middleware = auditLogProtection();
      const params = { action: "findUnique", model: "AuditLog" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should allow findFirst on AuditLog", async () => {
      const middleware = auditLogProtection();
      const params = { action: "findFirst", model: "AuditLog" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should block update on AuditLog", async () => {
      const middleware = auditLogProtection();
      const params = { action: "update", model: "AuditLog" };
      await expect(middleware(params, mockNext)).rejects.toThrow(
        "Audit log immutability violation: update/delete is not allowed"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should block delete on AuditLog", async () => {
      const middleware = auditLogProtection();
      const params = { action: "delete", model: "AuditLog" };
      await expect(middleware(params, mockNext)).rejects.toThrow(
        "Audit log immutability violation: update/delete is not allowed"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should block updateMany on AuditLog", async () => {
      const middleware = auditLogProtection();
      const params = { action: "updateMany", model: "AuditLog" };
      await expect(middleware(params, mockNext)).rejects.toThrow(
        "Audit log immutability violation: update/delete is not allowed"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should block deleteMany on AuditLog", async () => {
      const middleware = auditLogProtection();
      const params = { action: "deleteMany", model: "AuditLog" };
      await expect(middleware(params, mockNext)).rejects.toThrow(
        "Audit log immutability violation: update/delete is not allowed"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Non-AuditLog models", () => {
    it("should allow update on User model", async () => {
      const middleware = auditLogProtection();
      const params = { action: "update", model: "User" };
      const result = await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
      expect(result).toEqual(params);
    });

    it("should allow delete on Post model", async () => {
      const middleware = auditLogProtection();
      const params = { action: "delete", model: "Post" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should allow updateMany on Organization model", async () => {
      const middleware = auditLogProtection();
      const params = { action: "updateMany", model: "Organization" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should allow deleteMany on Brand model", async () => {
      const middleware = auditLogProtection();
      const params = { action: "deleteMany", model: "Brand" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should allow create on any non-AuditLog model", async () => {
      const middleware = auditLogProtection();
      const params = { action: "create", model: "Campaign" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });
  });

  describe("No model specified", () => {
    it("should allow when model is undefined", async () => {
      const middleware = auditLogProtection();
      const params = { action: "update" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should allow when model is undefined with destructive action", async () => {
      const middleware = auditLogProtection();
      const params = { action: "deleteMany" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });
  });

  describe("Params forwarding", () => {
    it("should pass params to next function", async () => {
      const middleware = auditLogProtection();
      const params = { action: "create", model: "AuditLog" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should return next result", async () => {
      const middleware = auditLogProtection();
      const expected = { count: 5 };
      mockNext.mockResolvedValue(expected);
      const params = { action: "findMany", model: "AuditLog" };
      const result = await middleware(params, mockNext);
      expect(result).toBe(expected);
    });

    it("should create new middleware instance per call", async () => {
      const mw1 = auditLogProtection();
      const mw2 = auditLogProtection();
      const params = { action: "create", model: "AuditLog" };

      await mw1(params, mockNext);
      await mw2(params, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty action string", async () => {
      const middleware = auditLogProtection();
      const params = { action: "", model: "AuditLog" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should handle case-sensitive action names", async () => {
      const middleware = auditLogProtection();
      const params = { action: "Update", model: "AuditLog" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should handle case-sensitive model names", async () => {
      const middleware = auditLogProtection();
      const params = { action: "update", model: "auditlog" };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });

    it("should handle null model", async () => {
      const middleware = auditLogProtection();
      const params = { action: "update", model: null };
      await middleware(params, mockNext);
      expect(mockNext).toHaveBeenCalledWith(params);
    });
  });
});
