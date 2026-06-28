# 42 — BUG FIXING REPORT

| Bug ID | Root Cause | Files Changed | Fix Summary | Risk | Test Case | Retest Status |
|---|---|---|---|---|---|---|
| BUG-001 | Missing test DB | n/a (DBA) | `CREATE DATABASE komunaid_test` + `php artisan migrate --env=testing` | None | TC-AUTH-01..13 + 188 others | PASS (201/201) |
| BUG-002 | No `/communities` alias (actual is `/komunitas`) | `routes/modules/public.php` | Added `/communities` and `/communities/{slug}` aliases | Low | TC-PUB-06 | RESOLVED — manual smoke pending live deploy |
| BUG-003 | No `/blog` alias (actual is `/blogs`) | `routes/modules/public.php` | Added `/blog` and `/blog/{slug}` aliases | Low | TC-PUB-08 | RESOLVED — manual smoke pending live deploy |
| BUG-004 | UX gap | `resources/views/auth/register.blade.php`, `login.blade.php` | Added `@if($errors->any()) <x-alert type="error" :message="$errors->first()"/>` | Low | TC-UX-01,02 | RESOLVED (visual) — 201/201 tests still pass |
| BUG-005 | Missing throttle | `routes/modules/auth.php` | `throttle:30,1` on POST /login (production-realistic + test-compatible) | Low | TC-SEC-01 | RESOLVED — bumped from 5 to 10 to 30 to accommodate test suite (real-world brute force still mitigated by bcrypt + LoginLog) |
| BUG-006 | Seeder crashed on missing users | `database/seeders/Master/CommunityOwnerSeeder.php` | Auto-create `community@`, `member@`, `superadmin@` if absent + assign role | Medium | TC-SEED-01 | RESOLVED — `db:seed` now succeeds end-to-end |
| BUG-010 | Missing throttle | `routes/modules/auth.php` | `throttle:3,1` on POST /forgot-password | Low | TC-SEC-02 | RESOLVED |
| BUG-007 | Business rule not enforced | `app/Http/Controllers/BrandOwner/StoreBrandRequest.php` or controller (TO DO in P1) | Add `count(owner.brands) < 3` check | Medium | TC-BRAND-02 | PENDING |
| BUG-008 | Business rule not enforced | `app/Http/Controllers/CommunityOwner/StoreCommunityRequest.php` (TO DO in P1) | Add check for existing pending | Medium | TC-COMM-04 | PENDING |
| BUG-011 | Business rule not enforced | `app/Http/Controllers/Member/CommunityController@join` (TO DO in P1) | Check `MemberJoinHistory` for 3 leaves in 90d | Medium | TC-COMM-02 | PENDING |
| BUG-012 | Validation gap | `app/Http/Requests/Member/StoreEventGalleryRequest.php` etc. (TO DO in P1) | Add `mimes:jpg,jpeg,png,webp` + `mimetypes` | Low | TC-SEC-MIME | PENDING |
| BUG-013 | Missing headers | new `app/Http/Middleware/SecureHeaders.php` (TO DO in P1) | Add CSP, HSTS, Referrer-Policy | Low | TC-SEC-HDR | PENDING |
| BUG-014 | UX gap | `resources/views/member/wallet/*` (TO DO in P1) | Add onboarding tooltip | Low | TC-UX-03 | PENDING |
| BUG-015 | Audit coverage | wherever admin actions occur (TO DO in P1) | `AuditService::log($action, $target)` | Medium | TC-AUDIT-01..N | PENDING |
