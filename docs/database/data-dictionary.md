# KomunaID Data Dictionary

Complete data dictionary for all database tables in the KomunaID platform.

All primary keys are `VARCHAR(36)` with `uuid()` default. All column and table names use `snake_case` in the database via Prisma `@map` and `@@map`.

---

## Table: `users`

Core user table. Profile fields (first_name, last_name, avatar, bio, location, phone, interests) are stored directly — no separate profiles table.

| Column           | Type (DB)    | Prisma Type | Nullable | Default    | Description                             |
| ---------------- | ------------ | ----------- | -------- | ---------- | --------------------------------------- |
| id               | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                             |
| email            | VARCHAR(255) | String      | NO       | —          | Unique email address for authentication |
| password_hash    | VARCHAR(255) | String      | NO       | —          | Bcrypt hashed password                  |
| first_name       | VARCHAR(100) | String      | NO       | —          | User's first name                       |
| last_name        | VARCHAR(100) | String      | NO       | —          | User's last name                        |
| username         | VARCHAR(30)  | String      | NO       | —          | Unique username for public profile URL  |
| avatar           | VARCHAR(500) | String?     | YES      | NULL       | URL to profile avatar image             |
| bio              | TEXT         | String?     | YES      | NULL       | User's biography/description            |
| location         | VARCHAR(200) | String?     | YES      | NULL       | User's location (city, country)         |
| phone            | VARCHAR(20)  | String?     | YES      | NULL       | Phone number                            |
| email_verified   | BOOLEAN      | Boolean     | NO       | false      | Whether email has been verified         |
| is_active        | BOOLEAN      | Boolean     | NO       | true       | Whether account is active               |
| is_suspended     | BOOLEAN      | Boolean     | NO       | false      | Whether account is suspended            |
| suspended_at     | DATETIME     | DateTime?   | YES      | NULL       | Timestamp when account was suspended    |
| suspended_reason | VARCHAR(500) | String?     | YES      | NULL       | Reason for suspension                   |
| last_login_at    | DATETIME     | DateTime?   | YES      | NULL       | Timestamp of last successful login      |
| interests        | TEXT         | String?     | YES      | NULL       | JSON array of interest IDs              |
| created_at       | DATETIME     | DateTime    | NO       | now()      | Account creation timestamp              |
| updated_at       | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp                   |
| deleted_at       | DATETIME     | DateTime?   | YES      | NULL       | Soft delete timestamp                   |

**Indexes:**

| Index                 | Columns    | Type    | Description         |
| --------------------- | ---------- | ------- | ------------------- |
| PRIMARY               | id         | Primary | UUID primary key    |
| users_email_unique    | email      | Unique  | Email uniqueness    |
| users_username_unique | username   | Unique  | Username uniqueness |
| idx_users_deleted_at  | deleted_at | Normal  | Soft delete filter  |

**Example Data:**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "john.doe@example.com",
  "password_hash": "$2b$10$abcdefghijklmnopqrstuvwxyz123456789",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "avatar": "https://storage.komunaid.com/avatars/johndoe.jpg",
  "bio": "Full-stack developer and community enthusiast",
  "location": "Tirana, Albania",
  "phone": "+355691234567",
  "email_verified": true,
  "is_active": true,
  "is_suspended": false,
  "suspended_at": null,
  "suspended_reason": null,
  "last_login_at": "2026-07-01T10:30:00Z",
  "interests": "[\"cat_001\", \"cat_002\", \"cat_005\"]",
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-07-01T10:30:00Z",
  "deleted_at": null
}
```

**Business Rules:**

- Email must be unique across the platform
- Username must be unique, 30 chars max
- Soft delete via `deleted_at` — queries should filter by `deleted_at IS NULL`
- `is_active` can be false for deactivated accounts independent of suspension
- `interests` stores a JSON array of category/interest IDs

---

## Table: `roles`

System roles with hierarchy levels.

| Column      | Type (DB)    | Prisma Type | Nullable | Default    | Description                            |
| ----------- | ------------ | ----------- | -------- | ---------- | -------------------------------------- |
| id          | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                            |
| name        | VARCHAR(50)  | String      | NO       | —          | Role name (unique)                     |
| description | VARCHAR(255) | String?     | YES      | NULL       | Human-readable role description        |
| is_system   | BOOLEAN      | Boolean     | NO       | false      | Whether this is a built-in system role |
| created_at  | DATETIME     | DateTime    | NO       | now()      | Creation timestamp                     |
| updated_at  | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp                  |

**Indexes:**

| Index             | Columns | Type    | Description          |
| ----------------- | ------- | ------- | -------------------- |
| PRIMARY           | id      | Primary | UUID primary key     |
| roles_name_unique | name    | Unique  | Role name uniqueness |

**Example Data:**

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "COMMUNITY_OWNER",
  "description": "Full control over owned community",
  "is_system": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

**Role Hierarchy:**

| Level | Name            | Description                                                |
| ----- | --------------- | ---------------------------------------------------------- |
| 100   | SUPER_ADMIN     | Full platform access, manage all users and settings        |
| 80    | PLATFORM_ADMIN  | Platform management, approve communities and organizations |
| 60    | ORG_OWNER       | Full control over owned organization                       |
| 50    | ORG_ADMIN       | Administrative access within an organization               |
| 40    | COMMUNITY_OWNER | Full control over owned community                          |
| 30    | COMMUNITY_ADMIN | Administrative access within a community                   |
| 20    | EVENT_MANAGER   | Can create and manage events                               |
| 10    | MEMBER          | Basic platform member                                      |

**Business Rules:**

- System roles (`is_system = true`) cannot be deleted
- Role assignment follows hierarchy — higher-level roles can manage lower-level roles

---

## Table: `user_role_assignments`

Maps users to roles with optional scoping to specific entities.

| Column        | Type (DB)   | Prisma Type | Nullable | Default | Description                                                        |
| ------------- | ----------- | ----------- | -------- | ------- | ------------------------------------------------------------------ |
| id            | VARCHAR(36) | String      | NO       | uuid()  | Primary key                                                        |
| user_id       | VARCHAR(36) | String      | NO       | —       | FK → users.id. The user being assigned                             |
| role_id       | VARCHAR(36) | String      | NO       | —       | FK → roles.id. The role being assigned                             |
| granted_by_id | VARCHAR(36) | String?     | YES      | NULL    | FK → users.id. Admin who granted the role                          |
| granted_at    | DATETIME    | DateTime    | NO       | now()   | When the role was granted                                          |
| scope         | VARCHAR(50) | String?     | YES      | NULL    | Scope type: null (global), 'COMMUNITY', 'ORGANIZATION', 'PLATFORM' |
| scope_id      | VARCHAR(36) | String?     | YES      | NULL    | ID of the scoped entity (community or organization)                |
| created_at    | DATETIME    | DateTime    | NO       | now()   | Creation timestamp                                                 |

**Indexes:**

| Index                                                    | Columns                           | Type    | Description                              |
| -------------------------------------------------------- | --------------------------------- | ------- | ---------------------------------------- |
| PRIMARY                                                  | id                                | Primary | UUID primary key                         |
| user_role_assignments_user_id_role_id_scope_scope_id_key | user_id, role_id, scope, scope_id | Unique  | One assignment per user-role-scope combo |
| idx_ura_user_id                                          | user_id                           | Normal  | Fast user role lookup                    |
| idx_ura_role_id                                          | role_id                           | Normal  | Fast role lookup                         |

**Example Data:**

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "granted_by_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "granted_at": "2026-02-10T14:00:00Z",
  "scope": "COMMUNITY",
  "scope_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "created_at": "2026-02-10T14:00:00Z"
}
```

**Business Rules:**

- A user can have the same role in different scopes (e.g., ADMIN in community A and MEMBER in community B)
- `scope` values: null (platform-wide), 'COMMUNITY', 'ORGANIZATION', 'PLATFORM'
- `scope_id` must reference the entity matching the scope type

---

## Table: `role_upgrade_requests`

Users request role upgrades that require admin approval.

| Column            | Type (DB)    | Prisma Type | Nullable | Default    | Description                            |
| ----------------- | ------------ | ----------- | -------- | ---------- | -------------------------------------- |
| id                | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                            |
| user_id           | VARCHAR(36)  | String      | NO       | —          | FK → users.id. User requesting upgrade |
| requested_role_id | VARCHAR(36)  | String      | NO       | —          | FK → roles.id. Role being requested    |
| reason            | TEXT         | String      | NO       | —          | User's justification for the request   |
| status            | VARCHAR(20)  | String      | NO       | "PENDING"  | Request status                         |
| reviewed_by_id    | VARCHAR(36)  | String?     | YES      | NULL       | FK → users.id. Admin who reviewed      |
| reviewed_at       | DATETIME     | DateTime?   | YES      | NULL       | When the request was reviewed          |
| review_note       | VARCHAR(500) | String?     | YES      | NULL       | Admin's review note                    |
| created_at        | DATETIME     | DateTime    | NO       | now()      | Request creation timestamp             |
| updated_at        | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp                  |

**Status Enum Values:**

| Value    | Description                   |
| -------- | ----------------------------- |
| PENDING  | Request awaiting admin review |
| APPROVED | Request approved by admin     |
| REJECTED | Request rejected by admin     |

**Indexes:**

| Index           | Columns | Type    | Description            |
| --------------- | ------- | ------- | ---------------------- |
| PRIMARY         | id      | Primary | UUID primary key       |
| idx_rur_user_id | user_id | Normal  | User's requests lookup |
| idx_rur_status  | status  | Normal  | Filter by status       |

**Example Data:**

```json
{
  "id": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "requested_role_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "reason": "I have been managing the Tirana Devs community for 6 months and need admin access to moderate content",
  "status": "PENDING",
  "reviewed_by_id": null,
  "reviewed_at": null,
  "review_note": null,
  "created_at": "2026-06-15T09:00:00Z",
  "updated_at": "2026-06-15T09:00:00Z"
}
```

**Business Rules:**

- Only one active (PENDING) upgrade request per user per role at a time
- Reviewer must be an admin with sufficient role level
- `reviewed_at` and `reviewed_by_id` are set together when status changes from PENDING

---

## Table: `communities`

Community groups that users can create and join.

| Column            | Type (DB)    | Prisma Type | Nullable | Default    | Description                                  |
| ----------------- | ------------ | ----------- | -------- | ---------- | -------------------------------------------- |
| id                | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                                  |
| name              | VARCHAR(200) | String      | NO       | —          | Community display name                       |
| slug              | VARCHAR(200) | String      | NO       | —          | URL-friendly slug (unique)                   |
| description       | TEXT         | String      | NO       | —          | Full markdown description                    |
| short_description | VARCHAR(300) | String?     | YES      | NULL       | Brief one-line description                   |
| logo              | VARCHAR(500) | String?     | YES      | NULL       | URL to community logo                        |
| banner            | VARCHAR(500) | String?     | YES      | NULL       | URL to community banner image                |
| category          | VARCHAR(100) | String      | NO       | —          | Primary category name                        |
| location          | VARCHAR(200) | String?     | YES      | NULL       | Physical location (city, country)            |
| website           | VARCHAR(500) | String?     | YES      | NULL       | Community website URL                        |
| contact_email     | VARCHAR(255) | String?     | YES      | NULL       | Contact email address                        |
| contact_phone     | VARCHAR(20)  | String?     | YES      | NULL       | Contact phone number                         |
| founded_at        | DATETIME     | DateTime?   | YES      | NULL       | When the community was founded               |
| membership_type   | VARCHAR(20)  | String      | NO       | "OPEN"     | Membership type                              |
| max_members       | INT          | Int?        | YES      | NULL       | Maximum number of members (null = unlimited) |
| is_verified       | BOOLEAN      | Boolean     | NO       | false      | Whether community is verified by platform    |
| status            | VARCHAR(20)  | String      | NO       | "PENDING"  | Community status                             |
| status_reason     | VARCHAR(500) | String?     | YES      | NULL       | Reason for status change                     |
| approved_at       | DATETIME     | DateTime?   | YES      | NULL       | When approved by platform admin              |
| approved_by_id    | VARCHAR(36)  | String?     | YES      | NULL       | FK → users.id. Admin who approved            |
| rejected_at       | DATETIME     | DateTime?   | YES      | NULL       | When rejected by platform admin              |
| rejected_by_id    | VARCHAR(36)  | String?     | YES      | NULL       | FK → users.id. Admin who rejected            |
| suspended_at      | DATETIME     | DateTime?   | YES      | NULL       | When suspended                               |
| suspended_reason  | VARCHAR(500) | String?     | YES      | NULL       | Reason for suspension                        |
| owner_id          | VARCHAR(36)  | String      | NO       | —          | FK → users.id. Community owner               |
| created_at        | DATETIME     | DateTime    | NO       | now()      | Creation timestamp                           |
| updated_at        | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp                        |
| deleted_at        | DATETIME     | DateTime?   | YES      | NULL       | Soft delete timestamp                        |

**Status Enum Values:**

| Value     | Description             |
| --------- | ----------------------- |
| PENDING   | Awaiting admin approval |
| APPROVED  | Approved and active     |
| REJECTED  | Rejected by admin       |
| SUSPENDED | Suspended by admin      |
| ARCHIVED  | Soft archived           |

**Membership Type Values:**

| Value       | Description                   |
| ----------- | ----------------------------- |
| OPEN        | Anyone can join               |
| APPROVAL    | Requires owner/admin approval |
| INVITE_ONLY | Only invited users can join   |

**Indexes:**

| Index                      | Columns    | Type    | Description         |
| -------------------------- | ---------- | ------- | ------------------- |
| PRIMARY                    | id         | Primary | UUID primary key    |
| communities_slug_unique    | slug       | Unique  | URL slug uniqueness |
| idx_communities_status     | status     | Normal  | Status filtering    |
| idx_communities_owner_id   | owner_id   | Normal  | Owner lookup        |
| idx_communities_category   | category   | Normal  | Category filtering  |
| idx_communities_deleted_at | deleted_at | Normal  | Soft delete filter  |

**Example Data:**

```json
{
  "id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "name": "Tirana JavaScript Community",
  "slug": "tirana-javascript",
  "description": "A community for JavaScript developers in Tirana. We meet monthly for talks, workshops, and networking.",
  "short_description": "JavaScript developers in Tirana — talks, workshops, and networking",
  "logo": "https://storage.komunaid.com/communities/tirana-js-logo.png",
  "banner": "https://storage.komunaid.com/communities/tirana-js-banner.jpg",
  "category": "Technology",
  "location": "Tirana, Albania",
  "website": "https://tiranajs.dev",
  "contact_email": "hello@tiranajs.dev",
  "contact_phone": "+355691112233",
  "founded_at": "2025-03-01T00:00:00Z",
  "membership_type": "OPEN",
  "max_members": null,
  "is_verified": true,
  "status": "APPROVED",
  "status_reason": null,
  "approved_at": "2025-03-10T12:00:00Z",
  "approved_by_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "rejected_at": null,
  "rejected_by_id": null,
  "suspended_at": null,
  "suspended_reason": null,
  "owner_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2025-03-01T08:00:00Z",
  "updated_at": "2026-06-15T10:00:00Z",
  "deleted_at": null
}
```

**Business Rules:**

- Slug must be unique across all communities
- Owner is automatically the first member with OWNER role
- Status transitions: PENDING → APPROVED/REJECTED → SUSPENDED/ARCHIVED
- `max_members` null means unlimited membership

---

## Table: `community_members`

Junction table mapping users to communities.

| Column       | Type (DB)   | Prisma Type | Nullable | Default  | Description                  |
| ------------ | ----------- | ----------- | -------- | -------- | ---------------------------- |
| id           | VARCHAR(36) | String      | NO       | uuid()   | Primary key                  |
| community_id | VARCHAR(36) | String      | NO       | —        | FK → communities.id          |
| user_id      | VARCHAR(36) | String      | NO       | —        | FK → users.id                |
| role         | VARCHAR(20) | String      | NO       | "MEMBER" | Member role within community |
| joined_at    | DATETIME    | DateTime    | NO       | now()    | When the user joined         |
| status       | VARCHAR(20) | String      | NO       | "ACTIVE" | Membership status            |

**Role Enum Values:**

| Value     | Description            |
| --------- | ---------------------- |
| OWNER     | Full community control |
| ADMIN     | Administrative access  |
| MODERATOR | Content moderation     |
| MEMBER    | Basic member           |

**Status Enum Values:**

| Value    | Description           |
| -------- | --------------------- |
| ACTIVE   | Currently a member    |
| INACTIVE | Inactive membership   |
| BANNED   | Banned from community |

**Indexes:**

| Index                                      | Columns               | Type    | Description                           |
| ------------------------------------------ | --------------------- | ------- | ------------------------------------- |
| PRIMARY                                    | id                    | Primary | UUID primary key                      |
| community_members_community_id_user_id_key | community_id, user_id | Unique  | One membership per user per community |
| idx_cm_community_id                        | community_id          | Normal  | Community's members lookup            |
| idx_cm_user_id                             | user_id               | Normal  | User's communities lookup             |

**Example Data:**

```json
{
  "id": "a7b8c9d0-e1f2-3456-abcd-567890123456",
  "community_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role": "OWNER",
  "joined_at": "2025-03-01T08:00:00Z",
  "status": "ACTIVE"
}
```

**Business Rules:**

- One membership per user per community (enforced by unique constraint)
- Community owner is stored as OWNER role in this table
- Cascade delete when community or user is deleted

---

## Table: `community_events`

Junction table linking communities to events.

| Column       | Type (DB)   | Prisma Type | Nullable | Default | Description         |
| ------------ | ----------- | ----------- | -------- | ------- | ------------------- |
| id           | VARCHAR(36) | String      | NO       | uuid()  | Primary key         |
| community_id | VARCHAR(36) | String      | NO       | —       | FK → communities.id |
| event_id     | VARCHAR(36) | String      | NO       | —       | FK → events.id      |

**Indexes:**

| Index                                      | Columns                | Type    | Description                       |
| ------------------------------------------ | ---------------------- | ------- | --------------------------------- |
| PRIMARY                                    | id                     | Primary | UUID primary key                  |
| community_events_community_id_event_id_key | community_id, event_id | Unique  | One link per community-event pair |

**Example Data:**

```json
{
  "id": "b8c9d0e1-f2a3-4567-bcde-678901234567",
  "community_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "event_id": "c9d0e1f2-a3b4-5678-cdef-789012345678"
}
```

**Business Rules:**

- An event can belong to multiple communities
- Cascade delete when community or event is deleted

---

## Table: `community_categories`

Junction table linking communities to multiple categories.

| Column       | Type (DB)   | Prisma Type | Nullable | Default | Description             |
| ------------ | ----------- | ----------- | -------- | ------- | ----------------------- |
| id           | VARCHAR(36) | String      | NO       | uuid()  | Primary key             |
| community_id | VARCHAR(36) | String      | NO       | —       | FK → communities.id     |
| category_id  | VARCHAR(36) | String      | NO       | —       | FK → categories.id      |
| created_at   | DATETIME    | DateTime    | NO       | now()   | Link creation timestamp |

**Indexes:**

| Index                                             | Columns                   | Type    | Description                               |
| ------------------------------------------------- | ------------------------- | ------- | ----------------------------------------- |
| PRIMARY                                           | id                        | Primary | UUID primary key                          |
| community_categories_community_id_category_id_key | community_id, category_id | Unique  | One assignment per category per community |

**Example Data:**

```json
{
  "id": "c9d0e1f2-a3b4-5678-cdef-789012345678",
  "community_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "category_id": "d0e1f2a3-b4c5-6789-defa-890123456789",
  "created_at": "2025-03-01T08:00:00Z"
}
```

**Business Rules:**

- A community can have multiple categories
- Cascade delete when community or category is deleted

---

## Table: `community_roles`

Custom roles within a community.

| Column       | Type (DB)    | Prisma Type | Nullable | Default    | Description                                             |
| ------------ | ------------ | ----------- | -------- | ---------- | ------------------------------------------------------- |
| id           | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                                             |
| community_id | VARCHAR(36)  | String      | NO       | —          | FK → communities.id                                     |
| name         | VARCHAR(50)  | String      | NO       | —          | Role name within community                              |
| description  | VARCHAR(255) | String?     | YES      | NULL       | Role description                                        |
| permissions  | TEXT         | String?     | YES      | NULL       | JSON array of permission strings                        |
| is_default   | BOOLEAN      | Boolean     | NO       | false      | Whether this role is assigned by default to new members |
| created_at   | DATETIME     | DateTime    | NO       | now()      | Creation timestamp                                      |
| updated_at   | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp                                   |

**Indexes:**

| Index                                 | Columns            | Type    | Description                     |
| ------------------------------------- | ------------------ | ------- | ------------------------------- |
| PRIMARY                               | id                 | Primary | UUID primary key                |
| community_roles_community_id_name_key | community_id, name | Unique  | One role per name per community |

**Example Data:**

```json
{
  "id": "d0e1f2a3-b4c5-6789-defa-890123456789",
  "community_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "name": "CONTENT_CURATOR",
  "description": "Can create, edit, and pin posts",
  "permissions": "[\"post:create\", \"post:edit\", \"post:pin\", \"post:delete\"]",
  "is_default": false,
  "created_at": "2025-03-01T08:00:00Z",
  "updated_at": "2025-03-01T08:00:00Z"
}
```

**Business Rules:**

- Role names must be unique within a community
- `permissions` stores a JSON array of permission strings (e.g., `["post:create", "post:edit", "member:kick"]`)
- `is_default = true` roles are automatically assigned when a user joins
- Cascade delete when community is deleted

---

## Table: `organizations`

Organization entities on the platform.

| Column            | Type (DB)    | Prisma Type | Nullable | Default    | Description                       |
| ----------------- | ------------ | ----------- | -------- | ---------- | --------------------------------- |
| id                | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                       |
| name              | VARCHAR(200) | String      | NO       | —          | Organization display name         |
| slug              | VARCHAR(200) | String      | NO       | —          | URL-friendly slug (unique)        |
| description       | TEXT         | String      | NO       | —          | Full markdown description         |
| short_description | VARCHAR(300) | String?     | YES      | NULL       | Brief one-line description        |
| logo              | VARCHAR(500) | String?     | YES      | NULL       | URL to organization logo          |
| banner            | VARCHAR(500) | String?     | YES      | NULL       | URL to organization banner image  |
| industry          | VARCHAR(100) | String?     | YES      | NULL       | Industry/sector                   |
| location          | VARCHAR(200) | String?     | YES      | NULL       | Physical location                 |
| website           | VARCHAR(500) | String?     | YES      | NULL       | Organization website URL          |
| contact_email     | VARCHAR(255) | String?     | YES      | NULL       | Contact email                     |
| founded_at        | DATETIME     | DateTime?   | YES      | NULL       | When founded                      |
| size              | VARCHAR(50)  | String?     | YES      | NULL       | Company size                      |
| status            | VARCHAR(20)  | String      | NO       | "PENDING"  | Organization status               |
| status_reason     | VARCHAR(500) | String?     | YES      | NULL       | Reason for status change          |
| approved_at       | DATETIME     | DateTime?   | YES      | NULL       | When approved                     |
| approved_by_id    | VARCHAR(36)  | String?     | YES      | NULL       | FK → users.id. Admin who approved |
| rejected_at       | DATETIME     | DateTime?   | YES      | NULL       | When rejected                     |
| rejected_by_id    | VARCHAR(36)  | String?     | YES      | NULL       | FK → users.id. Admin who rejected |
| suspended_at      | DATETIME     | DateTime?   | YES      | NULL       | When suspended                    |
| suspended_reason  | VARCHAR(500) | String?     | YES      | NULL       | Reason for suspension             |
| owner_id          | VARCHAR(36)  | String      | NO       | —          | FK → users.id. Organization owner |
| created_at        | DATETIME     | DateTime    | NO       | now()      | Creation timestamp                |
| updated_at        | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp             |
| deleted_at        | DATETIME     | DateTime?   | YES      | NULL       | Soft delete timestamp             |

**Status Enum Values:**

| Value     | Description             |
| --------- | ----------------------- |
| PENDING   | Awaiting admin approval |
| APPROVED  | Approved and active     |
| REJECTED  | Rejected by admin       |
| SUSPENDED | Suspended by admin      |
| ARCHIVED  | Soft archived           |

**Indexes:**

| Index                     | Columns    | Type    | Description        |
| ------------------------- | ---------- | ------- | ------------------ |
| PRIMARY                   | id         | Primary | UUID primary key   |
| organizations_slug_unique | slug       | Unique  | Slug uniqueness    |
| idx_org_status            | status     | Normal  | Status filtering   |
| idx_org_owner_id          | owner_id   | Normal  | Owner lookup       |
| idx_org_deleted_at        | deleted_at | Normal  | Soft delete filter |

**Example Data:**

```json
{
  "id": "e1f2a3b4-c5d6-7890-efab-901234567890",
  "name": "Albanian Tech Solutions",
  "slug": "albanian-tech-solutions",
  "description": "A software development company specializing in web and mobile applications for the Balkans region.",
  "short_description": "Web and mobile development for the Balkans",
  "logo": "https://storage.komunaid.com/organizations/ats-logo.png",
  "banner": "https://storage.komunaid.com/organizations/ats-banner.jpg",
  "industry": "Information Technology",
  "location": "Tirana, Albania",
  "website": "https://albtech.dev",
  "contact_email": "info@albtech.dev",
  "founded_at": "2020-06-15T00:00:00Z",
  "size": "11-50",
  "status": "APPROVED",
  "status_reason": null,
  "approved_at": "2025-01-20T10:00:00Z",
  "approved_by_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "rejected_at": null,
  "rejected_by_id": null,
  "suspended_at": null,
  "suspended_reason": null,
  "owner_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2026-05-01T12:00:00Z",
  "deleted_at": null
}
```

**Business Rules:**

- Slug must be unique across all organizations
- Owner is automatically the first member with OWNER role
- Status transitions: PENDING → APPROVED/REJECTED → SUSPENDED/ARCHIVED

---

## Table: `organization_members`

Junction table mapping users to organizations.

| Column          | Type (DB)   | Prisma Type | Nullable | Default  | Description                     |
| --------------- | ----------- | ----------- | -------- | -------- | ------------------------------- |
| id              | VARCHAR(36) | String      | NO       | uuid()   | Primary key                     |
| organization_id | VARCHAR(36) | String      | NO       | —        | FK → organizations.id           |
| user_id         | VARCHAR(36) | String      | NO       | —        | FK → users.id                   |
| role            | VARCHAR(20) | String      | NO       | "MEMBER" | Member role within organization |
| joined_at       | DATETIME    | DateTime    | NO       | now()    | When the user joined            |
| status          | VARCHAR(20) | String      | NO       | "ACTIVE" | Membership status               |

**Role Enum Values:**

| Value  | Description               |
| ------ | ------------------------- |
| OWNER  | Full organization control |
| ADMIN  | Administrative access     |
| MEMBER | Basic member              |

**Indexes:**

| Index                                            | Columns                  | Type    | Description                     |
| ------------------------------------------------ | ------------------------ | ------- | ------------------------------- |
| PRIMARY                                          | id                       | Primary | UUID primary key                |
| organization_members_organization_id_user_id_key | organization_id, user_id | Unique  | One membership per user per org |
| idx_om_organization_id                           | organization_id          | Normal  | Organization's members lookup   |
| idx_om_user_id                                   | user_id                  | Normal  | User's organizations lookup     |

**Example Data:**

```json
{
  "id": "f2a3b4c5-d6e7-8901-fabc-012345678901",
  "organization_id": "e1f2a3b4-c5d6-7890-efab-901234567890",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role": "OWNER",
  "joined_at": "2025-01-15T08:00:00Z",
  "status": "ACTIVE"
}
```

**Business Rules:**

- One membership per user per organization (enforced by unique constraint)
- Cascade delete when organization or user is deleted

---

## Table: `organization_events`

Junction table linking organizations to events.

| Column          | Type (DB)   | Prisma Type | Nullable | Default | Description           |
| --------------- | ----------- | ----------- | -------- | ------- | --------------------- |
| id              | VARCHAR(36) | String      | NO       | uuid()  | Primary key           |
| organization_id | VARCHAR(36) | String      | NO       | —       | FK → organizations.id |
| event_id        | VARCHAR(36) | String      | NO       | —       | FK → events.id        |

**Indexes:**

| Index                                            | Columns                   | Type    | Description                 |
| ------------------------------------------------ | ------------------------- | ------- | --------------------------- |
| PRIMARY                                          | id                        | Primary | UUID primary key            |
| organization_events_organization_id_event_id_key | organization_id, event_id | Unique  | One link per org-event pair |

**Example Data:**

```json
{
  "id": "a3b4c5d6-e7f8-9012-abcd-123456789012",
  "organization_id": "e1f2a3b4-c5d6-7890-efab-901234567890",
  "event_id": "c9d0e1f2-a3b4-5678-cdef-789012345678"
}
```

**Business Rules:**

- An event can belong to multiple organizations
- Cascade delete when organization or event is deleted

---

## Table: `events`

Events that can be associated with communities or organizations.

| Column                | Type (DB)    | Prisma Type | Nullable | Default    | Description                       |
| --------------------- | ------------ | ----------- | -------- | ---------- | --------------------------------- |
| id                    | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                       |
| title                 | VARCHAR(200) | String      | NO       | —          | Event title                       |
| slug                  | VARCHAR(200) | String      | NO       | —          | URL-friendly slug (unique)        |
| description           | LONGTEXT     | String      | NO       | —          | Full markdown description         |
| short_description     | VARCHAR(300) | String?     | YES      | NULL       | Brief description                 |
| banner                | VARCHAR(500) | String?     | YES      | NULL       | Event banner image URL            |
| start_date            | DATETIME     | DateTime    | NO       | —          | Event start date                  |
| end_date              | DATETIME     | DateTime    | NO       | —          | Event end date                    |
| start_time            | VARCHAR(10)  | String?     | YES      | NULL       | Event start time (HH:MM)          |
| end_time              | VARCHAR(10)  | String?     | YES      | NULL       | Event end time (HH:MM)            |
| location              | VARCHAR(300) | String?     | YES      | NULL       | Physical location                 |
| location_url          | VARCHAR(500) | String?     | YES      | NULL       | URL to map/location               |
| is_online             | BOOLEAN      | Boolean     | NO       | false      | Whether event is online           |
| online_url            | VARCHAR(500) | String?     | YES      | NULL       | Online meeting URL                |
| category              | VARCHAR(100) | String      | NO       | —          | Event category                    |
| capacity              | INT          | Int?        | YES      | NULL       | Max attendees (null = unlimited)  |
| registration_deadline | DATETIME     | DateTime?   | YES      | NULL       | Last date to register             |
| status                | VARCHAR(20)  | String      | NO       | "DRAFT"    | Event status                      |
| status_reason         | VARCHAR(500) | String?     | YES      | NULL       | Reason for status change          |
| approved_at           | DATETIME     | DateTime?   | YES      | NULL       | When approved                     |
| approved_by_id        | VARCHAR(36)  | String?     | YES      | NULL       | FK → users.id. Admin who approved |
| created_by_id         | VARCHAR(36)  | String      | NO       | —          | FK → users.id. Event creator      |
| is_featured           | BOOLEAN      | Boolean     | NO       | false      | Whether event is featured         |
| created_at            | DATETIME     | DateTime    | NO       | now()      | Creation timestamp                |
| updated_at            | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp             |
| deleted_at            | DATETIME     | DateTime?   | YES      | NULL       | Soft delete timestamp             |

**Status Enum Values:**

| Value     | Description         |
| --------- | ------------------- |
| DRAFT     | Not yet published   |
| PENDING   | Awaiting approval   |
| APPROVED  | Approved and active |
| REJECTED  | Rejected by admin   |
| CANCELLED | Event cancelled     |
| COMPLETED | Event has ended     |

**Indexes:**

| Index                    | Columns       | Type    | Description        |
| ------------------------ | ------------- | ------- | ------------------ |
| PRIMARY                  | id            | Primary | UUID primary key   |
| events_slug_unique       | slug          | Unique  | Slug uniqueness    |
| idx_events_status        | status        | Normal  | Status filtering   |
| idx_events_created_by_id | created_by_id | Normal  | Creator lookup     |
| idx_events_category      | category      | Normal  | Category filtering |
| idx_events_start_date    | start_date    | Normal  | Date range queries |
| idx_events_deleted_at    | deleted_at    | Normal  | Soft delete filter |

**Example Data:**

```json
{
  "id": "c9d0e1f2-a3b4-5678-cdef-789012345678",
  "title": "JavaScript Workshop: Building REST APIs with NestJS",
  "slug": "js-workshop-nestjs-rest-apis",
  "description": "Hands-on workshop covering NestJS fundamentals, controllers, services, DTOs, and validation. Bring your laptop!",
  "short_description": "Hands-on NestJS workshop covering REST API fundamentals",
  "banner": "https://storage.komunaid.com/events/nestjs-workshop-banner.jpg",
  "start_date": "2026-08-15T09:00:00Z",
  "end_date": "2026-08-15T17:00:00Z",
  "start_time": "09:00",
  "end_time": "17:00",
  "location": "Tirana Tech Hub, Rruga Ibrahim Rugova 23",
  "location_url": "https://maps.google.com/?q=Tirana+Tech+Hub",
  "is_online": false,
  "online_url": null,
  "category": "Workshop",
  "capacity": 30,
  "registration_deadline": "2026-08-10T23:59:59Z",
  "status": "APPROVED",
  "status_reason": null,
  "approved_at": "2026-07-01T10:00:00Z",
  "approved_by_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "created_by_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "is_featured": true,
  "created_at": "2026-06-20T08:00:00Z",
  "updated_at": "2026-07-01T10:00:00Z",
  "deleted_at": null
}
```

**Business Rules:**

- Slug must be unique across all events
- `end_date` must be >= `start_date`
- `registration_deadline` must be before `start_date`
- `capacity` null means unlimited registrations
- `start_time` and `end_time` are stored as strings (VARCHAR(10)) in "HH:MM" format

---

## Table: `event_registrations`

User registrations for events.

| Column        | Type (DB)   | Prisma Type | Nullable | Default      | Description         |
| ------------- | ----------- | ----------- | -------- | ------------ | ------------------- |
| id            | VARCHAR(36) | String      | NO       | uuid()       | Primary key         |
| event_id      | VARCHAR(36) | String      | NO       | —            | FK → events.id      |
| user_id       | VARCHAR(36) | String      | NO       | —            | FK → users.id       |
| status        | VARCHAR(20) | String      | NO       | "REGISTERED" | Registration status |
| registered_at | DATETIME    | DateTime    | NO       | now()        | When registered     |
| cancelled_at  | DATETIME    | DateTime?   | YES      | NULL         | When cancelled      |
| checked_in_at | DATETIME    | DateTime?   | YES      | NULL         | When checked in     |

**Status Enum Values:**

| Value      | Description             |
| ---------- | ----------------------- |
| REGISTERED | Confirmed registration  |
| CANCELLED  | Registration cancelled  |
| WAITLISTED | On waiting list         |
| CHECKED_IN | Attended and checked in |

**Indexes:**

| Index                                    | Columns           | Type    | Description                         |
| ---------------------------------------- | ----------------- | ------- | ----------------------------------- |
| PRIMARY                                  | id                | Primary | UUID primary key                    |
| event_registrations_event_id_user_id_key | event_id, user_id | Unique  | One registration per user per event |
| idx_er_event_id                          | event_id          | Normal  | Event's registrations lookup        |
| idx_er_user_id                           | user_id           | Normal  | User's registrations lookup         |

**Example Data:**

```json
{
  "id": "d0e1f2a3-b4c5-6789-defa-890123456789",
  "event_id": "c9d0e1f2-a3b4-5678-cdef-789012345678",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "REGISTERED",
  "registered_at": "2026-07-02T14:30:00Z",
  "cancelled_at": null,
  "checked_in_at": null
}
```

**Business Rules:**

- One registration per user per event (enforced by unique constraint)
- `cancelled_at` is set when status changes to CANCELLED
- `checked_in_at` is set when status changes to CHECKED_IN
- Cascade delete when event or user is deleted

---

## Table: `categories`

Content categories for communities, events, and organizations. Supports hierarchical nesting via self-referencing `parent_id`.

| Column      | Type (DB)    | Prisma Type | Nullable | Default    | Description                                     |
| ----------- | ------------ | ----------- | -------- | ---------- | ----------------------------------------------- |
| id          | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                                     |
| name        | VARCHAR(100) | String      | NO       | —          | Category display name                           |
| slug        | VARCHAR(100) | String      | NO       | —          | URL-friendly slug (unique)                      |
| description | VARCHAR(500) | String?     | YES      | NULL       | Category description                            |
| type        | VARCHAR(20)  | String      | NO       | —          | Category type: COMMUNITY, EVENT, ORGANIZATION   |
| is_active   | BOOLEAN      | Boolean     | NO       | true       | Whether category is active                      |
| parent_id   | VARCHAR(36)  | String?     | YES      | NULL       | FK → categories.id. Parent category for nesting |
| created_at  | DATETIME     | DateTime    | NO       | now()      | Creation timestamp                              |
| updated_at  | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp                           |

**Type Enum Values:**

| Value        | Description                     |
| ------------ | ------------------------------- |
| COMMUNITY    | For community categorization    |
| EVENT        | For event categorization        |
| ORGANIZATION | For organization categorization |

**Indexes:**

| Index                    | Columns   | Type    | Description              |
| ------------------------ | --------- | ------- | ------------------------ |
| PRIMARY                  | id        | Primary | UUID primary key         |
| categories_slug_unique   | slug      | Unique  | Slug uniqueness          |
| idx_categories_type      | type      | Normal  | Type filtering           |
| idx_categories_is_active | is_active | Normal  | Active categories filter |

**Example Data:**

```json
{
  "id": "d0e1f2a3-b4c5-6789-defa-890123456789",
  "name": "Technology",
  "slug": "technology",
  "description": "Technology and computing related communities and events",
  "type": "COMMUNITY",
  "is_active": true,
  "parent_id": null,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

**Business Rules:**

- Slug must be unique across all categories
- `parent_id` creates a tree structure — null means root category
- Categories can be nested multiple levels deep
- `is_active` controls visibility — inactive categories are hidden from new assignments

---

## Table: `posts`

Posts/articles within communities.

| Column       | Type (DB)    | Prisma Type | Nullable | Default    | Description                  |
| ------------ | ------------ | ----------- | -------- | ---------- | ---------------------------- |
| id           | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                  |
| community_id | VARCHAR(36)  | String      | NO       | —          | FK → communities.id          |
| author_id    | VARCHAR(36)  | String      | NO       | —          | FK → users.id                |
| title        | VARCHAR(200) | String      | NO       | —          | Post title                   |
| slug         | VARCHAR(250) | String      | NO       | —          | URL-friendly slug            |
| content      | LONGTEXT     | String      | NO       | —          | Post content (markdown/HTML) |
| excerpt      | VARCHAR(500) | String?     | YES      | NULL       | Brief excerpt for previews   |
| cover_image  | VARCHAR(500) | String?     | YES      | NULL       | Cover image URL              |
| status       | VARCHAR(20)  | String      | NO       | "DRAFT"    | Post status                  |
| published_at | DATETIME     | DateTime?   | YES      | NULL       | When published               |
| created_at   | DATETIME     | DateTime    | NO       | now()      | Creation timestamp           |
| updated_at   | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp        |
| deleted_at   | DATETIME     | DateTime?   | YES      | NULL       | Soft delete timestamp        |

**Status Enum Values:**

| Value     | Description           |
| --------- | --------------------- |
| DRAFT     | Not yet published     |
| PUBLISHED | Published and visible |
| ARCHIVED  | Archived              |
| FLAGGED   | Flagged for review    |

**Indexes:**

| Index                       | Columns            | Type    | Description                   |
| --------------------------- | ------------------ | ------- | ----------------------------- |
| PRIMARY                     | id                 | Primary | UUID primary key              |
| posts_community_id_slug_key | community_id, slug | Unique  | Slug uniqueness per community |
| idx_posts_community_id      | community_id       | Normal  | Community posts lookup        |
| idx_posts_author_id         | author_id          | Normal  | Author's posts lookup         |
| idx_posts_status            | status             | Normal  | Status filtering              |
| idx_posts_deleted_at        | deleted_at         | Normal  | Soft delete filter            |

**Example Data:**

````json
{
  "id": "e1f2a3b4-c5d6-7890-efab-901234567890",
  "community_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "author_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Getting Started with Prisma ORM in NestJS",
  "slug": "getting-started-prisma-nestjs",
  "content": "# Getting Started with Prisma ORM in NestJS\n\nPrisma is a modern ORM for Node.js and TypeScript. In this guide we'll set up Prisma in a NestJS project...\n\n## Installation\n\n```bash\nnpm install prisma @prisma/client\nnpx prisma init\n```\n\n## Schema Definition\n\n...",
  "excerpt": "A step-by-step guide to integrating Prisma ORM into your NestJS application",
  "cover_image": "https://storage.komunaid.com/posts/prisma-nestjs-cover.jpg",
  "status": "PUBLISHED",
  "published_at": "2026-06-25T12:00:00Z",
  "created_at": "2026-06-20T09:00:00Z",
  "updated_at": "2026-06-25T12:00:00Z",
  "deleted_at": null
}
````

**Business Rules:**

- Slug is unique per community (not globally unique)
- `published_at` is set when status changes to PUBLISHED
- Author must be a member of the community

---

## Table: `reports`

User-submitted reports for content moderation.

| Column         | Type (DB)    | Prisma Type | Nullable | Default    | Description                                  |
| -------------- | ------------ | ----------- | -------- | ---------- | -------------------------------------------- |
| id             | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                                  |
| reporter_id    | VARCHAR(36)  | String      | NO       | —          | FK → users.id. User who submitted the report |
| target_type    | VARCHAR(20)  | String      | NO       | —          | Type of reported entity                      |
| target_id      | VARCHAR(36)  | String      | NO       | —          | ID of reported entity                        |
| reason         | VARCHAR(200) | String      | NO       | —          | Report reason                                |
| description    | TEXT         | String?     | YES      | NULL       | Detailed description of the issue            |
| status         | VARCHAR(20)  | String      | NO       | "PENDING"  | Report status                                |
| resolved_at    | DATETIME     | DateTime?   | YES      | NULL       | When the report was resolved                 |
| resolved_by_id | VARCHAR(36)  | String?     | YES      | NULL       | FK → users.id. Admin who resolved            |
| resolution     | TEXT         | String?     | YES      | NULL       | Resolution notes                             |
| created_at     | DATETIME     | DateTime    | NO       | now()      | Creation timestamp                           |
| updated_at     | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp                        |

**Target Type Values:**

| Value        | Description           |
| ------------ | --------------------- |
| user         | Reported user         |
| community    | Reported community    |
| organization | Reported organization |
| post         | Reported post         |
| event        | Reported event        |

**Status Enum Values:**

| Value        | Description             |
| ------------ | ----------------------- |
| PENDING      | Awaiting review         |
| UNDER_REVIEW | Being reviewed by admin |
| RESOLVED     | Issue resolved          |
| DISMISSED    | Report dismissed        |

**Indexes:**

| Index                   | Columns                | Type      | Description          |
| ----------------------- | ---------------------- | --------- | -------------------- |
| PRIMARY                 | id                     | Primary   | UUID primary key     |
| idx_reports_status      | status                 | Normal    | Status filtering     |
| idx_reports_target      | target_type, target_id | Composite | Target entity lookup |
| idx_reports_reporter_id | reporter_id            | Normal    | Reporter lookup      |

**Example Data:**

```json
{
  "id": "f2a3b4c5-d6e7-8901-fabc-012345678901",
  "reporter_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "target_type": "post",
  "target_id": "e1f2a3b4-c5d6-7890-efab-901234567890",
  "reason": "Spam content",
  "description": "This post contains repetitive promotional links that appear to be spam",
  "status": "PENDING",
  "resolved_at": null,
  "resolved_by_id": null,
  "resolution": null,
  "created_at": "2026-07-03T16:00:00Z",
  "updated_at": "2026-07-03T16:00:00Z"
}
```

**Business Rules:**

- `target_type` + `target_id` form a polymorphic reference
- `resolved_at` and `resolved_by_id` are set when status changes to RESOLVED
- `resolution` contains admin notes about the resolution

---

## Table: `notifications`

User notifications.

| Column     | Type (DB)    | Prisma Type | Nullable | Default | Description                        |
| ---------- | ------------ | ----------- | -------- | ------- | ---------------------------------- |
| id         | VARCHAR(36)  | String      | NO       | uuid()  | Primary key                        |
| user_id    | VARCHAR(36)  | String      | NO       | —       | FK → users.id                      |
| type       | VARCHAR(20)  | String      | NO       | —       | Notification type                  |
| title      | VARCHAR(200) | String      | NO       | —       | Notification title                 |
| message    | TEXT         | String      | NO       | —       | Notification message body          |
| data       | TEXT         | String?     | YES      | NULL    | JSON payload with additional data  |
| is_read    | BOOLEAN      | Boolean     | NO       | false   | Whether notification has been read |
| read_at    | DATETIME     | DateTime?   | YES      | NULL    | When the notification was read     |
| created_at | DATETIME     | DateTime    | NO       | now()   | Creation timestamp                 |

**Type Enum Values:**

| Value                   | Description                             |
| ----------------------- | --------------------------------------- |
| COMMUNITY_INVITE        | Invited to join a community             |
| COMMUNITY_JOIN_REQUEST  | Someone requests to join your community |
| COMMUNITY_MEMBER_JOINED | New member joined your community        |
| ORGANIZATION_INVITE     | Invited to join an organization         |
| EVENT_INVITATION        | Invited to an event                     |
| EVENT_REGISTRATION      | Event registration confirmed            |
| EVENT_REMINDER          | Upcoming event reminder                 |
| POST_PUBLISHED          | New post in your community              |
| ROLE_UPGRADE_APPROVED   | Role upgrade request approved           |
| ROLE_UPGRADE_REJECTED   | Role upgrade request rejected           |
| REPORT_RESOLVED         | Your report has been resolved           |
| SYSTEM                  | General system notification             |

**Indexes:**

| Index                        | Columns    | Type    | Description                 |
| ---------------------------- | ---------- | ------- | --------------------------- |
| PRIMARY                      | id         | Primary | UUID primary key            |
| idx_notifications_user_id    | user_id    | Normal  | User's notifications lookup |
| idx_notifications_is_read    | is_read    | Normal  | Read/unread filtering       |
| idx_notifications_created_at | created_at | Normal  | Date sorting                |

**Example Data:**

```json
{
  "id": "a3b4c5d6-e7f8-9012-abcd-123456789012",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "COMMUNITY_INVITE",
  "title": "You've been invited to join Tirana JavaScript Community",
  "message": "John Doe has invited you to join Tirana JavaScript Community.",
  "data": "{\"communityId\": \"e5f6a7b8-c9d0-1234-efab-345678901234\", \"communityName\": \"Tirana JavaScript Community\", \"inviterName\": \"John Doe\"}",
  "is_read": false,
  "read_at": null,
  "created_at": "2026-07-05T09:00:00Z"
}
```

**Business Rules:**

- `data` stores JSON with notification-specific payload
- `read_at` is set when `is_read` changes to true
- Cascade delete when user is deleted

---

## Table: `audit_logs`

System audit trail for tracking all significant actions.

| Column      | Type (DB)    | Prisma Type | Nullable | Default | Description                                               |
| ----------- | ------------ | ----------- | -------- | ------- | --------------------------------------------------------- |
| id          | VARCHAR(36)  | String      | NO       | uuid()  | Primary key                                               |
| user_id     | VARCHAR(36)  | String      | NO       | —       | FK → users.id. User who performed the action              |
| action      | VARCHAR(100) | String      | NO       | —       | Action performed (e.g., 'user.login', 'community.create') |
| entity_type | VARCHAR(50)  | String      | NO       | —       | Type of entity affected                                   |
| entity_id   | VARCHAR(36)  | String      | NO       | —       | ID of entity affected                                     |
| old_values  | TEXT         | String?     | YES      | NULL    | JSON: previous values before change                       |
| new_values  | TEXT         | String?     | YES      | NULL    | JSON: new values after change                             |
| metadata    | TEXT         | String?     | YES      | NULL    | JSON: additional metadata                                 |
| ip_address  | VARCHAR(45)  | String?     | YES      | NULL    | Client IP address (supports IPv6)                         |
| user_agent  | VARCHAR(500) | String?     | YES      | NULL    | Client user agent string                                  |
| created_at  | DATETIME     | DateTime    | NO       | now()   | When the action occurred                                  |

**Common Action Values:**

| Action              | Description                 |
| ------------------- | --------------------------- |
| user.register       | New user registered         |
| user.login          | User logged in              |
| user.logout         | User logged out             |
| user.update         | User profile updated        |
| user.suspend        | User suspended              |
| user.unsuspend      | User unsuspended            |
| user.delete         | User soft deleted           |
| role.assign         | Role assigned to user       |
| role.revoke         | Role revoked from user      |
| community.create    | Community created           |
| community.update    | Community updated           |
| community.delete    | Community deleted           |
| community.approve   | Community approved          |
| community.reject    | Community rejected          |
| community.suspend   | Community suspended         |
| community.join      | User joined community       |
| community.leave     | User left community         |
| organization.create | Organization created        |
| organization.update | Organization updated        |
| organization.delete | Organization deleted        |
| event.create        | Event created               |
| event.update        | Event updated               |
| event.delete        | Event deleted               |
| event.register      | User registered for event   |
| event.cancel        | User cancelled registration |
| post.create         | Post created                |
| post.update         | Post updated                |
| post.delete         | Post deleted                |
| post.publish        | Post published              |
| report.submit       | Report submitted            |
| report.resolve      | Report resolved             |
| setting.update      | Setting updated             |

**Indexes:**

| Index                | Columns                | Type      | Description           |
| -------------------- | ---------------------- | --------- | --------------------- |
| PRIMARY              | id                     | Primary   | UUID primary key      |
| idx_audit_user_id    | user_id                | Normal    | User's actions lookup |
| idx_audit_action     | action                 | Normal    | Action filtering      |
| idx_audit_entity     | entity_type, entity_id | Composite | Entity audit trail    |
| idx_audit_created_at | created_at             | Normal    | Date range queries    |

**Example Data:**

```json
{
  "id": "b4c5d6e7-f8a9-0123-bcde-234567890123",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "action": "community.update",
  "entity_type": "community",
  "entity_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "old_values": "{\"name\": \"Tirana JS Community\", \"description\": \"Old description\"}",
  "new_values": "{\"name\": \"Tirana JavaScript Community\", \"description\": \"A community for JavaScript developers in Tirana.\"}",
  "metadata": "{\"source\": \"community_settings_page\"}",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "created_at": "2026-07-01T10:00:00Z"
}
```

**Business Rules:**

- `entity_type` + `entity_id` form a polymorphic reference
- `old_values` and `new_values` store JSON snapshots of changes
- `ip_address` supports IPv6 (up to 45 chars)
- Audit logs are append-only — never updated or deleted

---

## Table: `media_assets`

Uploaded media files.

| Column            | Type (DB)     | Prisma Type | Nullable | Default | Description                 |
| ----------------- | ------------- | ----------- | -------- | ------- | --------------------------- |
| id                | VARCHAR(36)   | String      | NO       | uuid()  | Primary key                 |
| user_id           | VARCHAR(36)   | String      | NO       | —       | FK → users.id. Uploader     |
| filename          | VARCHAR(255)  | String      | NO       | —       | Stored filename on disk/S3  |
| original_filename | VARCHAR(255)  | String      | NO       | —       | Original uploaded filename  |
| mime_type         | VARCHAR(100)  | String      | NO       | —       | MIME type (image/png, etc.) |
| size              | INT           | Int         | NO       | —       | File size in bytes          |
| url               | VARCHAR(1000) | String      | NO       | —       | Public URL to the file      |
| thumbnail_url     | VARCHAR(1000) | String?     | YES      | NULL    | Thumbnail URL (for images)  |
| alt_text          | VARCHAR(255)  | String?     | YES      | NULL    | Accessibility alt text      |
| entity_type       | VARCHAR(50)   | String?     | YES      | NULL    | Associated entity type      |
| entity_id         | VARCHAR(36)   | String?     | YES      | NULL    | Associated entity ID        |
| created_at        | DATETIME      | DateTime    | NO       | now()   | Upload timestamp            |

**Entity Type Values:**

| Value               | Description         |
| ------------------- | ------------------- |
| user_avatar         | User profile avatar |
| community_logo      | Community logo      |
| community_banner    | Community banner    |
| organization_logo   | Organization logo   |
| organization_banner | Organization banner |
| event_banner        | Event banner        |
| post_cover          | Post cover image    |
| general             | General upload      |

**Indexes:**

| Index          | Columns                | Type      | Description               |
| -------------- | ---------------------- | --------- | ------------------------- |
| PRIMARY        | id                     | Primary   | UUID primary key          |
| idx_ma_user_id | user_id                | Normal    | User's uploads lookup     |
| idx_ma_entity  | entity_type, entity_id | Composite | Polymorphic entity lookup |

**Example Data:**

```json
{
  "id": "c5d6e7f8-a9b0-1234-cdef-345678901234",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filename": "a1b2c3d4/avatar-20260701.jpg",
  "original_filename": "profile_photo.jpg",
  "mime_type": "image/jpeg",
  "size": 245760,
  "url": "https://storage.komunaid.com/media/a1b2c3d4/avatar-20260701.jpg",
  "thumbnail_url": "https://storage.komunaid.com/media/a1b2c3d4/avatar-20260701_thumb.jpg",
  "alt_text": "Profile photo of John Doe",
  "entity_type": "user_avatar",
  "entity_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-07-01T10:15:00Z"
}
```

**Business Rules:**

- `entity_type` + `entity_id` form a polymorphic reference to the associated entity
- `size` is stored as INT (max ~2GB file size)
- `url` can be up to 1000 chars for long S3/cloud URLs
- Cascade delete when user is deleted

---

## Table: `contact_messages`

Messages submitted via contact form. No user association — anyone can submit.

| Column     | Type (DB)    | Prisma Type | Nullable | Default  | Description          |
| ---------- | ------------ | ----------- | -------- | -------- | -------------------- |
| id         | VARCHAR(36)  | String      | NO       | uuid()   | Primary key          |
| name       | VARCHAR(100) | String      | NO       | —        | Sender's name        |
| email      | VARCHAR(255) | String      | NO       | —        | Sender's email       |
| subject    | VARCHAR(200) | String      | NO       | —        | Message subject      |
| message    | TEXT         | String      | NO       | —        | Message body         |
| status     | VARCHAR(20)  | String      | NO       | "UNREAD" | Message status       |
| created_at | DATETIME     | DateTime    | NO       | now()    | Submission timestamp |

**Status Enum Values:**

| Value   | Description           |
| ------- | --------------------- |
| UNREAD  | Not yet read by admin |
| READ    | Read by admin         |
| REPLIED | Admin has replied     |

**Indexes:**

| Index         | Columns | Type    | Description      |
| ------------- | ------- | ------- | ---------------- |
| PRIMARY       | id      | Primary | UUID primary key |
| idx_cm_status | status  | Normal  | Status filtering |

**Example Data:**

```json
{
  "id": "d6e7f8a9-b0c1-2345-defa-456789012345",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "subject": "Partnership inquiry",
  "message": "Hi, I'd like to discuss a potential partnership between our organizations. Could we schedule a call?",
  "status": "UNREAD",
  "created_at": "2026-07-06T14:30:00Z"
}
```

**Business Rules:**

- No `user_id` column — contact messages are anonymous/standalone
- Status transitions: UNREAD → READ → REPLIED

---

## Table: `settings`

Platform configuration settings (key-value store).

| Column        | Type (DB)    | Prisma Type | Nullable | Default    | Description                        |
| ------------- | ------------ | ----------- | -------- | ---------- | ---------------------------------- |
| id            | VARCHAR(36)  | String      | NO       | uuid()     | Primary key                        |
| key           | VARCHAR(100) | String      | NO       | —          | Setting key (unique)               |
| value         | TEXT         | String      | NO       | —          | Setting value                      |
| description   | VARCHAR(500) | String?     | YES      | NULL       | Setting description                |
| updated_by_id | VARCHAR(36)  | String?     | YES      | NULL       | FK → users.id. Last user to update |
| created_at    | DATETIME     | DateTime    | NO       | now()      | Creation timestamp                 |
| updated_at    | DATETIME     | DateTime    | NO       | @updatedAt | Last update timestamp              |

**Common Key Values:**

| Key                           | Description                           |
| ----------------------------- | ------------------------------------- |
| platform.name                 | Platform name                         |
| platform.description          | Platform description                  |
| platform.maintenance_mode     | Whether maintenance mode is active    |
| platform.registration_open    | Whether new registrations are allowed |
| auth.jwt_expiration           | JWT token expiration time             |
| auth.refresh_token_expiration | Refresh token expiration time         |
| community.auto_approve        | Auto-approve new communities          |
| organization.auto_approve     | Auto-approve new organizations        |
| email.smtp_host               | SMTP server host                      |
| email.smtp_port               | SMTP server port                      |
| upload.max_file_size          | Maximum upload file size in bytes     |

**Indexes:**

| Index               | Columns | Type    | Description            |
| ------------------- | ------- | ------- | ---------------------- |
| PRIMARY             | id      | Primary | UUID primary key       |
| settings_key_unique | key     | Unique  | Setting key uniqueness |
| idx_settings_key    | key     | Normal  | Key lookup             |

**Example Data:**

```json
{
  "id": "e7f8a9b0-c1d2-3456-efab-567890123456",
  "key": "platform.name",
  "value": "KomunaID",
  "description": "Display name of the platform",
  "updated_by_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-06-01T08:00:00Z"
}
```

**Business Rules:**

- Keys must be unique across the platform
- `value` is always stored as TEXT — application code handles type conversion
- No `type` column — the application infers serialization from key naming conventions
- `updated_by_id` tracks who last modified the setting

---

## Appendix: Foreign Key Relationships

```
users.id ← user_role_assignments.user_id
users.id ← user_role_assignments.granted_by_id
users.id ← role_upgrade_requests.user_id
users.id ← role_upgrade_requests.reviewed_by_id
users.id ← communities.owner_id
users.id ← communities.approved_by_id
users.id ← communities.rejected_by_id
users.id ← community_members.user_id
users.id ← organization_members.user_id
users.id ← organizations.owner_id
users.id ← organizations.approved_by_id
users.id ← organizations.rejected_by_id
users.id ← events.created_by_id
users.id ← events.approved_by_id
users.id ← event_registrations.user_id
users.id ← posts.author_id
users.id ← notifications.user_id
users.id ← reports.reporter_id
users.id ← reports.resolved_by_id
users.id ← media_assets.user_id
users.id ← audit_logs.user_id
users.id ← settings.updated_by_id

roles.id ← user_role_assignments.role_id
roles.id ← role_upgrade_requests.requested_role_id

communities.id ← community_members.community_id
communities.id ← community_categories.community_id
communities.id ← community_roles.community_id
communities.id ← community_events.community_id
communities.id ← posts.community_id

organizations.id ← organization_members.organization_id
organizations.id ← organization_events.organization_id

categories.id ← community_categories.category_id
categories.id ← categories.parent_id (self-referencing)

events.id ← event_registrations.event_id
events.id ← community_events.event_id
events.id ← organization_events.event_id
```
