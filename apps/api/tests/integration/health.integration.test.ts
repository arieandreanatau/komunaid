import { describe, expect, it } from "vitest";
import app from "../../src/app";

describe("Health integration smoke test", () => {
  it("returns lightweight public API health status", async () => {
    const response = await app.request("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
