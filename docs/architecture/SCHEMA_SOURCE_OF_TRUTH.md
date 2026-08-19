# Schema Source Of Truth

## Authority

1. `packages/database/prisma/schema.prisma` defines intended application schema.
2. `packages/database/prisma/migrations/` defines reproducible deployed schema.
3. A disposable MySQL migration run must prove both are equivalent before release.

Current schema contains 43 Prisma models. Historical documents citing 16, 35, or 40 models are superseded for current release planning.

## Migration Policy

- Production: `pnpm db:migrate:prod` only.
- Staging and CI migration rehearsal: `pnpm db:migrate:prod` against disposable MySQL.
- Development schema experiments: `pnpm db:push` allowed only on disposable developer databases. Never use it as migration proof or production deployment.
- Do not alter an applied migration. Add a forward-only migration for drift repair.

## Reconciliation Migration

`20260813090000_reconcile_refresh_forum_media` adds migration-owned definitions for:

- `forum_replies`
- `refresh_tokens`
- `CommunityMediaType.GALLERY`
- `CommunityMediaType.FORUM_POST`
- organization join-request uniqueness

Release requires clean-database and existing-database rehearsal evidence before this migration reaches staging or production.

## Seed Policy

Seed data is local/test-only until a production-safe seed profile exists. Never run `pnpm db:seed` in production because current seed contains predictable demo credentials.
