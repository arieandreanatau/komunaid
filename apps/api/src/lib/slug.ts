import { slugify } from "@komunaid/utils";

const UNIQUE_CONSTRAINT_CODE = "P2002";

export interface SlugTarget {
  slug: string;
}

/**
 * Retry strategy for creating records with a unique slug under concurrency.
 *
 * The generic pattern is:
 *   1. try to create with the base slug
 *   2. on unique constraint violation (P2002), bump a numeric suffix and retry
 *   3. as a final fallback, append a short random suffix
 *
 * This avoids the TOCTOU gap of `findUnique`-then-`create` and never throws an
 * unhandled unique constraint error for slug collisions.
 */
export async function createWithUniqueSlug<T>(
  create: (slug: string) => Promise<T>,
  baseName: string,
): Promise<T> {
  const baseSlug = slugify(baseName) || "item";
  const maxAttempts = 15;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`;
    try {
      return await create(slug);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== UNIQUE_CONSTRAINT_CODE) throw err;
    }
  }

  const fallbackSlug = `${baseSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  try {
    return await create(fallbackSlug);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === UNIQUE_CONSTRAINT_CODE) {
      throw new Error("Unable to generate a unique slug after multiple attempts");
    }
    throw err;
  }
}

export function isUniqueConstraintError(err: unknown): boolean {
  return (err as { code?: string })?.code === UNIQUE_CONSTRAINT_CODE;
}