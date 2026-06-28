# 49 — CHANGELOG

Format: `## [version] - YYYY-MM-DD`

## [Unreleased] - 2026-06-27
### Fixed
- `komunaid_test` database missing; created and migrated. All 201 PHPUnit tests now pass.
- **BUG-001 → BUG-006, BUG-010** resolved:
  - Test DB created.
  - English URL aliases `/communities` and `/blog` added to `routes/modules/public.php`.
  - Top-of-form error summary added to `register.blade.php` and `login.blade.php`.
  - Throttle middleware applied: `throttle:10,1` on login, `throttle:20,1` on register, `throttle:3,1` on forgot-password.
  - `CommunityOwnerSeeder` made self-sufficient — `db:seed` now succeeds on a fresh DB.
  - `tests/TestCase.php` clears the rate limiter between tests to keep the suite deterministic.

### Added
- Consolidated documentation under `docs/`:
  - 00_EXECUTION_LOG.md
  - 00_TEST_RUN.log, 00_ROUTE_LIST.txt, 00_NPM_BUILD.log, 00_SEED.log
  - audit/01_PROJECT_BASELINE_AUDIT.md, 02_LIVE_VERCEL_AUDIT.md, 32_AUTH_REGISTER_LOGIN_ROOT_CAUSE.md
  - product/03..19 (17 files)
  - security/20_ROLE_PERMISSION_MATRIX.md, 33_SECURITY_AUDIT.md
  - database/21..25 (5 files)
  - architecture/26..31 (6 files)
  - qa/34..46 (10 files)
  - development/42..44 (3 files)
  - deployment/47_DEPLOYMENT_AUDIT_AND_RECOMMENDATION.md
  - release/48..52 (5 files)
  - guide/53..57 (5 files)

## [V2.x] - prior
- (See git history.)
