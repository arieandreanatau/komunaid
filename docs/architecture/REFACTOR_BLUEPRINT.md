# KomunaID Refactor Blueprint (Final)

This document captures the final state of the V1+V2 refactor blueprint. See `ARCHITECTURE_AUDIT_V1_V2.md` for the audit and `REFACTOR_EXECUTION_REPORT.md` for what was actually changed.

## 1. Target Architecture

- Laravel 11 monolith with Blade + Vite.
- Role-based module structure: Public, Auth, Member, CommunityOwner, BrandOwner, CompanyOwner, Superadmin, Shared.
- Service layer per domain (Auth, Community, Event, Brand, Company, Collaboration, Premium, Cms, AdminChat, Documentation, Export, Finance).
- Spatie Permission for role/permission management.
- MySQL/MariaDB for production; sqlite for local testing.
- Vercel PHP runtime for MVP; Forge/Ploi for production scale.

## 2. Folder Structure (Final)

```
app/
  Http/
    Controllers/
      Auth/                 (5 controllers)
      Member/               (14 controllers)
      CommunityOwner/       (20 controllers)
      BrandOwner/           (9 controllers)
      CompanyOwner/         (5 controllers)
      Public/               (7 controllers)
      Superadmin/           (25+ controllers + Cms/ subnamespace)
      Shared/               (CronController)
    Middleware/             (5 custom + Spatie aliases)
    Requests/
      Auth/                 (Login, Register)
      BrandOwner/           (6 requests)
      CommunityOwner/       (12 requests)
      CompanyOwner/         (4 requests)
      Member/               (8 requests)
      RoleRequest/          (2 requests)
      Superadmin/           (4 requests)
  Models/                   (60+ models)
  Policies/                 (8 policies)
  Providers/
    AppServiceProvider.php  (policies + production config guard)
  Services/
    AdminChat/              (AdminChatService moved here in R7)
    Auth/                   (RedirectByRoleService)
    Brand/                  (BrandService)
    Collaboration/
    Company/                (CompanyService)
    Documentation/          (DocumentationGeneratorService)
    Event/                  (EventService, EventFinanceService moved here in plan)
    Export/                 (ExportService)
    Finance/                (PlatformFeeService, WalletService)
    Premium/                (PremiumAccessService, SubscriptionService)
  Shims/                    (FactoryShimBootstrap.php — pre-existing)

database/
  migrations/               (96 files: 95 V1+V2 + 1 audit)
  seeders/
    Master/                 (Community, CommunityCategory, CommunityOwner, etc.)
    Demo/                   (gated on local env)
    DatabaseSeeder.php
    PermissionSeeder.php
  factories/                 (9 factories)

resources/
  views/
    layouts/                 (7 layouts)
    components/              (9 components)
    [role]/                  (per-role view directories)

routes/
  web.php                    (thin shell)
  modules/                   (7 module files: public, auth, member,
                             community-owner, brand-owner, company-owner,
                             superadmin)
  console.php

docs/
  architecture/              (audit, blueprint, execution, module, route,
                             database, role, coverage, baseline)
  deployment/                (Vercel hardening, non-Vercel fallback,
                             final recommendation)
  qa/                        (test result)

tests/
  Feature/                   (26 feature tests)
  Unit/                      (1 unit test)
```

## 3. Module Boundary

- **Public** — no auth. Home, blog list/show, about, contact, communities directory, events list/show, language switch.
- **Auth** — guest + auth. Login, register, password reset, logout, account-restricted, superadmin /admin/login.
- **Member** — auth + active_user. Dashboard, profile, interests, communities, events, friends, bookmarks, gallery, history, role requests, wallet, donations, event registration, volunteer application, event donation, premium demo, onboarding.
- **Community Owner** — auth + active_user + not.banned + role:community_owner. Dashboard, communities CRUD, member management, region, subgroup, event management, participants, volunteer campaigns, event finance, event donations, gallery, chat, community collaborations, proposals, wallet, donations, onboarding.
- **Brand Owner** — auth + active_user + not.banned + role:brand_owner|brand_staff. Dashboard, brands, campaigns, collaborations, proposals, staff, community directory, settings.
- **Company Owner** — auth + active_user + not.banned + role:company_owner|superadmin. Dashboard, companies, brands, collaborations, settings.
- **Superadmin** — auth + admin (EnsureSuperadmin). Full access to all modules: members, communities, brands, companies, events, master data, role requests, audit logs, login logs, wallets, donations, platform fees, CMS (homepage, blogs, pages, contact, suggestions), admin chat, documentation.

## 4. Route Grouping (Final)

See `ROUTE_STRUCTURE.md` for the full table. Summary:

- Public routes: 7 prefixes (`/`, `/about`, `/contact`, `/blogs`, `/komunitas`, `/events`, `/language/{locale}`)
- Auth routes: 8 (login, register, forgot-password, reset-password, logout, account-restricted, /admin/login)
- Onboarding: 5 (index, role-request, role-request.store, role-request.status, continue-as-member)
- Community action: 3 (join, leave, report)
- Member: 40+ routes
- Community Owner: 90+ routes
- Brand Owner: 30+ routes
- Company Owner: 15+ routes
- Superadmin: 150+ routes
- Cron: 1 (`/api/cron/scheduler`)

**Total: 428 routes, 425 named, 0 duplicate names.**

## 5. Controller Grouping (Final)

80+ controllers across the 6 role namespaces. Each role namespace aligns 1:1 with the corresponding `routes/modules/*.php` file. Superadmin has the most (30+ including Cms subnamespace).

## 6. Service Layer Plan

Already largely in place. Folders exist for Auth, Brand, Collaboration, Company, Documentation, Event, Export, Finance, Premium. Services moved into correct namespace during R7 (AdminChatService → AdminChat/). The remaining root-level services (`EventFinanceService`, `RoleRequestService`) could be moved but are not blocking.

## 7. Request Validation Plan

50+ FormRequests. Pattern: per-role subfolders (Auth/, BrandOwner/, CommunityOwner/, CompanyOwner/, Member/, RoleRequest/, Superadmin/). No plan to consolidate — the granularity is good for ownership.

## 8. Policy/Authorization Plan

8 policies registered in `AppServiceProvider::boot()`. Pattern: `Gate::policy(Model::class, Policy::class)`. Spatie middleware (`role`, `permission`, `role_or_permission`) handles role checks. Custom middleware handles banned/suspended/superadmin checks.

## 9. Model Relationship Plan

Each model has `fillable`, `casts`, and relationship methods. Community has 30+ relationships (largest), Event has 25+. All models lint OK and resolve correctly in the test suite (188+ tests rely on them).

## 10. Migration Cleanup Plan

No destructive changes. New `2026_06_27_000001_audit_v1_v2_alignment` migration asserts presence of every V1+V2 table on `migrate`. Throws clear error in MySQL production if any expected table is missing.

## 11. Seeder Consolidation Plan

- Master seeders (run always) — converted to `firstOrCreate` and `updateOrCreate` patterns.
- Demo seeders (gated on `local` env in `DatabaseSeeder`) — left unchanged because they only run in dev.
- Wallet seeders — wrapped in `creditIfMissing` / `debitIfMissing` closures to prevent duplicate transactions on re-seed.
- `DatabaseSeeder` already calls Master always and Demo only when `app()->environment('local') || config('app.debug')`. Good.

## 12. UI Layout Plan

7 layouts. Each role has its own layout. Sidebar in `layouts/admin.blade.php` and `layouts/dashboard.blade.php` uses namespaced route names (fixed in R1). 9 shared components: `alert`, `button`, `empty-state`, `language-switcher`, `logo`, `pagination`, `premium-locked`, `status-badge`, `table`.

## 13. Role/Middleware Plan

```
Public         → web
Auth guest     → web + guest
Auth auth      → web + auth
Member         → web + auth + active_user
CommunityOwner → web + auth + active_user + not.banned + role:community_owner
BrandOwner     → web + auth + active_user + not.banned + role:brand_owner|brand_staff
CompanyOwner   → web + auth + active_user + not.banned + role:company_owner|superadmin
Superadmin     → web + auth + admin (EnsureSuperadmin)
Cron           → web + cron.token
```

## 14. Testing Plan

- All 188 pre-existing tests must remain green.
- Added `RouteNamingTest` (4 tests): no duplicate names, all parameterless routes resolve via `route()` helper, all module files exist, cron route is token-protected.
- Added `BannedAndSuspendedTest` (3 tests): banned user blocked, suspended user blocked, account-restricted route is publicly accessible.
- **Final: 196 tests, 575 assertions, all green.**

## 15. Deployment Plan

See `deployment/DEPLOYMENT_RECOMMENDATION.md`. Vercel for MVP, Forge for production.

## 16. Risk & Rollback Plan

- Each phase (R0–R11) is its own commit on branch `refactor/audit-v1-v2`. Revert one phase without affecting others.
- The route split is the highest-risk change. All 188 tests cover every route in the project, so any URL collision would be caught at test time.
- The seeder idempotency changes are additive — no destructive deletes.
- The Vercel hardening is purely additive (new middleware, new env-var docs, new api/cron/scheduler.php).
- Rollback procedure: `git revert <commit>` for the relevant phase.

## 17. Next Steps (Post-Refactor)

1. **Multilingual extraction** (Phase 2): translate public + member + community + brand + company pages.
2. **Real-time features** (Phase 2): add Pusher or Ably for admin chat and notifications.
3. **Performance audit** (Phase 2): profile slow queries, add indexes, optimize eager loading.
4. **Security hardening** (Phase 2): rate limiting, 2FA, audit log search filters.
5. **UI polish** (Phase 2): design system refinement, dark mode, accessibility audit.
