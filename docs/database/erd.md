# KomunaID Entity-Relationship Diagram

## Overview

Database schema for KomunaID — a Community-Tech platform built with NestJS, MySQL 8, and Prisma ORM.

**22 tables** across 5 domains: User/Auth, Community, Organization, Event, and System.

**Legend:**

```
PK    = Primary Key (VARCHAR(36) UUID)
FK    = Foreign Key
UQ    = Unique Constraint
NN    = NOT NULL
*     = Required field
#     = Indexed field
~     = Nullable
+     = Composite index
```

**Conventions:**

- All primary keys: `VARCHAR(36)` with `uuid()` default
- All tables use `snake_case` DB names via `@@map`
- All columns use `snake_case` DB names via `@map`
- Soft deletes via `deleted_at` on applicable tables
- Timestamps via `created_at` / `updated_at`

---

## ASCII ERD

```
┌───────────────────────────────────┐        ┌───────────────────────────────────┐
│             users                 │        │             roles                 │
├───────────────────────────────────┤        ├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │        │ PK id              VARCHAR(36)    │
│ UQ email           VARCHAR(255)   │◄──┐    │ UQ name            VARCHAR(50)    │
│    password_hash   VARCHAR(255)   │   │    │    description     VARCHAR(255)~ │
│    first_name      VARCHAR(100)   │   │    │    is_system       BOOLEAN       │
│    last_name       VARCHAR(100)   │   │    │    created_at      DATETIME      │
│ UQ username        VARCHAR(30)    │   │    │    updated_at      DATETIME      │
│    avatar          VARCHAR(500)~  │   │    └────────────┬────────────────────┘
│    bio             TEXT~          │   │                 │
│    location        VARCHAR(200)~  │   │    ┌────────────┴────────────────────┐
│    phone           VARCHAR(20)~   │   │    │   user_role_assignments          │
│    email_verified  BOOLEAN        │   │    ├──────────────────────────────────┤
│    is_active       BOOLEAN        │   │    │ PK id              VARCHAR(36)   │
│    is_suspended    BOOLEAN        │   │    │ FK user_id         VARCHAR(36)   │
│    suspended_at    DATETIME~      │   │    │ FK role_id         VARCHAR(36)   │
│    suspended_reason VARCHAR(500)~ │   │    │ FK granted_by_id   VARCHAR(36)~  │
│    last_login_at   DATETIME~      │   │    │    granted_at      DATETIME      │
│    interests       TEXT~          │   │    │    scope           VARCHAR(50)~  │
│    created_at      DATETIME       │   │    │    scope_id        VARCHAR(36)~  │
│    updated_at      DATETIME       │   │    │    created_at      DATETIME      │
│    deleted_at      DATETIME~      │   │    └──────────────────────────────────┘
└───────┬───────────────────────────┘   │
        │                               │    ┌──────────────────────────────────┐
        │                               │    │  role_upgrade_requests            │
        │                               │    ├──────────────────────────────────┤
        │                               │    │ PK id              VARCHAR(36)   │
        └───────────────────────────────┼───►│ FK user_id         VARCHAR(36)   │
                                        ├───►│ FK requested_role_id VARCHAR(36) │
                                        │    │    reason          TEXT          │
                                        │    │    status          VARCHAR(20)   │
                                        │    │ FK reviewed_by_id  VARCHAR(36)~  │
                                        │    │    reviewed_at     DATETIME~     │
                                        │    │    review_note     VARCHAR(500)~ │
                                        │    │    created_at      DATETIME      │
                                        │    │    updated_at      DATETIME      │
                                        │    └──────────────────────────────────┘

┌───────────────────────────────────┐
│          communities              │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│    name            VARCHAR(200)   │
│ UQ slug            VARCHAR(200)   │
│    description     TEXT           │
│    short_desc      VARCHAR(300)~  │
│    logo            VARCHAR(500)~  │
│    banner          VARCHAR(500)~  │
│    category        VARCHAR(100)   │
│    location        VARCHAR(200)~  │
│    website         VARCHAR(500)~  │
│    contact_email   VARCHAR(255)~  │
│    contact_phone   VARCHAR(20)~   │
│    founded_at      DATETIME~      │
│    membership_type VARCHAR(20)    │
│    max_members     INT~           │
│    is_verified     BOOLEAN        │
│    status          VARCHAR(20)    │
│    status_reason   VARCHAR(500)~  │
│    approved_at     DATETIME~      │
│ FK approved_by_id  VARCHAR(36)~ ──► users.id
│    rejected_at     DATETIME~      │
│ FK rejected_by_id  VARCHAR(36)~ ──► users.id
│    suspended_at    DATETIME~      │
│    suspended_reason VARCHAR(500)~ │
│ FK owner_id        VARCHAR(36)  ──► users.id
│    created_at      DATETIME       │
│    updated_at      DATETIME       │
│    deleted_at      DATETIME~      │
└───┬─────────┬─────────────────────┘
    │         │
    │         │    ┌──────────────────────────────────┐
    │         │    │       community_members           │
    │         │    ├──────────────────────────────────┤
    │         │    │ PK id              VARCHAR(36)   │
    │         ├───►│ FK community_id    VARCHAR(36)   │
    │         ├───►│ FK user_id         VARCHAR(36) ──► users.id
    │         │    │    role            VARCHAR(20)    │
    │         │    │    joined_at       DATETIME       │
    │         │    │    status          VARCHAR(20)    │
    │         │    └──────────────────────────────────┘
    │         │
    │         │    ┌──────────────────────────────────┐
    │         │    │     community_categories          │
    │         │    ├──────────────────────────────────┤
    │         │    │ PK id              VARCHAR(36)   │
    │         ├───►│ FK community_id    VARCHAR(36)   │
    │         ├───►│ FK category_id     VARCHAR(36) ──► categories.id
    │         │    │    created_at      DATETIME       │
    │         │    └──────────────────────────────────┘
    │         │
    │         │    ┌──────────────────────────────────┐
    │         │    │       community_roles             │
    │         │    ├──────────────────────────────────┤
    │         │    │ PK id              VARCHAR(36)   │
    │         ├───►│ FK community_id    VARCHAR(36)   │
    │         │    │    name            VARCHAR(50)    │
    │         │    │    description     VARCHAR(255)~  │
    │         │    │    permissions     TEXT~          │
    │         │    │    is_default      BOOLEAN        │
    │         │    │    created_at      DATETIME       │
    │         │    │    updated_at      DATETIME       │
    │         │    └──────────────────────────────────┘
    │         │
    │         │    ┌──────────────────────────────────┐
    │         │    │       community_events            │
    │         │    ├──────────────────────────────────┤
    │         │    │ PK id              VARCHAR(36)   │
    │         ├───►│ FK community_id    VARCHAR(36)   │
    │         └───►│ FK event_id        VARCHAR(36) ──► events.id
    │              └──────────────────────────────────┘
    │
    │              ┌──────────────────────────────────┐
    │              │            posts                  │
    │              ├──────────────────────────────────┤
    │              │ PK id              VARCHAR(36)   │
    ├─────────────►│ FK community_id    VARCHAR(36)   │
    │              │ FK author_id       VARCHAR(36) ──► users.id
    │              │    title           VARCHAR(200)   │
    │              │    slug            VARCHAR(250)   │
    │              │    content         LONGTEXT       │
    │              │    excerpt         VARCHAR(500)~  │
    │              │    cover_image     VARCHAR(500)~  │
    │              │    status          VARCHAR(20)    │
    │              │    published_at    DATETIME~      │
    │              │    created_at      DATETIME       │
    │              │    updated_at      DATETIME       │
    │              │    deleted_at      DATETIME~      │
    │              └──────────────────────────────────┘

┌───────────────────────────────────┐
│         organizations             │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│    name            VARCHAR(200)   │
│ UQ slug            VARCHAR(200)   │
│    description     TEXT           │
│    short_desc      VARCHAR(300)~  │
│    logo            VARCHAR(500)~  │
│    banner          VARCHAR(500)~  │
│    industry        VARCHAR(100)~  │
│    location        VARCHAR(200)~  │
│    website         VARCHAR(500)~  │
│    contact_email   VARCHAR(255)~  │
│    founded_at      DATETIME~      │
│    size            VARCHAR(50)~   │
│    status          VARCHAR(20)    │
│    status_reason   VARCHAR(500)~  │
│    approved_at     DATETIME~      │
│ FK approved_by_id  VARCHAR(36)~ ──► users.id
│    rejected_at     DATETIME~      │
│ FK rejected_by_id  VARCHAR(36)~ ──► users.id
│    suspended_at    DATETIME~      │
│    suspended_reason VARCHAR(500)~ │
│ FK owner_id        VARCHAR(36)  ──► users.id
│    created_at      DATETIME       │
│    updated_at      DATETIME       │
│    deleted_at      DATETIME~      │
└───┬───────────────────────────────┘
    │
    │    ┌──────────────────────────────────┐
    │    │     organization_members         │
    │    ├──────────────────────────────────┤
    │    │ PK id              VARCHAR(36)   │
    ├───►│ FK organization_id VARCHAR(36)   │
    ├───►│ FK user_id         VARCHAR(36) ──► users.id
    │    │    role            VARCHAR(20)    │
    │    │    joined_at       DATETIME       │
    │    │    status          VARCHAR(20)    │
    │    └──────────────────────────────────┘
    │
    │    ┌──────────────────────────────────┐
    │    │     organization_events          │
    │    ├──────────────────────────────────┤
    │    │ PK id              VARCHAR(36)   │
    ├───►│ FK organization_id VARCHAR(36)   │
    └───►│ FK event_id        VARCHAR(36) ──► events.id
         └──────────────────────────────────┘

┌───────────────────────────────────┐
│             events                │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│    title           VARCHAR(200)   │
│ UQ slug            VARCHAR(200)   │
│    description     LONGTEXT       │
│    short_desc      VARCHAR(300)~  │
│    banner          VARCHAR(500)~  │
│    start_date      DATETIME       │
│    end_date        DATETIME       │
│    start_time      VARCHAR(10)~   │
│    end_time        VARCHAR(10)~   │
│    location        VARCHAR(300)~  │
│    location_url    VARCHAR(500)~  │
│    is_online       BOOLEAN        │
│    online_url      VARCHAR(500)~  │
│    category        VARCHAR(100)   │
│    capacity        INT~           │
│    reg_deadline    DATETIME~      │
│    status          VARCHAR(20)    │
│    status_reason   VARCHAR(500)~  │
│    approved_at     DATETIME~      │
│ FK approved_by_id  VARCHAR(36)~ ──► users.id
│ FK created_by_id   VARCHAR(36)  ──► users.id
│    is_featured     BOOLEAN        │
│    created_at      DATETIME       │
│    updated_at      DATETIME       │
│    deleted_at      DATETIME~      │
└───────────┬───────────────────────┘
            │
            │    ┌──────────────────────────────────┐
            │    │    event_registrations             │
            │    ├──────────────────────────────────┤
            │    │ PK id              VARCHAR(36)   │
            ├───►│ FK event_id        VARCHAR(36)   │
            ├───►│ FK user_id         VARCHAR(36) ──► users.id
            │    │    status          VARCHAR(20)    │
            │    │    registered_at   DATETIME       │
            │    │    cancelled_at    DATETIME~      │
            │    │    checked_in_at   DATETIME~      │
            │    └──────────────────────────────────┘

┌───────────────────────────────────┐
│           categories              │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│    name            VARCHAR(100)   │
│ UQ slug            VARCHAR(100)   │
│    description     VARCHAR(500)~  │
│    type            VARCHAR(20)    │
│    is_active       BOOLEAN        │
│ FK parent_id       VARCHAR(36)~ ──► categories.id (self)
│    created_at      DATETIME       │
│    updated_at      DATETIME       │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│            reports                │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│ FK reporter_id     VARCHAR(36)  ──► users.id
│    target_type     VARCHAR(20)    │
│    target_id       VARCHAR(36)    │
│    reason          VARCHAR(200)   │
│    description     TEXT~          │
│    status          VARCHAR(20)    │
│    resolved_at     DATETIME~      │
│ FK resolved_by_id  VARCHAR(36)~ ──► users.id
│    resolution      TEXT~          │
│    created_at      DATETIME       │
│    updated_at      DATETIME       │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│         notifications             │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│ FK user_id         VARCHAR(36)  ──► users.id
│    type            VARCHAR(20)    │
│    title           VARCHAR(200)   │
│    message         TEXT           │
│    data            TEXT~          │
│    is_read         BOOLEAN        │
│    read_at         DATETIME~      │
│    created_at      DATETIME       │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│           audit_logs              │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│ FK user_id         VARCHAR(36)  ──► users.id
│    action          VARCHAR(100)   │
│    entity_type     VARCHAR(50)    │
│    entity_id       VARCHAR(36)    │
│    old_values      TEXT~          │
│    new_values      TEXT~          │
│    metadata        TEXT~          │
│    ip_address      VARCHAR(45)~   │
│    user_agent      VARCHAR(500)~  │
│    created_at      DATETIME       │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│          media_assets             │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│ FK user_id         VARCHAR(36)  ──► users.id
│    filename        VARCHAR(255)   │
│    orig_filename   VARCHAR(255)   │
│    mime_type       VARCHAR(100)   │
│    size            INT            │
│    url             VARCHAR(1000)  │
│    thumbnail_url   VARCHAR(1000)~ │
│    alt_text        VARCHAR(255)~  │
│    entity_type     VARCHAR(50)~   │
│    entity_id       VARCHAR(36)~   │
│    created_at      DATETIME       │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│        contact_messages           │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│    name            VARCHAR(100)   │
│    email           VARCHAR(255)   │
│    subject         VARCHAR(200)   │
│    message         TEXT           │
│    status          VARCHAR(20)    │
│    created_at      DATETIME       │
└───────────────────────────────────┘

┌───────────────────────────────────┐
│           settings                │
├───────────────────────────────────┤
│ PK id              VARCHAR(36)    │
│ UQ key             VARCHAR(100)   │
│    value           TEXT           │
│    description     VARCHAR(500)~  │
│ FK updated_by_id   VARCHAR(36)~ ──► users.id
│    created_at      DATETIME       │
│    updated_at      DATETIME       │
└───────────────────────────────────┘
```

---

## Relationship Summary

```
users ──1:N──► user_role_assignments
roles ──1:N──► user_role_assignments
users ──1:N──► role_upgrade_requests (as requester)
roles ──1:N──► role_upgrade_requests (as requested role)
users ──1:N──► role_upgrade_requests (as reviewer)

users ──1:N──► communities (as owner)
users ──1:N──► communities (as approver)
users ──1:N──► communities (as rejector)
communities ──1:N──► community_members
users ──1:N──► community_members
communities ──1:N──► community_events
events ──1:N──► community_events
communities ──1:N──► community_categories
categories ──1:N──► community_categories
communities ──1:N──► community_roles
communities ──1:N──► posts
users ──1:N──► posts (as author)

users ──1:N──► organizations (as owner)
users ──1:N──► organizations (as approver)
organizations ──1:N──► organization_members
users ──1:N──► organization_members
organizations ──1:N──► organization_events
events ──1:N──► organization_events

users ──1:N──► events (as creator)
users ──1:N──► events (as approver)
events ──1:N──► event_registrations
users ──1:N──► event_registrations

categories ──1:N──► categories (self-referencing: parent/child)

users ──1:N──► reports (as reporter)
users ──1:N──► reports (as resolver)

users ──1:N──► notifications
users ──1:N──► audit_logs
users ──1:N──► media_assets
```

---

## Status Enum Values

### CommunityStatus

| Value     | Description             |
| --------- | ----------------------- |
| PENDING   | Awaiting admin approval |
| APPROVED  | Approved and active     |
| REJECTED  | Rejected by admin       |
| SUSPENDED | Suspended by admin      |
| ARCHIVED  | Soft archived           |

### OrganizationStatus

| Value     | Description             |
| --------- | ----------------------- |
| PENDING   | Awaiting admin approval |
| APPROVED  | Approved and active     |
| REJECTED  | Rejected by admin       |
| SUSPENDED | Suspended by admin      |
| ARCHIVED  | Soft archived           |

### EventStatus

| Value     | Description         |
| --------- | ------------------- |
| DRAFT     | Not yet published   |
| PENDING   | Awaiting approval   |
| APPROVED  | Approved and active |
| REJECTED  | Rejected by admin   |
| CANCELLED | Event cancelled     |
| COMPLETED | Event has ended     |

### PostStatus

| Value     | Description           |
| --------- | --------------------- |
| DRAFT     | Not yet published     |
| PUBLISHED | Published and visible |
| ARCHIVED  | Archived              |
| FLAGGED   | Flagged for review    |

### ReportStatus

| Value        | Description             |
| ------------ | ----------------------- |
| PENDING      | Awaiting review         |
| UNDER_REVIEW | Being reviewed by admin |
| RESOLVED     | Issue resolved          |
| DISMISSED    | Report dismissed        |

### EventRegistrationStatus

| Value      | Description             |
| ---------- | ----------------------- |
| REGISTERED | Confirmed registration  |
| CANCELLED  | Registration cancelled  |
| WAITLISTED | On waiting list         |
| CHECKED_IN | Attended and checked in |

### CommunityMemberRole

| Value     | Description            |
| --------- | ---------------------- |
| OWNER     | Full community control |
| ADMIN     | Administrative access  |
| MODERATOR | Content moderation     |
| MEMBER    | Basic member           |

### CommunityMemberStatus

| Value    | Description           |
| -------- | --------------------- |
| ACTIVE   | Currently a member    |
| INACTIVE | Inactive membership   |
| BANNED   | Banned from community |

### OrganizationMemberRole

| Value  | Description               |
| ------ | ------------------------- |
| OWNER  | Full organization control |
| ADMIN  | Administrative access     |
| MEMBER | Basic member              |

### ContactMessageStatus

| Value   | Description           |
| ------- | --------------------- |
| UNREAD  | Not yet read by admin |
| READ    | Read by admin         |
| REPLIED | Admin has replied     |

### UpgradeRequestStatus

| Value    | Description             |
| -------- | ----------------------- |
| PENDING  | Request awaiting review |
| APPROVED | Request approved        |
| REJECTED | Request rejected        |

---

## Role Hierarchy

| Level | Role Name       | Description                                                |
| ----- | --------------- | ---------------------------------------------------------- |
| 100   | SUPER_ADMIN     | Full platform access, manage all users and settings        |
| 80    | PLATFORM_ADMIN  | Platform management, approve communities and organizations |
| 60    | ORG_OWNER       | Full control over owned organization                       |
| 50    | ORG_ADMIN       | Administrative access within an organization               |
| 40    | COMMUNITY_OWNER | Full control over owned community                          |
| 30    | COMMUNITY_ADMIN | Administrative access within a community                   |
| 20    | EVENT_MANAGER   | Can create and manage events                               |
| 10    | MEMBER          | Basic platform member                                      |

---

## Index Summary

| Table                 | Index                                                    | Columns                           | Type      |
| --------------------- | -------------------------------------------------------- | --------------------------------- | --------- |
| users                 | users_email_unique                                       | email                             | Unique    |
| users                 | users_username_unique                                    | username                          | Unique    |
| users                 | idx_users_deleted_at                                     | deleted_at                        | Normal    |
| roles                 | roles_name_unique                                        | name                              | Unique    |
| user_role_assignments | user_role_assignments_user_id_role_id_scope_scope_id_key | user_id, role_id, scope, scope_id | Unique    |
| user_role_assignments | idx_ura_user_id                                          | user_id                           | Normal    |
| user_role_assignments | idx_ura_role_id                                          | role_id                           | Normal    |
| role_upgrade_requests | idx_rur_user_id                                          | user_id                           | Normal    |
| role_upgrade_requests | idx_rur_status                                           | status                            | Normal    |
| communities           | communities_slug_unique                                  | slug                              | Unique    |
| communities           | idx_communities_status                                   | status                            | Normal    |
| communities           | idx_communities_owner_id                                 | owner_id                          | Normal    |
| communities           | idx_communities_category                                 | category                          | Normal    |
| communities           | idx_communities_deleted_at                               | deleted_at                        | Normal    |
| community_members     | community_members_community_id_user_id_key               | community_id, user_id             | Unique    |
| community_members     | idx_cm_community_id                                      | community_id                      | Normal    |
| community_members     | idx_cm_user_id                                           | user_id                           | Normal    |
| community_events      | community_events_community_id_event_id_key               | community_id, event_id            | Unique    |
| community_categories  | community_categories_community_id_category_id_key        | community_id, category_id         | Unique    |
| community_roles       | community_roles_community_id_name_key                    | community_id, name                | Unique    |
| organizations         | organizations_slug_unique                                | slug                              | Unique    |
| organizations         | idx_org_status                                           | status                            | Normal    |
| organizations         | idx_org_owner_id                                         | owner_id                          | Normal    |
| organizations         | idx_org_deleted_at                                       | deleted_at                        | Normal    |
| organization_members  | organization_members_organization_id_user_id_key         | organization_id, user_id          | Unique    |
| organization_members  | idx_om_organization_id                                   | organization_id                   | Normal    |
| organization_members  | idx_om_user_id                                           | user_id                           | Normal    |
| organization_events   | organization_events_organization_id_event_id_key         | organization_id, event_id         | Unique    |
| events                | events_slug_unique                                       | slug                              | Unique    |
| events                | idx_events_status                                        | status                            | Normal    |
| events                | idx_events_created_by_id                                 | created_by_id                     | Normal    |
| events                | idx_events_category                                      | category                          | Normal    |
| events                | idx_events_start_date                                    | start_date                        | Normal    |
| events                | idx_events_deleted_at                                    | deleted_at                        | Normal    |
| event_registrations   | event_registrations_event_id_user_id_key                 | event_id, user_id                 | Unique    |
| event_registrations   | idx_er_event_id                                          | event_id                          | Normal    |
| event_registrations   | idx_er_user_id                                           | user_id                           | Normal    |
| categories            | categories_slug_unique                                   | slug                              | Unique    |
| categories            | idx_categories_type                                      | type                              | Normal    |
| categories            | idx_categories_is_active                                 | is_active                         | Normal    |
| posts                 | posts_community_id_slug_key                              | community_id, slug                | Unique    |
| posts                 | idx_posts_community_id                                   | community_id                      | Normal    |
| posts                 | idx_posts_author_id                                      | author_id                         | Normal    |
| posts                 | idx_posts_status                                         | status                            | Normal    |
| posts                 | idx_posts_deleted_at                                     | deleted_at                        | Normal    |
| reports               | idx_reports_status                                       | status                            | Normal    |
| reports               | idx_reports_target                                       | target_type, target_id            | Composite |
| reports               | idx_reports_reporter_id                                  | reporter_id                       | Normal    |
| notifications         | idx_notifications_user_id                                | user_id                           | Normal    |
| notifications         | idx_notifications_is_read                                | is_read                           | Normal    |
| notifications         | idx_notifications_created_at                             | created_at                        | Normal    |
| audit_logs            | idx_audit_user_id                                        | user_id                           | Normal    |
| audit_logs            | idx_audit_action                                         | action                            | Normal    |
| audit_logs            | idx_audit_entity                                         | entity_type, entity_id            | Composite |
| audit_logs            | idx_audit_created_at                                     | created_at                        | Normal    |
| media_assets          | idx_ma_user_id                                           | user_id                           | Normal    |
| media_assets          | idx_ma_entity                                            | entity_type, entity_id            | Composite |
| contact_messages      | idx_cm_status                                            | status                            | Normal    |
| settings              | settings_key_unique                                      | key                               | Unique    |
| settings              | idx_settings_key                                         | key                               | Normal    |

---

## Normalization Analysis

### Current Normal Form: 3NF (Third Normal Form)

The schema follows 3NF:

| Normal Form | Requirement                        | Compliance                                                                                                                                                     |
| ----------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1NF         | Atomic values, no repeating groups | ✅ All columns store single values. JSON fields (oldValues, newValues, metadata, data, permissions) are explicitly marked as JSON strings, not relational data |
| 2NF         | No partial dependencies            | ✅ All non-key attributes depend on the full primary key. Composite unique constraints (communityId, userId) have no partial dependencies                      |
| 3NF         | No transitive dependencies         | ✅ Non-key attributes depend only on the primary key. Status fields are string enums, not separate tables (acceptable denormalization for readability)         |

### Denormalization Decisions

| Table         | Denormalization                        | Rationale                                                                                                              |
| ------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Community     | `category` as VARCHAR (not FK)         | Single primary category. `community_categories` junction table handles multi-category. Performance for listing queries |
| Event         | `category` as VARCHAR (not FK)         | Same rationale as Community                                                                                            |
| Post          | `slug` as VARCHAR (not auto-generated) | SEO-friendly URLs, human-readable                                                                                      |
| AuditLog      | `oldValues`/`newValues` as JSON TEXT   | Flexible schema for any entity type. No fixed columns needed                                                           |
| Notification  | `data` as JSON TEXT                    | Variable payload per notification type                                                                                 |
| CommunityRole | `permissions` as JSON TEXT             | Flexible permission set per community role                                                                             |

### Referential Integrity

All foreign keys enforce referential integrity via Prisma `@relation`:

- `onDelete: Cascade` for owned relationships (user→memberships, community→posts)
- `onDelete: Restrict` (default) for reference relationships (user→auditLogs)
- Soft deletes (`deletedAt`) prevent data loss; cascade deletes only on hard delete
