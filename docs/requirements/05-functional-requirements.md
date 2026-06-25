# 05 — FUNCTIONAL REQUIREMENTS

**Status:** Draft
**Last Updated:** 2026-06-25

> Detail requirement per modul. Setiap modul memiliki ID, deskripsi, existing status, priority, phase, dan daftar requirement.

---

## M01 — PUBLIC WEBSITE / BERANDA

**Status:** Partial Existing — Perlu Enhancement Besar | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M01-001 | Hero section menampilkan tagline "CONNECT • COMMUNITY • GROW" | Must Have | MVP |
| M01-002 | CTA "Gabung Sekarang" → register (guest) atau dashboard (member) | Must Have | MVP |
| M01-003 | CTA "Jelajahi Komunitas" → community directory | Must Have | MVP |
| M01-004 | CTA "Buat Komunitas" → register (guest) atau role request (member) | Must Have | MVP |
| M01-005 | Background gradient biru sesuai brand (Navy → Cyan) | Must Have | MVP |
| M01-006 | Hero image/illustrasi bisa dikelola dari CMS | Should Have | V2 |
| M01-010 | Section penjelasan singkat tentang KomunaID | Must Have | MVP |
| M01-011 | Menampilkan nilai utama: Connect, Community, Grow | Must Have | MVP |
| M01-012 | Konten bisa dikelola dari CMS | Should Have | V2 |
| M01-020 | Menampilkan komunitas rekomendasi (top 6-8) | Must Have | MVP |
| M01-021 | Rekomendasi berdasarkan popularitas | Must Have | MVP |
| M01-022 | Rekomendasi berdasarkan kategori | Should Have | V2 |
| M01-023 | Rekomendasi berdasarkan regional | Should Have | V2 |
| M01-024 | Rekomendasi berdasarkan interest user jika login | Could Have | Phase 2 |
| M01-025 | Klik card komunitas → detail komunitas | Must Have | MVP |
| M01-030 | Menampilkan event terbaru (top 6-8) | Must Have | MVP |
| M01-031 | Filter: event komunitas, public, volunteer, donasi | Should Have | V2 |
| M01-032 | Klik card event → detail event | Must Have | MVP |
| M01-040 | Menampilkan artikel blog terbaru (top 3-5) | Must Have | MVP |
| M01-041 | Kategori artikel: artikel, cerita komunitas, opini, update | Should Have | V2 |
| M01-042 | Klik artikel → detail blog | Must Have | MVP |
| M01-050 | Section informasi untuk brand/perusahaan | Should Have | V2 |
| M01-051 | CTA "Mulai Kolaborasi" → register atau login | Should Have | V2 |
| M01-060 | Link Instagram (clickable) | Must Have | MVP |
| M01-061 | Link WhatsApp (clickable) | Must Have | MVP |
| M01-062 | Link Email (mailto:) | Must Have | MVP |
| M01-063 | Link dapat dikelola dari CMS | Should Have | V2 |
| M01-070 | Form saran dari pengunjung/member | Must Have | MVP |
| M01-071 | Nama boleh kosong | Must Have | MVP |
| M01-072 | Email boleh kosong | Must Have | MVP |
| M01-073 | Isi saran wajib | Must Have | MVP |
| M01-080 | Logo KomunaID di footer | Must Have | MVP |
| M01-081 | Navigasi utama di footer | Must Have | MVP |
| M01-082 | Social media links di footer | Must Have | MVP |
| M01-083 | Copyright di footer | Must Have | MVP |
| M01-084 | Language switcher di footer | Should Have | V2 |
| M01-090 | Semua konten public bisa dikelola dari CMS | Should Have | V2 |
| M01-091 | Tampilan modern, clean, responsive | Must Have | MVP |
| M01-092 | Public visitor bisa melihat konten tanpa login | Must Have | MVP |
| M01-093 | CTA diarahkan sesuai status login | Must Have | MVP |

---

## M02 — BLOG

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M02-001 | Daftar artikel blog (paginated) | Must Have | MVP |
| M02-002 | Detail artikel blog | Must Have | MVP |
| M02-003 | Filter berdasarkan kategori | Should Have | V2 |
| M02-004 | Search artikel | Should Have | V2 |
| M02-005 | Share artikel ke social media | Could Have | Phase 2 |
| M02-010 | CRUD artikel blog (superadmin) | Must Have | MVP |
| M02-011 | Rich text editor untuk konten | Must Have | MVP |
| M02-012 | Upload featured image | Must Have | MVP |
| M02-013 | Set status: draft, published, archived | Must Have | MVP |
| M02-014 | Set kategori artikel | Must Have | MVP |
| M02-015 | Set author | Must Have | MVP |
| M02-016 | Slug otomatis | Must Have | MVP |
| M02-017 | Meta description untuk SEO | Should Have | V2 |

---

## M03 — TENTANG KAMI

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M03-001 | Halaman Tentang Kami | Must Have | MVP |
| M03-002 | Konten bisa dikelola dari CMS | Must Have | MVP |
| M03-003 | Menampilkan visi, misi, nilai platform | Must Have | MVP |
| M03-004 | Menampilkan tim/founder (opsional) | Could Have | Phase 2 |
| M03-005 | Menampilkan timeline sejarah platform | Could Have | Phase 2 |

---

## M04 — HUBUNGI KAMI

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M04-001 | Halaman Hubungi Kami | Must Have | MVP |
| M04-002 | Link Instagram (clickable, dikelola CMS) | Must Have | MVP |
| M04-003 | Link WhatsApp (clickable, dikelola CMS) | Must Have | MVP |
| M04-004 | Link Email (mailto:, dikelola CMS) | Must Have | MVP |
| M04-005 | Form kontak (opsional untuk MVP) | Could Have | V2 |

---

## M05 — SARAN / SUGGESTION

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M05-001 | Form saran untuk guest dan member | Should Have | V2 |
| M05-002 | Nama (optional) | Should Have | V2 |
| M05-003 | Email (optional) | Should Have | V2 |
| M05-004 | Isi saran (wajib) | Should Have | V2 |
| M05-005 | Submit → simpan ke database | Should Have | V2 |
| M05-006 | Konfirmasi berhasil | Should Have | V2 |
| M05-010 | Superadmin: lihat daftar saran | Should Have | V2 |
| M05-011 | Superadmin: lihat detail saran | Should Have | V2 |
| M05-012 | Superadmin: tandai sudah dibaca | Should Have | V2 |
| M05-013 | Superadmin: respon saran | Could Have | Phase 2 |
| M05-014 | Superadmin: hapus saran | Should Have | V2 |

---

## M06 — REGISTER

**Status:** Existing — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M06-001 | Register dengan email | Must Have | MVP |
| M06-002 | Register dengan username | Must Have | MVP |
| M06-003 | Minimal salah satu (email atau username) wajib diisi | Must Have | MVP |
| M06-004 | Password wajib diisi | Must Have | MVP |
| M06-005 | Confirm password wajib diisi | Must Have | MVP |
| M06-006 | Nama (boleh ringan/default) | Must Have | MVP |
| M06-007 | Nomor HP (optional) | Should Have | V2 |
| M06-008 | Regional (optional) | Should Have | V2 |
| M06-009 | Interest (bisa dipilih nanti) | Should Have | V2 |
| M06-010 | Foto profil (optional) | Should Have | V2 |
| M06-011 | Validasi tidak terlalu berat | Must Have | MVP |
| M06-020 | Setelah register → onboarding ringan | Must Have | MVP |
| M06-021 | Tampilkan CTA: "Request Role Sekarang" | Must Have | MVP |
| M06-022 | Tampilkan CTA: "Nanti Saja" | Must Have | MVP |
| M06-030 | Username harus unique jika diisi | Must Have | MVP |
| M06-031 | Email harus unique jika diisi | Must Have | MVP |
| M06-032 | Email verification optional untuk MVP | Must Have | MVP |
| M06-033 | Password minimal 8 karakter | Must Have | MVP |

---

## M07 — LOGIN SEPARATION

**Status:** Existing | **Priority:** MVP | **Premium:** Free

*(Detail ada di dokumen `11-login-separation.md`)*

---

## M08 — ROLE REQUEST

**Status:** Existing — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M08-001 | Pilih role: Member, Community Owner, Brand Owner, Company Owner | Must Have | MVP |
| M08-002 | Jika Community Owner → isi data komunitas awal | Must Have | MVP |
| M08-003 | Jika Brand Owner → isi data brand awal | Must Have | MVP |
| M08-004 | Jika Company Owner → isi data perusahaan awal | Must Have | MVP |
| M08-005 | Jika "Nanti Saja" → redirect ke dashboard member | Must Have | MVP |
| M08-010 | Status: pending, approved, rejected | Must Have | MVP |
| M08-011 | Rejected harus memiliki alasan | Must Have | MVP |
| M08-012 | User bisa melihat status request | Must Have | MVP |
| M08-013 | User yang belum approved tidak boleh akses dashboard role khusus | Must Have | MVP |
| M08-014 | User bisa request role kapan saja dari dashboard | Must Have | MVP |

---

## M09 — MEMBER DASHBOARD

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M09-001 | Menampilkan ringkasan aktivitas | Must Have | MVP |
| M09-002 | Komunitas yang diikuti (top 5) | Must Have | MVP |
| M09-003 | Event yang akan datang | Must Have | MVP |
| M09-004 | Jumlah teman | Should Have | V2 |
| M09-005 | Bookmark terbaru | Should Have | V2 |
| M09-006 | Quick action: edit profil, explore, buat komunitas | Must Have | MVP |

---

## M10 — MEMBER PROFILE

**Status:** Existing — Perlu Expansion | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M10-001 | Edit nama | Must Have | MVP |
| M10-002 | Edit username | Must Have | MVP |
| M10-003 | Edit email | Must Have | MVP |
| M10-004 | Edit bio | Must Have | MVP |
| M10-005 | Edit regional | Should Have | V2 |
| M10-006 | Edit interest | Must Have | MVP |
| M10-007 | Upload/edit foto profil | Must Have | MVP |
| M10-008 | Edit social link | Should Have | V2 |
| M10-009 | Ubah password | Must Have | MVP |
| M10-010 | Privacy profil: Public, Hanya Teman, Private | Should Have | V2 |
| M10-011 | Data profil yang belum diisi tetap boleh kosong | Must Have | MVP |
| M10-012 | Member yang banned/suspended tidak bisa akses dashboard | Must Have | MVP |

---

## M11 — MEMBER INTEREST

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M11-001 | Interest dari master data | Must Have | MVP |
| M11-002 | Multi-select interest | Must Have | MVP |
| M11-003 | Interest bisa diubah kapan saja | Must Have | MVP |
| M11-004 | Minimum 1 interest (opsional untuk MVP) | Should Have | V2 |

---

## M12 — MEMBER FRIEND SYSTEM

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M12-001 | Kirim permintaan teman | Should Have | V2 |
| M12-002 | Terima permintaan teman | Should Have | V2 |
| M12-003 | Tolak permintaan teman | Should Have | V2 |
| M12-004 | Hapus teman | Should Have | V2 |
| M12-005 | Lihat daftar teman | Should Have | V2 |
| M12-006 | Lihat komunitas teman (public only) | Should Have | V2 |
| M12-007 | Respect privacy setting komunitas | Should Have | V2 |
| M12-008 | Search user untuk menambah teman | Should Have | V2 |
| M12-009 | Status friendship: pending, accepted | Should Have | V2 |

**DB (Prompt 3):** `friendships` — user_id, friend_id, status, timestamps

---

## M13 — MEMBER BOOKMARK

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M13-001 | Bookmark komunitas | Should Have | V2 |
| M13-002 | Hapus bookmark | Should Have | V2 |
| M13-003 | Lihat daftar bookmark | Should Have | V2 |
| M13-004 | Toggle bookmark (satu klik) | Should Have | V2 |
| M13-005 | Bookmark count di komunitas | Could Have | Phase 2 |

**DB (Prompt 3):** `bookmarks` — user_id, community_id, timestamps

---

## M14 — MEMBER GALLERY

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M14-001 | Upload foto galeri | Should Have | V2 |
| M14-002 | Caption foto | Should Have | V2 |
| M14-003 | Tanggal kegiatan | Should Have | V2 |
| M14-004 | Komunitas terkait (optional) | Should Have | V2 |
| M14-005 | Event terkait (optional) | Should Have | V2 |
| M14-006 | Visibility: public / private | Should Have | V2 |
| M14-007 | Hapus galeri | Should Have | V2 |

**DB (Prompt 3):** `member_galleries` — user_id, image_path, caption, activity_date, community_id, event_id, visibility

---

## M15 — MEMBER HISTORY

**Status:** Partial | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M15-001 | Riwayat join komunitas | Should Have | V2 |
| M15-002 | Riwayat ikut event | Should Have | V2 |
| M15-003 | Riwayat bookmark | Should Have | V2 |
| M15-004 | Riwayat role request | Should Have | V2 |
| M15-005 | Riwayat volunteer | Should Have | V2 |
| M15-006 | Riwayat donation | Should Have | V2 |
| M15-007 | Filter by tipe aktivitas | Should Have | V2 |

---

## M16 — COMMUNITY DIRECTORY

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M16-001 | Daftar komunitas (paginated) | Must Have | MVP |
| M16-002 | Card: logo, nama, kategori, jumlah member, regional | Must Have | MVP |
| M16-003 | Detail komunitas | Must Have | MVP |
| M16-004 | Join/Leave komunitas | Must Have | MVP |
| M16-005 | Jumlah komunitas ditampilkan | Must Have | MVP |

---

## M17 — COMMUNITY FILTER

**Status:** Partial | **Priority:** MVP/V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M17-001 | Filter by interest | Must Have | MVP |
| M17-002 | Filter by regional (kota, provinsi) | Must Have | MVP |
| M17-003 | Filter by kategori komunitas | Must Have | MVP |
| M17-004 | Filter by tipe: Public, Private, Invite Only | Should Have | V2 |
| M17-005 | Filter by status: Active, Inactive, Suspended | Should Have | V2 |
| M17-006 | Filter by aktivitas: ada event, open volunteer, open pengurus | Should Have | V2 |
| M17-007 | Filter by ukuran: Kecil, Menengah, Besar | Could Have | Phase 2 |
| M17-008 | Rekomendasi: Recommended, Popular, New, Near You, Friends Joined | Should Have | V2 |
| M17-009 | Search keyword: nama, deskripsi, tag, lokasi | Must Have | MVP |
| M17-010 | Filter di sidebar desktop, drawer di mobile | Must Have | MVP |
| M17-011 | Sorting: terbaru, populer, paling relevan | Must Have | MVP |
| M17-012 | Empty state jika tidak ada hasil | Must Have | MVP |
| M17-013 | Reset filter | Must Have | MVP |
| M17-014 | Save filter | — | Phase 2/Premium |

---

## M18 — COMMUNITY DETAIL

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M18-001 | Profil komunitas lengkap | Must Have | MVP |
| M18-002 | Daftar pengurus | Must Have | MVP |
| M18-003 | Daftar event | Must Have | MVP |
| M18-004 | Daftar member (jika public) | Must Have | MVP |
| M18-005 | CTA Join/Leave | Must Have | MVP |
| M18-006 | CTA Bookmark | Should Have | V2 |
| M18-007 | Campaign kepengurusan aktif | Should Have | V2 |
| M18-008 | Campaign volunteer aktif | Should Have | V2 |

---

## M19 — COMMUNITY OWNER DASHBOARD

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M19-001 | Ringkasan komunitas (member, event, kolaborasi) | Must Have | MVP |
| M19-002 | Komunitas yang dimiliki | Must Have | MVP |
| M19-003 | Event terbaru | Must Have | MVP |
| M19-004 | Request kolaborasi masuk | Must Have | MVP |
| M19-005 | Quick action | Must Have | MVP |

---

## M20 — COMMUNITY MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M20-001 | Buat komunitas (nama, slug, deskripsi, kategori, regional, logo, banner, sosmed, kontak, visibility) | Must Have | MVP |
| M20-002 | Edit komunitas | Must Have | MVP |
| M20-003 | Hapus komunitas (soft delete) | Must Have | MVP |
| M20-004 | Arsipkan komunitas | Should Have | V2 |
| M20-005 | Pengaturan approval join | Must Have | MVP |
| M20-006 | Status komunitas | Must Have | MVP |
| M20-007 | Transfer ownership | Should Have | V2 |
| M20-008 | Post/update komunitas | Could Have | Phase 2 |

---

## M21 — COMMUNITY PENGURUS

**Status:** Existing — Perlu Expansion | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M21-001 | Status aktif/tidak aktif | Must Have | MVP |
| M21-002 | Periode mulai & sampai | Must Have | MVP |
| M21-003 | Jabatan/posisi | Must Have | MVP |
| M21-004 | Keterangan tugas | Should Have | V2 |
| M21-005 | Status verifikasi | Should Have | V2 |
| M21-006 | Nonaktifkan pengurus | Must Have | MVP |
| M21-007 | Auto-inactive jika tidak aktif > 3 bulan | Could Have | Phase 2 |
| M21-008 | Soft delete relasi pengurus, bukan akun user | Must Have | MVP |
| M21-009 | Permission sederhana untuk MVP | Must Have | MVP |
| M21-010 | Permission detail per pengurus | Could Have | Phase 2 |

---

## M22 — COMMUNITY VOLUNTEER

**Status:** Existing — Perlu Expansion | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M22-001 | Status aktif/tidak aktif | Must Have | MVP |
| M22-002 | Periode mulai & sampai | Must Have | MVP |
| M22-003 | Jabatan/posisi | Should Have | V2 |
| M22-004 | Keterangan tugas | Should Have | V2 |
| M22-005 | Soft delete relasi, bukan akun user | Must Have | MVP |

---

## M23 — CAMPAIGN OPEN KEPENGURUSAN

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M23-001 | Nama campaign, deskripsi, posisi, jumlah, periode, tanggal buka/tutup, syarat | Should Have | V2 |
| M23-002 | Form pendaftaran | Should Have | V2 |
| M23-003 | Status campaign | Should Have | V2 |
| M23-004 | Review & approve/reject applicant | Should Have | V2 |

**DB (Prompt 3):** `community_open_positions`, `community_position_applications`

---

## M24 — EVENT MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M24-001 | Buat event (nama, slug, deskripsi, komunitas, tanggal) | Must Have | MVP |
| M24-002 | Lokasi (online/offline/hybrid), link meeting | Must Have | MVP |
| M24-003 | Kuota, harga/free/paid, poster/banner | Must Have | MVP |
| M24-004 | Status: draft/published/cancelled/completed | Must Have | MVP |
| M24-005 | Visibility: public/private | Must Have | MVP |
| M24-006 | Form pendaftaran custom, approval peserta | Should Have | V2 |

---

## M25 — EVENT REGISTRATION

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M25-001 | Member bisa daftar/cancel event | Must Have | MVP |
| M25-002 | Owner lihat daftar peserta | Must Have | MVP |
| M25-003 | Export peserta | Premium | V2 |
| M25-004 | Status: registered, approved, rejected, attended, cancelled | Must Have | MVP |

---

## M26 — EVENT VOLUNTEER CAMPAIGN

**Status:** Partial | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M26-001 | Event membuka volunteer (posisi, jumlah, periode, syarat) | Should Have | V2 |
| M26-002 | Form daftar volunteer, review, approve/reject | Should Have | V2 |

**DB (Prompt 3):** `event_volunteer_positions`, `event_volunteer_applications`

---

## M27 — EVENT DONATION

**Status:** Existing — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M27-001 | Open donation, target, periode, manual confirmation | Must Have | MVP |
| M27-002 | Status: pending, verified, rejected | Must Have | MVP |
| M27-003 | Report pemasukan/pengeluaran, saldo, transparansi | Should Have | V2 |
| M27-004 | Payment gateway | — | Phase 2 |

---

## M28 — EVENT FINANCE REPORT

**Status:** Partial | **Priority:** V2 | **Premium:** Premium Candidate

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M28-001 | Pemasukan, pengeluaran, kategori, bukti, deskripsi, ringkasan | Should Have | V2 |
| M28-002 | Export laporan (CSV) | Premium | V2 |

**DB (Prompt 3):** `event_financial_transactions`

---

## M29 — BRAND OWNER DASHBOARD

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M29-001 | Ringkasan brand, kolaborasi masuk/keluar, campaign aktif | Must Have | MVP |

---

## M30 — BRAND MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M30-001 | Buat/edit/hapus brand (soft delete) | Must Have | MVP |
| M30-002 | Hubungkan brand ke perusahaan | Should Have | V2 |
| M30-003 | Kelola staff brand | Must Have | MVP |

---

## M31 — COMPANY MANAGEMENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M31-001 | Buat profil perusahaan (nama, legal name, industri, deskripsi, website, email, phone, logo, alamat) | Must Have | MVP |
| M31-002 | Status verifikasi | Must Have | MVP |

**DB (Prompt 3):** `companies` — name, legal_name, industry, description, website, email, phone, logo_path, address, owner_id, status, soft_deletes

---

## M32 — COMPANY AS BRAND PARENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M32-001 | Satu perusahaan → banyak brand | Must Have | MVP |
| M32-002 | Brand bisa terkait perusahaan atau berdiri sendiri | Must Have | MVP |
| M32-003 | Undang brand owner/admin | Should Have | V2 |

---

## M33 — BRAND-COMMUNITY COLLABORATION

**Status:** Existing — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M33-001 | Brand ↔ Community bisa ajukan kolaborasi | Must Have | MVP |
| M33-002 | Status: draft, sent, reviewed, accepted, rejected, cancelled, completed | Must Have | MVP |
| M33-003 | Tipe: sponsorship, media partner, event partner, product support, community activation, donation, campaign | Must Have | MVP |
| M33-004 | Proposal: judul, deskripsi, tujuan, target audience, benefit, budget, timeline, attachment | Must Have | MVP |
| M33-005 | Filter komunitas untuk kolaborasi | Should Have | V2 |
| M33-006 | Collaboration analytics | — | Phase 2 |

---

## M34 — SUPERADMIN DASHBOARD

**Status:** Existing — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M34-001 | Lihat daftar member, detail, hapus/ban dengan alasan | Must Have | MVP |
| M34-002 | Export data member | Should Have | V2 |
| M34-003 | Lihat history aktivitas member | Should Have | V2 |
| M34-004 | Lihat daftar community owner, detail, hapus/ban | Must Have | MVP |
| M34-005 | Transfer ownership komunitas sebelum delete owner | Must Have | MVP |
| M34-006 | Lihat daftar komunitas, hapus/ban komunitas | Must Have | MVP |
| M34-007 | Export data komunitas | Should Have | V2 |
| M34-008 | Lihat daftar brand owner, detail, hapus/ban | Must Have | MVP |
| M34-009 | Transfer ownership brand sebelum delete owner | Must Have | MVP |
| M34-010 | Lihat daftar perusahaan, detail, brand dimiliki | Must Have | MVP |
| M34-011 | Lihat daftar event, detail, hapus/ban | Must Have | MVP |
| M34-012 | Kelola master data: kategori, interest, regional, jenis event | Must Have | MVP |
| M34-013 | CMS beranda, blog, tentang kami, hubungi kami | Must Have | MVP |
| M34-014 | Kelola link Instagram, WhatsApp, Email | Must Have | MVP |
| M34-015 | Kelola saran/suggestion | Should Have | V2 |
| M34-016 | Dashboard metrics lengkap | Must Have | MVP |
| M34-017 | Metrics data kosong tidak error | Must Have | MVP |
| M34-018 | Melihat user login hari ini | Should Have | V2 |
| M34-019 | Melihat aktivitas admin | Should Have | V2 |
| M34-020 | Edit profil, ubah password | Must Have | MVP |
| M34-021 | Chat sesama admin | Should Have | V2 |
| M34-022 | Lihat audit log | Must Have | MVP |
| M34-023 | Kelola premium feature & trial | Should Have | V2 |
| M34-024 | Mengatur tampilan dasar website | Should Have | V2 |
| M34-025 | Mengatur rekomendasi komunitas | Should Have | V2 |
| M34-026 | Aksi admin wajib masuk audit log | Must Have | MVP |

---

## M35 — SUPERADMIN USER MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M35-001 | Lihat daftar member (paginated, search, filter) | Must Have | MVP |
| M35-002 | Lihat detail member | Must Have | MVP |
| M35-003 | Soft delete member | Must Have | MVP |
| M35-004 | Ban/suspend member dengan alasan | Must Have | MVP |
| M35-005 | Export data member | Should Have | V2 |
| M35-006 | Lihat history aktivitas member | Should Have | V2 |

---

## M36 — SUPERADMIN COMMUNITY MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M36-001 | Lihat daftar community owner, detail | Must Have | MVP |
| M36-002 | Ban/delete community owner | Must Have | MVP |
| M36-003 | Transfer ownership komunitas sebelum delete | Must Have | MVP |
| M36-004 | Lihat daftar komunitas, hapus/ban | Must Have | MVP |
| M36-005 | Export data komunitas | Should Have | V2 |

---

## M37 — SUPERADMIN BRAND MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M37-001 | Lihat daftar brand owner, detail | Must Have | MVP |
| M37-002 | Ban/delete brand owner | Must Have | MVP |
| M37-003 | Transfer ownership brand sebelum delete | Must Have | MVP |
| M37-004 | Lihat daftar brand, hapus/ban | Must Have | MVP |

---

## M38 — SUPERADMIN COMPANY MANAGEMENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M38-001 | Lihat daftar perusahaan, detail | Must Have | MVP |
| M38-002 | Lihat brand yang dimiliki perusahaan | Must Have | MVP |
| M38-003 | Approve/reject perusahaan | Must Have | MVP |
| M38-004 | Hapus/ban perusahaan | Must Have | MVP |

---

## M39 — SUPERADMIN EVENT MANAGEMENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M39-001 | Lihat daftar event, detail | Must Have | MVP |
| M39-002 | Hapus/ban event | Must Have | MVP |

---

## M40 — SUPERADMIN MASTER DATA

**Status:** Existing — Perlu Expansion | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M40-001 | Kelola master data kategori komunitas (CRUD) | Must Have | MVP |
| M40-002 | Kelola master data interest (CRUD) | Must Have | MVP |
| M40-003 | Kelola master data regional (CRUD) | Must Have | MVP |
| M40-004 | Kelola master data jenis event (CRUD) | Must Have | MVP |

---

## M41 — SUPERADMIN CMS

**Status:** Partial — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M41-001 | CMS beranda (hero, section order) | Must Have | MVP |
| M41-002 | CMS Blog (CRUD artikel) | Must Have | MVP |
| M41-003 | CMS Tentang Kami | Must Have | MVP |
| M41-004 | CMS Hubungi Kami | Must Have | MVP |
| M41-005 | CMS Saran/Suggestion | Should Have | V2 |
| M41-006 | Pengaturan rekomendasi komunitas | Should Have | V2 |

---

## M42 — SUPERADMIN CONTACT MANAGEMENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M42-001 | Kelola link Instagram, WhatsApp, Email | Must Have | MVP |
| M42-002 | Link tersimpan di CMS/database | Must Have | MVP |

---

## M43 — SUPERADMIN SUGGESTION MANAGEMENT

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M43-001 | Lihat daftar & detail saran | Should Have | V2 |
| M43-002 | Tandai sudah dibaca, hapus saran | Should Have | V2 |

---

## M44 — SUPERADMIN METRICS

**Status:** Partial | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M44-001 | Total member, komunitas, brand, event, perusahaan | Must Have | MVP |
| M44-002 | Data baru bulan ini, role request pending | Must Have | MVP |
| M44-003 | Dashboard metrics data kosong tidak error | Must Have | MVP |
| M44-004 | Chart/grafik (line, bar, pie) | Should Have | V2 |

---

## M45 — SUPERADMIN LOGIN ACTIVITY

**Status:** Partial | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M45-001 | Melihat user login hari ini | Should Have | V2 |
| M45-002 | Detail: user, waktu, IP, browser | Should Have | V2 |
| M45-003 | Filter tanggal | Should Have | V2 |

---

## M46 — ADMIN INTERNAL CHAT

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M46-001 | Chat sesama admin/pemilik platform | Should Have | V2 |
| M46-002 | Daftar percakapan, kirim & lihat pesan | Should Have | V2 |
| M46-003 | Status online/offline | Could Have | Phase 2 |

**DB (Prompt 3):** `admin_chats` — sender_id, receiver_id, message, read_at, timestamps

---

## M47 — MULTILANGUAGE

*(Detail ada di dokumen `12-multilanguage.md`)*

---

## M48 — PREMIUM FEATURE LOCK

**Status:** Baru | **Priority:** V2 | **Premium:** System

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M48-001 | Feature flag system (config-based) | Should Have | V2 |
| M48-002 | Per-role feature access | Should Have | V2 |
| M48-003 | Premium badge/label pada fitur terkunci | Should Have | V2 |
| M48-004 | CTA upgrade ke premium | Should Have | V2 |

---

## M49 — TRIAL PREMIUM

*(Detail ada di dokumen `10-trial-premium.md`)*

---

## M50 — NOTIFICATION

**Status:** Baru | **Priority:** Phase 2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M50-001 | In-app notification | Could Have | Phase 2 |
| M50-002 | Email notification | Could Have | Phase 2 |
| M50-003 | Push notification | Could Have | Phase 2 |

---

## M51 — AUDIT LOG

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M51-001 | Aksi admin harus masuk audit log | Must Have | MVP |
| M51-002 | View & detail audit log | Must Have | MVP |
| M51-003 | Filter audit log | Should Have | V2 |

---

## M52 — SECURITY & MODERATION

**Status:** Partial | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M52-001 | Ban harus dengan alasan | Must Have | MVP |
| M52-002 | Delete data penting soft delete | Must Have | MVP |
| M52-003 | Transfer ownership wajib sebelum owner dihapus permanen | Must Have | MVP |
| M52-004 | Export data CSV/Excel | Should Have | V2 |
| M52-005 | CSRF, XSS protection | Must Have | MVP |
| M52-006 | Rate limiting, password hashing, session mgmt | Must Have | MVP |
