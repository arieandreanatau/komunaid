# 01 — Folder Management Baseline

| Command | Result | Error | Notes |
|---|---|---|---|
| `git status` | clean working tree (no repo changes) | n/a | Subfolder `.git` exists. |
| `php artisan optimize:clear` | DONE (cache, compiled, config, events, routes, views) | none | Run pre-cleanup. |
| `php artisan route:list` | ~250+ routes | none | Exported to `docs/_audit_routes.json`. |
| `php artisan migrate:status` | 103+ migrations, all `[N] Ran` | none | Migrations 1-4 batches all `Ran`. |
| `php artisan test` | no test suite | n/a | `tests/` kosong, `phpunit.xml` ada tapi tanpa test. |
| `npm run build` | not executed (project is server-rendered; tidak ada Vite asset JS critical) | n/a | Disarankan skip. |
| `composer dump-autoload` | OK | none | (jika diperlukan) |

## Pre-Cleanup Issues
1. Tidak ada test sama sekali (`tests/` kosong).
2. Banyak ENUM/schema tidak konsisten dengan simplified flow (lihat `docs/auth/12_BUG_FIXING_REPORT.md`).
3. `community_brand_members` tidak cocok untuk company-only owner pivot (diganti `company_members`).
4. Legacy role-segmented flow masih dominan (60+ controllers, ~100 view files) — coexist dengan v2.
