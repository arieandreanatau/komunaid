# KomunaID RBAC Design

## 1. RBAC Overview

KomunaID implements **Role-Based Access Control (RBAC)** to manage permissions across the platform. Every authenticated user holds one or more roles, each scoped to a specific context (platform, organization, or community). RBAC ensures:

- **Principle of Least Privilege** — users receive only the permissions required for their role
- **Separation of Duties** — administrative actions require elevated roles
- **Scoped Access** — roles can be limited to a single community or organization
- **Auditability** — all role assignments are tracked and auditable

Roles are stored in the `roles` table and assigned through `user_role_assignments`. Each assignment carries a `scope` (`PLATFORM`, `ORGANIZATION`, or `COMMUNITY`) and an optional `scopeId` to restrict where the role applies.

---

## 2. Role Hierarchy

| Role              | Level | Description                                        |
| ----------------- | ----- | -------------------------------------------------- |
| `SUPER_ADMIN`     | 100   | Full platform access, can override any restriction |
| `PLATFORM_ADMIN`  | 80    | Platform administration, user management           |
| `ORG_OWNER`       | 60    | Organization owner, full org control               |
| `ORG_ADMIN`       | 50    | Organization admin, manages members and events     |
| `COMMUNITY_OWNER` | 40    | Community owner, full community control            |
| `COMMUNITY_ADMIN` | 30    | Community admin, manages members and posts         |
| `EVENT_MANAGER`   | 20    | Event manager, scoped to specific events           |
| `MEMBER`          | 10    | Regular authenticated user                         |

**Hierarchy rule:** A higher-level role implicitly includes all permissions of lower-level roles within the same scope.

---

## 3. Role Definitions

### SUPER_ADMIN (Level 100)

**Who gets it:** Platform founders, core maintainers.

**What they can do:**

- Full access to every endpoint across the entire platform
- Manage all users, organizations, communities, and events
- Suspend or delete any entity
- Access audit logs and platform settings
- Override any permission restriction
- Manage other administrators

This role is assigned manually via database seed or by another SUPER_ADMIN. It should never be auto-assigned.

---

### PLATFORM_ADMIN (Level 80)

**Who gets it:** Trusted platform administrators.

**What they can do:**

- Manage users (view, suspend, assign roles)
- Review and moderate communities and organizations
- Access dashboard statistics
- Manage platform settings
- View audit logs
- Resolve reports

Cannot promote users to SUPER_ADMIN. Cannot modify SUPER_ADMIN accounts.

---

### ORG_OWNER (Level 60)

**Who gets it:** Automatically assigned to the user who creates an organization.

**What they can do:**

- Full control over the organization
- Manage organization members and admins
- Create and manage organization events
- Update organization profile, settings, and branding
- Suspend or remove members
- Transfer ownership

Scoped to a single organization via `scopeId`.

---

### ORG_ADMIN (Level 50)

**Who gets it:** Users promoted by ORG_OWNER within an organization.

**What they can do:**

- Manage organization members (approve, reject, ban)
- Create and manage organization events
- Update organization content
- View organization analytics

Cannot delete the organization or transfer ownership.

---

### COMMUNITY_OWNER (Level 40)

**Who gets it:** Automatically assigned to the user who creates a community.

**What they can do:**

- Full control over the community
- Manage community members and admins
- Create and moderate posts and events
- Update community profile, rules, and settings
- Ban members
- Transfer ownership

Scoped to a single community via `scopeId`.

---

### COMMUNITY_ADMIN (Level 30)

**Who gets it:** Users promoted by COMMUNITY_OWNER within a community.

**What they can do:**

- Manage community members (approve, reject)
- Moderate posts and content
- Create community events
- Pin or feature posts

Cannot delete the community or change community settings.

---

### EVENT_MANAGER (Level 20)

**Who gets it:** Users assigned by COMMUNITY_OWNER, COMMUNITY_ADMIN, ORG_OWNER, ORG_ADMIN, or PLATFORM_ADMIN.

**What they can do:**

- Manage specific events (update details, manage registrations)
- Check in attendees
- Post event updates

Scoped to specific events via `scopeId` or to all events within a community/org.

---

### MEMBER (Level 10)

**Who gets it:** Automatically assigned on registration.

**What they can do:**

- Browse public content
- Join communities and organizations
- Register for events
- Create posts (subject to community rules)
- Update own profile
- Submit reports
- Manage own notifications

This is the default role for all authenticated users.

---

## 4. Scoped Roles

### Scope Types

The `user_role_assignments.scope` column determines where the role applies:

| Scope          | Value          | Description                                 |
| -------------- | -------------- | ------------------------------------------- |
| `PLATFORM`     | `PLATFORM`     | Role applies platform-wide                  |
| `ORGANIZATION` | `ORGANIZATION` | Role applies within a specific organization |
| `COMMUNITY`    | `COMMUNITY`    | Role applies within a specific community    |

### How Scope Works

```sql
-- Example: User 5 is COMMUNITY_ADMIN for community 12
INSERT INTO user_role_assignments (userId, roleId, scope, scopeId)
VALUES (5, (SELECT id FROM roles WHERE name = 'COMMUNITY_ADMIN'), 'COMMUNITY', 12);
```

When `scopeId` is set, the permission check validates:

1. User has the required role
2. Role's scope matches the resource type (community vs organization)
3. Role's `scopeId` matches the resource being accessed

### Scope Resolution Rules

1. **PLATFORM-scoped roles** grant access to all resources of that type
2. **ORGANIZATION-scoped roles** grant access only within the specified organization
3. **COMMUNITY-scoped roles** grant access only within the specified community
4. **SUPER_ADMIN** bypasses all scope restrictions
5. Multiple assignments accumulate — if user has ORG_OWNER for org A and COMMUNITY_OWNER for community B (in org A), they have full access to both

### Unique Constraint

The unique constraint `(userId, roleId, scope, scopeId)` prevents duplicate assignments. To upgrade a role, the old assignment must be replaced, not a new one added alongside.

---

## 5. Role Assignment

### Auto-Assignment

| Trigger                   | Role Assigned     | Scope          |
| ------------------------- | ----------------- | -------------- |
| User registers            | `MEMBER`          | `PLATFORM`     |
| User creates community    | `COMMUNITY_OWNER` | `COMMUNITY`    |
| User creates organization | `ORG_OWNER`       | `ORGANIZATION` |

### Manual Assignment

Administrators assign roles through the admin panel or API:

```
POST /admin/roles/assign
{
  "userId": 5,
  "roleId": "COMMUNITY_ADMIN",
  "scope": "COMMUNITY",
  "scopeId": 12
}
```

### Role Hierarchy Enforcement

When assigning roles, the following rules apply:

1. Only users with a role of equal or higher level can assign roles
2. `SUPER_ADMIN` cannot be assigned via API — requires database access
3. Platform admins cannot assign `SUPER_ADMIN`
4. Organization owners can assign up to `ORG_ADMIN` within their org
5. Community owners can assign up to `COMMUNITY_ADMIN` within their community

---

## 6. Role Upgrade Requests

### Request Flow

```
User → Request Upgrade → Admin Reviews → Approve/Reject → Notification
```

**Step 1: User submits request**

```
POST /role-requests
{
  "targetRole": "COMMUNITY_ADMIN",
  "scope": "COMMUNITY",
  "scopeId": 12,
  "reason": "I've been active in this community for 6 months..."
}
```

**Step 2: Admin reviews request**

- Admin views pending requests at `/admin/role-upgrade-requests`
- Each request shows: requester info, target role, scope, reason, timestamp

**Step 3: Decision**

```
PATCH /role-requests/{id}
{
  "decision": "APPROVED",  // or "REJECTED"
  "reviewerNote": "Welcome to the team!"
}
```

**Step 4: Notification**

- User receives notification of approval/rejection
- If approved, role assignment is created automatically

### Request Statuses

| Status     | Description                       |
| ---------- | --------------------------------- |
| `PENDING`  | Awaiting admin review             |
| `APPROVED` | Request approved, role assigned   |
| `REJECTED` | Request denied, role not assigned |

### Validation Rules

- User must not already hold the requested role
- Target role must be lower than the reviewer's role level
- Scope and scopeId must be valid
- User cannot request SUPER_ADMIN via this flow

---

## 7. Guard Architecture

### Authentication & Authorization Chain

```
Request → AuthGuard → RolesGuard → ScopedPermissionGuard → Controller
```

### AuthGuard

Validates JWT access token. Attaches user object to request context.

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Extract JWT from Authorization header
    // Verify token signature and expiry
    // Attach decoded user to request.user
  }
}
```

### RolesGuard

Checks if the user holds at least one of the required roles.

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
```

### ScopedPermissionGuard

Validates that the user's role applies to the specific resource being accessed.

```typescript
@Injectable()
export class ScopedPermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredScope = this.reflector.get<ScopeConfig>('scope', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    // Check user has role with correct scope and scopeId
  }
}
```

### Guard Configuration

```typescript
@UseGuards(AuthGuard, RolesGuard, ScopedPermissionGuard)
@Roles('COMMUNITY_OWNER', 'COMMUNITY_ADMIN')
@Scope({ type: 'COMMUNITY', idParam: 'communityId' })
@Put(':communityId')
async updateCommunity(@Param('communityId') id: string, @Body() dto: UpdateCommunityDto) {
  // Only COMMUNITY_OWNER or COMMUNITY_ADMIN for this community
}
```

---

## 8. Usage Examples

### Basic Role Restriction

```typescript
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
  getDashboard() {
    // Only SUPER_ADMIN and PLATFORM_ADMIN can access
  }

  @Get('audit-logs')
  @Roles('SUPER_ADMIN')
  getAuditLogs() {
    // Only SUPER_ADMIN can access
  }
}
```

### Scoped Resource Access

```typescript
import { Scope } from '../decorators/scope.decorator';
import { ScopedPermissionGuard } from '../guards/scoped-permission.guard';

@Controller('communities')
@UseGuards(AuthGuard, RolesGuard, ScopedPermissionGuard)
export class CommunityController {
  @Put(':communityId')
  @Roles('COMMUNITY_OWNER', 'COMMUNITY_ADMIN')
  @Scope({ type: 'COMMUNITY', idParam: 'communityId' })
  async updateCommunity(@Param('communityId') id: string, @Body() dto: UpdateCommunityDto) {
    // ScopedPermissionGuard validates user's role applies to this community
  }

  @Delete(':communityId')
  @Roles('COMMUNITY_OWNER')
  @Scope({ type: 'COMMUNITY', idParam: 'communityId' })
  async deleteCommunity(@Param('communityId') id: string) {
    // Only the community owner can delete
  }
}
```

### Organization-Scoped Access

```typescript
@Controller('organizations/:orgId/members')
@UseGuards(AuthGuard, RolesGuard, ScopedPermissionGuard)
export class OrgMemberController {
  @Get()
  @Roles('ORG_OWNER', 'ORG_ADMIN')
  @Scope({ type: 'ORGANIZATION', idParam: 'orgId' })
  async getMembers(@Param('orgId') orgId: string) {
    // Only org owners and admins can view member list
  }

  @Post(':userId/promote')
  @Roles('ORG_OWNER')
  @Scope({ type: 'ORGANIZATION', idParam: 'orgId' })
  async promoteMember(@Param('orgId') orgId: string, @Param('userId') userId: string) {
    // Only org owner can promote members
  }
}
```

### Event-Scoped Access

```typescript
@Controller('events')
@UseGuards(AuthGuard, RolesGuard, ScopedPermissionGuard)
export class EventController {
  @Put(':eventId')
  @Roles('EVENT_MANAGER', 'COMMUNITY_OWNER', 'COMMUNITY_ADMIN')
  @Scope({ type: 'EVENT', idParam: 'eventId' })
  async updateEvent(@Param('eventId') id: string, @Body() dto: UpdateEventDto) {
    // EVENT_MANAGER only if assigned to this event
  }

  @Post(':eventId/check-in')
  @Roles('EVENT_MANAGER')
  @Scope({ type: 'EVENT', idParam: 'eventId' })
  async checkInAttendee(@Param('eventId') id: string, @Body() dto: CheckInDto) {
    // Only event managers can check in attendees
  }
}
```

### Public Endpoint (No Auth)

```typescript
@Controller('communities')
export class PublicCommunityController {
  @Get()
  async listCommunities() {
    // No @UseGuards — accessible to everyone
  }

  @Get(':communityId')
  async getCommunity(@Param('communityId') id: string) {
    // Public community profile
  }
}
```

### Mixed Auth Levels

```typescript
@Controller('posts')
export class PostController {
  @Get(':postId')
  async getPost(@Param('postId') id: string) {
    // Public — no auth required
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() dto: CreatePostDto) {
    // Any authenticated user can create a post
  }

  @Delete(':postId')
  @UseGuards(AuthGuard, RolesGuard, ScopedPermissionGuard)
  @Roles('COMMUNITY_ADMIN', 'COMMUNITY_OWNER')
  @Scope({ type: 'COMMUNITY', idParam: 'communityId' })
  async deletePost(@Param('postId') id: string) {
    // Only community admins/owners can delete any post
  }
}
```

### Custom Permission Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Usage
@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard)
export class AdminController {
  @Get('settings')
  @RequirePermission('manage-platform-settings')
  async getSettings() {
    // PermissionGuard maps role+scope to fine-grained permissions
  }
}
```

---

## Appendix: Role-Permission Quick Reference

| Role              | Can Assign Up To      | Scope Limit        |
| ----------------- | --------------------- | ------------------ |
| `SUPER_ADMIN`     | Any role              | Platform-wide      |
| `PLATFORM_ADMIN`  | `ORG_OWNER` and below | Platform-wide      |
| `ORG_OWNER`       | `ORG_ADMIN`           | Their organization |
| `ORG_ADMIN`       | `EVENT_MANAGER`       | Their organization |
| `COMMUNITY_OWNER` | `COMMUNITY_ADMIN`     | Their community    |
| `COMMUNITY_ADMIN` | `EVENT_MANAGER`       | Their community    |
| `EVENT_MANAGER`   | None                  | Assigned events    |
| `MEMBER`          | None                  | Own account only   |
