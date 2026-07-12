# Audit Log Matrix - KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan matriks lengkap untuk semua aksi yang dicatat di audit log platform KomunaID. Setiap aksi admin tercatat dengan detail untuk keperluan keamanan, compliance, dan troubleshooting.

---

## 2. Audit Log Schema

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | No | Unique identifier |
| `admin_id` | UUID (FK) | No | ID admin yang melakukan aksi |
| `action` | ENUM | No | Jenis aksi yang dilakukan |
| `resource_type` | ENUM | No | Tipe resource yang diakses |
| `resource_id` | UUID | Yes | ID resource yang diakses |
| `before_data` | JSON | Yes | Data sebelum perubahan |
| `after_data` | JSON | Yes | Data setelah perubahan |
| `ip_address` | VARCHAR(45) | No | IP address admin |
| `user_agent` | VARCHAR(500) | No | User agent browser |
| `timestamp` | DATETIME | No | Waktu aksi dilakukan |
| `session_id` | VARCHAR(100) | Yes | ID sesi admin |

---

## 3. Action Enum Values

| Action Code | Deskripsi | Module |
|-------------|-----------|--------|
| `AUTH_LOGIN_SUCCESS` | Login berhasil | Authentication |
| `AUTH_LOGIN_FAILED` | Login gagal | Authentication |
| `AUTH_LOGOUT` | Logout | Authentication |
| `AUTH_PASSWORD_CHANGED` | Password diubah | Authentication |
| `AUTH_PASSWORD_RESET` | Password direset | Authentication |
| `AUTH_2FA_ENABLED` | 2FA diaktifkan | Authentication |
| `AUTH_2FA_DISABLED` | 2FA dinonaktifkan | Authentication |
| `AUTH_LOGIN_HISTORY_VIEW` | Riwayat login dilihat | Authentication |
| `MEMBER_LIST_VIEW` | Daftar anggota dilihat | Member Management |
| `MEMBER_DETAIL_VIEW` | Detail anggota dilihat | Member Management |
| `MEMBER_DEACTIVATE` | Akun anggota dinonaktifkan | Member Management |
| `MEMBER_REACTIVATE` | Akun anggota diaktifkan kembali | Member Management |
| `MEMBER_PASSWORD_RESET` | Password anggota direset | Member Management |
| `MEMBER_ROLE_CHANGED` | Role anggota diubah | Member Management |
| `MEMBER_EXPORT` | Data anggota diekspor | Member Management |
| `COMMUNITY_APPROVE` | Komunitas disetujui | Community Approval |
| `COMMUNITY_REQUEST_REVISION` | Revisi diminta | Community Approval |
| `COMMUNITY_REJECT` | Komunitas ditolak | Community Approval |
| `COMMUNITY_BULK_APPROVE` | Komunitas disetujui massal | Community Approval |
| `COMMUNITY_BULK_REJECT` | Komunitas ditolak massal | Community Approval |
| `COMMUNITY_SUSPEND` | Komunitas ditangguhkan | Community Management |
| `COMMUNITY_REACTIVATE` | Komunitas diaktifkan kembali | Community Management |
| `COMMUNITY_DELETE` | Komunitas dihapus | Community Management |
| `COMMUNITY_CATEGORY_CREATE` | Kategori dibuat | Community Management |
| `COMMUNITY_CATEGORY_UPDATE` | Kategori diubah | Community Management |
| `COMMUNITY_CATEGORY_DELETE` | Kategori dihapus | Community Management |
| `EVENT_APPROVE` | Event disetujui | Event Management |
| `EVENT_CANCEL` | Event dibatalkan | Event Management |
| `EVENT_UPDATE` | Event diubah | Event Management |
| `EVENT_DELETE` | Event dihapus | Event Management |
| `EVENT_EXPORT_PARTICIPANTS` | Data peserta diekspor | Event Management |
| `VOLUNTEER_APPROVE` | Volunteer disetujui | Volunteer Management |
| `VOLUNTEER_REVOKE` | Volunteer dicabut | Volunteer Management |
| `VOLUNTEER_ASSIGN` | Volunteer ditugaskan ke event | Volunteer Management |
| `VOLUNTEER_UNASSIGN` | Volunteer dicabut dari event | Volunteer Management |
| `VOLUNTEER_EXPORT` | Data volunteer diekspor | Volunteer Management |
| `MODERATION_WARN` | Peringatan diberikan | Moderation |
| `MODERATION_SUSPEND` | Pengguna ditangguhkan | Moderation |
| `MODERATION_PERMANENT_SUSPEND` | Pengguna ditangguhkan permanen | Moderation |
| `MODERATION_REMOVE_CONTENT` | Konten dihapus | Moderation |
| `MODERATION_DISMISS` | Laporan ditolak | Moderation |
| `MODERATION_APPEAL_UPHELD` | Banding ditolak | Moderation |
| `MODERATION_APPEAL_OVERTURNED` | Banding diterima | Moderation |
| `CMS_PAGE_CREATE` | Halaman CMS dibuat | CMS |
| `CMS_PAGE_UPDATE` | Halaman CMS diubah | CMS |
| `CMS_PAGE_DELETE` | Halaman CMS dihapus | CMS |
| `CMS_PAGE_PUBLISH` | Halaman CMS dipublikasikan | CMS |
| `CMS_PAGE_UNPUBLISH` | Halaman CMS ditarik | CMS |
| `CMS_PAGE_RESTORE_VERSION` | Versi halaman dikembalikan | CMS |
| `CMS_BANNER_CREATE` | Banner dibuat | CMS |
| `CMS_BANNER_UPDATE` | Banner diubah | CMS |
| `CMS_BANNER_DELETE` | Banner dihapus | CMS |
| `CMS_MEDIA_UPLOAD` | Media diunggah | CMS |
| `NOTIFICATION_SEND` | Notifikasi manual dikirim | Notifications |
| `NOTIFICATION_BULK_SEND` | Notifikasi massal dikirim | Notifications |
| `NOTIFICATION_TEMPLATE_CREATE` | Template dibuat | Notifications |
| `NOTIFICATION_TEMPLATE_UPDATE` | Template diubah | Notifications |
| `NOTIFICATION_TEMPLATE_DELETE` | Template dihapus | Notifications |
| `NOTIFICATION_CHANNEL_UPDATE` | Channel settings diubah | Notifications |
| `DM_CATEGORY_CREATE` | Kategori data master dibuat | Data Master |
| `DM_CATEGORY_UPDATE` | Kategori data master diubah | Data Master |
| `DM_CATEGORY_DELETE` | Kategori data master dihapus | Data Master |
| `DM_TAG_CREATE` | Tag dibuat | Data Master |
| `DM_TAG_UPDATE` | Tag diubah | Data Master |
| `DM_TAG_DELETE` | Tag dihapus | Data Master |
| `DM_SKILL_CREATE` | Skill dibuat | Data Master |
| `DM_SKILL_UPDATE` | Skill diubah | Data Master |
| `DM_SKILL_DELETE` | Skill dihapus | Data Master |
| `DM_LOCATION_CREATE` | Lokasi dibuat | Data Master |
| `DM_LOCATION_UPDATE` | Lokasi diubah | Data Master |
| `DM_LOCATION_DELETE` | Lokasi dihapus | Data Master |
| `DM_IMPORT` | Data master diimpor | Data Master |
| `DM_EXPORT` | Data master diekspor | Data Master |
| `DM_CONFIG_UPDATE` | Konfigurasi platform diubah | Data Master |
| `SECURITY_SESSION_REVOKE` | Sesi dicabut | Security |
| `SECURITY_IP_WHITELIST_UPDATE` | IP whitelist diubah | Security |
| `SECURITY_RATE_LIMIT_UPDATE` | Rate limiting diubah | Security |
| `SECURITY_PASSWORD_POLICY_UPDATE` | Kebijakan password diubah | Security |
| `SECURITY_LOGIN_ATTEMPTS_UPDATE` | Batas percobaan login diubah | Security |
| `SECURITY_ALERT_DISMISS` | Alert keamanan ditutup | Security |
| `SETTINGS_PROFILE_UPDATE` | Profil admin diubah | Settings |
| `SETTINGS_PLATFORM_UPDATE` | Pengaturan platform diubah | Settings |
| `SETTINGS_EMAIL_UPDATE` | Pengaturan email diubah | Settings |
| `SETTINGS_APPEARANCE_UPDATE` | Pengaturan tampilan diubah | Settings |

---

## 4. Resource Type Enum Values

| Resource Type | Deskripsi | Tabel Database |
|---------------|-----------|----------------|
| `USER` | Pengguna/anggota | `users` |
| `COMMUNITY` | Komunitas | `communities` |
| `COMMUNITY_APPROVAL` | Pengajuan komunitas | `community_approvals` |
| `COMMUNITY_CATEGORY` | Kategori komunitas | `community_categories` |
| `EVENT` | Event | `events` |
| `VOLUNTEER` | Volunteer | `volunteers` |
| `VOLUNTEER_ASSIGNMENT` | Penugasan volunteer | `volunteer_assignments` |
| `REPORT` | Laporan moderasi | `reports` |
| `CMS_PAGE` | Halaman CMS | `cms_pages` |
| `CMS_BANNER` | Banner CMS | `cms_banners` |
| `CMS_MEDIA` | Media CMS | `cms_media` |
| `NOTIFICATION` | Notifikasi | `notifications` |
| `NOTIFICATION_TEMPLATE` | Template notifikasi | `notification_templates` |
| `DATA_MASTER_CATEGORY` | Kategori data master | `data_master_categories` |
| `DATA_MASTER_TAG` | Tag data master | `data_master_tags` |
| `DATA_MASTER_SKILL` | Skill data master | `data_master_skills` |
| `DATA_MASTER_LOCATION` | Lokasi data master | `data_master_locations` |
| `PLATFORM_CONFIG` | Konfigurasi platform | `platform_config` |
| `SECURITY_SESSION` | Sesi keamanan | `admin_sessions` |
| `SECURITY_IP_WHITELIST` | IP whitelist | `ip_whitelist` |
| `SECURITY_RATE_LIMIT` | Rate limiting config | `rate_limit_config` |
| `SECURITY_PASSWORD_POLICY` | Kebijakan password | `password_policy` |
| `ADMIN_PROFILE` | Profil admin | `admins` |
| `LOGIN_HISTORY` | Riwayat login | `login_history` |

---

## 5. Before/After Data Patterns

### 5.1 Member Deactivate

| Field | before_data | after_data |
|-------|-------------|------------|
| `status` | `"ACTIVE"` | `"INACTIVE"` |
| `deactivated_at` | `null` | `"2026-07-11T12:00:00Z"` |
| `deactivated_by` | `null` | `"admin-uuid"` |
| `deactivation_reason` | `null` | `"Melanggar kebijakan platform"` |

### 5.2 Member Role Change

| Field | before_data | after_data |
|-------|-------------|------------|
| `role` | `"MEMBER"` | `"COMMUNITY_ADMIN"` |
| `role_changed_at` | `"2026-01-01T00:00:00Z"` | `"2026-07-11T12:00:00Z"` |
| `role_changed_by` | `"prev-admin-uuid"` | `"admin-uuid"` |

### 5.3 Community Approval

| Field | before_data | after_data |
|-------|-------------|------------|
| `status` | `"PENDING_REVIEW"` | `"APPROVED"` |
| `approved_at` | `null` | `"2026-07-11T12:00:00Z"` |
| `approved_by` | `null` | `"admin-uuid"` |
| `community_id` | `null` | `"new-community-uuid"` |

### 5.4 Community Suspend

| Field | before_data | after_data |
|-------|-------------|------------|
| `status` | `"ACTIVE"` | `"SUSPENDED"` |
| `suspended_at` | `null` | `"2026-07-11T12:00:00Z"` |
| `suspended_by` | `null` | `"admin-uuid"` |
| `suspension_reason` | `null` | `"Konten melanggar kebijakan"` |

### 5.5 Event Cancel

| Field | before_data | after_data |
|-------|-------------|------------|
| `status` | `"UPCOMING"` | `"CANCELLED"` |
| `cancelled_at` | `null` | `"2026-07-11T12:00:00Z"` |
| `cancelled_by` | `null` | `"admin-uuid"` |
| `cancellation_reason` | `null` | `"Penyelenggara membatalkan"` |
| `participant_count` | `25` | `25` (unchanged) |

### 5.6 Volunteer Assign

| Field | before_data | after_data |
|-------|-------------|------------|
| `event_id` | `null` | `"event-uuid"` |
| `assigned_at` | `null` | `"2026-07-11T12:00:00Z"` |
| `assigned_by` | `null` | `"admin-uuid"` |
| `role_in_event` | `null` | `"general"` |

### 5.7 Moderation Warning

| Field | before_data | after_data |
|-------|-------------|------------|
| `warning_count` | `1` | `2` |
| `warning_level` | `1` | `2` |
| `last_warning_at` | `"2026-06-01T00:00:00Z"` | `"2026-07-11T12:00:00Z"` |
| `violation_type` | `"SPAM"` | `"SPAM"` |
| `description` | `null` | `"Spam posting di komunitas"` |

### 5.8 Moderation Suspend

| Field | before_data | after_data |
|-------|-------------|------------|
| `status` | `"ACTIVE"` | `"SUSPENDED"` |
| `suspended_at` | `null` | `"2026-07-11T12:00:00Z"` |
| `suspended_until` | `null` | `"2026-07-18T12:00:00Z"` |
| `suspension_reason` | `null` | `"3 pelanggaran dalam 30 hari"` |

### 5.9 CMS Page Publish

| Field | before_data | after_data |
|-------|-------------|------------|
| `status` | `"DRAFT"` | `"PUBLISHED"` |
| `published_at` | `null` | `"2026-07-11T12:00:00Z"` |
| `published_by` | `null` | `"admin-uuid"` |
| `version` | `1` | `2` |

### 5.10 CMS Page Update

| Field | before_data | after_data |
|-------|-------------|------------|
| `title` | `"FAQ"` | `"FAQ Updated"` |
| `content` | `"<p>Old content</p>"` | `"<p>New content</p>"` |
| `version` | `1` | `2` |
| `updated_at` | `"2026-07-01T00:00:00Z"` | `"2026-07-11T12:00:00Z"` |

### 5.11 CMS Banner Create

| Field | before_data | after_data |
|-------|-------------|------------|
| `title` | `null` | `"Summer Campaign"` |
| `image_url` | `null` | `"/uploads/banners/summer.jpg"` |
| `target_url` | `null` | `"/events/summer-2026"` |
| `order` | `null` | `1` |
| `is_active` | `null` | `true` |

### 5.12 Platform Config Update

| Field | before_data | after_data |
|-------|-------------|------------|
| `platform_name` | `"KomunaID"` | `"KomunaID v2"` |
| `platform_description` | `"Old description"` | `"New description"` |
| `contact_email` | `"old@komuna.id"` | `"new@komuna.id"` |

### 5.13 Security Session Revoke

| Field | before_data | after_data |
|-------|-------------|------------|
| `session_id` | `"session-uuid"` | `"session-uuid"` |
| `ip_address` | `"192.168.1.1"` | `"192.168.1.1"` |
| `user_agent` | `"Mozilla/5.0..."` | `"Mozilla/5.0..."` |
| `last_active` | `"2026-07-11T11:50:00Z"` | `"2026-07-11T12:00:00Z"` |

### 5.14 Settings Profile Update

| Field | before_data | after_data |
|-------|-------------|------------|
| `name` | `"Admin Lama"` | `"Admin Baru"` |
| `avatar_url` | `"/avatars/old.jpg"` | `"/avatars/new.jpg"` |
| `bio` | `"Old bio"` | `"New bio"` |

---

## 6. Audit Log Filtering

### 6.1 Filter Options

| Filter | Type | Operators | Description |
|--------|------|-----------|-------------|
| `admin_id` | UUID | eq, in | Filter berdasarkan admin |
| `action` | ENUM | eq, in | Filter berdasarkan jenis aksi |
| `resource_type` | ENUM | eq, in | Filter berdasarkan tipe resource |
| `resource_id` | UUID | eq | Filter berdasarkan resource spesifik |
| `timestamp` | DateTime | gte, lte, between | Filter berdasarkan rentang waktu |
| `ip_address` | String | eq, contains | Filter berdasarkan IP |

### 6.2 Sort Options

| Sort | Default | Description |
|------|---------|-------------|
| `timestamp` | DESC | Waktu aksi |
| `admin_id` | ASC | ID admin |
| `action` | ASC | Jenis aksi |

---

## 7. Audit Log Retention

| Policy | Value | Description |
|--------|-------|-------------|
| Default Retention | 365 hari | Log dihapus setelah 365 hari |
| Minimum Retention | 90 hari | Tidak bisa diatur kurang dari 90 hari |
| Maximum Retention | 3650 hari (10 tahun) | Maksimal masa retensi |
| Archival | Setelah retensi | Log diarsipkan ke cold storage |
| Deletion | Manual by SUPER_ADMIN | Hapus log secara manual |

---

## 8. Audit Log Export

### 8.1 Export Format

| Format | Extension | Description |
|--------|-----------|-------------|
| CSV | `.csv` | Comma-separated values |
| JSON | `.json` | JSON array of log entries |

### 8.2 CSV Columns

| Column | Header | Description |
|--------|--------|-------------|
| ID | `id` | Unique identifier |
| Timestamp | `timestamp` | Waktu aksi (ISO 8601) |
| Admin ID | `admin_id` | ID admin |
| Admin Name | `admin_name` | Nama admin |
| Action | `action` | Jenis aksi |
| Resource Type | `resource_type` | Tipe resource |
| Resource ID | `resource_id` | ID resource |
| Before Data | `before_data` | Data sebelum (JSON string) |
| After Data | `after_data` | Data setelah (JSON string) |
| IP Address | `ip_address` | IP address |
| User Agent | `user_agent` | Browser user agent |
| Session ID | `session_id` | ID sesi |

### 8.3 Export Limits

| Limit | Value | Description |
|-------|-------|-------------|
| Max rows per export | 100,000 | Batas baris per export |
| Max date range | 90 hari | Maksimal rentang waktu per export |
| Concurrent exports | 1 | Hanya 1 export per admin dalam waktu bersamaan |

---

## 9. Real-time Stream

### 9.1 Stream Configuration

| Property | Value |
|----------|-------|
| Protocol | WebSocket (`ws://`) or Server-Sent Events (`/events`) |
| Endpoint | `/api/v1/admin/audit-logs/stream` |
| Authentication | JWT token required |
| Role Required | SUPER_ADMIN only |
| Buffer Size | 100 events |
| Reconnect Interval | 5 seconds |

### 9.2 Stream Event Format

```json
{
  "event": "audit_log",
  "data": {
    "id": "uuid",
    "admin_id": "uuid",
    "admin_name": "Admin Name",
    "action": "MEMBER_DEACTIVATE",
    "resource_type": "USER",
    "resource_id": "uuid",
    "before_data": { "status": "ACTIVE" },
    "after_data": { "status": "INACTIVE" },
    "ip_address": "192.168.1.1",
    "timestamp": "2026-07-11T12:00:00Z"
  }
}
```

---

## 10. Audit Log Integrity

### 10.1 Immutability Rules

| Rule | Description |
|------|-------------|
| No Deletion | Audit log tidak dapat dihapus oleh siapapun termasuk SUPER_ADMIN |
| No Modification | Audit log tidak dapat dimodifikasi setelah ditulis |
| No Update | Field audit log tidak dapat di-update |
| Append Only | Hanya operasi INSERT yang diizinkan |

### 10.2 Integrity Check

| Check | Frequency | Action |
|-------|-----------|--------|
| Hash Verification | Setiap akses | Verifikasi hash integrity |
| Sequence Check | Setiap write | Pastikan ID monotonik |
| Timestamp Check | Setiap write | Pastikan timestamp >= previous |
| Missing Entries | Setiap jam | Deteksi gap dalam sequence |
