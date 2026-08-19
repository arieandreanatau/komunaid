# Bug Fix Log

| Date | Finding | Files | Verification | Status |
|---|---|---|---|---|
| 2026-08-13 | Refresh-token rotation race | `apps/api/src/services/refresh-token.ts` | Atomic conditional consume test passes | VERIFIED FIXED at unit level |
| 2026-08-13 | Platform admin account mutation | `apps/api/src/routes/admin/users.ts` | API unit/integration suite passes | PARTIAL |
| 2026-08-13 | Migration omissions | `20260813090000_reconcile_refresh_forum_media/migration.sql` | `prisma validate` passes; clean DB absent | NOT TESTABLE |
| 2026-08-13 | Rate-limit proxy-header trust | `rate-limiter.ts` | Trusted/untrusted proxy tests pass | VERIFIED FIXED |
| 2026-08-13 | Own reports route shadowing | `reports.ts` | Reports tests pass | VERIFIED FIXED |
| 2026-08-13 | Error boundary disclosure | `apps/web/app/error.tsx` | Web tests and build previously pass | VERIFIED FIXED |
