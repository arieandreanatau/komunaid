# 03 — DATABASE DESIGN

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Overview

| Property | Value |
|----------|-------|
| DBMS | MySQL 8.x |
| ORM | Prisma 6.9 |
| Models | 16 |
| Tables | 16 (maps to @@map) |
| Enums | 12 |
| Indexes | 24 |
| Relations | 30+ |

---

## Entity Relationship Diagram (Text)

```
┌──────────┐    ┌──────────────┐    ┌──────────┐
│   User   │───<│  UserRole    │    │ Category │
│          │    └──────────────┘    │          │
│          │    ┌──────────────┐    │          │
│          │───<│ UserInterest │    │          │
│          │    └──────────────┘    │          │
│          │    ┌──────────────┐    │          │
│          │───<│ Notification │    │          │
│          │    └──────────────┘    │          │
│          │    ┌──────────────┐    │          │
│          │───<│ActivityHist. │    │          │
│          │    └──────────────┘    │          │
│          │    ┌──────────────┐    │          │
│          │───<│  AuditLog    │    │          │
│          │    └──────────────┘    │          │
│          │    ┌──────────────┐    │          │
│          │───<│    Report    │    │          │
│          │    └──────────────┘    │          │
│          │                        │          │
│          │──creates──> Community──>│          │
│          │──creates──> Org───────>│          │
│          │──creates──> Event──┐   │          │
└──────────┘                    │   └──────────┘
                                │
┌──────────────┐                │
│CommunityMember│──belongs_to── Community ──< CommunityCategory
└──────────────┘                │                │
┌──────────────┐                │                │
│ JoinRequest  │──belongs_to── Community ───────┘
└──────────────┘                │
┌──────────────────┐            │
│OrganizationMember│──belongs_to── Organization
└──────────────────┘            │
                                │
┌──────────────────┐            │
│EventRegistration │──belongs_to── Event ──< EventCategory
└──────────────────┘            │                │
                                │                └──belongs_to── Category
                                │
                                └──belongsTo── Community? | Organization? | User
```

---

## Model Specifications

### 1. User

**Table:** `users`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK, @default(cuid()) | Unique identifier |
| email | VARCHAR | UNIQUE, NOT NULL | Email address |
| password | VARCHAR | NOT NULL | bcryptjs hash |
| name | VARCHAR | NOT NULL | Display name |
| avatar | VARCHAR? | | Profile image URL |
| phone | VARCHAR? | | Phone number |
| bio | VARCHAR? | | Biography |
| location | VARCHAR? | | Location |
| emailVerifiedAt | DATETIME? | | Email verification timestamp |
| status | ENUM | DEFAULT ACTIVE | ACTIVE, SUSPENDED, DEACTIVATED |
| deletedAt | DATETIME? | | Soft delete timestamp |
| createdAt | DATETIME | DEFAULT now() | Creation timestamp |
| updatedAt | DATETIME | @updatedAt | Last update timestamp |

**Relations:**
- roles (UserRole[]) — 1:N
- interests (UserInterest[]) — 1:N
- joinedCommunities (CommunityMember[]) — 1:N
- organizationMembers (OrganizationMember[]) — 1:N
- registeredEvents (EventRegistration[]) — 1:N
- createdCommunities (Community[]) — 1:N
- createdOrganizations (Organization[]) — 1:N
- createdEvents (Event[]) — 1:N
- auditLogs (AuditLog[]) — 1:N
- reportedReports (Report[]) — 1:N
- reviewedReports (Report[]) — 1:N
- joinRequests (JoinRequest[]) — 1:N
- notifications (Notification[]) — 1:N
- activityLogs (ActivityHistory[]) — 1:N

---

### 2. UserRole

**Table:** `user_roles`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | Unique identifier |
| userId | VARCHAR | FK → User.id, CASCADE | User reference |
| role | ENUM | NOT NULL | SUPER_ADMIN, PLATFORM_ADMIN, MEMBER |
| createdAt | DATETIME | DEFAULT now() | Creation timestamp |

**Constraints:** UNIQUE(userId, role)

---

### 3. Community

**Table:** `communities`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | Unique identifier |
| name | VARCHAR | NOT NULL | Community name |
| slug | VARCHAR | UNIQUE, NOT NULL | URL slug |
| description | TEXT? | | Description |
| coverImage | VARCHAR? | | Cover image URL |
| logo | VARCHAR? | | Logo URL |
| location | VARCHAR? | | Physical location |
| website | VARCHAR? | | Website URL |
| membershipType | ENUM | DEFAULT OPEN | OPEN, RESTRICTED |
| status | ENUM | DEFAULT PENDING | PENDING, APPROVED, SUSPENDED, ARCHIVED |
| deletedAt | DATETIME? | | Soft delete timestamp |
| ownerId | VARCHAR | FK → User.id | Creator/owner |
| createdAt | DATETIME | DEFAULT now() | |
| updatedAt | DATETIME | @updatedAt | |

**Indexes:** ownerId, status

**Relations:**
- owner (User) — N:1
- members (CommunityMember[]) — 1:N
- events (Event[]) — 1:N
- categories (CommunityCategory[]) — 1:N
- joinRequests (JoinRequest[]) — 1:N

---

### 4. CommunityMember

**Table:** `community_members`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| communityId | VARCHAR | FK → Community.id, CASCADE | |
| userId | VARCHAR | FK → User.id, CASCADE | |
| role | ENUM | DEFAULT MEMBER | OWNER, ADMIN, EVENT_MANAGER, MEMBER |
| status | ENUM | DEFAULT ACTIVE | ACTIVE, PENDING, REJECTED, BANNED |
| joinedAt | DATETIME | DEFAULT now() | |

**Constraints:** UNIQUE(communityId, userId)
**Indexes:** communityId, userId

---

### 5. JoinRequest

**Table:** `join_requests`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| communityId | VARCHAR | FK → Community.id, CASCADE | |
| userId | VARCHAR | FK → User.id, CASCADE | |
| status | ENUM | DEFAULT PENDING | PENDING, APPROVED, REJECTED |
| message | TEXT? | | Request message |
| createdAt | DATETIME | DEFAULT now() | |
| updatedAt | DATETIME | @updatedAt | |

**Constraints:** UNIQUE(communityId, userId)

---

### 6. Organization

**Table:** `organizations`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| name | VARCHAR | NOT NULL | |
| slug | VARCHAR | UNIQUE, NOT NULL | |
| description | TEXT? | | |
| logo | VARCHAR? | | |
| website | VARCHAR? | | |
| location | VARCHAR? | | |
| industry | VARCHAR? | | |
| status | ENUM | DEFAULT PENDING | PENDING, APPROVED, SUSPENDED, ARCHIVED |
| deletedAt | DATETIME? | | Soft delete |
| ownerId | VARCHAR | FK → User.id | |
| createdAt | DATETIME | DEFAULT now() | |
| updatedAt | DATETIME | @updatedAt | |

**Indexes:** ownerId, status

---

### 7. OrganizationMember

**Table:** `organization_members`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| organizationId | VARCHAR | FK → Organization.id, CASCADE | |
| userId | VARCHAR | FK → User.id, CASCADE | |
| role | ENUM | DEFAULT MEMBER | OWNER, ADMIN, MEMBER |
| status | ENUM | DEFAULT ACTIVE | ACTIVE, PENDING, REJECTED, BANNED |
| joinedAt | DATETIME | DEFAULT now() | |

**Constraints:** UNIQUE(organizationId, userId)

---

### 8. Event

**Table:** `events`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| title | VARCHAR | NOT NULL | |
| slug | VARCHAR | UNIQUE, NOT NULL | |
| description | TEXT? | | |
| coverImage | VARCHAR? | | |
| location | VARCHAR? | | |
| isOnline | BOOLEAN | DEFAULT false | |
| onlineUrl | VARCHAR? | | |
| eventDate | DATETIME | NOT NULL | |
| endDate | DATETIME? | | |
| quota | INT | NOT NULL | |
| status | ENUM | DEFAULT PENDING | PENDING, APPROVED, ONGOING, COMPLETED, CANCELLED, SUSPENDED |
| deletedAt | DATETIME? | | Soft delete |
| communityId | VARCHAR? | FK → Community.id, SET NULL | |
| organizationId | VARCHAR? | FK → Organization.id, SET NULL | |
| createdById | VARCHAR | FK → User.id | |
| createdAt | DATETIME | DEFAULT now() | |
| updatedAt | DATETIME | @updatedAt | |

**Indexes:** communityId, organizationId, createdById, eventDate, status

---

### 9. EventRegistration

**Table:** `event_registrations`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| eventId | VARCHAR | FK → Event.id, CASCADE | |
| userId | VARCHAR | FK → User.id, CASCADE | |
| status | ENUM | DEFAULT CONFIRMED | PENDING, CONFIRMED, CANCELLED, WAITLISTED |
| registeredAt | DATETIME | DEFAULT now() | |

**Constraints:** UNIQUE(eventId, userId)
**Indexes:** eventId, userId

---

### 10. Category

**Table:** `categories`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| name | VARCHAR | UNIQUE, NOT NULL | |
| slug | VARCHAR | UNIQUE, NOT NULL | |
| description | TEXT? | | |
| icon | VARCHAR? | | |
| isActive | BOOLEAN | DEFAULT true | |
| createdAt | DATETIME | DEFAULT now() | |
| updatedAt | DATETIME | @updatedAt | |

---

### 11. Report

**Table:** `reports`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| reporterId | VARCHAR | FK → User.id | |
| targetType | ENUM | NOT NULL | COMMUNITY, EVENT, USER, ORGANIZATION |
| targetId | VARCHAR | NOT NULL | Polymorphic target |
| reason | ENUM | NOT NULL | SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, MISINFORMATION, COPYRIGHT_VIOLATION, OTHER |
| description | TEXT? | | |
| status | ENUM | DEFAULT OPEN | OPEN, UNDER_REVIEW, DISMISSED, SUSPENDED |
| reviewedBy | VARCHAR? | FK → User.id | |
| reviewedAt | DATETIME? | | |
| createdAt | DATETIME | DEFAULT now() | |
| updatedAt | DATETIME | @updatedAt | |

**Indexes:** status, (targetType, targetId)

---

### 12. AuditLog

**Table:** `audit_logs`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| userId | VARCHAR | FK → User.id | |
| actionType | VARCHAR | NOT NULL | Action identifier |
| resourceName | VARCHAR | NOT NULL | Resource type |
| resourceId | VARCHAR | NOT NULL | Resource ID |
| beforeData | JSON? | | Previous state |
| afterData | JSON? | | New state |
| ipAddress | VARCHAR? | | Client IP |
| createdAt | DATETIME | DEFAULT now() | |

**Indexes:** userId, (resourceName, resourceId), actionType, createdAt
**Constraint:** IMMUTABLE — no UPDATE, no DELETE

---

### 13. Notification

**Table:** `notifications`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| userId | VARCHAR | FK → User.id, CASCADE | |
| title | VARCHAR | NOT NULL | |
| message | TEXT | NOT NULL | |
| type | ENUM | NOT NULL | SYSTEM, COMMUNITY, EVENT, REPORT, APPROVAL |
| isRead | BOOLEAN | DEFAULT false | |
| link | VARCHAR? | | Deep link |
| createdAt | DATETIME | DEFAULT now() | |

**Indexes:** (userId, isRead)

---

### 14. UserInterest

**Table:** `user_interests`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| userId | VARCHAR | FK → User.id, CASCADE | |
| interest | VARCHAR | NOT NULL | Free-text interest |
| createdAt | DATETIME | DEFAULT now() | |

**Constraints:** UNIQUE(userId, interest)

---

### 15. ActivityHistory

**Table:** `activity_history`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| userId | VARCHAR | FK → User.id, CASCADE | |
| action | VARCHAR | NOT NULL | Action identifier |
| details | JSON? | | Additional details |
| createdAt | DATETIME | DEFAULT now() | |

**Indexes:** userId, createdAt

---

### 16. Setting

**Table:** `settings`

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | VARCHAR(25) | PK | |
| key | VARCHAR | UNIQUE, NOT NULL | Setting key |
| value | JSON | NOT NULL | Setting value |
| updatedAt | DATETIME | @updatedAt | |

---

## Index Strategy

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| communities | idx_owner | ownerId | Owner lookup |
| communities | idx_status | status | Status filtering |
| community_members | idx_community | communityId | Member list |
| community_members | idx_user | userId | User's communities |
| community_members | uq_unique | (communityId, userId) | Unique membership |
| organizations | idx_owner | ownerId | Owner lookup |
| organizations | idx_status | status | Status filtering |
| organization_members | idx_organization | organizationId | Member list |
| organization_members | idx_user | userId | User's orgs |
| events | idx_community | communityId | Community events |
| events | idx_organization | organizationId | Org events |
| events | idx_createdBy | createdById | Creator events |
| events | idx_eventDate | eventDate | Date filtering |
| events | idx_status | status | Status filtering |
| event_registrations | idx_event | eventId | Event registrations |
| event_registrations | idx_user | userId | User's events |
| reports | idx_status | status | Report queue |
| reports | idx_target | (targetType, targetId) | Target lookup |
| audit_logs | idx_user | userId | User audit |
| audit_logs | idx_resource | (resourceName, resourceId) | Resource audit |
| audit_logs | idx_action | actionType | Action filtering |
| audit_logs | idx_created | createdAt | Time-based queries |
| notifications | idx_user_read | (userId, isRead) | Unread count |
| activity_history | idx_user | userId | User activity |
| activity_history | idx_created | createdAt | Time-based queries |

---

## Seed Data Plan

| Table | Records | Description |
|-------|---------|-------------|
| User | 5 | superadmin, admin, member1, member2, member3 |
| UserRole | 5 | 1 SUPER_ADMIN, 1 PLATFORM_ADMIN, 3 MEMBER |
| Category | 5 | Technology, Design, Business, Education, Social |
| Community | 3 | Tech Jakarta, Design Hub, Startup ID (APPROVED) |
| Organization | 2 | PT Tech, PT Creative (APPROVED) |
| CommunityMember | 6 | Owner + members for communities |
| OrganizationMember | 3 | Owner + members for orgs |
| Event | 3 | Hackathon, Workshop, Meetup (APPROVED) |
| EventRegistration | 5 | Members registered for events |
| Setting | 3 | platform_name, registration_enabled, maintenance_mode |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
