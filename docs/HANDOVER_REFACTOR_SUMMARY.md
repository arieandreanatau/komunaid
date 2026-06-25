# KomunaID V1 + V2 — Refactor Handover Summary

**Date:** 2026-06-25
**Branch:** `refactor/v1-v2-audit`
**Status:** Code & tests GREEN, deploy-ready with operator prerequisites.

---

## TL;DR

KomunaID V1 + V2 codebase is **functional** (149 tests passing, 426 routes, 99 migrations). This refactor **adds** structural support without **breaking** anything:
- 17 new files (enums, helpers, middleware, policies, services, cron controller, docs).
- 5 files modified (bootstrap, routes, vercel.json, .vercelignore, .env.example).
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
8. **Middleware duplication** (`ActiveUser` + `EnsureActiveUser` + `EnsureUserIsActive`). Consolidate in Phase 2.
9. **Services not yet wired** to existing controllers (`RoleRequestService`, `PremiumAccessService`, `EventFinanceService`). Wire in Phase 2.

---

## File Inventory (Delta From Baseline)

### New files (17 code + 7 docs = 24)
```
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
```

### Modified (5)
```
bootstrap/app.php        # +1 middleware alias
routes/web.php           # +1 route + 1 use
vercel.json              # full rewrite
.vercelignore            # expanded
.env.example             # new env keys
```

### Removed (0)
None.

---

## Next Prompt Recommendations

| # | Prompt | Why |
|---|---|---|
| 1 | `Wire Services to Controllers` | Use RoleRequestService, PremiumAccessService, EventFinanceService in actual routes |
| 2 | `Add Cron + Policy Tests` | Cover new middleware + new policies in PHPUnit |
| 3 | `Email & Notification Setup` | Switch from `log` driver to real SMTP/Resend + queue |
| 4 | `Security Hardening` | CSP, X-Frame, rate limit on login, 2FA |
| 5 | `UI/UX Polish` | Build `<x-language-switcher>`, sidebar mobile polish, empty states, flash messages |
| 6 | `Performance Optimization` | Eager loading, index audit, fulltext search |
| 7 | `Documentation Generator Refactor` | Move DocumentationGeneratorService from controller to scheduled task |

---

## Sign-Off

Refactor phase complete. No blockers. Ready for operator-driven deploy per `DEPLOYMENT_RECOMMENDATION.md`.
