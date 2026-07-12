import { describe, it, expect } from "vitest";
import { getInitial } from "../../lib/initial";

describe("getInitial", () => {
  it("returns first character of valid string", () => {
    expect(getInitial("Hello")).toBe("H");
  });

  it("returns fallback for undefined", () => {
    expect(getInitial(undefined)).toBe("");
  });

  it("returns fallback for null", () => {
    expect(getInitial(null)).toBe("");
  });

  it("returns fallback for empty string", () => {
    expect(getInitial("")).toBe("");
  });

  it("returns fallback for whitespace-only string", () => {
    expect(getInitial("   ")).toBe("");
  });

  it("uses custom fallback when provided", () => {
    expect(getInitial(undefined, "N/A")).toBe("N/A");
    expect(getInitial(null, "?")).toBe("?");
    expect(getInitial("", "-")).toBe("-");
    expect(getInitial("   ", "?")).toBe("?");
  });

  it("returns first char of trimmed string (trims whitespace)", () => {
    expect(getInitial("  Hello")).toBe("H");
    expect(getInitial("  H  ")).toBe("H");
  });

  it("handles single character string", () => {
    expect(getInitial("A")).toBe("A");
    expect(getInitial(" z ")).toBe("z");
  });

  it("returns fallback for non-string type (number)", () => {
    expect(getInitial(123 as unknown as string)).toBe("");
  });

  it("returns fallback for non-string type (boolean)", () => {
    expect(getInitial(true as unknown as string)).toBe("");
  });

  it("returns fallback for non-string type (object)", () => {
    expect(getInitial({} as unknown as string)).toBe("");
  });

  it("returns fallback for non-string type (array)", () => {
    expect(getInitial([] as unknown as string)).toBe("");
  });

  it("returns custom fallback for non-string type", () => {
    expect(getInitial(42 as unknown as string, "X")).toBe("X");
  });
});
