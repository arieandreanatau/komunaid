import { describe, it, expect } from "vitest";
import { xssSanitize, sanitizeText } from "../../../src/lib/xss";

describe("XSS Library", () => {
  describe("xssSanitize", () => {
    it("should sanitize HTML tags in text fields", () => {
      const result = xssSanitize({ name: '<script>alert("xss")</script>' });
      expect(result).toEqual({ name: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;' });
    });

    it("should sanitize description field", () => {
      const result = xssSanitize({ description: '<img onerror="alert(1)">' });
      expect(result).toEqual({ description: '&lt;img onerror=&quot;alert(1)&quot;&gt;' });
    });

    it("should sanitize title field", () => {
      const result = xssSanitize({ title: '<b>bold</b>' });
      expect(result).toEqual({ title: '&lt;b&gt;bold&lt;/b&gt;' });
    });

    it("should sanitize bio field", () => {
      const result = xssSanitize({ bio: '<a href="javascript:alert(1)">click</a>' });
      expect(result).toEqual({ bio: '&lt;a href=&quot;javascript:alert(1)&quot;&gt;click&lt;/a&gt;' });
    });

    it("should handle null/undefined input", () => {
      expect(xssSanitize(null)).toBeNull();
      expect(xssSanitize(undefined)).toBeUndefined();
    });

    it("should handle non-object input", () => {
      expect(xssSanitize("string")).toBe("string");
      expect(xssSanitize(123)).toBe(123);
    });

    it("should sanitize nested objects", () => {
      const result = xssSanitize({ nested: { name: '<script>x</script>' } });
      expect(result).toEqual({ nested: { name: '&lt;script&gt;x&lt;/script&gt;' } });
    });

    it("should sanitize arrays", () => {
      const result = xssSanitize({ tags: ["<script>", "safe"] });
      expect(result).toEqual({ tags: ["&lt;script&gt;", "safe"] });
    });

    it("should escape ampersands", () => {
      const result = xssSanitize({ name: "A & B" });
      expect(result).toEqual({ name: "A &amp; B" });
    });

    it("should escape single quotes", () => {
      const result = xssSanitize({ name: "O'Brien" });
      expect(result).toEqual({ name: "O&#039;Brien" });
    });

    it("should preserve non-text fields as-is", () => {
      const result = xssSanitize({ count: 42, active: true });
      expect(result).toEqual({ count: 42, active: true });
    });

    it("should sanitize location field", () => {
      const result = xssSanitize({ location: '<b>Jakarta</b>' });
      expect(result).toEqual({ location: '&lt;b&gt;Jakarta&lt;/b&gt;' });
    });

    it("should sanitize message field", () => {
      const result = xssSanitize({ message: '<img src=x onerror=alert(1)>' });
      expect(result).toEqual({ message: '&lt;img src=x onerror=alert(1)&gt;' });
    });

    it("should trim whitespace", () => {
      const result = xssSanitize({ name: "  hello  " });
      expect(result).toEqual({ name: "hello" });
    });
  });

  describe("sanitizeText", () => {
    it("should sanitize a string", () => {
      const result = sanitizeText("<b>hello</b>");
      expect(result).toBe("&lt;b&gt;hello&lt;/b&gt;");
    });

    it("should return null for null input", () => {
      expect(sanitizeText(null)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(sanitizeText(undefined)).toBeNull();
    });

    it("should escape double quotes", () => {
      const result = sanitizeText('say "hello"');
      expect(result).toBe("say &quot;hello&quot;");
    });

    it("should escape ampersands", () => {
      const result = sanitizeText("a & b");
      expect(result).toBe("a &amp; b");
    });

    it("should trim whitespace", () => {
      const result = sanitizeText("  test  ");
      expect(result).toBe("test");
    });

    it("should handle empty string", () => {
      const result = sanitizeText("");
      expect(result).toBe("");
    });

    it("should handle plain text without special chars", () => {
      const result = sanitizeText("hello world");
      expect(result).toBe("hello world");
    });
  });
});
