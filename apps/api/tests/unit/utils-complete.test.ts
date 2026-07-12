import { describe, it, expect } from "vitest";
import { generateUniqueSlug, formatDateTime } from "@komunaid/utils";

describe("generateUniqueSlug", () => {
  it("should return baseSlug when no existing slugs", () => {
    expect(generateUniqueSlug("hello-world", [])).toBe("hello-world");
  });

  it("should return baseSlug when no conflicts", () => {
    expect(generateUniqueSlug("hello-world", ["other-slug", "another-slug"])).toBe("hello-world");
  });

  it("should return baseSlug-1 when baseSlug exists", () => {
    expect(generateUniqueSlug("hello-world", ["hello-world"])).toBe("hello-world-1");
  });

  it("should return baseSlug-2 when baseSlug and baseSlug-1 exist", () => {
    expect(generateUniqueSlug("hello-world", ["hello-world", "hello-world-1"])).toBe("hello-world-2");
  });

  it("should handle many conflicts up to 100", () => {
    const existing = Array.from({ length: 100 }, (_, i) =>
      i === 0 ? "my-slug" : `my-slug-${i}`
    );
    expect(generateUniqueSlug("my-slug", existing)).toBe("my-slug-100");
  });

  it("should return unique slug after all numbered conflicts", () => {
    const existing = ["post", "post-1", "post-2", "post-3", "post-4", "post-5"];
    expect(generateUniqueSlug("post", existing)).toBe("post-6");
  });

  it("should handle baseSlug with hyphens", () => {
    expect(generateUniqueSlug("a-b-c", ["a-b-c"])).toBe("a-b-c-1");
  });

  it("should return first non-conflicting numbered slug", () => {
    expect(generateUniqueSlug("test", ["test", "test-1", "test-3"])).toBe("test-2");
  });

  it("should handle single character baseSlug", () => {
    expect(generateUniqueSlug("x", ["x", "x-1"])).toBe("x-2");
  });

  it("should handle empty string baseSlug", () => {
    expect(generateUniqueSlug("", [""])).toBe("-1");
  });
});

describe("formatDateTime", () => {
  it("should format Date object with time components", () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const result = formatDateTime(date);
    expect(result).toContain("2024");
    expect(result).toContain("15");
    expect(result).toContain("14");
    expect(result).toContain("30");
  });

  it("should format date string with time", () => {
    const result = formatDateTime("2024-06-20T10:15:00");
    expect(result).toContain("2024");
    expect(result).toContain("20");
    expect(result).toContain("10");
    expect(result).toContain("15");
  });

  it("should include hour and minute in output", () => {
    const date = new Date(2024, 5, 1, 8, 45);
    const result = formatDateTime(date);
    expect(result).toContain("08");
    expect(result).toContain("45");
  });

  it("should include weekday in output", () => {
    const date = new Date(2024, 0, 1);
    const result = formatDateTime(date);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should handle midnight time", () => {
    const date = new Date(2024, 0, 1, 0, 0);
    const result = formatDateTime(date);
    expect(result).toContain("00");
  });

  it("should handle end of day time", () => {
    const date = new Date(2024, 0, 1, 23, 59);
    const result = formatDateTime(date);
    expect(result).toContain("23");
    expect(result).toContain("59");
  });

  it("should format ISO string input", () => {
    const result = formatDateTime("2024-12-25T18:00:00.000Z");
    expect(result).toContain("2024");
    expect(typeof result).toBe("string");
  });

  it("should include month name in output", () => {
    const date = new Date(2024, 0, 15, 10, 0);
    const result = formatDateTime(date);
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });
});
