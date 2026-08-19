# Database Test Report

## Current Status

`BLOCKED` as of 2026-08-13.

## Evidence

- Configured local database: `komunaid_dev`.
- `prisma migrate status` reports three unapplied migrations before reconciliation.
- Docker Desktop engine returned HTTP 500.
- `mysql` CLI is unavailable.
- No disposable MySQL instance was available. No destructive operation was run against `komunaid_dev` or production.

## Migration Repair Added

`packages/database/prisma/migrations/20260813090000_reconcile_refresh_forum_media/migration.sql` adds missing migration-owned schema for `forum_replies`, `refresh_tokens`, community-media enum values, and organization join-request uniqueness.

## Required Before Release Candidate

1. Start disposable MySQL 8.
2. Empty DB: run `pnpm db:migrate:prod`.
3. Run Prisma schema validation and migration diff with shadow DB.
4. Confirm ForumReply, RefreshToken, enum values, indexes, FKs, and organization join-request unique index.
5. Run seed only in isolated DB.
6. Apply same migration to isolated copy representing current deployed migration state.
7. Run API login, refresh rotation, forum, and media smoke tests.
