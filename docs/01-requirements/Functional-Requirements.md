# Functional Requirements

**Proyek:** KomunaID
**Versi:** 1.0
**Tanggal:** 22 Juni 2026
**Status:** Draft

---

## 1. Authentication Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-001 | User Registration | Sistem mendaftarkan user baru | Email, password, nama | Akun baru dibuat, role "member" | Email unik, password min 8 karakter |
| FR-002 | User Login | Sistem melakukan autentikasi user | Email, password | Sesi aktif, redirect ke dashboard | Email terdaftar, password valid |
| FR-003 | User Logout | Sistem mengakhiri sesi user | Klik tombol logout | Sesi diakhiri, redirect ke landing page | Sesi aktif |
| FR-004 | Forgot Password | Sistem mengirim reset password | Email | Email reset dikirim | Email terdaftar di sistem |
| FR-005 | Reset Password | Sistem mengubah password | Token, password baru | Password diubah | Token valid, password min 8 karakter |
| FR-006 | Email Verification | Sistem memverifikasi email user | Token verifikasi | Email terverifikasi | Token valid |

---

## 2. Role Request Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-007 | Request Community Owner | Member mengajukan role CO | Data komunitas (nama, deskripsi, kategori) | Role request dibuat (status: pending) | Member belum punya role CO |
| FR-008 | Request Brand Owner | Member mengajukan role BO | Data brand (nama, deskripsi, logo) | Role request dibuat (status: pending) | Member belum punya role BO |
| FR-009 | View Role Requests | Superadmin melihat daftar pengajuan role | Filter status | Daftar role requests | Superadmin login |
| FR-010 | Approve Role Request | Superadmin menyetujui pengajuan role | ID role request | Status berubah ke "approved", role ditambahkan | Status request: pending |
| FR-011 | Reject Role Request | Superadmin menolak pengajuan role | ID role request, alasan penolakan | Status berubah ke "rejected" | Status request: pending |
| FR-012 | View My Role Requests | Member melihat pengajuan role saya | Klik menu role request | Daftar pengajuan role milik user | Member login |

---

## 3. Public Community Directory Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-013 | View Community List | Visitor melihat daftar komunitas | Filter kategori, lokasi, pencarian | Daftar komunitas publik | Tidak ada |
| FR-014 | Search Community | Visitor mencari komunitas | Kata kunci pencarian | Hasil pencarian komunitas | Query string valid |
| FR-015 | View Community Detail | Visitor melihat detail komunitas | Slug/ID komunitas | Halaman detail komunitas | Komunitas status: approved |
| FR-016 | View Community Members | Visitor melihat daftar anggota komunitas | ID komunitas | Daftar anggota (nama, foto) | Komunitas public |
| FR-017 | View Community Events | Visitor melihat event komunitas | ID komunitas | Daftar event | Komunitas public |
| FR-018 | View Community Gallery | Visitor melihat galeri komunitas | ID komunitas | Galeri foto/video | Komunitas public |

---

## 4. Member Management Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-019 | Join Community | Member bergabung ke komunitas | ID komunitas | Join request dikirim (status: pending) | Member belum join komunitas |
| FR-020 | Leave Community | Member keluar dari komunitas | ID komunitas | Anggota dihapus dari komunitas | Member terdaftar di komunitas |
| FR-021 | View My Communities | Member melihat daftar komunitas yang diikuti | Klik menu komunitas | Daftar komunitas | Member login |
| FR-022 | Approve Join Request | CO menyetujui join request | ID join request | Status berubah ke "approved" | CO adalah pemilik komunitas |
| FR-023 | Reject Join Request | CO menolak join request | ID join request, alasan | Status berubah ke "rejected" | CO adalah pemilik komunitas |
| FR-024 | View Members List | CO melihat daftar anggota komunitas | ID komunitas | Daftar anggota lengkap | CO adalah pemilik komunitas |
| FR-025 | Remove Member | CO menghapus anggota dari komunitas | ID anggota, alasan | Anggota dihapus | CO adalah pemilik komunitas |
| FR-026 | Assign Member Role | CO menetapkan role untuk anggota | ID anggota, role | Role anggota ditetapkan | CO adalah pemilik komunitas |
| FR-027 | Edit Profile | Member mengedit profil | Data profil baru | Profil diupdate | Member login |
| FR-028 | Upload Profile Photo | Member mengupload foto profil | File foto | Foto profil diupdate | Format: jpg, png, max 2MB |

---

## 5. Community Management Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-029 | Create Community | CO membuat komunitas baru | Nama, deskripsi, kategori, logo | Komunitas dibuat (status: pending) | CO login, data valid |
| FR-030 | Edit Community | CO mengedit informasi komunitas | Data komunitas baru | Komunitas diupdate | CO adalah pemilik komunitas |
| FR-031 | Delete Community | CO menghapus komunitas | ID komunitas | Komunitas dihapus (soft delete) | CO adalah pemilik komunitas |
| FR-032 | Create Sub Community | CO membuat sub komunitas | Nama, deskripsi | Sub komunitas dibuat | CO adalah pemilik komunitas utama |
| FR-033 | Edit Sub Community | CO mengedit sub komunitas | Data sub komunitas | Sub komunitas diupdate | CO adalah pemilik komunitas |
| FR-034 | Delete Sub Community | CO menghapus sub komunitas | ID sub komunitas | Sub komunitas dihapus | CO adalah pemilik komunitas |
| FR-035 | Create Regional | CO membuat regional baru | Nama regional | Regional dibuat | CO adalah pemilik komunitas |
| FR-036 | Assign Regional to Member | CO menetapkan regional untuk anggota | ID anggota, ID regional | Regional anggota ditetapkan | CO adalah pemilik komunitas |
| FR-037 | View Community Dashboard | CO melihat dashboard komunitas | ID komunitas | Statistik komunitas | CO adalah pemilik komunitas |

---

## 6. Brand Management Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-038 | Create Brand Profile | BO membuat profil brand | Nama, deskripsi, logo, website | Brand dibuat (status: pending) | BO login, data valid |
| FR-039 | Edit Brand Profile | BO mengedit profil brand | Data brand baru | Brand diupdate | BO adalah pemilik brand |
| FR-040 | View My Brand | BO melihat profil brand | ID brand | Halaman profil brand | BO adalah pemilik brand |
| FR-041 | View Brand Dashboard | BO melihat dashboard brand | ID brand | Statistik brand | BO adalah pemilik brand |
| FR-042 | View Brand Communities | BO melihat komunitas terkait | ID brand | Daftar komunitas | BO adalah pemilik brand |

---

## 7. Event Management Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-043 | Create Event | CO membuat event baru | Judul, deskripsi, tanggal, lokasi, kuota | Event dibuat (status: pending) | CO adalah pemilik komunitas |
| FR-044 | Edit Event | CO mengedit informasi event | Data event baru | Event diupdate | CO adalah pemilik event |
| FR-045 | Delete Event | CO menghapus event | ID event | Event dihapus | CO adalah pemilik event |
| FR-046 | Register for Event | Member mendaftar event | ID event | Registrasi berhasil, status: confirmed | Member login, kuota tersedia |
| FR-047 | Cancel Event Registration | Member membatalkan registrasi | ID event | Registrasi dibatalkan | Member terdaftar di event |
| FR-048 | View Event List | User melihat daftar event | Filter komunitas, tanggal | Daftar event | Tidak ada |
| FR-049 | View Event Detail | User melihat detail event | ID event | Halaman detail event | Event status: approved |
| FR-050 | View Event Participants | CO melihat daftar peserta event | ID event | Daftar peserta | CO adalah pemilik event |
| FR-051 | View Event Calendar | User melihat event dalam kalender | Bulan, tahun | Kalender dengan event | Tidak ada |

---

## 8. Collaboration Management Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-052 | Create Collaboration Request | BO mengajukan kolaborasi | ID komunitas, deskripsi, tipe kolaborasi | Pengajuan dikirim (status: pending) | BO login, komunitas exist |
| FR-053 | Accept Collaboration | CO menerima pengajuan | ID kolaborasi | Status: accepted | CO adalah pemilik komunitas |
| FR-054 | Reject Collaboration | CO menolak pengajuan | ID kolaborasi, alasan | Status: rejected | CO adalah pemilik komunitas |
| FR-055 | View Collaboration List | User melihat daftar kolaborasi | Filter status | Daftar kolaborasi | User login |
| FR-056 | View Collaboration Detail | User melihat detail kolaborasi | ID kolaborasi | Detail kolaborasi | User terlibat dalam kolaborasi |
| FR-057 | Cancel Collaboration | User membatalkan kolaborasi aktif | ID kolaborasi | Status: cancelled | Kolaborasi belum selesai |

---

## 9. Donation and Wallet Ledger Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-058 | Create Donation | Member berdonasi ke komunitas | ID komunitas, nominal, catatan | Donasi tercatat, wallet terupdate | Member login, nominal > 0 |
| FR-059 | View Donation History | Member melihat riwayat donasi | Filter tanggal | Daftar donasi | Member login |
| FR-060 | View Wallet Balance | Member melihat saldo wallet | Klik menu wallet | Saldo wallet | Member login |
| FR-061 | View Transaction History | User melihat riwayat transaksi | Filter tanggal, tipe | Daftar transaksi | User login |
| FR-062 | View Community Donation Total | CO melihat total donasi komunitas | ID komunitas | Total donasi | CO adalah pemilik komunitas |
| FR-063 | Simulate Payment | Sistem memproses pembayaran simulasi | Data pembayaran | Status pembayaran: success | Data valid |
| FR-064 | Create Wallet Entry | Sistem membuat entri wallet | User ID, tipe transaksi | Wallet entry dibuat | User terdaftar |

---

## 10. Gallery Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-065 | Upload Photo | CO mengupload foto ke galeri | File foto, judul, deskripsi | Foto diupload | Format: jpg, png, max 5MB |
| FR-066 | Upload Video | CO mengupload video ke galeri | File video, judul, deskripsi | Video diupload | Format: mp4, max 50MB |
| FR-067 | View Gallery | User melihat galeri komunitas | ID komunitas | Galeri foto/video | Komunitas public atau anggota |
| FR-068 | Delete Gallery Item | CO menghapus item galeri | ID item | Item dihapus | CO adalah pemilik komunitas |
| FR-069 | View Gallery Detail | User melihat detail item galeri | ID item | Detail item (foto/video, judul, deskripsi) | Item exist |

---

## 11. Chat Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-070 | Send Message | Anggota mengirim pesan | ID komunitas, pesan | Pesan terkirim | Anggota terdaftar di komunitas |
| FR-071 | View Messages | Anggota melihat pesan komunitas | ID komunitas | Daftar pesan | Anggota terdaftar di komunitas |
| FR-072 | Delete Message | CO menghapus pesan | ID pesan | Pesan dihapus | CO adalah pemilik komunitas |
| FR-073 | View Chat Room | Anggota melihat chat room | ID komunitas | Chat room dengan pesan | Anggota terdaftar di komunitas |

---

## 12. Notification Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-074 | View Notifications | User melihat notifikasi | Klik menu notifikasi | Daftar notifikasi | User login |
| FR-075 | Mark as Read | User menandai notifikasi sebagai dibaca | ID notifikasi | Status: read | Notifikasi milik user |
| FR-076 | Create Notification | Sistem membuat notifikasi | User ID, tipe, pesan | Notifikasi dibuat | Data valid |

---

## 13. Superadmin Approval Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-077 | View Pending Approvals | Superadmin melihat daftar approval pending | Filter tipe | Daftar approval | Superadmin login |
| FR-078 | Approve Item | Superadmin menyetujui item | ID item, tipe | Status: approved | Status: pending |
| FR-079 | Reject Item | Superadmin menolak item | ID item, tipe, alasan | Status: rejected | Status: pending |
| FR-080 | View Approval History | Superadmin melihat riwayat approval | Filter tipe, tanggal | Daftar approval | Superadmin login |
| FR-081 | Bulk Approve | Superadmin approve beberapa item sekaligus | Daftar ID item | Semua item di-approve | Semua status: pending |

---

## 14. Dashboard and Reporting Module

| ID | Requirement | Deskripsi | Input | Output | Validasi |
|----|------------|-----------|-------|--------|----------|
| FR-082 | View Member Dashboard | Member melihat dashboard | Klik menu dashboard | Statistik: komunitas diikuti, event, donasi | Member login |
| FR-083 | View CO Dashboard | CO melihat dashboard komunitas | ID komunitas | Statistik: anggota, event, donasi, galeri | CO adalah pemilik komunitas |
| FR-084 | View BO Dashboard | BO melihat dashboard brand | ID brand | Statistik: kolaborasi, campaign, komunitas | BO adalah pemilik brand |
| FR-085 | View Superadmin Dashboard | Superadmin melihat dashboard platform | Klik dashboard | Statistik: total user, komunitas, brand, event, revenue | Superadmin login |
| FR-086 | View Revenue Report | Superadmin melihat laporan revenue | Filter tanggal | Laporan revenue | Superadmin login |
| FR-087 | View User Report | Superadmin melihat laporan user | Filter tanggal, role | Laporan user | Superadmin login |
| FR-088 | View Community Report | Superadmin melihat laporan komunitas | Filter tanggal, status | Laporan komunitas | Superadmin login |

---

## Ringkasan Requirement per Modul

| No | Modul | Jumlah Requirement |
|----|-------|-------------------|
| 1 | Authentication | 6 |
| 2 | Role Request | 6 |
| 3 | Public Community Directory | 6 |
| 4 | Member Management | 10 |
| 5 | Community Management | 9 |
| 6 | Brand Management | 5 |
| 7 | Event Management | 9 |
| 8 | Collaboration Management | 6 |
| 9 | Donation and Wallet Ledger | 7 |
| 10 | Gallery | 5 |
| 11 | Chat | 4 |
| 12 | Notification | 3 |
| 13 | Superadmin Approval | 5 |
| 14 | Dashboard and Reporting | 7 |
| | **Total** | **88** |

---

## Dokumen Terkait

- [BRD.md](./BRD.md) - Business Requirements Document
- [PRD.md](./PRD.md) - Product Requirements Document
- [User-Requirements.md](./User-Requirements.md) - User Requirements
- [Non-Functional-Requirements.md](./Non-Functional-Requirements.md) - Non-Functional Requirements
- [Use-Case.md](./Use-Case.md) - Use Case Diagram & Deskripsi
- [User-Stories.md](./User-Stories.md) - User Stories
- [RTM.md](./RTM.md) - Requirement Traceability Matrix
