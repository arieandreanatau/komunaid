# 16 — Testing Checklist

> KomunaID Super Admin MVP — Platform Governance Module

---

## 1. Dashboard

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 1.1 | GET /dashboard tanpa auth | 401 Unauthorized | [] |
| 1.2 | GET /dashboard dengan user biasa | 403 Forbidden | [] |
| 1.3 | GET /dashboard dengan Super Admin | 200 dengan data ringkasan | [] |
| 1.4 | GET /dashboard/growth?period=daily | Data pertumbuhan harian | [] |
| 1.5 | GET /dashboard/growth?period=weekly | Data pertumbuhan mingguan | [] |
| 1.6 | GET /dashboard/growth?period=monthly | Data pertumbuhan bulanan | [] |
| 1.7 | Dashboard UI: stat cards muncul | 4 stat cards terlihat | [] |
| 1.8 | Dashboard UI: growth chart render | Chart muncul dengan data | [] |
| 1.9 | Dashboard UI: responsive mobile | Layout menyesuaikan | [] |

---

## 2. Users Management

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 2.1 | GET /users | Daftar user dengan pagination | [] |
| 2.2 | GET /users?search=budi | Filter pencarian | [] |
| 2.3 | GET /users?role=SUPER_ADMIN | Filter by role | [] |
| 2.4 | GET /users?status=ACTIVE | Filter by status | [] |
| 2.5 | GET /users?sortBy=name&sortOrder=asc | Sorting | [] |
| 2.6 | GET /users/:id | Detail user | [] |
| 2.7 | GET /users/:id (tidak ada) | 404 Not Found | [] |
| 2.8 | PUT /users/:id/suspend | User status jadi SUSPENDED | [] |
| 2.9 | PUT /users/:id/suspend (sudah suspended) | 400 Bad Request | [] |
| 2.10 | PUT /users/:id/suspend tanpa reason | 400 Validasi gagal | [] |
| 2.11 | PUT /users/:id/activate | User status jadi ACTIVE | [] |
| 2.12 | PUT /users/:id/archive | User status jadi ARCHIVED | [] |
| 2.13 | PUT /users/:id/restore | User status jadi ACTIVE | [] |
| 2.14 | PUT /users/:id/role | Role berubah | [] |
| 2.15 | PUT /users/:id/role (role invalid) | 400 Validasi gagal | [] |
| 2.16 | PUT /users/:id/reset-password | Password direset, email terkirim | [] |
| 2.17 | Users UI: tabel render dengan data | Tabel muncul | [] |
| 2.18 | Users UI: filter berfungsi | Data terfilter | [] |
| 2.19 | Users UI: pagination berfungsi | Halaman berubah | [] |
| 2.20 | Users UI: aksi dropdown muncul | Dropdown tersedia | [] |
| 2.21 | Users UI: dialog suspend muncul | Dialog dengan form reason | [] |
| 2.22 | Users UI: badge status benar | Warna badge sesuai status | [] |
| 2.23 | Users UI: detail user page | Profil lengkap muncul | [] |

---

## 3. Communities Management

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 3.1 | GET /communities | Daftar komunitas | [] |
| 3.3 | GET /communities/:id | Detail komunitas | [] |
| 3.4 | GET /communities/review-queue | Daftar menunggu approval | [] |
| 3.5 | PUT /communities/:id/approve | Status jadi ACTIVE | [] |
| 3.6 | PUT /communities/:id/approve (bukan pending) | 400 Bad Request | [] |
| 3.7 | PUT /communities/:id/suspend | Status jadi SUSPENDED | [] |
| 3.8 | PUT /communities/:id/restore | Status jadi ACTIVE | [] |
| 3.9 | PATCH /communities/:id/reject | Status jadi REJECTED | [] |
| 3.10 | PATCH /communities/:id/request-revision | Status jadi REVISION_REQUIRED | [] |
| 3.11 | Communities UI: tabel render | Tabel muncul | [] |
| 3.12 | Communities UI: review queue page | Queue muncul | [] |
| 3.13 | Communities UI: approval dialog | Dialog konfirmasi muncul | [] |
| 3.14 | Communities UI: rejection dialog | Dialog dengan alasan | [] |

---

## 4. Events Management

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 4.1 | GET /events | Daftar event | [] |
| 4.2 | GET /events?status=PUBLISHED | Filter status | [] |
| 4.3 | GET /events/:id | Detail event | [] |
| 4.4 | PUT /events/:id/suspend | Status jadi SUSPENDED | [] |
| 4.5 | PUT /events/:id/restore | Status jadi PUBLISHED | [] |
| 4.6 | PUT /events/:id/archive | Status jadi ARCHIVED | [] |
| 4.7 | PUT /events/:id/cancel | Status jadi CANCELLED | [] |
| 4.8 | PUT /events/:id/publish | Status jadi PUBLISHED | [] |
| 4.9 | PUT /events/:id/soft-delete | Status jadi DELETED | [] |
| 4.10 | GET /events/:id/registrations | Daftar pendaftar | [] |
| 4.11 | Events UI: tabel render | Tabel muncul | [] |
| 4.12 | Events UI: detail page | Detail muncul | [] |
| 4.13 | Events UI: registrations page | Pendaftar muncul | [] |

---

## 5. Volunteers Management

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 5.1 | GET /volunteers | Daftar relawan | [] |
| 5.2 | GET /volunteers/:id | Detail relawan | [] |
| 5.3 | GET /volunteers/:id/applications | Daftar lamaran | [] |
| 5.4 | PUT /volunteers/applications/:id/approve | Status APPROVED | [] |
| 5.5 | PUT /volunteers/applications/:id/reject | Status REJECTED | [] |
| 5.6 | PUT /volunteers/:id/suspend | Status SUSPENDED | [] |
| 5.7 | PUT /volunteers/:id/archive | Status ARCHIVED | [] |
| 5.8 | PUT /volunteers/:id/soft-delete | Status DELETED | [] |
| 5.9 | PUT /volunteers/:id/restore | Status ACTIVE | [] |
| 5.10 | Volunteers UI: tabel render | Tabel muncul | [] |
| 5.11 | Volunteers UI: detail page | Detail muncul | [] |
| 5.12 | Volunteers UI: applications page | Lamaran muncul | [] |

---

## 6. Reports Management

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 6.1 | GET /reports | Daftar laporan | [] |
| 6.2 | GET /reports?status=PENDING | Filter status | [] |
| 6.3 | GET /reports?severity=HIGH | Filter severity | [] |
| 6.4 | PUT /reports/:id/resolve | Status RESOLVED | [] |
| 6.5 | PUT /reports/:id/under-review | Status UNDER_REVIEW | [] |
| 6.6 | POST /reports/:id/warn | Peringatan terkirim | [] |
| 6.7 | Reports UI: tabel render | Tabel muncul | [] |
| 6.8 | Reports UI: resolve dialog | Dialog dengan resolution | [] |
| 6.9 | Reports UI: warn dialog | Dialog dengan message | [] |

---

## 7. CMS Management

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 7.1 | GET /cms/pages | Daftar halaman | [] |
| 7.2 | GET /cms/pages/:slug | Detail halaman | [] |
| 7.3 | POST /cms/pages | Halaman baru dibuat | [] |
| 7.4 | POST /cms/pages (slug duplikat) | 409 Conflict | [] |
| 7.5 | PUT /cms/pages/:id | Halaman diupdate | [] |
| 7.6 | DELETE /cms/pages/:id | Halaman dihapus | [] |
| 7.7 | GET /cms/banners | Daftar banner | [] |
| 7.8 | POST /cms/banners | Banner baru dibuat | [] |
| 7.9 | PUT /cms/banners/:id | Banner diupdate | [] |
| 7.10 | DELETE /cms/banners/:id | Banner dihapus | [] |
| 7.11 | CMS Pages UI: tabel render | Tabel muncul | [] |
| 7.12 | CMS Pages UI: editor page | Rich text editor muncul | [] |
| 7.13 | CMS Banners UI: tabel render | Tabel muncul | [] |
| 7.14 | CMS Banners UI: upload gambar | Upload berhasil | [] |

---

## 8. Categories

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 8.1 | GET /categories | Daftar kategori | [] |
| 8.2 | GET /categories?type=COMMUNITY | Filter by type | [] |
| 8.3 | POST /categories | Kategori baru dibuat | [] |
| 8.4 | PUT /categories/:id | Kategori diupdate | [] |
| 8.5 | DELETE /categories/:id | Kategori dihapus | [] |
| 8.6 | DELETE /categories/:id (masih dipakai) | 409 Conflict | [] |
| 8.7 | Categories UI: tabel render | Tabel muncul | [] |
| 8.8 | Categories UI: tambah kategori | Dialog form muncul | [] |
| 8.9 | Categories UI: edit kategori | Dialog edit muncul | [] |

---

## 9. Master Data

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 9.1 | GET /master-data/provinces | Daftar provinsi | [] |
| 9.2 | PUT /master-data/provinces | Bulk update berhasil | [] |
| 9.3 | GET /master-data/cities | Daftar kota | [] |
| 9.4 | PUT /master-data/cities | Bulk update berhasil | [] |
| 9.5 | GET /master-data/countries | Daftar negara | [] |
| 9.6 | PUT /master-data/countries | Bulk update berhasil | [] |
| 9.7 | GET /master-data/districts | Daftar kecamatan | [] |
| 9.8 | PUT /master-data/districts | Bulk update berhasil | [] |
| 9.9 | GET /master-data/kelurahan | Daftar kelurahan | [] |
| 9.10 | PUT /master-data/kelurahan | Bulk update berhasil | [] |
| 9.11 | GET /master-data/interests | Daftar minat | [] |
| 9.12 | PUT /master-data/interests | Bulk update berhasil | [] |
| 9.13 | GET /master-data/tags | Daftar tag | [] |
| 9.14 | PUT /master-data/tags | Bulk update berhasil | [] |
| 9.15 | Master Data UI: hub page | Grid navigasi muncul | [] |
| 9.16 | Master Data UI: tabel per jenis | Tabel data muncul | [] |

---

## 10. Audit Logs

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 10.1 | GET /audit-logs | Daftar log audit | [] |
| 10.2 | GET /audit-logs?action=USER_SUSPENDED | Filter action | [] |
| 10.3 | GET /audit-logs?startDate=2026-07-01&endDate=2026-07-31 | Filter tanggal | [] |
| 10.4 | GET /audit-logs/user/:userId | Log audit per user | [] |
| 10.5 | Audit log tercipta saat suspend user | Log muncul | [] |
| 10.6 | Audit log tercipta saat approve komunitas | Log muncul | [] |
| 10.7 | Audit Logs UI: tabel render | Tabel muncul | [] |
| 10.8 | Audit Logs UI: filter berfungsi | Data terfilter | [] |

---

## 11. Notifications

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 11.1 | GET /notifications | Daftar notifikasi | [] |
| 11.2 | POST /notifications/broadcast | Broadcast terkirim | [] |
| 11.3 | POST /notifications/broadcast (tanpa title) | 400 Validasi gagal | [] |
| 11.4 | GET /notification-templates/:id | Detail template | [] |
| 11.5 | POST /notification-templates | Template baru dibuat | [] |
| 11.6 | PUT /notification-templates/:id | Template diupdate | [] |
| 11.7 | DELETE /notification-templates/:id | Template dihapus | [] |
| 11.8 | Notifications UI: tabel render | Tabel muncul | [] |
| 11.9 | Notifications UI: broadcast form | Form muncul | [] |
| 11.10 | Notifications UI: templates page | Templates muncul | [] |

---

## 12. Settings

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 12.1 | GET /settings | Semua settings | [] |
| 12.2 | GET /settings/:key | Setting spesifik | [] |
| 12.3 | PUT /settings/:key | Setting diupdate | [] |
| 12.4 | PUT /settings/platform/general | General settings diupdate | [] |
| 12.5 | GET /settings/platform/general | General settings muncul | [] |
| 12.6 | Maintenance mode ON | User melihat halaman maintenance | [] |
| 12.7 | Maintenance mode OFF | User bisa akses normal | [] |
| 12.8 | Settings UI: form render | Form muncul | [] |
| 12.9 | Settings UI: save berhasil | Toast sukses muncul | [] |

---

## 13. Security

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 13.1 | GET /security/login-history | Riwayat login | [] |
| 13.2 | GET /security/login-history?status=failed | Login gagal saja | [] |
| 13.3 | GET /security/failed-logins | Login gagal | [] |
| 13.4 | GET /security/suspicious-activity | Aktivitas mencurigakan | [] |
| 13.5 | POST /security/force-logout | User dipaksa logout | [] |
| 13.6 | POST /security/force-logout (Super Admin lain) | 403 Forbidden | [] |
| 13.7 | PUT /security/lock-user | Akun terkunci | [] |
| 13.8 | PUT /security/lock-user (Super Admin lain) | 403 Forbidden | [] |
| 13.9 | PUT /security/unlock-user | Akun terbuka | [] |
| 13.10 | Login setelah akun dikunci | 403 Akun terkunci | [] |
| 13.11 | Security UI: login history page | Tabel muncul | [] |
| 13.12 | Security UI: failed logins page | Tabel muncul | [] |
| 13.13 | Security UI: suspicious activity page | Tabel muncul | [] |

---

## 14. Authentication & RBAC

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 14.1 | Request tanpa token | 401 Unauthorized | [] |
| 14.2 | Request dengan token expired | 401 Token expired | [] |
| 14.3 | Request dengan token invalid | 401 Token invalid | [] |
| 14.4 | Request dengan token user biasa | 403 Forbidden | [] |
| 14.5 | Request dengan token Community Admin | 403 Forbidden | [] |
| 14.6 | Request dengan token Super Admin | 200 OK | [] |
| 14.7 | Rate limit: 101 requests dalam 1 menit | 429 Rate Limited | [] |
| 14.8 | CORS: request dari origin berbeda | Ditolak | [] |

---

## 15. Form Validation

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 15.1 | Submit form dengan field kosong | 400 Validasi gagal | [] |
| 15.2 | Submit form dengan email invalid | 400 Validasi gagal | [] |
| 15.3 | Submit form dengan string terlalu panjang | 400 Validasi gagal | [] |
| 15.4 | Submit form dengan angka dimana string diharapkan | 400 Validasi gagal | [] |
| 15.5 | Error message ditampilkan di UI | Pesan error muncul | [] |

---

## 16. Responsive Design

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 16.1 | Desktop (1920x1080) | Layout penuh | [] |
| 16.2 | Tablet (768x1024) | Sidebar collapsible | [] |
| 16.3 | Mobile (375x812) | Sidebar tersembunyi | [] |
| 16.4 | Tabel di mobile | Horizontal scroll | [] |
| 16.5 | Dialog di mobile | Full-width | [] |

---

## 17. Performance

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 17.1 | Dashboard load time | < 2 detik | [] |
| 17.2 | Users list load (1000 records) | < 3 detik | [] |
| 17.3 | Search response time | < 500ms | [] |
| 17.4 | Pagination response time | < 500ms | [] |
| 17.5 | Image upload (5MB) | < 10 detik | [] |

---

## 18. Error Handling

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 18.1 | Server error (500) | Error page muncul | [] |
| 18.2 | Network error | Toast error muncul | [] |
| 18.3 | Timeout request | Timeout message muncul | [] |
| 18.4 | Invalid JSON response | Graceful error handling | [] |

---

## 19. Cross-Browser

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 19.1 | Chrome 125+ | Semua fitur berfungsi | [] |
| 19.2 | Firefox 126+ | Semua fitur berfungsi | [] |
| 19.3 | Safari 17+ | Semua fitur berfungsi | [] |
| 19.4 | Edge 125+ | Semua fitur berfungsi | [] |

---

## 20. Security Specific

| No | Test Case | Expected | Status |
|----|-----------|----------|--------|
| 20.1 | SQL injection pada search | Input di-sanitize | [] |
| 20.2 | XSS pada form input | Input di-escape | [] |
| 20.3 | CSRF pada state-changing endpoint | CSRF token validasi | [] |
| 20.4 | Password di-log | Password tidak muncul di log | [] |
| 20.5 | JWT secret tidak di-expose | Secret tidak di-response | [] |
| 20.6 | Error response tidak expose stack trace | Stack trace tidak muncul | [] |
| 20.7 | Rate limiting berfungsi | 429 setelah limit | [] |
| 20.8 | Brute force protection | Akun terkunci setelah 5 percobaan | [] |

---

## Sign Off

| Peran | Nama | Tanggal | Status |
|-------|------|---------|--------|
| QA Lead | — | — | [] |
| Backend Lead | — | — | [] |
| Frontend Lead | — | — | [] |
| Product Owner | — | — | [] |
