# RBAC Matrix — KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan Role-Based Access Control (RBAC) secara detail untuk modul Platform Governance. RBAC mencakup role hierarchy, permission groups, scoped permissions, dan conditional access.

---

## 2. Role Hierarchy

```
SUPER_ADMIN (Level 1)
  └── PLATFORM_ADMIN (Level 2)
        └── COMMUNITY_ADMIN (Level 3)
              └── MEMBER (Level 4)
```

### Role Properties

| Property | SUPER_ADMIN | PLATFORM_ADMIN | COMMUNITY_ADMIN | MEMBER |
|----------|:-----------:|:--------------:|:---------------:|:------:|
| Level | 1 | 2 | 3 | 4 |
| Deskripsi | Admin tertinggi, akses penuh ke semua fitur platform | Admin operasional, mengelola aktivitas platform sehari-hari | Admin komunitas, mengelola komunitas tertentu | Anggota biasa, menggunakan fitur platform |
| Max Session | Unlimited | 3 concurrent | 1 concurrent | 1 concurrent |
| IP Restriction | Configurable | Configurable | None | None |
| Audit Visibility | All logs | Own logs + team logs | Community logs | Own activity only |

---

## 3. Permission Groups

### 3.1 Authentication Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `auth.login` | Login | Melakukan login ke sistem |
| `auth.logout` | Logout | Melakukan logout dari sistem |
| `auth.refresh` | Refresh Token | Memperbarui JWT token |
| `auth.forgot_password` | Forgot Password | Meminta reset password |
| `auth.reset_password` | Reset Password | Melakukan reset password |
| `auth.change_password` | Change Password | Mengubah password sendiri |
| `auth.view_login_history` | View Login History | Melihat riwayat login sendiri |
| `auth.view_all_login_history` | View All Login History | Melihat riwayat login semua admin |
| `auth.enable_2fa` | Enable 2FA | Mengaktifkan two-factor authentication |
| `auth.disable_2fa` | Disable 2FA | Menonaktifkan two-factor authentication |

### 3.2 Dashboard Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `dashboard.view` | View Dashboard | Mengakses halaman dashboard |
| `dashboard.view_stats` | View Statistics | Melihat statistik platform |
| `dashboard.view_growth` | View Growth Chart | Melihat grafik pertumbuhan |
| `dashboard.view_activity` | View Recent Activity | Melihat aktivitas terkini |
| `dashboard.view_pending` | View Pending Reviews | Melihat antrian persetujuan |
| `dashboard.view_moderation` | View Moderation Queue | Melihat antrian moderasi |
| `dashboard.quick_actions` | Quick Actions | Melakukan aksi cepat dari dashboard |

### 3.3 Member Management Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `member.list` | List Members | Melihat daftar anggota |
| `member.search` | Search Members | Mencari anggota |
| `member.view` | View Member Detail | Melihat detail anggota |
| `member.deactivate` | Deactivate Account | Menonaktifkan akun anggota |
| `member.reactivate` | Reactivate Account | Mengaktifkan kembali akun |
| `member.reset_password` | Reset Member Password | Mereset password anggota |
| `member.assign_role` | Assign Role | Mengubah role anggota |
| `member.export` | Export Members | Mengekspor data anggota |
| `member.view_communities` | View Member Communities | Melihat komunitas anggota |

### 3.4 Community Approval Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `community_approval.list` | List Pending | Melihat daftar komunitas pending |
| `community_approval.view` | View Detail | Melihat detail pengajuan |
| `community_approval.approve` | Approve | Menyetujui komunitas |
| `community_approval.revision` | Request Revision | Meminta revisi |
| `community_approval.reject` | Reject | Menolak komunitas |
| `community_approval.history` | View History | Melihat riwayat keputusan |
| `community_approval.bulk_approve` | Bulk Approve | Menyetujui beberapa komunitas sekaligus |
| `community_approval.bulk_reject` | Bulk Reject | Menolak beberapa komunitas sekaligus |

### 3.5 Community Management Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `community.list` | List Communities | Melihat daftar komunitas |
| `community.view` | View Detail | Melihat detail komunitas |
| `community.suspend` | Suspend | Menangguhkan komunitas |
| `community.reactivate` | Reactivate | Mengaktifkan kembali komunitas |
| `community.delete` | Delete | Menghapus komunitas |
| `community.category.list` | List Categories | Melihat kategori |
| `community.category.create` | Create Category | Membuat kategori |
| `community.category.update` | Update Category | Mengubah kategori |
| `community.category.delete` | Delete Category | Menghapus kategori |
| `community.stats` | View Stats | Melihat statistik komunitas |

### 3.6 Event Management Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `event.list` | List Events | Melihat daftar event |
| `event.view` | View Detail | Melihat detail event |
| `event.approve` | Approve | Menyetujui event |
| `event.cancel` | Cancel | Membatalkan event |
| `event.update` | Update | Mengubah detail event |
| `event.delete` | Delete | Menghapus event |
| `event.view_participants` | View Participants | Melihat peserta event |
| `event.export_participants` | Export Participants | Mengekspor data peserta |

### 3.7 Volunteer Management Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `volunteer.list` | List Volunteers | Melihat daftar volunteer |
| `volunteer.view` | View Detail | Melihat detail volunteer |
| `volunteer.approve` | Approve | Menyetujui pendaftaran volunteer |
| `volunteer.revoke` | Revoke | Mencabut status volunteer |
| `volunteer.assign` | Assign to Event | Menugaskan ke event |
| `volunteer.unassign` | Unassign from Event | Mencabut dari event |
| `volunteer.stats` | View Stats | Melihat statistik volunteer |
| `volunteer.export` | Export | Mengekspor data volunteer |

### 3.8 Moderation Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `moderation.list` | List Reports | Melihat daftar laporan |
| `moderation.view` | View Detail | Melihat detail laporan |
| `moderation.warn` | Warn | Memberikan peringatan |
| `moderation.suspend` | Suspend User | Menangguhkan pengguna |
| `moderation.permanent_suspend` | Permanent Suspend | Menangguhkan permanen |
| `moderation.remove_content` | Remove Content | Menghapus konten |
| `moderation.dismiss` | Dismiss Report | Menolak laporan |
| `moderation.handle_appeal` | Handle Appeal | Menangani banding |
| `moderation.history` | View History | Melihat riwayat moderasi |

### 3.9 CMS Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `cms.page.list` | List Pages | Melihat daftar halaman |
| `cms.page.view` | View Page | Melihat detail halaman |
| `cms.page.create` | Create Page | Membuat halaman |
| `cms.page.update` | Update Page | Mengubah halaman |
| `cms.page.delete` | Delete Page | Menghapus halaman |
| `cms.page.publish` | Publish Page | Mempublikasikan halaman |
| `cms.page.unpublish` | Unpublish Page | Menarik halaman |
| `cms.page.versions` | View Versions | Melihat versi halaman |
| `cms.page.restore_version` | Restore Version | Mengembalikan versi |
| `cms.banner.list` | List Banners | Melihat daftar banner |
| `cms.banner.create` | Create Banner | Membuat banner |
| `cms.banner.update` | Update Banner | Mengubah banner |
| `cms.banner.delete` | Delete Banner | Menghapus banner |
| `cms.media.upload` | Upload Media | Mengunggah media |

### 3.10 Notification Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `notification.list` | List Notifications | Melihat daftar notifikasi |
| `notification.send` | Send Manual | Mengirim notifikasi manual |
| `notification.bulk` | Send Bulk | Mengirim notifikasi massal |
| `notification.template.list` | List Templates | Melihat template |
| `notification.template.create` | Create Template | Membuat template |
| `notification.template.update` | Update Template | Mengubah template |
| `notification.template.delete` | Delete Template | Menghapus template |
| `notification.stats` | View Stats | Melihat statistik |
| `notification.history` | View History | Melihat riwayat kirim |
| `notification.channel.update` | Update Channel | Mengatur channel notifikasi |

### 3.11 Audit Log Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `audit.list` | List Logs | Melihat daftar log |
| `audit.view` | View Log Detail | Melihat detail log |
| `audit.export` | Export Logs | Mengekspor log |
| `audit.stream` | Real-time Stream | Melihat stream real-time |
| `audit.retention` | Configure Retention | Mengatur masa retensi |

### 3.12 Data Master Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `data_master.category.list` | List Categories | Melihat kategori |
| `data_master.category.create` | Create Category | Membuat kategori |
| `data_master.category.update` | Update Category | Mengubah kategori |
| `data_master.category.delete` | Delete Category | Menghapus kategori |
| `data_master.tag.list` | List Tags | Melihat tag |
| `data_master.tag.create` | Create Tag | Membuat tag |
| `data_master.tag.update` | Update Tag | Mengubah tag |
| `data_master.tag.delete` | Delete Tag | Menghapus tag |
| `data_master.skill.list` | List Skills | Melihat skill |
| `data_master.skill.create` | Create Skill | Membuat skill |
| `data_master.skill.update` | Update Skill | Mengubah skill |
| `data_master.skill.delete` | Delete Skill | Menghapus skill |
| `data_master.location.list` | List Locations | Melihat lokasi |
| `data_master.location.create` | Create Location | Membuat lokasi |
| `data_master.location.update` | Update Location | Mengubah lokasi |
| `data_master.location.delete` | Delete Location | Menghapus lokasi |
| `data_master.import` | Import Data | Mengimpor data master |
| `data_master.export` | Export Data | Mengekspor data master |
| `data_master.config` | Platform Config | Mengatur konfigurasi platform |

### 3.13 Security Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `security.session.list` | List Sessions | Melihat sesi aktif |
| `security.session.revoke` | Revoke Session | Mencabut sesi |
| `security.ip_whitelist.view` | View IP Whitelist | Melihat whitelist IP |
| `security.ip_whitelist.update` | Update IP Whitelist | Mengatur whitelist IP |
| `security.rate_limit.view` | View Rate Limit | Melihat rate limiting |
| `security.rate_limit.update` | Update Rate Limit | Mengatur rate limiting |
| `security.password_policy.view` | View Password Policy | Melihat kebijakan password |
| `security.password_policy.update` | Update Password Policy | Mengatur kebijakan password |
| `security.login_attempts.view` | View Login Attempts | Melihat batas percobaan login |
| `security.login_attempts.update` | Update Login Attempts | Mengatur batas percobaan login |
| `security.alerts.view` | View Security Alerts | Melihat alert keamanan |
| `security.alerts.dismiss` | Dismiss Alert | Menutup alert keamanan |

### 3.14 Settings Permissions

| Permission ID | Permission Name | Deskripsi |
|---------------|----------------|-----------|
| `settings.profile.view` | View Profile | Melihat profil admin |
| `settings.profile.update` | Update Profile | Mengubah profil admin |
| `settings.password.change` | Change Password | Mengubah password |
| `settings.notification.view` | View Notification Prefs | Melihat preferensi notifikasi |
| `settings.notification.update` | Update Notification Prefs | Mengatur preferensi notifikasi |
| `settings.platform.view` | View Platform Settings | Melihat pengaturan platform |
| `settings.platform.update` | Update Platform Settings | Mengatur pengaturan platform |
| `settings.email.view` | View Email Settings | Melihat pengaturan email |
| `settings.email.update` | Update Email Settings | Mengatur pengaturan email |
| `settings.email.test` | Test Email | Menguji pengiriman email |
| `settings.appearance.view` | View Appearance | Melihat pengaturan tampilan |
| `settings.appearance.update` | Update Appearance | Mengatur tampilan |

---

## 4. Permission-Role Mapping

### 4.1 SUPER_ADMIN Permissions

SUPER_ADMIN memiliki **semua** permission (140 total) tanpa pengecualian.

```
auth.* = ALL
dashboard.* = ALL
member.* = ALL
community_approval.* = ALL
community.* = ALL
event.* = ALL
volunteer.* = ALL
moderation.* = ALL
cms.* = ALL
notification.* = ALL
audit.* = ALL
data_master.* = ALL
security.* = ALL
settings.* = ALL
```

### 4.2 PLATFORM_ADMIN Permissions

| Permission Group | Granted Permissions | Denied Permissions |
|-----------------|---------------------|-------------------|
| Authentication | `auth.login`, `auth.logout`, `auth.refresh`, `auth.forgot_password`, `auth.reset_password`, `auth.change_password`, `auth.view_login_history`, `auth.enable_2fa`, `auth.disable_2fa` | `auth.view_all_login_history` |
| Dashboard | ALL | - |
| Member Management | `member.list`, `member.search`, `member.view`, `member.deactivate`, `member.reset_password`, `member.export`, `member.view_communities` | `member.reactivate`, `member.assign_role` |
| Community Approval | `community_approval.list`, `community_approval.view`, `community_approval.approve`, `community_approval.revision`, `community_approval.reject`, `community_approval.history` | `community_approval.bulk_approve`, `community_approval.bulk_reject` |
| Community Management | `community.list`, `community.view`, `community.suspend`, `community.category.list`, `community.category.create`, `community.category.update`, `community.stats` | `community.reactivate`, `community.delete`, `community.category.delete` |
| Event Management | `event.list`, `event.view`, `event.approve`, `event.cancel`, `event.update`, `event.view_participants`, `event.export_participants` | `event.delete` |
| Volunteer Management | ALL | - |
| Moderation | `moderation.list`, `moderation.view`, `moderation.warn`, `moderation.suspend`, `moderation.remove_content`, `moderation.dismiss`, `moderation.history` | `moderation.permanent_suspend`, `moderation.handle_appeal` |
| CMS | `cms.page.list`, `cms.page.view`, `cms.page.create`, `cms.page.update`, `cms.page.publish`, `cms.page.unpublish`, `cms.page.versions`, `cms.banner.list`, `cms.banner.create`, `cms.banner.update`, `cms.media.upload` | `cms.page.delete`, `cms.page.restore_version`, `cms.banner.delete` |
| Notifications | `notification.list`, `notification.send`, `notification.template.list`, `notification.template.create`, `notification.template.update`, `notification.stats`, `notification.history` | `notification.bulk`, `notification.template.delete`, `notification.channel.update` |
| Audit Log | - | ALL |
| Data Master | `data_master.category.list`, `data_master.category.create`, `data_master.category.update`, `data_master.tag.list`, `data_master.tag.create`, `data_master.tag.update`, `data_master.skill.list`, `data_master.skill.create`, `data_master.skill.update`, `data_master.location.list`, `data_master.location.create`, `data_master.location.update`, `data_master.export` | `data_master.category.delete`, `data_master.tag.delete`, `data_master.skill.delete`, `data_master.location.delete`, `data_master.import`, `data_master.config` |
| Security | - | ALL |
| Settings | `settings.profile.view`, `settings.profile.update`, `settings.password.change`, `settings.notification.view`, `settings.notification.update`, `settings.platform.view`, `settings.appearance.view` | `settings.platform.update`, `settings.email.view`, `settings.email.update`, `settings.email.test`, `settings.appearance.update` |

### 4.3 MEMBER Permissions

| Permission Group | Granted Permissions | Denied Permissions |
|-----------------|---------------------|-------------------|
| Authentication | `auth.login`, `auth.logout`, `auth.refresh`, `auth.forgot_password`, `auth.reset_password` | ALL admin permissions |
| All Admin Modules | - | ALL |

---

## 5. Scoped Permissions

### 5.1 Community-Scoped Permissions

| Scope | Description | Roles | Permissions |
|-------|-------------|-------|-------------|
| `community:{id}:admin` | Admin komunitas tertentu | COMMUNITY_ADMIN | `community.view` (scoped), `event.view` (scoped), `volunteer.list` (scoped) |
| `community:{id}:member` | Anggota komunitas tertentu | MEMBER | `community.view` (scoped, public data only) |

### 5.2 Event-Scoped Permissions

| Scope | Description | Roles | Permissions |
|-------|-------------|-------|-------------|
| `event:{id}:organizer` | Organizer event tertentu | COMMUNITY_ADMIN | `event.view` (scoped), `event.update` (scoped) |
| `event:{id}:volunteer` | Volunteer event tertentu | MEMBER | `event.view` (scoped, public data only) |

---

## 6. Conditional Access Rules

### 6.1 Time-Based Access

| Rule | Condition | Affected Role | Action |
|------|-----------|---------------|--------|
| Business Hours | Weekdays 08:00-17:00 WIB | ALL | Full access |
| After Hours | Weekdays 17:00-08:00 WIB | PLATFORM_ADMIN | Read-only access, write operations require SUPER_ADMIN approval |
| Weekend | Saturday-Sunday | PLATFORM_ADMIN | Read-only access, critical operations require SUPER_ADMIN approval |

### 6.2 Risk-Based Access

| Risk Level | Condition | Action |
|------------|-----------|--------|
| Low | Normal activity pattern | Allow all permitted operations |
| Medium | 3+ failed login attempts | Require re-authentication for sensitive operations |
| High | Login from new IP/geo | Require 2FA verification |
| Critical | Multiple security alerts | Lock account, require SUPER_ADMIN to unlock |

### 6.3 Resource-Based Access

| Condition | Affected Role | Limitation |
|-----------|---------------|------------|
| Community suspended | COMMUNITY_ADMIN | Lose write access to that community |
| Event cancelled | Event organizer | Lose edit access to that event |
| Volunteer revoked | Volunteer | Lose all volunteer-related access |
| User suspended | MEMBER | Lose all access except login for appeal |

---

## 7. Permission Inheritance

### 7.1 Inheritance Rules

1. **SUPER_ADMIN** inherits all permissions from lower roles
2. **PLATFORM_ADMIN** inherits all permissions from COMMUNITY_ADMIN and MEMBER
3. **COMMUNITY_ADMIN** inherits all permissions from MEMBER
4. **Scoped permissions** do not inherit — they are additive

### 7.2 Override Rules

1. Explicit denial always overrides inheritance
2. Explicit grant overrides implicit denial
3. Role-level permissions override user-level permissions
4. SUPER_ADMIN can override any permission restriction

---

## 8. Permission Check Algorithm

```
function hasPermission(userId, permissionId, resourceId = null):
    user = getUser(userId)
    roles = getUserRoles(userId)
    
    // Check explicit denial at role level
    for role in roles:
        if hasExplicitDenial(role, permissionId):
            return DENIED
    
    // Check explicit grant at role level
    for role in roles:
        if hasExplicitGrant(role, permissionId):
            // Check scoped permission
            if resourceId != null:
                return checkScope(userId, permissionId, resourceId)
            return GRANTED
    
    // Check inheritance
    for role in roles:
        parentRole = getInheritedRole(role)
        if parentRole and hasPermission(parentRole, permissionId):
            return GRANTED
    
    // Default deny
    return DENIED
```

---

## 9. Permission Audit Trail

Setiap permission check yang menghasilkan akses ditolak atau berhasil dijalankan akan dicatat di audit log:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | ID admin yang menjalankan aksi |
| `permission_id` | String | ID permission yang diperiksa |
| `resource_type` | String | Tipe resource yang diakses |
| `resource_id` | UUID | ID resource yang diakses |
| `result` | Enum | `GRANTED`, `DENIED` |
| `reason` | String | Alasan penolakan (jika ada) |
| `ip_address` | String | IP address admin |
| `timestamp` | DateTime | Waktu akses |
