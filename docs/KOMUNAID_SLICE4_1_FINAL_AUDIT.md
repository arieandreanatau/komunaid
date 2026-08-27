# KOMUNAID — SLICE 4.1 BASELINE AUDIT + FINAL AUDIT

Date: 2026-08-22
Release decision: **CONDITIONAL GO** (P0=0; full multi-role browser E2E belum dijalankan — gate GO)

## PHASE 1 — Baseline Audit Report

### Governance layer (audit ulang penuh, tidak mengasumsikan benar)

**RBAC arsitektur**
- `adminRoutes.use("*", authMiddleware)` + `use("*", requirePlatformAdmin())` — gate baseline platform di `admin/index.ts:26-27`
- Superadmin-only per-route: audit-logs, settings PUT, users role/reset-password, dashboard/growth, security, volunteer-programs admin mutation
- `canMutateTarget()` di `admin/users.ts:23-29`: non-superadmin admin TIDAK bisa menarget user SUPER_ADMIN/PLATFORM_ADMIN
- Role cache + invalidasi; JWT roles tidak dipercaya untuk authorization (DB `user_role` adalah otoritas) — verified negative test spoofed-role → 403

**Role mutation path** (satu-satunya)
- `PUT /admin/users/:userId/role` (requireSuperAdmin)
- SEBELUM Slice 4.1: `deleteMany` semua roles + create satu — tanpa guard superadmin terakhir
- DIPERBAIKI di sesi ini: guard last-superadmin — downgrade SUPER_ADMIN saat total SUPER_ADMIN ≤ 1 → `409 "Tidak dapat menghapus Superadmin terakhir"`

**Direct lifecycle mutations — hasil final search**
- Event: `events.ts` organizer cancel pakai `transitionEvent` (service); registration side-effect CANCELLED adalah operasional; tidak ada direct `Event.status` mutation tersisa
- VolunteerProgram: seluruhnya via `VolunteerProgramTransitionService`; application via `VolunteerProgramApplicationService`
- VolunteerOpportunity legacy: routes 656/797 masih ada kode lama tapi **unreachable** oleh 410 middleware (write-freeze)
- Event admin/report/report-section: `EventTransitionService` saja (`admin/events.ts`, `admin/reports.ts` suspension)

**Audit log**
- Append-only; ZERO UPDATE/DELETE path di seluruh repo (verified)
- Indexed: userId, resourceName+resourceId, actionType, createdAt
- Temuan P2: tidak simpan actorRole

**Fake data / dead endpoint — dari Slice 4**
- master-data/stats, moderation/stats, contact-messages base, audit filter comma — sudah diperbaiki di Slice 4 dengan data nyata

**Debug / TODO**
- Zero `console.log` / `debugger` / `TODO` / `FIXME` / `HACK` di routes (final search)

## PHASE 2 — RBAC Access Matrix (disimpulkan dari code, bukan dok)

| Domain | GUEST | MEMBER | COMMUNITY_ADMIN/OWNER | PLATFORM_ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|
| Users (platform) | — | — | — | R (non-admin target) | R,U,D |
| Communities | R | R,C | R,C,U (scoped) | R,U (approval) | R,U |
| Events | R | R,C | C,U (scoped organizer) | R | R,U,review,publish |
| VolunteerProgram | R | R,apply | C,U (scoped) | R | R,U,review |
| Organizations | R | — | — | R,U (approval) | R,U |
| Reports | — | C | C,U (scoped) | R,U | R,U |
| Moderation | — | — | — | — | R,U |
| Audit Logs | — | — | — | — | R |
| CMS | — | — | — | R,U | R,U |
| Master Data | R (public list) | R | R | R,U (non-category master) | R,U |
| Settings (platform) | — | — | — | R | R,U |
| Roles/Permissions | — | — | — | — | R,U (guard last-superadmin) |
| Finance | — | — | — | — | (tidak ada domain) |

Semua VIEW platform admin = requirePlatformAdmin; superadmin-only diberi 403 untuk PLATFORM_ADMIN (tested).

## PHASE 30 — Final Static Search Results

| Item | Hasil |
|---|---|
| Direct Event.status mutation | ZERO (semua service) |
| Direct VolunteerProgram.status mutation | ZERO (semua service) |
| VolunteerOpportunity lifecycle write | Kode legacy ada tapi unreachable (410) |
| Hardcoded superadmin ID | ZERO |
| Hardcoded role string di logic authz | Hanya di `requireRole("SUPER_ADMIN"/"PLATFORM_ADMIN")` — mekanisme resmi |
| Fake statistics | ZERO (dead endpoints diganti data nyata) |
| Fake payment | ZERO (PAID = tampilkan harga, "Pembayaran menyusul") |
| console.log/debugger | ZERO |
| TODO/FIXME | ZERO |
| Unused constants | `REQUESTED_REVIEW_TRANSITIONS` sudah dihapus |
| Secrets di UI/API | ZERO (settings tidak pernah me-return value secret; audit log filter tidak expose password) |

## PHASE 31 — P0/P1/P2 Matrix

| Sev | Issue | Status |
|---|---|---|
| P0 | RBAC bypass | 0 — global platform gate + per-route superadmin + negative tests |
| P0 | Privilege escalation | 0 — spoofed role test 403; canMutateTarget protects admin targets |
| P0 | Last-superadmin removal | DIPERBAIKI — guard 409 |
| P0 | Lifecycle bypass | 0 — Event/Program/Application semua service |
| P0 | Audit tampering | 0 — append-only |
| P0 | Sensitive data leak | 0 — user list tidak expose password; settings secret tidak ditampilkan |
| P0 | Broken critical moderation | 0 — service-routed + tests |
| P0 | Migration | 0 — fresh-DB deploy validated di Slice 3.3; tidak ada migration baru Slice 4.1 |
| P1 | Verification center terpisah (/admin/verification) | Tidak ada — approval komunitas/organisasi sudah ada di route masing-masing; tab lanjutan = P1 deferred (tidak dibuatkan placeholder palsu) |
| P1 | ActorRole di AuditLog | Deferred (P2/P1 — butuh migration) |
| P1 | Full browser E2E multi-role | Deferred ke gate GO |
| P2 | Duplicate CMS page files; broadcast unbounded; composite index | Deferred |

## PHASE 34 — Final Release Decision

**CONDITIONAL GO**

- P0 = 0. Tidak ada bypass, escalation, lifecycle bypass, audit tampering, exposure.
- Fix sesi ini: last-superadmin guard (`admin/users.ts`).
- Regression: API Vitest **963 PASS / 39 files** (termasuk 5 negative RBAC test Slice 4); typecheck API/Web PASS; lint 0 error; smoke admin + public pages 200.
- Kondisi menuju GO: full browser E2E multi-role (SUPERADMIN/MEMBER/COMMUNITY_ADMIN/EVENT_MANAGER/VOLUNTEER_COORDINATOR) terhadap environment test + commit working tree terkontrol.

## MVP Classification (Slice 4.1 items)

| Item | Class |
|---|---|
| User management + role guard | NOW (selesai) |
| Community/Event/Volunteer moderation service-routed | NOW (selesai) |
| Audit log superadmin-only | NOW (selesai) |
| Last-superadmin protection | NOW (selesai sesi ini) |
| Verification center tab terpadu | LATER |
| AuditLog actorRole | LATER |
| Integrations | LATER |
| Finance | NOT REQUIRED (tanpa payment gateway) |
| Granular permission engine | LATER (role-based cukup untuk MVP) |