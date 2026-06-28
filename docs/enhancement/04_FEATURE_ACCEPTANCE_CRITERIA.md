# KomunaID — Feature Acceptance Criteria

> Kriteria acceptance untuk setiap enhancement yang diimplementasikan di audit ini.

## AC1. Security Headers Middleware

**Given:** A user accesses any page on KomunaID (public, member, superadmin).
**When:** The HTTP response is generated.
**Then:**
- Response header `X-Content-Type-Options: nosniff` is present.
- Response header `X-Frame-Options: SAMEORIGIN` is present.
- Response header `Referrer-Policy: strict-origin-when-cross-origin` is present.
- Response header `Permissions-Policy: geolocation=(), microphone=(), camera=()` is present.

**Test:** `tests/Feature/PublicRoutingTest::test_security_headers_present` → PASS.

## AC2. Indonesian Route Aliases

**Given:** A user navigates to `/tentang-kami` or `/hubungi-kami` or `/event`.
**When:** The route is resolved.
**Then:**
- HTTP 200 response is returned.
- The same view/controller as the English alias is rendered.

**Test:** `tests/Feature/PublicRoutingTest::test_indonesian_alias_*` → PASS.

## AC3. DemoUserSeeder Idempotency

**Given:** A demo user (`member@komuna.test`) has been soft-deleted (e.g. by superadmin UI test).
**When:** `php artisan db:seed --class=...DemoUserSeeder` is run.
**Then:**
- No `UniqueConstraintViolationException` is thrown.
- The soft-deleted user is restored.
- All 8 demo users are present and have correct roles.

**Test:** `scripts/test_seeder_fix.php` runs successfully.

## AC4. DatabaseSeeder Graceful Optional Seeders

**Given:** Some master seeder files (e.g. `CommunityOwnerSeeder.php`) do not exist.
**When:** `php artisan db:seed` is run.
**Then:**
- Missing seeders are silently skipped (not fatal).
- Existing seeders are still executed.

**Test:** Manual verification (no error on `db:seed` if optional seeder file missing).

## AC5. Automated Tests Coverage

**Given:** The PHPUnit test suite is run.
**When:** `php artisan test` or `vendor/bin/phpunit tests/Feature/PublicRoutingTest.php` is executed.
**Then:**
- All 16 public routing tests pass.
- All 4 auth flow tests pass.
- No existing test is broken (regression check).

**Test:** `phpunit tests/Feature/PublicRoutingTest.php` → 16/16 PASS. `phpunit tests/Feature/AuthFlowTest.php` → 4/4 PASS.

## AC6. Local Smoke Test (HTTP)

**Given:** Laravel dev server is running at `http://127.0.0.1:8000`.
**When:** `scripts/local_smoke.ps1` is run.
**Then:** 22/22 endpoint tests PASS (no FAIL).

**Test:** `powershell -File scripts/local_smoke.ps1` → "PASS: 22 FAIL: 0 TOTAL: 22".

## AC7. Auth Flow Per Role

**Given:** All 8 demo users exist and have correct roles.
**When:** Login is performed with each user.
**Then:** Each user is redirected to the dashboard matching their highest role:
- superadmin → (rejected from /login, must use /admin/login)
- platform_admin → /superadmin/dashboard
- member → /member/dashboard
- community_owner → /community-own/dashboard
- brand_owner → /brand/dashboard
- company_owner → /company-owner/dashboard
- banned → /account-restricted
- suspended → /account-restricted

**Test:** `scripts/test_login_flow.php` → all expected paths.

## AC8. Vercel Asset Serving

**Given:** KomunaID is deployed at `https://komunaidv2-komuna.vercel.app`.
**When:** A user loads the homepage.
**Then:** CSS and JS files at `/build/assets/app-*.css` and `/build/assets/app-*.js` return HTTP 200 with `Cache-Control: public, max-age=31536000, immutable`.

**Test:** `scripts/vercel_assets.php` and HTML inspection.

## AC9. README Documentation Sync

**Given:** `routes/modules/public.php` and `routes/modules/{community,brand,company,superadmin,member}-owner.php` define specific paths.
**When:** `README.md` is read.
**Then:** The documented routes match the actual routes (no 404 on documented links).

**Test:** Manual review + automated by `PublicRoutingTest`.

## AC10. Test Suite Activation

**Given:** `tests/Feature/*` contains 24 test files.
**When:** `phpunit tests/Feature/AuthTest.php tests/Feature/RoleAccessTest.php tests/Feature/RouteNamingTest.php` is run.
**Then:** All 36 tests pass with 393 assertions.

**Test:** Confirmed — 36/36 PASS.
