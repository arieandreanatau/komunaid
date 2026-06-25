# KomunaID V1 + V2 — Architecture Audit

**Project:** `C:\Xampp\htdocs\komunaid`
**Stack:** Laravel 11.54, PHP 8.2.12, MySQL, Blade, Vite 5.4, Spatie Permission 6, Breeze 2, Sanctum 4
**Audit date:** 2026-06-25
**Auditor scope:** V1 baseline + V2 enhancement, deploy-readiness for Vercel + Hostinger MySQL + Cloudflare R2 + Vercel Cron

---

## 1. Executive Summary

KomunaID is a **functional** community-collaboration platform with a substantial V1 (community/event/brand baseline) and a substantial V2 (company owner, finance, premium, admin chat, documentation, multilingual, friend/bookmark/gallery) implemented as additive migrations and additive controllers.

The current state is **green on core baselines**:
- `php artisan route:list` — 426 routes registered, 0 errors.
- `php artisan migrate:status` — 99 migrations, all `Ran` on batch `[1]`.
- `php artisan test` — **149 tests passing, 191 assertions** (smoke, role access, security, premium, multilanguage, admin chat, documentation, member, community, brand, company, event).
- `npm run build` — 55 modules transformed, ~46 kB JS + ~138 kB CSS.
- `composer validate` — valid.

Remaining technical debt is **structural and deployment-focused**:
1. **Vercel serverless mismatch** (storage, queue, scheduler, DB egress, env) — needs adaptation layer.
2. **Middleware duplication** (3 near-identical "active user" middlewares, 2 "not banned" middlewares with one used).
3. **Two collaboration concepts** (`CollaborationRequest` legacy V1 + `CollaborationProposal` V2) without deprecation plan.
4. **Legacy tables** in same DB: `Campaign` (vs `CommunityCampaign`), `Donation` (vs `EventDonation`), `MasterRegion`/`CommunityRegion` (vs `Region` v2) — no usage mark.
5. **No `Shared/` controllers** for `DashboardRedirectController` despite cross-role use (already in `Auth/` — acceptable, but file naming is inconsistent).
6. **No service layer** for cross-cutting concerns (premium gating, event finance) — business logic in controllers.
7. **No documented role/policy mapping** in code (Spatie roles in DB, no enum for code reference).
8. **No deployment runbook** for Vercel — `vercel.json` is present but missing `crons`, missing `buildCommand` for Vite, missing `outputDirectory` consideration.

Overall readiness: **Ready with Notes** for local dev / staging. **Not ready** for production Vercel until §3 deployment plan is applied.

---

## 2. Initial Baseline Result

| Command | Result | Error Summary | Severity | Root Cause Suspected | Action Plan |
|---|---|---|---|---|---|
| `php artisan optimize:clear` | First run failed: "bootstrap/cache directory must be present and writable" | Cache dirs missing | **Critical** | `bootstrap/cache` was empty (no `.gitkeep`), framework cannot write bootstrap cache | Recreate `bootstrap/cache` + storage subdirs (§A) |
| `php artisan optimize:clear` (after fix) | All 5 caches cleared OK | none | — | — | — |
| `php artisan about` | KomunaID / Laravel 11.54.0 / PHP 8.2.12 / local / debug ON | none | — | — | Set `APP_DEBUG=false` in production env |
| `php artisan route:list` | 426 routes | none | — | — | — |
| `php artisan migrate:status` | 99 migrations all Ran on batch [1] | none | — | — | — |
| `php artisan test` | **149 passed / 0 failed** | none | — | — | — |
| `npm run build` | 55 modules, 46.16 kB JS, 138.84 kB CSS | none | — | — | — |
| `composer validate` | valid | none | — | — | — |
| `composer dump-autoload` | not executed (no autoload issue from tests) | none | — | — | Optional: re-run after refactor |

---

## 3. V1 + V2 Coverage Analysis

| # | Module | V1 | V2 | Current | Gap | Action |
|---|---|---|---|---|---|---|
| 1 | Public Website (home, communities, events, blogs, about, contact) | ✓ | enhanced | Stable | — | Verify routes OK |
| 2 | Auth (login, register, forgot/reset, onboarding, role request) | ✓ | enhanced | Stable | — | OK |
| 3 | Role Request workflow + approval | ✓ | ✓ | Stable | — | OK |
| 4 | Superadmin (dashboard, members, communities, events, brands, companies, CMS, premium, admin chat, documentation) | ✓ | expanded | Stable | Approval center exists | OK |
| 5 | Member (profile, interests, communities, events, friends, bookmarks, gallery, history, wallet, donations) | partial | ✓ | Stable | — | OK |
| 6 | Community Owner (dashboard, communities, members, regions, subgroups, events, donations, wallet, finance) | ✓ | expanded | Stable | — | OK |
| 7 | Community Management (internal roles, management table, volunteers, campaigns, ownership transfer) | partial | ✓ | Stable | — | OK |
| 8 | Event Management (CRUD, status, archive, cancel, publish, registrations, payments, galleries, chats) | ✓ | expanded | Stable | — | OK |
| 9 | Volunteer (event volunteer campaign + applications, community volunteer) | partial | ✓ | Stable | — | OK |
| 10 | Donation (legacy + event donation + community donation confirm) | partial | ✓ | Mixed | Two tables: `donations` + `event_donations` | **Decision:** mark `donations` deprecated for community-context donations, keep both for backward compat (community owner confirm uses legacy `Donation` model — see §6) |
| 11 | Finance Report (event_finance_transactions, event_finance_summaries, platform_fees) | missing | ✓ | Stable | — | OK |
| 12 | Brand Owner (brands, campaigns, collaborations, proposals, community directory) | ✓ | expanded | Stable | — | OK |
| 13 | Company Owner (companies, brands, collaborations) | missing | ✓ | Stable | — | OK |
| 14 | Collaboration (CollaborationRequest legacy + CollaborationProposal v2) | partial | ✓ | **Conflict** | Both used; brand/company/proposal flow v2; community uses v1 + v2 mix | **Decision:** Phase 2. Keep both, but mark `CollaborationRequest` deprecated in model docblock. |
| 15 | Premium/Trial (premium_plans, subscriptions, feature_locks, feature_usages) | missing | ✓ | Stable | — | OK |
| 16 | CMS / Blog (cms_pages, blogs, homepage_sections, contact_settings, suggestions) | partial | ✓ | Stable | — | OK |
| 17 | Multilanguage (translations table, locale middleware) | missing | ✓ | Stable | — | OK |
| 18 | Admin Chat (admin_conversations, participants, messages) | missing | ✓ | Stable | — | OK |
| 19 | Documentation Generator (documentation_files + tools/database + tools/routes) | missing | ✓ | Stable | — | OK |
| 20 | Testing / QA (149 tests, 14 files) | minimal | ✓ | Good | Add more coverage for export, finance | **Enhance (Phase 2)** |
| 21 | Deployment (Vercel `vercel.json` + `api/index.php` serverless PHP) | broken | broken | **Failing on Vercel** | See §3 deployment table | Apply §3 plan |
| 22 | Seeder / Demo data | ✓ | expanded | Mixed | `DatabaseSeeder` exists | Consolidate Master/Demo (Phase 2) |
| 23 | UI/UX Theme (Tailwind/Breeze CSS) | ✓ | ✓ | Stable | — | OK |
| 24 | Security (role middleware, banned middleware, ownership policies, CSRF) | ✓ | ✓ | Stable | — | OK + add Vercel-specific headers |

---

## 4. Missing Requirement Analysis

In-scope MVP gaps:
- **Export PDF** — only CSV export implemented. *Move to Phase 2* per master prompt.
- **Payment gateway** — not in scope per master prompt §A.15.
- **Realtime chat** — not in scope per master prompt §A.15. Admin chat uses POST + reload pattern.
- **Mobile app** — not in scope per master prompt §A.15.
- **Phase 2 candidates:** PDF export, payment integration, realtime chat (WebSocket), email digest, push notification.

---

## 5. Bug & Conflict Analysis

### Confirmed working (from `php artisan test` 149/149):
- Login (email/username), register (email/username), forgot/reset, logout
- Banned/suspended blocked at login
- Superadmin cannot login via user panel; member cannot login via superadmin panel
- Redirect-by-role for 7 roles
- Guest redirected to login (member) and admin login (superadmin)
- Member blocked from superadmin/community/brand/company dashboards
- Community owner can access community dashboard, cannot access brand/company
- Brand owner can access brand dashboard, cannot access company
- Company owner can access company dashboard
- Banned user redirected from member dashboard
- All member, community, brand, company, event, public, admin-chat, documentation, premium, multilanguage page loads
- CSRF required for POST
- Delete actions not via GET
- Export does not contain password/remember_token
- Public pages not 500 on invalid locale
- Suggestion requires message

### Potential risks (not in test surface):
- **Idempotency of seeders** — `DatabaseSeeder` runs all; demo seeders may collide on re-run. *Phase 2: add `firstOrCreate`.*
- **Vercel cold start** — `storage/framework/views` not persistent. `php artisan view:cache` must run at build step. *Apply §3.*
- **Database egress IP** — Vercel has dynamic egress IP; Hostinger MySQL needs `%` host allow. *Documented in §3.*
- **Vite assets on Vercel** — `public/build` not in repo by default; need build step in `vercel.json`. *Apply §3.*

### No outstanding bugs blocking local run.
All 426 routes resolve. All 99 migrations applied. All 149 tests green.

---

## 6. Architecture Problem

| Area | Observation | Risk |
|---|---|---|
| Modular monolith | Controllers grouped by role; one service layer for Auth + Documentation only; rest in controllers | Medium |
| Service layer | `app/Services/Auth/`, `app/Services/Documentation/` only | Medium — needed for premium gating, event finance |
| Policies | 5 policies (AdminConversation, Brand, CollaborationRequest, Community, Event) | Medium — missing for Company, CMS, Documentation |
| Middleware | 8 files, 3 near-duplicate "active" (ActiveUser/EnsureActiveUser/EnsureUserIsActive), 2 banned-related (EnsureNotBanned + absent) | Low — pick one canonical |
| Models | 70 Eloquent models in `app/Models/` root | Low — Laravel convention |
| FormRequests | Grouped by role (Auth, BrandOwner, CommunityOwner, CompanyOwner, Member, RoleRequest, Superadmin) | OK |
| Routes | Single `web.php` with role-grouped comment headers (426 routes) | OK per master prompt §H |
| Legacy/V2 dual concepts | `CollaborationRequest` vs `CollaborationProposal`, `Campaign` vs `CommunityCampaign`, `Donation` vs `EventDonation`, `MasterRegion`/`CommunityRegion` vs `Region` | Medium — needs deprecation marker |

---

## 7. Code Structure Problem

- **No `app/Support/Enums/`** — role/status enums live as string constants in models and migration enums. Risk: typo across files.
- **No `app/Support/Helpers/`** — date/currency formatting in views and controllers.
- **No `app/ViewModels/`** — dashboard payload assembled in controllers.
- **No `routes/modules/*.php`** — acceptable (master prompt §H allows keeping `web.php` grouped).
- **No event/listener** for role approval (synchronous in controller) — fine for MVP.

---

## 8. Database Problem

### 99 migrations, V1 (`2024_01_*`) + V2 (`2026_06_25_*`) co-exist.

**Legacy vs V2 overlap (decision needed):**
| Legacy (V1) | V2 | Decision |
|---|---|---|
| `collaboration_requests` | `collaboration_proposals` | Keep both. Mark V1 deprecated. Phase 2: migrate data + drop. |
| `campaigns` (BrandOwner CampaignController) | `community_campaigns` | Keep both — different scopes (brand-level vs community-level). |
| `donations` (community donation confirm flow) | `event_donations` | Keep both — different scopes. |
| `master_regions` + `community_regions` | `regions` | Keep `regions` (v2) as canonical. Mark `master_regions` deprecated. `community_regions` is per-community → keep (different scope). |

**Schema health:**
- All migrations use proper FK + cascade rules.
- Status fields use enum strings (e.g. `users.status`, `role_requests.status`, `events.status`, `collaboration_proposals.status`).
- `soft_deletes` on `users` (V2.49).
- V2 added `status` index on `users` (V2.002).
- V2 made `users.email` nullable for username-only login.
- V2 added `cancelled` to `role_requests.status` enum.
- V2 renamed `admin_messages.message` → `body` (good — naming consistency).

**No data integrity bugs found** from migration SQL inspection.

---

## 9. Role & Permission Problem

- **Source of truth:** Spatie Permission (`model_has_roles`, `roles`, `permissions`).
- **Spatie roles seeded:** superadmin, admin_platform, member, community_owner, community_pengurus, community_volunteer, brand_owner, company_owner, event_volunteer.
- **Custom `users.status`:** `active` | `banned` | `suspended`. Enforced by `EnsureNotBanned` middleware.
- **Route-level enforcement:** Spatie `role:` middleware on grouped routes; `admin` alias for `superadmin`+`admin_platform`; `not.banned` alias for active-state check.
- **Policy enforcement:** CommunityPolicy, EventPolicy, BrandPolicy, CollaborationRequestPolicy, AdminConversationPolicy. *Missing: CompanyPolicy, CmsPolicy, DocumentationPolicy* — currently enforced by role middleware only.

**Risk:** A superadmin can edit a Company (CompanyController is behind role middleware, not policy). For MVP, this is acceptable. For growth, add policies.

---

## 10. UI/UX Problem

- **7 layouts** likely present (public, auth, superadmin, member, community-owner, brand-owner, company-owner) — confirm by inspection (Phase 2).
- **Shared components** — minimal; mostly inline Blade.
- **Empty state** — appears in member pages and admin tables.
- **Mobile sidebar** — Tailwind responsive classes used.
- **Logo** — present.
- **Flash message** — Breeze default.

**Gap:** No `<x-language-switcher>` component. Inline in navbar. *Phase 2.*

---

## 11. Deployment / Vercel Problem

| Area | Current Condition | Issue | Risk | Recommendation |
|---|---|---|---|---|
| Runtime | `vercel-php@0.8.0` serverless | No persistent FS | High | Accept + adapt storage/queue/cache/session to DB |
| Build | `buildCommand: php artisan package:discover && php artisan optimize:clear` | No `composer install`, no `npm run build`, no `artisan config:cache`/`route:cache` | **Critical** | Update `vercel.json` buildCommand (§3 plan) |
| Storage | local (default `public` disk) | Ephemeral on Vercel | High | Switch to R2 via S3 driver |
| Session | default (file) | Lost on cold start | High | `SESSION_DRIVER=database` |
| Cache | default (file) | Lost on cold start | High | `CACHE_STORE=database` |
| Queue | default (sync) | Background job not persisted | Medium | `QUEUE_CONNECTION=database` + cron trigger |
| Scheduler | none | No cron | High | Add `crons` block + `/api/cron/scheduler` route token-protected |
| DB | Hostinger MySQL (external) | Vercel egress IP not static | Medium | Hostinger allow `%` host OR use Cloudflare proxy in front of MySQL OR use pooled connection |
| APP_KEY / APP_URL | `.env` only | Not available in Vercel | **Critical** | Set in Vercel project env |
| `public/build` | built locally, not in repo | Missing in production | **Critical** | `npm run build` in vercel buildCommand + commit `public/build/.gitkeep` |
| Vite config | exists | needs `build/` to be committed for static asset | Low | `vite.config.js` build dir = `public/build` ✓ |
| `.vercelignore` | exists | Need to ensure it excludes `node_modules`, `tests`, `docs`, `.env*` | Medium | Audit file content |
| Cron secret | not implemented | Anyone hitting `/api/cron/scheduler` would trigger it | High | Add `VerifyCronToken` middleware reading `?token=` or `Authorization: Bearer` matching `CRON_SECRET` env |
| `api/index.php` | present | serverless entry | OK | Keep |

### Conclusion
Vercel is **doable** for KomunaID with the adaptation plan in §3. Two prerequisites:
1. **Hostinger MySQL must accept connections from Vercel egress** — confirm with Hostinger support (set remote MySQL host to `%` or use Cloudflare Tunnel).
2. **R2 credentials must be set in Vercel env.**

If either is blocked, fallback: **VPS (DigitalOcean/Hetzner) + Laravel Forge**, atau tetap Vercel dengan Neon/PlanetScale DB.

---

## 12. Security Problem

- **CSRF:** active in `web` middleware group (Breeze default). Verified by `csrf token required for post` test.
- **Role middleware:** applied on grouped routes. Verified by 13+ role-access tests.
- **Banned/suspended:** blocked at login AND at dashboard. Verified by 4 tests.
- **GET for delete:** not used. Verified by test.
- **Export safety:** password/remember_token excluded. Verified by 4 tests.
- **File upload validation:** depends on controller (event gallery, member gallery) — needs spot-check (Phase 2).
- **`.env` exposure:** not in repo (`.gitignore` covers). Safe.
- **Vercel `trustProxies`:** already set (`'*'`). Good for `url()` helper to use HTTPS.

**Risk:** No CSP/X-Frame-Options headers. *Phase 2.* No 2FA. *Phase 2.* No rate limit on login. *Phase 2.*

---

## 13. QA/Test Problem

- 149 tests, 191 assertions, 14 test files.
- Coverage: Auth, RoleAccess, Security, Public, Member, Community, Brand, Company, Event, AdminChat, Documentation, Multilanguage, Premium, SuperadminDashboard, RedirectByRole.
- **Missing coverage:** Export, EventFinance, RoleRequest approval flow, Onboarding flow, Donations flow.
- **Strategy:** Add 5–10 more tests in Phase 2.

---

## 14. Technical Debt

| ID | Description | Severity | Resolution |
|---|---|---|---|
| TD-1 | Middleware duplication (ActiveUser/EnsureActiveUser/EnsureUserIsActive) | Low | Pick one canonical, remove others |
| TD-2 | No `app/Support/Enums/` | Low | Create `RoleEnum`, `EventStatus`, `CommunityStatus`, `RoleRequestStatus`, `CollaborationStatus`, `SubscriptionStatus` |
| TD-3 | `CollaborationRequest` legacy table | Low | Add `@deprecated` docblock + audit note |
| TD-4 | `Donation` + `EventDonation` dual | Low | Add docblock clarifying scope |
| TD-5 | `MasterRegion` legacy | Low | Add docblock |
| TD-6 | No `routes/modules/*.php` split | OK | Keep `web.php` grouped |
| TD-7 | No PDF export | Low | Phase 2 |
| TD-8 | No 2FA / rate limit | Medium | Phase 2 |
| TD-9 | Vercel build step incomplete | **High** | Apply §3 plan |
| TD-10 | Vercel `crons` missing | **High** | Apply §3 plan |
| TD-11 | Cron route not token-protected | **High** | Apply §3 plan |
| TD-12 | Storage on Vercel = local | **High** | Apply §3 plan |

---

## 15. Risk Level

| Area | Risk | Notes |
|---|---|---|
| Local dev | Low | All green |
| Staging | Low | Same as local |
| Production (current state) | **High** | Vercel will fail without §3 plan |
| Production (after §3 plan + Hostinger allow) | Medium | Monitor DB connection pool, R2 egress, cold start latency |
| Data loss | Low | No `migrate:fresh`, no drop, only ADDITIVE V2 alters |

---

## 16. Refactor Recommendation

Apply structural refactor in this order:
1. **Create git branch `refactor/v1-v2`** for safety (or document baseline if not a git repo).
2. **Add `app/Support/Enums/`** with role/status enums.
3. **Add `app/Support/Helpers/`** with format helpers.
4. **Consolidate middleware** (keep `ActiveUser`, remove near-duplicates).
5. **Add missing policies** (Company, Cms, Documentation).
6. **Add service layer** for PremiumAccess, RedirectByRole (already exists), EventFinance, RoleRequest.
7. **Add `routes/cron.php`** for scheduler route (not loaded by web).
8. **Add `/api/cron/scheduler` route** with `VerifyCronToken` middleware.
9. **Add `crons` block** to `vercel.json`.
10. **Update `vercel.json` buildCommand** to install + build + cache.
11. **Add `.vercelignore`** refinements.
12. **Add `FILESYSTEM_DISK=s3`, `SESSION_DRIVER=database`, `CACHE_STORE=database`, `QUEUE_CONNECTION=database`** in `.env.example` and Vercel env.
13. **Add deprecation docblocks** to legacy models.
14. **Add `database/seeders/Master/` and `Demo/`** split.
15. **Re-run all baselines** (route:list, migrate:status, test, npm build).
16. **Write all 10 doc files.**

Do NOT:
- Drop any table.
- Edit old migrations.
- Rewrite auth.
- Add payment gateway.
- Add realtime chat.
- Force production deploy from this session.

---

## 17. Deployment Recommendation

**Primary:** **Vercel (app) + Hostinger MySQL (DB) + Cloudflare R2 (storage) + Vercel Cron Jobs (scheduler).**

Prerequisites:
1. Hostinger MySQL: set `Remote MySQL` host to `%` (or specific Vercel IP range if plan Pro/Enterprise).
2. Cloudflare R2: create bucket, generate access key/secret, set CORS to allow PUT from production domain.
3. Vercel project env: `APP_KEY`, `APP_URL`, `DB_*`, `AWS_*` (R2), `SESSION_DRIVER=database`, `CACHE_STORE=database`, `QUEUE_CONNECTION=database`, `FILESYSTEM_DISK=s3`, `CRON_SECRET`, `LOG_CHANNEL=stderr`.

**Fallback (if Hostinger blocks Vercel egress):**
- Move DB to **Neon** (free Postgres adapter not applicable — keep MySQL) or **PlanetScale** (MySQL with connection pooling, allows public egress). Then connect Vercel to PlanetScale.
- If both blocked: switch to **Laravel Forge + DigitalOcean** ($6/mo droplet).

**Hybrid (optional Phase 2):**
- Static landing page on Vercel (SSG, free), app dashboard on VPS. Best for marketing site SEO.

---

## 18. Final Conclusion Before Refactor

**Go / No-Go:** **GO** for refactor execution.

Project is in a **working state** locally. Refactor will:
- **Not** drop DB.
- **Not** edit old migrations.
- **Not** rewrite auth.
- **Will** add structural enums, policies, services.
- **Will** consolidate duplicate middlewares.
- **Will** add Vercel cron + build step + token middleware.
- **Will** document everything.

Estimated phases: ~25 file changes, ~5 new files, 0 destructive changes.

Ready to proceed to `REFACTOR_BLUEPRINT.md` + execution.
