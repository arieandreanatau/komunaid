import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockSendMail } = vi.hoisted(() => ({
  mockSendMail: vi.fn(),
}));

vi.mock("nodemailer", () => {
  return {
    default: {
      createTransport: vi.fn(() => ({
        sendMail: mockSendMail,
      })),
    },
  };
});

vi.mock("../../../src/lib/logger", () => ({
  createChildLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

import { sendEmail, buildResetPasswordEmail } from "../../../src/services/email";

describe("Email Service", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("sendEmail", () => {
    it("should return true when SMTP_HOST is set and sendMail succeeds", async () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.NODE_ENV = "production";
      mockSendMail.mockResolvedValue(undefined);

      const result = await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "noreply@komuna.id",
          to: "user@example.com",
          subject: "Test",
          html: "<p>Hello</p>",
        })
      );
    });

    it("should return true in development mode when no SMTP_HOST", async () => {
      delete process.env.SMTP_HOST;
      process.env.NODE_ENV = "development";

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = await sendEmail({
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Content</p>",
      });

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should return false in production when no email provider configured", async () => {
      delete process.env.SMTP_HOST;
      process.env.NODE_ENV = "production";

      const result = await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(result).toBe(false);
    });

    it("should return true in dev mode when SMTP sendMail fails", async () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.NODE_ENV = "development";
      mockSendMail.mockRejectedValue(new Error("Connection refused"));

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const result = await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(result).toBe(true);
      consoleSpy.mockRestore();
    });

    it("should use custom EMAIL_FROM when set", async () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.EMAIL_FROM = "custom@komuna.id";
      process.env.NODE_ENV = "production";
      mockSendMail.mockResolvedValue(undefined);

      await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "custom@komuna.id",
        })
      );
    });

    it("should include text field when provided", async () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.NODE_ENV = "production";
      mockSendMail.mockResolvedValue(undefined);

      await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
        text: "Plain text",
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "Plain text",
        })
      );
    });
  });

  describe("buildResetPasswordEmail", () => {
    it("should return subject 'Reset Password - KomunaID'", () => {
      const result = buildResetPasswordEmail("https://example.com/reset");
      expect(result.subject).toBe("Reset Password - KomunaID");
    });

    it("should include resetUrl in the HTML", () => {
      const url = "https://komuna.id/reset?token=abc123";
      const result = buildResetPasswordEmail(url);
      expect(result.html).toContain(url);
    });

    it("should return valid HTML with KomunaID branding", () => {
      const result = buildResetPasswordEmail("https://example.com/reset");
      expect(result.html).toContain("<!DOCTYPE html>");
      expect(result.html).toContain("<html>");
      expect(result.html).toContain("KomunaID");
      expect(result.html).toContain("Platform Komunitas Digital Indonesia");
    });

    it("should include current year in footer", () => {
      const result = buildResetPasswordEmail("https://example.com/reset");
      const currentYear = new Date().getFullYear().toString();
      expect(result.html).toContain(currentYear);
    });

    it("should contain reset password button text", () => {
      const result = buildResetPasswordEmail("https://example.com/reset");
      expect(result.html).toContain("Reset Password");
    });

    it("should contain expiry warning in Indonesian", () => {
      const result = buildResetPasswordEmail("https://example.com/reset");
      expect(result.html).toContain("kedaluarsa");
    });
  });
});
