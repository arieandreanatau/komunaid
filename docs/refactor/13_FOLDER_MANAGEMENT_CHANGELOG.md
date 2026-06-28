# 13 — Folder Management Changelog

## 2026-06-28

| Date | Type | Old Path | New Path | Action | Reason |
|---|---|---|---|---|---|
| 2026-06-28 | created | — | `app/Http/Controllers/Simplified/Auth/{Register,Login}Controller.php` | created | v2 single-flow |
| 2026-06-28 | created | — | `app/Http/Controllers/Simplified/Dashboard/{Dashboard,Submissions}Controller.php` | created | v2 dashboard |
| 2026-06-28 | created | — | `app/Http/Controllers/Simplified/Submission/SubmissionController.php` | created | v2 submission |
| 2026-06-28 | created | — | `app/Http/Controllers/Simplified/Admin/ApprovalController.php` | created | v2 admin approval |
| 2026-06-28 | created | — | `app/Services/Simplified/**/*.php` | created | business logic |
| 2026-06-28 | created | — | `app/Http/Requests/Simplified/**/*.php` | created | validation |
| 2026-06-28 | created | — | `app/Models/CompanyMember.php` | created | company-user pivot |
| 2026-06-28 | created | — | `resources/views/simplified/**` | created | v2 UI |
| 2026-06-28 | created | — | `routes/modules/simplified.php` | created | v2 route registry |
| 2026-06-28 | refactored | `routes/web.php` | (sama) | edited | require new module file |
| 2026-06-28 | refactored | `app/Models/Community.php` | (sama) | edited | tambah approval fillable |
| 2026-06-28 | refactored | `app/Models/Brand.php` | (sama) | edited | tambah approval + contact fillable |
| 2026-06-28 | refactored | `app/Models/Company.php` | (sama) | edited | tambah approval + tax_number |
| 2026-06-28 | created | — | `database/migrations/2026_06_28_*` (7 files) | created | schema alignment |
| 2026-06-28 | created | — | `scripts/smoke_simplified.php` | created | E2E test |
| 2026-06-28 | created | — | `docs/auth/01..13_*.md` | created | auth docs |
| 2026-06-28 | created | — | `docs/refactor/01..13_*.md` | created | refactor docs |
| 2026-06-28 | (kept) | `app/Http/Controllers/{Auth,Member,CommunityOwner,BrandOwner,CompanyOwner,Superadmin,Public,Shared}/*` | (sama) | keep | legacy coexistence |

## Not Deleted (verified safe)
- composer.json/lock, package.json/lock, vite.config.js, artisan, bootstrap/app.php
- Semua config (`config/*`)
- Semua model legacy
- Semua migration lama
- `.env*` files
- `storage/app/public/*`
- `public/build/manifest.json`
