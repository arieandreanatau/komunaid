import { describe, expect, it } from "vitest";
import { safeRedirect } from "../../lib/redirect";

describe("safeRedirect", () => {
  it("allows supported internal routes", () => {
    expect(safeRedirect("/admin/users", "/admin")).toBe("/admin/users");
    expect(safeRedirect("/dashboard/events/create", "/dashboard")).toBe("/dashboard/events/create");
  });

  it("rejects external and protocol-relative targets", () => {
    expect(safeRedirect("https://evil.example", "/admin")).toBe("/admin");
    expect(safeRedirect("//evil.example", "/admin")).toBe("/admin");
  });
});
