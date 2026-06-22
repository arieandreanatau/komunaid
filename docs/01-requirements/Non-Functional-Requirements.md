# Non-Functional Requirements

**Proyek:** KomunaID
**Versi:** 1.0
**Tanggal:** 22 Juni 2026
**Status:** Draft

---

## 1. Security

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-001 | Authentication | Sistem harus menggunakan Laravel Breeze untuk autentikasi | Password di-hash dengan Bcrypt, session management aman |
| NFR-002 | Authorization | Sistem harus menggunakan Spatie Laravel Permission untuk role-based access | Role: member, community_owner, brand_owner, superadmin |
| NFR-003 | CSRF Protection | Semua form harus dilindungi dari serangan CSRF | Token CSRF di setiap form POST |
| NFR-004 | XSS Prevention | Input harus di-sanitize untuk mencegah XSS | Laravel Blade auto-escaping, HTMLPurifier untuk user input |
| NFR-005 | SQL Injection Prevention | Query database harus menggunakan prepared statements | Eloquent ORM dan Query Builder |
| NFR-006 | Password Policy | Password harus memenuhi kebijakan keamanan | Min 8 karakter, kombinasi huruf dan angka |
| NFR-007 | Rate Limiting | Rate limiting diterapkan pada endpoint sensitif | Login: 5 attempts per menit, API: 60 requests per menit |
| NFR-008 | Input Validation | Semua input harus divalidasi di server-side | Form Request validation, tipe data sesuai |
| NFR-009 | File Upload Security | Upload file harus divalidasi tipe dan ukuran | Hanya ekstensi yang diizinkan, max size sesuai konfigurasi |
| NFR-010 | Session Security | Session harus aman dari hijacking | Session timeout 30 menit, regenerate session ID setelah login |
| NFR-011 | HTTPS | komunikasi harus terenkripsi | Redirect HTTP ke HTTPS (production) |
| NFR-012 | Secure Headers | Headers keamanan harus diatur | X-Content-Type-Options, X-Frame-Options, CSP |

---

## 2. Performance

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-013 | Page Load Time | Halaman harus dimuat dalam waktu yang ditentukan | < 3 detik untuk 90% permintaan |
| NFR-014 | API Response Time | API harus merespons dalam waktu yang ditentukan | < 500ms untuk 95% permintaan |
| NFR-015 | Database Query | Query database harus dioptimasi | Max 100ms untuk query sederhana |
| NFR-016 | Image Optimization | Gambar harus dioptimasi untuk web | Thumbnail otomatis, kompresi gambar |
| NFR-017 | Caching | Strategi caching harus diterapkan | Cache halaman statis, query cache untuk data sering diakses |
| NFR-018 | Lazy Loading | Gambar dan konten harus dimuat secara bertahap | Lazy loading untuk gambar galeri |
| NFR-019 | Pagination | Data harus dipaginasi | Max 20 item per halaman |
| NFR-020 | Asset Optimization | Asset CSS/JS harus dioptimasi | Minify, compress, CDN untuk production |
| NFR-021 | Memory Usage | Penggunaan memori harus dalam batas wajar | Max 128MB per request |
| NFR-022 | Concurrent Users | Sistem harus menangani banyak user bersamaan | Min 100 concurrent users tanpa degradasi |

---

## 3. Usability

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-023 | Responsive Design | Tampilan harus responsif di semua perangkat | Desktop, tablet, mobile (320px - 1920px) |
| NFR-024 | Consistent UI | UI harus konsisten di seluruh halaman | Komponen UI terstandarisasi |
| NFR-025 | Clear Navigation | Navigasi harus jelas dan mudah dipahami | Menu utama, breadcrumb, back button |
| NFR-026 | Form Usability | Form harus mudah digunakan | Label jelas, placeholder, error message |
| NFR-027 | Loading Indicators | Indikator loading harus ditampilkan | Spinner saat loading data |
| NFR-028 | Error Messages | Pesan error harus jelas dan membantu | Pesan spesifik, saran perbaikan |
| NFR-029 | Success Feedback | Feedback sukses harus ditampilkan | Alert success setelah aksi berhasil |
| NFR-030 | Accessibility | Aplikasi harus dapat diakses oleh semua pengguna | WCAG 2.1 Level A minimum |
| NFR-031 | Indonesian Language | Interface menggunakan bahasa Indonesia | Semua label dan pesan dalam Bahasa Indonesia |
| NFR-032 | Consistent Color | Warna harus konsisten dengan brand guideline | Navy: #09318E, Blue: #0D7AFC, Sky Blue: #29B8FD |

---

## 4. Scalability

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-033 | Horizontal Scaling | Sistem harus mendukung horizontal scaling | Stateless application, shared storage |
| NFR-034 | Database Scaling | Database harus mendukung scaling | Read replica, query optimization |
| NFR-035 | File Storage Scaling | File storage harus terpisah dan scalable | Laravel public storage, siap migrasi ke S3 |
| NFR-036 | Queue System | Tugas berat harus menggunakan queue | Laravel Queue untuk email, notifikasi |
| NFR-037 | Modular Architecture | Sistem harus terstruktur modular | MVC pattern, service layer |
| NFR-038 | API Versioning | API harus mendukung versioning | /api/v1/, /api/v2/ |

---

## 5. Maintainability

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-039 | Code Standards | Kode harus mengikuti standar PSR | PSR-12 coding style |
| NFR-040 | Documentation | Kode harus didokumentasikan | README, code comments untuk logic kompleks |
| NFR-041 | Testing | Sistem harus memiliki test coverage | Unit test min 60%, Feature test untuk critical path |
| NFR-042 | Version Control | Semua kode harus menggunakan version control | Git, branch strategy |
| NFR-043 | Database Migration | Perubahan database harus menggunakan migration | Laravel Migration |
| NFR-044 | Seed Data | Data sample harus tersedia untuk development | Laravel Seeder |
| NFR-045 | Environment Config | Konfigurasi harus menggunakan environment variables | .env file, tidak hardcode |
| NFR-046 | Code Review | Semua kode harus melalui code review | Pull request workflow |

---

## 6. Auditability

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-047 | Activity Log | Semua aktivitas penting harus dicatat | User action, timestamp, IP address |
| NFR-048 | Audit Trail | Perubahan data harus memiliki audit trail | Before/after values, changed by |
| NFR-049 | Login History | Riwayat login harus dicatat | Timestamp, IP, device, status |
| NFR-050 | Approval History | Riwayat approval harus dicatat | Approver, timestamp, action, reason |
| NFR-051 | Transaction Log | Semua transaksi keuangan harus dicatat | Full audit trail untuk donasi dan wallet |
| NFR-052 | System Logs | Error dan system logs harus tersimpan | Laravel log files, daily rotation |

---

## 7. Data Privacy

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-053 | Personal Data Protection | Data pribadi user harus dilindungi | Enkripsi data sensitif |
| NFR-054 | Data Access Control | Akses data harus dikontrol berdasarkan role | Hanya owner yang bisa akses data komunitas |
| NFR-055 | Profile Privacy | User dapat mengatur privasi profil | Public/private profile option |
| NFR-056 | Community Privacy | Komunitas dapat diatur public/private | Private community butuh approval untuk join |
| NFR-057 | Data Retention | Data harus disimpan sesuai kebijakan retensi | Minimal 1 tahun untuk data aktif |
| NFR-058 | Right to Delete | User dapat meminta penghapusan data | Soft delete, data recovery dalam 30 hari |

---

## 8. Availability

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-059 | Uptime | Sistem harus tersedia sesuai SLA | 99% uptime (max 3.65 hari downtime/tahun) |
| NFR-060 | Backup Schedule | Backup harus dilakukan secara berkala | Daily backup, weekly full backup |
| NFR-061 | Disaster Recovery | Rencana pemulihan bencana harus tersedia | Recovery Time Objective (RTO) < 4 jam |
| NFR-062 | Health Check | Endpoint health check harus tersedia | /health endpoint |
| NFR-063 | Graceful Degradation | Sistem harus tetap berfungsi jika komponen gagal | Fallback mechanisms |

---

## 9. Backup

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-064 | Database Backup | Database harus di-backup secara berkala | Daily automated backup |
| NFR-065 | File Backup | File upload harus di-backup | Daily incremental, weekly full |
| NFR-066 | Backup Verification | Backup harus diverifikasi secara berkala | Monthly restore test |
| NFR-067 | Backup Storage | Backup harus disimpan di lokasi terpisah | Offsite storage |
| NFR-068 | Backup Retention | Backup harus disimpan sesuai kebijakan retensi | 30 hari daily, 12 bulan weekly |

---

## 10. Error Handling

| ID | Requirement | Deskripsi | Kriteria |
|----|------------|-----------|----------|
| NFR-069 | Error Pages | Halaman error harus informatif | 404, 500, 403 custom pages |
| NFR-070 | Error Logging | Error harus dicatat ke log | Laravel error logging |
| NFR-071 | User-Friendly Errors | Error message harus mudah dipahami user | Pesan dalam Bahasa Indonesia |
| NFR-072 | Exception Handling | Exception harus ditangani dengan graceful | Try-catch, fallback mechanisms |
| NFR-073 | Validation Errors | Error validasi harus spesifik | Field-level error messages |
| NFR-074 | System Error Notification | Error kritis harus memberi notifikasi | Email alert untuk admin |
| NFR-075 | Recovery Suggestions | Error harus menyertakan saran perbaikan | Link ke help, saran tindakan |

---

## Ringkasan NFR per Kategori

| No | Kategori | Jumlah Requirement |
|----|----------|-------------------|
| 1 | Security | 12 |
| 2 | Performance | 10 |
| 3 | Usability | 10 |
| 4 | Scalability | 6 |
| 5 | Maintainability | 8 |
| 6 | Auditability | 6 |
| 7 | Data Privacy | 6 |
| 8 | Availability | 5 |
| 9 | Backup | 5 |
| 10 | Error Handling | 7 |
| | **Total** | **75** |

---

## Prioritas NFR untuk MVP

| Prioritas | NFR IDs | Keterangan |
|-----------|---------|------------|
| **Critical** | NFR-001, 002, 003, 004, 005, 013, 023, 039, 043, 047, 053, 069 | Harus diimplementasikan di MVP |
| **High** | NFR-006, 007, 008, 009, 014, 015, 019, 024, 025, 026, 040, 045, 050 | Sangat dianjurkan untuk MVP |
| **Medium** | NFR-010, 016, 017, 018, 027, 028, 029, 033, 044, 046, 051, 054, 055, 059, 064, 070, 071 | Dianjurkan, bisa dilakukan bertahap |
| **Low** | NFR-011, 012, 020, 021, 022, 030, 031, 032, 034, 035, 036, 037, 038, 041, 042, 048, 049, 052, 056, 057, 058, 060, 061, 062, 063, 065, 066, 067, 068, 072, 073, 074, 075 | Bisa diimplementasikan di fase selanjutnya |

---

## Dokumen Terkait

- [BRD.md](./BRD.md) - Business Requirements Document
- [PRD.md](./PRD.md) - Product Requirements Document
- [User-Requirements.md](./User-Requirements.md) - User Requirements
- [Functional-Requirements.md](./Functional-Requirements.md) - Functional Requirements
- [Use-Case.md](./Use-Case.md) - Use Case Diagram & Deskripsi
- [User-Stories.md](./User-Stories.md) - User Stories
- [RTM.md](./RTM.md) - Requirement Traceability Matrix
