import { describe, it, expect } from "vitest";
import { parsePagination, paginatedResponse } from "../../../src/lib/pagination";

describe("parsePagination", () => {
  it("defaults to page 1, limit from DEFAULT_LIMIT, sort desc, orderBy createdAt", () => {
    const result = parsePagination("http://x.test/api/v1/things");
    expect(result.page).toBe(1);
    expect(result.sort).toBe("desc");
    expect(result.orderBy).toBe("createdAt");
    expect(result.search).toBe("");
    expect(result.skip).toBe(0);
    expect(result.limit).toBeGreaterThan(0);
  });

  it("reads page, limit, search, sort, orderBy from query params", () => {
    const result = parsePagination(
      "http://x.test/api/v1/things?page=3&limit=5&search=foo&sort=asc&orderBy=name",
    );
    expect(result).toMatchObject({
      page: 3,
      limit: 5,
      search: "foo",
      sort: "asc",
      orderBy: "name",
      skip: 10,
    });
  });

  it("clamps page below 1 up to 1", () => {
    const result = parsePagination("http://x.test/api/v1/things?page=0");
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it("clamps a negative page up to 1", () => {
    const result = parsePagination("http://x.test/api/v1/things?page=-5");
    expect(result.page).toBe(1);
  });

  it("clamps limit below 1 up to 1", () => {
    const result = parsePagination("http://x.test/api/v1/things?limit=0");
    expect(result.limit).toBe(1);
  });

  it("clamps limit above the default max down to it", () => {
    const result = parsePagination("http://x.test/api/v1/things?limit=99999");
    const unclamped = parsePagination("http://x.test/api/v1/things?limit=1");
    // maxLimit isn't exported, but the clamp must be strictly less than the raw request.
    expect(result.limit).toBeLessThan(99999);
    expect(unclamped.limit).toBe(1);
  });

  it("respects a caller-supplied maxLimit override", () => {
    const result = parsePagination("http://x.test/api/v1/things?limit=50", { maxLimit: 10 });
    expect(result.limit).toBe(10);
  });

  it("falls back to caller-supplied defaults when params are absent", () => {
    const result = parsePagination("http://x.test/api/v1/things", { page: 2, limit: 15 });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(15);
    expect(result.skip).toBe(15);
  });

  it("falls back to defaults when page/limit are non-numeric", () => {
    const result = parsePagination("http://x.test/api/v1/things?page=abc&limit=xyz", {
      page: 4,
      limit: 7,
    });
    expect(result.page).toBe(4);
    expect(result.limit).toBe(7);
  });

  it("computes skip as (page - 1) * limit", () => {
    const result = parsePagination("http://x.test/api/v1/things?page=5&limit=20");
    expect(result.skip).toBe(80);
  });
});

describe("paginatedResponse", () => {
  it("wraps data in the standard success envelope with a pagination block", () => {
    const items = [{ id: "1" }, { id: "2" }];
    const result = paginatedResponse(items, 42, 2, 10);
    expect(result).toEqual({
      success: true,
      data: items,
      pagination: { page: 2, limit: 10, total: 42, totalPages: 5 },
    });
  });

  it("rounds totalPages up for a partial final page", () => {
    const result = paginatedResponse([], 21, 1, 10);
    expect(result.pagination.totalPages).toBe(3);
  });

  it("reports zero totalPages when total is zero", () => {
    const result = paginatedResponse([], 0, 1, 10);
    expect(result.pagination.totalPages).toBe(0);
  });

  it("preserves the data array reference and order", () => {
    const items = [{ id: "b" }, { id: "a" }];
    const result = paginatedResponse(items, 2, 1, 10);
    expect(result.data).toBe(items);
  });

  it("always sets success: true", () => {
    const result = paginatedResponse([], 0, 1, 10);
    expect(result.success).toBe(true);
  });
});
