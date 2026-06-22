# User Stories

**Proyek:** KomunaID
**Versi:** 1.0
**Tanggal:** 22 Juni 2026
**Status:** Draft

---

## 1. Visitor Stories

### US-001: Melihat Landing Page

**Sebagai** pengunjung, **saya ingin** melihat halaman utama KomunaID, **agar** saya memahami apa itu platform KomunaID dan fitur-fitur yang tersedia.

**Acceptance Criteria:**

```gherkin
Given saya adalah pengunjung yang mengakses komunaid.com
When halaman utama dimuat
Then saya melihat logo KomunaID
And saya melihat deskripsi singkat tentang platform
And saya melihat tombol "Daftar" dan "Masuk"
And saya melihat komunitas unggulan
```

---

### US-002: Melihat Daftar Komunitas

**Sebagai** pengunjung, **saya ingin** melihat daftar komunitas yang terdaftar, **agar** saya dapat menemukan komunitas yang sesuai dengan minat saya.

**Acceptance Criteria:**

```gherkin
Given saya adalah pengunjung
When saya mengakses halaman "Komunitas"
Then saya melihat daftar komunitas publik
And setiap komunitas menampilkan nama, deskripsi, dan jumlah anggota
And saya dapat memfilter komunitas berdasarkan kategori
And saya dapat mencari komunitas berdasarkan nama
```

---

### US-003: Mencari Komunitas

**Sebagai** pengunjung, **saya ingin** mencari komunitas berdasarkan kata kunci, **agar** saya dapat menemukan komunitas spesifik dengan cepat.

**Acceptance Criteria:**

```gherkin
Given saya adalah pengunjung
When saya mengetik kata kunci di search bar
And saya menekan tombol Enter atau klik "Cari"
Then saya melihat hasil pencarian yang relevan
And hasil pencarian menampilkan komunitas yang cocok
And jika tidak ada hasil, saya melihat pesan "Komunitas tidak ditemukan"
```

---

### US-004: Melihat Detail Komunitas

**Sebagai** pengunjung, **saya ingin** melihat detail komunitas, **agar** saya mendapatkan informasi lengkap sebelum memutuskan untuk bergabung.

**Acceptance Criteria:**

```gherkin
Given saya adalah pengunjung
When saya mengklik nama komunitas dari daftar
Then saya melihat halaman detail komunitas
And saya melihat nama, deskripsi, logo komunitas
And saya melihat jumlah anggota aktif
And saya melihat daftar event yang akan datang
And saya melihat galeri komunitas
And saya melihat tombol "Join Komunitas"
```

---

### US-005: Mendaftar Akun

**Sebagai** pengunjung, **saya ingin** mendaftar akun baru, **agar** saya dapat bergabung dengan komunitas dan menggunakan fitur platform.

**Acceptance Criteria:**

```gherkin
Given saya adalah pengunjung
When saya mengklik tombol "Daftar"
And saya mengisi nama, email, password, dan konfirmasi password
And saya mengklik tombol "Daftar"
Then akun baru dibuat dengan role "member"
And saya diarahkan ke dashboard member
And saya menerima email verifikasi
```

---

### US-006: Login

**Sebagai** pengunjung yang sudah terdaftar, **saya ingin** login ke platform, **agar** saya dapat mengakses fitur yang memerlukan autentikasi.

**Acceptance Criteria:**

```gherkin
Given saya sudah terdaftar di KomunaID
When saya mengakses halaman login
And saya mengisi email dan password yang benar
And saya mengklik tombol "Masuk"
Then saya berhasil login
And saya diarahkan ke dashboard sesuai role saya
```

---

## 2. Member Stories

### US-007: Join Komunitas

**Sebagai** member, **saya ingin** bergabung ke komunitas, **agar** saya dapat berpartisipasi dalam aktivitas komunitas.

**Acceptance Criteria:**

```gherkin
Given saya adalah member yang login
When saya mengakses detail komunitas
And saya mengklik tombol "Join Komunitas"
Then join request saya dikirim
And status join request adalah "pending"
And saya melihat pesan "Join request berhasil dikirim"
And komunitas menerima notifikasi
```

---

### US-008: Leave Komunitas

**Sebagai** member, **saya ingin** keluar dari komunitas, **agar** saya tidak lagi menjadi anggota komunitas tersebut.

**Acceptance Criteria:**

```gherkin
Given saya adalah anggota komunitas
When saya mengakses halaman komunitas saya
And saya mengklik tombol "Leave Komunitas"
And saya mengonfirmasi
Then saya tidak lagi menjadi anggota komunitas
And data saya dihapus dari daftar anggota
```

---

### US-009: Daftar Event

**Sebagai** member, **saya ingin** mendaftar ke event, **agar** saya dapat mengikuti event yang diadakan komunitas.

**Acceptance Criteria:**

```gherkin
Given saya adalah member yang login
When saya mengakses halaman event
And saya mengklik tombol "Daftar Event"
Then registrasi saya berhasil
And status registrasi adalah "confirmed"
And saya melihat pesan "Berhasil mendaftar event"
And kuota event berkurang 1
```

---

### US-010: Berdonasi

**Sebagai** member, **saya ingin** berdonasi ke komunitas, **agar** saya dapat mendukung aktivitas komunitas.

**Acceptance Criteria:**

```gherkin
Given saya adalah member yang login
When saya mengakses halaman komunitas
And saya mengklik tombol "Donasi"
And saya mengisi nominal donasi (minimal Rp 1.000)
And saya mengklik tombol "Donasi Sekarang"
Then donasi saya tercatat di sistem
And saya melihat pesan "Donasi berhasil"
And wallet komunitas terupdate
```

---

### US-011: Melihat Histori Event

**Sebagai** member, **saya ingin** melihat daftar event yang pernah saya ikuti, **agar** saya dapat melacak partisipasi saya.

**Acceptance Criteria:**

```gherkin
Given saya adalah member yang login
When saya mengakses halaman "Histori Event"
Then saya melihat daftar event yang pernah saya daftar
And setiap event menampilkan nama, tanggal, dan status
And saya dapat memfilter berdasarkan status
```

---

### US-012: Melihat Histori Donasi

**Sebagai** member, **saya ingin** melihat riwayat donasi saya, **agar** saya dapat melacak donasi yang pernah saya berikan.

**Acceptance Criteria:**

```gherkin
Given saya adalah member yang login
When saya mengakses halaman "Wallet"
Then saya melihat saldo wallet saya
And saya melihat riwayat transaksi donasi
And setiap transaksi menampilkan tanggal, nominal, dan komunitas
```

---

### US-013: Mengajukan Role Community Owner

**Sebagai** member, **saya ingin** mengajukan role Community Owner, **agar** saya dapat membuat dan mengelola komunitas sendiri.

**Acceptance Criteria:**

```gherkin
Given saya adalah member yang login
When saya mengakses menu "Ajukan Role"
And saya memilih "Community Owner"
And saya mengisi nama komunitas, deskripsi, kategori, dan alasan
And saya mengklik tombol "Kirim Pengajuan"
Then pengajuan saya dibuat dengan status "pending"
And saya melihat pesan "Pengajuan berhasil dikirim"
And superadmin menerima notifikasi
```

---

### US-014: Mengajukan Role Brand Owner

**Sebagai** member, **saya ingin** mengajukan role Brand Owner, **agar** saya dapat membuat profil brand dan berkolaborasi dengan komunitas.

**Acceptance Criteria:**

```gherkin
Given saya adalah member yang login
When saya mengakses menu "Ajukan Role"
And saya memilih "Brand Owner"
And saya mengisi nama brand, deskripsi, dan logo
And saya mengklik tombol "Kirim Pengajuan"
Then pengajuan saya dibuat dengan status "pending"
And saya melihat pesan "Pengajuan berhasil dikirim"
And superadmin menerima notifikasi
```

---

### US-015: Edit Profil

**Sebagai** member, **saya ingin** mengedit profil saya, **agar** saya dapat memperbarui informasi pribadi.

**Acceptance Criteria:**

```gherkin
Given saya adalah member yang login
When saya mengakses halaman profil
And saya mengklik tombol "Edit Profil"
And saya memperbarui data (nama, bio, lokasi, foto)
And saya mengklik tombol "Simpan"
Then profil saya berhasil diperbarui
And perubahan terlihat di profil
```

---

## 3. Community Owner Stories

### US-016: Membuat Komunitas

**Sebagai** Community Owner, **saya ingin** membuat komunitas baru, **agar** saya dapat mengelola komunitas sendiri.

**Acceptance Criteria:**

```gherkin
Given saya adalah Community Owner yang login
When saya mengklik "Buat Komunitas"
And saya mengisi nama, deskripsi, kategori, logo, dan visi-misi
And saya mengklik tombol "Buat Komunitas"
Then komunitas saya dibuat dengan status "pending"
And saya melihat pesan "Komunitas berhasil dibuat"
And komunitas dikirim ke superadmin untuk approval
```

---

### US-017: Mengelola Anggota Komunitas

**Sebagai** Community Owner, **saya ingin** mengelola anggota komunitas, **agar** saya dapat mengontrol siapa yang menjadi anggota.

**Acceptance Criteria:**

```gherkin
Given saya adalah Community Owner yang login
When saya mengakses halaman "Manajemen Anggota"
Then saya melihat daftar join request pending
And saya dapat approve atau reject join request
And saya dapat melihat daftar anggota aktif
And saya dapat menghapus anggota dari komunitas
And saya dapat menetapkan role untuk anggota
```

---

### US-018: Membuat Event

**Sebagai** Community Owner, **saya ingin** membuat event baru, **agar** saya dapat mengadakan aktivitas untuk anggota komunitas.

**Acceptance Criteria:**

```gherkin
Given saya adalah Community Owner yang login
When saya mengklik "Buat Event"
And saya mengisi judul, deskripsi, tanggal, lokasi, kuota
And saya mengklik tombol "Buat Event"
Then event saya dibuat dengan status "pending"
And event dikirim ke superadmin untuk approval
And anggota komunitas menerima notifikasi
```

---

### US-019: Upload Galeri

**Sebagai** Community Owner, **saya ingin** mengupload foto dan video ke galeri, **agar** saya dapat mendokumentasikan aktivitas komunitas.

**Acceptance Criteria:**

```gherkin
Given saya adalah Community Owner yang login
When saya mengakses halaman "Galeri"
And saya mengklik "Upload Foto/Video"
And saya memilih file dan mengisi judul
And saya mengklik tombol "Upload"
Then file berhasil diupload
And file muncul di galeri komunitas
```

---

### US-020: Kirim Pesan di Chat

**Sebagai** Community Owner, **saya ingin** mengirim pesan ke anggota komunitas, **agar** saya dapat berkomunikasi dengan anggota.

**Acceptance Criteria:**

```gherkin
Given saya adalah Community Owner yang login
When saya mengakses halaman "Chat" komunitas
And saya mengetik pesan
And saya mengklik tombol "Kirim"
Then pesan saya terkirim
And pesan muncul di chat room
And anggota dapat melihat pesan saya
```

---

### US-021: Menerima Kolaborasi

**Sebagai** Community Owner, **saya ingin** menerima pengajuan kolaborasi dari brand, **agar** komunitas saya dapat bekerja sama dengan brand.

**Acceptance Criteria:**

```gherkin
Given saya adalah Community Owner yang login
When saya mengakses halaman "Kolaborasi"
And saya melihat pengajuan kolaborasi pending
And saya mengklik "Terima"
Then status kolaborasi berubah menjadi "accepted"
And brand owner menerima notifikasi
And kolaborasi tercatat di sistem
```

---

### US-022: Melihat Dashboard Komunitas

**Sebagai** Community Owner, **saya ingin** melihat dashboard komunitas, **agar** saya dapat memantau aktivitas dan statistik komunitas.

**Acceptance Criteria:**

```gherkin
Given saya adalah Community Owner yang login
When saya mengakses dashboard
Then saya melihat total anggota aktif
And saya melihat jumlah event aktif
And saya melihat total donasi
And saya melihat jumlah galeri
And saya dapat mengakses shortcut ke manajemen
```

---

## 4. Brand Owner Stories

### US-023: Membuat Profil Brand

**Sebagai** Brand Owner, **saya ingin** membuat profil brand, **agar** brand saya dapat dikenal oleh komunitas.

**Acceptance Criteria:**

```gherkin
Given saya adalah Brand Owner yang login
When saya mengakses menu "Brand"
And saya mengklik "Buat Profil Brand"
And saya mengisi nama, deskripsi, logo, website
And saya mengklik tombol "Simpan"
Then profil brand saya dibuat dengan status "pending"
And profil dikirim ke superadmin untuk approval
```

---

### US-024: Mencari Komunitas untuk Kolaborasi

**Sebagai** Brand Owner, **saya ingin** mencari komunitas untuk kolaborasi, **agar** saya dapat menemukan komunitas yang sesuai dengan target market.

**Acceptance Criteria:**

```gherkin
Given saya adalah Brand Owner yang login
When saya mengakses halaman "Komunitas"
Then saya melihat daftar komunitas publik
And saya dapat mencari berdasarkan kategori
And saya dapat melihat detail komunitas
And saya dapat mengklik "Ajukan Kolaborasi"
```

---

### US-025: Mengajukan Kolaborasi

**Sebagai** Brand Owner, **saya ingin** mengajukan kolaborasi ke komunitas, **agar** saya dapat menjalankan campaign atau sponsorship.

**Acceptance Criteria:**

```gherkin
Given saya adalah Brand Owner yang login
When saya mengakses detail komunitas
And saya mengklik "Ajukan Kolaborasi"
And saya mengisi tipe kolaborasi, deskripsi, durasi, benefit
And saya mengklik tombol "Kirim Pengajuan"
Then pengajuan kolaborasi dibuat dengan status "pending"
And komunitas menerima notifikasi
```

---

### US-026: Membuat Campaign

**Sebagai** Brand Owner, **saya ingin** membuat campaign, **agar** saya dapat menjalankan aktivitas marketing melalui platform.

**Acceptance Criteria:**

```gherkin
Given saya adalah Brand Owner yang login
When saya mengakses halaman "Campaign"
And saya mengklik "Buat Campaign"
And saya mengisi nama campaign, deskripsi, target, durasi
And saya mengklik tombol "Buat Campaign"
Then campaign saya berhasil dibuat
And campaign muncul di dashboard brand
```

---

### US-027: Melihat Dashboard Brand

**Sebagai** Brand Owner, **saya ingin** melihat dashboard brand, **agar** saya dapat memantau aktivitas dan statistik brand.

**Acceptance Criteria:**

```gherkin
Given saya adalah Brand Owner yang login
When saya mengakses dashboard brand
Then saya melihat jumlah kolaborasi aktif
And saya melihat jumlah campaign
And saya melihat komunitas yang berkolaborasi
And saya dapat mengakses shortcut ke fitur lain
```

---

## 5. Superadmin Stories

### US-028: Approve Role Request

**Sebagai** Superadmin, **saya ingin** menyetujui atau menolak pengajuan role, **agar** hanya user yang tepat yang mendapatkan role tertentu.

**Acceptance Criteria:**

```gherkin
Given saya adalah Superadmin yang login
When saya mengakses halaman "Approval"
And saya melihat daftar role request pending
And saya memilih role request
And saya mengklik "Approve" atau "Reject"
Then status role request berubah
And user menerima notifikasi
And jika approve, role ditambahkan ke user
```

---

### US-029: Approve Komunitas

**Sebagai** Superadmin, **saya ingin** menyetujui komunitas baru, **agar** hanya komunitas valid yang muncul di direktori.

**Acceptance Criteria:**

```gherkin
Given saya adalah Superadmin yang login
When saya mengakses halaman "Approval"
And saya melihat daftar komunitas pending
And saya memilih komunitas
And saya mengklik "Approve"
Then status komunitas berubah menjadi "approved"
And komunitas muncul di direktori publik
And community owner menerima notifikasi
```

---

### US-030: Approve Event

**Sebagai** Superadmin, **saya ingin** menyetujui event baru, **agar** hanya event valid yang muncul di platform.

**Acceptance Criteria:**

```gherkin
Given saya adalah Superadmin yang login
When saya mengakses halaman "Approval"
And saya melihat daftar event pending
And saya memilih event
And saya mengklik "Approve"
Then status event berubah menjadi "approved"
And event muncul di daftar event
And community owner menerima notifikasi
```

---

### US-031: Melihat Dashboard Platform

**Sebagai** Superadmin, **saya ingin** melihat dashboard platform, **agar** saya dapat memantau pertumbuhan dan kesehatan platform.

**Acceptance Criteria:**

```gherkin
Given saya adalah Superadmin yang login
When saya mengakses dashboard
Then saya melihat total user terdaftar
And saya melihat total komunitas
And saya melihat total brand
And saya melihat total event
And saya melihat total revenue
And saya melihat pertumbuhan bulanan
```

---

### US-032: Melihat Data Member

**Sebagai** Superadmin, **saya ingin** melihat seluruh data member, **agar** saya dapat mengawasi pengguna platform.

**Acceptance Criteria:**

```gherkin
Given saya adalah Superadmin yang login
When saya mengakses halaman "Members"
Then saya melihat daftar seluruh member
And saya dapat mencari member berdasarkan nama atau email
And saya dapat melihat detail profil member
And saya dapat memfilter berdasarkan role
```

---

### US-033: Melihat Data Komunitas

**Sebagai** Superadmin, **saya ingin** melihat seluruh data komunitas, **agar** saya dapat mengawasi komunitas di platform.

**Acceptance Criteria:**

```gherkin
Given saya adalah Superadmin yang login
When saya mengakses halaman "Komunitas"
Then saya melihat daftar seluruh komunitas
And saya dapat mencari komunitas berdasarkan nama
And saya dapat melihat detail komunitas
And saya dapat memfilter berdasarkan status
```

---

## Ringkasan User Stories

| No | Role | Jumlah Story |
|----|------|-------------|
| 1 | Visitor | 6 |
| 2 | Member | 9 |
| 3 | Community Owner | 7 |
| 4 | Brand Owner | 5 |
| 5 | Superadmin | 6 |
| | **Total** | **33** |

---

## Dokumen Terkait

- [BRD.md](./BRD.md) - Business Requirements Document
- [PRD.md](./PRD.md) - Product Requirements Document
- [User-Requirements.md](./User-Requirements.md) - User Requirements
- [Functional-Requirements.md](./Functional-Requirements.md) - Functional Requirements
- [Non-Functional-Requirements.md](./Non-Functional-Requirements.md) - Non-Functional Requirements
- [Use-Case.md](./Use-Case.md) - Use Case Diagram & Deskripsi
- [RTM.md](./RTM.md) - Requirement Traceability Matrix
