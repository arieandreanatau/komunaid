/**
 * Real-database adapter for the integration test suite.
 *
 * This is the second adapter behind the `tests/support` seam described in
 * README.md. It is only ever loaded when `TEST_DATABASE_URL` is set — normal
 * `pnpm test` runs never import this file, so the suite stays green without a
 * database (matches the fake adapter's `FakePrismaHandle` shape so a future
 * caller can swap one for the other without touching route code).
 *
 * What is intentionally NOT built here: automatic migration/seed of the target
 * database and a generic per-table `reset()`. Doing that safely (running
 * `prisma migrate deploy` against a disposable database, truncating tables in
 * FK-safe order between tests) is a real piece of infrastructure work, not a
 * few lines — left for whoever actually turns this on. `reset()` below throws
 * on purpose so a half-wired opt-in fails loudly instead of silently leaking
 * state between tests.
 */
import { PrismaClient } from "@prisma/client";
import type { FakePrismaHandle } from "./fake-prisma";

export function createRealPrisma(): FakePrismaHandle {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error("createRealPrisma() requires TEST_DATABASE_URL to be set");
  }

  const prisma = new PrismaClient({ datasources: { db: { url } } }) as unknown as FakePrismaHandle["prisma"];

  const db: FakePrismaHandle["db"] = {
    // A real Prisma client doesn't expose per-table Maps; nothing in the fake
    // engine's table surface applies here, so the interactive-table-access
    // half of FakeDb is intentionally not implemented against a real client.
    tables: new Proxy({} as FakePrismaHandle["db"]["tables"], {
      get() {
        throw new Error(
          "db.tables is a fake-adapter concept only. Seed the real test database directly via `prisma.<model>.create(...)`."
        );
      },
    }),
    reset() {
      throw new Error(
        "createRealPrisma().db.reset() is not implemented. Wire up FK-safe truncation (or re-run `prisma migrate reset`) " +
          "against TEST_DATABASE_URL before relying on this adapter."
      );
    },
  };

  return { prisma, db };
}
