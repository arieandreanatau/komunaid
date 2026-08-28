/**
 * Per-test-file singleton used by `vi.mock("@komunaid/database", ...)`.
 *
 * Vitest hoists `vi.mock` factories above the rest of the file and forbids
 * them from closing over ordinary top-level `const`s (see the "There was an
 * error when mocking a module" guidance in vi.mock's docs) — but a dynamic
 * `import()` inside the factory is exempt, and resolves to the exact same
 * module instance as a plain top-level `import` elsewhere in the file, since
 * Vitest gives every test file its own isolated module registry.
 *
 * Usage in an integration test file:
 *
 *   vi.mock("@komunaid/database", async () => {
 *     const { prisma } = await import("../support/mock");
 *     return { prisma };
 *   });
 *
 *   import { prisma, db } from "../support/mock";
 */
import { createFakePrisma } from "./fake-prisma";

export const { prisma, db } = createFakePrisma();
