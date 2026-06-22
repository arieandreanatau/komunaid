# Use Case

**Proyek:** KomunaID
**Versi:** 1.0
**Tanggal:** 22 Juni 2026
**Status:** Draft

---

## 1. Authentication

### UC-001: User Registration

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-001 |
| **Actor** | Visitor |
| **Goal** | Mendaftar akun baru di KomunaID |
| **Preconditions** | Visitor belum memiliki akun |
| **Main Flow** | 1. Visitor mengakses halaman register<br>2. Visitor mengisi form (nama, email, password, konfirmasi password)<br>3. Visitor mengklik tombol "Daftar"<br>4. Sistem memvalidasi input<br>5. Sistem membuat akun baru dengan role "member"<br>6. Sistem mengirim email verifikasi<br>7. Sistem redirect ke dashboard member |
| **Alternative Flow** | 4a. Email sudah terdaftar → Sistem menampilkan pesan error "Email sudah digunakan" |
| **Exception Flow** | 3a. Password tidak cocok → Sistem menampilkan error validasi<br>3b. Format email tidak valid → Sistem menampilkan error validasi |
| **Postconditions** | Akun baru dibuat, user dapat login |

### UC-002: User Login

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-002 |
| **Actor** | User (terdaftar) |
| **Goal** | Login ke platform KomunaID |
| **Preconditions** | User sudah terdaftar |
| **Main Flow** | 1. User mengakses halaman login<br>2. User mengisi email dan password<br>3. User mengklik tombol "Masuk"<br>4. Sistem memvalidasi kredensial<br>5. Sistem membuat session baru<br>6. Sistem redirect ke dashboard sesuai role |
| **Alternative Flow** | 4a. Password salah → Sistem menampilkan pesan "Email atau password salah" |
| **Exception Flow** | 4a. Email tidak terdaftar → Sistem menampilkan pesan "Email atau password salah"<br>4b. Rate limit tercapai → Sistem menampilkan pesan "Terlalu banyak percobaan, coba lagi dalam X menit" |
| **Postconditions** | User berhasil login, session aktif |

### UC-003: User Logout

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-003 |
| **Actor** | User (login) |
| **Goal** | Keluar dari platform KomunaID |
| **Preconditions** | User sedang login |
| **Main Flow** | 1. User mengklik tombol "Logout"<br>2. Sistem mengakhiri session<br>3. Sistem redirect ke landing page |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Session diakhiri, user tidak dapat mengakses halaman terproteksi |

### UC-004: Forgot Password

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-004 |
| **Actor** | Visitor/User |
| **Goal** | Meminta reset password |
| **Preconditions** | User terdaftar di sistem |
| **Main Flow** | 1. User mengklik "Lupa Password"<br>2. User mengisi email<br>3. User mengklik tombol "Kirim Link Reset"<br>4. Sistem memeriksa email di database<br>5. Sistem mengirim email reset password<br>6. User menerima email dan mengklik link |
| **Alternative Flow** | 4a. Email tidak ditemukan → Sistem tetap menampilkan pesan sukses (security) |
| **Exception Flow** | 5a. Email tidak terkirim → Sistem menampilkan pesan error |
| **Postconditions** | Email reset terkirim ke user |

### UC-005: Reset Password

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-005 |
| **Actor** | User |
| **Goal** | Mengubah password baru |
| **Preconditions** | User memiliki link reset password yang valid |
| **Main Flow** | 1. User mengakses halaman reset password<br>2. User mengisi password baru dan konfirmasi<br>3. User mengklik tombol "Reset Password"<br>4. Sistem memvalidasi token<br>5. Sistem mengubah password<br>6. Sistem redirect ke halaman login |
| **Alternative Flow** | 4a. Token expired → Sistem menampilkan pesan "Link reset sudah kedaluwarsa" |
| **Exception Flow** | 3a. Password tidak cocok → Sistem menampilkan error validasi |
| **Postconditions** | Password berhasil diubah |

---

## 2. Role Request

### UC-006: Request Community Owner Role

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-006 |
| **Actor** | Member |
| **Goal** | Mengajukan role Community Owner |
| **Preconditions** | Member login, belum memiliki role CO |
| **Main Flow** | 1. Member mengakses menu "Ajukan Role"<br>2. Member memilih "Community Owner"<br>3. Member mengisi form (nama komunitas, deskripsi, kategori, alasan)<br>4. Member mengklik tombol "Kirim Pengajuan"<br>5. Sistem membuat role request (status: pending)<br>6. Sistem menampilkan pesan sukses |
| **Alternative Flow** | 3a. Member sudah mengajukan → Sistem menampilkan pesan "Anda sudah memiliki pengajuan pending" |
| **Exception Flow** | 4a. Form tidak lengkap → Sistem menampilkan error validasi |
| **Postconditions** | Pengajuan role terkirim, menunggu approval superadmin |

### UC-007: Request Brand Owner Role

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-007 |
| **Actor** | Member |
| **Goal** | Mengajukan role Brand Owner |
| **Preconditions** | Member login, belum memiliki role BO |
| **Main Flow** | 1. Member mengakses menu "Ajukan Role"<br>2. Member memilih "Brand Owner"<br>3. Member mengisi form (nama brand, deskripsi, logo, website)<br>4. Member mengklik tombol "Kirim Pengajuan"<br>5. Sistem membuat role request (status: pending)<br>6. Sistem menampilkan pesan sukses |
| **Alternative Flow** | 3a. Member sudah mengajukan → Sistem menampilkan pesan "Anda sudah memiliki pengajuan pending" |
| **Exception Flow** | 4a. Form tidak lengkap → Sistem menampilkan error validasi |
| **Postconditions** | Pengajuan role terkirim, menunggu approval superadmin |

### UC-008: Approve Role Request

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-008 |
| **Actor** | Superadmin |
| **Goal** | Menyetujui atau menolak pengajuan role |
| **Preconditions** | Superadmin login, ada role request pending |
| **Main Flow** | 1. Superadmin mengakses halaman Approval<br>2. Superadmin melihat daftar role request pending<br>3. Superadmin memilih role request untuk ditinjau<br>4. Superadmin meninjau detail pengajuan<br>5. Superadmin mengklik "Approve" atau "Reject"<br>6. Jika Reject, Superadmin mengisi alasan<br>7. Sistem memperbarui status role request<br>8. Sistem menambahkan role ke user (jika approve)<br>9. Sistem membuat notifikasi ke user |
| **Alternative Flow** | 5a. Approve → Role ditambahkan ke user<br>5b. Reject → Status berubah ke rejected |
| **Exception Flow** | 7a. User sudah memiliki role → Sistem menampilkan pesan "User sudah memiliki role ini" |
| **Postconditions** | Role request diproses, user mendapat notifikasi |

---

## 3. Public Community Directory

### UC-009: View Community List

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-009 |
| **Actor** | Visitor |
| **Goal** | Melihat daftar komunitas publik |
| **Preconditions** | Tidak ada |
| **Main Flow** | 1. Visitor mengakses halaman "Komunitas"<br>2. Sistem menampilkan daftar komunitas (status: approved)<br>3. Visitor dapat melihat nama, deskripsi, jumlah anggota<br>4. Visitor dapat mengklik komunitas untuk melihat detail |
| **Alternative Flow** | 2a. Tidak ada komunitas → Sistem menampilkan pesan "Belum ada komunitas" |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Visitor melihat daftar komunitas |

### UC-010: Search Community

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-010 |
| **Actor** | Visitor |
| **Goal** | Mencari komunitas berdasarkan kata kunci |
| **Preconditions** | Tidak ada |
| **Main Flow** | 1. Visitor mengisi kata kunci di search bar<br>2. Visitor mengklik tombol "Cari" atau menekan Enter<br>3. Sistem mencari komunitas sesuai kata kunci<br>4. Sistem menampilkan hasil pencarian |
| **Alternative Flow** | 3a. Tidak ada hasil → Sistem menampilkan pesan "Komunitas tidak ditemukan" |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Visitor melihat hasil pencarian |

### UC-011: View Community Detail

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-011 |
| **Actor** | Visitor |
| **Goal** | Melihat detail komunitas |
| **Preconditions** | Komunitas status: approved |
| **Main Flow** | 1. Visitor mengklik komunitas dari daftar<br>2. Sistem menampilkan halaman detail komunitas<br>3. Visitor melihat informasi: nama, deskripsi, logo, anggota, event, galeri<br>4. Visitor dapat melihat daftar anggota<br>5. Visitor dapat melihat event yang akan datang |
| **Alternative Flow** | 3a. Komunitas private → Visitor melihat pesan "Komunitas ini bersifat privat" |
| **Exception Flow** | 2a. Komunitas tidak ditemukan → Sistem menampilkan 404 |
| **Postconditions** | Visitor melihat detail komunitas |

---

## 4. Member Management

### UC-012: Join Community

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-012 |
| **Actor** | Member |
| **Goal** | Bergabung ke komunitas |
| **Preconditions** | Member login, belum join komunitas |
| **Main Flow** | 1. Member mengakses detail komunitas<br>2. Member mengklik tombol "Join Komunitas"<br>3. Sistem membuat join request (status: pending)<br>4. Sistem menampilkan pesan sukses<br>5. Join request dikirim ke CO untuk approval |
| **Alternative Flow** | 2a. Komunitas auto-approve → Member langsung menjadi anggota |
| **Exception Flow** | 3a. Member sudah join → Sistem menampilkan pesan "Anda sudah menjadi anggota" |
| **Postconditions** | Join request dibuat, menunggu approval CO |

### UC-013: Leave Community

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-013 |
| **Actor** | Member |
| **Goal** | Keluar dari komunitas |
| **Preconditions** | Member terdaftar di komunitas |
| **Main Flow** | 1. Member mengakses halaman komunitas saya<br>2. Member mengklik tombol "Leave Komunitas"<br>3. Sistem menampilkan konfirmasi<br>4. Member mengonfirmasi<br>5. Sistem menghapus member dari komunitas |
| **Alternative Flow** | 4a. Member membatalkan → Tidak ada perubahan |
| **Exception Flow** | 5a. Member adalah CO satu-satunya → Sistem menampilkan pesan "Anda adalah pemilik komunitas" |
| **Postconditions** | Member tidak lagi menjadi anggota komunitas |

### UC-014: Approve Join Request

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-014 |
| **Actor** | Community Owner |
| **Goal** | Menyetujui join request |
| **Preconditions** | CO login, ada join request pending |
| **Main Flow** | 1. CO mengakses halaman Manajemen Anggota<br>2. CO melihat daftar join request<br>3. CO memilih join request<br>4. CO mengklik "Approve"<br>5. Sistem menambahkan member ke komunitas<br>6. Sistem menampilkan notifikasi ke member |
| **Alternative Flow** | 4a. Reject → Status berubah ke rejected |
| **Exception Flow** | 5a. Member sudah menjadi anggota → Sistem menampilkan pesan |
| **Postconditions** | Member resmi menjadi anggota komunitas |

### UC-015: Edit Profile

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-015 |
| **Actor** | Member |
| **Goal** | Mengedit profil pribadi |
| **Preconditions** | Member login |
| **Main Flow** | 1. Member mengakses halaman profil<br>2. Member mengklik tombol "Edit Profil"<br>3. Member mengedit data (nama, bio, lokasi, foto)<br>4. Member mengklik tombol "Simpan"<br>5. Sistem memvalidasi input<br>6. Sistem memperbarui profil |
| **Alternative Flow** | 5a. Validasi gagal → Sistem menampilkan error |
| **Exception Flow** | 6a. Gagal menyimpan → Sistem menampilkan pesan error |
| **Postconditions** | Profil berhasil diperbarui |

---

## 5. Community Management

### UC-016: Create Community

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-016 |
| **Actor** | Community Owner |
| **Goal** | Membuat komunitas baru |
| **Preconditions** | CO login, memiliki role CO |
| **Main Flow** | 1. CO mengakses dashboard<br>2. CO mengklik "Buat Komunitas"<br>3. CO mengisi form (nama, deskripsi, kategori, logo, visi-misi)<br>4. CO mengklik tombol "Buat Komunitas"<br>5. Sistem memvalidasi input<br>6. Sistem membuat komunitas (status: pending)<br>7. Sistem menampilkan pesan sukses<br>8. Komunitas dikirim ke superadmin untuk approval |
| **Alternative Flow** | 5a. Validasi gagal → Sistem menampilkan error |
| **Exception Flow** | 6a. Gagal membuat → Sistem menampilkan pesan error |
| **Postconditions** | Komunitas dibuat, menunggu approval superadmin |

### UC-017: Create Sub Community

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-017 |
| **Actor** | Community Owner |
| **Goal** | Membuat sub komunitas |
| **Preconditions** | CO login, memiliki komunitas utama |
| **Main Flow** | 1. CO mengakses halaman komunitas<br>2. CO mengklik "Buat Sub Komunitas"<br>3. CO mengisi form (nama, deskripsi)<br>4. CO mengklik tombol "Buat"<br>5. Sistem membuat sub komunitas |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | 4a. Form tidak valid → Sistem menampilkan error |
| **Postconditions** | Sub komunitas berhasil dibuat |

### UC-018: Create Regional

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-018 |
| **Actor** | Community Owner |
| **Goal** | Membuat regional komunitas |
| **Preconditions** | CO login, memiliki komunitas |
| **Main Flow** | 1. CO mengakses pengaturan komunitas<br>2. CO mengklik "Tambah Regional"<br>3. CO mengisi nama regional<br>4. CO mengklik tombol "Simpan"<br>5. Sistem membuat regional baru |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | 4a. Nama regional sudah ada → Sistem menampilkan error |
| **Postconditions** | Regional berhasil dibuat |

### UC-019: Assign Member Role

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-019 |
| **Actor** | Community Owner |
| **Goal** | Menetapkan role untuk anggota komunitas |
| **Preconditions** | CO login, anggota terdaftar di komunitas |
| **Main Flow** | 1. CO mengakses halaman Manajemen Anggota<br>2. CO memilih anggota<br>3. CO mengklik "Atur Role"<br>4. CO memilih role (admin, moderator, member)<br>5. CO mengklik tombol "Simpan"<br>6. Sistem memperbarui role anggota |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | 6a. Gagal memperbarui → Sistem menampilkan error |
| **Postconditions** | Role anggota berhasil diperbarui |

---

## 6. Event Management

### UC-020: Create Event

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-020 |
| **Actor** | Community Owner |
| **Goal** | Membuat event baru |
| **Preconditions** | CO login, memiliki komunitas |
| **Main Flow** | 1. CO mengakses halaman Event<br>2. CO mengklik "Buat Event"<br>3. CO mengisi form (judul, deskripsi, tanggal, lokasi, kuota, harga)<br>4. CO mengklik tombol "Buat Event"<br>5. Sistem memvalidasi input<br>6. Sistem membuat event (status: pending)<br>7. Event dikirim ke superadmin untuk approval |
| **Alternative Flow** | 5a. Validasi gagal → Sistem menampilkan error |
| **Exception Flow** | 6a. Gagal membuat → Sistem menampilkan pesan error |
| **Postconditions** | Event dibuat, menunggu approval superadmin |

### UC-021: Register for Event

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-021 |
| **Actor** | Member |
| **Goal** | Mendaftar ke event |
| **Preconditions** | Member login, event status: approved |
| **Main Flow** | 1. Member mengakses halaman event<br>2. Member mengklik tombol "Daftar Event"<br>3. Sistem memeriksa kuota<br>4. Sistem membuat registrasi<br>5. Sistem menampilkan pesan sukses |
| **Alternative Flow** | 3a. Kuota penuh → Sistem menampilkan pesan "Kuota sudah penuh" |
| **Exception Flow** | 4a. Sudah terdaftar → Sistem menampilkan pesan "Anda sudah terdaftar" |
| **Postconditions** | Registrasi berhasil, status: confirmed |

### UC-022: View Event Calendar

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-022 |
| **Actor** | User |
| **Goal** | Melihat event dalam bentuk kalender |
| **Preconditions** | User login |
| **Main Flow** | 1. User mengakses halaman kalender<br>2. Sistem menampilkan kalender bulan ini<br>3. Sistem menampilkan event pada tanggal yang sesuai<br>4. User dapat mengklik tanggal untuk melihat detail event |
| **Alternative Flow** | 3a. Tidak ada event → Tanggal tidak ditandai |
| **Exception Flow** | Tidak ada |
| **Postconditions** | User melihat kalender dengan event |

---

## 7. Collaboration Management

### UC-023: Create Collaboration Request

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-023 |
| **Actor** | Brand Owner |
| **Goal** | Mengajukan kolaborasi ke komunitas |
| **Preconditions** | BO login, komunitas exist |
| **Main Flow** | 1. BO mengakses halaman komunitas<br>2. BO mengklik "Ajukan Kolaborasi"<br>3. BO mengisi form (tipe kolaborasi, deskripsi, durasi, benefit)<br>4. BO mengklik tombol "Kirim Pengajuan"<br>5. Sistem membuat pengajuan (status: pending)<br>6. Sistem menampilkan pesan sukses<br>7. CO menerima notifikasi |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | 4a. Form tidak valid → Sistem menampilkan error |
| **Postconditions** | Pengajuan kolaborasi terkirim |

### UC-024: Accept Collaboration

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-024 |
| **Actor** | Community Owner |
| **Goal** | Menerima pengajuan kolaborasi |
| **Preconditions** | CO login, ada pengajuan kolaborasi pending |
| **Main Flow** | 1. CO mengakses halaman Kolaborasi<br>2. CO melihat daftar pengajuan<br>3. CO memilih pengajuan<br>4. CO mengklik "Terima"<br>5. Sistem memperbarui status ke "accepted"<br>6. Sistem menampilkan notifikasi ke BO |
| **Alternative Flow** | 4a. Tolak → Status berubah ke rejected |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Kolaborasi diterima, status: active |

---

## 8. Donation and Wallet

### UC-025: Create Donation

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-025 |
| **Actor** | Member |
| **Goal** | Berdonasi ke komunitas |
| **Preconditions** | Member login, komunitas exist |
| **Main Flow** | 1. Member mengakses halaman komunitas<br>2. Member mengklik tombol "Donasi"<br>3. Member mengisi nominal donasi<br>4. Member memilih metode pembayaran (simulasi)<br>5. Member mengklik tombol "Donasi Sekarang"<br>6. Sistem memproses pembayaran simulasi<br>7. Sistem mencatat transaksi di wallet ledger<br>8. Sistem menampilkan pesan sukses |
| **Alternative Flow** | 6a. Pembayaran gagal → Sistem menampilkan pesan error |
| **Exception Flow** | 4a. Nominal tidak valid → Sistem menampilkan error<br>5a. Nominal < Rp 1.000 → Sistem menampilkan pesan "Minimal donasi Rp 1.000" |
| **Postconditions** | Donasi tercatat, wallet terupdate |

### UC-026: View Donation History

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-026 |
| **Actor** | Member |
| **Goal** | Melihat riwayat donasi |
| **Preconditions** | Member login |
| **Main Flow** | 1. Member mengakses halaman Wallet<br>2. Sistem menampilkan riwayat transaksi<br>3. Member dapat memfilter berdasarkan tanggal<br>4. Member dapat melihat detail transaksi |
| **Alternative Flow** | 3a. Tidak ada transaksi → Sistem menampilkan pesan "Belum ada transaksi" |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Member melihat riwayat donasi |

---

## 9. Gallery

### UC-027: Upload Photo

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-027 |
| **Actor** | Community Owner |
| **Goal** | Mengupload foto ke galeri komunitas |
| **Preconditions** | CO login, memiliki komunitas |
| **Main Flow** | 1. CO mengakses halaman Galeri<br>2. CO mengklik "Upload Foto"<br>3. CO memilih file foto<br>4. CO mengisi judul dan deskripsi<br>5. CO mengklik tombol "Upload"<br>6. Sistem memvalidasi file<br>7. Sistem menyimpan file dan membuat record<br>8. Sistem menampilkan pesan sukses |
| **Alternative Flow** | 6a. File tidak valid → Sistem menampilkan error |
| **Exception Flow** | 7a. Gagal menyimpan → Sistem menampilkan pesan error |
| **Postconditions** | Foto berhasil diupload |

### UC-028: View Gallery

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-028 |
| **Actor** | User |
| **Goal** | Melihat galeri komunitas |
| **Preconditions** | Komunitas public atau user adalah anggota |
| **Main Flow** | 1. User mengakses halaman Galeri komunitas<br>2. Sistem menampilkan daftar foto/video<br>3. User dapat mengklik item untuk melihat detail<br>4. User dapat memfilter (foto/video) |
| **Alternative Flow** | 2a. Galeri kosong → Sistem menampilkan pesan "Belum ada galeri" |
| **Exception Flow** | Tidak ada |
| **Postconditions** | User melihat galeri komunitas |

---

## 10. Chat

### UC-029: Send Message

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-029 |
| **Actor** | Anggota Komunitas |
| **Goal** | Mengirim pesan di chat komunitas |
| **Preconditions** | Anggota terdaftar di komunitas |
| **Main Flow** | 1. Anggota mengakses halaman Chat komunitas<br>2. Anggota mengetik pesan<br>3. Anggota mengklik tombol "Kirim"<br>4. Sistem menyimpan pesan<br>5. Pesan muncul di chat room |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | 4a. Gagal mengirim → Sistem menampilkan error |
| **Postconditions** | Pesan terkirim dan terlihat di chat |

### UC-030: View Messages

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-030 |
| **Actor** | Anggota Komunitas |
| **Goal** | Melihat pesan di chat komunitas |
| **Preconditions** | Anggota terdaftar di komunitas |
| **Main Flow** | 1. Anggota mengakses halaman Chat<br>2. Sistem menampilkan daftar pesan<br>3. Anggota dapat melihat pesan terbaru<br>4. Anggota dapat menggulir ke atas untuk melihat pesan lama |
| **Alternative Flow** | 3a. Tidak ada pesan → Sistem menampilkan pesan "Belum ada pesan" |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Anggota melihat pesan komunitas |

---

## 11. Superadmin Approval

### UC-031: View Pending Approvals

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-031 |
| **Actor** | Superadmin |
| **Goal** | Melihat daftar approval pending |
| **Preconditions** | Superadmin login |
| **Main Flow** | 1. Superadmin mengakses halaman Approval<br>2. Sistem menampilkan daftar approval pending<br>3. Superadmin dapat memfilter berdasarkan tipe (role, komunitas, brand, event)<br>4. Superadmin dapat melihat detail setiap item |
| **Alternative Flow** | 3a. Tidak ada pending → Sistem menampilkan pesan "Tidak ada approval pending" |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Superadmin melihat daftar approval |

### UC-032: Approve Item

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-032 |
| **Actor** | Superadmin |
| **Goal** | Menyetujui item yang diajukan |
| **Preconditions** | Superadmin login, item status: pending |
| **Main Flow** | 1. Superadmin memilih item untuk di-approve<br>2. Superadmin mengklik tombol "Approve"<br>3. Sistem memperbarui status ke "approved"<br>4. Sistem menampilkan notifikasi ke user |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | 3a. Gagal approve → Sistem menampilkan error |
| **Postconditions** | Item disetujui, user mendapat notifikasi |

### UC-033: Reject Item

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-033 |
| **Actor** | Superadmin |
| **Goal** | Menolak item yang diajukan |
| **Preconditions** | Superadmin login, item status: pending |
| **Main Flow** | 1. Superadmin memilih item untuk ditolak<br>2. Superadmin mengklik tombol "Reject"<br>3. Superadmin mengisi alasan penolakan<br>4. Sistem memperbarui status ke "rejected"<br>5. Sistem menampilkan notifikasi ke user |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | 4a. Gagal reject → Sistem menampilkan error |
| **Postconditions** | Item ditolak, user mendapat notifikasi |

---

## 12. Dashboard and Reporting

### UC-034: View Member Dashboard

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-034 |
| **Actor** | Member |
| **Goal** | Melihat dashboard member |
| **Preconditions** | Member login |
| **Main Flow** | 1. Member mengakses dashboard<br>2. Sistem menampilkan ringkasan: komunitas diikuti, event mendatang, donasi total<br>3. Member dapat mengklik shortcut ke fitur |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Member melihat dashboard |

### UC-035: View CO Dashboard

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-035 |
| **Actor** | Community Owner |
| **Goal** | Melihat dashboard komunitas |
| **Preconditions** | CO login, memiliki komunitas |
| **Main Flow** | 1. CO mengakses dashboard<br>2. Sistem menampilkan: total anggota, event aktif, donasi, galeri<br>3. CO dapat melihat statistik bulanan<br>4. CO dapat mengakses shortcut ke manajemen |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | Tidak ada |
| **Postconditions** | CO melihat dashboard komunitas |

### UC-036: View Superadmin Dashboard

| Field | Deskripsi |
|-------|-----------|
| **Use Case ID** | UC-036 |
| **Actor** | Superadmin |
| **Goal** | Melihat dashboard platform |
| **Preconditions** | Superadmin login |
| **Main Flow** | 1. Superadmin mengakses dashboard<br>2. Sistem menampilkan: total user, komunitas, brand, event, revenue<br>3. Superadmin dapat melihat pertumbuhan bulanan<br>4. Superadmin dapat mengakses shortcut ke approval center |
| **Alternative Flow** | Tidak ada |
| **Exception Flow** | Tidak ada |
| **Postconditions** | Superadmin melihat dashboard platform |

---

## Ringkasan Use Case

| No | Modul | Jumlah Use Case |
|----|-------|----------------|
| 1 | Authentication | 5 |
| 2 | Role Request | 3 |
| 3 | Public Community Directory | 3 |
| 4 | Member Management | 4 |
| 5 | Community Management | 4 |
| 6 | Event Management | 3 |
| 7 | Collaboration Management | 2 |
| 8 | Donation and Wallet | 2 |
| 9 | Gallery | 2 |
| 10 | Chat | 2 |
| 11 | Superadmin Approval | 3 |
| 12 | Dashboard and Reporting | 3 |
| | **Total** | **36** |

---

## Dokumen Terkait

- [BRD.md](./BRD.md) - Business Requirements Document
- [PRD.md](./PRD.md) - Product Requirements Document
- [User-Requirements.md](./User-Requirements.md) - User Requirements
- [Functional-Requirements.md](./Functional-Requirements.md) - Functional Requirements
- [Non-Functional-Requirements.md](./Non-Functional-Requirements.md) - Non-Functional Requirements
- [User-Stories.md](./User-Stories.md) - User Stories
- [RTM.md](./RTM.md) - Requirement Traceability Matrix
