import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockResendBatchSend, mockSendMail } = vi.hoisted(() => ({
  mockResendBatchSend: vi.fn(),
  mockSendMail: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    batch: { send: mockResendBatchSend },
  })),
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
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("sendEmail", () => {
    it("should prefer Resend when RESEND_API_KEY is set", async () => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.NODE_ENV = "production";
      mockResendBatchSend.mockResolvedValue({ data: { data: [{ id: "email-id" }] }, error: null });

      const result = await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(result).toBe(true);
      expect(mockResendBatchSend).toHaveBeenCalledWith(
        [expect.objectContaining({ to: "user@example.com", subject: "Test" })]
      );
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should send separately to multiple recipients", async () => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.NODE_ENV = "production";
      mockResendBatchSend.mockResolvedValue({ data: { data: [{ id: "email-id" }] }, error: null });

      const result = await sendEmail({
        to: ["one@example.com", "two@example.com"],
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(result).toBe(true);
      expect(mockResendBatchSend).toHaveBeenCalledOnce();
      expect(mockResendBatchSend).toHaveBeenCalledWith([
        expect.objectContaining({ to: "one@example.com" }),
        expect.objectContaining({ to: "two@example.com" }),
      ]);
    });

    it("should split large recipient lists into Resend batches", async () => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.NODE_ENV = "production";
      mockResendBatchSend.mockResolvedValue({ data: { data: [{ id: "email-id" }] }, error: null });
      const recipients = Array.from({ length: 101 }, (_, index) => `user${index}@example.com`);

      const result = await sendEmail({
        to: recipients,
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(result).toBe(true);
      expect(mockResendBatchSend).toHaveBeenCalledTimes(2);
      expect(mockResendBatchSend.mock.calls[0][0]).toHaveLength(100);
      expect(mockResendBatchSend.mock.calls[1][0]).toHaveLength(1);
    });

    it("should fall back to SMTP when Resend fails", async () => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.NODE_ENV = "production";
      mockResendBatchSend.mockResolvedValue({ data: null, error: { message: "Rejected" } });
      mockSendMail.mockResolvedValue(undefined);

      const result = await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
      });

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledOnce();
    });

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
      expect(result.text).toContain(url);
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
