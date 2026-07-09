# 05 — ROLE MATRIX

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Platform Roles

### Roles

| Role | Description | Assignment |
|------|-------------|------------|
| Guest | Unauthenticated visitor | Automatic |
| Member | Registered user | After registration |
| Platform Admin | Platform administrator | Assigned by Super Admin |
| Super Admin | Highest privilege administrator | Seed data only |

### Permission Matrix — Platform Roles

| Permission | Guest | Member | Platform Admin | Super Admin |
|-----------|-------|--------|---------------|-------------|
| View public pages | ✅ | ✅ | ✅ | ✅ |
| Register | ✅ | ❌ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ | ✅ |
| View profile | ❌ | ✅ | ✅ | ✅ |
| Edit own profile | ❌ | ✅ | ✅ | ✅ |
| Create community | ❌ | ✅ | ✅ | ✅ |
| Create organization | ❌ | ✅ | ✅ | ✅ |
| Create event | ❌ | ✅* | ✅ | ✅ |
| Register for event | ❌ | ✅ | ✅ | ✅ |
| Submit report | ❌ | ✅ | ✅ | ✅ |
| Suspend user | ❌ | ❌ | ✅ | ✅ |
| Activate user | ❌ | ❌ | ✅ | ✅ |
| Approve community | ❌ | ❌ | ✅ | ✅ |
| Approve organization | ❌ | ❌ | ✅ | ✅ |
| Moderate reports | ❌ | ❌ | ✅ | ✅ |
| Change user roles | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |
| Manage settings | ❌ | ❌ | ❌ | ✅ |

> **Note:** Event creation requires community or organization membership with appropriate role.

---

## Scoped Roles — Community

### Roles

| Role | Description | Assignment |
|------|-------------|------------|
| OWNER | Community creator/owner | Auto on create |
| ADMIN | Community administrator | Assigned by Owner |
| EVENT_MANAGER | Can create events | Assigned by Owner/Admin |
| MEMBER | Regular member | Auto on join (OPEN) or approval (RESTRICTED) |

### Permission Matrix — Community Roles

| Permission | MEMBER | EVENT_MANAGER | ADMIN | OWNER |
|-----------|--------|---------------|-------|-------|
| View community | ✅ | ✅ | ✅ | ✅ |
| Join community (open) | ✅ | ✅ | ✅ | ✅ |
| Leave community | ✅ | ✅ | ✅ | ✅ |
| View members | ✅ | ✅ | ✅ | ✅ |
| Create event | ❌ | ✅ | ✅ | ✅ |
| Approve join requests | ❌ | ❌ | ✅ | ✅ |
| Remove member | ❌ | ❌ | ✅ | ✅ |
| Ban member | ❌ | ❌ | ✅ | ✅ |
| Change member role | ❌ | ❌ | ✅ | ✅ |
| Edit community | ❌ | ❌ | ❌ | ✅ |
| Delete community | ❌ | ❌ | ❌ | ✅ |

---

## Scoped Roles — Organization

### Roles

| Role | Description | Assignment |
|------|-------------|------------|
| OWNER | Organization creator/owner | Auto on create |
| ADMIN | Organization administrator | Assigned by Owner |
| MEMBER | Regular member | Invitation only |

### Permission Matrix — Organization Roles

| Permission | MEMBER | ADMIN | OWNER |
|-----------|--------|-------|-------|
| View organization | ✅ | ✅ | ✅ |
| Create event | ❌ | ✅ | ✅ |
| Manage members | ❌ | ✅ | ✅ |
| Edit organization | ❌ | ❌ | ✅ |
| Delete organization | ❌ | ❌ | ✅ |

---

## RBAC Implementation

### Middleware

| Middleware | Function | Location |
|-----------|----------|----------|
| `authMiddleware` | JWT + cookie authentication | `apps/api/src/middleware/auth.ts` |
| `requireRole(...roles)` | Check platform role | `apps/api/src/middleware/rbac.ts` |
| `requireSuperAdmin()` | Require SUPER_ADMIN | `apps/api/src/middleware/rbac.ts` |
| `requirePlatformAdmin()` | Require SUPER_ADMIN or PLATFORM_ADMIN | `apps/api/src/middleware/rbac.ts` |
| `requireCommunityOwner` | Require community OWNER role | `apps/api/src/middleware/rbac.ts` |
| `requireCommunityAdmin` | Require community OWNER or ADMIN role | `apps/api/src/middleware/rbac.ts` |
| `requireOrganizationOwner` | Require organization OWNER role | `apps/api/src/middleware/rbac.ts` |

### Database Enums

```
PlatformRole:  SUPER_ADMIN | PLATFORM_ADMIN | MEMBER
CommunityRole: OWNER | ADMIN | EVENT_MANAGER | MEMBER
OrganizationRole: OWNER | ADMIN | MEMBER
```
