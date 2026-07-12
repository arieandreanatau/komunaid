# Navigation Structure — KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan struktur navigasi lengkap untuk panel Super Admin KomunaID. Navigasi mencakup URL patterns, route hierarchies, dan deskripsi setiap halaman.

---

## 2. URL Convention

```
Base URL: /admin
API Base: /api/v1/admin
```

### URL Patterns

| Pattern | Deskripsi | Example |
|---------|-----------|---------|
| `/admin` | Root admin panel | Redirect ke dashboard |
| `/admin/{module}` | Module index | `/admin/members` |
| `/admin/{module}/{action}` | Module action | `/admin/members/search` |
| `/admin/{module}/[id]` | Resource detail | `/admin/members/abc-123` |
| `/admin/{module}/[id]/[action]` | Resource action | `/admin/members/abc-123/deactivate` |

---

## 3. Complete Navigation Tree

### 3.1 Dashboard

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Dashboard | `/admin/dashboard` | Halaman utama admin panel menampilkan ringkasan statistik, grafik pertumbuhan, aktivitas terkini, antrian persetujuan, dan moderasi |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/dashboard` | GET | Render dashboard page |
| `/api/v1/admin/dashboard/stats` | GET | Fetch statistics data |
| `/api/v1/admin/dashboard/growth` | GET | Fetch growth chart data |
| `/api/v1/admin/dashboard/activity` | GET | Fetch recent activity |
| `/api/v1/admin/dashboard/pending` | GET | Fetch pending reviews |
| `/api/v1/admin/dashboard/moderation` | GET | Fetch moderation queue |

---

### 3.2 Members

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Members | `/admin/members` | Daftar semua anggota terdaftar di platform dengan fitur pencarian, filter, paginasi |
| 2 | Member Detail | `/admin/members/[id]` | Detail profil anggota termasuk komunitas yang diikuti, aktivitas, dan riwayat |
| 2 | Member Search | `/admin/members/search` | Pencarian lanjutan anggota berdasarkan kriteria tertentu |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/members` | GET | Render member list page |
| `/admin/members/search` | GET | Render member search page |
| `/admin/members/[id]` | GET | Render member detail page |
| `/admin/members/[id]/deactivate` | POST | Deactivate member account |
| `/admin/members/[id]/reactivate` | POST | Reactivate member account |
| `/admin/members/[id]/reset-password` | POST | Reset member password |
| `/admin/members/[id]/role` | PUT | Change member role |
| `/admin/members/[id]/communities` | GET | Get member's communities |
| `/admin/members/export` | GET | Export members to CSV |
| `/api/v1/admin/members` | GET | Fetch member list |
| `/api/v1/admin/members/:id` | GET | Fetch member detail |
| `/api/v1/admin/members/search` | GET | Search members |

---

### 3.3 Communities

#### 3.3.1 Community Approval

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 2 | Approval | `/admin/communities/approval` | Daftar komunitas yang menunggu persetujuan admin |
| 3 | Approval Detail | `/admin/communities/approval/[id]` | Detail pengajuan komunitas termasuk info lengkap, dokumen, dan riwayat review |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/communities/approval` | GET | Render approval list page |
| `/admin/communities/approval/[id]` | GET | Render approval detail page |
| `/admin/communities/approval/[id]/approve` | POST | Approve community |
| `/admin/communities/approval/[id]/revision` | POST | Request revision |
| `/admin/communities/approval/[id]/reject` | POST | Reject community |
| `/admin/communities/approval/[id]/history` | GET | Get approval history |
| `/admin/communities/approval/bulk-approve` | POST | Bulk approve communities |
| `/admin/communities/approval/bulk-reject` | POST | Bulk reject communities |
| `/api/v1/admin/community-approvals` | GET | Fetch approval list |
| `/api/v1/admin/community-approvals/:id` | GET | Fetch approval detail |

#### 3.3.2 Community List

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 2 | Community List | `/admin/communities/list` | Daftar semua komunitas aktif di platform |
| 3 | Community Detail | `/admin/communities/list/[id]` | Detail komunitas termasuk anggota, statistik, dan aktivitas |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/communities/list` | GET | Render community list page |
| `/admin/communities/list/[id]` | GET | Render community detail page |
| `/admin/communities/list/[id]/suspend` | POST | Suspend community |
| `/admin/communities/list/[id]/reactivate` | POST | Reactivate community |
| `/admin/communities/list/[id]/delete` | DELETE | Delete community |
| `/admin/communities/list/[id]/stats` | GET | Get community stats |
| `/admin/communities/categories` | GET | Manage community categories |
| `/api/v1/admin/communities` | GET | Fetch community list |
| `/api/v1/admin/communities/:id` | GET | Fetch community detail |

---

### 3.4 Events

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Events | `/admin/events` | Daftar semua event di platform dengan filter dan detail |
| 2 | Event Detail | `/admin/events/[id]` | Detail event termasuk peserta, lokasi, dan statistik |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/events` | GET | Render event list page |
| `/admin/events/[id]` | GET | Render event detail page |
| `/admin/events/[id]/approve` | POST | Approve event |
| `/admin/events/[id]/cancel` | POST | Cancel event |
| `/admin/events/[id]/edit` | PUT | Edit event |
| `/admin/events/[id]/delete` | DELETE | Delete event |
| `/admin/events/[id]/participants` | GET | View participants |
| `/admin/events/[id]/participants/export` | GET | Export participants to CSV |
| `/api/v1/admin/events` | GET | Fetch event list |
| `/api/v1/admin/events/:id` | GET | Fetch event detail |

---

### 3.5 Volunteers

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Volunteers | `/admin/volunteers` | Daftar semua volunteer di platform |
| 2 | Volunteer Detail | `/admin/volunteers/[id]` | Detail profil volunteer termasuk histori penugasan |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/volunteers` | GET | Render volunteer list page |
| `/admin/volunteers/[id]` | GET | Render volunteer detail page |
| `/admin/volunteers/[id]/approve` | POST | Approve volunteer |
| `/admin/volunteers/[id]/revoke` | POST | Revoke volunteer |
| `/admin/volunteers/[id]/assign` | POST | Assign to event |
| `/admin/volunteers/[id]/unassign/[eventId]` | DELETE | Unassign from event |
| `/admin/volunteers/stats` | GET | View volunteer stats |
| `/admin/volunteers/export` | GET | Export volunteers to CSV |
| `/api/v1/admin/volunteers` | GET | Fetch volunteer list |
| `/api/v1/admin/volunteers/:id` | GET | Fetch volunteer detail |

---

### 3.6 Moderation

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Moderation | `/admin/moderation` | Daftar laporan moderasi yang masuk |
| 2 | Moderation Detail | `/admin/moderation/[id]` | Detail laporan termasuk konten dilaporkan dan opsi tindakan |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/moderation` | GET | Render moderation list page |
| `/admin/moderation/[id]` | GET | Render moderation detail page |
| `/admin/moderation/[id]/warn` | POST | Issue warning |
| `/admin/moderation/[id]/suspend` | POST | Suspend user |
| `/admin/moderation/[id]/permanent-suspend` | POST | Permanent suspend |
| `/admin/moderation/[id]/remove-content` | POST | Remove reported content |
| `/admin/moderation/[id]/dismiss` | POST | Dismiss report |
| `/admin/moderation/[id]/appeal` | PUT | Handle appeal |
| `/admin/moderation/history/[userId]` | GET | View moderation history |
| `/api/v1/admin/moderations` | GET | Fetch moderation list |
| `/api/v1/admin/moderations/:id` | GET | Fetch moderation detail |

---

### 3.7 CMS

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | CMS | `/admin/cms` | CMS dashboard |
| 2 | Pages | `/admin/cms/pages` | Daftar halaman statis |
| 3 | Page Detail | `/admin/cms/pages/[id]` | Detail halaman dengan editor |
| 3 | Page Create | `/admin/cms/pages/create` | Membuat halaman baru |
| 2 | Banners | `/admin/cms/banners` | Daftar banner promosi |
| 3 | Banner Detail | `/admin/cms/banners/[id]` | Detail banner |
| 3 | Banner Create | `/admin/cms/banners/create` | Membuat banner baru |
| 2 | Media | `/admin/cms/media` | Pengelolaan media (gambar) |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/cms` | GET | Render CMS dashboard |
| `/admin/cms/pages` | GET | Render page list |
| `/admin/cms/pages/create` | GET | Render page create form |
| `/admin/cms/pages/[id]` | GET | Render page detail/editor |
| `/admin/cms/pages/[id]/versions` | GET | View page versions |
| `/admin/cms/pages/[id]/versions/:versionId/restore` | POST | Restore version |
| `/admin/cms/banners` | GET | Render banner list |
| `/admin/cms/banners/create` | GET | Render banner create form |
| `/admin/cms/banners/[id]` | GET | Render banner detail |
| `/admin/cms/media` | GET | Render media library |
| `/admin/cms/media/upload` | POST | Upload media file |
| `/api/v1/admin/cms/pages` | GET | Fetch page list |
| `/api/v1/admin/cms/pages/:id` | GET | Fetch page detail |
| `/api/v1/admin/cms/banners` | GET | Fetch banner list |
| `/api/v1/admin/cms/banners/:id` | GET | Fetch banner detail |
| `/api/v1/admin/cms/media` | GET | Fetch media list |

---

### 3.8 Notifications

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Notifications | `/admin/notifications` | Daftar notifikasi yang dikirim |
| 2 | Send Notification | `/admin/notifications/send` | Form pengiriman notifikasi manual |
| 2 | Templates | `/admin/notifications/templates` | Daftar template notifikasi |
| 3 | Template Detail | `/admin/notifications/templates/[id]` | Detail template |
| 3 | Template Create | `/admin/notifications/templates/create` | Membuat template baru |
| 2 | History | `/admin/notifications/history` | Riwayat pengiriman notifikasi |
| 2 | Statistics | `/admin/notifications/stats` | Statistik notifikasi |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/notifications` | GET | Render notification list |
| `/admin/notifications/send` | GET | Render send form |
| `/admin/notifications/send` | POST | Send manual notification |
| `/admin/notifications/bulk` | POST | Send bulk notification |
| `/admin/notifications/templates` | GET | Render template list |
| `/admin/notifications/templates/create` | GET | Render template create form |
| `/admin/notifications/templates/[id]` | GET | Render template detail |
| `/admin/notifications/history` | GET | Render history page |
| `/admin/notifications/stats` | GET | Render statistics page |
| `/admin/notifications/channels` | GET | Render channel settings |
| `/api/v1/admin/notifications` | GET | Fetch notification list |
| `/api/v1/admin/notifications/templates` | GET | Fetch template list |
| `/api/v1/admin/notifications/templates/:id` | GET | Fetch template detail |
| `/api/v1/admin/notifications/history` | GET | Fetch history |
| `/api/v1/admin/notifications/stats` | GET | Fetch statistics |

---

### 3.9 Data Master

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Data Master | `/admin/data-master` | Data Master dashboard |
| 2 | Categories | `/admin/data-master/categories` | Pengelolaan kategori |
| 2 | Tags | `/admin/data-master/tags` | Pengelolaan tag |
| 2 | Skills | `/admin/data-master/skills` | Pengelolaan keahlian |
| 2 | Locations | `/admin/data-master/locations` | Pengelolaan data lokasi |
| 2 | Config | `/admin/data-master/config` | Pengaturan konfigurasi platform |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/data-master` | GET | Render data master dashboard |
| `/admin/data-master/categories` | GET | Render category list |
| `/admin/data-master/categories/create` | GET | Render category create form |
| `/admin/data-master/categories/[id]/edit` | GET | Render category edit form |
| `/admin/data-master/tags` | GET | Render tag list |
| `/admin/data-master/tags/create` | GET | Render tag create form |
| `/admin/data-master/tags/[id]/edit` | GET | Render tag edit form |
| `/admin/data-master/skills` | GET | Render skill list |
| `/admin/data-master/skills/create` | GET | Render skill create form |
| `/admin/data-master/skills/[id]/edit` | GET | Render skill edit form |
| `/admin/data-master/locations` | GET | Render location list |
| `/admin/data-master/locations/create` | GET | Render location create form |
| `/admin/data-master/locations/[id]/edit` | GET | Render location edit form |
| `/admin/data-master/config` | GET | Render platform config |
| `/admin/data-master/import` | POST | Import data master |
| `/admin/data-master/export` | GET | Export data master |
| `/api/v1/admin/data-master/categories` | GET | Fetch categories |
| `/api/v1/admin/data-master/tags` | GET | Fetch tags |
| `/api/v1/admin/data-master/skills` | GET | Fetch skills |
| `/api/v1/admin/data-master/locations` | GET | Fetch locations |
| `/api/v1/admin/data-master/config` | GET | Fetch config |

---

### 3.10 Audit Log

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Audit Log | `/admin/audit-log` | Daftar audit log aktivitas admin |
| 2 | Log Detail | `/admin/audit-log/[id]` | Detail perubahan data (before/after) |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/audit-log` | GET | Render audit log list |
| `/admin/audit-log/[id]` | GET | Render log detail |
| `/admin/audit-log/export` | GET | Export audit logs |
| `/api/v1/admin/audit-logs` | GET | Fetch audit log list |
| `/api/v1/admin/audit-logs/:id` | GET | Fetch log detail |
| `/api/v1/admin/audit-logs/export` | GET | Export logs |
| `/api/v1/admin/audit-logs/stream` | WebSocket | Real-time log stream |

---

### 3.11 Security

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Security | `/admin/security` | Security dashboard |
| 2 | Sessions | `/admin/security/sessions` | Daftar sesi aktif semua admin |
| 2 | IP Whitelist | `/admin/security/ip-whitelist` | Pengaturan whitelist IP |
| 2 | Rate Limiting | `/admin/security/rate-limiting` | Pengaturan rate limiting |
| 2 | Password Policy | `/admin/security/password-policy` | Pengaturan kebijakan password |
| 2 | Login Attempts | `/admin/security/login-attempts` | Pengaturan batas percobaan login |
| 2 | Alerts | `/admin/security/alerts` | Daftar alert keamanan |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/security` | GET | Render security dashboard |
| `/admin/security/sessions` | GET | Render session list |
| `/admin/security/sessions/:id/revoke` | POST | Revoke session |
| `/admin/security/ip-whitelist` | GET | Render IP whitelist |
| `/admin/security/ip-whitelist` | PUT | Update IP whitelist |
| `/admin/security/rate-limiting` | GET | Render rate limiting config |
| `/admin/security/rate-limiting` | PUT | Update rate limiting |
| `/admin/security/password-policy` | GET | Render password policy |
| `/admin/security/password-policy` | PUT | Update password policy |
| `/admin/security/login-attempts` | GET | Render login attempts config |
| `/admin/security/login-attempts` | PUT | Update login attempts |
| `/admin/security/alerts` | GET | Render security alerts |
| `/admin/security/alerts/:id/dismiss` | PUT | Dismiss alert |
| `/api/v1/admin/security/sessions` | GET | Fetch sessions |
| `/api/v1/admin/security/ip-whitelist` | GET | Fetch IP whitelist |
| `/api/v1/admin/security/rate-limiting` | GET | Fetch rate limiting |
| `/api/v1/admin/security/password-policy` | GET | Fetch password policy |
| `/api/v1/admin/security/login-attempts` | GET | Fetch login attempts |
| `/api/v1/admin/security/alerts` | GET | Fetch security alerts |

---

### 3.12 Settings

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| 1 | Settings | `/admin/settings` | Pengaturan admin |
| 2 | Profile | `/admin/settings/profile` | Profil admin |
| 2 | Password | `/admin/settings/password` | Ubah password |
| 2 | Notifications | `/admin/settings/notifications` | Preferensi notifikasi |
| 2 | Platform | `/admin/settings/platform` | Pengaturan platform (SUPER_ADMIN only) |
| 2 | Email | `/admin/settings/email` | Pengaturan email SMTP (SUPER_ADMIN only) |
| 2 | Appearance | `/admin/settings/appearance` | Pengaturan tampilan |

**Sub-routes:**

| URL | Method | Description |
|-----|--------|-------------|
| `/admin/settings` | GET | Render settings page |
| `/admin/settings/profile` | GET | Render profile page |
| `/admin/settings/profile` | PUT | Update profile |
| `/admin/settings/password` | GET | Render password page |
| `/admin/settings/password` | PUT | Change password |
| `/admin/settings/notifications` | GET | Render notification prefs |
| `/admin/settings/notifications` | PUT | Update notification prefs |
| `/admin/settings/platform` | GET | Render platform settings |
| `/admin/settings/platform` | PUT | Update platform settings |
| `/admin/settings/email` | GET | Render email settings |
| `/admin/settings/email` | PUT | Update email settings |
| `/admin/settings/email/test` | POST | Test email send |
| `/admin/settings/appearance` | GET | Render appearance settings |
| `/admin/settings/appearance` | PUT | Update appearance |
| `/api/v1/admin/settings/profile` | GET | Fetch profile |
| `/api/v1/admin/settings/notifications` | GET | Fetch notification prefs |
| `/api/v1/admin/settings/platform` | GET | Fetch platform settings |
| `/api/v1/admin/settings/email` | GET | Fetch email settings |
| `/api/v1/admin/settings/appearance` | GET | Fetch appearance settings |

---

### 3.13 Authentication (Non-Admin Routes)

| Level | Name | URL | Description |
|-------|------|-----|-------------|
| - | Login | `/admin/login` | Halaman login admin |
| - | Forgot Password | `/admin/forgot-password` | Form lupa password |
| - | Reset Password | `/admin/reset-password` | Form reset password |
| - | 2FA Verify | `/admin/2fa-verify` | Verifikasi two-factor authentication |

---

## 4. Breadcrumb Navigation

Setiap halaman admin memiliki breadcrumb navigation:

```
Dashboard
Dashboard > Members
Dashboard > Members > [Member Name]
Dashboard > Communities > Approval
Dashboard > Communities > Approval > [Community Name]
Dashboard > Communities > Community List
Dashboard > Communities > Community List > [Community Name]
Dashboard > Events
Dashboard > Events > [Event Name]
Dashboard > Volunteers
Dashboard > Volunteers > [Volunteer Name]
Dashboard > Moderation
Dashboard > Moderation > [Report ID]
Dashboard > CMS > Pages
Dashboard > CMS > Pages > [Page Title]
Dashboard > CMS > Banners
Dashboard > CMS > Banners > [Banner Title]
Dashboard > Notifications
Dashboard > Notifications > Templates
Dashboard > Notifications > History
Dashboard > Data Master > Categories
Dashboard > Data Master > Tags
Dashboard > Data Master > Skills
Dashboard > Data Master > Locations
Dashboard > Audit Log
Dashboard > Audit Log > [Log ID]
Dashboard > Security > Sessions
Dashboard > Security > Alerts
Dashboard > Settings > Profile
```

---

## 5. Route Guards

| Route Pattern | Required Role | Redirect |
|---------------|---------------|----------|
| `/admin/login` | None (public) | If authenticated → `/admin/dashboard` |
| `/admin/forgot-password` | None (public) | If authenticated → `/admin/dashboard` |
| `/admin/reset-password` | None (public) | If authenticated → `/admin/dashboard` |
| `/admin/dashboard` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
| `/admin/members/*` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
| `/admin/communities/*` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
| `/admin/events/*` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
| `/admin/volunteers/*` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
| `/admin/moderation/*` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
| `/admin/cms/*` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
| `/admin/notifications/*` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
| `/admin/audit-log/*` | SUPER_ADMIN only | If not authenticated → `/admin/login`; If PLATFORM_ADMIN → `/admin/dashboard` |
| `/admin/security/*` | SUPER_ADMIN only | If not authenticated → `/admin/login`; If PLATFORM_ADMIN → `/admin/dashboard` |
| `/admin/data-master/config` | SUPER_ADMIN only | If not authenticated → `/admin/login`; If PLATFORM_ADMIN → `/admin/data-master` |
| `/admin/settings/platform/*` | SUPER_ADMIN only | If not authenticated → `/admin/login`; If PLATFORM_ADMIN → `/admin/settings/profile` |
| `/admin/settings/email/*` | SUPER_ADMIN only | If not authenticated → `/admin/login`; If PLATFORM_ADMIN → `/admin/settings/profile` |
| `/admin/settings/*` | PLATFORM_ADMIN+ | If not authenticated → `/admin/login` |
