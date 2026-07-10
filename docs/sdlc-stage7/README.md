# SDLC Stage 7 — Volunteer Module (MVP)

## Executive Summary

Stage 7 mengimplementasikan Volunteer Module MVP untuk platform KomunaID. Module ini memungkinkan Community dan Organization untuk membuat Volunteer Opportunity dari Event yang sudah ada, menerima pendaftaran dari Member, melakukan review, penugasan, dan absensi volunteer.

Volunteer Module terhubung langsung dengan Event Module — setiap Volunteer Opportunity wajib dimiliki oleh satu Event. Event dapat dimiliki oleh Community atau Organization.

## Implementation Summary

| Component | Status | Files Modified/Created |
|-----------|--------|----------------------|
| Database Schema | Completed | `packages/database/prisma/schema.prisma` |
| Shared Schemas (Zod) | Completed | `packages/shared/src/index.ts` |
| Audit Actions | Completed | `apps/api/src/services/audit.ts` |
| API Routes | Completed | `apps/api/src/routes/volunteers.ts` |
| App Router Mount | Completed | `apps/api/src/app.ts` |
| Frontend — Volunteer List | Completed | `apps/web/app/volunteer/page.tsx` |
| Frontend — Volunteer Detail | Completed | `apps/web/app/volunteer/[slug]/page.tsx` |
| Frontend — My Volunteer | Completed | `apps/web/app/dashboard/volunteer/page.tsx` |
| Frontend — Organizer Dashboard | Completed | `apps/web/app/dashboard/volunteer/[eventId]/page.tsx` |
| Dashboard Sidebar | Completed | `apps/web/app/dashboard/layout.tsx` |

## Volunteer Business Flow

```
Community / Organization
  → Create Event
    → Create Volunteer Opportunity (with positions)
      → Publish Opportunity
        → Member Apply (select position, fill motivation)
          → Organizer Review
            → Accepted → Assignment (PIC, shift, notes)
              → Check In → Check Out → Completed
            → Rejected → (end)
```

## Database Changes

### New Models (5)

| Model | Table | Purpose |
|-------|-------|---------|
| `VolunteerOpportunity` | `volunteer_opportunities` | Main opportunity entity linked to Event |
| `VolunteerPosition` | `volunteer_positions` | Position/division within an opportunity |
| `VolunteerApplication` | `volunteer_applications` | Member application for a position |
| `VolunteerAssignment` | `volunteer_assignments` | Accepted volunteer assignment with PIC and shift |
| `VolunteerAttendance` | `volunteer_attendances` | Check-in/check-out tracking |

### New Enums (3)

| Enum | Values |
|------|--------|
| `VolunteerOpportunityStatus` | DRAFT, PUBLISHED, OPEN, CLOSED, ARCHIVED |
| `VolunteerApplicationStatus` | APPLIED, REVIEWED, ACCEPTED, REJECTED |

### Relations Added

- `Event.volunteerOpportunities` → `VolunteerOpportunity[]`
- `User.createdVolunteerOpps` → `VolunteerOpportunity[]`
- `User.volunteerApplications` → `VolunteerApplication[]`
- `User.reviewedVolunteerApps` → `VolunteerApplication[]`
- `User.picAssignments` → `VolunteerAssignment[]`

### Status Flow — Volunteer Opportunity

```
DRAFT → PUBLISHED → OPEN → CLOSED → ARCHIVED
```

### Status Flow — Volunteer Application

```
APPLIED → REVIEWED → ACCEPTED
APPLIED → REVIEWED → REJECTED
```

### Status Flow — Attendance

```
NOT_CHECKED_IN → CHECKED_IN → CHECKED_OUT
```

## API Endpoints

Base URL: `/api/v1/volunteer`

### Volunteer Opportunity

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/volunteer` | Public | List all opportunities (paginated, filterable) |
| `GET` | `/volunteer/detail/:slug` | Public | Get opportunity by slug with positions |
| `GET` | `/volunteer/dashboard/:eventId` | Organizer | Volunteer dashboard for an event |
| `POST` | `/volunteer` | Organizer | Create volunteer opportunity |
| `PATCH` | `/volunteer/:id` | Organizer | Update opportunity |
| `DELETE` | `/volunteer/:id` | Organizer | Soft delete opportunity |
| `POST` | `/volunteer/:id/publish` | Organizer | DRAFT → PUBLISHED |
| `POST` | `/volunteer/:id/close` | Organizer | OPEN → CLOSED |
| `POST` | `/volunteer/:id/archive` | Organizer | CLOSED → ARCHIVED |

### Volunteer Application

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/volunteer/:id/apply` | Member | Apply for a position |
| `DELETE` | `/volunteer/:id/apply` | Member | Cancel application |
| `GET` | `/volunteer/my/applications` | Member | My applications list |
| `GET` | `/volunteer/:id/applications` | Organizer | List applications for opportunity |
| `PATCH` | `/volunteer/applications/:id/accept` | Organizer | Accept application |
| `PATCH` | `/volunteer/applications/:id/reject` | Organizer | Reject application |

### Volunteer Assignment

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/volunteer/applications/:id/assign` | Organizer | Assign PIC, shift, notes |

### Volunteer Attendance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/volunteer/attendance/:id/check-in` | Organizer | Check in volunteer |
| `PATCH` | `/volunteer/attendance/:id/check-out` | Organizer | Check out volunteer |

**Total: 18 endpoints**

## UI Pages

| Page | Path | Auth | Description |
|------|------|------|-------------|
| Volunteer Listing | `/volunteer` | Public | Browse all volunteer opportunities |
| Volunteer Detail | `/volunteer/[slug]` | Public | View opportunity, positions, apply |
| My Volunteer | `/dashboard/volunteer` | Member | View my applications, status, assignments |
| Organizer Dashboard | `/dashboard/volunteer/[eventId]` | Organizer | Manage volunteer for specific event |

### Dashboard Sidebar

Added "Volunteer Saya" link to dashboard sidebar navigation.

## RBAC Implementation

### Who Can Create Volunteer Opportunity

| Role | Scope | Access |
|------|-------|--------|
| Community OWNER | Community events | Full CRUD |
| Community ADMIN | Community events | Full CRUD |
| Community EVENT_MANAGER | Community events | Full CRUD |
| Organization OWNER | Organization events | Full CRUD |
| Organization ADMIN | Organization events | Full CRUD |
| Event createdById | Events they created | Full CRUD |

### Who Can Apply

Any authenticated MEMBER.

### Who Can Review/Assign

Same as create permission (owner/admin/event_manager of the parent community/organization).

### Who Can Check In/Out

Same as review permission.

## Audit Log

### New Actions (14)

| Action | Resource | Trigger |
|--------|----------|---------|
| `VOLUNTEER_OPPORTUNITY_CREATE` | VolunteerOpportunity | Create opportunity |
| `VOLUNTEER_OPPORTUNITY_UPDATE` | VolunteerOpportunity | Update opportunity |
| `VOLUNTEER_OPPORTUNITY_PUBLISH` | VolunteerOpportunity | DRAFT → PUBLISHED |
| `VOLUNTEER_OPPORTUNITY_CLOSE` | VolunteerOpportunity | OPEN → CLOSED |
| `VOLUNTEER_OPPORTUNITY_ARCHIVE` | VolunteerOpportunity | CLOSED → ARCHIVED |
| `VOLUNTEER_OPPORTUNITY_DELETE` | VolunteerOpportunity | Soft delete |
| `VOLUNTEER_APPLY` | VolunteerApplication | Member applies |
| `VOLUNTEER_CANCEL_APPLICATION` | VolunteerApplication | Member cancels |
| `VOLUNTEER_ACCEPT` | VolunteerApplication | Organizer accepts |
| `VOLUNTEER_REJECT` | VolunteerApplication | Organizer rejects |
| `VOLUNTEER_ASSIGN` | VolunteerAssignment | Organizer assigns |
| `VOLUNTEER_CHECK_IN` | VolunteerAttendance | Check in |
| `VOLUNTEER_CHECK_OUT` | VolunteerAttendance | Check out |

## Notification

### Triggered Events

| Event | Recipient | Title | Type |
|-------|-----------|-------|------|
| Application Submitted | Opportunity creator | "Volunteer Baru Mendaftar" | EVENT |
| Application Accepted | Applicant | "Volunteer Diterima" | EVENT |
| Application Rejected | Applicant | "Volunteer Ditolak" | EVENT |
| Assignment Created | Volunteer | "Volunteer Ditugaskan" | EVENT |

## Business Rules Enforced

1. ✅ Volunteer Opportunity wajib terhubung ke satu Event
2. ✅ Hanya Community Owner/Admin/EventManager dan Organization Owner/Admin yang bisa membuat
3. ✅ Satu Member hanya satu Application per Opportunity (unique constraint)
4. ✅ Kuota validation — application ditolak jika kuota penuh
5. ✅ Status transition validation — tidak bisa lompat status
6. ✅ Soft delete — tidak ada hard delete
7. ✅ Audit log pada setiap mutation
8. ✅ Notification pada apply, accept, reject, assign
9. ✅ Attendance tracking — NOT_CHECKED_IN → CHECKED_IN → CHECKED_OUT
10. ✅ Assignment hanya untuk ACCEPTED applications
11. ✅ Cancel hanya untuk APPLIED/REVIEWED status
12. ✅ Registration deadline validation

## Validation (Zod Schemas)

| Schema | Fields |
|--------|--------|
| `createVolunteerOpportunitySchema` | title, description, eventId, registrationDeadline, briefingDate, activityStartDate, activityEndDate, positions[] |
| `updateVolunteerOpportunitySchema` | Partial of create |
| `volunteerOpportunityQuerySchema` | page, limit, search, status, eventId, sort, orderBy |
| `applyVolunteerSchema` | positionId, motivation, experience, availability, agreement (must be true) |
| `reviewVolunteerApplicationSchema` | action (ACCEPTED/REJECTED), reviewNote |
| `assignVolunteerSchema` | picUserId, shiftStart, shiftEnd, notes |

## Known Issues

1. Pre-existing TypeScript errors in `admin.ts`, `communities.ts`, `organizations.ts` — not related to Volunteer module
2. Event detail page (`/events/[slug]`) does not yet show volunteer opportunity section — can be enhanced in future stage

## Risk

| Risk | Mitigation | Status |
|------|------------|--------|
| Database schema push without migration | Using `db push` for development; production should use `migrate` | Low |
| No background job for notification | Notifications created inline; acceptable for MVP | Low |

## Checklist

- ✅ Volunteer Opportunity (CRUD + status transitions)
- ✅ Volunteer Position (within opportunity)
- ✅ Volunteer Application (apply, cancel, review, accept, reject)
- ✅ Volunteer Assignment (PIC, shift, notes)
- ✅ Volunteer Attendance (check-in, check-out)
- ✅ Volunteer Dashboard (organizer view)
- ✅ Member Dashboard (my volunteer)
- ✅ Notification (apply, accept, reject, assign)
- ✅ Audit Log (14 action types)
- ✅ RBAC (scoped roles, ownership validation)
- ✅ Soft Delete
- ✅ Frontend Pages (4 pages)
- ✅ Zod Validation Schemas

## Final Decision

✅ **STAGE 7 COMPLETED — READY FOR SDLC STAGE 8**
