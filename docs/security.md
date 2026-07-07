# Security

## Authentication Flow

```
Register/Login → JWT (access + refresh) → Bearer token in Authorization header
```

1. User registers or logs in → receives `accessToken` + `refreshToken`.
2. Client sends `Authorization: Bearer <accessToken>` on protected routes.
3. `AuthGuard` verifies the JWT, loads user from DB (including roles), attaches to `request.user`.
4. When access token expires, client sends `POST /auth/refresh` with `refreshToken` to get new tokens.

## JWT Configuration

| Token          | Secret                  | TTL                                      | Purpose             |
| -------------- | ----------------------- | ---------------------------------------- | ------------------- |
| Access         | `JWT_SECRET`            | `JWT_EXPIRES_IN` (default 15m)           | API authentication  |
| Refresh        | `REFRESH_TOKEN_SECRET`  | `REFRESH_TOKEN_EXPIRES_IN` (default 30d) | Token renewal       |
| Password Reset | `PASSWORD_RESET_SECRET` | 1 hour                                   | One-time reset link |

All three secrets **must** be separate, cryptographically random strings (64+ chars).

### JWT Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1700000000,
  "exp": 1700604800
}
```

## Password Hashing

- **Algorithm**: bcrypt (via `bcryptjs`)
- **Salt rounds**: Configurable via `BCRYPT_SALT_ROUNDS` (default 12)
- Passwords are hashed on registration and password reset, compared on login with `bcrypt.compare()`.

## RBAC (Role-Based Access Control)

### Role Hierarchy

```
SUPER_ADMIN      (100)  — Full platform access
PLATFORM_ADMIN   (80)   — Platform administration
ORG_OWNER        (60)   — Organization owner
ORG_ADMIN        (50)   — Organization admin
COMMUNITY_OWNER  (40)   — Community owner
COMMUNITY_ADMIN  (30)   — Community admin
EVENT_MANAGER    (20)   — Event manager (scoped)
MEMBER           (10)   — Regular member
```

### Guards

| Guard                   | Purpose                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `AuthGuard`             | Verifies JWT, loads user + roles, rejects inactive/suspended users        |
| `RolesGuard`            | Checks if user has any of the required roles (uses `isRoleHigherOrEqual`) |
| `ScopedPermissionGuard` | Checks scoped permissions (community/org-specific roles)                  |

### Usage

```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'PLATFORM_ADMIN')
@Get('admin/dashboard/stats')
async getDashboardStats() { ... }
```

### Scoped Roles

`UserRoleAssignment` supports optional `scope` and `scopeId`:

```typescript
// A user can be COMMUNITY_ADMIN scoped to a specific community
{
  userId: "...",
  roleId: "community-admin-role-id",
  scope: "COMMUNITY",
  scopeId: "community-uuid"
}
```

`ScopedPermissionGuard` checks if the user's scoped role matches the resource being accessed.

## Protected Routes

All endpoints requiring authentication use `@UseGuards(AuthGuard)`:

```typescript
@Post()
@UseGuards(AuthGuard)
@ApiBearerAuth()
async create(@CurrentUser('id') userId: string, @Body() dto: CreateDto) {
  return this.service.create(userId, dto);
}
```

The `@CurrentUser()` decorator extracts the authenticated user from `request.user`.

## Audit Log

The `AuditLogInterceptor` automatically records all non-GET mutations:

| Field        | Source                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------- |
| `userId`     | `request.user.id`                                                                             |
| `action`     | Mapped from HTTP method + URL (CREATE, UPDATE, DELETE, APPROVE, REJECT, SUSPEND, ASSIGN_ROLE) |
| `entityType` | Extracted from URL path (USER, COMMUNITY, EVENT, etc.)                                        |
| `entityId`   | From route params or response body                                                            |
| `newValues`  | Request body (JSON)                                                                           |
| `ipAddress`  | `request.ip` or `x-forwarded-for`                                                             |
| `userAgent`  | `request.headers['user-agent']`                                                               |

Audit logs are queryable via `GET /admin/audit-logs` (admin-only).

## Additional Security Measures

- **ValidationPipe** with `whitelist: true` and `forbidNonWhitelisted: true` — strips unknown properties.
- **CORS** restricted to configured `CORS_ORIGIN`.
- **Soft deletes** — data is never hard-deleted, enabling recovery and audit.
- **Email verification** flag on User — can be enforced for sensitive actions.
- **Suspension** — users, communities, and organizations can be suspended with reasons.
- **Rate limiting** — recommended to add `@nestjs/throttler` for production.
- **HTTPS** — must be enforced at reverse proxy / load balancer level.
