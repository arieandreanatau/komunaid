# 07 — USER STORIES

**Status:** Draft
**Last Updated:** 2026-06-25

> Format: Sebagai [aktor], saya ingin [tujuan], sehingga [manfaat].

---

## 1. Guest

| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-G01 | M01 | Sebagai guest, saya ingin melihat beranda KomunaID sehingga saya mengerti tentang platform | Must Have | MVP | No |
| US-G02 | M16 | Sebagai guest, saya ingin melihat daftar komunitas sehingga saya bisa menemukan komunitas yang sesuai | Must Have | MVP | No |
| US-G03 | M24 | Sebagai guest, saya ingin melihat daftar event sehingga saya tahu event yang akan datang | Must Have | MVP | No |
| US-G04 | M02 | Sebagai guest, saya ingin membaca blog KomunaID sehingga saya dapat informasi terbaru | Must Have | MVP | No |
| US-G05 | M04 | Sebagai guest, saya ingin menghubungi KomunaID sehingga saya bisa bertanya | Must Have | MVP | No |
| US-G06 | M05 | Sebagai guest, saya ingin mengirim saran sehingga ide saya dipertimbangkan | Should Have | V2 | No |

### Acceptance Criteria Detail

**US-G01:** Hero section tampil dengan tagline "CONNECT • COMMUNITY • GROW", CTA jelas (Gabung, Jelajahi, Buat Komunitas), section rekomendasi komunitas tampil, section event terbaru tampil, section blog tampil, footer dengan link sosial media.

**US-G02:** Halaman komunitas directory tampil, card komunitas: logo, nama, kategori, jumlah member, klik card → detail komunitas, filter kategori dan regional tersedia.

**US-G03:** Halaman event listing tampil, card event: nama, tanggal, komunitas, tipe, klik card → detail event.

**US-G04:** Halaman blog tampil, daftar artikel dengan judul, excerpt, tanggal, klik artikel → detail blog.

**US-G05:** Link Instagram clickable, link WhatsApp clickable, link Email clickable.

**US-G06:** Form saran tersedia, isi saran wajib, nama dan email optional, submit berhasil dengan konfirmasi.

---

## 2. Register/Auth

| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-A01 | M06 | Sebagai guest, saya ingin mendaftar menggunakan email/username sehingga saya punya akun | Must Have | MVP | No |
| US-A02 | M07 | Sebagai user, saya ingin login sehingga saya bisa akses dashboard | Must Have | MVP | No |
| US-A03 | M07 | Sebagai user, saya ingin logout sehingga sesi aman | Must Have | MVP | No |
| US-A04 | M08 | Sebagai member, saya ingin request role sehingga saya bisa mengelola komunitas/brand/perusahaan | Must Have | MVP | No |

### Acceptance Criteria Detail

**US-A01:** Form register dengan email, username, password, confirm password; minimal email atau username diisi; username unique; email unique; password minimal 8 karakter; redirect ke onboarding.

**US-A02:** Login form dengan email/username + password; redirect sesuai role; error message jika gagal.

**US-A03:** Logout button tersedia; session dihapus; redirect ke halaman login.

**US-A04:** Form role request; pilih tipe role; isi data awal sesuai role; status pending; melihat status request; notif jika di-approve/reject.

---

## 3. Member

| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-M01 | M10 | Sebagai member, saya ingin edit profil sehingga data saya lengkap | Must Have | MVP | No |
| US-M02 | M11 | Sebagai member, saya ingin memilih interest sehingga rekomendasi relevan | Must Have | MVP | No |
| US-M03 | M16 | Sebagai member, saya ingin join komunitas sehingga bisa berpartisipasi | Must Have | MVP | No |
| US-M04 | M13 | Sebagai member, saya ingin bookmark komunitas sehingga saya simpan untuk nanti | Should Have | V2 | No |
| US-M05 | M12 | Sebagai member, saya ingin tambah teman sehingga terhubung dengan orang lain | Should Have | V2 | No |
| US-M06 | M12 | Sebagai member, saya ingin lihat komunitas teman sehingga temukan komunitas baru | Should Have | V2 | No |
| US-M07 | M24 | Sebagai member, saya ingin lihat event yang saya ikuti | Must Have | MVP | No |
| US-M08 | M25 | Sebagai member, saya ingin export data event sebagai catatan pribadi | Should Have | V2 | Yes |
| US-M09 | M14 | Sebagai member, saya ingin upload galeri kegiatan untuk berbagi pengalaman | Should Have | V2 | No |
| US-M10 | M15 | Sebagai member, saya ingin lihat history aktivitas | Should Have | V2 | No |

---

## 4. Community Owner

| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-CO01 | M20 | Sebagai community owner, saya ingin buat komunitas | Must Have | MVP | No |
| US-CO02 | M20 | Sebagai community owner, saya ingin edit komunitas | Must Have | MVP | No |
| US-CO03 | M21 | Sebagai community owner, saya ingin kelola pengurus | Must Have | MVP | No |
| US-CO04 | M22 | Sebagai community owner, saya ingin kelola volunteer | Must Have | MVP | No |
| US-CO05 | M23 | Sebagai community owner, saya ingin buat campaign open kepengurusan | Should Have | V2 | No |
| US-CO06 | M24 | Sebagai community owner, saya ingin buat event | Must Have | MVP | No |
| US-CO07 | M26 | Sebagai community owner, saya ingin buka volunteer di event | Should Have | V2 | No |
| US-CO08 | M27 | Sebagai community owner, saya ingin buka donasi di event | Must Have | MVP | No |
| US-CO09 | M28 | Sebagai community owner, saya ingin laporan keuangan event | Should Have | V2 | Yes |

---

## 5. Brand Owner

| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-BO01 | M30 | Sebagai brand owner, saya ingin buat brand | Must Have | MVP | No |
| US-BO02 | M30 | Sebagai brand owner, saya ingin kelola brand | Must Have | MVP | No |
| US-BO03 | M33 | Sebagai brand owner, saya ingin cari komunitas untuk kolaborasi | Must Have | MVP | No |
| US-BO04 | M33 | Sebagai brand owner, saya ingin ajukan kolaborasi | Must Have | MVP | No |
| US-BO05 | M33 | Sebagai brand owner, saya ingin lihat riwayat kolaborasi | Must Have | MVP | No |

---

## 6. Company Owner

| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-CP01 | M31 | Sebagai company owner, saya ingin buat profil perusahaan | Must Have | MVP | No |
| US-CP02 | M32 | Sebagai company owner, saya ingin tambah brand di bawah perusahaan | Must Have | MVP | No |
| US-CP03 | M32 | Sebagai company owner, saya ingin kelola brand di bawah perusahaan | Must Have | MVP | No |
| US-CP04 | M33 | Sebagai company owner, saya ingin lihat kolaborasi brand | Should Have | V2 | No |

---

## 7. Superadmin

| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-SA01 | M35 | Sebagai superadmin, saya ingin kelola member | Must Have | MVP | No |
| US-SA02 | M36 | Sebagai superadmin, saya ingin kelola community owner | Must Have | MVP | No |
| US-SA03 | M36 | Sebagai superadmin, saya ingin transfer ownership komunitas | Must Have | MVP | No |
| US-SA04 | M37 | Sebagai superadmin, saya ingin kelola brand owner | Must Have | MVP | No |
| US-SA05 | M37 | Sebagai superadmin, saya ingin transfer ownership brand | Must Have | MVP | No |
| US-SA06 | M38 | Sebagai superadmin, saya ingin kelola perusahaan | Must Have | MVP | No |
| US-SA07 | M39 | Sebagai superadmin, saya ingin kelola event | Must Have | MVP | No |
| US-SA08 | M41 | Sebagai superadmin, saya ingin kelola CMS | Must Have | MVP | No |
| US-SA09 | M40 | Sebagai superadmin, saya ingin kelola master data | Must Have | MVP | No |
| US-SA10 | M44 | Sebagai superadmin, saya ingin lihat metrics | Must Have | MVP | No |
| US-SA11 | M45 | Sebagai superadmin, saya ingin lihat login activity | Should Have | V2 | No |
| US-SA12 | M46 | Sebagai superadmin, saya ingin chat sesama admin | Should Have | V2 | No |
| US-SA13 | M48 | Sebagai superadmin, saya ingin kelola premium/trial | Should Have | V2 | No |
| US-SA14 | M51 | Sebagai superadmin, saya ingin lihat audit log | Must Have | MVP | No |

---

## Summary

| Aktor | Jumlah User Stories | MVP | V2 | Phase 2 |
|-------|-------------------|-----|-----|---------|
| Guest | 6 | 5 | 1 | 0 |
| Register/Auth | 4 | 4 | 0 | 0 |
| Member | 10 | 4 | 6 | 0 |
| Community Owner | 9 | 5 | 4 | 0 |
| Brand Owner | 5 | 5 | 0 | 0 |
| Company Owner | 4 | 3 | 1 | 0 |
| Superadmin | 14 | 10 | 4 | 0 |
| **Total** | **52** | **36** | **16** | **0** |
