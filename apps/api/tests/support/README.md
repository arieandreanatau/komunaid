# tests/support

One fixture module for `tests/integration/*.test.ts`, replacing the ten
bespoke `vi.mock("@komunaid/database", ...)` blocks that used to duplicate a
Map-backed fake Prisma client in every integration test file.

## Files

- `fake-prisma.ts` — the engine. Map-backed tables with real Prisma-ish
  `where`/`data` semantics (see below), plus `$transaction` (array and
  interactive-callback forms). `createFakePrisma()` builds one fresh,
  isolated instance (`{ prisma, db }`).
- `mock.ts` — the per-test-file singleton. Every integration test does:

  ```ts
  vi.mock("@komunaid/database", async () => {
    const { prisma } = await import("../support/mock");
    return { prisma };
  });

  import { prisma, db } from "../support/mock";
  ```

  The dynamic `import()` inside the factory is required: `vi.mock` factories
  are hoisted above ordinary top-level `const`s, so closing over a
  module-scope variable throws ("There was an error when mocking a
  module..."). A dynamic import is exempt, and — because Vitest gives each
  test file its own isolated module registry — it resolves to the exact same
  module instance as the plain `import` used later in the file for seeding
  and assertions.
- `builders.ts` — domain-shaped seed helpers (`aUser`, `aCommunity`,
  `anEvent`, `anOrganization`) that insert a fully-shaped row plus, via
  `.withMember(...)` / `.withRegistration(...)`, related rows in the right
  table.
- `real-prisma-adapter.ts` / `index.ts` — the second adapter (see below).

## Why `updateMany` is the important part

Routes that run status-machine transitions (events, volunteer programs, …)
guard every mutation with an optimistic-concurrency check:

```ts
const changed = await tx.event.updateMany({
  where: { id, status: expectedStatus, deletedAt: null },
  data: { status: nextStatus },
});
if (changed.count !== 1) throw new Error("EVENT_STATUS_CHANGED");
```

For this guard to mean anything in a test, `updateMany` has to actually
filter by `where` against a real stored row — if the fake always returns
`{ count: 1 }`, the guard can never fail and the "optimistic" half of
"optimistic concurrency" is untested. `fake-prisma.ts`'s `updateMany` filters
every row through the same generic `matchesWhere()` used by `find*`, so a
row whose real `status` doesn't match `where.status` is excluded and the
count comes back short — exactly like MySQL would.

The corollary: a test exercising a guarded mutation must **seed** the row
(`db.tables.event.seed({...})` or the `anEvent(db, {...})` builder) rather
than only `mockResolvedValueOnce`-ing `findUnique`. Overriding `findUnique`
in isolation disconnects it from the table `updateMany` reads, which is
exactly the bug this module exists to prevent (see the git history of
`tests/integration/events.integration.test.ts` for a worked example — the
"stale status snapshot" test).

## `db.reset()`

Call `db.reset()` in every `beforeEach`, alongside `vi.clearAllMocks()`.
`vi.clearAllMocks()` only clears call history — it does **not** undo a
`mockResolvedValue`/`mockImplementation` set by an earlier test on the same
shared `vi.fn()`. `db.reset()` clears every table's rows *and* reinstalls
each method's generic default implementation, so a test that doesn't
explicitly override a call gets the real generic behavior rather than
whatever the previous test happened to leave behind.

## The second adapter: a real database, opt-in

The interface (`FakePrismaHandle = { prisma, db }`) is deliberately the same
shape a real-Prisma adapter would return. `real-prisma-adapter.ts` implements
`createRealPrisma()` against `TEST_DATABASE_URL`; `index.ts`'s
`createTestPrisma()` is the switch point — it returns the fake unless
`TEST_DATABASE_URL` is set, in which case it lazily imports the real adapter
instead. Nothing in the current suite calls `createTestPrisma()` (every file
calls `createFakePrisma()`/imports `support/mock` directly, since none of
them need a real database), so:

- Normal `pnpm test` / `pnpm --filter @komunaid/api exec vitest run` never
  evaluates `real-prisma-adapter.ts` and never constructs a `PrismaClient`.
  No database is required.
- Turning it on for a specific spec later is a matter of routing that spec
  through `createTestPrisma()` and setting `TEST_DATABASE_URL` in the
  environment running it.

What real-adapter mode does **not** do yet: automatic schema migration or a
generic FK-safe `reset()` between tests against the target database. Its
`db.reset()` and `db.tables` both throw on purpose, so a half-wired opt-in
fails loudly instead of silently leaking state across tests. Wiring that up
(migrate the disposable DB, truncate tables between tests) is real
infrastructure work for whoever turns this on, not a few lines here.
