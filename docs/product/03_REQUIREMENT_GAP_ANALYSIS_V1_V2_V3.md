# 03 — REQUIREMENT GAP ANALYSIS V1 + V2 + V3

Date: 2026-06-27
Method: cross-reference of V1 baseline + V2 enhancement migrations + V3 master prompt requirement against the actual code, models, routes, controllers, and live URL.

## Status legend
- **Stable** — implemented, route exists, tests cover it, no observed bug.
- **Exists but bug** — implemented, route exists, but with a defect to fix.
- **Partial** — model/migration/view exists, controller or flow is incomplete.
- **Missing** — no evidence in code.
- **Move to Phase X** — out of MVP scope; explicitly deferred.
- **Wrong flow** — present but business logic incorrect.
- **Wrong permission** — accessible to wrong role.

## Module matrix

| # | Module | V1 | V2 Enhancement | V3 Requirement | Current Code Status | Gap | Priority | Action |
|---|---|---|---|---|---|---|---|---|
| 1 | Public website (landing, communities, events, blog, about, contact) | Yes | Yes | Yes | Landing/about/contact/events work on live; `/communities` and `/blog` 404 | Add 2 missing routes + pages | P1 | LIVE-001 |
| 2 | Register member | Yes | Enhanced (username optional) | Yes | `RegisteredUserController@store` + `RegisterRequest` present; default role `member` assigned | Add error summary component | P1 | LIVE-003 |
| 3 | Register community owner | — | Yes | Yes | `RoleRequest` flow + `community_owner` role; `community_owner` cannot add community before approval | None | P1 | — |
| 4 | Register brand owner | — | Yes | Yes | `brand_owner` role + `Brand` model + approval flow | None | P1 | — |
| 5 | Register company owner | — | Yes | Yes | `Company` model + `company_owner` role | None | P1 | — |
| 6 | Login member | Yes | Yes (email OR username) | Yes | `AuthenticatedSessionController@store` handles both, throttles via LoginLog | None | P1 | — |
| 7 | Login community/brand/company | — | Yes (single login + role redirect) | Yes | `RedirectByRoleService` dispatches per role | None | P1 | — |
| 8 | Login superadmin | Yes | Yes (separate URL) | Yes | `/admin/login` route exists, `Superadmin\LoginController` | None | P1 | — |
| 9 | Forgot/reset password | Yes | Yes | Yes | `password.request`, `password.email`, `password.reset`, `password.store` routes present | None | P1 | — |
| 10 | Member dashboard | Yes | Yes (V2 expand) | Yes | `Member\DashboardController` | None | P1 | — |
| 11 | Member profile | Yes | Yes (expanded fields) | Yes | `Profile` model with V2 fields migration | None | P1 | — |
| 12 | Interest / preferences | — | Yes | Yes | `interests` table + `Member\UpdateInterestRequest` | None | P1 | — |
| 13 | Friend / block | — | Yes | Yes | `friendships` table + `friend_blocks` if exists | None | P1 | — |
| 14 | Community directory | Yes | Yes | Yes | Public route exists in `routes/web.php` under a different slug; live `/communities` 404 | Add canonical route | P1 | LIVE-001 |
| 15 | Community profile | Yes | Yes | Yes | `Community` model + `CommunityController@show` | None | P1 | — |
| 16 | Community join/leave | Yes | Yes | Yes | `CommunityMember` model + join/leave actions | None | P1 | — |
| 17 | Community bookmark | — | Yes | Yes | `community_bookmarks` table | None | P1 | — |
| 18 | Community member management | Yes | Yes | Yes | `community_members` + `community_member_roles` + `banned_at`/`left_at` | None | P1 | — |
| 19 | Community pengurus / volunteer | — | Yes | Yes | `community_internal_roles`, `community_managements`, `community_volunteers` tables | None | P1 | — |
| 20 | Sub community | — | Yes | Yes | `community_subgroups` table | None | P1 | — |
| 21 | Community regional | — | Yes | Yes | `community_regions` + `regions` + `master_regions` tables | None | P1 | — |
| 22 | Community chat / thread | — | Partial (event chat only) | Yes | `EventChat` and `EventChatThread` exist for events; community chat not yet implemented | Move to P2 | P2 | Add `community_chats` + `community_chat_threads` later |
| 23 | Event directory | Yes | Yes | Yes | `EventController` public index | None | P1 | — |
| 24 | Event detail | Yes | Yes | Yes | `EventController@show` | None | P1 | — |
| 25 | Event creation | Yes | Yes | Yes | `EventRequest` + `events` table | None | P1 | — |
| 26 | Event registration | Yes | Yes (paid/free/info-only/donation) | Yes | `EventRegistration` + `EventPaymentConfirmation` + `EventDonation` | None | P1 | — |
| 27 | Event participant management | Yes | Yes | Yes | `EventRegistration` status + presence | None | P1 | — |
| 28 | Event volunteer | — | Yes | Yes | `event_volunteer_campaigns`, `event_volunteer_applications`, `event_volunteers` | None | P1 | — |
| 29 | Event gallery | — | Yes | Yes | `event_galleries` + `member_galleries` | None | P1 | — |
| 30 | Event chat / thread | — | Yes | Yes | `event_chats` + `event_chat_threads` | None | P1 | — |
| 31 | Event paid / free / donation | — | Yes | Yes | `events.event_type` + `EventFinanceTransaction` | None | P1 | — |
| 32 | Event tap-in | — | Partial (no dedicated model yet) | Yes | Need dedicated `event_tap_ins` table | Move to P2 | P2 | Add model + migration in Phase 2 |
| 33 | Event collaboration | — | Yes | Yes | `EventCollaboration` not yet a dedicated model; could be modeled as `CollaborationProposal` with `context_type=event` | Partial | P2 | Optional dedicated model |
| 34 | Brand profile | Yes | Yes (V2 fields) | Yes | `Brand` model + V2 alter migration | None | P1 | — |
| 35 | Brand employee / staff | — | Yes | Yes | `brand_members` | None | P1 | — |
| 36 | Brand product | — | Yes (placeholder fields) | Yes | No dedicated `products` table; `Brand` has `product_counters` style fields | Partial | P2 | Add `products` + `product_categories` in Phase 2 |
| 37 | Brand campaign | — | Yes | Yes | `campaigns` + `community_campaigns` + `community_campaign_applications` | None | P1 | — |
| 38 | Company profile | — | Yes | Yes | `companies` + V2 fields | None | P1 | — |
| 39 | Company brand management | — | Yes | Yes | `company_brand_members` | None | P1 | — |
| 40 | Company employee / staff | — | Yes | Yes | `company_brand_members` polymorphic-ish; needs an explicit `company_employees` if you want separation | Partial | P2 | Optional dedicated model |
| 41 | Company CSR | — | Partial | Yes | Not yet a dedicated table | Move to P2 | P2 | Add `csr_campaigns` table in Phase 2 |
| 42 | Company job campaign | — | Partial | Yes | `Campaign` can carry a `type='job'`; no dedicated fields | Partial | P2 | Extend schema |
| 43 | Collaboration request (community ↔ brand/company) | — | Yes | Yes | `collaboration_requests` + `collaboration_proposals` | None | P1 | — |
| 44 | Campaign ads / product | — | Yes | Yes | `campaigns` (with type) | None | P1 | — |
| 45 | Wallet | — | Yes (schema only) | Yes | `wallets` + `wallet_transactions` tables exist | Wallet UI is placeholder | P2 | Add wallet screen + topup/withdraw flows in Phase 2 |
| 46 | Payment gateway | — | Schema only | Yes | No gateway integration | Move to P3 | P3 | Integrate Midtrans/Xendit in Phase 3 |
| 47 | Donation | — | Yes | Yes | `donations` + `event_donations` + `EventDonation` model | None | P1 | — |
| 48 | Platform fee | — | Yes | Yes | `platform_fees` table | None | P1 | — |
| 49 | Report / export | — | Yes | Yes | `exports` table + per-role `ExportController` | None | P1 | — |
| 50 | Notification | — | Yes (custom) | Yes | `custom_notifications` table | None | P1 | — |
| 51 | Audit log | Yes | Yes | Yes | `audit_logs` + `approval_logs` + `login_logs` | None | P1 | — |
| 52 | CMS / blog | — | Yes | Yes | `cms_pages` + `blogs` + `homepage_sections` + `contact_settings` | Add `/blog` public route | P1 | LIVE-001 |
| 53 | Master data | — | Yes | Yes | `event_types`, `collaboration_types`, `regions`, `community_categories` | None | P1 | — |
| 54 | Superadmin dashboard | Yes | Yes (V2) | Yes | `Superadmin\DashboardController` | None | P1 | — |
| 55 | Admin platform | — | Yes (`platform_admin` role) | Yes | `platform_admin` exists in `TestCase::seedRolesIfNeeded`; needs a dedicated seeder in main app | Add seeder | P1 | Add roles/permissions seeder |
| 56 | Security (CSRF/XSS/rate limit) | Yes | Yes | Yes | `web` middleware group + `throttle` available; need login throttling on `/login` | Verify throttle applied | P1 | Add `throttle:5,1` to login |
| 57 | Deployment (Vercel) | — | Yes | Yes | `vercel.json` + `api/index.php` present; static asset build OK | Vercel ≠ ideal Laravel host; document | P2 | Provide Forge/Ploi/RunCloud plan |
| 58 | UI / UX brand identity | Yes | Yes | Yes | Tailwind v4 `@theme` defines all Komuna colors; logo in layouts | None | P1 | — |
| 59 | Documentation generator | — | Yes | Yes | `documentation_files` table + `DocumentationGenerator` test | None | P1 | — |
| 60 | Multilanguage | — | Yes | Yes | `translations` table + language switcher | None | P1 | — |
| 61 | Premium / subscription | — | Yes | Yes | `premium_plans` + `subscriptions` + `feature_locks` + `feature_usages` | None | P2 | — |
| 62 | Account restricted page | — | Yes | Yes | `auth/account-restricted.blade.php` | None | P1 | — |
| 63 | Onboarding | — | Yes | Yes | `auth/onboarding/*` views | None | P1 | — |
| 64 | Account deletion (soft) | — | Yes | Yes | `add_soft_deletes_to_users_table` migration | None | P1 | — |
| 65 | Account suspend / ban | — | Yes | Yes | `users.banned_at` + `users.status` + `isBannedOrSuspended()` | None | P1 | — |

## V3-only items (new scope not yet implemented)

| # | V3 Item | Decision | Phase |
|---|---|---|---|
| 66 | Member add friend / remove / block friend | Implemented as `friendships` + `friend_blocks` | P1 |
| 67 | Member add admin to wallet | Wallet screen UI placeholder; no real topup flow | P2 (UI), P3 (gateway) |
| 68 | Member can donate to community | `Donation` model + `donations` table ready; needs community recipient | P2 |
| 69 | Member can report user / event / community | `Report` model not yet present | P2 |
| 70 | Member can request role upgrade (community_staff, brand_staff) | `RoleRequest` + `role_requests` table ready | P1 |
| 71 | Member can download own report | `exports` table ready; UI on member dashboard | P2 |
| 72 | Member can delete own account | Soft delete only; needs confirm flow | P2 |
| 73 | Community owner adds sub community | `community_subgroups` ready | P1 |
| 74 | Community owner adds regional | `community_regions` ready | P1 |
| 75 | Community owner limits: cannot create 2nd community before 1st approved | Business rule; needs controller check | P1 |
| 76 | Community owner collaboration with brand/company | `collaboration_proposals` + `collaboration_requests` | P1 |
| 77 | Community owner accept collaboration with brand/company | Same | P1 |
| 78 | Community owner dashboard metrics | `Member\|Community\|Event` reporting views exist | P1 |
| 79 | Community owner announcement | Partial (no dedicated `announcements` table) | P2 |
| 80 | Community owner gallery | `event_galleries` exists; community gallery uses `member_galleries` polymorphic | P2 |
| 81 | Community owner membership mode (open/closed/approval) | `communities` has `membership_mode` field via V2 | P1 |
| 82 | Brand owner limit: max 3 brands | Needs check in `BrandController@store` | P1 |
| 83 | Brand owner adds product | `Brand.product_counters` exists; no `products` table | P2 |
| 84 | Brand owner campaign to website | `community_campaigns` model is community-side; needs brand-side equivalent | P2 |
| 85 | Brand owner create event | `events.organizer_type='brand'` ready | P1 |
| 86 | Brand owner apply tap-in to community event | Needs `event_tap_ins` model | P2 |
| 87 | Company owner add brand | `company_brand_members` ready | P1 |
| 88 | Company owner transfer brand ownership | `brand_ownership_transfers` ready | P1 |
| 89 | Company owner CSR program | Needs `csr_campaigns` table | P2 |
| 90 | Superadmin can join any community/event (subject to policy) | `Superadmin` policy required | P1 |
| 91 | Superadmin can chat with owners / members | `admin_conversations` + `admin_messages` | P1 |
| 92 | Superadmin revenue stream dashboard | `platform_fees` + `EventFinanceTransaction` provide data | P1 |
| 93 | Event tap-in (OB/OP to community event) | Needs `event_tap_ins` | P2 |
| 94 | Event status lifecycle (draft → submitted → approved → published → ongoing → completed → cancelled → suspended) | `events.status` migration added; need state machine helpers | P1 |
| 95 | Event capacity, waitlist, cutoff, cancellation | `events.capacity` + `registration_cutoff`; waitlist not yet | P1 (basic) / P2 (waitlist) |
| 96 | Event check-in attendance | `event_registrations.presence_status` | P1 |
| 97 | Event EO mode (KomunaID runs the event) | Not implemented | P2 |
| 98 | Wallet topup | UI placeholder; gateway pending | P3 |
| 99 | Payment integration (Midtrans / Xendit / Stripe) | Not implemented | P3 |
| 100 | Payout / settlement | Not implemented | P3 |
| 101 | Invoice / receipt | Not implemented | P3 |
| 102 | Realtime chat (WebSocket) | Schema only | P3 |
| 103 | Mobile app | Out of scope | P4 / Future |

## Top 10 critical gaps to address before re-audit
1. `/communities` and `/blog` public routes return 404 on live (LIVE-001).
2. Top-of-form error summary on register & login views (LIVE-003).
3. Login throttling on `/login` route.
4. Platform admin (`platform_admin`) and main roles/permissions seeder for production (LOCAL-001).
5. Brand limit (max 3) business rule in `BrandController@store` (BR-001).
6. Community first-approval rule in `CommunityController@store` for `community_owner` (BR-002).
7. Event status state machine helper (BR-003).
8. Wallet screen UI without real topup (WALLET-001).
9. Live UAT with credentials (UAT-001).
10. Production seed for roles/permissions (SEED-001).
