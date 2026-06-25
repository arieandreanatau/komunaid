# KomunaID V1 + V2 — Architecture Audit

> Project: `C:\Xampp\htdocs\komunaid`
> Audit date: 2026-06-25
> Auditor: Kilo (analysis + refactor execution)
> Branch: `refactor/v1-v2-audit`
> Laravel 11.54.0 · PHP · MySQL · Blade · Vite 5 · Spatie Permission

---

## 1. Executive Summary

- **Baseline health is good.** `php artisan route:list` returns 426 routes, all migrations are Ran, `php artisan test` passes 149/149 (191 assertions), `npm run build` succeeds in 23.5s, `composer validate` clean.
- **Project is a Laravel monolith, role-namespaced, Blade-only, with a Spatie Permission layer.** This is appropriate for MVP. No need to move to microservices.
- **Vercel is the wrong production target for this app.** `vercel.json` skips Vite/npm build, runtime is read-only, no managed MySQL, no cron. Recommended target: **VPS + Laravel Forge / Ploi / RunCloud**.
- **Biggest structural risks:** (a) `Guest` and `Public` controller groups overlap; (b) V1 and V2 tables cohabit (CollaborationRequest vs CollaborationProposal, Community V1 regions/subgroups vs V2 internal_roles/managements); (c) `users.banned_at` is not cast to datetime on the model; (d) no generic `not.banned` middleware for non-superadmin roles (only `EnsureSuperadmin` enforces it).
- **No duplicate route names detected.** 423 unique named routes, 3 unnamed (auth POST + `/up`).
- **No write-on-GET risk detected.** All destructive actions use POST/PUT/DELETE.

## 2. Current Project Condition

| Area | Observation |
|---|---|
| Laravel | 11.54.0 |
| PHP | from artisan about output |
| Routes | single `routes/web.php` (no module split) — works fine at 426 routes |
| Controllers | grouped by role: `Public`, `Guest`, `Auth`, `Member`, `CommunityOwner`, `Community`, `BrandOwner`, `CompanyOwner`, `Superadmin` (+ `Superadmin\Cms`) |
| Models | 76 in `app\Models` — V1 + V2 cohabit |
| Migrations | 85+ files, ending `2026_06_25_030001_rename_message_to_body_in_admin_messages_table` |
| Views | role-organized (`public`, `auth`, `member`, `community-owner`, `brand`, `company-owner`, `superadmin`) |
| Middleware | `EnsureSuperadmin`, `EnsureNotSuperadmin`, `ActiveUser`, `EnsureActiveUser`, `EnsureUserIsActive` (some duplication possible) |
| Auth base | Spatie Permission (HasRoles) on `User` model, plus Laravel session auth |
| Vite | `vite.config.js` present, build emits to `public/build/manifest.json` + assets |
| Vercel | `vercel.json` present; routes all to `api/index.php`; skips npm install + Vite build |

## 3. V1 vs V2 Coverage Analysis

| Module | V1 Status | V2 Status | Current Status | Gap | Action |
|---|---|---|---|---|---|
| Public Website | Stable | n/a | Stable | None | Keep |
| Auth/Login/Register | Stable | V2 RoleRequest, Onboarding | Stable | None | Keep |
| Role Request | n/a | Stable | Stable | None | Keep |
| Superadmin | Stable | V2 admin chat, docs, CMS blogs/homepage | Stable | None | Keep |
| Member | n/a | V2 bookmarks, friends, gallery, history, interests | Stable | None | Keep |
| Community Owner | V1 wallet, regions, subgroups | V2 internal_roles, managements, volunteers, campaigns | **Conflict** | Duplicate concepts | Document in DATABASE_REVIEW.md, prefer V2 paths |
| Community Management | V1 members/roles | V2 managements | **Conflict** | Naming overlap | Keep both, route names distinguish |
| Event Management | V1 finance fields on event | V2 event_finance_transactions + summaries + status enum | **Conflict** | Mix of V1 inline + V2 split | Prefer V2 split tables |
| Volunteer | V1 community_volunteers | V2 event_volunteers + event_volunteer_campaigns | **Duplicate** | Two scopes | Keep both (community vs event are different) |
| Donation | V1 donations | V2 event_donations | **Conflict** | Two tables | Prefer V2 for new flows, V1 for community-level |
| Finance Report | V1 wallet, platform_fees | V2 event_finance_summaries | Stable | None | Keep |
| Brand Owner | V1 brand_members, campaigns | V2 brand_ownership_transfers, company_brand_members | Stable | None | Keep |
| Company Owner | n/a | V2 companies, company_brand_members, brand_ownership_transfers | Stable | None | Keep |
| Collaboration | V1 collaboration_requests | V2 collaboration_proposals + collaboration_types | **Conflict** | Two tables | Prefer V2 collaboration_proposals |
| Premium/Trial | n/a | V2 premium_plans, subscriptions, feature_locks, feature_usages | Stable | None | Keep |
| CMS/Blog | n/a | V2 cms_pages, blogs, homepage_sections, contact_settings, suggestions | Stable | None | Keep |
| Multilanguage | n/a | V2 translations table | Stable | None | Keep |
| Admin Chat | n/a | V2 admin_conversations, participants, messages (renamed `body`) | Stable | None | Keep, model already uses `body` |
| Documentation Generator | n/a | V2 documentation_files | Exists, basic | No real generator logic | Mark Phase 2 |
| Testing/QA | n/a | 149 tests pass | Stable | None | Keep |
| Deployment | Vercel target | Vercel + Production hardening commit | **Mismatched** | Vercel can't host full Laravel | Recommend VPS |
| Seeder/Demo Data | n/a | `MasterSeeder` + `DemoSeeder` split | Stable | None | Keep |
| UI/UX Theme | Blade partials | role layouts | Stable | None | Keep |
| Security | Middleware present | Spatie roles, banned_at column, soft deletes | **Partial** | No generic banned middleware for non-superadmin | Add `EnsureNotBanned` |

## 4. Missing Requirement Analysis

Confirmed by reading `docs/requirements/` and `docs/01-requirements/`:

- **Documentation Generator:** controller + view present, but no actual PDF/Markdown generator logic. Phase 2 candidate.
- **Email mailer:** `MAIL_MAILER=log` in `.env.example` — only logs to `laravel.log`. Real email delivery not configured. Acceptable for MVP.
- **Storage driver:** `FILESYSTEM_DISK=public` and `PUBLIC_DISK_DRIVER=local`. Vercel filesystem is read-only → must use S3/R2 in production. Documented.
- **Background queue:** `QUEUE_CONNECTION=database` in `.env.example` — works with `failed_jobs` table. Fine for MVP.

## 5. Bug & Conflict Analysis

| ID | File:line | Severity | Issue | Action |
|---|---|---|---|---|
| BUG-01 | `app/Models/User.php:40-44` | Medium | `banned_at` not in `$casts()` → not a `Carbon` instance | Add `'banned_at' => 'datetime'` |
| BUG-02 | `app/Http/Controllers/Guest/*` vs `app/Http/Controllers/Public/*` | Medium | Duplicate controllers (`PublicEventController`, `PublicHomeController` vs `HomeController`). One is shadowed. | Additive only — keep both for now, document in MODULE_STRUCTURE.md |
| BUG-03 | `bootstrap/app.php` middleware aliases | Medium | `not.banned` alias not registered; only `EnsureSuperadmin` blocks banned users | Add `EnsureNotBanned` middleware + alias |
| BUG-04 | `vercel.json` | High | Skips `npm install` + Vite build → CSS/JS 404 in production | Switch deployment target to VPS; update DEPLOYMENT_RECOMMENDATION.md |
| BUG-05 | `.env*` files (4 variants) | Low | `.env`, `.env.local`, `.env.testing`, `.env_local` coexist. Risk of wrong env read. | Document in handover, ensure `.env.testing` is for tests only |
| BUG-06 | `app/Http/Middleware/*` | Low | Three near-duplicate active-user middlewares: `ActiveUser`, `EnsureActiveUser`, `EnsureUserIsActive` | Audit usage, consolidate in refactor |

## 6. Architecture Problem

- **Laravel monolith is correct for MVP.** No need to split.
- **Role-based controller grouping works.** No need to extract microservices.
- **Service layer is thin** but acceptable for current scope.
- **Bounded contexts are reasonably clear** at the controller level, but V1/V2 cohabitation in `Community`, `Event`, `Collaboration` models causes confusion.
- **Route file is large but manageable** (426 routes in one file). Do not split until a group exceeds ~200 lines after refactor.

## 7. Code Structure Problem

- `EnsureSuperadmin` is the only middleware enforcing banned/suspended. Other roles have no equivalent. A banned `member` or `community_owner` can still hit their dashboard.
- `User::banned_at` not cast → can't use Carbon methods.
- `CollaborationRequest` and `CollaborationProposal` exist as separate models. New code should use `CollaborationProposal`.
- `Guest` and `Public` controller namespaces duplicate actions. Whichever was registered second is the active one.

## 8. Database Problem

- V1 + V2 tables cohabit by design (additive migrations).
- 1 column rename migration exists (`admin_messages.message` → `body`). Model is already updated.
- `users` table has `banned_at`, `deleted_at`, `status`. SoftDeletes + HasRoles + a ban check work, but `banned_at` is not cast.
- 85+ migrations with sequential V2 progression. Safe (additive).

## 9. Role & Permission Problem

- Spatie Permission is the auth role source of truth.
- `EnsureSuperadmin` blocks banned + checks role.
- No generic `EnsureRole` or `EnsureNotBanned` middleware for other roles.
- `RoleEnum` not present in `app/Support/Enums/` (directory not yet created). Roles live as strings.

## 10. UI/UX Problem

- Each role has a layout under `resources/views/layouts/`.
- Sidebar partials exist per role.
- Manual smoke test (next phase) will confirm no broken links.

## 11. Deployment / Vercel Problem

- `vercel.json` build commands are no-ops. Assets never reach `public/build/`.
- Runtime is read-only. `storage/`, `bootstrap/cache/` writes fail. Sessions would break.
- No managed MySQL on Vercel.
- No cron / scheduler (`schedule:run` not available).
- **Verdict: Vercel is not a production-suitable target for KomunaID.** Use VPS + Forge / Ploi / RunCloud.

## 12. Security Problem

- CSRF: default Laravel behavior, active (no exceptions observed).
- Banned handling: only enforced for `/superadmin/*` routes.
- GET on destructive actions: not found in route list.
- File upload: to be confirmed via Feature tests.
- Export endpoints: tests `export no remember token`, `superadmin export no password` exist and pass.

## 13. QA / Test Problem

- 149 tests pass. 191 assertions. No failures.
- Coverage spans auth, role redirect, banned, export safety, superadmin dashboard, public homepage, language switch.
- Manual smoke + security checklist defined for post-refactor.

## 14. Technical Debt

| # | Item | File | Priority |
|---|---|---|---|
| 1 | `users.banned_at` not cast | `app/Models/User.php` | High |
| 2 | No `EnsureNotBanned` middleware for non-superadmin | `app/Http/Middleware/` | High |
| 3 | `Guest` vs `Public` controller overlap | `app/Http/Controllers/` | Medium |
| 4 | Three near-duplicate active-user middlewares | `app/Http/Middleware/` | Medium |
| 5 | V1 `collaboration_requests` vs V2 `collaboration_proposals` | `app/Models/` | Medium |
| 6 | `.env*` proliferation | repo root | Low |
| 7 | Vercel config ineffective | `vercel.json` | High (deployment) |

## 15. Risk Level

**Medium-High** for the Vercel mismatch + `banned_at` cast + lack of generic banned middleware. After Phase 1–3 fixes, risk drops to **Low–Medium** for the actual application code.

## 16. Refactor Recommendation

See `REFACTOR_BLUEPRINT.md`.

## 17. Deployment Recommendation

See `DEPLOYMENT_RECOMMENDATION.md`.

## 18. Final Conclusion Before Refactor

**Proceed to refactor per blueprint.** Blocking issues are limited to the items in section 14 #1, #2, #7. All three are addressed in Phase 1–3 of the refactor execution.
