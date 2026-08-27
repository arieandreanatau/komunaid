# KomunaID — Product Redesign · Phase 0 Audit Report

Date: 2026-08-21
Scope: Full repository audit to ground the "KomunaID 2.0" redesign (Community Discovery + Community Management + Event + Volunteer). Source of truth = repository code, migrations, and checked-in docs (never assumptions).

---

## A. Repository Snapshot

- Monorepo, pnpm workspace. Packages: `apps/web` (Next.js 15, App Router, Tailwind 3, tanstack-query, zustand, hono proxy), `apps/api` (Hono + jose JWT + zod), `packages/database` (Prisma → MySQL, 46 tables), `packages/ui`, `packages/shared`, `packages/constants`, `packages/utils`.
- API served same-origin: web mounts the Hono API in-process via `app/api/[...path]/route.ts` and calls `API_URL=""` (`lib/api.ts` axios + CSRF header + 401 refresh-queue interceptor).
- Active branch `fix/rbac-access-control` (32 commits ahead of `master`). Previous redesign work merged into `master`: dashboard-redesign, profile-module-enhancement, community-module-redesign. Other branches exist (event-module-redesign, community-leave-button, etc.).

## B. What Already Exists (real, API-driven — NOT stubs)

Every route is a real implementation with loading/error/empty states. There are **no skeleton/mock pages** (only `organizations` is dormant behind `NEXT_PUBLIC_ORGANIZATION_ENABLED` feature flag).

| Area | Current state | Files |
|---|---|---|
| Home | Live data: communities by memberCount, popular events, open volunteers | `app/page.tsx`, `components/homepage-discovery.tsx` |
| Community Directory | Real: 4 tabs (featured/new/popular), search, filter (membership/category/province/city/sort), pagination, inline `CommunityCard` | `app/communities/page.tsx` |
| Community Detail | Rich: banner, logo, owner, contact/social, members preview, event tabs, media, gallery, forum, related; join/leave/request; edit/settings/members/join-requests subpages | `app/communities/[slug]/page.tsx` |
| Event Directory | Real: status/location tabs, sort, communityId filter, inline `EventCard` | `app/events/page.tsx` |
| Event Detail | Real: registration, waitlist, quota, save, share, organizer, gallery, related | `app/events/[slug]/page.tsx` |
| Volunteer Directory | Real: inline card, status/sort/pagination | `app/volunteer/page.tsx` |
| Volunteer Detail | Real: positions, application modal, status/assignment/attendance, related | `app/volunteer/[slug]/page.tsx` |
| Member Dashboard | Real: overview stat cards, interactive calendar, recommendations, activity; sidebar | `app/dashboard/*`, `components/member-dashboard-ui.tsx` |
| Community Dashboard | Real (two impls): integrated section in dashboard sidebar + standalone `community-dashboard-route.tsx` (Ringkasan/Event/Anggota/Permintaan/Media/Pengaturan/Insight tabs + CRUD) | `components/community-dashboard-route.tsx` |
| Superadmin | Real: stat cards, CSS bar chart, quick actions, audit/report previews; 9 workspaces with sub-tabs; roles SUPER_ADMIN/PLATFORM_ADMIN | `app/admin/*`, `components/admin/*` |
| Category directory, global search, submit, static pages, auth | Real | `app/categories`, `app/search`, `app/submit`, `app/login|register|forgot-password|reset-password` |

API surface (Hono, mounted `/api/v1`): auth (register/login/refresh/logout/me/change-password/forgot/reset/sessions), users (profile/interests/notifications/activity), communities (full CRUD + join/leave/join-requests/members/media/forum/roles/dashboard/insight/statistics/archive/suspend), organizations (mirror), events (CRUD + publish/open-reg/close-reg/start/complete/cancel/archive/duplicate + register/waitlist/participants/check-in/check-out/approve/reject/export/dashboard/saved/created/registered), volunteer (opp CRUD + publish/close/archive + apply/cancel/applications/accept/reject/assign/attendance/check-in/check-out/dashboard), volunteer-programs (proposals/communities/admin review-queue/state machine/apply/applications/attendance), reports, categories, master-data, upload, org-structure, contact-messages, and a full admin namespace.

## C. Backend Enforcement (RBAC) — Good Foundation

- JWT (jose, HS256): `authMiddleware` verifies cookie `token` or `Authorization: Bearer`, checks `type==="access"`, user `ACTIVE` + `deletedAt null` + `tokenVersion`, sets `c.set("user", …)`. **Note:** roles are loaded from DB via rbac middleware, not trusted from JWT payload.
- Middleware: `requireRole(...roles)`, `requireSuperAdmin()`, `requirePlatformAdmin()`, `requireCommunityOwner()`, `requireCommunityAdmin()`, `requireOrganizationOwner()`, `requireOrganizationAdmin()`; all check `membership.status === "ACTIVE"`.
- Roles: PlatformRole `SUPER_ADMIN | PLATFORM_ADMIN | MEMBER`; CommunityRole `OWNER | ADMIN | EVENT_MANAGER | VOLUNTEER_COORDINATOR | MEMBER`; OrganizationRole `OWNER | ADMIN | MEMBER`.
- Community ownership + member scoping enforced per route (e.g., `GET /communities/:slug` applies private checks; role-change is owner-only; remove member is admin-non-admin with rules). Admin namespace requires PlatformAdmin and admin mutation rate-limit.
- RBAC matrix documented at `docs/RBAC.md` (Platform + Community + Organization + Event + Volunteer).

## D. Database Model (46 tables)

Auth/identity: `users`, `user_roles`, `refresh_tokens`, `login_history`, `user_interests`.
Community: `communities`, `community_members`, `join_requests`, `community_categories`, `community_tags`, `community_settings`, `community_media`, `community_statistics`, `forum_replies`, `membership_history`.
Organization: `organizations`, `organization_members`, `organization_categories`, `organization_tags`, `organization_settings`, `organization_structures`, `organization_structure_members`.
Event: `events`, `event_categories`, `event_registrations`, `event_saves`, `categories`.
Volunteer (opp): `volunteer_opportunities`, `volunteer_positions`, `volunteer_applications`, `volunteer_assignments`, `volunteer_attendances`.
Volunteer (program): `volunteer_programs`, `volunteer_program_organizer_accesses`, `volunteer_program_applications`, `volunteer_program_participations`.
Ops: `reports`, `audit_logs`, `notifications`, `notification_templates`, `activity_history`, `cms_pages`, `cms_banners`, `cms_contacts`, `settings`, `contact_messages`.

Required migration policy (per `docs/architecture/SCHEMA_SOURCE_OF_TRUTH.md`): `schema.prisma` = intent, `migrations/` = deployed truth; additive forward-only migrations, never alter applied migrations; `db:push` only on disposable dev DBs; never `db:seed` in prod.

## E. Gaps vs the Requested Product Model (Sections 15–16 of spec)

| Requested | Status | Action |
|---|---|---|
| event_categories | ✅ exists (`event_categories` + `Category type=EVENT`) | keep |
| event_organizers / co-host | ❌ (only `Event.createdById`) | ADD (additive) or defer |
| event_locations (structured venue/address/geo) | ⚠️ partial (`Event.location` string + locationType + urls) | ADD structured or defer |
| event_schedules (multi-session) | ⚠️ partial (single eventDate/endDate) | defer (note) |
| event_registrations | ✅ exists | keep |
| event_tickets | ❌ | ADD (price placeholder, NO payment gateway) |
| event_agendas | ❌ | ADD |
| event_speakers | ❌ | ADD |
| event_pics | ⚠️ partial (volunteer assignment PIC only) | defer |
| event_media | ⚠️ partial (`Event.gallery` string) | defer |
| event_requirements / rules | ❌ | defer |
| event_collaborations | ❌ | defer |
| **event_status_histories** | ❌ | ADD (audit trail per rule 17/32) |
| volunteer_skills | ❌ (free-text requirement/experience only) | ADD |
| **volunteer_status_histories** | ❌ | ADD |
| community_type | ❌ (categories/tags only) | ADD minimal or defer |
| payments/transactions/tickets-paid | ❌ (none) | **Do NOT build fake payments**; keep safe MVP state (PAID + price + registration + payment-status architecture, never assume success) |

## F. Design System (checked-in tokens — preserve these)

- Fonts: `Plus_Jakarta_Sans` (body, `font-sans`) + `Fraunces` (headings, `font-display` serif). Loaded in `app/layout.tsx`.
- Colors (`tailwind.config.js` `komuna` palette): navy `#0A1D4D`, blue `#1D4ED8`, teal `#11A79B`, aqua `#00C8E6`, white; aliases `forest=blue`, `coral=aqua`, `dark=navy`, `cream=white`. CSS-variable semantic tokens in `globals.css`: background/foreground/card/border/input/ring/destructive/muted/radius `0.875rem`. `primary=#1D4ED8`, `secondary=#0A1D4D`, `accent=#11A79B`.
- Radius: `lg=var(--radius)`, `md=calc(-2px)`, `sm=calc(-4px)`; `rounded-xl/2xl` common.
- Buttons (`packages/ui/button.tsx`, cva): default/hover, destructive, outline, secondary, ghost, link; sizes sm/h-md/lg/icon.
- Cards (`packages/ui/card.tsx`): rounded-xl border bg-white shadow-sm; CardTitle text-lg font-semibold text-komuna-navy.
- UI primitives present in `components/ui/`: avatar, badge, button, dropdown, modal, confirm-dialog, tabs, select, input, textarea, label, search-input, loading-spinner, toast, data-table, use-drawer-dialog.
- **Known split:** public pages lean `forest/dark/coral` + Fraunces; dashboards lean shadcn `slate/gray/komuna-blue/navy`. Preserve both; keep shared design language, not identical UI.

## G. Key Refactor Pain Points

1. **Cards not shared**: `CommunityCard`/`EventCard`/`VolunteerCard` are duplicated inline across ~6 files (communities, events, volunteer, dashboard, homepage). → Extract shared `community-card.tsx`, `event-card.tsx`, `volunteer-card.tsx` (+ skeletons already in `skeleton.tsx`).
2. **Duplicate UI primitives**: `packages/ui` (Button/Card/Input) vs `components/ui` (Input/Select/Textarea/Modal/…) — already starting to converge (fresh `components/ui/input|label|select|tabs|textarea` + `lib/cn.ts` committed this session). Unify before redesign.
3. **Sidebar IA** needs regrouping to requested taxonomy (member: Overview/Profile/Community/Event/Volunteer/Social/Activity/Settings; superadmin: Overview/Management/Trust&Safety/Content/System/Access-Control/Finance; community detail dashboard split from community aggregate dashboard).
4. **Sensitive community data** (founder NIK, legal, signature) not to be exposed publicly — ensure access control.

## H. Test Infrastructure

- Web: vitest unit (`tests/`), Playwright E2E `e2e/*.spec.ts` (landing, navigation, seo, search, communities, community-settings, events, volunteer, dashboard, error-pages, + more), helpers in `e2e/helpers/`.
- API: vitest (`apps/api/tests`).
- Root scripts: `pnpm validate` = lint + typecheck + test + build; `pnpm test:e2e`; `pnpm db:*`; `pnpm security:audit`.

## I. Phase Plan (from master prompt §28)

PHASE 0 audit (this doc) → 1 design system + shared layout → 2 community dir/detail → 3 event dir/detail → 4 volunteer dir/detail → 5 member dashboard → 6 community dashboard → 7 community detail dashboard → 8 superadmin → 9 DB/API/RBAC migration → 10 test → 11 security → 12 regression.

Executed as parallel Agent Manager worktrees (git-isolated, independently reviewable), then reconciled + consolidated.

## J. No-Go / Risk Register (from §30)

- Do not declare done while build/typecheck/lint/API/E2E fail, RBAC bypassable, migration fails, existing MVP broken, unauthorized management access, or design system inconsistent.
- Do not use fake payments for paid events.
- Do not change design tokens (fonts/colors/spacing/radius) unless a global token is genuinely wrong — prefer component/semantic tokens (rule 22L).
