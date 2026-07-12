# Community Approval Flow - KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan alur persetujuan komunitas (Community Approval Workflow) di platform KomunaID. Setiap komunitas baru yang diajukan oleh pengguna harus melalui proses review oleh admin sebelum dapat aktif di platform.

---

## 2. State Definitions

| State | Kode | Deskripsi | Aksi yang Tersedia |
|-------|------|-----------|---------------------|
| Draft | `DRAFT` | Komunitas sedang disiapkan oleh pengaju | Submit for Review |
| Pending Review | `PENDING_REVIEW` | Komunitas menunggu review admin | Approve, Request Revision, Reject |
| Approved | `APPROVED` | Komunitas telah disetujui dan aktif | Suspend (oleh Community Management) |
| Need Revision | `NEED_REVISION` | Komunitas perlu perbaikan dari pengaju | Resubmit (oleh pengaju) |
| Rejected | `REJECTED` | Komunitas ditolak permanen | None (final state) |

---

## 3. State Diagram

```
                    +-------------------+
                    |       DRAFT       |
                    | (Disiapkan oleh   |
                    |     pengaju)      |
                    +--------+----------+
                             |
                    [Submit for Review]
                             |
                             v
                    +-------------------+
          +-------->|  PENDING_REVIEW   |<--------+
          |         | (Menunggu review  |         |
          |         |      admin)       |         |
          |         +--------+----------+         |
          |                  |                    |
          |    +-------------+-------------+      |
          |    |             |             |      |
          |    v             v             v      |
   +----------+    +---------------+  +----------+
   | APPROVED |    | NEED_REVISION |  | REJECTED |
   | (Komunitas|   | (Perlu        |  | (Komunitas|
   |  aktif)  |    |  perbaikan)   |  |  ditolak) |
   +----------+    +-------+-------+  +----------+
                         |
              [Pengaju memperbaiki
               dan submit ulang]
                         |
                         +------------------+
                          (kembali ke
                           PENDING_REVIEW)
```

---

## 4. Detailed Flow

### 4.1 Pengajuan Komunitas (oleh Pengguna)

| Step | Aksi | Input | Output | Validasi |
|------|------|-------|--------|----------|
| 1 | Pengguna mengisi form komunitas | nama, deskripsi, kategori, anggota pendiri | Data komunitas | Nama unik, deskripsi minimal 50 karakter |
| 2 | Menyimpan sebagai draft | - | Status: DRAFT | - |
| 3 | Pengguna submit untuk review | - | Status: DRAFT -> PENDING_REVIEW | Minimal 1 anggota pendiri |
| 4 | Sistem mengirim notifikasi ke admin | - | Email ke semua PLATFORM_ADMIN+ | - |
| 5 | Komunitas masuk antrian review | - | Muncul di dashboard pending count | - |

### 4.2 Review oleh Admin

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin mengakses `/admin/communities/approval` | - | Daftar komunitas pending |
| 2 | Admin mengklik nama komunitas | community_id | Navigate ke detail |
| 3 | Sistem menampilkan detail | - | Nama, deskripsi, kategori, anggota pendiri, tanggal pengajuan |
| 4 | Admin meninjau informasi | - | Verifikasi kesesuaian dengan kebijakan platform |
| 5 | Admin memilih keputusan | - | Approve / Request Revision / Reject |

### 4.3 Approve

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin klik "Approve" | - | Tampilkan confirmation modal |
| 2 | Admin mengonfirmasi | - | Kirim `POST /api/v1/admin/community-approvals/:id/approve` |
| 3 | Backend memvalidasi | - | Cek status saat ini = PENDING_REVIEW |
| 4 | Update status komunitas | status -> APPROVED | Record communities dibuat |
| 5 | Assign Community Admin | - | Pengaju otomatis menjadi Community Admin |
| 6 | Record audit log | - | admin_id, action: APPROVE, community_id, timestamp |
| 7 | Kirim notifikasi ke pengaju | - | Email: "Komunitas Anda telah disetujui!" |
| 8 | Update dashboard badge | - | Kurangi pending count |
| 9 | Refresh approval list | - | Komunitas tidak lagi di daftar pending |

### 4.4 Request Revision

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin klik "Request Revision" | - | Tampilkan form revisi |
| 2 | Admin mengisi catatan | notes (wajib), specific_changes | Form terisi |
| 3 | Admin submit revisi | - | Kirim `POST /api/v1/admin/community-approvals/:id/revision` |
| 4 | Update status komunitas | status -> NEED_REVISION | Komunitas dikembalikan |
| 5 | Record audit log | - | admin_id, action: REQUEST_REVISION, notes |
| 6 | Kirim notifikasi ke pengaju | - | Email: "Komunitas perlu revisi" dengan catatan |
| 7 | Update dashboard badge | - | Kurangi pending count |
| 8 | Pengaju memperbaiki data | - | Status berubah ke PENDING_REVIEW saat resubmit |

### 4.5 Reject

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Admin klik "Reject" | - | Tampilkan form penolakan |
| 2 | Admin mengisi alasan | reason (wajib) | Form terisi |
| 3 | Admin mengonfirmasi penolakan | - | Kirim `POST /api/v1/admin/community-approvals/:id/reject` |
| 4 | Update status komunitas | status -> REJECTED | Final state |
| 5 | Record audit log | - | admin_id, action: REJECT, reason |
| 6 | Kirim notifikasi ke pengaju | - | Email: "Komunitas ditolak" dengan alasan |
| 7 | Update dashboard badge | - | Kurangi pending count |

---

## 5. State Transition Table

| Current State | Trigger | Next State | Actor | Notes |
|---------------|---------|------------|-------|-------|
| DRAFT | Submit for Review | PENDING_REVIEW | Pengaju | Komunitas masuk antrian |
| PENDING_REVIEW | Approve | APPROVED | Admin | Komunitas aktif |
| PENDING_REVIEW | Request Revision | NEED_REVISION | Admin | Komunitas dikembalikan |
| PENDING_REVIEW | Reject | REJECTED | Admin | Komunitas ditolak permanen |
| NEED_REVISION | Resubmit | PENDING_REVIEW | Pengaju | Setelah perbaikan |
| APPROVED | Suspend | SUSPENDED | Admin | Via Community Management |
| SUSPENDED | Reactivate | APPROVED | SUPER_ADMIN | Via Community Management |

---

## 6. Notification Flow

### 6.1 Email Notifications

| Event | Recipient | Template | Subject |
|-------|-----------|----------|---------|
| Submitted for Review | All PLATFORM_ADMIN+ | `community_submitted` | "[KomunaID] Komunitas baru menunggu persetujuan: {community_name}" |
| Approved | Pengaju (Community Admin) | `community_approved` | "[KomunaID] Komunitas Anda telah disetujui!" |
| Request Revision | Pengaju | `community_revision` | "[KomunaID] Komunitas perlu revisi: {community_name}" |
| Rejected | Pengaju | `community_rejected` | "[KomunaID] Komunitas ditolak: {community_name}" |

### 6.2 In-App Notifications

| Event | Target | Priority | Auto-dismiss |
|-------|--------|----------|-------------|
| New community pending | PLATFORM_ADMIN+ | High | No |
| Community approved | Pengaju | High | No |
| Revision requested | Pengaju | Medium | No |
| Community rejected | Pengaju | High | No |

---

## 7. Validation Rules

### 7.1 Submission Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| nama | Required, 3-100 chars, unique | "Nama komunitas wajib diisi (3-100 karakter)" |
| deskripsi | Required, min 50 chars | "Deskripsi minimal 50 karakter" |
| kategori | Required, must exist | "Kategori wajib dipilih" |
| anggota_pendiri | Required, min 1 person | "Minimal 1 anggota pendiri" |
| logo | Optional, max 5MB, JPG/PNG/WebP | "Logo maksimal 5MB" |

### 7.2 Approval Validation

| Condition | Rule | Error |
|-----------|------|-------|
| Status check | Must be PENDING_REVIEW | "Status komunitas tidak valid" |
| Admin role | Must be PLATFORM_ADMIN+ | "Tidak memiliki akses" |
| Duplicate approval | Cannot approve twice | "Sudah disetujui" |

---

## 8. API Endpoints

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|-------------|
| `/api/v1/admin/community-approvals` | GET | List pending communities | query: page, limit, search |
| `/api/v1/admin/community-approvals/:id` | GET | Get community detail | - |
| `/api/v1/admin/community-approvals/:id/approve` | POST | Approve community | { notes?: string } |
| `/api/v1/admin/community-approvals/:id/revision` | POST | Request revision | { notes: string, specific_changes?: string } |
| `/api/v1/admin/community-approvals/:id/reject` | POST | Reject community | { reason: string } |
| `/api/v1/admin/community-approvals/:id/history` | GET | Get approval history | - |
| `/api/v1/admin/community-approvals/bulk-approve` | POST | Bulk approve | { ids: string[], notes?: string } |
| `/api/v1/admin/community-approvals/bulk-reject` | POST | Bulk reject | { ids: string[], reason: string } |

---

## 9. Dashboard Integration

### 9.1 Pending Count Badge

- Sidebar item "Communities > Approval" menampilkan badge dengan jumlah komunitas `PENDING_REVIEW`
- Dashboard card "Pending Reviews" menampilkan jumlah yang sama
- Badge di-refresh setiap 60 detik

### 9.2 Quick Action

- Dashboard menyediakan tombol "Review" langsung ke halaman approval
- Approval list menampilkan komunitas terbaru di atas (sorted by created_at ASC)

---

## 10. Audit Log Format

### 10.1 Approve Action

```json
{
  "admin_id": "uuid",
  "action": "COMMUNITY_APPROVE",
  "resource_type": "COMMUNITY_APPROVAL",
  "resource_id": "uuid",
  "before_data": {
    "status": "PENDING_REVIEW"
  },
  "after_data": {
    "status": "APPROVED",
    "community_id": "uuid"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2026-07-11T12:00:00Z"
}
```

### 10.2 Request Revision Action

```json
{
  "admin_id": "uuid",
  "action": "COMMUNITY_REQUEST_REVISION",
  "resource_type": "COMMUNITY_APPROVAL",
  "resource_id": "uuid",
  "before_data": {
    "status": "PENDING_REVIEW"
  },
  "after_data": {
    "status": "NEED_REVISION",
    "notes": "Deskripsi terlalu singkat, mohon tambahkan visi dan misi komunitas"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2026-07-11T12:00:00Z"
}
```

### 10.3 Reject Action

```json
{
  "admin_id": "uuid",
  "action": "COMMUNITY_REJECT",
  "resource_type": "COMMUNITY_APPROVAL",
  "resource_id": "uuid",
  "before_data": {
    "status": "PENDING_REVIEW"
  },
  "after_data": {
    "status": "REJECTED",
    "reason": "Komunitas tidak sesuai dengan kebijakan platform"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2026-07-11T12:00:00Z"
}
```
