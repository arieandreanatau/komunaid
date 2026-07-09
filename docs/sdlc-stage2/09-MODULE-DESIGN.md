# 09 — MODULE DESIGN

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Module Overview

| Module | Backend Files | Frontend Files | Status |
|--------|-------------|----------------|--------|
| Public Website | Static pages | 14 pages | ✅ 80% |
| Authentication | auth.ts routes | 4 pages | ✅ 85% |
| Member | users.ts routes | 0 pages (dashboard empty) | ⚠ 50% |
| Community | communities.ts routes | 2 pages (directory, detail) | ⚠ 55% |
| Organization | organizations.ts routes | 1 page (directory only) | ⚠ 45% |
| Event | events.ts routes | 2 pages (directory, detail) | ⚠ 55% |
| Administration | admin.ts routes, categories.ts routes | 0 pages (empty) | ⚠ 40% |

---

## Module 1: Public Website

### Components

```
Landing Page (/)
├── Hero section
├── Stats (total communities, events, users)
├── Features section
├── How it works
├── CTA section
└── Footer

Community Directory (/communities)
├── Search input
├── Community cards grid
├── Pagination
└── Empty state

Community Detail (/communities/[slug])
├── Cover image + logo
├── Name, description, location
├── Member count
├── Join/Leave button
├── Members list
├── Events list
└── Categories

Event Directory (/events)
├── Search + filter (upcoming/past)
├── Event cards grid
├── Pagination
└── Empty state

Event Detail (/events/[slug])
├── Cover image
├── Title, description, date, location
├── Quota indicator
├── Register/Cancel button
├── Organizer info
└── Categories

Organization Directory (/organizations)
├── Search input
├── Organization cards grid
├── Pagination
└── Empty state

Organization Detail (/organizations/[slug])
├── Logo, name, description
├── Industry, location
├── Members count
├── Events list
└── Website link

Static Pages: About, FAQ, Contact, Terms, Privacy, Community Guidelines, Event Guidelines
```

### Data Requirements

| Page | API Endpoint | Query Params |
|------|-------------|-------------|
| Landing | GET /admin/stats | — |
| Community Directory | GET /communities | page, limit, search |
| Community Detail | GET /communities/:slug | — |
| Event Directory | GET /events | page, limit, search, upcoming |
| Event Detail | GET /events/:slug | — |
| Organization Directory | GET /organizations | page, limit, search |
| Organization Detail | GET /organizations/:slug | — |

---

## Module 2: Authentication

### Components

```
Login Page (/login)
├── Email input
├── Password input
├── "Masuk" button
├── Link: "Daftar" → /register
├── Link: "Lupa password?" → /forgot-password
└── Error display

Register Page (/register)
├── Name input
├── Email input
├── Password input
├── Confirm password input
├── "Daftar" button
├── Link: "Sudah punya akun? Masuk" → /login
└── Error display

Forgot Password (/forgot-password)
├── Email input
├── "Kirim Link Reset" button
├── Success message display
└── Link: "Kembali ke Login" → /login

Reset Password (/reset-password) [PLANNED]
├── New password input
├── Confirm password input
├── "Reset Password" button
└── Success redirect to /login
```

### Auth Flow

```
Register:
  1. POST /auth/register → Set cookies → Redirect to /
  2. Error → Display error message

Login:
  1. POST /auth/login → Set cookies → Redirect to /
  2. Error → Display error message

Logout:
  1. POST /auth/logout → Clear cookies → Redirect to /
```

---

## Module 3: Member (Dashboard)

### Components

```
Dashboard Layout (/dashboard)
├── Sidebar (navigation)
├── Profile summary
└── Content area

Profile (/dashboard/profile)
├── Avatar upload
├── Name input
├── Email (read-only)
├── Phone input
├── Bio textarea
├── Location input
├── Save button
└── Password change section

Interests (/dashboard/interests)
├── Interest tags (add/remove)
├── Suggested interests
└── Save button

Notifications (/dashboard/notifications)
├── Notification list
├── Unread indicator
├── Mark as read
├── Mark all as read
└── Pagination

Activity History (/dashboard/activity)
├── Activity timeline
├── Action icons
├── Timestamps
└── Pagination

My Communities (/dashboard/communities)
├── Joined communities list
├── Created communities list
├── Pending join requests
└── Quick actions

My Events (/dashboard/events)
├── Registered events
├── Created events
├── Upcoming/past tabs
└── Quick actions
```

### API Integration

| Feature | Endpoint | Method |
|---------|----------|--------|
| View profile | GET /users/profile | GET |
| Edit profile | PUT /users/profile | PUT |
| Update interests | PUT /users/interests | PUT |
| View notifications | GET /users/notifications | GET |
| Mark notification read | PUT /users/notifications/:id/read | PUT |
| View activity | GET /users/activity | GET |
| My communities | Filter from joinedCommunities | Client |
| My events | Filter from registeredEvents | Client |

---

## Module 4: Community (Dashboard)

### Components

```
Create Community (/communities/new)
├── Name input
├── Description textarea
├── Cover image upload
├── Logo upload
├── Location input
├── Website input
├── Membership type select (OPEN/RESTRICTED)
├── Category multi-select
├── Submit button
└── Validation errors

Community Admin (/dashboard/communities/[id])
├── Community overview
├── Status indicator
├── Member count
├── Quick stats
├── Navigation tabs
│   ├── Overview
│   ├── Members
│   ├── Join Requests
│   ├── Events
│   └── Settings

Edit Community (/dashboard/communities/[id]/edit)
├── Same form as create (pre-filled)
└── Save button

Member Management (/dashboard/communities/[id]/members)
├── Member list table
├── Role change dropdown
├── Ban/Remove actions
├── Search input
└── Pagination

Join Request Management (/dashboard/communities/[id]/join-requests)
├── Pending requests list
├── User info display
├── Message display
├── Approve/Reject buttons
└── Pagination
```

### RBAC for Community Module

| Action | OWNER | ADMIN | EVENT_MANAGER | MEMBER |
|--------|-------|-------|---------------|--------|
| View community | ✅ | ✅ | ✅ | ✅ |
| Edit community | ✅ | ❌ | ❌ | ❌ |
| Delete community | ✅ | ❌ | ❌ | ❌ |
| View members | ✅ | ✅ | ✅ | ✅ |
| Manage members | ✅ | ✅ | ❌ | ❌ |
| Approve join requests | ✅ | ✅ | ❌ | ❌ |
| Create event | ✅ | ✅ | ✅ | ❌ |
| Leave community | ✅* | ✅ | ✅ | ✅ |

> *Owner cannot leave; must transfer ownership first.

---

## Module 5: Organization (Dashboard)

### Components

```
Create Organization (/organizations/new)
├── Name input
├── Description textarea
├── Logo upload
├── Website input
├── Location input
├── Industry input
├── Submit button
└── Validation errors

Organization Admin (/dashboard/organizations/[id])
├── Organization overview
├── Status indicator
├── Member count
├── Quick stats
├── Navigation tabs
│   ├── Overview
│   ├── Members
│   ├── Events
│   └── Settings

Edit Organization (/dashboard/organizations/[id]/edit)
├── Same form as create (pre-filled)
└── Save button

Team Management (/dashboard/organizations/[id]/members)
├── Member list table
├── Role change dropdown
├── Invite member
├── Remove member
├── Search input
└── Pagination

Organization Detail (/organizations/[slug]) [PLANNED]
├── Logo, name, description
├── Industry, location, website
├── Members list
├── Events list
└── Join/Contact button
```

---

## Module 6: Event (Dashboard)

### Components

```
Create Event (/events/new)
├── Title input
├── Description textarea
├── Cover image upload
├── Location input
├── Online toggle
├── Online URL input (conditional)
├── Event date picker
├── End date picker (optional)
├── Quota number input
├── Community/Org selector
├── Category multi-select
├── Submit button
└── Validation errors (date > now, quota >= 1)

Event Admin (/dashboard/events/[id])
├── Event overview
├── Status indicator
├── Registration count / quota
├── Quick stats
├── Navigation tabs
│   ├── Overview
│   ├── Participants
│   └── Settings

Edit Event (/dashboard/events/[id]/edit)
├── Same form as create (pre-filled)
└── Save button

Participants (/events/:eventId/participants) [PLANNED]
├── Registered users list
├── Status column (CONFIRMED/WAITLISTED/CANCELLED)
├── Export button
└── Search input
```

---

## Module 7: Administration

### Components

```
Admin Layout (/admin)
├── Admin sidebar
├── Platform stats header
└── Content area

Admin Dashboard (/admin)
├── Total users card
├── Total communities card
├── Total organizations card
├── Total events card
├── Pending approvals card
├── Open reports card
├── Recent activity chart
└── Quick actions

User Management (/admin/users)
├── Search input
├── Status filter
├── Role filter
├── User table (name, email, status, roles, joined)
├── Suspend/Activate buttons
├── View profile link
└── Pagination

User Detail (/admin/users/[id])
├── User info
├── Current roles
├── Activity history
├── Change role (Super Admin only)
├── Suspend/Activate
└── Communities joined

Community Approval (/admin/communities)
├── Pending communities list
├── Community info (name, owner, description)
├── Approve/Suspend buttons
├── View detail link
└── Pagination

Organization Approval (/admin/organizations)
├── Pending organizations list
├── Org info (name, owner, description)
├── Approve/Suspend buttons
├── View detail link
└── Pagination

Report Moderation (/admin/reports)
├── Report list (status, type, reason, reporter)
├── Status filter (OPEN, UNDER_REVIEW)
├── Resolve action (SUSPENDED/DISMISSED)
├── View details modal
└── Pagination

Audit Log (/admin/audit-logs)
├── Log table (user, action, resource, timestamp)
├── User filter
├── Action type filter
├── Date range filter
├── Before/After data expand
└── Pagination

Category Management (/admin/categories)
├── Category table (name, icon, status)
├── Create category form
├── Edit category
├── Toggle active/inactive
└── Reorder (planned)

Settings (/admin/settings) [PLANNED]
├── Platform name
├── Registration enabled toggle
├── Maintenance mode toggle
└── Save button
```

---

## Module Cross-Cutting Concerns

### Notification Generation Points

| Event | Notification Type | Recipient |
|-------|------------------|-----------|
| Community approved | APPROVAL | Community Owner |
| Community suspended | APPROVAL | Community Owner |
| Organization approved | APPROVAL | Org Owner |
| Organization suspended | APPROVAL | Org Owner |
| Join request approved | COMMUNITY | Requester |
| Join request rejected | COMMUNITY | Requester |
| Event registration confirmed | EVENT | Registrant |
| Report resolved | REPORT | Reporter |
| New member joined community | COMMUNITY | Community Admins |
| User suspended | SYSTEM | Suspended User |

### Audit Log Points

| Action | Trigger | beforeData | afterData |
|--------|---------|-----------|-----------|
| USER_REGISTER | POST /auth/register | null | user snapshot |
| USER_LOGIN | POST /auth/login | null | login info |
| USER_SUSPEND | PUT /admin/users/:id/suspend | status: ACTIVE | status: SUSPENDED |
| USER_ACTIVATE | PUT /admin/users/:id/activate | status: SUSPENDED | status: ACTIVE |
| USER_ROLE_CHANGE | PUT /admin/users/:id/role | old role | new role |
| COMMUNITY_CREATE | POST /communities | null | community snapshot |
| COMMUNITY_APPROVE | PUT /admin/communities/:id/approve | status: PENDING | status: APPROVED |
| COMMUNITY_SUSPEND | PUT /admin/communities/:id/suspend | status: APPROVED | status: SUSPENDED |
| JOIN_REQUEST_APPROVE | PUT /communities/:id/join-requests/:rid | status: PENDING | status: APPROVED |
| JOIN_REQUEST_REJECT | PUT /communities/:id/join-requests/:rid | status: PENDING | status: REJECTED |
| ORG_CREATE | POST /organizations | null | org snapshot |
| ORG_APPROVE | PUT /admin/organizations/:id/approve | status: PENDING | status: APPROVED |
| EVENT_CREATE | POST /events | null | event snapshot |
| EVENT_REGISTER | POST /events/:id/register | null | registration |
| EVENT_CANCEL | DELETE /events/:id/register | status: CONFIRMED | status: CANCELLED |
| REPORT_CREATE | POST /reports | null | report snapshot |
| REPORT_RESOLVE | PUT /admin/reports/:id/resolve | status: OPEN | status: RESOLVED |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
