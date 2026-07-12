import { describe, it, expect } from "vitest";
import {
  slugify,
  truncate,
  formatDate,
  formatNumber,
  isEmail,
  isStrongPassword,
  sanitizeInput,
  isValidUsername,
  timeAgo,
  maskEmail,
} from "@komunaid/utils";

describe("@komunaid/utils", () => {
  describe("slugify", () => {
    it("should convert text to lowercase slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should replace special characters with hyphens", () => {
      expect(slugify("Hello! @World#")).toBe("hello-world");
    });

    it("should remove leading and trailing hyphens", () => {
      expect(slugify("--hello--")).toBe("hello");
    });

    it("should collapse multiple hyphens", () => {
      expect(slugify("a   b   c")).toBe("a-b-c");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });

    it("should handle unicode characters", () => {
      const result = slugify("Halo Dunia!");
      expect(result).toBe("halo-dunia");
    });

    it("should preserve numbers", () => {
      expect(slugify("Event 2024")).toBe("event-2024");
    });

    it("should handle single word", () => {
      expect(slugify("Hello")).toBe("hello");
    });

    it("should handle string with only special chars", () => {
      expect(slugify("!@#$%")).toBe("");
    });

    it("should handle mixed case and numbers", () => {
      expect(slugify("My Test123")).toBe("my-test123");
    });
  });

  describe("truncate", () => {
    it("should truncate long text with ellipsis", () => {
      expect(truncate("Hello World", 8)).toBe("Hello...");
    });

    it("should not truncate short text", () => {
      expect(truncate("Hi", 10)).toBe("Hi");
    });

    it("should handle exact length", () => {
      expect(truncate("Hello", 5)).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(truncate("", 10)).toBe("");
    });

    it("should handle maxLength of 3", () => {
      expect(truncate("Hello", 3)).toBe("...");
    });

    it("should handle very long text", () => {
      const long = "a".repeat(100);
      expect(truncate(long, 20).length).toBe(20);
    });
  });

  describe("formatDate", () => {
    it("should format a Date object in Indonesian locale", () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date);
      expect(result).toContain("2024");
      expect(result).toContain("15");
    });

    it("should format a date string", () => {
      const result = formatDate("2024-06-20");
      expect(result).toContain("2024");
      expect(result).toContain("20");
    });

    it("should include weekday in output", () => {
      const result = formatDate(new Date(2024, 0, 1));
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with Indonesian locale separators", () => {
      const result = formatNumber(1000000);
      expect(result).toContain("1");
      expect(result).toContain("000");
    });

    it("should handle zero", () => {
      expect(formatNumber(0)).toBe("0");
    });

    it("should handle negative numbers", () => {
      const result = formatNumber(-500);
      expect(result).toContain("500");
    });

    it("should handle decimals", () => {
      const result = formatNumber(1234.56);
      expect(result).toContain("1");
      expect(result).toContain("234");
    });

    it("should handle large numbers", () => {
      const result = formatNumber(1000000000);
      expect(result).toContain("1");
    });
  });

  describe("isEmail", () => {
    it("should return true for valid emails", () => {
      expect(isEmail("test@example.com")).toBe(true);
      expect(isEmail("user.name@domain.co.id")).toBe(true);
      expect(isEmail("a+b@c.com")).toBe(true);
    });

    it("should return false for invalid emails", () => {
      expect(isEmail("notanemail")).toBe(false);
      expect(isEmail("@domain.com")).toBe(false);
      expect(isEmail("user@")).toBe(false);
      expect(isEmail("user@domain")).toBe(false);
      expect(isEmail("")).toBe(false);
      expect(isEmail("user @domain.com")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("should return true for strong passwords", () => {
      expect(isStrongPassword("MyPass123")).toBe(true);
      expect(isStrongPassword("Str0ngP@ss")).toBe(true);
    });

    it("should return false for weak passwords", () => {
      expect(isStrongPassword("weak")).toBe(false);
      expect(isStrongPassword("nouppercase1")).toBe(false);
      expect(isStrongPassword("NOLOWERCASE1")).toBe(false);
      expect(isStrongPassword("NoNumbers")).toBe(false);
      expect(isStrongPassword("short1A")).toBe(false);
    });

    it("should require at least 8 characters", () => {
      expect(isStrongPassword("Abc12345")).toBe(true);
      expect(isStrongPassword("Abc1234")).toBe(false);
    });

    it("should require uppercase letter", () => {
      expect(isStrongPassword("alllowercase1")).toBe(false);
    });

    it("should require lowercase letter", () => {
      expect(isStrongPassword("ALLUPPERCASE1")).toBe(false);
    });

    it("should require a number", () => {
      expect(isStrongPassword("NoNumbersHere")).toBe(false);
    });
  });

  describe("sanitizeInput", () => {
    it("should escape HTML entities", () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toContain("&lt;");
      expect(sanitizeInput('<script>alert("xss")</script>')).toContain("&gt;");
    });

    it("should escape ampersands", () => {
      expect(sanitizeInput("a & b")).toBe("a &amp; b");
    });

    it("should escape double quotes", () => {
      expect(sanitizeInput('"hello"')).toBe("&quot;hello&quot;");
    });

    it("should escape single quotes", () => {
      expect(sanitizeInput("O'Brien")).toBe("O&#x27;Brien");
    });

    it("should handle clean input", () => {
      expect(sanitizeInput("hello world")).toBe("hello world");
    });

    it("should handle empty string", () => {
      expect(sanitizeInput("")).toBe("");
    });
  });

  describe("isValidUsername", () => {
    it("should accept valid usernames", () => {
      expect(isValidUsername("john")).toBe(true);
      expect(isValidUsername("john_doe")).toBe(true);
      expect(isValidUsername("user123")).toBe(true);
      expect(isValidUsername("ABC_123")).toBe(true);
    });

    it("should reject invalid usernames", () => {
      expect(isValidUsername("ab")).toBe(false);
      expect(isValidUsername("john doe")).toBe(false);
      expect(isValidUsername("john-doe")).toBe(false);
      expect(isValidUsername("john.doe")).toBe(false);
      expect(isValidUsername("")).toBe(false);
    });

    it("should enforce max length of 30", () => {
      expect(isValidUsername("a".repeat(30))).toBe(true);
      expect(isValidUsername("a".repeat(31))).toBe(false);
    });

    it("should enforce min length of 3", () => {
      expect(isValidUsername("ab")).toBe(false);
      expect(isValidUsername("abc")).toBe(true);
    });
  });

  describe("timeAgo", () => {
    it("should return 'baru saja' for recent times", () => {
      const now = new Date();
      expect(timeAgo(now)).toBe("baru saja");
    });

    it("should return minutes ago", () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(timeAgo(date)).toBe("5 menit yang lalu");
    });

    it("should return hours ago", () => {
      const date = new Date(Date.now() - 3 * 3600 * 1000);
      expect(timeAgo(date)).toBe("3 jam yang lalu");
    });

    it("should return days ago", () => {
      const date = new Date(Date.now() - 5 * 86400 * 1000);
      expect(timeAgo(date)).toBe("5 hari yang lalu");
    });

    it("should return months ago", () => {
      const date = new Date(Date.now() - 60 * 86400 * 1000);
      expect(timeAgo(date)).toBe("2 bulan yang lalu");
    });

    it("should handle string dates", () => {
      const dateStr = new Date(Date.now() - 60 * 1000).toISOString();
      expect(timeAgo(dateStr)).toBe("1 menit yang lalu");
    });

    it("should handle 1 minute", () => {
      const date = new Date(Date.now() - 60 * 1000);
      expect(timeAgo(date)).toBe("1 menit yang lalu");
    });

    it("should handle 1 hour", () => {
      const date = new Date(Date.now() - 3600 * 1000);
      expect(timeAgo(date)).toBe("1 jam yang lalu");
    });

    it("should handle 1 day", () => {
      const date = new Date(Date.now() - 86400 * 1000);
      expect(timeAgo(date)).toBe("1 hari yang lalu");
    });
  });

  describe("maskEmail", () => {
    it("should mask local part of email", () => {
      expect(maskEmail("john@example.com")).toBe("j**n@example.com");
    });

    it("should handle short local part (<=2 chars)", () => {
      expect(maskEmail("ab@example.com")).toBe("a***@example.com");
    });

    it("should handle single char local part", () => {
      expect(maskEmail("a@example.com")).toBe("a***@example.com");
    });

    it("should handle long local part", () => {
      expect(maskEmail("longusername@example.com")).toBe("l**********e@example.com");
    });

    it("should return original if no @ sign", () => {
      expect(maskEmail("noatsign")).toBe("noatsign");
    });

    it("should handle email with multiple dots in domain", () => {
      expect(maskEmail("user@sub.domain.com")).toBe("u**r@sub.domain.com");
    });

    it("should handle 3-char local part", () => {
      expect(maskEmail("abc@example.com")).toBe("a*c@example.com");
    });
  });
});
