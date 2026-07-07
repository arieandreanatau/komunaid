# User Requirements — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Guest / Visitor (Tidak Login)

| Code   | Module | Description                          | Priority | Scope | Acceptance Criteria                                                                             |
| ------ | ------ | ------------------------------------ | -------- | ----- | ----------------------------------------------------------------------------------------------- |
| UR-G01 | Public | Melihat landing page                 | High     | MVP   | GIVEN guest membuka `/` WHEN halaman load THEN hero section, search bar, kategori, CTA terlihat |
| UR-G02 | Public | Mencari & filter komunitas           | High     | MVP   | GIVEN guest di `/komunitas` WHEN search/klik filter THEN hasil sesuai filter                    |
| UR-G03 | Public | Melihat detail komunitas             | High     | MVP   | GIVEN guest klik komunitas WHEN halaman load THEN profil, member count, event terlihat          |
| UR-G04 | Public | Mencari & filter event               | High     | MVP   | GIVEN guest di `/events` WHEN search/klik filter THEN hasil sesuai filter                       |
| UR-G05 | Public | Melihat detail event                 | High     | MVP   | GIVEN guest klik event WHEN halaman load THEN info event, tanggal, lokasi terlihat              |
| UR-G06 | Public | Melihat direktori organisasi         | Medium   | MVP   | GIVEN guest di `/organizations` WHEN halaman load THEN daftar organisasi terlihat               |
| UR-G07 | Public | Melihat blog/artikel                 | Medium   | Later | —                                                                                               |
| UR-G08 | Public | Melihat about, FAQ, contact          | Medium   | MVP   | GIVEN guest klik About/FAQ/Contact WHEN halaman load THEN konten terlihat                       |
| UR-G09 | Public | Melihat terms & privacy policy       | Medium   | MVP   | GIVEN guest klik Terms/Privacy WHEN halaman load THEN konten terlihat                           |
| UR-G10 | Public | Melihat community & event guidelines | Low      | MVP   | GIVEN guest klik Guidelines WHEN halaman load THEN panduan terlihat                             |

---

## 2. Member / User (Login)

| Code   | Module       | Description                                 | Priority | Scope | Acceptance Criteria                                                                             |
| ------ | ------------ | ------------------------------------------- | -------- | ----- | ----------------------------------------------------------------------------------------------- |
| UR-M01 | Auth         | Register sebagai member                     | High     | MVP   | GIVEN guest di `/register` WHEN isi form & submit THEN akun dibuat, user otomatis login         |
| UR-M02 | Auth         | Login dengan username/email + password      | High     | MVP   | GIVEN user di `/login` WHEN credential valid THEN user masuk dashboard                          |
| UR-M03 | Auth         | Logout                                      | High     | MVP   | GIVEN user login WHEN klik logout THEN token invalid, user redirect ke home                     |
| UR-M04 | Auth         | Forgot password                             | High     | MVP   | GIVEN user di `/forgot-password` WHEN email valid THEN email reset terkirim                     |
| UR-M05 | Auth         | Reset password                              | High     | MVP   | GIVEN user buka reset link WHEN isi password baru THEN password terupdate                       |
| UR-M06 | Auth         | Email verification (opsional)               | Low      | MVP   | GIVEN user register WHEN email diisi THEN bisa verify (opsional)                                |
| UR-M07 | Profile      | Lihat profil sendiri                        | High     | MVP   | GIVEN user login WHEN buka profil THEN data profil terlihat                                     |
| UR-M08 | Profile      | Edit profil (nama, bio, lokasi, interest)   | High     | MVP   | GIVEN user di profil WHEN edit & save THEN data terupdate                                       |
| UR-M09 | Profile      | Upload foto profil                          | Medium   | MVP   | GIVEN user di profil WHEN upload avatar ≤ 2MB THEN avatar terupdate                             |
| UR-M10 | Profile      | Change password                             | Medium   | MVP   | GIVEN user di settings WHEN isi password lama & baru THEN password terupdate                    |
| UR-M11 | Community    | Join komunitas open                         | High     | MVP   | GIVEN user di komunitas open WHEN klik Join THEN membership langsung ACTIVE                     |
| UR-M12 | Community    | Request join komunitas approval-required    | High     | MVP   | GIVEN user di komunitas approval WHEN klik Join THEN status PENDING                             |
| UR-M13 | Community    | Leave komunitas                             | Medium   | MVP   | GIVEN user di komunitas WHEN klik Leave THEN membership = LEFT                                  |
| UR-M14 | Community    | Bookmark komunitas                          | Low      | MVP   | GIVEN user di komunitas WHEN klik Bookmark THEN komunitas masuk bookmark                        |
| UR-M15 | Event        | Daftar event gratis                         | High     | MVP   | GIVEN user di event gratis WHEN klik Daftar THEN registrasi CONFIRMED                           |
| UR-M16 | Event        | Batalkan registrasi event                   | Medium   | MVP   | GIVEN user terdaftar di event WHEN klik Cancel THEN registrasi = CANCELLED                      |
| UR-M17 | Event        | Lihat riwayat event                         | Low      | MVP   | GIVEN user di dashboard WHEN buka My Events THEN daftar event terlihat                          |
| UR-M18 | Dashboard    | Lihat ringkasan profil                      | High     | MVP   | GIVEN user login WHEN buka dashboard THEN ringkasan profil terlihat                             |
| UR-M19 | Dashboard    | Lihat komunitas yang diikuti                | High     | MVP   | GIVEN user di dashboard WHEN buka My Communities THEN daftar komunitas terlihat                 |
| UR-M20 | Dashboard    | Lihat event yang diikuti                    | High     | MVP   | GIVEN user di dashboard WHEN buka My Events THEN daftar event terlihat                          |
| UR-M21 | Dashboard    | Lihat bookmark                              | Low      | MVP   | GIVEN user di dashboard WHEN buka Bookmarks THEN daftar bookmark terlihat                       |
| UR-M22 | Dashboard    | Lihat notifikasi                            | High     | MVP   | GIVEN user di dashboard WHEN buka Notifications THEN notifikasi terlihat                        |
| UR-M23 | Dashboard    | Lihat riwayat aktivitas                     | Low      | MVP   | GIVEN user di dashboard WHEN buka Activity THEN riwayat terlihat                                |
| UR-M24 | Dashboard    | Ajukan role tambahan (owner, admin)         | Medium   | MVP   | GIVEN user di dashboard WHEN submit role request THEN request tersimpan dengan status SUBMITTED |
| UR-M25 | Report       | Laporkan komunitas/event/user               | Medium   | MVP   | GIVEN user login WHEN submit report THEN report tersimpan dengan status PENDING                 |
| UR-M26 | Community    | Buat komunitas baru (submit untuk approval) | High     | MVP   | GIVEN user login WHEN submit komunitas baru THEN status = PENDING, menunggu approval            |
| UR-M27 | Organization | Ajukan organisasi baru                      | Medium   | MVP   | GIVEN user login WHEN submit organisasi baru THEN status = PENDING, menunggu approval           |
| UR-M28 | Community    | Buat post/update di komunitas               | Medium   | MVP   | GIVEN user di komunitas WHEN buat post THEN post tersimpan dengan status DRAFT atau PUBLISHED   |

---

## 3. Community Owner

| Code    | Module        | Description                                           | Priority | Scope | Acceptance Criteria                                                          |
| ------- | ------------- | ----------------------------------------------------- | -------- | ----- | ---------------------------------------------------------------------------- |
| UR-CO01 | Community     | Buat & kelola komunitas sendiri                       | High     | MVP   | GIVEN user adalah owner WHEN akses komunitas THEN bisa edit semua data       |
| UR-CO02 | Community     | Edit profil komunitas (nama, deskripsi, logo, banner) | High     | MVP   | GIVEN owner di edit community WHEN save THEN data terupdate                  |
| UR-CO03 | Community     | Kelola membership type (open/approval)                | Medium   | MVP   | GIVEN owner di settings WHEN ubah membership type THEN type berubah          |
| UR-CO04 | Members       | Approve/reject join request                           | High     | MVP   | GIVEN owner di member list WHEN approve/reject THEN status member berubah    |
| UR-CO05 | Members       | Ban/remove member                                     | Medium   | MVP   | GIVEN owner di member list WHEN ban member THEN status = BANNED              |
| UR-CO06 | Members       | Assign admin komunitas                                | Medium   | MVP   | GIVEN owner di member list WHEN assign admin THEN role admin tercatat        |
| UR-CO07 | Members       | Lihat daftar member                                   | High     | MVP   | GIVEN owner di member list WHEN halaman load THEN daftar member terlihat     |
| UR-CO08 | Event         | Buat event untuk komunitas                            | High     | MVP   | GIVEN owner di create event WHEN submit THEN event tersimpan                 |
| UR-CO09 | Event         | Edit/hapus event                                      | High     | MVP   | GIVEN owner di event WHEN edit/hapus THEN perubahan tersimpan                |
| UR-CO10 | Event         | Lihat daftar peserta event                            | Medium   | MVP   | GIVEN owner di event WHEN buka attendees THEN daftar peserta terlihat        |
| UR-CO11 | Post          | Buat, edit, hapus post                                | Medium   | MVP   | GIVEN owner di komunitas WHEN buat/edit/hapus post THEN perubahan tersimpan  |
| UR-CO12 | Post          | Moderasi post anggota                                 | Medium   | MVP   | GIVEN owner di post WHEN moderate THEN status post berubah                   |
| UR-CO13 | Dashboard     | Lihat overview komunitas                              | High     | MVP   | GIVEN owner di dashboard WHEN halaman load THEN statistik komunitas terlihat |
| UR-CO14 | Dashboard     | Lihat analytics dasar komunitas                       | Medium   | MVP   | GIVEN owner di analytics WHEN halaman load THEN metric dasar terlihat        |
| UR-CO15 | Collaboration | Ajukan proposal ke brand/organisasi                   | Low      | Later | —                                                                            |
| UR-CO16 | Report        | Lihat laporan komunitas                               | Medium   | MVP   | GIVEN owner di reports WHEN halaman load THEN laporan terlihat               |

---

## 4. Community Admin

| Code    | Module   | Description                    | Priority | Scope | Acceptance Criteria                                                |
| ------- | -------- | ------------------------------ | -------- | ----- | ------------------------------------------------------------------ |
| UR-CA01 | Members  | Bantu kelola member (terbatas) | Medium   | MVP   | GIVEN admin di member list WHEN approve/reject THEN bisa dilakukan |
| UR-CA02 | Post     | Kelola konten/galeri           | Medium   | MVP   | GIVEN admin di posts WHEN kelola konten THEN bisa dilakukan        |
| UR-CA03 | Event    | Buat event draft               | Medium   | MVP   | GIVEN admin di create event WHEN submit THEN event = DRAFT         |
| UR-CA04 | Moderasi | Moderasi konten komunitas      | Medium   | MVP   | GIVEN admin di post WHEN moderate THEN status berubah              |

---

## 5. Event Manager

| Code    | Module | Description                  | Priority | Scope | Acceptance Criteria                                                   |
| ------- | ------ | ---------------------------- | -------- | ----- | --------------------------------------------------------------------- |
| UR-EM01 | Event  | Buat & kelola event assigned | High     | MVP   | GIVEN EM di event assigned WHEN edit THEN perubahan tersimpan         |
| UR-EM02 | Event  | Kelola registrasi peserta    | Medium   | MVP   | GIVEN EM di attendees WHEN lihat daftar THEN peserta terlihat         |
| UR-EM03 | Event  | Check-in/attendance          | Medium   | MVP   | GIVEN EM di check-in WHEN scan/masukkan data THEN attendance tercatat |
| UR-EM04 | Event  | Lihat report event           | Low      | MVP   | GIVEN EM di event report WHEN halaman load THEN laporan terlihat      |

---

## 6. Organization Owner

| Code    | Module       | Description                 | Priority | Scope | Acceptance Criteria                                                       |
| ------- | ------------ | --------------------------- | -------- | ----- | ------------------------------------------------------------------------- |
| UR-OO01 | Organization | Ajukan organisation baru    | High     | MVP   | GIVEN user login WHEN submit organisasi baru THEN status = PENDING        |
| UR-OO02 | Organization | Edit profil organisation    | High     | MVP   | GIVEN owner di edit org WHEN save THEN data terupdate                     |
| UR-OO03 | Organization | Invite & kelola team        | Medium   | MVP   | GIVEN owner di team management WHEN invite staff THEN invitation terkirim |
| UR-OO04 | Organization | Assign role admin           | Medium   | MVP   | GIVEN owner di team WHEN assign role THEN role tercatat                   |
| UR-OO05 | Dashboard    | Lihat overview organisation | High     | MVP   | GIVEN owner di dashboard WHEN halaman load THEN statistik org terlihat    |
| UR-OO06 | Dashboard    | Lihat analytics dasar       | Low      | MVP   | GIVEN owner di analytics WHEN halaman load THEN metric dasar terlihat     |

---

## 7. Organization Admin

| Code    | Module       | Description           | Priority | Scope | Acceptance Criteria                                             |
| ------- | ------------ | --------------------- | -------- | ----- | --------------------------------------------------------------- |
| UR-OA01 | Organization | Bantu kelola profil   | Medium   | MVP   | GIVEN admin di org WHEN edit profil THEN bisa dilakukan         |
| UR-OA02 | Organization | Kelola staff terbatas | Low      | MVP   | GIVEN admin di team WHEN lihat staff THEN daftar staff terlihat |

---

## 8. Notes

- Semua fitur dashboard harus role-aware dan scoped.
- User hanya bisa mengedit data milik sendiri atau scope yang diberikan.
- Approval tidak boleh dilakukan oleh pemilik request.
- Semua perubahan penting masuk audit log.
- Later scope items TIDAK boleh diimplementasikan di MVP.
- Acceptance Criteria menggunakan format GIVEN/WHEN/THEN.
