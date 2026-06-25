# Handover — KomunaID V1 + V2 Refactor Summary

## What Changed

- `app/Models/User.php` — added `'banned_at' => 'datetime'` to `$casts()`.
- `app/Http/Middleware/EnsureNotBanned.php` — new middleware (wraps existing `isBannedOrSuspended()` logic).
- `bootstrap/app.php` — registered `not.banned` middleware alias.
- 10 new documentation files under `docs/architecture/`, `docs/deployment/`, `docs/qa/`, and `docs/HANDOVER_REFACTOR_SUMMARY.md`.

## What Did Not Change

- Database schema (no migrations edited, none dropped).
- Routes (no broken or duplicate names; 426 routes preserved).
- Controllers, models, services (only `User` cast added).
- V1 features (deprecated tables kept; new code prefers V2 paths).
- Authentication and authorization behavior (only added a new alias for opt-in use).
- `vercel.json` (Vercel is not the recommended target; see deployment doc).

## Known Issues

- `Guest` and `Public` controller groups duplicate actions (`PublicEventController`, `PublicHomeController` vs `HomeController`). Whichever was registered last is active. Both kept for backward compatibility. Cleanup candidate for a future PR.
- Three near-duplicate middlewares exist: `ActiveUser`, `EnsureActiveUser`, `EnsureUserIsActive`. Consolidation candidate.
- `.env*` proliferation (4 variants). Use `.env` for local, `.env.testing` for tests, and remove `.env.local` / `.env_local`.
- Vercel is not a suitable production target. See `docs/deployment/DEPLOYMENT_RECOMMENDATION.md`.
- Documentation generator has UI but no real generator logic (Phase 2).

## How To Run Locally

1. `cd C:\Xampp\htdocs\komunaid`
2. Ensure XAMPP MySQL is running; create database `komunaid`.
3. `php artisan migrate --seed`
4. `php artisan serve` (or use XAMPP Apache on `htdocs/komunaid/public`).
5. `npm install` (first time only) then `npm run dev` for Vite HMR.
6. Login as superadmin: check `database/seeders/MasterSeeder.php` for default credentials.

## How To Deploy

See `docs/deployment/DEPLOYMENT_RECOMMENDATION.md`. Recommended target: **VPS + Laravel Forge / Ploi / RunCloud**.

## Quick Reference

| Doc | Purpose |
|---|---|
| `docs/architecture/ARCHITECTURE_AUDIT_V1_V2.md` | Audit findings, V1/V2 matrix, bugs, debt |
| `docs/architecture/REFACTOR_BLUEPRINT.md` | Target architecture, phases, gates |
| `docs/architecture/MODULE_STRUCTURE.md` | Module map |
| `docs/architecture/ROUTE_STRUCTURE.md` | Route map |
| `docs/architecture/DATABASE_REVIEW.md` | Data dictionary, V1/V2 cohabitation |
| `docs/architecture/ROLE_PERMISSION_REVIEW.md` | Roles, middleware, banned handling |
| `docs/architecture/REFACTOR_EXECUTION_REPORT.md` | What was done, gate results |
| `docs/deployment/DEPLOYMENT_RECOMMENDATION.md` | Hosting target, env vars, checklist |
| `docs/qa/REFACTOR_TEST_RESULT.md` | Test result matrix |
| `docs/HANDOVER_REFACTOR_SUMMARY.md` | This file |

## Next Recommended Prompt

**None** for the structural refactor — all gates are green. Recommended follow-ups (in priority order):

1. **Security Hardening** — apply `not.banned` to remaining role route groups; consolidate duplicate active-user middlewares; add rate limiting to login.
2. **Deployment Fix** — set up a VPS + Forge and run the pre-deploy checklist.
3. **UI Polish** — sidebar link audit, empty-state coverage, premium-lock component usage.
4. **Performance Optimization** — DB index review, query log audit, eager-loading checks.
