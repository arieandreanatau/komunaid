# Developer Handoff — KomunaID

> Spesifikasi per halaman untuk developer frontend dan backend.

---

## Public Pages

### 1. Landing Page (`/`)

| Field                   | Value                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Purpose**             | Mengenalkan platform, menampilkan statistik, mengarahkan ke daftar                                             |
| **Business Rule**       | Tampilkan komunitas/event populer (max 4), statistik real-time                                                 |
| **Permission**          | Any (public)                                                                                                   |
| **Acceptance Criteria** | Hero, stats, features, popular communities/events, CTA terlihat dalam < 3 detik                                |
| **API Endpoint**        | `GET /api/v1/communities?sort=popular&limit=4`, `GET /api/v1/events?sort=popular&limit=4`, `GET /api/v1/stats` |
| **Request**             | —                                                                                                              |
| **Response**            | `{ success, data: { communities[], events[], stats } }`                                                        |
| **Validation Rule**     | —                                                                                                              |
| **DB Dependency**       | Community, Event, User (count)                                                                                 |

### 2. Community Directory (`/communities`)

| Field                   | Value                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Purpose**             | Menampilkan daftar komunitas dengan filter dan pencarian                           |
| **Business Rule**       | Hanya tampilkan komunitas APPROVED, support pagination                             |
| **Permission**          | Any (public)                                                                       |
| **Acceptance Criteria** | Grid komunitas, filter, search, pagination berfungsi                               |
| **API Endpoint**        | `GET /api/v1/communities`                                                          |
| **Request**             | Query: `search`, `category`, `location`, `membershipType`, `sort`, `page`, `limit` |
| **Response**            | `{ success, data: Community[], meta: { total, page, limit, totalPages } }`         |
| **Validation Rule**     | `page >= 1`, `limit 1-50`                                                          |
| **DB Dependency**       | Community (APPROVED), Category                                                     |

### 3. Community Detail (`/communities/[slug]`)

| Field                   | Value                                                         |
| ----------------------- | ------------------------------------------------------------- |
| **Purpose**             | Menampilkan detail komunitas, join button                     |
| **Business Rule**       | Tampilkan info lengkap, status join (belum/joined/pending)    |
| **Permission**          | Any (public view), MEMBER+ (join)                             |
| **Acceptance Criteria** | Profil, stats, join button, tabs berfungsi                    |
| **API Endpoint**        | `GET /api/v1/communities/:slug`                               |
| **Request**             | Param: `slug`                                                 |
| **Response**            | `{ success, data: Community & { _count, membershipStatus } }` |
| **Validation Rule**     | Slug format valid                                             |
| **DB Dependency**       | Community, CommunityMember, User                              |

### 4. Organization Directory (`/organizations`)

| Field                   | Value                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| **Purpose**             | Menampilkan daftar organisasi dengan filter                      |
| **Business Rule**       | Hanya tampilkan organisasi APPROVED                              |
| **Permission**          | Any (public)                                                     |
| **Acceptance Criteria** | Grid organisasi, filter, pagination berfungsi                    |
| **API Endpoint**        | `GET /api/v1/organizations`                                      |
| **Request**             | Query: `search`, `industry`, `location`, `sort`, `page`, `limit` |
| **Response**            | `{ success, data: Organization[], meta }`                        |
| **Validation Rule**     | `page >= 1`, `limit 1-50`                                        |
| **DB Dependency**       | Organization (APPROVED)                                          |

### 5. Organization Detail (`/organizations/[slug]`)

| Field                   | Value                                          |
| ----------------------- | ---------------------------------------------- |
| **Purpose**             | Menampilkan detail organisasi                  |
| **Business Rule**       | Tampilkan info lengkap organisasi              |
| **Permission**          | Any (public)                                   |
| **Acceptance Criteria** | Profil, stats terlihat                         |
| **API Endpoint**        | `GET /api/v1/organizations/:slug`              |
| **Request**             | Param: `slug`                                  |
| **Response**            | `{ success, data: Organization & { _count } }` |
| **Validation Rule**     | Slug format valid                              |
| **DB Dependency**       | Organization, OrganizationMember               |

### 6. Event Directory (`/events`)

| Field                   | Value                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| **Purpose**             | Menampilkan daftar event dengan filter                                                   |
| **Business Rule**       | Hanya tampilkan event APPROVED, urutkan berdasarkan tanggal                              |
| **Permission**          | Any (public)                                                                             |
| **Acceptance Criteria** | Grid event, filter, pagination berfungsi                                                 |
| **API Endpoint**        | `GET /api/v1/events`                                                                     |
| **Request**             | Query: `search`, `category`, `startDate`, `endDate`, `isOnline`, `sort`, `page`, `limit` |
| **Response**            | `{ success, data: Event[], meta }`                                                       |
| **Validation Rule**     | `page >= 1`, `limit 1-50`                                                                |
| **DB Dependency**       | Event (APPROVED), Category                                                               |

### 7. Event Detail (`/events/[slug]`)

| Field                   | Value                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| **Purpose**             | Menampilkan detail event, register button                              |
| **Business Rule**       | Tampilkan info lengkap, status register, kapasitas tersisa             |
| **Permission**          | Any (public view), MEMBER+ (register)                                  |
| **Acceptance Criteria** | Info event, register button, capacity info berfungsi                   |
| **API Endpoint**        | `GET /api/v1/events/:slug`                                             |
| **Request**             | Param: `slug`                                                          |
| **Response**            | `{ success, data: Event & { _count, registrationStatus, spotsLeft } }` |
| **Validation Rule**     | Slug format valid                                                      |
| **DB Dependency**       | Event, EventRegistration, User                                         |

---

## Auth Pages

### 8. Login (`/login`)

| Field                   | Value                                                          |
| ----------------------- | -------------------------------------------------------------- |
| **Purpose**             | Autentikasi pengguna                                           |
| **Business Rule**       | Rate limit: 5 attempts per 5 minutes, JWT access+refresh token |
| **Permission**          | Any (guest)                                                    |
| **Acceptance Criteria** | Login berhasil → redirect ke /app, error ditampilkan           |
| **API Endpoint**        | `POST /api/v1/auth/login`                                      |
| **Request**             | `{ email: string, password: string }`                          |
| **Response**            | `{ success, data: { accessToken, refreshToken, user } }`       |
| **Validation Rule**     | Email valid, password required, min 5 chars                    |
| **DB Dependency**       | User, UserRoleAssignment                                       |

### 9. Register (`/register`)

| Field                   | Value                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Purpose**             | Pendaftaran akun baru (3 langkah)                                                   |
| **Business Rule**       | Email unik, username unik, password min 8 chars                                     |
| **Permission**          | Any (guest)                                                                         |
| **Acceptance Criteria** | Register berhasil → redirect ke /app                                                |
| **API Endpoint**        | `POST /api/v1/auth/register`                                                        |
| **Request**             | `{ email, password, firstName, lastName, username, interests? }`                    |
| **Response**            | `{ success, data: { accessToken, refreshToken, user } }`                            |
| **Validation Rule**     | Email unique, username unique (3-30 chars, alphanumeric+underscore), password min 8 |
| **DB Dependency**       | User, UserInterest                                                                  |

### 10. Forgot Password (`/forgot-password`)

| Field                   | Value                                           |
| ----------------------- | ----------------------------------------------- |
| **Purpose**             | Kirim email reset password                      |
| **Business Rule**       | Rate limit: 3 per hour, token expires in 1 hour |
| **Permission**          | Any (guest)                                     |
| **Acceptance Criteria** | Email terkirim, tampilkan konfirmasi            |
| **API Endpoint**        | `POST /api/v1/auth/forgot-password`             |
| **Request**             | `{ email: string }`                             |
| **Response**            | `{ success, message: "Email reset terkirim" }`  |
| **Validation Rule**     | Email valid format                              |
| **DB Dependency**       | User, PasswordResetToken                        |

### 11. Reset Password (`/reset-password`)

| Field                   | Value                                                          |
| ----------------------- | -------------------------------------------------------------- |
| **Purpose**             | Reset password dengan token                                    |
| **Business Rule**       | Token valid & belum expired                                    |
| **Permission**          | Any (with valid token)                                         |
| **Acceptance Criteria** | Password terupdate, redirect ke /login                         |
| **API Endpoint**        | `POST /api/v1/auth/reset-password`                             |
| **Request**             | `{ token: string, password: string, confirmPassword: string }` |
| **Response**            | `{ success, message: "Password berhasil diubah" }`             |
| **Validation Rule**     | Token valid, password min 8, passwords match                   |
| **DB Dependency**       | User, PasswordResetToken                                       |

---

## Member Dashboard Pages

### 12. Dashboard Home (`/app`)

| Field                   | Value                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Purpose**             | Ringkasan aktivitas pengguna                                                                               |
| **Business Rule**       | Tampilkan statistik personal, recent activity, upcoming events                                             |
| **Permission**          | MEMBER+                                                                                                    |
| **Acceptance Criteria** | Stats cards, activity feed, upcoming events terlihat                                                       |
| **API Endpoint**        | `GET /api/v1/users/me/dashboard`                                                                           |
| **Request**             | —                                                                                                          |
| **Response**            | `{ success, data: { stats: { communities, events, notifications }, recentActivity[], upcomingEvents[] } }` |
| **Validation Rule**     | —                                                                                                          |
| **DB Dependency**       | User, CommunityMember, EventRegistration, Notification                                                     |

### 13. Profile (`/app/profile`)

| Field                     | Value                                                                            |
| ------------------------- | -------------------------------------------------------------------------------- |
| **Purpose**               | Lihat dan edit profil                                                            |
| **Business Rule**         | Avatar max 2MB, format jpg/png/webp                                              |
| **Permission**            | MEMBER+ (own profile)                                                            |
| **Acceptance Criteria**   | Profil terlihat, edit berhasil, avatar terupload                                 |
| **API Endpoint**          | `GET /api/v1/users/me`, `PATCH /api/v1/users/me`, `POST /api/v1/users/me/avatar` |
| **Request (GET)**         | —                                                                                |
| **Response (GET)**        | `{ success, data: User }`                                                        |
| **Request (PATCH)**       | `{ firstName?, lastName?, bio?, location?, phone? }`                             |
| **Request (POST avatar)** | `multipart/form-data { file: File }`                                             |
| **Validation Rule**       | firstName required, avatar max 2MB, allowed types: jpg/png/webp                  |
| **DB Dependency**         | User                                                                             |

### 14. Settings (`/app/settings`)

| Field                   | Value                                                                       |
| ----------------------- | --------------------------------------------------------------------------- |
| **Purpose**             | Ubah password, pengaturan akun                                              |
| **Business Rule**       | Password lama harus valid, password baru min 8 chars                        |
| **Permission**          | MEMBER+                                                                     |
| **Acceptance Criteria** | Password berhasil diubah                                                    |
| **API Endpoint**        | `PATCH /api/v1/users/me/password`                                           |
| **Request**             | `{ currentPassword: string, newPassword: string, confirmPassword: string }` |
| **Response**            | `{ success, message: "Password berhasil diubah" }`                          |
| **Validation Rule**     | Current password valid, new password min 8, passwords match                 |
| **DB Dependency**       | User                                                                        |

### 15. Bookmarks (`/app/bookmarks`)

| Field                   | Value                                          |
| ----------------------- | ---------------------------------------------- |
| **Purpose**             | Daftar komunitas yang di-bookmark              |
| **Business Rule**       | Tampilkan komunitas yang di-bookmark oleh user |
| **Permission**          | MEMBER+                                        |
| **Acceptance Criteria** | Daftar bookmark terlihat, bisa remove          |
| **API Endpoint**        | `GET /api/v1/users/me/bookmarks`               |
| **Request**             | Query: `page`, `limit`                         |
| **Response**            | `{ success, data: Community[], meta }`         |
| **Validation Rule**     | —                                              |
| **DB Dependency**       | UserBookmark, Community                        |

---

## Community Management Pages

### 16. Community Overview (`/app/community/[id]/overview`)

| Field                   | Value                                                           |
| ----------------------- | --------------------------------------------------------------- |
| **Purpose**             | Ringkasan komunitas                                             |
| **Business Rule**       | Tampilkan statistik, recent posts, upcoming events              |
| **Permission**          | COMMUNITY_OWNER/ADMIN/MODERATOR/MEMBER                          |
| **Acceptance Criteria** | Stats, recent posts, upcoming events terlihat                   |
| **API Endpoint**        | `GET /api/v1/communities/:id/dashboard`                         |
| **Request**             | Param: `id`                                                     |
| **Response**            | `{ success, data: { stats, recentPosts[], upcomingEvents[] } }` |
| **Validation Rule**     | User is member of community                                     |
| **DB Dependency**       | Community, CommunityMember, Post, Event                         |

### 17. Community Members (`/app/community/[id]/members`)

| Field                   | Value                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Purpose**             | Kelola anggota komunitas                                                               |
| **Business Rule**       | Owner/Admin bisa ubah role, ban, remove                                                |
| **Permission**          | COMMUNITY_OWNER/ADMIN                                                                  |
| **Acceptance Criteria** | Daftar member, search, filter, action buttons berfungsi                                |
| **API Endpoint**        | `GET /api/v1/communities/:id/members`, `PATCH /api/v1/communities/:id/members/:userId` |
| **Request (GET)**       | Query: `search`, `role`, `status`, `page`, `limit`                                     |
| **Request (PATCH)**     | `{ role?: string, status?: string }`                                                   |
| **Response (GET)**      | `{ success, data: CommunityMember[], meta }`                                           |
| **Validation Rule**     | Cannot ban/remove self, cannot escalate beyond own role                                |
| **DB Dependency**       | CommunityMember, User, UserRoleAssignment                                              |

### 18. Join Requests (`/app/community/[id]/join-requests`)

| Field                        | Value                                                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                  | Tangani permintaan bergabung                                                                                                                                                 |
| **Business Rule**            | Only for REQUEST membership type, approve/reject within 7 days                                                                                                               |
| **Permission**               | COMMUNITY_OWNER/ADMIN                                                                                                                                                        |
| **Acceptance Criteria**      | Daftar pending, approve/reject buttons berfungsi                                                                                                                             |
| **API Endpoint**             | `GET /api/v1/communities/:id/join-requests`, `POST /api/v1/communities/:id/join-requests/:requestId/approve`, `POST /api/v1/communities/:id/join-requests/:requestId/reject` |
| **Request (GET)**            | Query: `page`, `limit`                                                                                                                                                       |
| **Request (approve/reject)** | `{ reason?: string }`                                                                                                                                                        |
| **Response**                 | `{ success, data: CommunityMember[] }`                                                                                                                                       |
| **Validation Rule**          | Request must be PENDING                                                                                                                                                      |
| **DB Dependency**            | CommunityMember, Community, Notification                                                                                                                                     |

### 19. Community Posts (`/app/community/[id]/posts`)

| Field                   | Value                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**             | Daftar dan kelola postingan                                                                                                      |
| **Business Rule**       | Member bisa lihat, Owner/Admin bisa moderasi                                                                                     |
| **Permission**          | COMMUNITY_OWNER/ADMIN/MEMBER                                                                                                     |
| **Acceptance Criteria** | Daftar posts, create/edit/delete berfungsi                                                                                       |
| **API Endpoint**        | `GET /api/v1/communities/:id/posts`, `POST /api/v1/communities/:id/posts`, `PATCH /api/v1/posts/:id`, `DELETE /api/v1/posts/:id` |
| **Request (POST)**      | `{ title, content, status: "DRAFT"                                                                                               | "PUBLISHED" }` |
| **Response**            | `{ success, data: Post[] }`                                                                                                      |
| **Validation Rule**     | Title required (max 200), content required (max 5000)                                                                            |
| **DB Dependency**       | Post, CommunityMember, User                                                                                                      |

---

## Organization Management Pages

### 20. Organization Overview (`/app/organization/[id]/overview`)

| Field                   | Value                                                          |
| ----------------------- | -------------------------------------------------------------- |
| **Purpose**             | Ringkasan organisasi                                           |
| **Business Rule**       | Tampilkan statistik, recent activity, team overview            |
| **Permission**          | ORG_OWNER/ADMIN/MEMBER                                         |
| **Acceptance Criteria** | Stats, activity, team terlihat                                 |
| **API Endpoint**        | `GET /api/v1/organizations/:id/dashboard`                      |
| **Request**             | Param: `id`                                                    |
| **Response**            | `{ success, data: { stats, recentActivity[], teamOverview } }` |
| **Validation Rule**     | User is member of organization                                 |
| **DB Dependency**       | Organization, OrganizationMember, Event                        |

### 21. Organization Team (`/app/organization/[id]/team`)

| Field                   | Value                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**             | Kelola tim organisasi                                                                                                               |
| **Business Rule**       | Owner bisa invite, assign role                                                                                                      |
| **Permission**          | ORG_OWNER                                                                                                                           |
| **Acceptance Criteria** | Daftar tim, invite, role assignment berfungsi                                                                                       |
| **API Endpoint**        | `GET /api/v1/organizations/:id/members`, `POST /api/v1/organizations/:id/invite`, `PATCH /api/v1/organizations/:id/members/:userId` |
| **Request (invite)**    | `{ email: string, role: string }`                                                                                                   |
| **Response**            | `{ success, data: OrganizationMember[] }`                                                                                           |
| **Validation Rule**     | Email valid, role valid                                                                                                             |
| **DB Dependency**       | OrganizationMember, User, Notification                                                                                              |

---

## Admin Pages

### 22. Admin Dashboard (`/admin`)

| Field                   | Value                                                                      |
| ----------------------- | -------------------------------------------------------------------------- |
| **Purpose**             | Overview platform                                                          |
| **Business Rule**       | Tampilkan statistik real-time, pending approvals                           |
| **Permission**          | PLATFORM_ADMIN/SUPER_ADMIN                                                 |
| **Acceptance Criteria** | Stats cards, charts, recent activity, quick actions                        |
| **API Endpoint**        | `GET /api/v1/admin/dashboard`                                              |
| **Request**             | —                                                                          |
| **Response**            | `{ success, data: { stats, charts, recentActivity[], pendingApprovals } }` |
| **Validation Rule**     | —                                                                          |
| **DB Dependency**       | User, Community, Event, Report (counts)                                    |

### 23. User Management (`/admin/users`)

| Field                   | Value                                                                                                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**             | Kelola pengguna platform                                                                                                                                                                                       |
| **Business Rule**       | Full CRUD, suspend/activate/ban                                                                                                                                                                                |
| **Permission**          | SUPER_ADMIN/PLATFORM_ADMIN                                                                                                                                                                                     |
| **Acceptance Criteria** | Daftar user, search, filter, actions berfungsi                                                                                                                                                                 |
| **API Endpoint**        | `GET /api/v1/admin/users`, `GET /api/v1/admin/users/:id`, `PATCH /api/v1/admin/users/:id`, `POST /api/v1/admin/users/:id/suspend`, `POST /api/v1/admin/users/:id/activate`, `POST /api/v1/admin/users/:id/ban` |
| **Request (GET)**       | Query: `search`, `role`, `status`, `page`, `limit`                                                                                                                                                             |
| **Request (PATCH)**     | `{ firstName?, lastName?, email?, isActive?, isSuspended?, suspendedReason? }`                                                                                                                                 |
| **Response**            | `{ success, data: User[] }`                                                                                                                                                                                    |
| **Validation Rule**     | Cannot suspend/ban self                                                                                                                                                                                        |
| **DB Dependency**       | User, UserRoleAssignment, AuditLog                                                                                                                                                                             |

### 24. Community Approval (`/admin/community-approval`)

| Field                   | Value                                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**             | Review dan approve/reject komunitas                                                                                                       |
| **Business Rule**       | Hanya komunitas PENDING yang ditampilkan                                                                                                  |
| **Permission**          | PLATFORM_ADMIN                                                                                                                            |
| **Acceptance Criteria** | Daftar pending, detail, approve/reject berfungsi                                                                                          |
| **API Endpoint**        | `GET /api/v1/admin/communities?status=PENDING`, `POST /api/v1/admin/communities/:id/approve`, `POST /api/v1/admin/communities/:id/reject` |
| **Request (reject)**    | `{ reason: string }`                                                                                                                      |
| **Response**            | `{ success, data: Community }`                                                                                                            |
| **Validation Rule**     | Community must be PENDING, reject reason required                                                                                         |
| **DB Dependency**       | Community, CommunityMember, Notification, AuditLog                                                                                        |

### 25. Organization Approval (`/admin/organization-approval`)

| Field                   | Value                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**             | Review dan approve/reject organisasi                                                                                                            |
| **Business Rule**       | Hanya organisasi PENDING                                                                                                                        |
| **Permission**          | PLATFORM_ADMIN                                                                                                                                  |
| **Acceptance Criteria** | Daftar pending, detail, approve/reject berfungsi                                                                                                |
| **API Endpoint**        | `GET /api/v1/admin/organizations?status=PENDING`, `POST /api/v1/admin/organizations/:id/approve`, `POST /api/v1/admin/organizations/:id/reject` |
| **Request (reject)**    | `{ reason: string }`                                                                                                                            |
| **Response**            | `{ success, data: Organization }`                                                                                                               |
| **Validation Rule**     | Organization must be PENDING                                                                                                                    |
| **DB Dependency**       | Organization, OrganizationMember, Notification, AuditLog                                                                                        |

### 26. Reports (`/admin/reports`)

| Field                   | Value                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**             | Moderasi konten dilaporkan                                                                                                                       |
| **Business Rule**       | Review, resolve, dismiss, atau ban                                                                                                               |
| **Permission**          | PLATFORM_ADMIN                                                                                                                                   |
| **Acceptance Criteria** | Daftar laporan, detail, action berfungsi                                                                                                         |
| **API Endpoint**        | `GET /api/v1/admin/reports`, `GET /api/v1/admin/reports/:id`, `POST /api/v1/admin/reports/:id/resolve`, `POST /api/v1/admin/reports/:id/dismiss` |
| **Request (resolve)**   | `{ action: string, note?: string }`                                                                                                              |
| **Response**            | `{ success, data: Report }`                                                                                                                      |
| **Validation Rule**     | Report must be PENDING or UNDER_REVIEW                                                                                                           |
| **DB Dependency**       | Report, User, Community, Event, AuditLog                                                                                                         |

### 27. Audit Log (`/admin/audit-log`)

| Field                   | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| **Purpose**             | Lihat semua aktivitas platform                                     |
| **Business Rule**       | Filter by user, action, date range                                 |
| **Permission**          | SUPER_ADMIN                                                        |
| **Acceptance Criteria** | Daftar log, filter, pagination berfungsi                           |
| **API Endpoint**        | `GET /api/v1/admin/audit-logs`                                     |
| **Request**             | Query: `userId`, `action`, `startDate`, `endDate`, `page`, `limit` |
| **Response**            | `{ success, data: AuditLog[], meta }`                              |
| **Validation Rule**     | Date format valid                                                  |
| **DB Dependency**       | AuditLog, User                                                     |

---

## Error Pages

### 28. 403 Forbidden (`/403`)

| Field                   | Value                                         |
| ----------------------- | --------------------------------------------- |
| **Purpose**             | Menampilkan pesan akses ditolak               |
| **Business Rule**       | Tampilkan pesan + tombol kembali              |
| **Permission**          | Any                                           |
| **Acceptance Criteria** | Pesan 403 terlihat, tombol navigasi berfungsi |
| **API Endpoint**        | —                                             |
| **DB Dependency**       | —                                             |

### 29. 404 Not Found (`/404`)

| Field                   | Value                                         |
| ----------------------- | --------------------------------------------- |
| **Purpose**             | Menampilkan halaman tidak ditemukan           |
| **Business Rule**       | Tampilkan pesan + tombol ke home              |
| **Permission**          | Any                                           |
| **Acceptance Criteria** | Pesan 404 terlihat, tombol navigasi berfungsi |
| **API Endpoint**        | —                                             |
| **DB Dependency**       | —                                             |

### 30. 500 Server Error (`/500`)

| Field                   | Value                                      |
| ----------------------- | ------------------------------------------ |
| **Purpose**             | Menampilkan error server                   |
| **Business Rule**       | Tampilkan pesan + tombol retry             |
| **Permission**          | Any                                        |
| **Acceptance Criteria** | Pesan 500 terlihat, tombol retry berfungsi |
| **API Endpoint**        | —                                          |
| **DB Dependency**       | —                                          |
