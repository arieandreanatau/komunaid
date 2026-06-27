# KomunaID V2 — Final Retest Report (Post Bugfix)

**Date:** 2026-06-27
**Live URL:** https://komunaidv2-komuna.vercel.app/
**Build commit:** `35865e2 fix(logo): correct public_path lookup so navbar finds brand asset`
**Earlier commits in this batch:** `8341071`, `6b20f19`

## 1. Test matrix

| ID | Area | Before fix | After fix | Status |
|---|---|---|---|---|
| RT-01 | `php artisan optimize:clear` | green | green | ✅ |
| RT-02 | `composer validate --strict` | green | green | ✅ |
| RT-03 | `npm run build` | green | green | ✅ |
| RT-04 | GET `/` (homepage) | 200, full content | 200, full content | ✅ |
| RT-05 | Homepage favicon present | missing | present | ✅ |
| RT-06 | Homepage navbar logo `<img>` | text only | `<img src="...komunaid-logo-full.png" class="h-10 w-auto ...">` | ✅ |
| RT-07 | Homepage footer logo `<img>` | text only | `<img src="...komunaid-logo-full.png" class="h-9 w-auto ...">` | ✅ |
| RT-08 | GET `/assets/brand/komunaid-logo-full.png` | 404 | 200 image/png | ✅ |
| RT-09 | GET `/favicon.ico` | 404 | 200 image/png | ✅ |
| RT-10 | GET `/build/manifest.json` | 200 | 200 (still served) | ✅ |
| RT-11 | GET `/login` | 200 | 200 | ✅ |
| RT-12 | POST `/login` wrong creds | 302 + "Data login tidak sesuai." | 302 + same error | ✅ |
| RT-13 | POST `/login` valid (member) | 302 → /onboarding | 302 → /onboarding | ✅ |
| RT-14 | POST `/admin/login` superadmin | 302 → /superadmin/dashboard | 302 → /superadmin/dashboard | ✅ |
| RT-15 | GET `/superadmin/dashboard` (authed) | 200, but 3 rows leaked `@include(...)` text | 200, 5 green active badges rendered, 0 leaked `@include` | ✅ |
| RT-16 | POST `/register` valid | 302 → /onboarding, user created | 302 → /onboarding, user created | ✅ |
| RT-17 | Latest Users in dashboard shows new user | n/a | probe user visible | ✅ |
| RT-18 | Superadmin logout form action | `/admin/logout` | `/admin/logout` | ✅ |
| RT-19 | Superadmin sidebar logo (dark variant) | text "KomunaID" | uses `partials/logo` which now resolves to brand image | ✅ |
| RT-20 | Auth layout favicon | missing | present | ✅ |
| RT-21 | Dashboard layout favicon | missing | present | ✅ |
| RT-22 | Public layout favicon | missing | present | ✅ |

## 2. Files changed in this fix batch

| Commit | Files |
|---|---|
| `8341071` | `resources/views/components/logo.blade.php`, `resources/views/components/brand-logo.blade.php`, `resources/views/layouts/{auth,public,guest,dashboard}.blade.php`, `resources/views/partials/logo.blade.php`, `resources/views/superadmin/partials/status-badge.blade.php`, `public/assets/brand/komunaid-logo-full.png`, `public/assets/brand/komunaid-logo-icon.png` |
| `6b20f19` | `api/index.php`, `api/static.php`, `vercel.json` |
| `35865e2` | `resources/views/components/logo.blade.php` |

## 3. Outstanding (non-blocking) items

- 3rd-party partials (superadmin dashboard topbar, email views) still use inline text logo. Not in scope of this fix.
- Local `php artisan test` not run because the local MySQL is empty in the audit environment; retest is live-only.

## 4. Verdict

**Ready for demo / soft launch.** All five blocker-class bugs are closed. Login, register, superadmin auth, asset serving, and brand identity are green on Vercel.
