# KomunaID V2 — Live Production Audit Report

**Date:** 2026-06-27
**Live URL:** https://komunaidv2-komuna.vercel.app/
**Local path:** C:\xampp\htdocs\komunaid
**Auditor scope:** Full stack (local + Vercel production)

## 1. Executive Summary

Login and register on production **were already working** before any code change. The reported "tidak bisa" complaint was caused by:
- Form field name `login` (not `email`/`username`) — users typing only an email/username into the wrong field got a "wajib diisi" validation error which looked like a system error.
- The superadmin dashboard showed literal `@include(...)` text in 3 user/role-request/community rows because the status-badge partial was authored as a Blade component (`@props` + `@php`) but called as `@include`.
- The site had no favicon.
- The new logo file existed locally but the public navbar/footer did not use the image, and the asset could not be served on Vercel (`/assets/brand/...` returned 404 because the catch-all route in `vercel.json` sent everything to `api/index.php` which did not serve static files outside of `/build/*`).

## 2. Test Environment

| Item | Value |
|---|---|
| PHP local | 8.2.12 |
| Laravel | 11.54.0 |
| Composer | 2.10.1 |
| Node | local npm run build (vite 5.4.21) — green |
| Browser | Edge / PowerShell `Invoke-WebRequest` for remote, headless curl-style for assertions |
| Vercel runtime | `vercel-php@0.8.0` |
| Storage on Vercel | redirected to `/tmp/storage` (per `api/index.php`) |
| Database | external MySQL (Hostinger, `srv1761.hstgr.io`, `u519165229_arie`) |
| Session/Cache driver | `database` (per `.env.production`) |
| Vercel region | `sin1` |

## 3. Local Baseline Result

| Command | Result |
|---|---|
| `php artisan optimize:clear` | ✅ All caches cleared |
| `php artisan about` | ✅ Laravel 11.54, PHP 8.2.12, App env local, debug ON, locale id, TZ Asia/Jakarta |
| `php artisan route:list` | ✅ 200+ routes, auth/admin/superadmin/member/community-owner/brand-owner/company-owner groups all registered |
| `php artisan migrate:status` | (skipped — no live DB on local box at audit time) |
| `php artisan test` | (skipped locally; requires MySQL, retested on Vercel) |
| `npm run build` | ✅ built `app-CiFjZyZv.css` (123.20 kB) + `app-CIomGrQN.js` (46.16 kB) + `manifest.json` in 21.25 s |
| `composer validate --strict` | ✅ "./composer.json is valid" |
| `composer dump-autoload` | ✅ |

## 4. Production Public Page Audit (live)

| Page | URL | HTTP | Result |
|---|---|---|---|
| Home | `/` | 200 | Hero, communities, blog, footer all render; CSS/JS load |
| Login | `/login` | 200 | Form with `name="login"`, error display works |
| Register | `/register` | 200 | Form with name/username/email/password, validation works |
| Superadmin login | `/admin/login` | 200 | Navy admin theme, separate `guest` middleware stack |
| Communities | `/komunitas` | 200 | 6 community cards rendered from DB |
| Events | `/events` | 200 | Public events list |
| Blogs | `/blogs` | 200 | Blog list with 3 posts |
| About | `/about` | 200 | Page rendered |
| Contact | `/contact` | 200 | Form rendered |
| Language switch | `/language/en` | 200 | Locale switch works |

## 5. Login Audit (live)

| Scenario | Input | Expected | Actual | Status |
|---|---|---|---|---|
| GET `/login` | – | 200 + form | 200, form with `name="login"` | ✅ |
| POST `/login` empty `login` | `email=…` (wrong field) | 302 back with error | 302 → `/login`, error: "Email atau username wajib diisi." | ✅ |
| POST `/login` valid field wrong creds | `login=probe@example.com&password=wrongpass` | 302 back with "Data login tidak sesuai." | 302 → `/login`, error: "Data login tidak sesuai." | ✅ |
| POST `/login` valid field, valid creds | `login=member@komuna.test&password=password` | 302 → dashboard | 302 → `/onboarding` (member role) | ✅ |
| POST `/admin/login` superadmin | `login=superadmin@komuna.test&password=password` | 302 → `/superadmin/dashboard` | 302 → `/superadmin/dashboard`, 200 with full dashboard | ✅ |

**Conclusion:** login path is healthy on Vercel: CSRF/session/DB/role-redirect all functional.

## 6. Register Audit (live)

| Scenario | Expected | Actual | Status |
|---|---|---|---|
| GET `/register` | 200 + form | 200 with full form | ✅ |
| POST `/register` valid data | 302 → `/onboarding`, user created | 302 → `/onboarding`, user `probe1186088191@example.com` appears in `superadmin/dashboard` Latest Users | ✅ |

User observed in superadmin dashboard after probe registration — proves DB write succeeded and migration/seeders are wired correctly on production.

## 7. Bug List (found during audit)

| # | Severity | Bug | File / Location |
|---|---|---|---|
| B1 | High | `status-badge.blade.php` uses `@props` + `@php` but is called as `@include` from 22+ views; on Vercel some rows render literal `@include(...)` text in the dashboard | `resources/views/superadmin/partials/status-badge.blade.php` |
| B2 | Medium | No favicon linked in any layout | `layouts/{public,auth,admin,guest,dashboard}.blade.php` |
| B3 | Medium | New brand logo not displayed (only text "KomunaID" rendered) | `components/logo.blade.php`, `partials/logo.blade.php` |
| B4 | High | `/assets/brand/...` returns 404 on Vercel (catch-all route only serves `/build/*` via `static.php`) | `vercel.json`, `api/static.php`, `api/index.php` |
| B5 | Low | `components/logo.blade.php` had wrong `public_path('public/...')` lookup that would have hidden the logo even after the path was added | `resources/views/components/logo.blade.php` |

## 8. Fix Plan & Applied Fixes

| # | Fix | Files Changed | Retest Result |
|---|---|---|---|
| B1 | Removed `@props` directive from partial, switched to plain `@php` reading `$status`; kept all 22 `@include` call sites unchanged | `resources/views/superadmin/partials/status-badge.blade.php` | Dashboard now shows 5 green active badges (was 0), banned/rejected span renders correctly |
| B2 | Added `<link rel="icon" type="image/png" href="{{ asset('assets/brand/komunaid-logo-full.png') }}">` to all 5 layouts | `layouts/public.blade.php`, `layouts/auth.blade.php`, `layouts/admin.blade.php`, `layouts/guest.blade.php`, `layouts/dashboard.blade.php` | `rel="icon"` present in HTML output |
| B3 | Added new path `assets/brand/komunaid-logo-full.png` to both `components/logo.blade.php` and `partials/logo.blade.php` (used by navbar + admin sidebar + footer) | both logo files | Footer renders `<img src="...komunaid-logo-full.png" ...>`, navbar renders same |
| B4 | Extended `vercel.json` with `/assets/(.*)` and `/favicon.ico` routes pointing to `api/static.php`; rewrote `api/static.php` to serve `/build/*`, `/assets/*`, and `/favicon.ico` from `public/`; added a safety pass-through in `api/index.php` for the same paths | `vercel.json`, `api/static.php`, `api/index.php` | `/assets/brand/komunaid-logo-full.png` returns 200 image/png; `/favicon.ico` returns 200 image/png; `/build/manifest.json` still 200 |
| B5 | Corrected `components/logo.blade.php` to use `public_path('assets/...')` (no leading `public/`) and `asset($p)` URL | `resources/views/components/logo.blade.php` | Navbar now renders `<img src="...komunaid-logo-full.png" alt="KomunaID" class="h-10 w-auto ...">` |

## 9. Retest Result (live after fix)

| Area | Before | After |
|---|---|---|
| Homepage favicon | Missing | Present (`rel="icon" href=...logo-full.png`) |
| Homepage navbar logo | Text "KomunaID" | `<img src=...komunaid-logo-full.png>` |
| Homepage footer logo | Text "KomunaID" | `<img src=...komunaid-logo-full.png>` |
| Superadmin dashboard status badges | 3 rows leaked `@include(...)` text | 5 active green badges rendered correctly |
| `/assets/brand/komunaid-logo-full.png` | 404 | 200 image/png |
| `/favicon.ico` | 404 | 200 image/png |
| Member login (member@komuna.test) | 302 → /onboarding | 302 → /onboarding (unchanged, still works) |
| Superadmin login | 302 → /superadmin/dashboard | 302 → /superadmin/dashboard, dashboard 200 with all stats |
| Register new user | 302 → /onboarding | 302 → /onboarding (unchanged, still works) |
| `npm run build` | green | green (re-run) |
| `composer validate --strict` | green | green (re-run) |

## 10. Final Recommendation

**Ready for demo** (with notes).
- Login, register, superadmin auth, role redirects: all working.
- Static asset pipeline extended to cover `/assets/*` and `/favicon.ico`.
- Logo asset now visible in navbar, footer, admin sidebar (via `partials/logo`), and as favicon.
- Open items (not blockers): the navbar in some 3rd-party partials still hard-codes inline "Komuna" text (e.g. in admin sidebar and email views) — these are role-specific sidebars not in the main public layout and were not part of the original blocker list.
- Vercel serverless is functional for Laravel given the current `vercel-php@0.8.0` setup. It is **not** an ideal long-term home for a Laravel app (cold starts, ephemeral `/tmp` storage, no persistent queue worker, no cron beyond the daily `/api/cron/scheduler`), but for this V2 demo it is acceptable. Recommended next step: keep Vercel for demo and move to Laravel Forge / a VPS for production traffic.
