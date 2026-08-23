# KOMUNAID — SLICE 3.2 RELEASE AUDIT

Date: 2026-08-22
Release decision: **NO-GO**

## Executive Summary

Slice 3.2 re-audited repository after Slice 3.1. No P0 can be downgraded. `VolunteerProgramTransitionService` and immutable Program status history exist, but public Volunteer and legacy admin flows still use `VolunteerOpportunity`. Event admin/report routes still bypass Event lifecycle. Migration status also reports every migration as unapplied on the configured development database.

## P0 Status

| P0 | Result | Evidence |
|---|---|---|
| Canonical public VolunteerProgram | FAIL | `/volunteer` calls `/api/v1/volunteer`; `app/volunteer/page.tsx:61`. |
| Public Program detail/application | FAIL | `/volunteer/[slug]` calls legacy `/volunteer/detail/:slug`, `/volunteer/:id/apply`; `app/volunteer/[slug]/page.tsx:84,127`. |
| Legacy lifecycle freeze | FAIL | `routes/volunteers.ts` still exposes create/update/publish/open/close/archive/apply/review writes. |
| Event transition service all paths | FAIL | `routes/admin/events.ts` direct status writes; `routes/admin/reports.ts:96` direct Event cancellation. |
| Legacy Volunteer admin bypass removal | FAIL | `routes/admin/volunteers.ts` direct Opportunity/Application status writes. |
| Event registration lock-time validation | FAIL | `routes/events.ts:1253-1310` checks Event status/window before locked transaction. |
| Program application lock-time validation | FAIL | `routes/volunteer-programs.ts:447-460` checks status/deadline before locked transaction. |
| Deterministic duplicate response | FAIL | Event registration create has no P2002-to-409 conversion. |
| Program application immutable history | FAIL | `VolunteerProgramApplication` has no history model/relation. |
| Bulk participant action | FAIL | UI calls `/participants/bulk-check-in`; API route absent. |
| Migration deployment validation | FAIL | `prisma migrate status` reports 11 unapplied migrations. |

## Verified Foundations

| Area | Result |
|---|---|
| Program status lifecycle service | PASS. `services/volunteer-program-transition.ts` uses CAS + Program history + AuditLog in one transaction. |
| Program status history | PASS. `VolunteerProgramStatusHistory` schema and migration exist. |
| Event organizer lifecycle history | PASS. Event organizer routes use transactional `transitionEvent`. |
| Creator permission bypass | PASS. Event/legacy Volunteer `createdById` manager bypass removed. |
| Self-review application guard | PASS. Program and legacy Volunteer self-review guards exist. |
| API TypeScript | PASS. |
| Web TypeScript | PASS. |
| API regression suite | PASS: 957 tests / 38 files. |
| Program focused integration | PASS: 9 tests. |

## Canonicalization Requirement

`VolunteerProgram` cannot replace `VolunteerOpportunity` by a simple rename. Program lacks legacy-compatible Event relation, position, assignment, PIC, shift, application detail/history, and a `legacyOpportunityId` mapping. Cutover must be additive:

1. Extend Program compatibility schema.
2. Add Program application history.
3. Backfill compatible legacy records with unique legacy mapping.
4. Freeze legacy write routes.
5. Replace public `/volunteer` list/detail/apply with Program API while retaining URL.
6. Redirect dashboard/search/homepage/category/sitemap consumers.
7. Retain legacy records read-only through a documented retention period.

## Database

Configured DB migration status is not deploy-ready. `prisma migrate status` found 11 migration directories and reports all as unapplied. Prior `db push` synchronization cannot substitute for migration deployment verification.

Required validation:

1. Fresh DB: `prisma migrate deploy`.
2. Existing compatible DB: backup, `prisma migrate deploy`, referential/index validation.
3. Data backfill verification before any legacy public cutover.

## Release Decision

**NO-GO**

Impact: public users still enter a non-canonical Volunteer lifecycle; privileged admin paths can bypass Event/Volunteer state machine; quota/deadline races remain; a production participant action is broken; migration deployment is unverified.

No Slice 4 work may start until every P0 row is PASS with migration, integration, RBAC, concurrency, and critical E2E evidence.
