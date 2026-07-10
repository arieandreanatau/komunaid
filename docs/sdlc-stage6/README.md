# SDLC Stage 6 — Event Module

**Date:** 2026-07-10
**Version:** 1.0.0
**Status:** COMPLETED

---

## Executive Summary

Event Module penuh telah diimplementasikan mendukung lifecycle event dari creation hingga completion. Module mendukung Community dan Organization sebagai organizer, dengan RBAC scoped role, wizard-based event creation, participant management, attendance tracking, dan event dashboard/analytics.

---

## Implementation Summary

### Database Changes

**Updated `EventStatus` enum:**
```
DRAFT → PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → ONGOING → COMPLETED → ARCHIVED
                                                                                     → CANCELLED (from any active state)
```

**New fields on `Event` model:**
- `thumbnail` — Event thumbnail image URL
- `locationType` — Enum: OFFLINE, ONLINE, HYBRID
- `meetingUrl` — Online meeting URL
- `timezone` — Default "Asia/Jakarta"
- `allowWaitlist` — Boolean, enables waiting list when quota full
- `visibility` — Enum: PUBLIC, PRIVATE
- `contactName`, `contactEmail`, `contactPhone` — Event contact info
- `gallery` — JSON string of image URLs

**New fields on `EventRegistration` model:**
- `attendance` — Enum: NOT_CHECKED_IN, CHECKED_IN, CHECKED_OUT
- `checkedInAt`, `checkedOutAt` — Attendance timestamps
- `notes` — Registration notes

**New enums:**
- `EventVisibility` — PUBLIC, PRIVATE
- `LocationType` — OFFLINE, ONLINE, HYBRID
- `AttendanceStatus` — NOT_CHECKED_IN, CHECKED_IN, CHECKED_OUT

**Updated `RegistrationStatus`:** Added `REJECTED`

---

## API Endpoints

### Event CRUD

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events` | Public | List events with filters |
| GET | `/events/:slug` | Public | Event detail by slug |
| POST | `/events` | Community/Org Manager | Create event |
| PATCH | `/events/:eventId` | Event Manager | Update event |
| DELETE | `/events/:eventId` | Event Manager | Soft delete event |
| POST | `/events/:eventId/duplicate` | Event Manager | Duplicate event |

### Event Status Transitions

| Method | Endpoint | Auth | From Status | To Status |
|--------|----------|------|-------------|-----------|
| POST | `/events/:eventId/publish` | Manager | DRAFT | PUBLISHED |
| POST | `/events/:eventId/open-registration` | Manager | PUBLISHED | REGISTRATION_OPEN |
| POST | `/events/:eventId/close-registration` | Manager | REGISTRATION_OPEN | REGISTRATION_CLOSED |
| POST | `/events/:eventId/start` | Manager | REGISTRATION_CLOSED | ONGOING |
| POST | `/events/:eventId/complete` | Manager | ONGOING | COMPLETED |
| POST | `/events/:eventId/cancel` | Manager | Any active | CANCELLED |
| POST | `/events/:eventId/archive` | Manager | COMPLETED | ARCHIVED |

### Event Registration

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/events/:eventId/register` | Member | Register for event |
| DELETE | `/events/:eventId/register` | Member | Cancel registration |

### Participant Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events/:eventId/participants` | Manager | List participants |
| POST | `/events/:eventId/participants/:id/check-in` | Manager | Check in participant |
| POST | `/events/:eventId/participants/:id/check-out` | Manager | Check out participant |
| PATCH | `/events/:eventId/participants/:id/approve` | Manager | Approve participant |
| PATCH | `/events/:eventId/participants/:id/reject` | Manager | Reject participant |
| GET | `/events/:eventId/participants/export` | Manager | Export participants |

### Dashboard & Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events/:eventId/dashboard` | Manager | Event dashboard data |
| GET | `/events/my/created` | Member | Events created by user |
| GET | `/events/my/registered` | Member | Events registered by user |

---

## RBAC Implementation

### Event Creation
| Role | Community Event | Organization Event |
|------|----------------|-------------------|
| Community OWNER | ✅ | ❌ |
| Community ADMIN | ✅ | ❌ |
| Community EVENT_MANAGER | ✅ | ❌ |
| Organization OWNER | ❌ | ✅ |
| Organization ADMIN | ❌ | ✅ |
| MEMBER | ❌ | ❌ |

### Event Management
| Action | Creator | OWNER | ADMIN | EVENT_MANAGER |
|--------|---------|-------|-------|---------------|
| Edit Event | ✅ | ✅ | ✅ | ✅ |
| Delete Event | ✅ | ✅ | ✅ | ✅ |
| Publish/Cancel | ✅ | ✅ | ✅ | ✅ |
| Manage Participants | ✅ | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |

### Member Actions
| Action | MEMBER |
|--------|--------|
| Browse Events | ✅ |
| Register | ✅ (REGISTRATION_OPEN only) |
| Cancel Registration | ✅ |
| View Ticket | ✅ |

---

## Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Event Directory | `/events` | Public event listing with search & filters |
| Event Detail | `/events/[slug]` | Public event detail with registration |
| My Events | `/dashboard/events` | User's created & registered events |
| Create Event | `/dashboard/events/create` | 6-step wizard for event creation |
| Event Dashboard | `/dashboard/events/[eventId]` | Event management dashboard with tabs |
| Edit Event | `/dashboard/events/[eventId]/edit` | Edit event form |
| Participants | `/dashboard/events/[eventId]/participants` | Participant management |

---

## Event Workflow

```
1. CREATE (DRAFT)
   Community/Org Manager creates event → status: DRAFT

2. PUBLISH
   Manager publishes → status: PUBLISHED

3. OPEN REGISTRATION
   Manager opens registration → status: REGISTRATION_OPEN
   Members can register now

4. CLOSE REGISTRATION
   Manager closes registration → status: REGISTRATION_CLOSED
   Auto-closes when quota full (if allowWaitlist=false)

5. START EVENT
   Manager starts event → status: ONGOING

6. COMPLETE EVENT
   Manager completes event → status: COMPLETED

7. ARCHIVE
   Manager archives → status: ARCHIVED

At any point before COMPLETED:
   Manager can CANCEL → status: CANCELLED
   All registrations auto-cancelled, notifications sent
```

---

## Notification Events

| Trigger | Recipient | Title |
|---------|-----------|-------|
| Registration created | Event creator | Peserta Baru Mendaftar |
| Registration cancelled | Event creator | Peserta Membatalkan |
| Waitlist promoted | Participant | Registrasi Dikonfirmasi |
| Event cancelled | All participants | Event Dibatalkan |
| Registration approved | Participant | Pendaftaran Disetujui |
| Registration rejected | Participant | Pendaftaran Ditolak |

---

## Audit Log Actions

| Action | Resource |
|--------|----------|
| EVENT_CREATE | Event |
| EVENT_UPDATE | Event |
| EVENT_PUBLISH | Event |
| EVENT_CANCEL | Event |
| EVENT_ARCHIVE | Event |
| EVENT_DUPLICATE | Event |
| EVENT_DELETE | Event |
| EVENT_REGISTER | Event |
| EVENT_UNREGISTER | Event |
| EVENT_CHECK_IN | EventRegistration |
| EVENT_CHECK_OUT | EventRegistration |
| EVENT_PARTICIPANT_APPROVE | EventRegistration |
| EVENT_PARTICIPANT_REJECT | EventRegistration |

---

## Files Changed

### Database
- `packages/database/prisma/schema.prisma` — Event model expanded, new enums
- `apps/api/prisma/schema.prisma` — Synced with canonical schema

### Shared
- `packages/shared/src/index.ts` — Updated event schemas, new eventQuerySchema
- `packages/constants/src/index.ts` — Updated EVENT_STATUSES, new constants

### API
- `apps/api/src/routes/events.ts` — Full rewrite: 23 endpoints
- `apps/api/src/services/audit.ts` — New audit action constants

### Frontend
- `apps/web/app/events/page.tsx` — Enhanced event directory
- `apps/web/app/events/[slug]/page.tsx` — Enhanced event detail
- `apps/web/app/dashboard/events/page.tsx` — NEW: My Events dashboard
- `apps/web/app/dashboard/events/create/page.tsx` — NEW: Create Event wizard
- `apps/web/app/dashboard/events/[eventId]/page.tsx` — NEW: Event dashboard
- `apps/web/app/dashboard/events/[eventId]/edit/page.tsx` — NEW: Edit Event
- `apps/web/app/dashboard/events/[eventId]/participants/page.tsx` — NEW: Participant mgmt
- `apps/web/app/dashboard/layout.tsx` — Added "Event Saya" nav item

---

## Known Issues

1. Pre-existing type errors in `apps/api/src/routes/admin.ts` and `communities.ts` — stale schema references not part of this stage
2. Prisma schema drift between `apps/api` and `packages/database` — API schema partially synced but community/organization models still diverge

---

## Checklist

- [x] Event CRUD (Create, Read, Update, Delete/Soft Delete)
- [x] Event Status Transitions (DRAFT → PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → ONGOING → COMPLETED → ARCHIVED / CANCELLED)
- [x] Event Dashboard (Overview, Participants, Analytics)
- [x] Event Registration (Register, Cancel, Waitlist)
- [x] Participant Management (List, Approve, Reject, Check-in, Check-out, Export)
- [x] Event Insight (Capacity, Attendance Rate, Registration Trend)
- [x] Event Manager (Scoped access by Community/Org membership)
- [x] Notification (Registration, Cancellation, Approval, Rejection)
- [x] Audit Log (13 actions tracked)
- [x] RBAC (Community Owner/Admin/EventManager, Org Owner/Admin, Member)
- [x] Duplicate Event
- [x] My Events (Created & Registered)
- [x] 6-Step Event Creation Wizard
- [x] Event Detail (Public, with registration)
- [x] Event Directory (Public, with search & filters)

---

## Final Decision

**✅ STAGE 6 COMPLETED — READY FOR SDLC STAGE 7**
