# User Flow - KomunaID Super Admin MVP

## 1. Overview

Dokumen ini mendefinisikan user flow untuk alur kerja utama admin panel KomunaID. Setiap flow mencakup langkah-langkah detail, decision points, error handling, dan state transitions.

---

## 2. Flow 1: Admin Login

### 2.1 Langkah-Langkah

| Step | Aksi | Input | Output | Error Case |
|------|------|-------|--------|------------|
| 1 | Akses `/admin/login` | - | Tampilkan form login | Redirect ke dashboard jika sudah login |
| 2 | Isi form login | email, password | Validasi input | Email kosong: "Email wajib diisi". Format invalid: "Format email tidak valid" |
| 3 | Submit credentials | - | Kirim request `POST /api/v1/auth/login` | Network error: "Terjadi kesalahan, coba lagi" |
| 4 | Verifikasi credentials | - | Cek email dan password di database | Credentials salah: "Email atau password salah" |
| 5 | Cek login attempts | - | Counter percobaan login | Counter >= 5: "Akun terkunci, coba lagi dalam 30 menit" |
| 6 | Generate JWT token | user_id, role | Token dengan expiry 24 jam | Token generation gagal: "Terjadi kesalahan, coba lagi" |
| 7 | Catat LoginHistory | ip_address, user_agent | Record tersimpan | Log gagal tidak menghambat login |
| 8 | Redirect ke Dashboard | - | Navigate ke `/admin/dashboard` | - |

### 2.2 State Transitions

```
LOGGED_OUT -> AUTHENTICATING -> AUTHENTICATED
                                     |
                                     v
                              DASHBOARD_LOADED
```

### 2.3 Error States

| Error | Retryable | Max Retry | Recovery |
|-------|-----------|-----------|----------|
| Invalid credentials | Yes | 5 attempts | Wait 30 minutes or reset password |
| Account locked | No | - | Wait 30 minutes or SUPER_ADMIN unlock |
| Network error | Yes | 3 | Refresh page |
| Token expired | Yes | - | Auto-refresh or redirect to login |

---

## 3. Flow 2: Dashboard Access

### 3.1 Langkah-Langkah

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Navigate ke `/admin/dashboard` | - | Auth middleware check |
| 2 | Check JWT token validity | Token | Valid: proceed. Expired: redirect ke login |
| 3 | Check role permission | user_role | PLATFORM_ADMIN+: proceed. MEMBER: redirect ke `/` |
| 4 | Fetch dashboard data | - | Parallel API calls: stats, growth, activity, pending, moderation |
| 5 | Render dashboard | - | Tampilkan kartu statistik, grafik, aktivitas, antrian |
| 6 | Auto-refresh data | interval: 60s | Update statistik dan antrian secara berkala |

### 3.2 API Calls (Parallel)

| API Endpoint | Method | Purpose |
|-------------|--------|---------|
| `/api/v1/admin/dashboard/stats` | GET | Statistik ringkasan |
| `/api/v1/admin/dashboard/growth` | GET | Grafik pertumbuhan |
| `/api/v1/admin/dashboard/activity` | GET | Aktivitas terkini |
| `/api/v1/admin/dashboard/pending` | GET | Komunitas pending review |
| `/api/v1/admin/dashboard/moderation` | GET | Laporan moderasi belum ditangani |

### 3.3 Data Display

| Section | Data | Format |
|---------|------|--------|
| Statistik | total_members, total_communities, total_events, total_volunteers | Card dengan icon dan angka |
| Grafik Pertumbuhan | monthly_data (6 bulan) | Line chart |
| Aktivitas Terkini | recent_activities (10 item) | Timeline list dengan timestamp relatif |
| Pending Review | pending_communities | Card dengan jumlah dan tombol "Review" |
| Moderasi | unresolved_reports | Card dengan jumlah dan tombol "Handle" |

---

## 4. Flow 3: Member Management

### 4.1 List Members Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Navigate ke `/admin/members` | - | Auth + role check |
| 2 | Fetch member list | page, limit, search, filters | Paginated list |
| 3 | Apply filters | status, role, date_range | Filtered results |
| 4 | Search members | query (nama/email) | Search results within 500ms |
| 5 | View member detail | member_id | Navigate ke `/admin/members/[id]` |
| 6 | Perform action | action_type | Deactivate/Reactivate/Reset Password/Assign Role |

### 4.2 Member Detail Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Fetch member detail | member_id | Profile data |
| 2 | Fetch member communities | member_id | List komunitas |
| 3 | Display profile | - | Nama, email, status, role, tanggal registrasi |
| 4 | Select action | - | Tampilkan opsi aksi sesuai role |

### 4.3 Deactivate Account Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Deactivate" button | - | Tampilkan confirmation modal |
| 2 | Enter deactivation reason | reason (wajib) | Enable "Confirm" button |
| 3 | Confirm deactivation | - | Kirim `PUT /api/v1/admin/members/:id/deactivate` |
| 4 | Backend validation | - | Cek apakah member bisa dinonaktifkan |
| 5 | Update member status | status -> INACTIVE | Member tidak dapat login |
| 6 | Record audit log | - | Log: admin_id, action, member_id, reason |
| 7 | Display success | - | Toast notification, refresh list |
| 8 | Send notification | - | Email ke member: akun dinonaktifkan |

### 4.4 Export Members Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Export" button | - | Tampilkan export options |
| 2 | Select export format | CSV | Pilih format |
| 3 | Apply current filters | same filters as list | Data yang di-export sesuai filter |
| 4 | Generate file | - | Backend generate CSV |
| 5 | Download file | - | Browser download |

---

## 5. Flow 4: Community Approval

### 5.1 Review Community Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Navigate ke `/admin/communities/approval` | - | Fetch pending communities |
| 2 | View pending list | - | Daftar komunitas dengan info: nama, kategori, pengaju, tanggal |
| 3 | Click community name | community_id | Navigate ke detail |
| 4 | Fetch community detail | community_id | Info lengkap: deskripsi, kategori, anggota pendiri, dokumen |
| 5 | Review information | - | Admin meninjau semua data |
| 6 | Make decision | - | Pilih: Approve / Request Revision / Reject |

### 5.2 Approve Community Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Approve" button | - | Tampilkan confirmation modal |
| 2 | Confirm approval | - | Kirim `POST /api/v1/admin/community-approvals/:id/approve` |
| 3 | Update status | PENDING_REVIEW -> APPROVED | Komunitas aktif |
| 4 | Create community record | - | Buat record di tabel communities |
| 5 | Record audit log | - | Log approval decision |
| 6 | Send notification | - | Email ke pengaju: komunitas disetujui |
| 7 | Update dashboard badge | - | Kurangi count pending |

### 5.3 Request Revision Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Request Revision" button | - | Tampilkan form revisi |
| 2 | Enter revision notes | notes (wajib), specific_changes | Enable "Submit" button |
| 3 | Submit revision request | - | Kirim `POST /api/v1/admin/community-approvals/:id/revision` |
| 4 | Update status | PENDING_REVIEW -> NEED_REVISION | Komunitas dikembalikan ke pengaju |
| 5 | Record audit log | - | Log revision request dengan catatan |
| 6 | Send notification | - | Email ke pengaju: revisi diperlukan dengan catatan |
| 7 | Update dashboard badge | - | Kurangi count pending |

### 5.4 Reject Community Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Reject" button | - | Tampilkan form penolakan |
| 2 | Enter rejection reason | reason (wajib) | Enable "Confirm" button |
| 3 | Confirm rejection | - | Kirim `POST /api/v1/admin/community-approvals/:id/reject` |
| 4 | Update status | PENDING_REVIEW -> REJECTED | Komunitas ditolak permanen |
| 5 | Record audit log | - | Log rejection dengan alasan |
| 6 | Send notification | - | Email ke pengaju: komunitas ditolak dengan alasan |
| 7 | Update dashboard badge | - | Kurangi count pending |

---

## 6. Flow 5: Event Management

### 6.1 List Events Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Navigate ke `/admin/events` | - | Auth + role check |
| 2 | Fetch event list | page, limit, status, community, date_range | Paginated list |
| 3 | Apply filters | status (upcoming/ongoing/completed/cancelled), community, date | Filtered results |
| 4 | View event detail | event_id | Navigate ke `/admin/events/[id]` |
| 5 | Perform action | action_type | Approve/Cancel/Edit/Delete |

### 6.2 Cancel Event Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Cancel Event" button | - | Tampilkan confirmation modal |
| 2 | Enter cancellation reason | reason (wajib) | Enable "Confirm" button |
| 3 | Confirm cancellation | - | Kirim `PUT /api/v1/admin/events/:id/cancel` |
| 4 | Update event status | status -> CANCELLED | Event dibatalkan |
| 5 | Notify participants | - | Kirim notifikasi ke semua peserta terdaftar |
| 6 | Record audit log | - | Log cancellation dengan alasan |
| 7 | Display success | - | Toast notification, refresh list |

### 6.3 Export Participants Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Navigate ke event detail | event_id | Tampilkan detail event |
| 2 | Click "Export Participants" | - | Kirim `GET /api/v1/admin/events/:id/participants/export` |
| 3 | Generate CSV | - | File: nama, email, status kehadiran, tanggal registrasi |
| 4 | Download file | - | Browser download |

---

## 7. Flow 6: Volunteer Management

### 7.1 List Volunteers Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Navigate ke `/admin/volunteers` | - | Auth + role check |
| 2 | Fetch volunteer list | page, limit, status, assignment_count | Paginated list |
| 3 | Apply filters | status (active/inactive/pending), assignment_count | Filtered results |
| 4 | View volunteer detail | volunteer_id | Navigate ke `/admin/volunteers/[id]` |
| 5 | Perform action | action_type | Approve/Revoke/Assign/Unassign |

### 7.2 Assign Volunteer to Event Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Assign to Event" button | - | Tampilkan event selection modal |
| 2 | Search/select event | event_name, event_date | Daftar event yang tersedia |
| 3 | Check event availability | event_id | Sisa kuota volunteer |
| 4 | Confirm assignment | - | Kirim `POST /api/v1/admin/volunteers/:id/assign` |
| 5 | Create assignment record | - | Link volunteer ke event |
| 6 | Record audit log | - | Log assignment |
| 7 | Send notification | - | Email ke volunteer: penugasan baru |
| 8 | Update volunteer stats | - | Refresh statistik |

### 7.3 Unassign Volunteer from Event Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Unassign" button | - | Tampilkan form unassign |
| 2 | Enter unassign reason | reason (wajib) | Enable "Confirm" button |
| 3 | Confirm unassign | - | Kirim `DELETE /api/v1/admin/volunteers/:id/unassign/:eventId` |
| 4 | Remove assignment record | - | Unlink volunteer dari event |
| 5 | Record audit log | - | Log unassign dengan alasan |
| 6 | Send notification | - | Email ke volunteer: penugasan dicabut |

---

## 8. Flow 7: Moderation

### 8.1 Review Report Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Navigate ke `/admin/moderation` | - | Fetch laporan masuk |
| 2 | View report list | - | Daftar laporan: jenis, pelapor, terlapor, tanggal, status |
| 3 | Click report | report_id | Navigate ke detail |
| 4 | Fetch report detail | report_id | Detail: konten dilaporkan, bukti, histori pengguna |
| 5 | Review content | - | Admin meninjau konten dan konteks |
| 6 | Make decision | - | Pilih: Warning/Suspend/Remove Content/Dismiss |

### 8.2 Issue Warning Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Issue Warning" button | - | Tampilkan form peringatan |
| 2 | Enter warning details | description (wajib), violation_type | Form terisi |
| 3 | Check violation history | user_id | Level peringatan: 1, 2, atau 3 |
| 4 | Confirm warning | - | Kirim `POST /api/v1/admin/moderations/:id/warn` |
| 5 | Create warning record | - | Warning dengan level sesuai history |
| 6 | Record audit log | - | Log warning |
| 7 | Send notification | - | Email + in-app ke pengguna: peringatan |
| 8 | Update report status | -> WARNING | Status berubah |

### 8.3 Suspend User Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Click "Suspend User" button | - | Tampilkan form suspend |
| 2 | Enter suspension details | duration_days, reason (wajib) | Form terisi |
| 3 | Check violation history | user_id | >= 3 pelanggaran dalam 30 hari: permanent suspend |
| 4 | Confirm suspension | - | Kirim `POST /api/v1/admin/moderations/:id/suspend` |
| 5 | Update user status | status -> SUSPENDED | User tidak dapat login |
| 6 | Set suspension expiry | expires_at | Otomatis re-enable setelah durasi |
| 7 | Record audit log | - | Log suspension |
| 8 | Send notification | - | Email ke user: akun ditangguhkan |

### 8.4 Handle Appeal Flow

| Step | Aksi | Input | Output |
|------|------|-------|--------|
| 1 | Receive appeal | - | User mengajukan banding dalam 7 hari |
| 2 | View appeal detail | appeal_id | Alasan banding dari user |
| 3 | Review original decision | report_id | Konteks pelanggaran awal |
| 4 | Make appeal decision | - | Uphold / Overturn |
| 5 | If Overturn | - | Aktivasi kembali akun user |
| 6 | Record audit log | - | Log appeal decision |
| 7 | Send notification | - | Email ke user: hasil banding |

---

## 9. Cross-Cutting Concerns

### 9.1 Authentication Check

Setiap flow admin dimulai dengan authentication check:

1. Validate JWT token dari request header
2. Check token expiry
3. Check token blacklist (untuk logout)
4. Check role permission untuk resource yang diakses
5. Jika gagal: redirect ke `/admin/login`

### 9.2 Error Handling Pattern

| Error Type | User Action | System Action |
|------------|-------------|---------------|
| Validation error | Perbaiki input | Tampilkan field-level error |
| Permission denied | Hubungi SUPER_ADMIN | Log attempted access |
| Network error | Retry manual | Tampilkan toast error |
| Session expired | Login ulang | Redirect ke `/admin/login` |
| Server error | Tunggu dan retry | Log error, tampilkan generic message |

### 9.3 Loading States

| State | Indicator | Duration |
|-------|-----------|----------|
| Initial page load | Skeleton loader | Until data fetched |
| Data fetch | Spinner di section | Until API response |
| Form submit | Button loading state | Until API response |
| Export | Progress bar | Until file generated |
| Search | Inline spinner | Until results returned |
