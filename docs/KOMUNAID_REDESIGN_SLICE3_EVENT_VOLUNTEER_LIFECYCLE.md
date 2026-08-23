# KomunaID — Slice 3 Event + Volunteer Management Lifecycle

Date: 2026-08-22
Scope: lifecycle audit, Event moderation workflow foundation, RBAC hardening, regression verification.

## Release Status

**NO-GO**

Critical lifecycle requirements remain incomplete in Volunteer domain. Event review workflow foundation is implemented, but cannot make whole Slice 3 releasable while canonical Volunteer lifecycle remains split and auditable transitions are incomplete.

## Event Lifecycle Report

### Implemented

| Area | Change |
|---|---|
| Event workflow | Added `SUBMITTED`, `IN_REVIEW`, `REVISION_REQUESTED`, `RESUBMITTED`, `APPROVED` statuses before `PUBLISHED`. |
| Schema | Added `submittedAt`, `reviewedAt`, `reviewedById`, `reviewNote`; added reviewer relation and review queue indexes. |
| Migration | Added `20260822_add_event_review_workflow`. Existing DRAFT/PUBLISHED records retain current status. |
| Submit | `POST /events/:eventId/submit`: organizer sends DRAFT or revision-requested event for review. |
| Review | `POST /events/:eventId/review`: SUPER_ADMIN only; approve, reject/cancel, or request revision; reviewer cannot review own event. |
| Publish | `POST /events/:eventId/publish`: SUPER_ADMIN only after `APPROVED`. |
| Event history | Every organizer transition uses transactional status update + `event_status_histories` creation. History now records `actorRole`. |
| Discovery | Public Event API only exposes published/operational/completed statuses; review-internal event states no longer leak. |
| Dashboard | Fixed status button transport: replaced nonexistent `PATCH /events/:id/status` with existing named transition endpoints. Graph now matches server operational graph. |
| Create flow | After draft creation, sends organizer to `/dashboard/events/{id}`, not public event detail. |

### Event Workflow

```text
DRAFT
  -> SUBMITTED
  -> IN_REVIEW
  -> REVISION_REQUESTED -> RESUBMITTED -> IN_REVIEW
  -> APPROVED
  -> PUBLISHED
  -> REGISTRATION_OPEN
  -> REGISTRATION_CLOSED
  -> ONGOING
  -> COMPLETED
  -> ARCHIVED

Alternatives: CANCELLED from allowed non-terminal states.
```

### Remaining Event Gaps

| Issue | Severity | Root Cause | Fix Needed |
|---|---|---|---|
| Admin event moderation routes can still write status directly | High | `admin/events.ts` bypasses event transition helper | Route admin actions through shared transition service; preserve cancellation side effects and history. |
| Registration deadline/opening timestamps absent | Medium | Event model uses only status state | Add `registrationOpensAt`, `registrationDeadline`; lock/recheck state and deadline during registration transaction. |
| Paid ticket has no order/payment relation | High for paid events | Ticket catalog only | Keep paid events manually pending; add EventOrder/Payment before real payment enablement. |
| Event update of categories/details is non-atomic | Medium | Separate update/delete/create calls | Wrap Event update + categories + agenda/speaker/ticket mutations in one transaction. |
| Event dashboard response/edit contract issues remain | Medium | ID-vs-slug and response-shape mismatch identified in audit | Add authenticated GET by ID or fetch by slug consistently; add dashboard contract test. |

## Volunteer Lifecycle Report

### Audit Result

Two incompatible systems exist:

1. Legacy event-scoped `VolunteerOpportunity` at `/api/v1/volunteer`.
2. Product-level `VolunteerProgram` at `/api/v1/volunteer-programs`.

The sidebar primarily uses VolunteerProgram. Public discovery still uses legacy VolunteerOpportunity. No single canonical lifecycle exists.

### Implemented Hardening

| Area | Change |
|---|---|
| Creator bypass | Removed `createdById === userId` management bypass from Event and legacy Volunteer authorization. Demoted manager loses management rights. |
| Legacy lifecycle | Added `POST /volunteer/:opportunityId/open` for `PUBLISHED -> OPEN`. |
| Legacy applications | Applications only allowed at `OPEN`, not merely `PUBLISHED`; blocked when parent event is CANCELLED/ARCHIVED/COMPLETED. |
| Self-approval | Legacy volunteer manager cannot accept own application. VolunteerProgram organizer cannot review own application. |

### Critical Volunteer Gaps

| Issue | Severity | Root Cause | Required Fix |
|---|---|---|---|
| Two incompatible canonical models | Critical | Legacy Opportunity and VolunteerProgram both exposed | Pick VolunteerProgram as canonical; migrate/redirect legacy management; add public program directory/detail/application. |
| VolunteerProgram status history missing | Critical | No `VolunteerProgramStatusHistory` model | Add immutable status/application history with actor, actor role, reason, timestamp; transition inside transaction. |
| VolunteerProgram community workflow bypasses review | High | Community create remains DRAFT then operationally scheduled | Add submit/review/revision/approved transitions or document an approved community policy and enforce it. |
| Legacy status history best-effort | High | History failure swallowed outside transaction | Make opportunity status update/history atomic, as Event now is. |
| Admin Volunteer routes bypass state/quota | High | Direct status/application updates | Route through domain services with state, quota, deadline, eligibility, history checks. |
| Program/legacy self-application policy incomplete | Medium | Application allowed for own resource | Block organizer self-application or require separate reviewer/explicit admin override. |

## RBAC Report

### Correct Protections

- Event/legacy Volunteer management requires active organizer membership with OWNER/ADMIN/EVENT_MANAGER role, or SUPER_ADMIN.
- Cross-community management is constrained by parent Event organizer scope.
- Community VolunteerProgram create/list requires OWNER/ADMIN/VOLUNTEER_COORDINATOR in target community.
- VolunteerProgram independent proposal self-review is blocked.
- Event/Volunteer PATCH schemas exclude raw `status`; direct mass assignment is stripped by Zod validation.
- Event participant mutations validate registration belongs to requested event.
- Legacy Volunteer position updates validate position belongs to requested opportunity.

### Fixed

- Creator no longer retains management permission after role downgrade to MEMBER.
- Manager cannot accept/review own Volunteer application.

### Unresolved Security Blockers

- Admin direct lifecycle bypass.
- Volunteer status history non-atomic/missing in canonical Program model.
- Race recheck gaps: parent status/deadline are read before quota locks in event registration/volunteer application flows.
- Duplicate concurrent writes can surface database unique errors instead of deterministic `409`.

## API / Database Report

### API Added/Changed

| Endpoint | Change |
|---|---|
| `POST /events/:eventId/submit` | New organizer submission endpoint. |
| `POST /events/:eventId/review` | New SUPER_ADMIN review endpoint. |
| `POST /events/:eventId/publish` | Now SUPER_ADMIN-only and only `APPROVED -> PUBLISHED`. |
| `POST /volunteer/:opportunityId/open` | New legacy `PUBLISHED -> OPEN` endpoint. |
| `POST /volunteer/:opportunityId/apply` | Requires `OPEN` and eligible parent Event. |

### Database

Migration: `packages/database/prisma/migrations/20260822_add_event_review_workflow/migration.sql`

Adds Event review states, review metadata, Event review indexes, and `EventStatusHistory.actorRole`.

Dev database synced with `prisma db push`; Prisma client regenerated.

## UX/UI Report

| Screen | Score /90 | Main Issue |
|---|---:|---|
| Event create wizard | 68 | Good seven-step structure; registration schedule and location-dependent validation missing. |
| Event edit | 63 | Dense long form; error terminal state missing. |
| Event management dashboard | 66 after endpoint fix | Transition UI works against named endpoints; review status/reviewer actions not yet surfaced. |
| Event participants | 64 | Bulk check-in calls nonexistent API; remove or implement before release. |
| Volunteer independent proposal | 50 | Single form, not requested eight-step workflow. |
| Volunteer program workspace | 62 | Status visible but lifecycle actions/revision feedback incomplete. |

All pages below 70 require redesign/hardening before final release.

## Test Report

| Check | Result |
|---|---|
| Shared TypeScript | PASS |
| Prisma validate | PASS |
| API TypeScript | PASS |
| Web TypeScript | PASS |
| Event integration test | PASS, 19 tests |
| Full API Vitest | PASS, 957 tests / 38 files |
| Slice 1 smoke: `/events`, `/communities`, `/volunteer` | HTTP 200 |
| Slice 2 smoke: `/dashboard/settings/privacy` | HTTP 200 |
| Slice 3 smoke: `/dashboard/events/create`, `/dashboard/volunteers` | HTTP 200 |

## Remaining MVP Work

1. Canonicalize VolunteerProgram and retire/redirect duplicate legacy management flow.
2. Add VolunteerProgram immutable status/application histories and transactional transition service.
3. Route admin Event/Volunteer actions through same domain transition service.
4. Add lifecycle integration tests: valid/invalid graph, self-approval, demotion, admin action, atomic history failure, concurrent close/cancel vs register/apply.
5. Add registration deadline/opening fields and lock-time validation.
6. Remove broken participant bulk check-in UI or implement server endpoint.
7. Add review queue/action UI for Event SUPER_ADMIN workflow.
8. Complete Volunteer create eight-step UX only after canonical data model is selected.
