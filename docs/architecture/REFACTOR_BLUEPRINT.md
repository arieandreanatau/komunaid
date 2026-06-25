# KomunaID V1 + V2 — Refactor Blueprint

**Status:** Ready for execution
**Date:** 2026-06-25

---

## 1. Target Architecture

- **Pattern:** Laravel 11 modular monolith.
- **Auth/Roles:** Spatie Permission (single source of truth). `users.status` (`active|banned|suspended`) for account state.
- **Authorization:** Spatie role middleware on route groups; Policies for resource ownership (Community, Event, Brand, Company, AdminConversation, Cms, Documentation).
- **Business logic:** Service layer for cross-cutting concerns (RedirectByRole, RoleRequest, PremiumAccess, EventFinance).
- **Validation:** FormRequest per module (already grouped by role).
- **Storage:** S3-compatible driver (Cloudflare R2) for production; local for dev.
- **Session/Cache/Queue:** database driver.
- **Scheduler:** Vercel Cron → HTTP route `GET /api/cron/scheduler?token=...`.

---

## 2. Folder Structure Final

```
app/
  Console/Commands/         # artisan commands (existing + new)
  Http/
    Controllers/
      Auth/                # login, register, onboarding, role request, dashboard redirect
      Public/              # public home, communities, events, blogs, contact, language
      Superadmin/          # superadmin dashboard, members, communities, brands, companies, CMS, premium, admin-chat, documentation, approval-center
      Member/              # member dashboard, profile, interests, communities, events, friends, bookmarks, gallery, history, wallet, donations
      CommunityOwner/      # community owner dashboard, communities, members, regions, subgroups, events, donations, finance, collaborations, proposals, wallet
      BrandOwner/          # brand dashboard, brands, campaigns, staff, collaborations, proposals, community-directory, settings
      CompanyOwner/        # company dashboard, companies, brands, collaborations, settings
      Shared/              # (NEW) cross-role controllers
    Middleware/
      ActiveUser.php       # canonical
      EnsureNotBanned.php  # canonical
      EnsureSuperadmin.php
      EnsureNotSuperadmin.php
      VerifyCronToken.php  # NEW
    Requests/
      Auth/, Superadmin/, Member/, Community/, Event/, Brand/, Company/, Collaboration/, Premium/, Cms/, AdminChat/, Documentation/
  Models/                  # 70 models (root, Laravel convention)
  Policies/
    AdminConversationPolicy.php
    BrandPolicy.php
    CollaborationRequestPolicy.php
    CommunityPolicy.php
    EventPolicy.php
    CompanyPolicy.php        # NEW
    CmsPolicy.php            # NEW
    DocumentationPolicy.php  # NEW
  Services/
    Auth/RedirectByRoleService.php          # exists
    Auth/RoleRequestService.php             # NEW
    Documentation/DocumentationGeneratorService.php  # exists
    Premium/PremiumAccessService.php         # NEW
    Event/EventFinanceService.php            # NEW
  Support/
    Enums/                  # NEW
      RoleEnum.php
      EventStatusEnum.php
      CommunityStatusEnum.php
      RoleRequestStatusEnum.php
      CollaborationStatusEnum.php
      SubscriptionStatusEnum.php
      FeatureKeyEnum.php
    Helpers/                # NEW
      FormatHelper.php
  ViewModels/               # NEW (optional, only if used)
database/
  migrations/               # 99 migrations, all additive, none edited
  seeders/
    DatabaseSeeder.php
    Master/                 # NEW (idempotent core: roles, permissions, plans)
    Demo/                   # NEW (sample data)
docs/
  architecture/
  deployment/
  qa/
  handover/
resources/
  views/
    layouts/                # 7 layouts
    public/, auth/, superadmin/, member/, community-owner/, brand-owner/, company-owner/, shared/
    components/             # NEW (x-button, x-card, x-table, x-empty-state, x-alert, x-pagination, x-form.input, x-language-switcher, x-premium-locked)
    partials/
  css/
  js/
routes/
  web.php                   # 426 routes, grouped by role
  console.php
  cron.php                  # NEW (not loaded by web; loaded by manual require in api/index.php OR /api/cron/scheduler route inline)
tests/
  Feature/  Unit/
vercel.json                 # updated
.vercelignore               # audited
api/index.php               # existing Vercel entry
```

---

## 3. Module Boundary

| Module | Controller namespace | Routes | Models | Policies |
|---|---|---|---|---|
| Public | `Public` | `/`, `/komunitas`, `/events`, `/blogs`, `/about`, `/contact`, `/language/{locale}` | `CmsPage`, `Blog`, `HomepageSection`, `Event` (public view), `Community` (public view) | — |
| Auth | `Auth` | `/login`, `/register`, `/logout`, `/forgot-password`, `/reset-password/{token}`, `/onboarding`, `/role-request`, `/dashboard` | `User`, `Profile`, `RoleRequest`, `LoginLog` | — |
| Member | `Member` | `/member/*` | `User`, `Profile`, `Friend`, `Bookmark`, `Gallery`, `History`, `Donation`, `Wallet`, `WalletTransaction` | — (role middleware only) |
| Community Owner | `CommunityOwner` | `/community-own/*` | `Community`, `CommunityMember`, `CommunityManagement`, `CommunityVolunteer`, `CommunityCampaign`, `CommunityRegion`, `CommunitySubgroup`, `Event`, `EventRegistration`, `EventDonation`, `EventFinance*`, `Wallet`, `Donation`, `CollaborationRequest`, `CollaborationProposal` | `CommunityPolicy`, `EventPolicy` |
| Brand Owner | `BrandOwner` | `/brand/*` | `Brand`, `BrandMember`, `BrandOwnershipTransfer`, `Campaign` (brand-level), `CollaborationRequest`, `CollaborationProposal` | `BrandPolicy`, `CollaborationRequestPolicy` |
| Company Owner | `CompanyOwner` | `/company-owner/*` | `Company`, `CompanyBrandMember`, `CollaborationProposal` | `CompanyPolicy` (NEW) |
| Superadmin | `Superadmin` | `/superadmin/*` | All | `AdminConversationPolicy` + per-resource policy where exists |
| Admin Chat | `Superadmin\AdminChatController` | `/superadmin/admin-chat/*` | `AdminConversation`, `AdminConversationParticipant`, `AdminMessage`, `User` | `AdminConversationPolicy` |
| CMS | `Superadmin\Cms\*` | `/superadmin/cms/*` | `CmsPage`, `Blog`, `HomepageSection`, `ContactSetting`, `Suggestion` | `CmsPolicy` (NEW) |
| Documentation | `Superadmin\DocumentationController` | `/superadmin/documentation/*` | `DocumentationFile` | `DocumentationPolicy` (NEW) |
| Cron | (inline in web.php or `routes/cron.php`) | `/api/cron/scheduler` | — | — |

---

## 4. Route Grouping

`web.php` grouped by header comment:

```php
// ============================================================
// PUBLIC
// ============================================================
Route::get('/', [PublicHomeController::class, 'index'])->name('home');
Route::get('/komunitas', ...)->name('communities.directory');
...

// ============================================================
// AUTH
// ============================================================
Route::middleware('guest')->group(function () { ... });
Route::middleware('auth')->group(function () { ... });

// ============================================================
// MEMBER
// ============================================================
Route::middleware(['auth', 'role:member|admin_platform|superadmin', 'not.banned'])
    ->prefix('member')->name('member.')->group(function () { ... });

// ============================================================
// COMMUNITY OWNER
// ============================================================
Route::middleware(['auth', 'role:community_owner|admin_platform|superadmin', 'not.banned'])
    ->prefix('community-own')->name('community.')->group(function () { ... });

// ============================================================
// BRAND OWNER
// ============================================================
Route::middleware(['auth', 'role:brand_owner|admin_platform|superadmin', 'not.banned'])
    ->prefix('brand')->name('brand.')->group(function () { ... });

// ============================================================
// COMPANY OWNER
// ============================================================
Route::middleware(['auth', 'role:company_owner|admin_platform|superadmin', 'not.banned'])
    ->prefix('company-owner')->name('company-owner.')->group(function () { ... });

// ============================================================
// SUPERADMIN
// ============================================================
Route::middleware(['auth', 'admin', 'not.banned'])
    ->prefix('superadmin')->name('superadmin.')->group(function () { ... });

// ============================================================
// CRON (token-protected)
// ============================================================
Route::get('/api/cron/scheduler', [CronController::class, 'run'])
    ->middleware('cron.token')
    ->name('cron.scheduler');
```

---

## 5. Controller Grouping

Already grouped (see §3). No restructure needed; only **canonicalization** of namespacing and **addition** of `Shared/` for cross-role.

**Quick wins to apply:**
- Verify each `Route::resource()` and `Route::apiResource()` uses correct model binding (`{brand}`, `{company}`, `{community}`).
- Verify all controllers in grouped folders use `__construct()` middleware alias properly.
- Add missing `create`/`store`/`update` actions for resource controllers.

---

## 6. Service Layer Plan

| Service | Responsibility | Status |
|---|---|---|
| `Auth/RedirectByRoleService` | resolve dashboard URL per role/status | Exists (tested) |
| `Auth/RoleRequestService` | approve/reject, log, sync Spatie role | NEW |
| `Documentation/DocumentationGeneratorService` | generate docs from routes/DB | Exists |
| `Premium/PremiumAccessService` | check `FeatureLock` per feature key | NEW |
| `Event/EventFinanceService` | compute summary, append transactions | NEW |

**Rule:** Service only when logic is duplicated OR complex. Not for trivial CRUD.

---

## 7. Request Validation Plan

- All write controllers use `FormRequest` (already in `app/Http/Requests/`).
- Per-module dirs already present (Auth, Superadmin, Member, CommunityOwner, BrandOwner, CompanyOwner, RoleRequest).
- Quick win: add missing requests for `community.events.store`, `brand.brands.store`, `company.companies.store` if not present.

---

## 8. Policy/Authorization Plan

| Policy | Status | Action |
|---|---|---|
| `CommunityPolicy` | exists | OK |
| `EventPolicy` | exists | OK |
| `BrandPolicy` | exists | OK |
| `CollaborationRequestPolicy` | exists | OK |
| `AdminConversationPolicy` | exists | OK |
| `CompanyPolicy` | **missing** | NEW (use `BrandPolicy` as template) |
| `CmsPolicy` | **missing** | NEW (superadmin-only by role middleware is enough for MVP) |
| `DocumentationPolicy` | **missing** | NEW |

**Minimal version:** Create stubs that return `true` for superadmin, ownership check for owner. Register in `AuthServiceProvider`.

---

## 9. Model Relationship Plan

Spot-check via `tests/Feature/MemberModuleTest.php` (passing). All relationships used in dashboard views resolve.

**Potential risks (to spot-check during refactor):**
- `User` has 12+ `hasMany` relationships; ensure no N+1 in dashboards.
- `Community` has many morph/relation (members, regions, subgroups, events, campaigns, etc.). Ensure `withCount` used in dashboard.
- `Event` has registrations, donations, finance, galleries, chats, volunteer-campaigns.

**Action:** Add `with(['relation'])->paginate()` patterns in dashboards; defer eager-loading fix to Phase 2.

---

## 10. Migration Cleanup Plan

**JANGAN:**
- Drop tabel.
- Edit migration lama.
- `migrate:fresh`.

**Boleh:**
- Tambah migration baru ALTER (hanya jika missing column/invalid FK).
- Tambah index baru.

**Identified deprecated tables (no action now):**
- `collaboration_requests` (V1)
- `campaigns` (V1 brand-level — keep, different scope)
- `donations` (V1 community-donation — keep, different scope)
- `master_regions` (V1 — mark deprecated in model)

---

## 11. Seeder Consolidation Plan

- `DatabaseSeeder.php` (existing) keeps orchestration.
- New `database/seeders/Master/`:
  - `RolePermissionSeeder.php` (idempotent — `firstOrCreate`)
  - `PremiumPlanSeeder.php`
  - `EventTypeSeeder.php`
  - `CollaborationTypeSeeder.php`
  - `RegionSeeder.php`
  - `InterestSeeder.php`
- New `database/seeders/Demo/`:
  - `DemoUserSeeder.php` (superadmin demo, member demo, etc.)
  - `DemoCommunitySeeder.php`
  - `DemoEventSeeder.php`
- DatabaseSeeder decides which to call based on `APP_ENV`.

**Phase 2.** Mark as future work in `REFACTOR_EXECUTION_REPORT.md`.

---

## 12. UI Layout Plan

7 layouts (already exist):
- `resources/views/layouts/public.blade.php`
- `resources/views/layouts/auth.blade.php`
- `resources/views/layouts/superadmin.blade.php`
- `resources/views/layouts/member.blade.php`
- `resources/views/layouts/community-owner.blade.php`
- `resources/views/layouts/brand-owner.blade.php`
- `resources/views/layouts/company-owner.blade.php`

**Quick win:** Verify each layout `@yield('content')` matches view extension. No new layouts needed for refactor.

**Components (NEW, minimal):**
- `<x-language-switcher>` — list of `config('app.available_locales')` with current marked.

**Phase 2:** Build the full shared component library.

---

## 13. Role/Middleware Plan

- Spatie roles seeded: superadmin, admin_platform, member, community_owner, community_pengurus, community_volunteer, brand_owner, company_owner, event_volunteer.
- `users.status`: active | banned | suspended.
- Middleware aliases (existing in `bootstrap/app.php`):
  - `role`, `permission`, `role_or_permission` (Spatie)
  - `admin` (superadmin + admin_platform)
  - `not.superadmin` (used on public auth to prevent superadmin login via user panel)
  - `active_user` (status check)
  - `not.banned` (status check)
- **NEW alias:** `cron.token` → `VerifyCronToken` middleware.

**Cleanup (Phase 2):** Remove `EnsureActiveUser.php` and `EnsureUserIsActive.php` (duplicate of `ActiveUser.php`).

---

## 14. Testing Plan

Existing (149 passing):
- Auth, RoleAccess, Security, Public, Member, Community, Brand, Company, Event, AdminChat, Documentation, Multilanguage, Premium, SuperadminDashboard, RedirectByRole.

**After refactor, add:**
- `Tests\Feature\CronRouteTest` — token-protected, rejects missing/invalid token.
- `Tests\Feature\CompanyPolicyTest` — owner can update, non-owner gets 403.
- `Tests\Feature\PremiumAccessTest` — feature lock blocks member, superadmin bypasses.

**Phase 2.**

---

## 15. Deployment Plan

1. Vercel env vars (set in project settings, not commit):
   - `APP_KEY` (=`php artisan key:generate --show` result)
   - `APP_URL` (=production URL)
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `DB_CONNECTION=mysql`
   - `DB_HOST=` Hostinger MySQL host
   - `DB_PORT=3306`
   - `DB_DATABASE=`
   - `DB_USERNAME=`
   - `DB_PASSWORD=`
   - `SESSION_DRIVER=database`
   - `SESSION_LIFETIME=120`
   - `CACHE_STORE=database`
   - `QUEUE_CONNECTION=database`
   - `FILESYSTEM_DISK=s3`
   - `AWS_ACCESS_KEY_ID=` (R2)
   - `AWS_SECRET_ACCESS_KEY=` (R2)
   - `AWS_DEFAULT_REGION=auto` (R2)
   - `AWS_ENDPOINT=` (R2 endpoint, e.g. `https://<account>.r2.cloudflarestorage.com`)
   - `AWS_BUCKET=` (R2 bucket name)
   - `AWS_URL=` (public R2 URL or custom domain)
   - `CRON_SECRET=` (long random string)
   - `LOG_CHANNEL=stderr`
   - `LOG_LEVEL=info`
2. Update `vercel.json` (see §3 plan).
3. Update `.vercelignore`.
4. Push branch to remote; Vercel auto-deploy.
5. Smoke test production URL.

---

## 16. Risk & Rollback Plan

| Risk | Mitigation | Rollback |
|---|---|---|
| Refactor breaks route:list | Run after each phase | Revert commit |
| Middleware consolidation breaks access | Run `php artisan test` after each change | Revert commit |
| Vercel build fails | Test `vercel build` locally if possible | Revert vercel.json |
| R2 credentials wrong | Test with local `.env` | Revert env, no code change |
| Cron route unprotected | Token middleware + test | Revert route addition |
| Migration ALTER fails | Backup DB first; never run `migrate:fresh` | Restore DB backup |

---

## 17. Execution Phases

1. Create git branch.
2. Add `app/Support/Enums/`.
3. Add `app/Support/Helpers/FormatHelper.php`.
4. Add `VerifyCronToken` middleware.
5. Add `CompanyPolicy`, `CmsPolicy`, `DocumentationPolicy`.
6. Add `RoleRequestService`, `PremiumAccessService`, `EventFinanceService`.
7. Add `/api/cron/scheduler` route + register in `web.php` (last group).
8. Update `vercel.json`.
9. Update `.vercelignore`.
10. Update `.env.example` with all new env keys.
11. Re-run all baselines.
12. Write all 10 doc files.
13. Final report.

Estimated file changes: ~25 modified, ~12 new, 0 destructive.
