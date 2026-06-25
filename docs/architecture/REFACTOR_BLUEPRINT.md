# KomunaID V1 + V2 — Refactor Blueprint

> Companion to `ARCHITECTURE_AUDIT_V1_V2.md`. Defines the structural refactor scope, target architecture, and execution phases with command-exit gates.

## 1. Target Architecture

- **Stack:** Laravel 11 monolith, Blade-only, MySQL, Vite, Spatie Permission.
- **Routing:** single `routes/web.php` grouped by comment blocks. Module split (`routes/modules/*`) only if a group exceeds ~200 lines after refactor.
- **Controllers:** role-namespaced; one FormRequest per write action; one Policy per owner-scoped resource.
- **Services:** only for logic that is duplicated, complex, or called from multiple places.
- **Middleware:** `auth`, `role:<name>`, `not.banned` (new), `redirect.by.role`.
- **Database:** additive migrations only. V1 tables stay (documented as deprecated where V2 supersedes). No drops, no renames of shipped migrations.
- **UI:** one layout per role. Shared components under `resources/views/components/`. Empty-state partial on every index. Premium-lock component for gated features.

## 2. Folder Structure Final

```
app/
  Http/
    Controllers/ (existing role groups, additive)
    Middleware/   (add: EnsureNotBanned)
    Requests/     (existing)
  Models/         (existing, fix banned_at cast)
  Policies/       (existing, audit usage)
  Services/       (existing, audit usage)
  Support/
    Enums/        (RoleEnum if not present)
    Helpers/      (existing)
bootstrap/app.php  (add not.banned alias)
database/
  migrations/     (additive only)
  seeders/        (Master/, Demo/ already split)
resources/
  views/
    layouts/      (one per role)
    components/   (shared, used by 2+ roles)
docs/
  architecture/   (this file + audit + module + route + db + role)
  deployment/
  qa/
  handover/
tests/             (existing, keep)
```

## 3. Module Boundary

- **Public:** read-only, no auth.
- **Auth:** login, register, logout, onboarding, role request.
- **Member:** profile, interests, communities, events, friends, bookmarks, gallery, history.
- **Community Owner:** own community CRUD, management, members, volunteers, campaigns, events, donations, finance, collaborations.
- **Brand Owner:** own brand CRUD, community discovery, collaborations.
- **Company Owner:** own company CRUD, brands, collaborations.
- **Superadmin:** all of the above + CMS + premium + admin chat + documentation + audit.
- **Shared:** language switch, notifications, exports.

## 4. Route Grouping (web.php)

Order in the file:
1. Public + language switch
2. Auth
3. Member
4. Community Owner
5. Brand Owner
6. Company Owner
7. Superadmin
8. Shared utility
9. Fallback 404 (add `Route::fallback` if missing)

Rules:
- No duplicate route names.
- No write on GET.
- Middleware chain: `auth` → `not.banned` (new) → `role:<name>`.

## 5. Controller & Service Rules

- Controller = request/response only.
- FormRequest for every write action.
- Policy for owner-scoped resources (community, brand, company, event, collaboration).
- Services: `Auth/RedirectByRoleService`, `Auth/RoleRequestService`, `Auth/BannedUserService`, `Dashboard/*`, `Community/*`, `Event/*`, `Brand/*`, `Company/*`, `Collaboration/*`, `Premium/*`, `Cms/*`, `AdminChat/*`, `Documentation/*` (stub), `Export/*`.
- No new service without a real caller.

## 6. Database Strategy

- No edit of shipped migrations.
- Add additive migrations for any missing index/default.
- V1 deprecated tables stay. Document in `DATABASE_REVIEW.md`.
- Soft deletes on `User` (already in place).
- Banned handling: `users.banned_at` + `not.banned` middleware.
- Sessions: `SESSION_DRIVER=database` (table exists).
- Cache: `CACHE_STORE=database` (table exists).
- Queue: `QUEUE_CONNECTION=sync` (acceptable for MVP).

## 7. Role & Permission

- Spatie Permission is the auth source of truth.
- `RoleEnum` mirrors the role strings used by Spatie.
- New middleware `EnsureNotBanned` reads `auth()->user()->banned_at` and `status`. If banned, force logout and redirect to `/account/restricted` (or `/banned` if route exists).
- Apply `not.banned` to all `auth`+`role:*` middleware chains for non-superadmin areas.

## 8. UI / Layout

- One layout per role: `layouts/public`, `layouts/auth`, `layouts/superadmin`, `layouts/member`, `layouts/community-owner`, `layouts/brand-owner`, `layouts/company-owner`.
- Shared components: button, card, badge, table, empty-state, alert, pagination, form-input, lang-switcher, premium-lock.
- Sidebar: every menu link must resolve to a real route. If a feature is Phase 2, remove the menu link or guard with `@can`.

## 9. Refactor Execution Phases

Each phase ends with a green gate (command exit 0). See `REFACTOR_EXECUTION_REPORT.md` for live status.

| Phase | Goal | Gate |
|---|---|---|
| 0 | Baseline | `php artisan optimize:clear` + `route:list` |
| 1 | Autoload + class fix | `route:list` clean |
| 2 | Middleware + auth | guest→login, wrong-role→403, banned→logout |
| 3 | Route consolidation | `route:list` clean, sidebar smoke |
| 4 | Controller + request refactor | `php artisan test` |
| 5 | Database cleanup (additive) | `php artisan migrate:status` all Ran |
| 6 | Seeder consolidation | Master + Demo idempotent |
| 7 | UI/layout fix | 20-page smoke |
| 8 | Premium/multilang/chat/docs | modules render 200 |
| 9 | Build + test | `npm run build` + `php artisan test` clean |
| 10 | Security + smoke | 20 smoke + 10 security pass |
| 11 | Documentation + handover | all 10 doc files exist |

## 10. Risk & Rollback

- Each phase gates on a command exit code.
- Working branch: `refactor/v1-v2-audit`.
- Rollback: `git checkout main` or `git reset --hard <last-phase-tag>`.
- No DB destructive operations in any phase → rollback is safe.

## 11. Confirmation Gate

The audit + blueprint are complete. Implementation proceeds now per the user's go-ahead (plan execution mode).
