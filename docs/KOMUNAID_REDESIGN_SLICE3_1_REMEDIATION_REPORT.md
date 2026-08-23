# KOMUNAID — SLICE 3.1 REMEDIATION REPORT

Date: 2026-08-22
Status: **NO-GO**

## 1. Executive Summary

Slice 3.1 completed a full dependency re-audit and implemented core lifecycle foundations:

- Event review workflow from Slice 3 remains active.
- Event creator permission bypass after role demotion remains removed.
- `VolunteerProgramStatusHistory` added as immutable append-only history.
- `VolunteerProgramTransitionService` added.
- VolunteerProgram submit, resubmit, review, and operational transitions now use the transition service.
- Legacy VolunteerOpportunity received an `OPEN` transition and self-approval guards from Slice 3.
- API tests remain green: 957 tests / 38 files.

Slice 3.1 cannot change release status to GO or CONDITIONAL GO. P0 blockers remain: legacy public VolunteerOpportunity still owns public discovery/application, Event admin and report routes still directly mutate Event status, and full atomic registration/application race remediation is not complete.

## 2. Before/After Architecture

### Before

```text
Public Volunteer UI -> VolunteerOpportunity routes -> independent lifecycle/history
Dashboard/Admin Volunteer UI -> VolunteerProgram routes -> separate lifecycle/no history
Admin Event routes -> direct Event.status writes
```

### After Foundation

```text
VolunteerProgram routes
  -> VolunteerProgramTransitionService
  -> transactional Program status compare-and-set
  -> immutable VolunteerProgramStatusHistory
  -> transactional AuditLog insert

Event organizer routes
  -> transactional Event status compare-and-set
  -> EventStatusHistory with actorRole
```

### Still Incomplete

```text
Public Volunteer UI -> VolunteerOpportunity routes (legacy lifecycle remains live)
Admin Event routes -> direct Event.status writes
Admin VolunteerOpportunity routes -> direct Opportunity/Application writes
```

## 3. Canonical Volunteer Model

Target canonical model: `VolunteerProgram`.

Implemented canonical lifecycle:

```text
DRAFT -> SUBMITTED -> UNDER_REVIEW
UNDER_REVIEW -> REVISION_REQUIRED | REJECTED | APPROVED
REVISION_REQUIRED -> SUBMITTED
APPROVED -> SCHEDULED -> REGISTRATION_OPEN -> REGISTRATION_CLOSED
REGISTRATION_CLOSED -> ONGOING -> COMPLETED -> ARCHIVED
CANCELLED from allowed non-terminal states
```

Transition source: `apps/api/src/services/volunteer-program-transition.ts`.

Every Program status transition performs in one transaction:

1. compare-and-set current status;
2. Program update;
3. immutable `VolunteerProgramStatusHistory` creation;
4. immutable `AuditLog` creation.

Failure during history or audit creation rolls back Program status mutation.

## 4. Legacy Compatibility Strategy

### Current Legacy

`VolunteerOpportunity` remains event-scoped and powers:

- `/volunteer` public directory;
- `/volunteer/[slug]` public detail/application;
- homepage/search/category discovery;
- legacy dashboard paths;
- legacy API and OpenAPI documentation.

### Migration Feasibility

Direct migration is **lossy** today:

- Opportunity has mandatory `eventId`; Program has no Event relation.
- Opportunity has Positions, Assignment, PIC, Shift, rich application fields; Program does not.
- Legacy status/application data cannot map safely without Program position/application-history extensions.

### Required Cutover Plan

1. Extend Program with Event relation, ProgramPosition, assignment/PIC/shift equivalents, legacy mapping ID, application history.
2. Backfill compatible Opportunity records in batches.
3. Freeze legacy writes.
4. Move public `/volunteer` implementation to Program API while retaining public URL.
5. Add temporary read adapter/deprecation headers for legacy API.
6. Redirect legacy dashboard pages after mapping exists.
7. Retain legacy data through a defined retention window.

Until this runs, two live Volunteer lifecycles remain. P0 blocker.

## 5. Event Lifecycle

### Implemented Previously / Retained

- `DRAFT -> SUBMITTED -> IN_REVIEW -> REVISION_REQUESTED -> RESUBMITTED -> APPROVED -> PUBLISHED`.
- Superadmin-only review/publish.
- Creator cannot review own Event.
- Public Event discovery hides review-internal statuses.
- Event status history contains `actorRole`.
- Event dashboard uses named transition endpoints instead of nonexistent `PATCH /status`.

### Remaining P0

- `admin/events.ts` directly updates Event status.
- `admin/reports.ts` directly cancels Event status.
- Event cancellation side effects are still outside the Event transition transaction.

## 6. Volunteer Lifecycle

### Fixed

- Independent Program proposal now starts `DRAFT`, then transitions through `SUBMITTED` and `UNDER_REVIEW` via Program service.
- Program resubmit is now `REVISION_REQUIRED -> SUBMITTED -> UNDER_REVIEW`, each transition recorded.
- Program superadmin review uses Program transition service.
- Operational Program lifecycle uses Program transition service.
- Program `ARCHIVED` added.
- Legacy Opportunity now has `PUBLISHED -> OPEN`; applications require `OPEN`.
- Legacy applications blocked when parent Event is cancelled, completed, or archived.
- Legacy manager cannot accept own application.
- Program manager cannot review own application.

### Remaining P0

- Public Volunteer discovery/application remains legacy Opportunity, not Program.
- Legacy Opportunity history remains best-effort rather than transactional.
- Admin VolunteerOpportunity routes bypass state machine and quota policy.
- Program application lifecycle lacks immutable application history.

## 7. Transition Services

### Implemented

| Domain | Service | Status |
|---|---|---|
| VolunteerProgram | `services/volunteer-program-transition.ts` | Implemented, transactional history/audit |
| Event | local `transitionEvent()` helper in `routes/events.ts` | Partial; organizer routes use it, admin/report routes do not |
| VolunteerOpportunity | local direct route mutations | Not canonical; must be adapter-only after cutover |

## 8. RBAC

Fixed:

- Removed `createdById` bypass in Event and legacy Volunteer manager policy.
- Demoted Event Manager no longer controls Event/Opportunity based only on prior authorship.
- Self-application review/accept blocked in legacy and Program paths.

Still required:

- Route Event admin/report enforcement through Event transition policy.
- Make Program superadmin moderation policy explicit for Community Programs.
- Add test matrix covering role downgrade, cross-community, self-review, self-approval.

## 9. Security / Concurrency

### Fixed Foundation

- Program status compare-and-set detects competing status updates.
- Program status/history/audit mutations roll back together.
- Existing database unique constraints retain duplicate protection.

### P0 Remaining

| Issue | Root Cause | Required Fix |
|---|---|---|
| Event registration close/cancel race | parent state checked before quota lock | lock/read Event row and state/window inside registration transaction |
| Program application close/cancel race | Program status/deadline checked before capacity lock | lock/read Program row inside application transaction |
| Deterministic duplicate response | P2002 can surface from parallel requests | catch P2002 and return 409, or lock resource/user pair |
| Event admin bypass | direct update status in admin routes | route through EventTransitionService |
| Legacy Volunteer admin bypass | direct Opportunity/Application writes | freeze/adapter legacy routes or route through canonical Program service |

## 10. Database

New migrations:

- `20260822_add_event_review_workflow`
- `20260822_add_volunteer_program_status_history`
- `20260822_add_event_registration_window`

New Program history schema:

```text
VolunteerProgramStatusHistory
- volunteerProgramId
- previousStatus
- newStatus
- actorId
- actorRole
- reason
- createdAt
```

History has no update/delete route. FKs use `Restrict` for Program and actor retention.

Dev DB synchronized with `prisma db push`; Prisma client regenerated. Production migration still requires normal forward migration process.

## 11. API / Frontend

### Added / Changed

- Program transition service wired into create/resubmit/review/transition API paths.
- Event review workflow retained.
- Legacy Opportunity open transition added.

### Still Broken / Incomplete

- Public Program directory/detail/apply UI absent.
- Event management edit still has ID-vs-public-slug read contract mismatch.
- Event participant bulk check-in UI invokes nonexistent endpoint.
- Participant list response shape mismatch remains.
- Volunteer create remains simple forms, not required eight-step wizard.
- Event review UI absent despite API review endpoint.

## 12. UX/UI / Accessibility

Static audit results remain below release threshold for management screens:

| Screen | Score /90 | Result |
|---|---:|---|
| Event create | 68 | Needs hardening |
| Event edit | 63 | Needs redesign/hardening |
| Event management | 66 | Needs review UI and error feedback |
| Event participants | 64 | Broken bulk action blocks release |
| Volunteer proposal | 50 | Not lifecycle-complete |
| Volunteer Program workspace | 62 | Missing lifecycle UX |

## 13. Test Results

| Check | Result |
|---|---|
| Prisma schema validate | PASS |
| API TypeScript | PASS |
| Web TypeScript | PASS |
| VolunteerProgram focused integration | PASS, 9 tests |
| API full Vitest | PASS, 957 tests / 38 files |

## 14. Regression

Slice 1 and Slice 2 source paths were not intentionally changed except shared lifecycle dependencies. API regression passed. Public and dashboard smoke must be rerun after dev server restart because Prisma generation stopped live Node processes.

## 15. Remaining Issues / MVP Classification

### P0: Must Resolve Before Slice 3 Release

1. Canonicalize public Volunteer UI/API on VolunteerProgram.
2. Freeze/adapter legacy VolunteerOpportunity lifecycle; no new legacy lifecycle functions.
3. Route Event admin and report lifecycle enforcement through Event transition service.
4. Remove legacy Volunteer admin direct status/application bypass.
5. Lock/recheck Event registration and Program application status/deadline inside transaction.
6. Normalize concurrent duplicate responses to deterministic 409.
7. Fix broken production participant bulk check-in action.

### P1: Required for Lifecycle UX Completion

1. Event registration window UI/API wiring.
2. Atomic Event update for categories/agendas/speakers/tickets.
3. Management Event GET-by-ID contract.
4. Event review/revision UI.
5. Program public directory/detail/application UI.
6. Volunteer eight-step create workflow.

## 16. Final Release Decision

**NO-GO**

Reason: all P0 conditions are not resolved. Automated tests validate existing behavior and new Program service behavior, but system still exposes two independent Volunteer domains and direct admin lifecycle bypasses. Release would violate canonical lifecycle, atomic lifecycle enforcement, and no-bypass requirements.
