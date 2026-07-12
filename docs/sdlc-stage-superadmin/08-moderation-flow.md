# Moderation Flow - KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan alur moderasi untuk menangani konten dan perilaku yang melanggar kebijakan platform KomunaID. Moderasi mencakup laporan dari pengguna, review oleh admin, tindakan yang diambil, dan proses banding (appeal).

---

## 2. State Definitions

| State | Kode | Deskripsi | Aksi yang Tersedia |
|-------|------|-----------|---------------------|
| Reported | `REPORTED` | Laporan baru masuk, belum ditinjau | Review, Dismiss |
| Under Review | `UNDER_REVIEW` | Laporan sedang ditinjau oleh admin | Warn, Suspend, Remove Content, Dismiss |
| Warning | `WARNING` | Peringatan telah diberikan ke pengguna | Appeal (oleh pengguna) |
| Suspended | `SUSPENDED` | Pengguna ditangguhkan sementara | Appeal (oleh pengguna) |
| Permanent Suspended | `PERMANENT_SUSPENDED` | Pengguna ditangguhkan permanen | Appeal (oleh pengguna, SUPER_ADMIN only) |
| Dismissed | `DISMISSED` | Laporan ditolak, tidak melanggar | None (final state) |
| Appeal Pending | `APPEAL_PENDING` | Pengguna mengajukan banding | Handle Appeal (oleh admin) |
| Appeal Upheld | `APPEAL_UPHELD` | Banding ditolak, keputusan tetap | None (final state) |
| Appeal Overturned | `APPEAL_OVERTURNED` | Banding diterima, keputusan dibatalkan | None (final state) |

---

## 3. State Diagram

```
                     +---------------+
                     |   REPORTED    |
                     | (Laporan baru |
                     |     masuk)    |
                     +------+--------+
                            |
                   [Admin Review]
                            |
               +------------+------------+
               |                         |
               v                         v
     +------------------+      +------------------+
     |  UNDER_REVIEW    |      |   DISMISSED      |
     | (Sedang ditinjau)|      | (Laporan ditolak) |
     +--------+---------+      +------------------+
              |
    +---------+---------+---------+
    |         |         |         |
    v         v         v         v
+--------+ +--------+ +--------+ +-------------------+
| WARNING| |SUSPENDED| |REMOVE | |PERMANENT_         |
|        | |        | |CONTENT | |SUSPENDED          |
+---+----+ +---+----+ +--------+ +-------------------+
    |           |                        |
    +-----------+------------------------+
                |
         [User Appeal]
                |
                v
     +------------------+
     |  APPEAL_PENDING  |
     | (Menunggu review |
     |     banding)     |
     +--------+---------+
              |
    +---------+---------+
    |                   |
    v                   v
+------------------+ +------------------+
| APPEAL_UPHELD    | | APPEAL_OVERTURNED|
| (Banding ditolak)| | (Banding diterima)|
+------------------+ +------------------+
```

---

## 4. Detailed Flow

### 4.1 Report Submission (oleh Pengguna)

| Step | Aksi | Input | Output | Validasi |
|------|------|-------|--------|----------|
| 1 | Pengguna menemukan konten pelanggaran | - | - | - |
| 2 | Pengguna klik "Report" | - | Tampilkan form laporan | - |
| 3 | Pengguna mengisi form | violation_type, description, evidence | Form terisi | Violation type wajib, description min 20 karakter |
| 4 | Pengguna submit laporan | - | Status: REPORTED | Tidak boleh melaporkan diri sendiri |
| 5 | Sistem mencatat laporan | - | Record di tabel reports | - |
| 6 | Sistem notifikasi ke admin | - | Email + in-app ke semua PLATFORM_ADMIN+ | - |
| 7 | Dashboard badge update | - | Moderation queue count bertambah | - |

### 4.2 Admin Review

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin mengakses `/admin/moderation` | - | Daftar laporan masuk |
| 2 | Admin melihat detail laporan | report_id | Konten dilaporkan, bukti, histori pengguna |
| 3 | Admin meninjau konten | - | Verifikasi pelanggaran |
| 4 | Admin mengambil tindakan | - | Warn / Suspend / Remove Content / Dismiss |
| 5 | Status update | UNDER_REVIEW -> action taken | Record perubahan |

### 4.3 Issue Warning

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin klik "Issue Warning" | - | Tampilkan form peringatan |
| 2 | Admin mengisi detail | description (wajib), violation_type | Form terisi |
| 3 | Cek violation history | user_id | Level peringatan: 1, 2, atau 3 |
| 4 | Admin konfirmasi | - | Kirim `POST /api/v1/admin/moderations/:id/warn` |
| 5 | Update status | UNDER_REVIEW -> WARNING | Peringatan terekam |
| 6 | Increment warning counter | user.warning_count + 1 | Level naik setiap 3 peringatan |
| 7 | Record audit log | - | admin_id, action: WARN, user_id, warning_level |
| 8 | Kirim notifikasi ke pengguna | - | Email + in-app: detail peringatan |
| 9 | Jika warning_count >= 3 | - | Rekomendasikan suspend |

### 4.4 Suspend User

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin klik "Suspend User" | - | Tampilkan form suspend |
| 2 | Admin mengisi detail | duration_days, reason (wajib) | Form terisi |
| 3 | Cek pelanggaran sebelumnya | user_id | >= 3 pelanggaran dalam 30 hari = permanent suspend |
| 4 | Admin konfirmasi | - | Kirim `POST /api/v1/admin/moderations/:id/suspend` |
| 5 | Update user status | status -> SUSPENDED | User tidak dapat login |
| 6 | Set suspension expiry | expires_at = now + duration | Auto re-enable setelah durasi |
| 7 | Record audit log | - | admin_id, action: SUSPEND, duration, reason |
| 8 | Kirim notifikasi ke pengguna | - | Email: akun ditangguhkan, durasi, alasan |

### 4.5 Permanent Suspend

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin klik "Permanent Suspend" | - | Tampilkan confirmation modal (SUPER_ADMIN only) |
| 2 | Admin mengisi alasan | reason (wajib) | Form terisi |
| 3 | Admin konfirmasi | - | Kirim `POST /api/v1/admin/moderations/:id/permanent-suspend` |
| 4 | Update user status | status -> PERMANENT_SUSPENDED | User tidak dapat login selamanya |
| 5 | Record audit log | - | admin_id, action: PERMANENT_SUSPEND, reason |
| 6 | Kirim notifikasi ke pengguna | - | Email: akun ditangguhkan permanen |

### 4.6 Remove Content

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin klik "Remove Content" | - | Tampilkan confirmation modal |
| 2 | Admin konfirmasi | - | Kirim `DELETE /api/v1/admin/moderations/:id/content` |
| 3 | Hapus konten | - | Konten dihapus dari database dan storage |
| 4 | Record audit log | - | admin_id, action: REMOVE_CONTENT, content_type, content_id |
| 5 | Kirim notifikasi ke pengguna | - | Email: konten dihapus |
| 6 | Update report status | - | Status berubah sesuai tindakan |

### 4.7 Dismiss Report

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin klik "Dismiss Report" | - | Tampilkan form dismissal |
| 2 | Admin mengisi alasan | reason (opsional) | Form terisi |
| 3 | Admin konfirmasi | - | Kirim `POST /api/v1/admin/moderations/:id/dismiss` |
| 4 | Update report status | UNDER_REVIEW -> DISMISSED | Laporan ditutup |
| 5 | Record audit log | - | admin_id, action: DISMISS, reason |
| 6 | Kirim notifikasi ke pelapor | - | Email: laporan ditolak |

---

## 5. Appeal Flow

### 5.1 Appeal Submission (oleh Pengguna)

| Step | Aksi | Input | Output | Validasi |
|------|------|-------|--------|----------|
| 1 | Pengguna menerima notifikasi suspend | - | Detail suspend | - |
| 2 | Pengguna mengklik "Appeal" | - | Tampilkan form banding | Harus dalam 7 hari setelah suspend |
| 3 | Pengguna mengisi form | appeal_reason (wajib), evidence | Form terisi | Min 50 karakter |
| 4 | Pengguna submit banding | - | Status: APPEAL_PENDING | Hanya 1 appeal per suspend |
| 5 | Sistem notifikasi ke SUPER_ADMIN | - | Email + in-app | - |

### 5.2 Appeal Review (oleh SUPER_ADMIN)

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | SUPER_ADMIN mengakses appeal | appeal_id | Detail banding |
| 2 | Review original decision | report_id | Konteks pelanggaran awal |
| 3 | Review evidence | - | Bukti yang disertakan pengguna |
| 4 | Make decision | - | Uphold / Overturn |
| 5 | If Uphold | - | Banding ditolak, status tetap |
| 6 | If Overturn | - | Banding diterima, status dibatalkan |

### 5.3 Appeal Decision

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | SUPER_ADMIN konfirmasi keputusan | - | Kirim `PUT /api/v1/admin/moderations/:id/appeal` |
| 2a | If Uphold | - | Status: APPEAL_UPHELD |
| 2b | If Overturn | - | Status: APPEAL_OVERTURNED, user diaktifkan kembali |
| 3 | Record audit log | - | admin_id, action: APPEAL_UPHELD/APPEAL_OVERTURNED |
| 4 | Kirim notifikasi ke pengguna | - | Email: hasil banding |

---

## 6. Notification Flow

### 6.1 Notification Matrix

| Event | Recipient | Channel | Priority | Template |
|-------|-----------|---------|----------|----------|
| New report submitted | PLATFORM_ADMIN+ | Email + In-App | High | `moderation_new_report` |
| Warning issued | Reported user | Email + In-App | High | `moderation_warning` |
| User suspended | Suspended user | Email + In-App | Critical | `moderation_suspended` |
| Permanent suspend | Suspended user | Email + In-App | Critical | `moderation_permanent_suspend` |
| Content removed | Content owner | Email + In-App | High | `moderation_content_removed` |
| Report dismissed | Reporter | Email + In-App | Medium | `moderation_report_dismissed` |
| Appeal submitted | SUPER_ADMIN | Email + In-App | High | `moderation_appeal_submitted` |
| Appeal upheld | Appellant | Email + In-App | High | `moderation_appeal_upheld` |
| Appeal overturned | Appellant | Email + In-App | High | `moderation_appeal_overturned` |

### 6.2 Email Templates

#### Warning Email

```
Subject: [KomunaID] Peringatan Moderasi

Halo {user_name},

Akun Anda telah menerima peringatan moderasi karena:
{violation_type}

Detail: {description}

Level peringatan saat ini: {warning_level}/3

Harap mematuhi kebijakan platform KomunaID. Pelanggaran berulang dapat mengakibatkan penangguhan akun.

Salam,
Tim Moderasi KomunaID
```

#### Suspension Email

```
Subject: [KomunaID] Akun Ditangguhkan

Halo {user_name},

Akun Anda telah ditangguhkan selama {duration_days} hari.
Alasan: {reason}

Akun Anda akan diaktifkan kembali pada: {expires_at}

Anda dapat mengajukan banding dalam 7 hari melalui: {appeal_url}

Salam,
Tim Moderasi KomunaID
```

---

## 7. Violation Level System

### 7.1 Warning Level Escalation

| Level | Trigger | Duration | Effect |
|-------|---------|----------|--------|
| Level 1 | First violation | - | Warning only |
| Level 2 | Second violation | - | Warning + restricted features |
| Level 3 | Third violation | - | Warning + mandatory review |
| Auto-Suspend | 3 violations in 30 days | 7 days | Temporary suspension |
| Permanent Suspend | >= 3 suspensions in 90 days | Indefinite | SUPER_ADMIN approval required |

### 7.2 Violation Types

| Type | Description | Base Severity |
|------|-------------|---------------|
| SPAM | Spam content atau promosi | Low |
| HARASSMENT | Pelecehan atau bullying | High |
| HATE_SPEECH | Ujaran kebencian | Critical |
| INAPPROPRIATE_CONTENT | Konten tidak pantas | Medium |
| MISINFORMATION | Informasi menyesatkan | Medium |
| COPYRIGHT_VIOLATION | Pelanggaran hak cipta | Medium |
| SCAM | Penipuan | Critical |
| OTHER | Lainnya | Low |

---

## 8. API Endpoints

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|-------------|
| `/api/v1/admin/moderations` | GET | List reports | query: page, limit, status, violation_type |
| `/api/v1/admin/moderations/:id` | GET | Get report detail | - |
| `/api/v1/admin/moderations/:id/warn` | POST | Issue warning | { description: string, violation_type: string } |
| `/api/v1/admin/moderations/:id/suspend` | POST | Suspend user | { duration_days: number, reason: string } |
| `/api/v1/admin/moderations/:id/permanent-suspend` | POST | Permanent suspend | { reason: string } |
| `/api/v1/admin/moderations/:id/content` | DELETE | Remove content | - |
| `/api/v1/admin/moderations/:id/dismiss` | POST | Dismiss report | { reason?: string } |
| `/api/v1/admin/moderations/:id/appeal` | PUT | Handle appeal | { decision: 'UPHELD' \| 'OVERTURNED', notes?: string } |
| `/api/v1/admin/moderations/history/:userId` | GET | Get user moderation history | - |

---

## 9. Audit Log Format

### 9.1 Warning Action

```json
{
  "admin_id": "uuid",
  "action": "MODERATION_WARN",
  "resource_type": "USER",
  "resource_id": "user-uuid",
  "before_data": {
    "warning_count": 1
  },
  "after_data": {
    "warning_count": 2,
    "warning_level": 2,
    "description": "Spam posting di komunitas"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2026-07-11T12:00:00Z"
}
```

### 9.2 Suspension Action

```json
{
  "admin_id": "uuid",
  "action": "MODERATION_SUSPEND",
  "resource_type": "USER",
  "resource_id": "user-uuid",
  "before_data": {
    "status": "ACTIVE"
  },
  "after_data": {
    "status": "SUSPENDED",
    "duration_days": 7,
    "expires_at": "2026-07-18T12:00:00Z",
    "reason": "3 pelanggaran dalam 30 hari"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2026-07-11T12:00:00Z"
}
```

### 9.3 Appeal Decision

```json
{
  "admin_id": "super-admin-uuid",
  "action": "MODERATION_APPEAL_OVERTURNED",
  "resource_type": "REPORT",
  "resource_id": "report-uuid",
  "before_data": {
    "status": "SUSPENDED",
    "suspension_reason": "Spam posting"
  },
  "after_data": {
    "status": "ACTIVE",
    "appeal_decision": "OVERTURNED",
    "appeal_notes": "Bukti menunjukkan konten tidak melanggar kebijakan"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2026-07-11T12:00:00Z"
}
```

---

## 10. Rate Limiting

| Action | Rate Limit | Window | Penalty |
|--------|------------|--------|---------|
| Submit report | 5 reports per user per day | 24 hours | Report blocked |
| Submit appeal | 1 appeal per suspension | Per suspension | Appeal blocked |
| Review report | No limit | - | - |
| Issue warning | No limit | - | - |
| Suspend user | 10 suspensions per admin per day | 24 hours | Requires SUPER_ADMIN approval |
