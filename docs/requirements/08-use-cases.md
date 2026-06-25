# 08 — USE CASES

**Status:** Draft
**Last Updated:** 2026-06-25

---

## UC-01: Register User

| Field | Value |
|-------|-------|
| **UC ID** | UC-01 |
| **Nama** | Register User |
| **Aktor** | Guest |
| **Deskripsi** | Guest mendaftar akun baru |
| **Pre-condition** | Guest membuka halaman register |
| **Trigger** | Guest submit form register |
| **Main Flow** | 1. Buka `/register` → 2. Isi form → 3. Validasi → 4. Buat akun (role member) → 5. Redirect onboarding → 6. CTA role request |
| **Alt Flow** | 4a. Email/username sudah ada → error. 5a. Password tidak cocok → error |
| **Post-condition** | Akun baru dibuat, user login otomatis |
| **Data** | users, profiles |
| **Priority** | Must Have |

---

## UC-02: Login User

| Field | Value |
|-------|-------|
| **UC ID** | UC-02 |
| **Nama** | Login User |
| **Aktor** | Member, CO, BO, CP |
| **Pre-condition** | User punya akun |
| **Trigger** | Submit form login |
| **Main Flow** | 1. Buka `/login` → 2. Isi email/username + password → 3. Validasi → 4. Buat session → 5. Redirect berdasarkan role |
| **Alt Flow** | 4a. CO → `/community-own/dashboard`. 4b. BO → `/brand/dashboard`. 4c. CP → `/company/dashboard`. 4d. Member → `/member/dashboard` |
| **Exception** | 3a. Kredensial salah → error. 3b. Akun banned → pesan banned |
| **Post-condition** | User login, session aktif |

---

## UC-03: Logout User

| Field | Value |
|-------|-------|
| **UC ID** | UC-03 |
| **Nama** | Logout User |
| **Aktor** | Semua authenticated user |
| **Main Flow** | 1. Klik logout → 2. Hapus session → 3. Redirect ke login |
| **Alt Flow** | 3a. SA → `/admin/login`. 3b. User biasa → `/login` |

---

## UC-04: Request Role

| Field | Value |
|-------|-------|
| **UC ID** | UC-04 |
| **Nama** | Request Role |
| **Aktor** | Member |
| **Pre-condition** | User login sebagai member |
| **Main Flow** | 1. Buka role request → 2. Pilih tipe → 3. Isi data awal → 4. Submit → 5. Status pending → 6. Notif ke SA |
| **Alt Flow** | 2a. Pilih "Nanti Saja" → redirect dashboard |
| **Post-condition** | Role request dibuat, menunggu approval |

---

## UC-05: Approve Role Request

| Field | Value |
|-------|-------|
| **UC ID** | UC-05 |
| **Nama** | Approve Role Request |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka approval center → 2. Lihat detail → 3. Klik Approve → 4. Update status → 5. Assign role (Spatie) → 6. Buat data awal |
| **Alt Flow** | 3a. Klik Reject → form alasan → update rejected |

---

## UC-06: Member Edit Profil

| Field | Value |
|-------|-------|
| **UC ID** | UC-06 |
| **Aktor** | Member |
| **Main Flow** | 1. Buka profil → 2. Edit field → 3. Simpan → 4. Validasi → 5. Update → 6. Konfirmasi |

---

## UC-07: Member Join Komunitas

| Field | Value |
|-------|-------|
| **UC ID** | UC-07 |
| **Aktor** | Member |
| **Main Flow** | 1. Buka detail komunitas → 2. Klik Join → 3. Cek visibility/approval → 4. Buat community_member → 5. Update jumlah member |
| **Alt Flow** | 4a. Public + no approval → langsung join. 4b. Approval needed → pending. 3a. Private → tidak bisa langsung join. 3b. Sudah join → tampilkan "Leave" |

---

## UC-08: Member Bookmark Komunitas

| Field | Value |
|-------|-------|
| **UC ID** | UC-08 |
| **Aktor** | Member |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka komunitas → 2. Klik bookmark → 3. Toggle bookmark → 4. Update icon |

---

## UC-09: Member Tambah Teman

| Field | Value |
|-------|-------|
| **UC ID** | UC-09 |
| **Aktor** | Member |
| **Priority** | Should Have |
| **Main Flow** | 1. Cari user → 2. Klik Tambah Teman → 3. Kirim permintaan → 4. Status pending → 5. User lain terima/tolak |

---

## UC-10: Member Upload Galeri

| Field | Value |
|-------|-------|
| **UC ID** | UC-10 |
| **Aktor** | Member |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka galeri → 2. Upload foto → 3. Isi caption, tanggal, komunitas/event, visibility → 4. Simpan → 5. Tampil di galeri |

---

## UC-11: Community Owner Membuat Komunitas

| Field | Value |
|-------|-------|
| **UC ID** | UC-11 |
| **Aktor** | Community Owner |
| **Main Flow** | 1. Buka form → 2. Isi: nama, slug(auto), deskripsi, kategori, regional, logo, banner, sosmed, kontak, visibility → 3. Simpan → 4. Status pending approval → 5. Notif ke SA |

---

## UC-12: Community Owner Mengelola Pengurus

| Field | Value |
|-------|-------|
| **UC ID** | UC-12 |
| **Aktor** | Community Owner |
| **Main Flow** | 1. Buka halaman pengurus → 2. Tambah pengurus → 3. Cari & pilih user → 4. Set posisi, periode, keterangan → 5. Simpan. 6. Nonaktifkan = ubah status. 7. Hapus = soft delete relasi |

---

## UC-13: Campaign Open Kepengurusan

| Field | Value |
|-------|-------|
| **UC ID** | UC-13 |
| **Aktor** | Community Owner |
| **Priority** | Should Have |
| **Main Flow** | 1. Buat campaign → 2. Isi detail → 3. Publish → 4. Tampil di komunitas → 5. Review applicant → 6. Approve/reject |

---

## UC-14: Community Owner Membuat Event

| Field | Value |
|-------|-------|
| **UC ID** | UC-14 |
| **Aktor** | Community Owner |
| **Main Flow** | 1. Buka form event → 2. Isi: nama, slug, deskripsi, komunitas, tanggal, lokasi, tipe, kuota, harga, poster, status, visibility → 3. Publish → 4. Event tampil di public |

---

## UC-15: Event Membuka Volunteer

| Field | Value |
|-------|-------|
| **UC ID** | UC-15 |
| **Aktor** | Community Owner |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka event → 2. Buka volunteer → 3. Isi posisi, jumlah, periode, syarat → 4. Publish → 5. Member daftar → 6. Review & approve/reject |

---

## UC-16: Event Membuka Donasi

| Field | Value |
|-------|-------|
| **UC ID** | UC-16 |
| **Aktor** | Community Owner |
| **Main Flow** | 1. Buka event → 2. Aktifkan donasi → 3. Set target, periode → 4. Member donasi + upload bukti → 5. Verify/reject |

---

## UC-17: Event Report Keuangan

| Field | Value |
|-------|-------|
| **UC ID** | UC-17 |
| **Aktor** | Community Owner |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka finance report → 2. Lihat pemasukan → 3. Lihat pengeluaran → 4. Ringkasan → 5. Export CSV |

---

## UC-18: Brand Owner Membuat Brand

| Field | Value |
|-------|-------|
| **UC ID** | UC-18 |
| **Aktor** | Brand Owner |
| **Main Flow** | 1. Buka form brand → 2. Isi: nama, deskripsi, logo, website, industri → 3. Simpan → 4. Status pending → 5. Notif ke SA |

---

## UC-19: Company Owner Membuat Perusahaan

| Field | Value |
|-------|-------|
| **UC ID** | UC-19 |
| **Aktor** | Company Owner |
| **Main Flow** | 1. Buka form perusahaan → 2. Isi: nama, legal name, industri, deskripsi, website, email, phone, logo, alamat → 3. Simpan → 4. Status pending |

---

## UC-20: Company Owner Menambahkan Brand

| Field | Value |
|-------|-------|
| **UC ID** | UC-20 |
| **Aktor** | Company Owner |
| **Main Flow** | 1. Buka halaman perusahaan → 2. Tambah brand → 3. Pilih brand yang dimiliki → 4. Hubungkan → 5. Tampil di daftar |

---

## UC-21: Brand Ajukan Kolaborasi

| Field | Value |
|-------|-------|
| **UC ID** | UC-21 |
| **Aktor** | Brand Owner |
| **Main Flow** | 1. Cari komunitas → 2. Ajukan kolaborasi → 3. Isi: judul, deskripsi, tujuan, target, benefit, budget, timeline, attachment → 4. Kirim → 5. Status sent → 6. CO terima notif |

---

## UC-22: Superadmin Lihat Daftar Member

| Field | Value |
|-------|-------|
| **UC ID** | UC-22 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka user management → 2. Lihat daftar (paginated) → 3. Search/filter → 4. Klik detail → 5. Export |

---

## UC-23: Superadmin Ban/Suspend User

| Field | Value |
|-------|-------|
| **UC ID** | UC-23 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka detail user → 2. Klik Ban/Suspend → 3. Isi alasan → 4. Konfirmasi → 5. Update status → 6. Audit log |

---

## UC-24: Superadmin Transfer Ownership Komunitas

| Field | Value |
|-------|-------|
| **UC ID** | UC-24 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka detail komunitas/user → 2. Transfer Ownership → 3. Pilih komunitas → 4. Pilih user baru → 5. Konfirmasi → 6. Update owner_id → 7. Audit log |

---

## UC-25: Superadmin Transfer Ownership Brand

| Field | Value |
|-------|-------|
| **UC ID** | UC-25 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka detail brand → 2. Transfer Ownership → 3. Pilih user baru → 4. Konfirmasi → 5. Update owner_id → 6. Audit log |

---

## UC-26: Superadmin Hapus Event

| Field | Value |
|-------|-------|
| **UC ID** | UC-26 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka event management → 2. Pilih event → 3. Hapus/Ban → 4. Isi alasan → 5. Konfirmasi → 6. Soft delete/ban → 7. Audit log |

---

## UC-27: Superadmin Kelola CMS

| Field | Value |
|-------|-------|
| **UC ID** | UC-27 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka CMS → 2. Pilih halaman (Beranda/Blog/Tentang Kami) → 3. Edit konten → 4. Simpan → 5. Update tampil di public |

---

## UC-28: Superadmin Kelola Contact Link

| Field | Value |
|-------|-------|
| **UC ID** | UC-28 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka contact management → 2. Edit Instagram → 3. Edit WhatsApp → 4. Edit Email → 5. Simpan |

---

## UC-29: Superadmin Lihat Metrics

| Field | Value |
|-------|-------|
| **UC ID** | UC-29 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka dashboard → 2. Hitung total → 3. Hitung data baru → 4. Role request pending → 5. Data kosong = angka 0 |

---

## UC-30: Superadmin Kelola Premium/Trial

| Field | Value |
|-------|-------|
| **UC ID** | UC-30 |
| **Aktor** | Superadmin |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka premium management → 2. Toggle feature → 3. Activate trial → 4. Set durasi → 5. Deactivate jika perlu → 6. Setelah expired → terkunci |
