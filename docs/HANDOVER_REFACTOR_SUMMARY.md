# KomunaID V1 + V2 — Refactor Handover Summary

**Date:** 2026-06-25
**Branch:** `refactor/v1-v2-audit`
**Status:** Code & tests GREEN, deploy-ready with operator prerequisites.

---

## TL;DR

KomunaID V1 + V2 codebase is **functional** (188 tests passing, 428 routes, 99 migrations). This refactor **adds** structural support + wires services + wires policies + cleans up folder management without **breaking** anything:
- Tahap 1: 17 new files (enums, helpers, middleware, policies, services, cron controller, docs) + 5 modified.
- Tahap 2: 5 new files (controller + view + 3 tests) + 3 modified controllers/services + 1 route added + 17 new tests.
- Tahap 3: 3 new policies wired to ~10 controllers + 3 new test files (22 tests) + `AppServiceProvider` registered in `bootstrap/app.php`.
- Tahap 4: Folder management cleanup — delete 3 dead Guest/ controllers + 3 views + 1 dead Community/ controller + 2 duplicate middlewares; merge 8 enums to `App\Enums`; move 6 services into 5 sub-folders; split 24 seeders into `Master/` (15) + `Demo/` (9); create 5 new Blade components.
- 0 migrations added/removed.
- 0 features removed.
- 0 security weakened.

---

## What's New (For Next Developer)

### Enums — use these instead of string literals
```php
use App\Support\Enums\RoleEnum;
use App\Support\Enums\EventStatusEnum;
use App\Support\Enums\CommunityStatusEnum;
use App\Support\Enums\RoleRequestStatusEnum;
use App\Support\Enums\CollaborationStatusEnum;
use App\Support\Enums\SubscriptionStatusEnum;
use App\Support\Enums\FeatureKeyEnum;
use App\Support\Enums\UserStatusEnum;
```

### Helper
```php
use App\Support\Helpers\FormatHelper;
FormatHelper::currency(150000);        // "IDR 150.000"
FormatHelper::date($carbon);           // "25 Jun 2026"
FormatHelper::roleLabel('community_owner'); // "Community Owner"
```

### Middleware
```php
// In routes:
Route::get('/api/cron/scheduler', ...)->middleware('cron.token');
```

### Services
```php
use App\Services\Auth\RoleRequestService;
use App\Services\Premium\PremiumAccessService;
use App\Services\Event\EventFinanceService;
```

### Policies (auto-discovered)
- `App\Policies\CompanyPolicy`
- `App\Policies\CmsPolicy`
- `App\Policies\DocumentationPolicy`

Use in controllers:
```php
$this->authorize('update', $company);
```

### Cron route
- `GET /api/cron/scheduler?token=<CRON_SECRET>` → runs `php artisan schedule:run`.
- Vercel Cron triggers this every minute.

---

## Deploy Checklist (Operator Action)

1. Generate `APP_KEY`: `php artisan key:generate --show` → set in Vercel env.
2. Hostinger MySQL → Remote MySQL → add Vercel egress IP (or `%`).
3. Cloudflare R2 → create bucket `komunaid-uploads` → generate API token.
4. Vercel project env (full list in `docs/deployment/DEPLOYMENT_RECOMMENDATION.md`).
5. Push branch to GitHub → Vercel auto-builds.
6. Test: `/up` returns 200, homepage loads, login works.
7. Test cron: `curl https://<url>/api/cron/scheduler?token=$CRON_SECRET` → `{"ok":true}`.

---

## Architecture Decision Record

| Decision | Choice | Why |
|---|---|---|
| Deployment | Vercel + Hostinger MySQL + R2 + Vercel Cron | User-confirmed |
| File upload | Cloudflare R2 (S3 driver) | Persistent on serverless |
| Session/Cache/Queue | Database driver | Serverless-safe; tables exist |
| Scheduler | Vercel Cron → artisan schedule:run | No external service needed |
| Auth | Spatie Permission + `users.status` for banned | Single source of truth |
| Service layer | Add for cross-cutting logic only | Don't bloat simple CRUD |
| Routes | Single `web.php` grouped by role | < 500 routes, no need to split |
| API | Not exposed (Blade SSR) | MVP; Phase 2 if needed |
| Real-time | Not implemented | Out of scope |
| Payment gateway | Not implemented | Out of scope |

---

## Known Limits (Document, Do Not Fix Now)

1. **Dual collaboration concept** (`CollaborationRequest` V1 + `CollaborationProposal` V2). Both kept for data integrity. Consolidate in Phase 2.
2. **Triple region concept** (`master_regions` V1, `regions` V2, `community_regions` V1). All kept; marked in audit doc.
3. **Dual donation concept** (`donations` V1 community + `event_donations` V2 event). Different scopes; kept.
4. **No PDF export** (CSV only). Phase 2.
5. **No email queue / real email** (uses log driver). Phase 2.
6. **No 2FA / no rate limit on login**. Phase 2.
7. **No CSP/X-Frame-Options headers**. Phase 2.
8. **Models still flat** at `app/Models/` (69 files). Domain grouping deferred — high-risk refactor (would require updating 100s of `App\Models\X::class` references). Phase 5 candidate.
9. **CollaborationProposalPolicy** not yet created. Phase 5.
10. **PremiumAccessService used in demo route only.** Production feature-gated views (analytics, bulk export) need Blade directive + controller middleware. Phase 5.
11. **5 new Blade components created** but not yet adopted by views. Migrate views in Phase 5.
12. **Demo seeders not in test** — split into `Demo/` folder but not yet auto-discovered by `RefreshDatabase`. Phase 5.

---

## File Inventory (Delta From Baseline)

### New files (Tahap 1: 17 code + 7 docs, Tahap 2: 4 code + 3 tests = 31)
```
# Tahap 1
app/Support/Enums/RoleEnum.php
app/Support/Enums/UserStatusEnum.php
app/Support/Enums/EventStatusEnum.php
app/Support/Enums/CommunityStatusEnum.php
app/Support/Enums/RoleRequestStatusEnum.php
app/Support/Enums/CollaborationStatusEnum.php
app/Support/Enums/SubscriptionStatusEnum.php
app/Support/Enums/FeatureKeyEnum.php
app/Support/Helpers/FormatHelper.php
app/Http/Middleware/VerifyCronToken.php
app/Http/Controllers/Shared/CronController.php
app/Policies/CompanyPolicy.php
app/Policies/CmsPolicy.php
app/Policies/DocumentationPolicy.php
app/Services/Auth/RoleRequestService.php
app/Services/Premium/PremiumAccessService.php
app/Services/Event/EventFinanceService.php
docs/architecture/ARCHITECTURE_AUDIT_V1_V2.md
docs/architecture/REFACTOR_BLUEPRINT.md
docs/architecture/REFACTOR_EXECUTION_REPORT.md
docs/architecture/MODULE_STRUCTURE.md
docs/architecture/ROUTE_STRUCTURE.md
docs/architecture/DATABASE_REVIEW.md
docs/architecture/ROLE_PERMISSION_REVIEW.md
docs/deployment/DEPLOYMENT_RECOMMENDATION.md
docs/qa/REFACTOR_TEST_RESULT.md
docs/HANDOVER_REFACTOR_SUMMARY.md

# Tahap 2
app/Http/Controllers/Member/PremiumDemoController.php
resources/views/premium/demo.blade.php
tests/Feature/CronRouteTest.php
tests/Feature/CompanyPolicyTest.php
tests/Feature/EventFinanceServiceTest.php
```

### Modified (Tahap 1: 5, Tahap 2: 3 = 8)
```
# Tahap 1
bootstrap/app.php        # +1 middleware alias
routes/web.php           # +1 route + 1 use
vercel.json              # full rewrite
.vercelignore            # expanded
.env.example             # new env keys

# Tahap 2
app/Http/Controllers/Superadmin/RoleRequestController.php   # uses RoleRequestService
app/Http/Controllers/CommunityOwner/EventFinanceController.php   # uses EventFinanceService
app/Services/Auth/RoleRequestService.php                       # rewritten to use App\Enums\ApprovalStatus
routes/web.php                                                 # +1 route (member.premium-demo)

# Tahap 3
bootstrap/app.php                                            # +withProviders([AppServiceProvider]) (CRITICAL: was missing, caused all Gate::policy() to be no-ops)
app/Providers/AppServiceProvider.php                          # Gate::policy() for Company, Blog, HomepageSection, ContactSetting, Suggestion, DocumentationFile
app/Policies/CmsPolicy.php                                    # rewritten: uses platform_admin (DB has this role, not admin_platform), accepts generic $resource for multi-model binding
app/Policies/DocumentationPolicy.php                          # uses platform_admin
app/Http/Controllers/CompanyOwner/CompanyController.php       # +AuthorizesRequests trait; replace inline ownership with $this->authorize() in all 6 methods
app/Http/Controllers/CompanyOwner/CompanyBrandController.php  # replace service-based check with $this->authorize('manageBrands')
app/Http/Controllers/Superadmin/CompanyController.php         # +AuthorizesRequests trait; authorize() in all 8 methods
app/Http/Controllers/Superadmin/Cms/SuperadminCmsDashboardController.php  # authorize('viewAny', Blog::class)
app/Http/Controllers/Superadmin/Cms/SuperadminBlogController.php           # authorize() in 8 methods
app/Http/Controllers/Superadmin/Cms/SuperadminPageController.php           # authorize() in 3 methods
app/Http/Controllers/Superadmin/Cms/SuperadminHomepageSectionController.php # authorize() in 6 methods
app/Http/Controllers/Superadmin/Cms/SuperadminContactSettingController.php  # authorize() in 2 methods
app/Http/Controllers/Superadmin/Cms/SuperadminSuggestionController.php     # authorize() in 4 methods
app/Http/Controllers/Superadmin/DocumentationController.php  # authorize() in 10 methods (index, generate*, show, preview, download, destroy, routeInventory, databaseInventory)
```

### New tests (Tahap 3)
tests/Feature/CmsPolicyTest.php            # 8 tests
tests/Feature/DocumentationPolicyTest.php  # 8 tests
tests/Feature/HttpPolicyEnforcementTest.php # 6 tests

### Tahap 4 cleanup (no new tests; 188 still pass)

# Deleted
app/Http/Controllers/Guest/                       # 3 dead controllers (HomeController, CommunityDirectoryController, PublicEventController) — not referenced in routes/web.php
app/Http/Controllers/Community/DashboardController.php  # 1 dead controller
resources/views/guest/community-detail.blade.php
resources/views/guest/community-directory.blade.php
resources/views/guest/home.blade.php
app/Http/Middleware/EnsureActiveUser.php          # duplicate of ActiveUser
app/Http/Middleware/EnsureUserIsActive.php        # duplicate of ActiveUser
app/Support/Enums/                                # 8 enums moved to app/Enums/

# Moved
app/Support/Enums/RoleEnum.php              -> app/Enums/RoleEnum.php
app/Support/Enums/UserStatusEnum.php        -> app/Enums/UserStatusEnum.php
app/Support/Enums/EventStatusEnum.php       -> app/Enums/EventStatusEnum.php
app/Support/Enums/CommunityStatusEnum.php   -> app/Enums/CommunityStatusEnum.php
app/Support/Enums/RoleRequestStatusEnum.php -> app/Enums/RoleRequestStatusEnum.php
app/Support/Enums/CollaborationStatusEnum.php -> app/Enums/CollaborationStatusEnum.php
app/Support/Enums/SubscriptionStatusEnum.php -> app/Enums/SubscriptionStatusEnum.php
app/Support/Enums/FeatureKeyEnum.php        -> app/Enums/FeatureKeyEnum.php
app/Services/BrandOwnershipService.php          -> app/Services/Brand/BrandOwnershipService.php
app/Services/CollaborationProposalService.php   -> app/Services/Collaboration/CollaborationProposalService.php
app/Services/CompanyOwnershipService.php        -> app/Services/Company/CompanyOwnershipService.php
app/Services/CsvExportService.php               -> app/Services/Export/CsvExportService.php
app/Services/PlatformFeeService.php             -> app/Services/Finance/PlatformFeeService.php
app/Services/WalletService.php                  -> app/Services/Finance/WalletService.php
15 idempotent seeders                              -> database/seeders/Master/
9 demo seeders                                    -> database/seeders/Demo/

# New Blade components
resources/views/components/button.blade.php
resources/views/components/table.blade.php
resources/views/components/pagination.blade.php
resources/views/components/form/input.blade.php
resources/views/components/language-switcher.blade.php

# Modified
routes/web.php                    # removed 2 unused Guest/ imports
database/seeders/DatabaseSeeder.php  # updated use statements for 24 seeders

### Removed (0 functional files)
None. (10 dead/duplicate files removed.)

---

## Next Prompt Recommendations

| # | Prompt | Why |
|---|---|---|
| 1 | `Wire Models to Sub-folders` | Group 69 models by domain (Identity, Community, Event, etc.). High-risk — needs mass `use` updates. Use scripted approach. |
| 2 | `Migrate Views to Components` | 5 new components created; migrate member dashboard, superadmin members index, community index, etc. |
| 3 | `Apply Enums in Controllers` | Replace string literals (`'superadmin'`, `'published'`) with `RoleEnum::` / `EventStatusEnum::` etc. |
| 4 | `Create CollaborationProposalPolicy` | Currently V2 collaboration uses role middleware only. |
| 5 | `Email & Notification Setup` | Switch from `log` driver to real SMTP/Resend + queue worker (cron-triggered). |
| 6 | `Security Hardening` | CSP, X-Frame, rate limit on login, 2FA. |
| 7 | `Performance Optimization` | Eager loading, index audit, fulltext search, N+1 dashboard. |

---

## Sign-Off

Refactor phase complete. No blockers. Ready for operator-driven deploy per `DEPLOYMENT_RECOMMENDATION.md`.
