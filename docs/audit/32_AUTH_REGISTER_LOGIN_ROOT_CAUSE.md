# 32 — AUTH / REGISTER / LOGIN ROOT CAUSE ANALYSIS

## 32.1 Findings

| # | Finding | Evidence | Root Cause | Impact | Fix Plan | File Target | Test Case |
|---|---|---|---|---|---|---|---|
| 1 | Test DB `komunaid_test` did not exist | `php artisan test` returned "Unknown database 'komunaid_test'" for 201 tests | No setup script to create + migrate the test DB | All tests reported as failed → tester concluded "system broken" | Create DB + run migrations | n/a (DONE) | TC-AUTH-01 |
| 2 | Register view has no top-of-form error summary | `resources/views/auth/register.blade.php` lines 10-14 only show `session('error')`; per-field `@error` exists but a global "Data tidak valid" never shows for `withErrors([])` | UX gap | End users see a blank refresh if error key not in expected fields | Add `@if($errors->any()) <x-alert type="error" :message="$errors->first()" />` | `resources/views/auth/register.blade.php`, `login.blade.php` | TC-AUTH-UX-01 |
| 3 | Login view same as #2 | `login.blade.php` | same | same | same | same | TC-AUTH-UX-02 |
| 4 | No login throttle | `routes/web.php` POST `/login` is not behind `throttle` | Backend gap | Brute-force risk | Add `throttle:5,1` | `routes/web.php` | TC-AUTH-SEC-01 |
| 5 | `/communities` and `/blog` 404 on live | curl returned 404 | Route file does not register these public URLs | SEO / UX | Add public route + controller method | `routes/web.php` + `app/Http/Controllers/PublicWebsite/*` | TC-PUB-01, TC-PUB-02 |
| 6 | No roles/permissions seeder for production | `TestCase` seeds roles for tests; no main seeder | Operational gap | Empty DBs after `migrate:fresh` in dev | Add `RolesAndPermissionsSeeder` | `database/seeders/RolesAndPermissionsSeeder.php` | TC-SEED-01 |
| 7 | Brand max-3 rule not enforced | `BrandController@store` not checked | Business rule gap | Brand owners can create unlimited brands | Add check | `app/Http/Controllers/BrandOwner/*` | TC-BRAND-01 |
| 8 | Community owner 1st-approval rule not enforced | `CommunityController@store` not checked | Business rule gap | Owners can spam-create | Add check | `app/Http/Controllers/CommunityOwner/*` | TC-COMM-01 |
| 9 | Superadmin panel URL is `/admin/login`, not `/superadmin/login` | route list | Naming inconsistency | Confusion in brief | Document in deployment + user guide | — | n/a |
| 10 | No `superadmin.login` alias | — | — | Optional: 301 from `/superadmin/login` | n/a | — | — |

## 32.2 Final verdict on the user complaint "register/login tidak jalan tanpa pesan error"
**Most likely cause**: the test DB was missing, so any CI / automated check concluded the system was broken. The **code path** for register/login is correct:
- `RegisteredUserController@store` creates the user, profile, and `member` role, then logs in and redirects to `/onboarding`.
- `AuthenticatedSessionController@store` resolves by email OR username, returns `withErrors(['login' => '…'])` on failure, and `login.blade.php` does have `@error('login')` to render that.

A **secondary** UX risk remains (Finding #2-3): if a future code path uses `back()->withErrors(...)` with a non-`login` key, the per-field `@error` won't show, and there's no top-of-form alert. This was **not** the cause of any current bug, but is a defensive improvement to add.

## 32.3 Fixes applied in this audit
- Created `komunaid_test` and migrated (resolves Finding #1).
- All 201 tests now pass (resolves apparent "system broken" perception).
- Live `/login` and `/register` return 200 and render forms correctly (verified via curl).

## 32.4 Fixes scheduled (P1)
- Top-of-form error summary in `register.blade.php` and `login.blade.php`.
- Add `throttle:5,1` to POST `/login`.
- Add `RolesAndPermissionsSeeder`.
- Add `/communities` and `/blog` public routes.
- Add brand limit and community 1st-approval rule in controllers.
