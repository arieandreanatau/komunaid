# Functional Specification — KomunaID Super Admin MVP Platform Governance

## 1. Overview

Dokumen ini mendefinisikan spesifikasi fungsional untuk modul Platform Governance pada KomunaID Super Admin MVP. Platform Governance memungkinkan super admin dan platform admin untuk mengelola seluruh aspek operasional platform KomunaID, termasuk autentikasi, pengelolaan anggota, persetujuan komunitas, manajemen event, moderasi, CMS, dan audit log.

### Arsitektur Aplikasi

| Komponen | Teknologi | Port |
|----------|-----------|------|
| Backend API | Hono REST API | 3001 |
| Frontend | Next.js 15 App Router | 3000 |
| Database | MySQL via Prisma ORM | 3306 |
| Validation | Zod schemas | - |
| Monorepo Manager | pnpm | - |

### Modul yang Dikelola

1. Authentication
2. Dashboard
3. Member Management
4. Community Approval
5. Community Management
6. Event Management
7. Volunteer Management
8. Moderation
9. CMS (Content Management System)
10. Notifications
11. Audit Log
12. Data Master
13. Security

---

## 2. Authentication Module

### 2.1 Deskripsi

Modul autentikasi menangani proses login, logout, sesi, dan manajemen akses untuk admin panel.

### 2.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| AUTH-001 | Login Admin | Admin dapat login menggunakan email dan password |
| AUTH-002 | Session Management | Sesi admin dikelola menggunakan JWT token dengan expiry time |
| AUTH-003 | Logout | Admin dapat logout dan invalidate sesi |
| AUTH-004 | Password Reset | Admin dapat mengatur ulang password melalui email |
| AUTH-005 | Login History | Sistem mencatat setiap percobaan login (berhasil/gagal) |
| AUTH-006 | Two-Factor Authentication | Admin dapat mengaktifkan 2FA menggunakan TOTP |

### 2.3 User Stories

- **US-AUTH-001**: Sebagai super admin, saya ingin login ke panel admin menggunakan email dan password sehingga saya dapat mengakses dashboard.
- **US-AUTH-002**: Sebagai platform admin, saya ingin melihat riwayat login saya sehingga saya dapat memantau keamanan akun saya.
- **US-AUTH-003**: Sebagai super admin, saya ingin mengatur ulang password platform admin yang lupa password sehingga admin dapat mengakses kembali panel.

### 2.4 Acceptance Criteria

- [ ] Admin dapat login dengan email dan password yang valid
- [ ] Sistem menolak login dengan credentials yang salah dan menampilkan pesan error umum
- [ ] JWT token expires setelah 24 jam
- [ ] Setiap percobaan login dicatat ke tabel `LoginHistory` dengan IP address, user agent, timestamp
- [ ] Admin dapat melihat daftar percobaan login di halaman profil
- [ ] Logout menghapus token dari sisi client dan memblacklist token di server
- [ ] Password harus minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol

---

## 3. Dashboard Module

### 3.1 Deskripsi

Dashboard adalah halaman utama yang menampilkan ringkasan data platform secara real-time.

### 3.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| DASH-001 | Statistik Ringkasan | Menampilkan jumlah total anggota, komunitas, event, dan volunteer aktif |
| DASH-002 | Grafik Pertumbuhan | Menampilkan grafik pertumbuhan anggota dan komunitas per bulan |
| DASH-003 | Aktivitas Terkini | Menampilkan daftar aktivitas terbaru di platform (10 terakhir) |
| DASH-004 | Komunitas Pending Review | Menampilkan jumlah komunitas yang menunggu persetujuan |
| DASH-005 | Laporan Moderasi | Menampilkan jumlah laporan moderasi yang belum ditangani |
| DASH-006 | Quick Actions | Menyediakan akses cepat ke aksi admin yang sering digunakan |

### 3.3 User Stories

- **US-DASH-001**: Sebagai admin, saya ingin melihat ringkasan statistik platform di dashboard sehingga saya dapat memahami kondisi platform secara cepat.
- **US-DASH-002**: Sebagai admin, saya ingin melihat grafik pertumbuhan sehingga saya dapat menganalisis tren platform.
- **US-DASH-003**: Sebagai admin, saya ingin melihat komunitas yang perlu persetujuan sehingga saya dapat segera menindaklanjuti.

### 3.4 Acceptance Criteria

- [ ] Dashboard menampilkan minimal 4 kartu statistik utama (anggota, komunitas, event, volunteer)
- [ ] Grafik pertumbuhan menampilkan data 6 bulan terakhir
- [ ] Aktivitas terkini menampilkan 10 aktivitas terbaru dengan timestamp relatif
- [ ] Komunitas pending review ditampilkan dengan jumlah dan tombol aksi cepat
- [ ] Data dashboard di-refresh secara periodik setiap 60 detik
- [ ] Dashboard responsif untuk desktop dan tablet

---

## 4. Member Management Module

### 4.1 Deskripsi

Modul pengelolaan anggota memungkinkan admin melihat, mencari, memfilter, dan mengelola semua anggota terdaftar di platform.

### 4.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| MEM-001 | Daftar Anggota | Menampilkan daftar semua anggota dengan paginasi |
| MEM-002 | Pencarian Anggota | Mencari anggota berdasarkan nama, email, atau ID |
| MEM-003 | Filter Anggota | Memfilter anggota berdasarkan status, role, tanggal registrasi |
| MEM-004 | Detail Anggota | Melihat detail profil lengkap anggota |
| MEM-005 | Nonaktifkan Akun | Menonaktifkan akun anggota (soft delete) |
| MEM-006 | Aktifkan Kembali | Mengaktifkan kembali akun yang dinonaktifkan |
| MEM-007 | Reset Password | Mereset password anggota dan mengirimkan email notifikasi |
| MEM-008 | Assign Role | Mengubah role anggota (MEMBER, COMMUNITY_ADMIN, PLATFORM_ADMIN) |
| MEM-009 | Export Data | Mengekspor data anggota ke format CSV |
| MEM-010 | Lihat Komunitas Anggota | Melihat daftar komunitas yang diikuti anggota |

### 4.3 User Stories

- **US-MEM-001**: Sebagai admin, saya ingin melihat daftar semua anggota dengan paginasi sehingga saya dapat mengelola anggota secara efisien.
- **US-MEM-002**: Sebagai admin, saya ingin mencari anggota berdasarkan nama atau email sehingga saya dapat menemukan anggota tertentu dengan cepat.
- **US-MEM-003**: Sebagai admin, saya ingin menonaktifkan akun anggota yang melanggar kebijakan sehingga platform tetap aman.
- **US-MEM-004**: Sebagai admin, saya ingin mengekspor data anggota ke CSV sehingga saya dapat menganalisis data di luar platform.

### 4.4 Acceptance Criteria

- [ ] Daftar anggota menampilkan: nama, email, status, role, tanggal registrasi, jumlah komunitas
- [ ] Paginasi default 20 item per halaman dengan opsi 10, 20, 50, 100
- [ ] Pencarian mengembalikan hasil dalam waktu < 500ms
- [ ] Filter mendukung kombinasi filter (status + role + tanggal)
- [ ] Nonaktifkan akun memerlukan konfirmasi modal dengan alasan
- [ ] Aktivasi kembali mengembalikan semua data anggota
- [ ] Reset password mengirim email ke anggota dengan link reset
- [ ] Export CSV berisi semua field yang ditampilkan di daftar
- [ ] Semua aksi admin tercatat di audit log

---

## 5. Community Approval Module

### 5.1 Deskripsi

Modul persetujuan komunitas menangani alur persetujuan komunitas baru yang diajukan oleh pengguna.

### 5.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| CAPP-001 | Daftar Pending Review | Menampilkan daftar komunitas yang menunggu persetujuan |
| CAPP-002 | Review Komunitas | Melihat detail komunitas yang diajukan |
| CAPP-003 | Setujui Komunitas | Menyetujui komunitas dan mengubah status ke APPROVED |
| CAPP-004 | Minta Revisi | Meminta revisi pada komunitas dengan catatan perubahan |
| CAPP-005 | Tolak Komunitas | Menolak komunitas dengan alasan penolakan |
| CAPP-006 | Riwayat Keputusan | Melihat riwayat keputusan persetujuan komunitas |

### 5.3 User Stories

- **US-CAPP-001**: Sebagai admin, saya ingin melihat daftar komunitas yang menunggu persetujuan sehingga saya dapat segera memprosesnya.
- **US-CAPP-002**: Sebagai admin, saya ingin meninjau detail komunitas sebelum menyetujui sehingga saya dapat memastikan komunitas memenuhi standar.
- **US-CAPP-003**: Sebagai admin, saya ingin meminta revisi jika komunitas belum lengkap sehingga pengaju dapat memperbaikinya.
- **US-CAPP-004**: Sebagai admin, saya ingin menolak komunitas yang tidak memenuhi syarat dengan alasan yang jelas.

### 5.4 Acceptance Criteria

- [ ] Daftar pending review menampilkan: nama komunitas, kategori, tanggal pengajuan, pengaju
- [ ] Status komunitas berubah: `DRAFT` → `PENDING_REVIEW` → `APPROVED` / `NEED_REVISION` / `REJECTED`
- [ ] Persetujuan memerlukan minimal 1 admin dengan role PLATFORM_ADMIN atau SUPER_ADMIN
- [ ] Catatan wajib diisi saat meminta revisi atau menolak
- [ ] Notifikasi email dikirim ke pengaju saat status berubah
- [ ] Riwayat keputusan mencatat: admin yang做出 keputusan, waktu, status sebelumnya, status baru, catatan

---

## 6. Community Management Module

### 6.1 Deskripsi

Modul pengelolaan komunitas memungkinkan admin mengelola komunitas yang sudah disetujui.

### 6.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| CMGT-001 | Daftar Komunitas | Menampilkan daftar semua komunitas aktif |
| CMGT-002 | Detail Komunitas | Melihat detail komunitas termasuk anggota dan aktivitas |
| CMGT-003 | Suspensi Komunitas | Menangguhkan komunitas yang melanggar kebijakan |
| CMGT-004 | Aktivasi Kembali | Mengaktifkan kembali komunitas yang ditangguhkan |
| CMGT-005 | Hapus Komunitas | Menghapus komunitas secara permanen (hard delete) |
| CMGT-006 | Kelola Kategori | Menambah, mengedit, menghapus kategori komunitas |
| CMGT-007 | Statistik Komunitas | Melihat statistik pertumbuhan dan aktivitas komunitas |

### 6.3 User Stories

- **US-CMGT-001**: Sebagai admin, saya ingin melihat semua komunitas aktif sehingga saya dapat memantau pertumbuhan platform.
- **US-CMGT-002**: Sebagai admin, saya ingin menangguhkan komunitas yang melanggar kebijakan sehingga platform tetap aman.
- **US-CMGT-003**: Sebagai admin, saya ingin mengelola kategori komunitas sehingga pengguna dapat menemukan komunitas dengan mudah.

### 6.4 Acceptance Criteria

- [ ] Daftar komunitas menampilkan: nama, kategori, jumlah anggota, status, tanggal dibuat
- [ ] Suspensi komunitas memerlukan konfirmasi dan alasan
- [ ] Komunitas yang ditangguhkan tidak dapat diakses oleh anggota
- [ ] Hapus komunitas memerlukan 2 konfirmasi berturut-turut
- [ ] Kategori komunitas unik (case-insensitive)
- [ ] Semua aksi tercatat di audit log

---

## 7. Event Management Module

### 7.1 Deskripsi

Modul pengelolaan event memungkinkan admin mengelola event yang dibuat di seluruh platform.

### 7.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| EVT-001 | Daftar Event | Menampilkan daftar semua event dengan filter dan paginasi |
| EVT-002 | Detail Event | Melihat detail event termasuk peserta dan lokasi |
| EVT-003 | Batalkan Event | Membatalkan event yang sudah dijadwalkan |
| EVT-004 | Edit Event | Mengedit detail event yang sudah ada |
| EVT-005 | Hapus Event | Menghapus event secara permanen |
| EVT-006 | Approve Event | Menyetujui event publik yang diajukan komunitas |
| EVT-007 | Rekap Peserta | Melihat rekap data peserta event |
| EVT-008 | Export Peserta | Mengekspor data peserta event ke CSV |

### 7.3 User Stories

- **US-EVT-001**: Sebagai admin, saya ingin melihat semua event di platform sehingga saya dapat memantau aktivitas event.
- **US-EVT-002**: Sebagai admin, saya ingin membatalkan event yang bermasalah sehingga anggota tidak hadir ke event yang sudah tidak ada.
- **US-EVT-003**: Sebagai admin, saya ingin mengekspor data peserta event sehingga saya dapat membuat laporan.

### 7.4 Acceptance Criteria

- [ ] Daftar event menampilkan: nama event, komunitas penyelenggara, tanggal, status, jumlah peserta
- [ ] Filter event berdasarkan: status (upcoming, ongoing, completed, cancelled), komunitas, tanggal rentang
- [ ] Pembatalan event memerlukan konfirmasi dan alasan
- [ ] Pembatalan event mengirim notifikasi ke semua peserta terdaftar
- [ ] Export CSV berisi: nama peserta, email, status kehadiran, tanggal registrasi
- [ ] Semua aksi tercatat di audit log

---

## 8. Volunteer Management Module

### 8.1 Deskripsi

Modul pengelolaan volunteer memungkinkan admin mengelola data relawan yang terdaftar di platform.

### 8.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| VOL-001 | Daftar Volunteer | Menampilkan daftar semua volunteer dengan status |
| VOL-002 | Detail Volunteer | Melihat detail profil dan histori volunteer |
| VOL-003 | Assign Event | Menugaskan volunteer ke event tertentu |
| VOL-004 | Unassign Event | Mencabut penugasan volunteer dari event |
| VOL-005 | Approve Volunteer | Menyetujui pendaftaran volunteer |
| VOL-006 | Revoke Volunteer | Mencabut status volunteer |
| VOL-007 | Statistik Volunteer | Melihat statistik jumlah volunteer aktif dan penugasan |
| VOL-008 | Export Data | Mengekspor data volunteer ke CSV |

### 8.3 User Stories

- **US-VOL-001**: Sebagai admin, saya ingin melihat daftar semua volunteer sehingga saya dapat mengelola penugasan mereka.
- **US-VOL-002**: Sebagai admin, saya ingin menugaskan volunteer ke event sehingga event memiliki tenaga relawan yang cukup.
- **US-VOL-003**: Sebagai admin, saya ingin melihat statistik volunteer sehingga saya dapat merencanakan kebutuhan relawan.

### 8.4 Acceptance Criteria

- [ ] Daftar volunteer menampilkan: nama, email, status, jumlah event yang diikuti, tanggal bergabung
- [ ] Filter volunteer berdasarkan: status (active, inactive, pending), jumlah penugasan
- [ ] Assign event memerlukan konfirmasi dan menampilkan sisa kuota event
- [ ] Unassign event memerlukan alasan dan notifikasi ke volunteer
- [ ] Statistik menampilkan: total volunteer aktif, rata-rata penugasan per volunteer, volunteer paling aktif
- [ ] Export CSV berisi semua field yang ditampilkan di daftar

---

## 9. Moderation Module

### 9.1 Deskripsi

Modul moderasi menangani laporan konten dan perilaku yang melanggar kebijakan platform.

### 9.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| MOD-001 | Daftar Laporan | Menampilkan daftar laporan yang masuk dengan status |
| MOD-002 | Review Laporan | Melihat detail laporan termasuk konten yang dilaporkan |
| MOD-003 | Beri Peringatan | Mengirim peringatan kepada pengguna yang melanggar |
| MOD-004 | Suspend Pengguna | Menangguhkan akun pengguna yang melanggar |
| MOD-005 | Hapus Konten | Menghapus konten yang melanggar kebijakan |
| MOD-006 | Dismiss Laporan | Menolak laporan jika tidak melanggar kebijakan |
| MOD-007 | Appeal | Menangani banding dari pengguna yang ditangguhkan |
| MOD-008 | Histori Moderasi | Melihat riwayat tindakan moderasi per pengguna |

### 9.3 User Stories

- **US-MOD-001**: Sebagai admin, saya ingin melihat daftar laporan sehingga saya dapat menindaklanjuti pelanggaran dengan cepat.
- **US-MOD-002**: Sebagai admin, saya ingin memberikan peringatan kepada pengguna sehingga mereka mengetahui pelanggaran yang dilakukan.
- **US-MOD-003**: Sebagai admin, saya ingin menangguhkan pengguna yang berulang kali melanggar sehingga platform tetap aman.
- **US-MOD-004**: Sebagai admin, saya ingin menangani banding dari pengguna yang ditangguhkan sehingga ada proses yang adil.

### 9.4 Acceptance Criteria

- [ ] Daftar laporan menampilkan: jenis pelaporan, pengguna dilaporkan, pelapor, tanggal, status, prioritas
- [ ] Status laporan: `REPORTED` → `UNDER_REVIEW` → `WARNING` / `SUSPENDED` / `DISMISSED`
- [ ] Peringatan mencatat jumlah pelanggaran dan level peringatan (1-3)
- [ ] Suspend > 3 pelanggaran dalam 30 hari = suspend permanen (requires SUPER_ADMIN approval)
- [ ] Appeal dapat diajukan dalam 7 hari setelah suspend
- [ ] Notifikasi dikirim ke pengguna terkait setiap perubahan status
- [ ] Semua tindakan moderasi tercatat di audit log

---

## 10. CMS Module

### 10.1 Deskripsi

Modul CMS (Content Management System) memungkinkan admin mengelola konten statis dan banner di platform.

### 10.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| CMS-001 | Kelola Halaman | Membuat, mengedit, menghapus halaman statis (About, FAQ, Terms) |
| CMS-002 | Rich Text Editor | Editor teks kaya untuk konten halaman |
| CMS-003 | Kelola Banner | Membuat, mengedit, menghapus banner promosi |
| CMS-004 | Preview Halaman | Melihat pratinjau halaman sebelum dipublikasikan |
| CMS-005 | Publish/Unpublish | Mempublikasikan atau menarik halaman dari akses publik |
| CMS-006 | Versi Konten | Menyimpan riwayat perubahan konten (versioning) |
| CMS-007 | Banner Schedule | Menjadwalkan waktu tampil banner |
| CMS-008 | Upload Media | Mengunggah gambar untuk konten dan banner |

### 10.3 User Stories

- **US-CMS-001**: Sebagai admin, saya ingin membuat halaman statis sehingga pengguna dapat mengakses informasi penting.
- **US-CMS-002**: Sebagai admin, saya ingin mengelola banner promosi sehingga pengguna mengetahui event atau informasi terbaru.
- **US-CMS-003**: Sebagai admin, saya ingin mempratinjau konten sebelum dipublikasikan sehingga tidak ada kesalahan.

### 10.4 Acceptance Criteria

- [ ] Halaman statis memiliki: judul, slug (auto-generated), konten (rich text), status (draft/published), author, timestamps
- [ ] Banner memiliki: judul, gambar, URL tujuan, urutan tampil, jadwal tampil, status
- [ ] Slug halaman unik dan URL-safe
- [ ] Preview menampilkan konten persis seperti yang akan ditampilkan di frontend
- [ ] Publish memerlukan konfirmasi
- [ ] Riwayat versi menyimpan: konten sebelumnya, timestamp, admin yang mengubah
- [ ] Banner yang sudah kadaluarsa tidak ditampilkan
- [ ] Upload gambar: format JPG, PNG, WebP; maks 5MB

---

## 11. Notifications Module

### 11.1 Deskripsi

Modul notifikasi memungkinkan admin mengelola dan memantau notifikasi yang dikirim ke pengguna.

### 11.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| NTF-001 | Daftar Notifikasi | Menampilkan daftar notifikasi yang dikirim |
| NTF-002 | Kirim Notifikasi Manual | Mengirim notifikasi manual ke pengguna atau grup |
| NTF-003 | Template Notifikasi | Mengelola template notifikasi |
| NTF-004 | Notifikasi Bulk | Mengirim notifikasi massal ke seluruh pengguna |
| NTF-005 | Riwayat Kirim | Melihat riwayat pengiriman notifikasi |
| NTF-006 | Statistik | Melihat statistik notifikasi (terkirim, dibaca, diklik) |
| NTF-007 | Canal Settings | Mengatur channel notifikasi (email, push, in-app) |

### 11.3 User Stories

- **US-NTF-001**: Sebagai admin, saya ingin mengirim notifikasi manual sehingga saya dapat menginformasikan pengguna tentang pembaruan penting.
- **US-NTF-002**: Sebagai admin, saya ingin mengirim notifikasi massal sehingga semua pengguna mendapatkan informasi yang sama.
- **US-NTF-003**: Sebagai admin, saya ingin melihat statistik notifikasi sehingga saya dapat mengevaluasi efektivitas komunikasi.

### 11.4 Acceptance Criteria

- [ ] Notifikasi manual memerlukan: judul, pesan, penerima (single/grup/all), channel (email/push/in-app)
- [ ] Notifikasi bulk memiliki batas 10.000 penerima per pengiriman
- [ ] Template notifikasi mendukung variabel dinamis (nama pengguna, nama komunitas, dll)
- [ ] Riwayat kirim mencatat: waktu, penerima, channel, status pengiriman
- [ ] Statistik menampilkan: total terkirim, terkirim berhasil, dibaca, diklik, bounce rate
- [ ] Notifikasi in-app muncul secara real-time tanpa refresh

---

## 12. Audit Log Module

### 12.1 Deskripsi

Modul audit log mencatat semua aktivitas admin dan perubahan data di platform untuk keamanan dan compliance.

### 12.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| AUD-001 | Daftar Audit Log | Menampilkan daftar semua aktivitas tercatat |
| AUD-002 | Filter Log | Memfilter berdasarkan admin, aksi, resource, rentang waktu |
| AUD-003 | Detail Log | Melihat detail perubahan data (before/after) |
| AUD-004 | Export Log | Mengekspor log ke format CSV atau JSON |
| AUD-005 | Retention Policy | Menentukan masa retensi log (default: 1 tahun) |
| AUD-006 | Real-time Stream | Menampilkan log aktivitas secara real-time |

### 12.3 User Stories

- **US-AUD-001**: Sebagai super admin, saya ingin melihat semua aktivitas admin sehingga saya dapat memantau keamanan platform.
- **US-AUD-002**: Sebagai super admin, saya ingin memfilter log berdasarkan admin tertentu sehingga saya dapat meninjau aktivitas admin spesifik.
- **US-AUD-003**: Sebagai super admin, saya ingin mengekspor log sehingga saya dapat menyimpannya untuk keperluan audit eksternal.

### 12.4 Acceptance Criteria

- [ ] Setiap aksi admin mencatat: admin_id, action, resource_type, resource_id, before_data, after_data, ip_address, user_agent, timestamp
- [ ] Filter mendukung: admin (multi-select), action (multi-select), resource_type, timestamp range
- [ ] Detail log menampilkan diff perubahan data secara visual (added/removed/modified)
- [ ] Export mendukung format CSV dan JSON dengan filter yang sama dengan tampilan
- [ ] Log tidak dapat dihapus atau dimodifikasi oleh siapapun (immutable)
- [ ] Retention policy otomatis mengarsipkan log setelah masa retensi berakhir
- [ ] Real-time stream menggunakan WebSocket atau Server-Sent Events

---

## 13. Data Master Module

### 13.1 Deskripsi

Modul data master memungkinkan admin mengelola data referensi yang digunakan di seluruh platform.

### 13.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| DM-001 | Kelola Kategori | Menambah, mengedit, menghapus kategori komunitas |
| DM-002 | Kelola Tag | Menambah, mengedit, menghapus tag |
| DM-003 | Kelola Skills | Menambah, mengedit, menghapus keahlian untuk volunteer |
| DM-004 | Kelola Lokasi | Menambah, mengedit, menghapus data lokasi |
| DM-005 | Kelola Config | Mengelola konfigurasi platform (nama, deskripsi, logo) |
| DM-006 | Import/Export | Mengimport dan mengekspor data master |

### 13.3 User Stories

- **US-DM-001**: Sebagai admin, saya ingin mengelola kategori komunitas sehingga komunitas dapat diklasifikasikan dengan benar.
- **US-DM-002**: Sebagai admin, saya ingin mengelola data keahlian sehingga volunteer dapat di-matching dengan event yang sesuai.

### 13.4 Acceptance Criteria

- [ ] Semua data master memiliki: nama, deskripsi (opsional), urutan, status (active/inactive)
- [ ] Nama data master unik per tipe (kategori, tag, skill, lokasi)
- [ ] Data master yang sedang digunakan tidak dapat dihapus (harus dinonaktifkan terlebih dahulu)
- [ ] Import mendukung format CSV dengan validasi sebelum insert
- [ ] Export menghasilkan file CSV dengan semua data master per tipe
- [ ] Konfigurasi platform bersifat key-value dan dapat diubah secara real-time

---

## 14. Security Module

### 14.1 Deskripsi

Modul keamanan memungkinkan admin mengelola pengaturan keamanan platform.

### 14.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| SEC-001 | Session Management | Melihat dan mengelola sesi aktif semua admin |
| SEC-002 | Revoke Session | Mencabut sesi admin tertentu |
| SEC-003 | IP Whitelist | Mengatur whitelist IP untuk akses admin |
| SEC-004 | Rate Limiting | Mengatur rate limiting untuk API endpoints |
| SEC-005 | Password Policy | Mengatur kebijakan password (panjang, kompleksitas, expiry) |
| SEC-006 | Login Attempts | Mengatur batas percobaan login sebelum lockout |
- **SEC-007**: Security Alerts | Melihat alert keamanan (multiple failed logins, suspicious activity)

### 14.3 User Stories

- **US-SEC-001**: Sebagai super admin, saya ingin melihat semua sesi aktif sehingga saya dapat mendeteksi akses tidak sah.
- **US-SEC-002**: Sebagai super admin, saya ingin mencabut sesi admin tertentu sehingga saya dapat mengamankan akses.
- **US-SEC-003**: Sebagai super admin, saya ingin mengatur password policy sehingga semua admin menggunakan password yang aman.

### 14.4 Acceptance Criteria

- [ ] Session management menampilkan: admin, IP, user agent, waktu login, waktu aktivitas terakhir
- [ ] Revoke session memerlukan konfirmasi dan notifikasi ke admin yang sesi-nya dicabut
- [ ] IP whitelist: admin hanya dapat login dari IP yang terdaftar (opsional)
- [ ] Rate limiting: 100 request per menit per admin, configurable
- [ ] Password policy: minimum 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka, 1 simbol, expiry 90 hari
- [ ] Login attempts: maks 5 gagal dalam 15 menit, lockout 30 menit
- [ ] Security alerts ditampilkan di dashboard dengan level (low, medium, high, critical)

---

## 15. Settings Module

### 15.1 Deskripsi

Modul pengaturan memungkinkan admin mengelola pengaturan umum platform dan profil admin.

### 15.2 Fitur

| ID | Fitur | Deskripsi |
|----|-------|-----------|
| SET-001 | Profil Admin | Mengedit profil admin (nama, avatar, bio) |
| SET-002 | Ubah Password | Mengubah password admin |
| SET-003 | Pengaturan Notifikasi | Mengatur preferensi notifikasi admin |
| SET-004 | Pengaturan Platform | Mengatur pengaturan umum platform (nama, deskripsi, kontak) |
| SET-005 | Pengaturan Email | Mengatur konfigurasi email (SMTP) |
| SET-006 | Pengaturan Tampilan | Mengatur tema dan tampilan platform |

### 15.3 User Stories

- **US-SET-001**: Sebagai admin, saya ingin mengedit profil saya sehingga informasi saya selalu terbaru.
- **US-SET-002**: Sebagai admin, saya ingin mengubah password saya secara berkala sehingga akun saya tetap aman.
- **US-SET-003**: Sebagai super admin, saya ingin mengatur pengaturan platform sehingga platform berfungsi sesuai kebutuhan.

### 15.4 Acceptance Criteria

- [ ] Profil admin: nama, email (readonly), avatar, bio, tanggal bergabung
- [ ] Ubah password memerlukan password saat ini dan password baru (2x input)
- [ ] Pengaturan notifikasi: email notification on/off, daily digest on/off
- [ ] Pengaturan platform: nama platform, deskripsi, logo, kontak email, kontak telepon
- [ ] Pengaturan email: SMTP host, port, username, password, from address, test send
- [ ] Pengaturan tampilan: tema (light/dark), primary color, font size
- [ ] Perubahan pengaturan platform memerlukan SUPER_ADMIN role
