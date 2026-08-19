import { describe, it, expect, vi } from "vitest";
import { createWithUniqueSlug, isUniqueConstraintError } from "../../../src/lib/slug";

type CreateFn = (slug: string) => Promise<{ slug: string }>;

const mockCreate = (impl?: CreateFn) => {
  const m = vi.fn(impl ?? (async (slug: string) => ({ slug })) as CreateFn);
  return m as CreateFn & ReturnType<typeof vi.fn>;
};

describe("createWithUniqueSlug", () => {
  it("creates with the base slug when no collision", async () => {
    const create: CreateFn = vi.fn(async (slug: string) => ({ slug }));
    const result = await createWithUniqueSlug<{ slug: string }>(create, "My Community");
    expect(result.slug).toBe("my-community");
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("retries with a numeric suffix on unique constraint violation", async () => {
    const create = mockCreate();
    (create as any).mockRejectedValueOnce({ code: "P2002" });
    (create as any).mockImplementationOnce(async (slug: string) => ({ slug }));
    const result = await createWithUniqueSlug<{ slug: string }>(create, "My Event");
    expect(result.slug).toBe("my-event-1");
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("retries up to multiple collisions", async () => {
    const create = mockCreate();
    (create as any).mockRejectedValueOnce({ code: "P2002" });
    (create as any).mockRejectedValueOnce({ code: "P2002" });
    (create as any).mockImplementationOnce(async (slug: string) => ({ slug }));
    const result = await createWithUniqueSlug<{ slug: string }>(create, "Volunteer");
    expect(result.slug).toBe("volunteer-2");
    expect(create).toHaveBeenCalledTimes(3);
  });

  it("resolves concurrent identical creations to unique slugs via DB constraint simulation", async () => {
    // Shared registry simulates the DB unique index on slug.
    const registry = new Set<string>();
    const attemptSlug: CreateFn = async (slug: string) => {
      if (registry.has(slug)) throw { code: "P2002" };
      registry.add(slug);
      return { slug };
    };

    // Fire many "race" creators with the same base name in parallel.
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        createWithUniqueSlug<{ slug: string }>(attemptSlug, "konvo")
      )
    );

    const slugs = results.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(10); // all unique
    expect(slugs[0]).toBe("konvo"); // first writer got base
  });

  it("throws a clear error when uniqueness cannot be resolved", async () => {
    const create: CreateFn = vi.fn(async () => {
      throw { code: "P2002" };
    });
    await expect(createWithUniqueSlug<{ slug: string }>(create, "test")).rejects.toThrow(/unique slug/i);
  });

  it("propagates non-unique-constraint errors", async () => {
    const create: CreateFn = vi.fn(async () => {
      throw new Error("db down");
    });
    await expect(createWithUniqueSlug<{ slug: string }>(create, "test")).rejects.toThrow("db down");
  });

  it("falls back to a random-suffixed slug after exhausting attempts", async () => {
    const create: CreateFn = vi.fn(async (slug: string) => {
      // Fallback format is `test-<timestamp>-<random>` — only that succeeds.
      if (/^test-\d+-[a-z0-9]+$/.test(slug)) return { slug };
      throw { code: "P2002" };
    });
    // Base + 15 numeric attempts collide, fallback uses a non-numeric suffix.
    const result = await createWithUniqueSlug<{ slug: string }>(create, "test");
    expect(result.slug).toMatch(/^test-/);
    expect(result.slug).not.toMatch(/^test-\d+$/);
  });
});

describe("isUniqueConstraintError", () => {
  it("returns true for P2002", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true);
  });

  it("returns false for other codes and non-objects", () => {
    expect(isUniqueConstraintError({ code: "P2001" })).toBe(false);
    expect(isUniqueConstraintError(new Error("x"))).toBe(false);
    expect(isUniqueConstraintError(null)).toBe(false);
  });
});