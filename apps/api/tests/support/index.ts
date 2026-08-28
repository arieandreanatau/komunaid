/**
 * Single entrypoint for the test-database seam.
 *
 * Every integration test imports `createFakePrisma` (or the builders) from
 * this package. `createTestPrisma()` is the switch point: it hands back the
 * Map-backed fake by default, and only reaches for a real PrismaClient when a
 * human has explicitly opted in via `TEST_DATABASE_URL`. See README.md.
 */
export { createFakePrisma, matchesWhere } from "./fake-prisma";
export type { FakeDb, FakePrismaHandle, FakeTable, RelationConfig } from "./fake-prisma";
export { aUser, aCommunity, anEvent, anOrganization, resetBuilderSequence } from "./builders";

import type { FakePrismaHandle } from "./fake-prisma";
import { createFakePrisma } from "./fake-prisma";

/**
 * Returns a fresh fake adapter, or — only when `TEST_DATABASE_URL` is set — a
 * real one. Not used by the current integration suite (which always wants a
 * fresh in-memory instance per file), but this is the seam a future
 * `it.runIf(process.env.TEST_DATABASE_URL)("...against a real db", ...)` spec
 * would call instead of `createFakePrisma()` directly.
 *
 * Async so a normal `pnpm test` run (no `TEST_DATABASE_URL`) never even
 * evaluates the real-adapter module, let alone constructs a PrismaClient.
 */
export async function createTestPrisma(): Promise<FakePrismaHandle> {
  if (process.env.TEST_DATABASE_URL) {
    const { createRealPrisma } = await import("./real-prisma-adapter");
    return createRealPrisma();
  }
  return createFakePrisma();
}
