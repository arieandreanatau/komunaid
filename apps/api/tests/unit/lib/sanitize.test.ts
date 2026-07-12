import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeNullable, sanitizeArray } from "../../../src/lib/sanitize";

describe("Sanitize Library", () => {
  describe("sanitizeText", () => {
    it("should escape ampersands", () => {
      expect(sanitizeText("a & b")).toBe("a &amp; b");
    });

    it("should escape angle brackets", () => {
      expect(sanitizeText("<script>")).toBe("&lt;script&gt;");
    });

    it("should escape double quotes", () => {
      expect(sanitizeText('say "hello"')).toBe("say &quot;hello&quot;");
    });

    it("should escape single quotes", () => {
      expect(sanitizeText("O'Brien")).toBe("O&#039;Brien");
    });

    it("should trim whitespace", () => {
      expect(sanitizeText("  hello  ")).toBe("hello");
    });

    it("should handle empty string", () => {
      expect(sanitizeText("")).toBe("");
    });

    it("should handle plain text", () => {
      expect(sanitizeText("hello world")).toBe("hello world");
    });

    it("should handle all special characters combined", () => {
      const input = '<script>alert("it\'s a test & more")</script>';
      const result = sanitizeText(input);
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
      expect(result).toContain("&quot;");
      expect(result).toContain("&#039;");
      expect(result).toContain("&amp;");
    });

    it("should return non-string input as-is", () => {
      expect(sanitizeText(42 as any)).toBe(42);
    });

    it("should handle unicode characters", () => {
      expect(sanitizeText("Halo Dunia")).toBe("Halo Dunia");
    });
  });

  describe("sanitizeNullable", () => {
    it("should return null for null input", () => {
      expect(sanitizeNullable(null)).toBeNull();
    });

    it("should return undefined for undefined input", () => {
      expect(sanitizeNullable(undefined)).toBeUndefined();
    });

    it("should sanitize a string", () => {
      expect(sanitizeNullable("<b>test</b>")).toBe("&lt;b&gt;test&lt;/b&gt;");
    });

    it("should sanitize empty string", () => {
      expect(sanitizeNullable("")).toBe("");
    });

    it("should handle already safe string", () => {
      expect(sanitizeNullable("hello")).toBe("hello");
    });
  });

  describe("sanitizeArray", () => {
    it("should sanitize each item in array", () => {
      const result = sanitizeArray(["<script>", "safe", "a & b"]);
      expect(result).toEqual(["&lt;script&gt;", "safe", "a &amp; b"]);
    });

    it("should return undefined for undefined input", () => {
      expect(sanitizeArray(undefined)).toBeUndefined();
    });

    it("should return input for non-array input", () => {
      expect(sanitizeArray("not-array" as any)).toBe("not-array");
    });

    it("should filter out empty strings after sanitization", () => {
      const result = sanitizeArray(["valid", ""]);
      expect(result).toEqual(["valid"]);
    });

    it("should handle empty array", () => {
      expect(sanitizeArray([])).toEqual([]);
    });

    it("should handle array with special chars", () => {
      const result = sanitizeArray(['<img onerror="x">', "normal"]);
      expect(result).toEqual(["&lt;img onerror=&quot;x&quot;&gt;", "normal"]);
    });

    it("should handle null array", () => {
      expect(sanitizeArray(null as any)).toBeNull();
    });
  });
});
