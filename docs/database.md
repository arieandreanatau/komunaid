# Database

## Overview

- **Engine**: MySQL 8.0
- **ORM**: Prisma (`@prisma/client` v6.10.x)
- **Schema**: `packages/database/prisma/schema.prisma`
- **Singleton**: `packages/database/src/index.ts` exports a global PrismaClient instance

## Models

### User & Auth

| Model                | Table                   | Description                                        |
| -------------------- | ----------------------- | -------------------------------------------------- |
| `User`               | `users`                 | Core user — email, password, profile, status flags |
| `Role`               | `roles`                 | Named roles (SUPER_ADMIN, MEMBER, etc.)            |
| `UserRoleAssignment` | `user_role_assignments` | Many-to-many user↔role with optional scope         |

### Community

| Model             | Table               | Description                                       |
| ----------------- | ------------------- | ------------------------------------------------- |
| `Community`       | `communities`       | Community entity — owner, status, membership type |
| `CommunityMember` | `community_members` | Membership records (role: OWNER/ADMIN/MEMBER)     |
| `CommunityEvent`  | `community_events`  | Many-to-many community↔event                      |

### Organization

| Model                | Table                  | Description                         |
| -------------------- | ---------------------- | ----------------------------------- |
| `Organization`       | `organizations`        | Organization entity — owner, status |
| `OrganizationMember` | `organization_members` | Membership records                  |
| `OrganizationEvent`  | `organization_events`  | Many-to-many organization↔event     |

### Event

| Model               | Table                 | Description                                      |
| ------------------- | --------------------- | ------------------------------------------------ |
| `Event`             | `events`              | Event entity — dates, location, capacity, status |
| `EventRegistration` | `event_registrations` | User event registrations                         |

### User & Auth (Extended)

| Model                | Table                   | Description                   |
| -------------------- | ----------------------- | ----------------------------- |
| `RoleUpgradeRequest` | `role_upgrade_requests` | Role upgrade request workflow |

### Community (Extended)

| Model               | Table                  | Description                        |
| ------------------- | ---------------------- | ---------------------------------- |
| `CommunityCategory` | `community_categories` | Many-to-many community to category |
| `CommunityRole`     | `community_roles`      | Custom community-scoped roles      |

### Content & Moderation

| Model            | Table              | Description                                            |
| ---------------- | ------------------ | ------------------------------------------------------ |
| `Category`       | `categories`       | Hierarchical categories (COMMUNITY/EVENT/ORGANIZATION) |
| `Post`           | `posts`            | Community posts (DRAFT/PUBLISHED/ARCHIVED/FLAGGED)     |
| `Report`         | `reports`          | Content reports (USER/COMMUNITY/EVENT/etc.)            |
| `Notification`   | `notifications`    | User notifications                                     |
| `AuditLog`       | `audit_logs`       | Admin action audit trail                               |
| `MediaAsset`     | `media_assets`     | File upload tracking                                   |
| `ContactMessage` | `contact_messages` | Contact form submissions                               |
| `Setting`        | `settings`         | Platform key-value settings                            |

## Key Relations

```
User ──1:N──▶ UserRoleAssignment ──N:1──▶ Role
User ──1:N──▶ CommunityMember ──N:1──▶ Community
User ──1:N──▶ OrganizationMember ──N:1──▶ Organization
User ──1:N──▶ EventRegistration ──N:1──▶ Event
User ──1:N──▶ Post
User ──1:N──▶ AuditLog

Community ──1:N──▶ Post
Community ──M:N──▶ Event (via CommunityEvent)
Organization ──M:N──▶ Event (via OrganizationEvent)

Category ──self──▶ Category (parent/children tree)
```

## Status Enums

| Entity       | Statuses                                                      |
| ------------ | ------------------------------------------------------------- |
| Community    | PENDING → APPROVED / REJECTED / SUSPENDED / ARCHIVED          |
| Organization | PENDING → APPROVED / REJECTED / SUSPENDED / ARCHIVED          |
| Event        | DRAFT → PENDING → APPROVED / REJECTED / CANCELLED / COMPLETED |
| Post         | DRAFT → PUBLISHED / ARCHIVED / FLAGGED                        |
| Report       | PENDING → UNDER_REVIEW → RESOLVED / DISMISSED                 |

## Soft Deletes

`User`, `Community`, `Organization`, `Event`, and `Post` use `deletedAt` (nullable DateTime). Queries must filter `deletedAt: null` to exclude soft-deleted records.

## Migration Workflow

```bash
# After editing schema.prisma:
pnpm --filter @komunaid/database db:generate   # Regenerate Prisma client

# Create a named migration
pnpm db:migrate
# → prompts for migration name → creates prisma/migrations/<timestamp>_<name>/

# Push schema directly (no migration file — prototyping only)
pnpm --filter @komunaid/database db:push

# Reset database (drop + migrate + seed)
pnpm db:reset

# Open Prisma Studio
pnpm db:studio
```

## Seed Data

`packages/database/prisma/seed.ts` creates:

- **8 roles**: SUPER_ADMIN, PLATFORM_ADMIN, ORG_OWNER, ORG_ADMIN, COMMUNITY_OWNER, COMMUNITY_ADMIN, EVENT_MANAGER, MEMBER
- **6 users**: 2 admins + 4 test users
- **18 categories**: 8 community, 6 event, 4 organization
- **6 communities**: 5 approved + 1 pending
- **3 organizations**: 2 approved + 1 pending
- **8 events**: 7 approved + 1 pending
- **3 posts**, **4 notifications**

Run with `pnpm db:seed` or during `pnpm db:reset`.
