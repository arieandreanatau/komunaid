# Baseline Snapshot (Phase R0)

Date: 2026-06-27
Branch: `refactor/audit-v1-v2`
Environment: local XAMPP, MariaDB 10.4.32, PHP 8.2.12, Composer 2.10.1

## Results

| Command | Exit | Result | Severity |
|---------|------|--------|----------|
| `php artisan optimize:clear` | 0 | Cleared all caches | n/a |
| `php artisan about` | 0 | Laravel 11.54, APP_DEBUG=true, locale=id, cache=file, session=file, queue=database, DB=mysql | n/a |
| `php artisan route:list` | 0 | **428 routes** registered (Laravel deduped method+path; **names still collide** — see R1) | High (semantic bug) |
| `php artisan migrate:status` | 0 | All 95 migrations **Ran** in local `komunaid` database | OK |
| `php artisan test` | 0 | **188 passed / 246 assertions** in 141.98s | OK |
| `npm run build` | 0 | Vite built 55 modules, manifest.json + app.css + app.js emitted | OK |
| `composer validate` | 0 | `./composer.json is valid` | OK |

## Environment Fixes Required Before Testing

1. MariaDB was not running. Started with `mysqld.exe --skip-grant-tables` (background process `bgp_f082aea4a0013ksR8QXAe5VI43`).
2. `mysql.user` table is corrupted (Aria storage engine checksum error) — UPDATE statements on `mysql.user` fail.
3. Databases `komunaid` and `komunaid_test` were created manually.

## Critical Issues Identified From Baseline

| Issue | Severity | Source | Phase |
|-------|----------|--------|-------|
| Duplicate route names (20+ collisions) | High | route:list inspection | R1 |
| Session driver = `file` (Vercel-incompatible) | High | `php artisan about` | R9 |
| Cache store = `file` (Vercel-incompatible) | High | `php artisan about` | R9 |
| Default `DB_CONNECTION=mysql` will fail on Vercel cold start without external DB | Critical | vercel.json + config/database.php | R9 |
| No `Procfile`/`Dockerfile`/`render.yaml`/`fly.toml` for non-Vercel fallback | Medium | file listing | R9 docs |
| `Vercel` PHP runtime 10s default timeout will 504 on finance aggregation / export / docs | High | vercel-php@0.8.0 docs | R9 |
| Multilingual coverage = 1 module (`admin_chat` only) | Low | lang/ inspection | Phase 2 |
| `lang/{en,id}/admin_chat.php` only | Low | lang/ inspection | Phase 2 |

## Notes

- Project has 60+ models, 80+ controllers, 50+ FormRequests, 8 policies, multiple services.
- Migration set is 95 files: V1 (2024 batch) preserved; V2 (2026-06-25 batch) adds alters + new tables. No destructive `drop table` migrations in V2.
- Spatie Permission 6.25 active; 5 custom middleware registered in `bootstrap/app.php`.
- 7 layouts + 9 components in `resources/views/`.
- Seeders split into `Master/` and `Demo/` folders with `DatabaseSeeder` + `PermissionSeeder` at root.

Baseline established. R0 complete.
