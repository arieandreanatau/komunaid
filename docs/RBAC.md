# KomunaID — RBAC Permission Matrix

## Platform Roles

| Permission | SUPER_ADMIN | PLATFORM_ADMIN | MEMBER |
|---|:---:|:---:|:---:|
| View public pages | ✅ | ✅ | ✅ |
| Register/Login | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ |
| Create community | ✅ | ✅ | ✅ |
| Create organization | ✅ | ✅ | ✅ |
| Create event (in community/org) | ✅ | ✅ | ✅ (if OWNER/ADMIN/EVENT_MANAGER) |
| Apply as volunteer | ✅ | ✅ | ✅ |
| Report content | ✅ | ✅ | ✅ |
| **Admin Panel Access** | ✅ | ✅ | ❌ |
| Manage users (view) | ✅ | ✅ | ❌ |
| Suspend/activate users | ✅ | ✅ (non-admin only) | ❌ |
| Archive/restore users | ✅ | ✅ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |
| Manage communities (approve/reject/suspend) | ✅ | ✅ | ❌ |
| Manage organizations (approve/reject/suspend) | ✅ | ✅ | ❌ |
| Manage events (suspend/restore/cancel) | ✅ | ✅ | ❌ |
| Manage reports (resolve/dismiss) | ✅ | ✅ | ❌ |
| Manage categories | ✅ | ✅ | ❌ |
| Manage notifications (view/broadcast) | ✅ | ✅ (view only) | ❌ |
| View audit logs | ✅ | ❌ | ❌ |
| Manage master data | ✅ | ❌ | ❌ |
| Manage platform settings | ✅ | ❌ | ❌ |
| Manage notification templates | ✅ | ❌ | ❌ |

## Community Roles

| Permission | OWNER | ADMIN | EVENT_MANAGER | MEMBER |
|---|:---:|:---:|:---:|:---:|
| View community | ✅ | ✅ | ✅ | ✅ |
| Create events | ✅ | ✅ | ✅ | ❌ |
| Manage community settings | ✅ | ✅ | ❌ | ❌ |
| Update community profile | ✅ | ✅ | ❌ | ❌ |
| Manage members (view) | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ (non-admin) | ❌ | ❌ |
| Change member roles | ✅ | ❌ | ❌ | ❌ |
| Handle join requests | ✅ | ✅ | ❌ | ❌ |
| Archive community | ✅ | ❌ | ❌ | ❌ |
| Leave community | ❌ (owner cannot leave) | ✅ | ✅ | ✅ |

## Organization Roles

| Permission | OWNER | ADMIN | MEMBER |
|---|:---:|:---:|:---:|
| View organization | ✅ | ✅ | ✅ |
| Create events | ✅ | ✅ | ❌ |
| Manage organization settings | ✅ | ✅ | ❌ |
| Update organization profile | ✅ | ✅ | ❌ |
| Manage members (view) | ✅ | ✅ | ❌ |
| Remove members | ✅ | ✅ (non-admin) | ❌ |
| Change member roles | ✅ | ❌ | ❌ |
| Handle join requests | ✅ | ✅ | ❌ |
| Archive organization | ✅ | ❌ | ❌ |
| Leave organization | ❌ (owner cannot leave) | ✅ | ✅ |

## Event Management (via Community/Organization membership)

| Permission | OWNER | ADMIN | EVENT_MANAGER | MEMBER |
|---|:---:|:---:|:---:|:---:|
| Create event | ✅ | ✅ | ✅ | ❌ |
| Edit event | ✅ | ✅ | ✅ | ❌ |
| Delete event (soft) | ✅ | ✅ | ✅ | ❌ |
| Publish/Cancel/Complete event | ✅ | ✅ | ✅ | ❌ |
| View participants | ✅ | ✅ | ✅ | ❌ |
| Check-in/Check-out participants | ✅ | ✅ | ✅ | ❌ |
| Approve/Reject participants | ✅ | ✅ | ✅ | ❌ |
| Register for event | ✅ | ✅ | ✅ | ✅ |

## Volunteer Management (via Event management rights)

| Permission | Event Manager+ |
|---|:---:|
| Create volunteer opportunity | ✅ |
| Edit/Publish/Close opportunity | ✅ |
| View applications | ✅ |
| Accept/Reject applications | ✅ |
| Assign volunteers | ✅ |
| Check-in/Check-out volunteers | ✅ |
| Apply as volunteer | ✅ (any member) |

## RBAC Middleware

- `requireRole(...roles)` — Checks platform role from JWT + database
- `requireSuperAdmin()` — SUPER_ADMIN only
- `requirePlatformAdmin()` — SUPER_ADMIN or PLATFORM_ADMIN
- `requireCommunityOwner()` — Community OWNER with ACTIVE status
- `requireCommunityAdmin()` — Community OWNER or ADMIN with ACTIVE status
- `requireOrganizationOwner()` — Organization OWNER with ACTIVE status
- `requireOrganizationAdmin()` — Organization OWNER or ADMIN with ACTIVE status

## Status Validation

All RBAC middleware checks `membership.status === "ACTIVE"`. BANNED, PENDING, or REJECTED members are denied access even if they have the correct role.
