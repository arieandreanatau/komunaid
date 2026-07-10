# SDLC Stage 4 — Community Module

**Date:** 2026-07-10  
**Version:** 1.0.0  
**Status:** COMPLETED

---

## Overview

Implementasi lengkap modul Community untuk platform KomunaID. Seluruh implementasi mengikuti hasil Stage 2 (Technical Solution Blueprint) sebagai Single Source of Truth.

- **Backend:** Hono + TypeScript + Prisma
- **Frontend:** Next.js + Tailwind CSS
- **Database:** MySQL via Prisma ORM
- **Semua aturan bisnis telah diimplementasikan**

---

## Database Changes

Schema baru yang ditambahkan ke `packages/database/prisma/schema.prisma`:

### New Enums

| Enum | Values | Description |
|------|--------|-------------|
| `CommunityVisibility` | `PUBLIC`, `PRIVATE` | Visibility level komunitas |
| `CommunityRole` | `OWNER`, `ADMIN`, `EVENT_MANAGER`, `MEMBER` | Role dalam komunitas |
| `MembershipStatus` | `ACTIVE`, `PENDING`, `REJECTED`, `BANNED` | Status keanggotaan |
| `JoinRequestStatus` | `PENDING`, `APPROVED`, `REJECTED` | Status permintaan bergabung |

### New/Modified Fields on Community

| Field | Type | Description |
|-------|------|-------------|
| `banner` | `String?` | URL banner komunitas |
| `visibility` | `CommunityVisibility` | Default `PUBLIC` |

### New Models

#### `CommunityTag`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `String` | PK, cuid |
| `communityId` | `String` | FK → Community, cascade delete |
| `tag` | `String` | — |
| `createdAt` | `DateTime` | default now() |

- **Unique constraint:** `(communityId, tag)`
- **Indexes:** `communityId`, `tag`
- **Table:** `community_tags`

#### `CommunitySettings`

| Field | Type | Default |
|-------|------|---------|
| `id` | `String` | PK, cuid |
| `communityId` | `String` | unique, FK → Community |
| `allowMemberPost` | `Boolean` | `true` |
| `requireApproval` | `Boolean` | `false` |
| `showMemberList` | `Boolean` | `true` |
| `showEventList` | `Boolean` | `true` |
| `createdAt` | `DateTime` | now() |
| `updatedAt` | `DateTime` | updatedAt |

- **Unique constraint:** `communityId` (one settings per community)
- **Table:** `community_settings`

#### `MembershipHistory`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | PK, cuid |
| `communityId` | `String` | FK → Community, cascade delete |
| `userId` | `String` | FK → User |
| `action` | `String` | Action type (JOIN, LEAVE, ROLE_CHANGE, etc.) |
| `oldRole` | `String?` | Previous role |
| `newRole` | `String?` | New role |
| `details` | `Json?` | Additional context |
| `performedBy` | `String?` | User ID who performed the action |
| `createdAt` | `DateTime` | default now() |

- **Indexes:** `communityId`, `userId`, `createdAt`
- **Table:** `membership_history`

---

## API Endpoints

Base path: `/api/communities`

### 1. List Communities (Public)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/` |
| **Auth** | Optional (JWT cookie) |
| **RBAC** | None |
| **Validation** | `communityQuerySchema` (query) |
| **Description** | List semua komunitas dengan filtering, searching, sorting, dan pagination. Guest hanya melihat `PUBLIC` + `APPROVED`. Auth user dapat filter by status/visibility. |

### 2. Get Community by Slug (Public)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/:slug` |
| **Auth** | Optional (JWT cookie) |
| **RBAC** | None |
| **Description** | Detail komunitas berdasarkan slug. Includes owner, members preview (20), upcoming events (5), categories, tags, settings, dan user membership status. Private communities return 403 for unauthenticated users. |

### 3. Create Community

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/` |
| **Auth** | Required |
| **RBAC** | Any authenticated user |
| **Validation** | `createCommunitySchema` |
| **Description** | Buat komunitas baru. Otomatis generate slug, create owner membership, default settings, categories, dan tags. Status default `PENDING`. Audit log + activity history dicatat. |

### 4. Update Community (Owner/Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/:communityId` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` (OWNER, ADMIN) |
| **Validation** | `updateCommunitySchema` |
| **Description** | Update info komunitas (name, description, coverImage, logo, banner, location, website, membershipType, visibility, categoryIds, tags). Audit log before/after data. |

### 5. Archive Community (Owner)

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/:communityId/archive` |
| **Auth** | Required |
| **RBAC** | `requireCommunityOwner` |
| **Description** | Arsipkan komunitas. Hanya owner. Cek status sebelumnya untuk mencegah double archive. Audit log dicatat. |

### 6. Get Community Dashboard (Owner/Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/:communityId/dashboard` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | Dashboard komunitas: info lengkap, member count, pending join request count, active event count, recent activity (10). |

### 7. Get Community Insight (Owner/Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/:communityId/insight` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | Analytics komunitas: total members, pending requests, member growth (7-day comparison + growth rate), recent join requests (10), top members (10 by role + seniority). |

### 8. Update Community Profile (Owner/Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/:communityId/profile` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | Update profil komunitas (name, description, location, website). Audit log before/after data. |

### 9. Update Community Banner (Owner/Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/:communityId/banner` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | Update URL banner komunitas. Validasi URL wajib diisi. Audit log. |

### 10. Update Community Logo (Owner/Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/:communityId/logo` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | Update URL logo komunitas. Validasi URL wajib diisi. Audit log. |

### 11. Get Community Settings (Owner/Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/:communityId/settings` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | Ambil settings komunitas (allowMemberPost, requireApproval, showMemberList, showEventList). |

### 12. Update Community Settings (Owner/Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/:communityId/settings` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Validation** | `updateCommunitySettingsSchema` |
| **Description** | Update settings komunitas dengan upsert. Audit log before/after data. |

### 13. Join Community

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/:communityId/join` |
| **Auth** | Required |
| **RBAC** | Any authenticated user |
| **Validation** | `joinCommunitySchema` |
| **Description** | Bergabung ke komunitas. OPEN → langsung jadi member. RESTRICTED → buat join request. Cek: banned check, duplicate check, community status check, private check. Audit log + activity history. |

### 14. Leave Community

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/:communityId/leave` |
| **Auth** | Required |
| **RBAC** | Any member (except OWNER) |
| **Description** | Keluar dari komunitas. Owner tidak bisa leave. Audit log + activity history. |

### 15. List Join Requests (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/:communityId/join-requests` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | List permintaan bergabung dengan pagination, filtering by status, dan searching by user name. |

### 16. Approve/Reject Join Request (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/:communityId/join-requests/:requestId` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Validation** | `handleJoinRequestSchema` |
| **Description** | Proses join request. Approve → create member + activity history. Reject → update status. Cek: request exists, belongs to community, still PENDING. Audit log + activity history. |

### 17. List Members

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/:communityId/members` |
| **Auth** | Required |
| **RBAC** | Any authenticated member |
| **Description** | List anggota komunitas aktif dengan pagination, searching (name/username), filtering by role, sorting by role/joinedAt. |

### 18. Remove Member (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/:communityId/members/:memberId` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | Hapus anggota dari komunitas. Cek: member exists, bukan owner, bukan self-remove. Audit log + activity history. |

### 19. Change Member Role (Owner)

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/:communityId/members/:memberId/role` |
| **Auth** | Required |
| **RBAC** | `requireCommunityOwner` |
| **Validation** | `changeMemberRoleSchema` (ADMIN, EVENT_MANAGER, MEMBER) |
| **Description** | Ubah role anggota. Hanya owner. Cek: member exists, bukan owner target, bukan self, role aktif, role berbeda. Audit log before/after + activity history. |

### 20. Get Membership History (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **Path** | `/:communityId/members/history` |
| **Auth** | Required |
| **RBAC** | `requireCommunityAdmin` |
| **Description** | Riwayat perubahan keanggotaan dengan pagination, filtering by action, dan searching. Includes user info. |

---

## Frontend Pages

### Public Community Pages

| Page | Path | Description |
|------|------|-------------|
| Communities List | `/communities` | Browse semua komunitas publik dengan search, filter, sort |
| Community Detail | `/communities/[slug]` | Detail komunitas: info, members preview, upcoming events, tags |
| Create Community | `/communities/create` | Form pembuatan komunitas baru |
| Edit Community | `/communities/[slug]/edit` | Form edit komunitas (admin/owner) |
| Community Settings | `/communities/[slug]/settings` | Pengaturan komunitas (admin/owner) |
| Join Requests | `/communities/[slug]/join-requests` | Kelola permintaan bergabung (admin/owner) |
| Members | `/communities/[slug]/members` | Daftar anggota komunitas |

### Dashboard Community Pages

| Page | Path | Description |
|------|------|-------------|
| Community Dashboard | `/dashboard/communities/[communityId]` | Dashboard overview komunitas: stats, activity, pending requests |

### Community Guidelines

| Page | Path | Description |
|------|------|-------------|
| Community Guidelines | `/community-guidelines` | Panduan dan aturan komunitas |

---

## Business Rules Compliance

| Rule | Status | Implementation |
|------|--------|---------------|
| Komunitas baru butuh approval admin | ✅ | Status default `PENDING`, visible hanya setelah `APPROVED` |
| Community slug auto-generated dari name | ✅ | `slugify()` function, collision check dengan timestamp suffix |
| Owner otomatis jadi member dengan role OWNER | ✅ | `communityMembers.create` saat create community |
| Default settings dibuat otomatis | ✅ | `communitySettings.create` saat create community |
| OPEN communities → langsung join | ✅ | Create `CommunityMember` dengan status `ACTIVE` |
| RESTRICTED communities → join request | ✅ | Create `JoinRequest` dengan status `PENDING` |
| Banned users tidak bisa join | ✅ | Check `BANNED` status sebelum join |
| Duplicate membership check | ✅ | Check existing member/request sebelum proses |
| Private communities tidak terlihat guest | ✅ | Filter `visibility: PUBLIC` untuk unauthenticated |
| Private communities return 403 untuk guest | ✅ | Check visibility di `getCommunityBySlug` |
| Owner tidak bisa leave | ✅ | Check `role === "OWNER"` di leave endpoint |
| Owner tidak bisa dihapus | ✅ | Check `role === "OWNER"` di remove member |
| Self-remove tidak diizinkan | ✅ | Check `member.userId === authUser.id` |
| Owner role tidak bisa diubah | ✅ | Check `role === "OWNER"` di change role |
| Self role change tidak diizinkan | ✅ | Check `member.userId === authUser.id` di change role |
| Hanya active members yang bisa dirole | ✅ | Check `member.status !== "ACTIVE"` |
| Role tidak boleh sama (no-op check) | ✅ | Check `beforeRole === newRole` |
| Slug unique per komunitas (tags) | ✅ | Prisma unique constraint `(communityId, tag)` |
| Max 5 categories per komunitas | ✅ | Zod validation `categoryIds: z.array(z.string()).max(5)` |
| Max 10 tags per komunitas | ✅ | Zod validation `tags: z.array(z.string().max(30)).max(10)` |
| Audit log before/after pada setiap perubahan | ✅ | `createAuditLog` dengan `beforeData`/`afterData` |
| Activity history dicatat | ✅ | `activityHistory.create` pada join/leave/create/role change |
| Pagination pada semua list endpoints | ✅ | `page`, `limit`, `total`, `totalPages` |
| Soft delete pada community | ✅ | `deletedAt` field, check `deletedAt: null` di query |

---

## RBAC Implementation

### Community-Scoped Roles

| Role | Permissions |
|------|------------|
| `OWNER` | Full access: update, archive, change settings, manage members, change roles |
| `ADMIN` | Update community, manage settings, handle join requests, remove members, view dashboard/insight |
| `EVENT_MANAGER` | Can create/manage events (separate endpoint) |
| `MEMBER` | View community, leave community, view members |

### RBAC Middleware

| Middleware | Checks |
|-----------|--------|
| `requireCommunityOwner` | User must have `OWNER` role in the community |
| `requireCommunityAdmin` | User must have `OWNER` or `ADMIN` role in the community |

### Endpoint RBAC Mapping

| Endpoint | Auth | RBAC |
|----------|------|------|
| `GET /communities/` | Optional | None (public with visibility filter) |
| `GET /communities/:slug` | Optional | None (public, private check for guest) |
| `POST /communities/` | Required | None (any authenticated user) |
| `PUT /communities/:id` | Required | `requireCommunityAdmin` |
| `POST /communities/:id/archive` | Required | `requireCommunityOwner` |
| `GET /communities/:id/dashboard` | Required | `requireCommunityAdmin` |
| `GET /communities/:id/insight` | Required | `requireCommunityAdmin` |
| `PUT /communities/:id/profile` | Required | `requireCommunityAdmin` |
| `PUT /communities/:id/banner` | Required | `requireCommunityAdmin` |
| `PUT /communities/:id/logo` | Required | `requireCommunityAdmin` |
| `GET /communities/:id/settings` | Required | `requireCommunityAdmin` |
| `PUT /communities/:id/settings` | Required | `requireCommunityAdmin` |
| `POST /communities/:id/join` | Required | None (any authenticated user) |
| `POST /communities/:id/leave` | Required | None (owner check in handler) |
| `GET /communities/:id/join-requests` | Required | `requireCommunityAdmin` |
| `PUT /communities/:id/join-requests/:rid` | Required | `requireCommunityAdmin` |
| `GET /communities/:id/members` | Required | None (any authenticated user) |
| `DELETE /communities/:id/members/:mid` | Required | `requireCommunityAdmin` |
| `PUT /communities/:id/members/:mid/role` | Required | `requireCommunityOwner` |
| `GET /communities/:id/members/history` | Required | `requireCommunityAdmin` |

---

## Validation Implementation

Zod schemas dari `@komunaid/shared`:

| Schema | Fields | Used By |
|--------|--------|---------|
| `createCommunitySchema` | name, description, coverImage, logo, banner, location, website, membershipType, visibility, categoryIds, tags | POST /communities |
| `updateCommunitySchema` | partial of createCommunitySchema | PUT /communities/:id |
| `communityQuerySchema` | page, limit, search, status, visibility, membershipType, categoryId, sort, orderBy | GET /communities |
| `updateCommunitySettingsSchema` | allowMemberPost, requireApproval, showMemberList, showEventList | PUT /communities/:id/settings |
| `changeMemberRoleSchema` | role (ADMIN, EVENT_MANAGER, MEMBER) | PUT /communities/:id/members/:mid/role |
| `joinCommunitySchema` | message (optional) | POST /communities/:id/join |
| `handleJoinRequestSchema` | action (approve, reject) | PUT /communities/:id/join-requests/:rid |

---

## Security Implementation

| Feature | Implementation | Status |
|---------|---------------|--------|
| JWT Authentication | jose library, HS256, httpOnly cookies | ✅ |
| RBAC | Community-scoped roles via `CommunityMember` table | ✅ |
| Request Validation | Zod schemas in `@komunaid/shared` | ✅ |
| Soft Delete | `deletedAt` field on Community, checked in all queries | ✅ |
| Audit Log | Immutable audit trail on every mutation (before/after data) | ✅ |
| Activity History | User activity tracking for join/leave/create/role change | ✅ |
| Owner Protection | Cannot remove owner, change owner role, owner cannot leave | ✅ |
| Self-Protection | Cannot remove self, cannot change own role | ✅ |
| Duplicate Prevention | Unique constraints on (communityId, userId), (communityId, tag) | ✅ |
| Visibility Control | PRIVATE communities hidden from unauthenticated users | ✅ |
| Global Error Handler | Hono onError middleware | ✅ |
| Security Headers | X-Content-Type-Options, X-Frame-Options, etc. | ✅ |
| CORS | Whitelist origin, credentials | ✅ |
| Rate Limiter | In-memory, 100/15min per IP | ✅ |
| Request Size Limit | 10MB | ✅ |

---

## Audit Actions

Community-related audit actions defined in `services/audit.ts`:

| Action | Description |
|--------|-------------|
| `COMMUNITY_CREATE` | New community created |
| `COMMUNITY_APPROVE` | Community approved by admin |
| `COMMUNITY_SUSPEND` | Community suspended/archived |
| `COMMUNITY_UPDATE` | Community info updated |
| `COMMUNITY_MEMBER_JOIN` | User joined community (direct or via approval) |
| `COMMUNITY_MEMBER_LEAVE` | User left community |
| `COMMUNITY_ROLE_CHANGE` | Member role changed or member removed |
| `SETTINGS_UPDATE` | Community settings updated |

---

## Files Changed/Created

### Backend (`apps/api/src/`)
- `routes/communities.ts` — New: 20 community endpoints
- `middleware/rbac.ts` — Enhanced: `requireCommunityOwner`, `requireCommunityAdmin`
- `services/audit.ts` — Enhanced: community audit actions

### Shared (`packages/shared/src/`)
- `index.ts` — Enhanced: community Zod schemas, types

### Database (`packages/database/prisma/`)
- `schema.prisma` — Enhanced: CommunityTag, CommunitySettings, MembershipHistory models; CommunityVisibility enum; banner field

### Frontend (`apps/web/`)
- `app/communities/page.tsx` — New: communities list page
- `app/communities/[slug]/page.tsx` — New: community detail page
- `app/communities/create/page.tsx` — New: create community form
- `app/communities/[slug]/edit/page.tsx` — New: edit community form
- `app/communities/[slug]/settings/page.tsx` — New: community settings page
- `app/communities/[slug]/join-requests/page.tsx` — New: join requests management
- `app/communities/[slug]/members/page.tsx` — New: members list page
- `app/dashboard/communities/[communityId]/page.tsx` — New: community dashboard
- `app/community-guidelines/page.tsx` — New: community guidelines page

---

## Testing Notes

- API validation tested via Zod schemas
- Community CRUD tested: create → update → archive
- Join flow tested: OPEN (direct join) + RESTRICTED (join request → approve/reject)
- RBAC tested: non-admin cannot update, non-owner cannot archive/change role
- Owner protection tested: cannot remove owner, cannot change owner role
- Self-protection tested: cannot remove self, cannot change own role
- Visibility tested: PRIVATE communities return 403 for guest
- Pagination tested on all list endpoints
- Audit log tested: before/after data on mutations
- Responsive tested: community pages on mobile/tablet/desktop

---

## Known Issues

1. **Hono Type Safety:** Pre-existing `c.get()` typing issues across all route files. Does not affect runtime.
2. **File Upload:** Banner, logo, coverImage use URL strings, not file upload (planned for S3 integration).
3. **Search Limitation:** MySQL `contains` is case-insensitive by default; may need full-text search for better performance at scale.
