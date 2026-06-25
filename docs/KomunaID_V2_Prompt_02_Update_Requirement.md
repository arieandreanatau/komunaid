# KOMUNAID V2 — UPDATE REQUIREMENT DOCUMENT

**Version:** 2.0
**Date:** 2026-06-25
**Status:** Draft — Prompt 2 Output
**Project Path:** C:\Xampp\htdocs\komunaid
**Stack:** Laravel 11 + MySQL + Blade + Tailwind CSS + Spatie Permission

> **Tagline:** CONNECT • COMMUNITY • GROW

---

## 1. RINGKASAN KOMUNAID V2 ENHANCEMENT

### 1.1 Platform Overview

KomunaID adalah platform komunitas berbasis web application untuk menghubungkan:

| No | Koneksi | Aktor |
|----|---------|-------|
| 1 | Member ↔ Komunitas | Member, Community Owner |
| 2 | Komunitas ↔ Komunitas | Community Owner |
| 3 | Komunitas ↔ Brand | Brand Owner, Community Owner |
| 4 | Brand ↔ Perusahaan | Company Owner, Brand Owner |
| 5 | Brand/Perusahaan ↔ Event Komunitas | Brand Owner, Company Owner, Community Owner |
| 6 | Superadmin ↔ Semua | Superadmin, Platform Admin |

### 1.2 Existing Features (Hasil Prompt 0 & 1)

| No | Fitur | Status | Catatan |
|----|-------|--------|---------|
| 1 | Auth (Login/Register/Logout) | ✅ Existing | Basic auth berfungsi |
| 2 | Onboarding pasca-register | ✅ Existing | Basic onboarding flow |
| 3 | Role Request (community_owner, brand_owner) | ✅ Existing | Pending/approve/reject |
| 4 | Member Dashboard | ✅ Existing | Basic dashboard |
| 5 | Member Profile Edit | ✅ Existing | Profile CRUD |
| 6 | Community Directory (Public) | ✅ Existing | Listing + detail |
| 7 | Community CRUD (Owner) | ✅ Existing | Full CRUD |
| 8 | Community Members Management | ✅ Existing | Approve/ban/unban/role |
| 9 | Community Regions | ✅ Existing | CRUD regions |
| 10 | Community Subgroups | ✅ Existing | CRUD subgroups |
| 11 | Community Bans | ✅ Existing | Ban management |
| 12 | Community Member Roles | ✅ Existing | Role assignment |
| 13 | Event CRUD (Owner) | ✅ Existing | Full CRUD + types |
| 14 | Event Registration | ✅ Existing | Register/cancel flow |
| 15 | Event Payment Confirmation | ✅ Existing | Upload bukti transfer |
| 16 | Event Gallery | ✅ Existing | Upload/delete images |
| 17 | Event Chat & Threads | ✅ Existing | Chat per event |
| 18 | Brand CRUD (Owner) | ✅ Existing | Full CRUD |
| 19 | Brand Members/Staff | ✅ Existing | Add/remove staff |
| 20 | Campaign (Brand) | ✅ Existing | Basic CRUD |
| 21 | Collaboration Request | ✅ Existing | Brand ↔ Community |
| 22 | Donation System | ✅ Existing | Basic donation flow |
| 23 | Wallet System | ✅ Existing | Credit/debit |
| 24 | Platform Fee | ✅ Existing | Basic fee tracking |
| 25 | Superadmin Dashboard | ✅ Existing | Basic metrics |
| 26 | Superadmin Approval Center | ✅ Existing | Multi-entity approval |
| 27 | Superadmin User Management | ✅ Existing | View/suspend/ban |
| 28 | Superadmin Community Management | ✅ Existing | View/approve/reject/suspend |
| 29 | Superadmin Brand Management | ✅ Existing | View/approve/reject/suspend |
| 30 | Superadmin Category Management | ✅ Existing | CRUD |
| 31 | Superadmin Master Region | ✅ Existing | CRUD |
| 32 | Superadmin Audit Log | ✅ Existing | View logs |
| 33 | Superadmin Wallet Management | ✅ Existing | View/adjust |
| 34 | Superadmin Donation Management | ✅ Existing | View/confirm/reject |
| 35 | Superadmin Platform Fee | ✅ Existing | View reports |
| 36 | Superadmin Login (Separate) | ✅ Existing | /admin/login |
| 37 | CMS Pages | ✅ Existing | Basic CRUD |
| 38 | Interests | ✅ Existing | Multi-select interest |
| 39 | Login Logs | ✅ Existing | Track login activity |
| 40 | Member Join History | ✅ Existing | Track community joins |
| 41 | Spatie Roles & Permissions | ✅ Existing | 10 roles defined |
| 42 | Policies (Brand, Community, Event, Collab) | ✅ Existing | Authorization |

### 1.3 Enhancement Required (Gap Analysis)

| No | Fitur | Status Gap | Keterangan |
|----|-------|------------|------------|
| 1 | Register — email/username flexible | ⚠️ Partial | Perlu validasi flexible |
| 2 | Public Homepage | ⚠️ Basic | Perlu hero, rekomendasi, blog section |
| 3 | Member Friend System | ❌ Missing | Belum ada tabel relasi teman |
| 4 | Member Bookmark | ❌ Missing | Belum ada tabel bookmark |
| 5 | Member Gallery | ❌ Missing | Event gallery ada, member gallery tidak |
| 6 | Member History (Lengkap) | ⚠️ Partial | MemberJoinHistory ada, belum lengkap |
| 7 | Community Filter (Advanced) | ⚠️ Basic | Directory ada, filter belum lengkap |
| 8 | Campaign Open Kepengurusan | ❌ Missing | Belum ada tabel community_open_positions |
| 9 | Campaign Open Volunteer | ❌ Missing | Belum ada campaign volunteer khusus |
| 10 | Event Volunteer Campaign | ⚠️ Partial | EventType volunteer ada, detail belum |
| 11 | Event Finance Report | ⚠️ Partial | Wallet ada, laporan detail belum |
| 12 | Company Management | ❌ Missing | Tabel companies belum ada |
| 13 | Brand-Company Relation | ❌ Missing | Belum ada relasi brand→company |
| 14 | Blog System | ❌ Missing | CMS pages ada, blog-specific belum |
| 15 | Saran/Suggestion | ❌ Missing | Belum ada tabel suggestions |
| 16 | Contact Management (CMS) | ⚠️ Basic | CMS page ada, link management belum |
| 17 | Superadmin Metrics (Detail) | ⚠️ Basic | Dashboard ada, metrics detail belum |
| 18 | Superadmin Login Activity | ⚠️ Partial | LoginLogs ada, tampilan perlu enhancement |
| 19 | Admin Internal Chat | ❌ Missing | Belum ada sistem chat admin |
| 20 | Multilanguage | ❌ Missing | Belum ada file translation |
| 21 | Premium Feature Lock | ❌ Missing | Belum ada feature flag |
| 22 | Trial Premium | ❌ Missing | Belum ada sistem trial |
| 23 | Notification System | ❌ Missing | Belum ada notification table/driver |
| 24 | Member Privacy Settings | ❌ Missing | Belum ada privacy field di profile |
| 25 | Community Transfer Ownership | ❌ Missing | Belum ada mekanisme transfer |
| 26 | Brand Transfer Ownership | ❌ Missing | Belum ada mekanisme transfer |
| 27 | Public Event Listing | ⚠️ Partial | Event index ada, filter perlu enhancement |
| 28 | Export Data (CSV) | ❌ Missing | Belum ada export functionality |

### 1.4 New Features for V2

| No | Fitur | Phase | Priority |
|----|-------|-------|----------|
| 1 | Friend System | V2 | Should Have |
| 2 | Member Bookmark | V2 | Should Have |
| 3 | Member Gallery | V2 | Should Have |
| 4 | Company Management | MVP | Must Have |
| 5 | Blog System | MVP | Must Have |
| 6 | Suggestion System | V2 | Should Have |
| 7 | Campaign Open Kepengurusan | V2 | Should Have |
| 8 | Event Volunteer Campaign Detail | V2 | Should Have |
| 9 | Event Finance Report | V2 | Should Have |
| 10 | Admin Internal Chat | V2 | Should Have |
| 11 | Multilanguage | V2 | Should Have |
| 12 | Premium Feature Lock | V2 | Should Have |
| 13 | Trial Premium | V2 | Should Have |
| 14 | Notification System | Phase 2 | Could Have |
| 15 | Advanced Export | V2 | Should Have |
| 16 | CMS Enhancement | MVP | Must Have |

---

## 2. SCOPE MVP, V2, DAN PHASE 2

### 2.1 MVP (Must Have — Launch Readiness)

| No | Modul | Fitur | Status |
|----|-------|-------|--------|
| 1 | Auth | Register (email/username flexible) | Existing — perlu enhancement |
| 2 | Auth | Login (user & superadmin terpisah) | Existing — sudah terpisah |
| 3 | Auth | Logout | Existing |
| 4 | Auth | Forgot Password | Existing |
| 5 | Auth | Onboarding pasca-register | Existing |
| 6 | Role | Request role | Existing |
| 7 | Role | Approve/reject role request | Existing |
| 8 | Public | Homepage / Beranda | Existing — perlu enhancement besar |
| 9 | Public | Community Directory | Existing — perlu filter enhancement |
| 10 | Public | Community Detail | Existing |
| 11 | Public | Event Listing | Existing — perlu enhancement |
| 12 | Public | Event Detail | Existing |
| 13 | CMS | Blog CRUD (superadmin) | Baru |
| 14 | CMS | Tentang Kami | Baru |
| 15 | CMS | Contact Link | Baru |
| 16 | CMS | Saran/Suggestion Management | Baru |
| 17 | Member | Dashboard | Existing |
| 18 | Member | Profile edit (lengkap) | Existing — perlu expansion |
| 19 | Member | Interest selection | Existing |
| 20 | Member | Join/Leave komunitas | Existing |
| 21 | Member | Daftar/Cancel event | Existing |
| 22 | Member | Wallet & Donation | Existing |
| 23 | Community | CRUD komunitas | Existing |
| 24 | Community | Member management | Existing |
| 25 | Community | Pengurus management | Existing — perlu expansion |
| 26 | Community | Volunteer management | Existing — perlu expansion |
| 27 | Community | Event CRUD | Existing |
| 28 | Community | Collaboration management | Existing |
| 29 | Brand | CRUD brand | Existing |
| 30 | Brand | Staff management | Existing |
| 31 | Brand | Campaign CRUD | Existing |
| 32 | Brand | Collaboration submission | Existing |
| 33 | Company | Buat profil perusahaan | Baru |
| 34 | Company | Kelola brand di bawah perusahaan | Baru |
| 35 | Superadmin | Dashboard | Existing — perlu metrics enhancement |
| 36 | Superadmin | User management | Existing |
| 37 | Superadmin | Community management | Existing |
| 38 | Superadmin | Brand management | Existing |
| 39 | Superadmin | Event management | Baru |
| 40 | Superadmin | Master data | Existing — perlu expansion |
| 41 | Superadmin | CMS management | Existing — perlu expansion |
| 42 | Superadmin | Contact link management | Baru |
| 43 | Superadmin | Suggestion management | Baru |
| 44 | Superadmin | Audit log | Existing |
| 45 | Superadmin | Approval center | Existing |
| 46 | Security | Soft delete untuk data penting | Existing (partial) |
| 47 | Security | Ban dengan alasan | Existing (partial) |
| 48 | Security | Ownership transfer sebelum delete | Baru |
| 49 | Community | Basic filter | Existing — perlu enhancement |

### 2.2 V2 (Should Have — Enhancement Phase)

| No | Modul | Fitur |
|----|-------|-------|
| 1 | Member | Friend System |
| 2 | Member | Bookmark komunitas |
| 3 | Member | Gallery kegiatan pribadi |
| 4 | Member | History lengkap |
| 5 | Member | Privacy profile settings |
| 6 | Member | Export data |
| 7 | Community | Campaign open kepengurusan |
| 8 | Community | Campaign open volunteer |
| 9 | Community | Advanced filter |
| 10 | Community | Transfer ownership |
| 11 | Community | Export member |
| 12 | Event | Volunteer campaign detail |
| 13 | Event | Finance report |
| 14 | Event | Donation management detail |
| 15 | Brand | Transfer ownership |
| 16 | Brand | Advanced collaboration pipeline |
| 17 | Superadmin | Login activity today |
| 18 | Superadmin | Admin internal chat |
| 19 | Superadmin | Premium feature management |
| 20 | Superadmin | Trial premium management |
| 21 | Platform | Multilanguage (ID, EN, SUN) |
| 22 | Platform | Notification system (basic) |
| 23 | Platform | Advanced CMS management |
| 24 | Platform | Feature flag system |

### 2.3 Phase 2 (Could Have — Future Enhancement)

| No | Modul | Fitur |
|----|-------|-------|
| 1 | Payment | Payment gateway integration |
| 2 | Analytics | Advanced community analytics |
| 3 | Analytics | Advanced event analytics |
| 4 | Event | QR attendance |
| 5 | Event | Certificate generator |
| 6 | Community | Custom community page |
| 7 | Community | Advanced permission per pengurus |
| 8 | Community | Featured community |
| 9 | Event | Featured event |
| 10 | Brand | Featured brand |
| 11 | Brand | Multi-brand management advanced |
| 12 | Brand | Collaboration analytics |
| 13 | Notification | Advanced push notification |
| 14 | Notification | Email marketing integration |
| 15 | Platform | Mobile app |
| 16 | Platform | Recommendation engine AI |
| 17 | Platform | Member segmentation |
| 18 | Platform | Auto recommendation advanced |
| 19 | Platform | Bulk messaging |
| 20 | Platform | Custom form builder |
| 21 | CMS | Database-based translation |
| 22 | Platform | Priority support |
| 23 | Platform | Verification badge |
| 24 | Platform | Social login |

---

## 3. ACTOR & ROLE DEFINITION

### 3.1 Daftar Aktor

| No | Aktor | Deskripsi | Role Spatie | Login URL | Dashboard URL |
|----|-------|-----------|-------------|-----------|---------------|
| 1 | Guest / Public Visitor | Pengunjung belum login | — (guest) | — | — |
| 2 | Member | User registered, role default | member | /login | /member/dashboard |
| 3 | Community Owner | User memiliki/mengelola komunitas | community_owner | /login | /community-own/dashboard |
| 4 | Pengurus Komunitas | User menjadi pengurus komunitas | community_admin | /login | /member/dashboard |
| 5 | Volunteer Komunitas | User volunteer komunitas/event | community_volunteer | /login | /member/dashboard |
| 6 | Brand Owner | User memiliki brand | rand_owner | /login | /brand/dashboard |
| 7 | Brand Staff | Staff yang membantu brand owner | rand_staff | /login | /brand/dashboard |
| 8 | Company Owner | User memiliki perusahaan | company_owner | /login | /company/dashboard |
| 9 | Superadmin | Pemilik/pengelola platform | superadmin | /admin/login | /superadmin/dashboard |
| 10 | Platform Admin | Admin internal platform | platform_admin | /admin/login | /superadmin/dashboard |

### 3.2 Role Permission Matrix (MVP)

| Fitur | Guest | Member | CO | CA | BO | BS | CP | SA | PA |
|-------|:-----:|:------:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Lihat homepage | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Lihat komunitas public | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Lihat event public | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Baca blog | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| Register | Y | - | - | - | - | - | - | - | - |
| Edit profil | - | Y | Y | Y | Y | Y | Y | Y | Y |
| Join komunitas | - | Y | Y | Y | - | - | - | - | - |
| Daftar event | - | Y | Y | Y | - | - | - | - | - |
| Bookmark | - | Y | Y | Y | - | - | - | - | - |
| Tambah teman | - | Y | Y | Y | - | - | - | - | - |
| Upload galeri | - | Y | Y | Y | - | - | - | - | - |
| Buat komunitas | - | - | Y | - | - | - | - | - | - |
| Kelola komunitas | - | - | Y | Y* | - | - | - | - | - |
| Buat event | - | - | Y | Y* | - | - | - | - | - |
| Buat brand | - | - | - | - | Y | - | - | - | - |
| Kelola brand | - | - | - | - | Y | Y* | - | - | - |
| Buat perusahaan | - | - | - | - | - | - | Y | - | - |
| Kolaborasi brand↔community | - | - | Y | - | Y | Y* | - | - | - |
| Kelola semua data | - | - | - | - | - | - | - | Y | Y* |
| Approve role request | - | - | - | - | - | - | - | Y | Y |
| CMS management | - | - | - | - | - | - | - | Y | Y |
| Master data | - | - | - | - | - | - | - | Y | Y |
| Audit log | - | - | - | - | - | - | - | Y | - |
| Premium/trial | - | - | - | - | - | - | - | Y | - |

> CO=Community Owner, CA=Community Admin, BO=Brand Owner, BS=Brand Staff, CP=Company Owner, SA=Superadmin, PA=Platform Admin. Y* = dengan permission terbatas

### 3.3 Role Transisi & Approval Flow

`
Guest → Register → Member (default)
                         │
                         ├── Request Community Owner → Pending → SA Approve → Community Owner
                         ├── Request Brand Owner → Pending → SA Approve → Brand Owner
                         ├── Request Company Owner → Pending → SA Approve → Company Owner
                         └── Skip (Nanti Saja) → Tetap Member
`

---

## 4. MODULE LIST

| ID | Modul | Deskripsi | Existing? |
|----|-------|-----------|-----------|
| M01 | Public Website / Beranda | Landing page, hero, rekomendasi | Partial |
| M02 | Blog | Artikel, cerita komunitas, opini | Baru |
| M03 | Tentang Kami | CMS-driven about page | Baru |
| M04 | Hubungi Kami | Contact links (IG, WA, Email) | Baru |
| M05 | Saran / Suggestion | Form saran dari pengunjung | Baru |
| M06 | Register | Registrasi user baru | Existing |
| M07 | Login Separation | Login user vs superadmin | Existing |
| M08 | Role Request | Request role khusus | Existing |
| M09 | Member Dashboard | Dashboard member | Existing |
| M10 | Member Profile | Edit profil lengkap | Existing |
| M11 | Member Interest | Pilih interest | Existing |
| M12 | Member Friend System | Pertemanan | Baru |
| M13 | Member Bookmark | Bookmark komunitas | Baru |
| M14 | Member Gallery | Galeri kegiatan pribadi | Baru |
| M15 | Member History | Riwayat aktivitas | Partial |
| M16 | Community Directory | Daftar komunitas public | Existing |
| M17 | Community Filter | Filter & search komunitas | Partial |
| M18 | Community Detail | Detail komunitas | Existing |
| M19 | Community Owner Dashboard | Dashboard pemilik komunitas | Existing |
| M20 | Community Management | CRUD komunitas | Existing |
| M21 | Community Pengurus | Manajemen pengurus | Existing |
| M22 | Community Volunteer | Manajemen volunteer | Existing |
| M23 | Campaign Open Kepengurusan | Open recruitment pengurus | Baru |
| M24 | Event Management | CRUD event | Existing |
| M25 | Event Registration | Pendaftaran event | Existing |
| M26 | Event Volunteer Campaign | Campaign volunteer event | Partial |
| M27 | Event Donation | Donasi event | Existing |
| M28 | Event Finance Report | Laporan keuangan event | Partial |
| M29 | Brand Owner Dashboard | Dashboard pemilik brand | Existing |
| M30 | Brand Management | CRUD brand | Existing |
| M31 | Company Management | Profil perusahaan | Baru |
| M32 | Company as Brand Parent | Relasi perusahaan-brand | Baru |
| M33 | Brand-Community Collaboration | Kolaborasi brand-komunitas | Existing |
| M34 | Superadmin Dashboard | Dashboard superadmin | Existing |
| M35 | Superadmin User Management | Kelola user | Existing |
| M36 | Superadmin Community Management | Kelola komunitas | Existing |
| M37 | Superadmin Brand Management | Kelola brand | Existing |
| M38 | Superadmin Company Management | Kelola perusahaan | Baru |
| M39 | Superadmin Event Management | Kelola event | Baru |
| M40 | Superadmin Master Data | Kategori, interest, regional | Existing |
| M41 | Superadmin CMS | CMS beranda, blog, tentang kami | Partial |
| M42 | Superadmin Contact Management | Kelola link kontak | Baru |
| M43 | Superadmin Suggestion Management | Kelola saran | Baru |
| M44 | Superadmin Metrics | Dashboard metrics detail | Partial |
| M45 | Superadmin Login Activity | Aktivitas login | Partial |
| M46 | Admin Internal Chat | Chat sesama admin | Baru |
| M47 | Multilanguage | Multi-bahasa | Baru |
| M48 | Premium Feature Lock | Fitur premium | Baru |
| M49 | Trial Premium | Percobaan premium | Baru |
| M50 | Notification | Sistem notifikasi | Baru |
| M51 | Audit Log | Log aktivitas admin | Existing |
| M52 | Security & Moderation | Keamanan & moderasi | Partial |

---

## 5. FUNCTIONAL REQUIREMENT PER MODUL

### 5.1 M01 — PUBLIC WEBSITE / BERANDA

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

### 5.2 M02 — BLOG

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

### 5.3 M03 — TENTANG KAMI

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M03-001 | Halaman Tentang Kami | Must Have | MVP |
| M03-002 | Konten bisa dikelola dari CMS | Must Have | MVP |
| M03-003 | Menampilkan visi, misi, nilai platform | Must Have | MVP |
| M03-004 | Menampilkan tim/founder (opsional) | Could Have | Phase 2 |
| M03-005 | Menampilkan timeline sejarah platform | Could Have | Phase 2 |

### 5.4 M04 — HUBUNGI KAMI

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M04-001 | Halaman Hubungi Kami | Must Have | MVP |
| M04-002 | Link Instagram (clickable, dikelola CMS) | Must Have | MVP |
| M04-003 | Link WhatsApp (clickable, dikelola CMS) | Must Have | MVP |
| M04-004 | Link Email (mailto:, dikelola CMS) | Must Have | MVP |
| M04-005 | Form kontak (opsional untuk MVP) | Could Have | V2 |

### 5.5 M05 — SARAN / SUGGESTION

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

### 5.6 M06 — REGISTER

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

### 5.7 M07 — LOGIN SEPARATION

**Status:** Existing | **Priority:** MVP | **Premium:** Free

*(Detail ada di Section 11)*

### 5.8 M08 — ROLE REQUEST

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
### 5.9 M09 — MEMBER DASHBOARD

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M09-001 | Menampilkan ringkasan aktivitas | Must Have | MVP |
| M09-002 | Komunitas yang diikuti (top 5) | Must Have | MVP |
| M09-003 | Event yang akan datang | Must Have | MVP |
| M09-004 | Jumlah teman | Should Have | V2 |
| M09-005 | Bookmark terbaru | Should Have | V2 |
| M09-006 | Quick action: edit profil, explore, buat komunitas | Must Have | MVP |

### 5.10 M10 — MEMBER PROFILE

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
### 5.11 M11 — MEMBER INTEREST

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M11-001 | Interest dari master data | Must Have | MVP |
| M11-002 | Multi-select interest | Must Have | MVP |
| M11-003 | Interest bisa diubah kapan saja | Must Have | MVP |
| M11-004 | Minimum 1 interest (opsional untuk MVP) | Should Have | V2 |

### 5.12 M12 — MEMBER FRIEND SYSTEM

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

**DB (Prompt 3):** riendships — user_id, friend_id, status, timestamps

### 5.13 M13 — MEMBER BOOKMARK

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M13-001 | Bookmark komunitas | Should Have | V2 |
| M13-002 | Hapus bookmark | Should Have | V2 |
| M13-003 | Lihat daftar bookmark | Should Have | V2 |
| M13-004 | Toggle bookmark (satu klik) | Should Have | V2 |
| M13-005 | Bookmark count di komunitas | Could Have | Phase 2 |

**DB (Prompt 3):** ookmarks — user_id, community_id, timestamps

### 5.14 M14 — MEMBER GALLERY

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

**DB (Prompt 3):** member_galleries — user_id, image_path, caption, activity_date, community_id, event_id, visibility

### 5.15 M15 — MEMBER HISTORY

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
### 5.16 M16 — COMMUNITY DIRECTORY

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M16-001 | Daftar komunitas (paginated) | Must Have | MVP |
| M16-002 | Card: logo, nama, kategori, jumlah member, regional | Must Have | MVP |
| M16-003 | Detail komunitas | Must Have | MVP |
| M16-004 | Join/Leave komunitas | Must Have | MVP |
| M16-005 | Jumlah komunitas ditampilkan | Must Have | MVP |

### 5.17 M17 — COMMUNITY FILTER

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

### 5.18 M18 — COMMUNITY DETAIL

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
### 5.19 M19 — COMMUNITY OWNER DASHBOARD

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M19-001 | Ringkasan komunitas (member, event, kolaborasi) | Must Have | MVP |
| M19-002 | Komunitas yang dimiliki | Must Have | MVP |
| M19-003 | Event terbaru | Must Have | MVP |
| M19-004 | Request kolaborasi masuk | Must Have | MVP |
| M19-005 | Quick action | Must Have | MVP |

### 5.20 M20 — COMMUNITY MANAGEMENT

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

### 5.21 M21 — COMMUNITY PENGURUS

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

### 5.22 M22 — COMMUNITY VOLUNTEER

**Status:** Existing — Perlu Expansion | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M22-001 | Status aktif/tidak aktif | Must Have | MVP |
| M22-002 | Periode mulai & sampai | Must Have | MVP |
| M22-003 | Jabatan/posisi | Should Have | V2 |
| M22-004 | Keterangan tugas | Should Have | V2 |
| M22-005 | Soft delete relasi, bukan akun user | Must Have | MVP |

### 5.23 M23 — CAMPAIGN OPEN KEPENGURUSAN

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M23-001 | Nama campaign, deskripsi, posisi, jumlah, periode, tanggal buka/tutup, syarat | Should Have | V2 |
| M23-002 | Form pendaftaran | Should Have | V2 |
| M23-003 | Status campaign | Should Have | V2 |
| M23-004 | Review & approve/reject applicant | Should Have | V2 |

**DB (Prompt 3):** community_open_positions, community_position_applications

### 5.24 M24 — EVENT MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M24-001 | Buat event (nama, slug, deskripsi, komunitas, tanggal) | Must Have | MVP |
| M24-002 | Lokasi (online/offline/hybrid), link meeting | Must Have | MVP |
| M24-003 | Kuota, harga/free/paid, poster/banner | Must Have | MVP |
| M24-004 | Status: draft/published/cancelled/completed | Must Have | MVP |
| M24-005 | Visibility: public/private | Must Have | MVP |
| M24-006 | Form pendaftaran custom, approval peserta | Should Have | V2 |

### 5.25 M25 — EVENT REGISTRATION

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M25-001 | Member bisa daftar/cancel event | Must Have | MVP |
| M25-002 | Owner lihat daftar peserta | Must Have | MVP |
| M25-003 | Export peserta | Premium | V2 |
| M25-004 | Status: registered, approved, rejected, attended, cancelled | Must Have | MVP |

### 5.26 M26 — EVENT VOLUNTEER CAMPAIGN

**Status:** Partial | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M26-001 | Event membuka volunteer (posisi, jumlah, periode, syarat) | Should Have | V2 |
| M26-002 | Form daftar volunteer, review, approve/reject | Should Have | V2 |

**DB (Prompt 3):** event_volunteer_positions, event_volunteer_applications

### 5.27 M27 — EVENT DONATION

**Status:** Existing — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M27-001 | Open donation, target, periode, manual confirmation | Must Have | MVP |
| M27-002 | Status: pending, verified, rejected | Must Have | MVP |
| M27-003 | Report pemasukan/pengeluaran, saldo, transparansi | Should Have | V2 |
| M27-004 | Payment gateway | — | Phase 2 |

### 5.28 M28 — EVENT FINANCE REPORT

**Status:** Partial | **Priority:** V2 | **Premium:** Premium Candidate

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M28-001 | Pemasukan, pengeluaran, kategori, bukti, deskripsi, ringkasan | Should Have | V2 |
| M28-002 | Export laporan (CSV) | Premium | V2 |

**DB (Prompt 3):** event_financial_transactions

### 5.29 M29 — BRAND OWNER DASHBOARD

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M29-001 | Ringkasan brand, kolaborasi masuk/keluar, campaign aktif | Must Have | MVP |

### 5.30 M30 — BRAND MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M30-001 | Buat/edit/hapus brand (soft delete) | Must Have | MVP |
| M30-002 | Hubungkan brand ke perusahaan | Should Have | V2 |
| M30-003 | Kelola staff brand | Must Have | MVP |

### 5.31 M31 — COMPANY MANAGEMENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M31-001 | Buat profil perusahaan (nama, legal name, industri, deskripsi, website, email, phone, logo, alamat) | Must Have | MVP |
| M31-002 | Status verifikasi | Must Have | MVP |

**DB (Prompt 3):** companies — name, legal_name, industry, description, website, email, phone, logo_path, address, owner_id, status, soft_deletes

### 5.32 M32 — COMPANY AS BRAND PARENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M32-001 | Satu perusahaan → banyak brand | Must Have | MVP |
| M32-002 | Brand bisa terkait/perusahaan atau berdiri sendiri | Must Have | MVP |
| M32-003 | Undang brand owner/admin | Should Have | V2 |

### 5.33 M33 — BRAND-COMMUNITY COLLABORATION

**Status:** Existing — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M33-001 | Brand ↔ Community bisa ajukan kolaborasi | Must Have | MVP |
| M33-002 | Status: draft, sent, reviewed, accepted, rejected, cancelled, completed | Must Have | MVP |
| M33-003 | Tipe: sponsorship, media partner, event partner, product support, community activation, donation, campaign | Must Have | MVP |
| M33-004 | Proposal: judul, deskripsi, tujuan, target audience, benefit, budget, timeline, attachment | Must Have | MVP |
| M33-005 | Filter komunitas untuk kolaborasi | Should Have | V2 |
| M33-006 | Collaboration analytics | — | Phase 2 |
### 5.34 M34 — SUPERADMIN DASHBOARD

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
### 5.35 M35 — SUPERADMIN USER MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M35-001 | Lihat daftar member (paginated, search, filter) | Must Have | MVP |
| M35-002 | Lihat detail member | Must Have | MVP |
| M35-003 | Soft delete member | Must Have | MVP |
| M35-004 | Ban/suspend member dengan alasan | Must Have | MVP |
| M35-005 | Export data member | Should Have | V2 |
| M35-006 | Lihat history aktivitas member | Should Have | V2 |

### 5.36 M36 — SUPERADMIN COMMUNITY MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M36-001 | Lihat daftar community owner, detail | Must Have | MVP |
| M36-002 | Ban/delete community owner | Must Have | MVP |
| M36-003 | Transfer ownership komunitas sebelum delete | Must Have | MVP |
| M36-004 | Lihat daftar komunitas, hapus/ban | Must Have | MVP |
| M36-005 | Export data komunitas | Should Have | V2 |

### 5.37 M37 — SUPERADMIN BRAND MANAGEMENT

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M37-001 | Lihat daftar brand owner, detail | Must Have | MVP |
| M37-002 | Ban/delete brand owner | Must Have | MVP |
| M37-003 | Transfer ownership brand sebelum delete | Must Have | MVP |
| M37-004 | Lihat daftar brand, hapus/ban | Must Have | MVP |

### 5.38 M38 — SUPERADMIN COMPANY MANAGEMENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M38-001 | Lihat daftar perusahaan, detail | Must Have | MVP |
| M38-002 | Lihat brand yang dimiliki perusahaan | Must Have | MVP |
| M38-003 | Approve/reject perusahaan | Must Have | MVP |
| M38-004 | Hapus/ban perusahaan | Must Have | MVP |

### 5.39 M39 — SUPERADMIN EVENT MANAGEMENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M39-001 | Lihat daftar event, detail | Must Have | MVP |
| M39-002 | Hapus/ban event | Must Have | MVP |

### 5.40 M40 — SUPERADMIN MASTER DATA

**Status:** Existing — Perlu Expansion | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M40-001 | Kelola master data kategori komunitas (CRUD) | Must Have | MVP |
| M40-002 | Kelola master data interest (CRUD) | Must Have | MVP |
| M40-003 | Kelola master data regional (CRUD) | Must Have | MVP |
| M40-004 | Kelola master data jenis event (CRUD) | Must Have | MVP |
### 5.41 M41 — SUPERADMIN CMS

**Status:** Partial — Perlu Enhancement | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M41-001 | CMS beranda (hero, section order) | Must Have | MVP |
| M41-002 | CMS Blog (CRUD artikel) | Must Have | MVP |
| M41-003 | CMS Tentang Kami | Must Have | MVP |
| M41-004 | CMS Hubungi Kami | Must Have | MVP |
| M41-005 | CMS Saran/Suggestion | Should Have | V2 |
| M41-006 | Pengaturan rekomendasi komunitas | Should Have | V2 |

### 5.42 M42 — SUPERADMIN CONTACT MANAGEMENT

**Status:** Baru | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M42-001 | Kelola link Instagram, WhatsApp, Email | Must Have | MVP |
| M42-002 | Link tersimpan di CMS/database | Must Have | MVP |

### 5.43 M43 — SUPERADMIN SUGGESTION MANAGEMENT

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M43-001 | Lihat daftar & detail saran | Should Have | V2 |
| M43-002 | Tandai sudah dibaca, hapus saran | Should Have | V2 |

### 5.44 M44 — SUPERADMIN METRICS

**Status:** Partial | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M44-001 | Total member, komunitas, brand, event, perusahaan | Must Have | MVP |
| M44-002 | Data baru bulan ini, role request pending | Must Have | MVP |
| M44-003 | Dashboard metrics data kosong tidak error | Must Have | MVP |
| M44-004 | Chart/grafik (line, bar, pie) | Should Have | V2 |

### 5.45 M45 — SUPERADMIN LOGIN ACTIVITY

**Status:** Partial | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M45-001 | Melihat user login hari ini | Should Have | V2 |
| M45-002 | Detail: user, waktu, IP, browser | Should Have | V2 |
| M45-003 | Filter tanggal | Should Have | V2 |

### 5.46 M46 — ADMIN INTERNAL CHAT

**Status:** Baru | **Priority:** V2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M46-001 | Chat sesama admin/pemilik platform | Should Have | V2 |
| M46-002 | Daftar percakapan, kirim & lihat pesan | Should Have | V2 |
| M46-003 | Status online/offline | Could Have | Phase 2 |

**DB (Prompt 3):** dmin_chats — sender_id, receiver_id, message, read_at, timestamps

### 5.47 M47 — MULTILANGUAGE

*(Detail di Section 12)*

### 5.48 M48 — PREMIUM FEATURE LOCK

**Status:** Baru | **Priority:** V2 | **Premium:** System

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M48-001 | Feature flag system (config-based) | Should Have | V2 |
| M48-002 | Per-role feature access | Should Have | V2 |
| M48-003 | Premium badge/label pada fitur terkunci | Should Have | V2 |
| M48-004 | CTA upgrade ke premium | Should Have | V2 |

### 5.49 M49 — TRIAL PREMIUM

*(Detail di Section 10)*

### 5.50 M50 — NOTIFICATION

**Status:** Baru | **Priority:** Phase 2 | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M50-001 | In-app notification | Could Have | Phase 2 |
| M50-002 | Email notification | Could Have | Phase 2 |
| M50-003 | Push notification | Could Have | Phase 2 |

### 5.51 M51 — AUDIT LOG

**Status:** Existing | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M51-001 | Aksi admin harus masuk audit log | Must Have | MVP |
| M51-002 | View & detail audit log | Must Have | MVP |
| M51-003 | Filter audit log | Should Have | V2 |

### 5.52 M52 — SECURITY & MODERATION

**Status:** Partial | **Priority:** MVP | **Premium:** Free

| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| M52-001 | Ban harus dengan alasan | Must Have | MVP |
| M52-002 | Delete data penting soft delete | Must Have | MVP |
| M52-003 | Transfer ownership wajib sebelum owner dihapus permanen | Must Have | MVP |
| M52-004 | Export data CSV/Excel | Should Have | V2 |
| M52-005 | CSRF, XSS protection | Must Have | MVP |
| M52-006 | Rate limiting, password hashing, session mgmt | Must Have | MVP |
---

## 6. NON-FUNCTIONAL REQUIREMENT

### 6.1 Performance
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Halaman beranda load time | < 2 detik |
| NFR-002 | Dashboard load time | < 3 detik |
| NFR-003 | Image upload max size | 5MB |
| NFR-004 | Pagination default | 15 item/halaman |

### 6.2 Security
| ID | Requirement |
|----|-------------|
| NFR-010 | HTTPS untuk production |
| NFR-011 | CSRF token di semua form |
| NFR-012 | XSS sanitization |
| NFR-013 | SQL injection prevention (Eloquent/Query Builder) |
| NFR-014 | Password minimum 8 karakter |
| NFR-015 | Rate limiting login (5 attempt/menit) |
| NFR-016 | Session timeout 24 jam |
| NFR-017 | .env tidak di-commit |
| NFR-018 | Credential production tidak di source code |
| NFR-019 | Audit log untuk semua aksi sensitif |

### 6.3 Usability
| ID | Requirement |
|----|-------------|
| NFR-030 | Responsive design (mobile, tablet, desktop) |
| NFR-031 | Accessibility minimum WCAG 2.1 AA |
| NFR-032 | Konsisten brand guidelines |
| NFR-033 | Empty state untuk semua list kosong |
| NFR-034 | Loading indicator untuk operasi async |
| NFR-035 | Success/error message untuk semua aksi user |

### 6.4 Compatibility
| ID | Requirement |
|----|-------------|
| NFR-040 | Browser: Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-041 | Mobile: iOS Safari, Android Chrome |
| NFR-042 | Screen: 320px - 2560px width |

### 6.5 Reliability
| ID | Requirement |
|----|-------------|
| NFR-050 | Database backup daily (production) |
| NFR-051 | Graceful error handling tanpa stack trace ke user |
| NFR-052 | Logging untuk debugging |

---

## 7. USER STORY

### 7.1 Guest
| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-G01 | M01 | Sebagai guest, saya ingin melihat beranda KomunaID sehingga saya mengerti tentang platform | Must Have | MVP | No |
| US-G02 | M16 | Sebagai guest, saya ingin melihat daftar komunitas sehingga saya bisa menemukan komunitas yang sesuai | Must Have | MVP | No |
| US-G03 | M24 | Sebagai guest, saya ingin melihat daftar event sehingga saya tahu event yang akan datang | Must Have | MVP | No |
| US-G04 | M02 | Sebagai guest, saya ingin membaca blog KomunaID sehingga saya dapat informasi terbaru | Must Have | MVP | No |
| US-G05 | M04 | Sebagai guest, saya ingin menghubungi KomunaID sehingga saya bisa bertanya | Must Have | MVP | No |
| US-G06 | M05 | Sebagai guest, saya ingin mengirim saran sehingga ide saya dipertimbangkan | Should Have | V2 | No |

### 7.2 Register/Auth
| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-A01 | M06 | Sebagai guest, saya ingin mendaftar menggunakan email/username sehingga saya punya akun | Must Have | MVP | No |
| US-A02 | M07 | Sebagai user, saya ingin login sehingga saya bisa akses dashboard | Must Have | MVP | No |
| US-A03 | M07 | Sebagai user, saya ingin logout sehingga sesi aman | Must Have | MVP | No |
| US-A04 | M08 | Sebagai member, saya ingin request role sehingga saya bisa mengelola komunitas/brand/perusahaan | Must Have | MVP | No |

### 7.3 Member
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
### 7.4 Community Owner
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

### 7.5 Brand Owner
| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-BO01 | M30 | Sebagai brand owner, saya ingin buat brand | Must Have | MVP | No |
| US-BO02 | M30 | Sebagai brand owner, saya ingin kelola brand | Must Have | MVP | No |
| US-BO03 | M33 | Sebagai brand owner, saya ingin cari komunitas untuk kolaborasi | Must Have | MVP | No |
| US-BO04 | M33 | Sebagai brand owner, saya ingin ajukan kolaborasi | Must Have | MVP | No |
| US-BO05 | M33 | Sebagai brand owner, saya ingin lihat riwayat kolaborasi | Must Have | MVP | No |

### 7.6 Company Owner
| ID | Modul | User Story | Priority | Phase | Premium |
|----|-------|------------|----------|-------|---------|
| US-CP01 | M31 | Sebagai company owner, saya ingin buat profil perusahaan | Must Have | MVP | No |
| US-CP02 | M32 | Sebagai company owner, saya ingin tambah brand di bawah perusahaan | Must Have | MVP | No |
| US-CP03 | M32 | Sebagai company owner, saya ingin kelola brand di bawah perusahaan | Must Have | MVP | No |
| US-CP04 | M33 | Sebagai company owner, saya ingin lihat kolaborasi brand | Should Have | V2 | No |

### 7.7 Superadmin
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

## 8. USE CASE

### UC-01: Register User
| Field | Value |
|-------|-------|
| **UC ID** | UC-01 |
| **Nama** | Register User |
| **Aktor** | Guest |
| **Deskripsi** | Guest mendaftar akun baru |
| **Pre-condition** | Guest membuka halaman register |
| **Trigger** | Guest submit form register |
| **Main Flow** | 1. Buka /register → 2. Isi form → 3. Validasi → 4. Buat akun (role member) → 5. Redirect onboarding → 6. CTA role request |
| **Alt Flow** | 4a. Email/username sudah ada → error. 5a. Password tidak cocok → error |
| **Post-condition** | Akun baru dibuat, user login otomatis |
| **Data** | users, profiles |
| **Priority** | Must Have |

### UC-02: Login User
| Field | Value |
|-------|-------|
| **UC ID** | UC-02 |
| **Nama** | Login User |
| **Aktor** | Member, CO, BO, CP |
| **Pre-condition** | User punya akun |
| **Trigger** | Submit form login |
| **Main Flow** | 1. Buka /login → 2. Isi email/username + password → 3. Validasi → 4. Buat session → 5. Redirect berdasarkan role |
| **Alt Flow** | 4a. CO → /community-own/dashboard. 4b. BO → /brand/dashboard. 4c. CP → /company/dashboard. 4d. Member → /member/dashboard |
| **Exception** | 3a. Kredensial salah → error. 3b. Akun banned → pesan banned |
| **Post-condition** | User login, session aktif |

### UC-03: Logout User
| Field | Value |
|-------|-------|
| **UC ID** | UC-03 |
| **Nama** | Logout User |
| **Aktor** | Semua authenticated user |
| **Main Flow** | 1. Klik logout → 2. Hapus session → 3. Redirect ke login |
| **Alt Flow** | 3a. SA → /admin/login. 3b. User biasa → /login |

### UC-04: Request Role
| Field | Value |
|-------|-------|
| **UC ID** | UC-04 |
| **Nama** | Request Role |
| **Aktor** | Member |
| **Pre-condition** | User login sebagai member |
| **Main Flow** | 1. Buka role request → 2. Pilih tipe → 3. Isi data awal → 4. Submit → 5. Status pending → 6. Notif ke SA |
| **Alt Flow** | 2a. Pilih "Nanti Saja" → redirect dashboard |
| **Post-condition** | Role request dibuat, menunggu approval |

### UC-05: Approve Role Request
| Field | Value |
|-------|-------|
| **UC ID** | UC-05 |
| **Nama** | Approve Role Request |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka approval center → 2. Lihat detail → 3. Klik Approve → 4. Update status → 5. Assign role (Spatie) → 6. Buat data awal |
| **Alt Flow** | 3a. Klik Reject → form alasan → update rejected |

### UC-06: Member Edit Profil
| Field | Value |
|-------|-------|
| **UC ID** | UC-06 |
| **Aktor** | Member |
| **Main Flow** | 1. Buka profil → 2. Edit field → 3. Simpan → 4. Validasi → 5. Update → 6. Konfirmasi |

### UC-07: Member Join Komunitas
| Field | Value |
|-------|-------|
| **UC ID** | UC-07 |
| **Aktor** | Member |
| **Main Flow** | 1. Buka detail komunitas → 2. Klik Join → 3. Cek visibility/approval → 4. Buat community_member → 5. Update jumlah member |
| **Alt Flow** | 4a. Public + no approval → langsung join. 4b. Approval needed → pending. 3a. Private → tidak bisa langsung join. 3b. Sudah join → tampilkan "Leave" |

### UC-08: Member Bookmark Komunitas
| Field | Value |
|-------|-------|
| **UC ID** | UC-08 |
| **Aktor** | Member |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka komunitas → 2. Klik bookmark → 3. Toggle bookmark → 4. Update icon |

### UC-09: Member Tambah Teman
| Field | Value |
|-------|-------|
| **UC ID** | UC-09 |
| **Aktor** | Member |
| **Priority** | Should Have |
| **Main Flow** | 1. Cari user → 2. Klik Tambah Teman → 3. Kirim permintaan → 4. Status pending → 5. User lain terima/tolak |

### UC-10: Member Upload Galeri
| Field | Value |
|-------|-------|
| **UC ID** | UC-10 |
| **Aktor** | Member |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka galeri → 2. Upload foto → 3. Isi caption, tanggal, komunitas/event, visibility → 4. Simpan → 5. Tampil di galeri |

### UC-11: Community Owner Membuat Komunitas
| Field | Value |
|-------|-------|
| **UC ID** | UC-11 |
| **Aktor** | Community Owner |
| **Main Flow** | 1. Buka form → 2. Isi: nama, slug(auto), deskripsi, kategori, regional, logo, banner, sosmed, kontak, visibility → 3. Simpan → 4. Status pending approval → 5. Notif ke SA |

### UC-12: Community Owner Mengelola Pengurus
| Field | Value |
|-------|-------|
| **UC ID** | UC-12 |
| **Aktor** | Community Owner |
| **Main Flow** | 1. Buka halaman pengurus → 2. Tambah pengurus → 3. Cari & pilih user → 4. Set posisi, periode, keterangan → 5. Simpan. 6. Nonaktifkan = ubah status. 7. Hapus = soft delete relasi |

### UC-13: Campaign Open Kepengurusan
| Field | Value |
|-------|-------|
| **UC ID** | UC-13 |
| **Aktor** | Community Owner |
| **Priority** | Should Have |
| **Main Flow** | 1. Buat campaign → 2. Isi detail → 3. Publish → 4. Tampil di komunitas → 5. Review applicant → 6. Approve/reject |
### UC-14: Community Owner Membuat Event
| Field | Value |
|-------|-------|
| **UC ID** | UC-14 |
| **Aktor** | Community Owner |
| **Main Flow** | 1. Buka form event → 2. Isi: nama, slug, deskripsi, komunitas, tanggal, lokasi, tipe, kuota, harga, poster, status, visibility → 3. Publish → 4. Event tampil di public |

### UC-15: Event Membuka Volunteer
| Field | Value |
|-------|-------|
| **UC ID** | UC-15 |
| **Aktor** | Community Owner |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka event → 2. Buka volunteer → 3. Isi posisi, jumlah, periode, syarat → 4. Publish → 5. Member daftar → 6. Review & approve/reject |

### UC-16: Event Membuka Donasi
| Field | Value |
|-------|-------|
| **UC ID** | UC-16 |
| **Aktor** | Community Owner |
| **Main Flow** | 1. Buka event → 2. Aktifkan donasi → 3. Set target, periode → 4. Member donasi + upload bukti → 5. Verify/reject |

### UC-17: Event Report Keuangan
| Field | Value |
|-------|-------|
| **UC ID** | UC-17 |
| **Aktor** | Community Owner |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka finance report → 2. Lihat pemasukan → 3. Lihat pengeluaran → 4. Ringkasan → 5. Export CSV |

### UC-18: Brand Owner Membuat Brand
| Field | Value |
|-------|-------|
| **UC ID** | UC-18 |
| **Aktor** | Brand Owner |
| **Main Flow** | 1. Buka form brand → 2. Isi: nama, deskripsi, logo, website, industri → 3. Simpan → 4. Status pending → 5. Notif ke SA |

### UC-19: Company Owner Membuat Perusahaan
| Field | Value |
|-------|-------|
| **UC ID** | UC-19 |
| **Aktor** | Company Owner |
| **Main Flow** | 1. Buka form perusahaan → 2. Isi: nama, legal name, industri, deskripsi, website, email, phone, logo, alamat → 3. Simpan → 4. Status pending |

### UC-20: Company Owner Menambahkan Brand
| Field | Value |
|-------|-------|
| **UC ID** | UC-20 |
| **Aktor** | Company Owner |
| **Main Flow** | 1. Buka halaman perusahaan → 2. Tambah brand → 3. Pilih brand yang dimiliki → 4. Hubungkan → 5. Tampil di daftar |

### UC-21: Brand Ajukan Kolaborasi
| Field | Value |
|-------|-------|
| **UC ID** | UC-21 |
| **Aktor** | Brand Owner |
| **Main Flow** | 1. Cari komunitas → 2. Ajukan kolaborasi → 3. Isi: judul, deskripsi, tujuan, target, benefit, budget, timeline, attachment → 4. Kirim → 5. Status sent → 6. CO terima notif |

### UC-22: Superadmin Lihat Daftar Member
| Field | Value |
|-------|-------|
| **UC ID** | UC-22 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka user management → 2. Lihat daftar (paginated) → 3. Search/filter → 4. Klik detail → 5. Export |

### UC-23: Superadmin Ban/Suspend User
| Field | Value |
|-------|-------|
| **UC ID** | UC-23 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka detail user → 2. Klik Ban/Suspend → 3. Isi alasan → 4. Konfirmasi → 5. Update status → 6. Audit log |

### UC-24: Superadmin Transfer Ownership Komunitas
| Field | Value |
|-------|-------|
| **UC ID** | UC-24 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka detail komunitas/user → 2. Transfer Ownership → 3. Pilih komunitas → 4. Pilih user baru → 5. Konfirmasi → 6. Update owner_id → 7. Audit log |

### UC-25: Superadmin Transfer Ownership Brand
| Field | Value |
|-------|-------|
| **UC ID** | UC-25 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka detail brand → 2. Transfer Ownership → 3. Pilih user baru → 4. Konfirmasi → 5. Update owner_id → 6. Audit log |

### UC-26: Superadmin Hapus Event
| Field | Value |
|-------|-------|
| **UC ID** | UC-26 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka event management → 2. Pilih event → 3. Hapus/Ban → 4. Isi alasan → 5. Konfirmasi → 6. Soft delete/ban → 7. Audit log |

### UC-27: Superadmin Kelola CMS
| Field | Value |
|-------|-------|
| **UC ID** | UC-27 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka CMS → 2. Pilih halaman (Beranda/Blog/Tentang Kami) → 3. Edit konten → 4. Simpan → 5. Update tampil di public |

### UC-28: Superadmin Kelola Contact Link
| Field | Value |
|-------|-------|
| **UC ID** | UC-28 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka contact management → 2. Edit Instagram → 3. Edit WhatsApp → 4. Edit Email → 5. Simpan |

### UC-29: Superadmin Lihat Metrics
| Field | Value |
|-------|-------|
| **UC ID** | UC-29 |
| **Aktor** | Superadmin |
| **Main Flow** | 1. Buka dashboard → 2. Hitung total → 3. Hitung data baru → 4. Role request pending → 5. Data kosong = angka 0 |

### UC-30: Superadmin Kelola Premium/Trial
| Field | Value |
|-------|-------|
| **UC ID** | UC-30 |
| **Aktor** | Superadmin |
| **Priority** | Should Have |
| **Main Flow** | 1. Buka premium management → 2. Toggle feature → 3. Activate trial → 4. Set durasi → 5. Deactivate jika perlu → 6. Setelah expired → terkunci |
---

## 9. PREMIUM FEATURE MATRIX

| Fitur | Free/Premium | Alasan | Phase |
|-------|-------------|--------|-------|
| Register/Login | Free | Core functionality | MVP |
| Edit profil dasar | Free | Core functionality | MVP |
| Join komunitas | Free | Core functionality | MVP |
| Bookmark komunitas | Free | Social feature | V2 |
| Follow/daftar event | Free | Core functionality | MVP |
| Buat komunitas dasar | Free | Core functionality | MVP |
| Buat event dasar | Free | Core functionality | MVP |
| CMS public basic | Free | Core functionality | MVP |
| Blog basic | Free | Core functionality | MVP |
| Contact link | Free | Core functionality | MVP |
| Saran/suggestion | Free | Core functionality | V2 |
| Role request | Free | Core functionality | MVP |
| Superadmin moderation | Free | Core functionality | MVP |
| Friend system | Free | Social feature | V2 |
| Member gallery | Free | Social feature | V2 |
| History | Free | Basic feature | V2 |
| Campaign kepengurusan | Free | Community feature | V2 |
| Event volunteer campaign | Free | Community feature | V2 |
| Event donation manual | Free | Community feature | MVP |
| Basic community filter | Free | Discovery | MVP |
| **Export data member komunitas** | **Premium** | Advanced feature | V2 |
| **Export data peserta event** | **Premium** | Advanced feature | V2 |
| **Advanced community analytics** | **Premium** | Analytics | V2 |
| **Advanced event analytics** | **Premium** | Analytics | V2 |
| **Custom community page** | **Premium** | Customization | Phase 2 |
| **Featured community** | **Premium** | Visibility | Phase 2 |
| **Featured event** | **Premium** | Visibility | Phase 2 |
| **Featured brand** | **Premium** | Visibility | Phase 2 |
| **Multi-admin komunitas permission detail** | **Premium** | Advanced mgmt | Phase 2 |
| **Finance report advanced** | **Premium** | Financial | V2 |
| **Donation report advanced** | **Premium** | Financial | V2 |
| **Brand collaboration pipeline** | **Premium** | Business | Phase 2 |
| **Company multi-brand management** | **Premium** | Business | Phase 2 |
| **Bulk messaging** | **Premium** | Communication | Phase 2 |
| **Member segmentation** | **Premium** | Marketing | Phase 2 |
| **Auto recommendation advanced** | **Premium** | AI/ML | Phase 2 |
| **Priority support** | **Premium** | Service | Phase 2 |
| **Verification badge** | **Premium** | Trust | Phase 2 |
| **Custom form builder** | **Premium** | Customization | Phase 2 |
| **QR attendance** | **Premium** | Event tech | Phase 2 |
| **Certificate generator** | **Premium** | Event tech | Phase 2 |
| **Multilanguage advanced** | **Premium** | Localization | Phase 2 |
| **Payment gateway** | **Premium** | Payment | Phase 2 |

**Summary:** Free/MVP: 17 | Free/V2: 8 | Premium: 18 | **Total: 43**

---

## 10. TRIAL PREMIUM CONCEPT

| ID | Requirement | Priority |
|----|-------------|----------|
| TP-001 | Trial duration: 14 atau 30 hari | Must Have |
| TP-002 | Trial bisa diberikan ke CO, BO, CP | Must Have |
| TP-003 | Trial status: active, expired, cancelled | Must Have |
| TP-004 | Tidak perlu payment gateway | Must Have |
| TP-005 | SA bisa activate/deactivate manual | Must Have |
| TP-006 | Setelah expired → fitur terkunci | Must Have |
| TP-007 | Notifikasi sebelum expired | Should Have |
| TP-008 | SA bisa perpanjang trial | Should Have |

**DB (Prompt 3):** 	rial_subscriptions — user_id, plan_type, starts_at, ends_at, status, activated_by

**MVP Approach:** Config-based feature flag:
`php
// config/features.php
return [
    'export_member_data' => env('FEATURE_EXPORT_MEMBER_DATA', true),
    'advanced_analytics' => env('FEATURE_ADVANCED_ANALYTICS', true),
];
`

---

## 11. LOGIN SEPARATION REQUIREMENT

### 11.1 URL Structure
| Aktor | Login URL | Dashboard URL | Logout Redirect |
|-------|-----------|---------------|-----------------|
| Superadmin | /admin/login | /superadmin/dashboard | /admin/login |
| Platform Admin | /admin/login | /superadmin/dashboard | /admin/login |
| Member | /login | /member/dashboard | /login |
| Community Owner | /login | /community-own/dashboard | /login |
| Brand Owner | /login | /brand/dashboard | /login |
| Company Owner | /login | /company/dashboard | /login |

### 11.2 Redirect Logic
| Role | Redirect |
|------|----------|
| superadmin | /superadmin/dashboard |
| platform_admin | /superadmin/dashboard |
| member | /member/dashboard |
| community_owner | /community-own/dashboard |
| brand_owner | /brand/dashboard |
| company_owner | /company/dashboard |
| Belum ada role khusus | /member/dashboard |

### 11.3 Middleware
| ID | Requirement |
|----|-------------|
| LS-020 | dmin middleware: hanya superadmin & platform_admin |
| LS-021 | 
ot.superadmin: cegah SA akses area user |
| LS-022 | ole:xxx: Spatie middleware untuk role-specific |

### 11.4 Status Existing
Login separation **sudah diterapkan**: /admin/login → SA LoginController, /login → Auth controller, role redirect di HandleInertiaRequests, EnsureSuperadmin & EnsureNotSuperadmin middleware aktif.
---

## 12. MULTILANGUAGE REQUIREMENT

### 12.1 Bahasa yang Didukung
| Kode | Bahasa | Status MVP |
|------|--------|------------|
| id | Indonesia | Default |
| en | Inggris | MVP |
| sun | Sunda | MVP |

### 12.2 Requirement
| ID | Requirement | Priority | Phase |
|----|-------------|----------|-------|
| ML-001 | Public website bisa ganti bahasa | Should Have | V2 |
| ML-002 | Dashboard minimal mendukung label utama | Should Have | V2 |
| ML-003 | Konten CMS bisa punya versi bahasa | Could Have | Phase 2 |
| ML-004 | Bahasa default Indonesia | Must Have | MVP |
| ML-005 | Fallback ke Indonesia jika translation belum ada | Must Have | MVP |
| ML-006 | Language switcher di navbar/footer | Should Have | V2 |
| ML-007 | Translation file menggunakan Laravel lang | Must Have | MVP |
| ML-008 | Database content translation | — | Phase 2 |

### 12.3 Implementation Plan
**MVP:** Laravel lang files (esources/lang/id/, esources/lang/en/, esources/lang/sun/)
**Phase 2:** DB-based CMS translation (cms_translations table)
**Premium:** Advanced localization (date/time, number formatting, RTL)

---

## 13. ENVIRONMENT REQUIREMENT

### 13.1 Local Development
`env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=komunaid
DB_USERNAME=root
DB_PASSWORD=
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
`
- Data dummy boleh tersedia, seeder demo boleh dijalankan

### 13.2 Development/Staging
`env
APP_ENV=development
APP_DEBUG=true
APP_URL=https://dev.komuna.id
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
`
- Database terpisah, tidak memakai credential production

### 13.3 Production
`env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://komuna.id
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
`
- Tidak menjalankan seeder demo
- Tidak menampilkan error detail
- .env tidak di-commit
- Backup database wajib
- Cache config/route/view
- SSL aktif

### 13.4 Production Safety
| ID | Requirement |
|----|-------------|
| ENV-001 | .env tidak di-commit ke Git |
| ENV-002 | .env.example di-commit (tanpa values) |
| ENV-003 | Credential production hanya di .env production server |
| ENV-004 | APP_DEBUG=false di production |
| ENV-005 | Error log ke file, bukan ke browser |
---

## 14. UI/UX REQUIREMENT

### 14.1 Brand Feel
- Modern, Clean, Social platform
- Community-driven, Friendly, Trustworthy
- Growth-oriented

### 14.2 Design Token
| Token | Value | Usage |
|-------|-------|-------|
| Primary Navy Blue | #0B2D89 | Logo, header, footer |
| Primary Blue | #126BFF | Buttons, links, primary actions |
| Cyan Blue | #25B9F2 | Accent, highlights, gradients |
| Light Blue BG | #EEF7FF | Background sections |
| White | #FFFFFF | Card backgrounds |
| Dark Text | #0F172A | Headings |
| Muted Text | #64748B | Descriptions |
| Border | #E2E8F0 | Dividers, inputs |
| Success | #16A34A | Approved, active |
| Warning | #F59E0B | Pending, caution |
| Danger | #DC2626 | Rejected, banned, delete |

### 14.3 Style Guidelines
1. Rounded cards (rounded-xl / rounded-2xl)
2. Soft shadow (shadow-sm / shadow-md)
3. Gradient blue hero (Navy to Cyan)
4. Clean dashboard sidebar
5. Badge status (colored pills)
6. Table modern (striped, hover)
7. Mobile responsive (mobile-first)
8. Empty state illustration/icon
9. Button primary jelas (Primary Blue)
10. CTA besar pada landing page

### 14.4 Component List
| Component | Description |
|-----------|-------------|
| Button (primary, secondary, danger, ghost) | Aksi utama |
| Card (community, event, brand, blog) | Content display |
| Badge (status: pending, approved, rejected) | Status indicator |
| Modal (confirm, form, detail) | Overlay actions |
| Toast / Flash message | Success/error notification |
| Dropdown | Navigation, actions |
| Sidebar (dashboard) | Navigation |
| Navbar (public + admin) | Top navigation |
| Tabs | Content switching |
| Table (data table) | List data |
| Pagination | List navigation |
| Search input | Search |
| Filter sidebar/drawer | Filter UI |
| Avatar (user, community, brand) | Identity |
| Image upload (with preview) | Media |
| Rich text editor | Blog/CMS content |
| Empty state | No data |
| Loading skeleton | Loading state |
| Language switcher | Multilanguage |
| Form input (text, email, password, textarea, select, checkbox) | Forms |

### 14.5 Navigation Structure

**Public Navigation:** Logo, Beranda, Komunitas, Event, Blog, Tentang Kami, Hubungi Kami, Masuk, Daftar

**Member Sidebar:** Dashboard, Profil, Role Request, Komunitas Saya, Event Saya, Bookmark(V2), Teman(V2), Galeri(V2), History(V2), Wallet, Donasi, Pengaturan, Logout

**Community Owner Sidebar:** Dashboard, Komunitas(List/Tambah/Pengurus/Volunteer/Region/Subgroup), Event(List/Tambah/Registrasi/Gallery/Chat), Kolaborasi, Wallet, Donasi, Logout

**Brand Owner Sidebar:** Dashboard, Brand(List/Tambah), Campaign(List/Tambah), Kolaborasi, Staff, Komunitas, Logout

**Superadmin Sidebar:** Dashboard, Approval Center, Users, Communities, Brands, Companies, Events, Master Data(Kategori/Interest/Regional/Jenis Event), CMS(Beranda/Blog/Tentang Kami/Hubungi Kami/Saran), Metrics, Login Activity, Audit Log, Wallets, Donations, Platform Fees, Premium/Trial, Chat Admin, Pengaturan, Logout
---

## 15. UI FLOW SUMMARY

### 15.1 Main UI Flow
1. Guest buka beranda
2. Guest melihat komunitas/event/blog
3. Guest register
4. User selesai register → onboarding
5. User pilih role request atau nanti saja
6. User masuk dashboard member
7. User explore komunitas
8. User join komunitas
9. User daftar event
10. Community owner request role
11. Superadmin approve
12. Community owner membuat komunitas
13. Community owner membuat event
14. Brand/company mengajukan kolaborasi

### 15.2 Role Request Flow
1. User klik "Request Role" di dashboard
2. Pilih tipe: Community Owner / Brand Owner / Company Owner
3. Isi data awal sesuai tipe
4. Submit → status pending
5. Superadmin cek approval center
6. Approve → role aktif, redirect ke dashboard role
7. Reject → alasan ditampilkan, user tetap member

### 15.3 Community Owner → Event Flow
1. CO buka dashboard
2. Klik "Buat Event"
3. Isi form event
4. Publish
5. Event tampil di public listing
6. Member bisa daftar
7. CO kelola registrasi

### 15.4 Brand → Collaboration Flow
1. BO cari komunitas di directory
2. BO klik "Ajukan Kolaborasi"
3. Isi proposal
4. Kirim → status sent
5. CO lihat di halaman kolaborasi
6. CO accept/reject
7. Jika accept → status completed setelah selesai

### 15.5 Superadmin → Transfer Ownership Flow
1. SA buka detail user yang akan dihapus
2. Klik "Transfer Ownership"
3. Pilih komunitas/brand yang dimiliki user
4. Pilih user baru sebagai owner
5. Konfirmasi
6. Ownership berpindah
7. Audit log tercatat
8. User bisa dihapus/diban

---

## 16. SDLC DOCUMENT GAP & DRAFT STRUCTURE

### 16.1 Document Gap Analysis
| Doc | Status | Gap |
|-----|--------|-----|
| BRD | Ada di docs/01-requirements/ | Perlu update scope V2 |
| FRD | Ada di docs/01-requirements/ | Perlu tambah modul baru |
| SRS | Ada di docs/01-requirements/ | Perlu update technology spec |
| User Story | Ada di docs/01-requirements/ | Perlu tambah story baru |
| Use Case | Ada di docs/01-requirements/ | Perlu tambah use case baru |
| ERD | Ada di docs/03-database/ | Perlu tambah tabel baru |
| Data Dictionary | Ada di docs/03-database/ | Perlu update |
| Test Plan | Ada di docs/04-testing/ | Perlu update |
| Test Case | Ada di docs/04-testing/ | Perlu tambah test case |
| Deployment | Ada di docs/05-deployment/ | Perlu update |

### 16.2 SDLC Draft Structure (untuk Prompt 16)
1. BRD — Business Requirement Document
2. FRD — Functional Requirement Document
3. SRS — Software Requirement Specification
4. User Story (lengkap semua modul)
5. Use Case (lengkap semua modul)
6. Use Case Diagram Description
7. Business Process Flow
8. UI Flow (detail per halaman)
9. ERD Draft Requirement
10. Data Dictionary Draft Requirement
11. RTM — Requirement Traceability Matrix
12. Test Scenario Draft
13. Test Case Draft
14. Deployment Plan Draft
15. Release Plan
16. Change Log
17. Risk Register
18. Security Requirement
19. Premium Feature Matrix
20. Environment Configuration Guide

---

## 17. REQUIREMENT TRACEABILITY MATRIX DRAFT

| Req ID | Modul | Requirement | US ID | UC ID | Priority | Phase | Test ID |
|--------|-------|-------------|-------|-------|----------|-------|---------|
| M01-001 | Public | Hero section tagline | US-G01 | — | Must Have | MVP | TS-001 |
| M01-002 | Public | CTA Gabung Sekarang | US-G01 | — | Must Have | MVP | TS-002 |
| M01-020 | Public | Rekomendasi komunitas | US-G01 | — | Must Have | MVP | TS-003 |
| M01-030 | Public | Event terbaru | US-G01 | — | Must Have | MVP | TS-004 |
| M01-040 | Public | Blog terbaru | US-G04 | — | Must Have | MVP | TS-005 |
| M01-060 | Public | Link IG/WA/Email | US-G05 | — | Must Have | MVP | TS-006 |
| M02-001 | Blog | Daftar artikel | US-G04 | — | Must Have | MVP | TS-007 |
| M02-010 | Blog | CRUD artikel (SA) | US-SA08 | UC-27 | Must Have | MVP | TS-008 |
| M06-001 | Register | Register email/username | US-A01 | UC-01 | Must Have | MVP | TS-009 |
| M07-000 | Login | Login separation | US-A02 | UC-02 | Must Have | MVP | TS-010 |
| M08-001 | Role Request | Request role | US-A04 | UC-04 | Must Have | MVP | TS-011 |
| M08-010 | Role Request | Status request | US-A04 | UC-04 | Must Have | MVP | TS-012 |
| M10-001 | Profile | Edit profil | US-M01 | UC-06 | Must Have | MVP | TS-013 |
| M11-001 | Interest | Pilih interest | US-M02 | — | Must Have | MVP | TS-014 |
| M12-001 | Friend | Tambah teman | US-M05 | UC-09 | Should Have | V2 | TS-015 |
| M13-001 | Bookmark | Bookmark komunitas | US-M04 | UC-08 | Should Have | V2 | TS-016 |
| M14-001 | Gallery | Upload galeri | US-M09 | UC-10 | Should Have | V2 | TS-017 |
| M16-001 | Directory | Daftar komunitas | US-G02 | — | Must Have | MVP | TS-018 |
| M16-004 | Directory | Join/Leave | US-M03 | UC-07 | Must Have | MVP | TS-019 |
| M17-001 | Filter | Filter komunitas | US-G02 | — | Must Have | MVP | TS-020 |
| M20-001 | Community | Buat komunitas | US-CO01 | UC-11 | Must Have | MVP | TS-021 |
| M21-001 | Pengurus | Kelola pengurus | US-CO03 | UC-12 | Must Have | MVP | TS-022 |
| M23-001 | Campaign | Campaign kepengurusan | US-CO05 | UC-13 | Should Have | V2 | TS-023 |
| M24-001 | Event | Buat event | US-CO06 | UC-14 | Must Have | MVP | TS-024 |
| M25-001 | Event Reg | Daftar event | US-M07 | UC-14 | Must Have | MVP | TS-025 |
| M26-001 | Volunteer | Event volunteer | US-CO07 | UC-15 | Should Have | V2 | TS-026 |
| M27-001 | Donation | Open donasi | US-CO08 | UC-16 | Must Have | MVP | TS-027 |
| M28-001 | Finance | Report keuangan | US-CO09 | UC-17 | Should Have | V2 | TS-028 |
| M30-001 | Brand | Buat brand | US-BO01 | UC-18 | Must Have | MVP | TS-029 |
| M31-001 | Company | Buat perusahaan | US-CP01 | UC-19 | Must Have | MVP | TS-030 |
| M32-001 | Company | Tambah brand | US-CP02 | UC-20 | Must Have | MVP | TS-031 |
| M33-001 | Collab | Ajukan kolaborasi | US-BO04 | UC-21 | Must Have | MVP | TS-032 |
| M34-001 | SA Dashboard | Metrics | US-SA10 | UC-29 | Must Have | MVP | TS-033 |
| M35-001 | SA User | Kelola member | US-SA01 | UC-22 | Must Have | MVP | TS-034 |
| M35-004 | SA User | Ban/suspend | US-SA01 | UC-23 | Must Have | MVP | TS-035 |
| M36-003 | SA Community | Transfer ownership | US-SA03 | UC-24 | Must Have | MVP | TS-036 |
| M37-003 | SA Brand | Transfer ownership | US-SA05 | UC-25 | Must Have | MVP | TS-037 |
| M39-001 | SA Event | Kelola event | US-SA07 | UC-26 | Must Have | MVP | TS-038 |
| M40-001 | SA Master | Kategori CRUD | US-SA09 | — | Must Have | MVP | TS-039 |
| M41-001 | SA CMS | CMS beranda | US-SA08 | UC-27 | Must Have | MVP | TS-040 |
| M42-001 | SA Contact | Kelola link kontak | US-SA08 | UC-28 | Must Have | MVP | TS-041 |
| M44-001 | SA Metrics | Dashboard metrics | US-SA10 | UC-29 | Must Have | MVP | TS-042 |
| M45-001 | SA Login | Login activity | US-SA11 | — | Should Have | V2 | TS-043 |
| M46-001 | Admin Chat | Chat admin | US-SA12 | — | Should Have | V2 | TS-044 |
| M48-001 | Premium | Feature flag | US-SA13 | UC-30 | Should Have | V2 | TS-045 |
| M49-000 | Trial | Trial premium | US-SA13 | UC-30 | Should Have | V2 | TS-046 |
| M51-001 | Audit | Audit log | US-SA14 | — | Must Have | MVP | TS-047 |
| M52-001 | Security | Ban dengan alasan | — | UC-23 | Must Have | MVP | TS-048 |
| M52-002 | Security | Soft delete | — | UC-26 | Must Have | MVP | TS-049 |
| M52-003 | Security | Ownership transfer | — | UC-24 | Must Have | MVP | TS-050 |
---

## 18. DEVELOPMENT READINESS CHECKLIST

| No | Item | Status |
|----|------|--------|
| 1 | Requirement document selesai | Ya |
| 2 | User story terdefinisi | Ya (46 user stories) |
| 3 | Use case terdefinisi | Ya (30 use cases) |
| 4 | Module list lengkap | Ya (52 modul) |
| 5 | Premium feature matrix | Ya |
| 6 | Trial premium concept | Ya |
| 7 | Login separation | Ya |
| 8 | UI/UX requirement | Ya |
| 9 | Design token | Ya |
| 10 | Navigation structure | Ya |
| 11 | Component list | Ya |
| 12 | Multilanguage requirement | Ya |
| 13 | Environment requirement | Ya |
| 14 | RTM draft | Ya (50 entries) |
| 15 | SDLC gap analysis | Ya |
| 16 | Non-functional requirement | Ya |
| 17 | Database table baru teridentifikasi | Ya |
| 18 | Feature prioritization | Ya |
| 19 | Existing feature mapping | Ya |
| 20 | Gap analysis complete | Ya |

**Siap lanjut ke Prompt 3: Database & Migration Enhancement**
---

## 19. RISIKO DAN CATATAN PENTING

### 19.1 Risiko
| No | Risiko | Dampak | Mitigasi |
|----|--------|--------|----------|
| 1 | Scope creep dari V2 ke Phase 2 | Delay MVP | Strict MVP boundary |
| 2 | Tabel baru terlalu banyak | Migration complexity | Break migration ke batch |
| 3 | Multilanguage memakan waktu | Delay | MVP fokus lang files |
| 4 | Premium feature lock belum teruji | Error | Config flag sederhana dulu |
| 5 | Transfer ownership edge case | Data integrity | Test thoroughly |
| 6 | Performance dengan data besar | Slow | Index optimization |
| 7 | Friend system complex | Feature creep | Sederhana dulu |

### 19.2 Catatan Penting
1. MVP boundary ketat - tidak tambah fitur di luar daftar
2. Existing feature jangan di-break
3. Soft delete untuk semua data penting
4. Audit log wajib untuk aksi SA
5. Empty state handling untuk metrics
6. No credential in source code
7. Seeder demo hanya untuk local dev

### 19.3 Database Tables Baru (untuk Prompt 3)
| No | Table | Modul | Phase |
|----|-------|-------|-------|
| 1 | companies | M31 | MVP |
| 2 | blog_posts | M02 | MVP |
| 3 | suggestions | M05 | V2 |
| 4 | friendships | M12 | V2 |
| 5 | bookmarks | M13 | V2 |
| 6 | member_galleries | M14 | V2 |
| 7 | community_open_positions | M23 | V2 |
| 8 | community_position_applications | M23 | V2 |
| 9 | event_volunteer_positions | M26 | V2 |
| 10 | event_volunteer_applications | M26 | V2 |
| 11 | event_financial_transactions | M28 | V2 |
| 12 | admin_chats | M46 | V2 |
| 13 | trial_subscriptions | M49 | V2 |
| 14 | premium_settings | M48 | V2 |
| 15 | cms_translations | M47 | Phase 2 |
| 16 | notifications | M50 | Phase 2 |

### 19.4 ALTER Existing Tables
| No | Table | Column | Type | Phase |
|----|-------|--------|------|-------|
| 1 | profiles | privacy | enum(public,friends,private) | V2 |
| 2 | profiles | phone | nullable string | MVP |
| 3 | profiles | social_link | nullable json | V2 |
| 4 | brands | company_id | nullable FK | MVP |
| 5 | communities | approval_required | boolean | MVP |
| 6 | events | requires_approval | boolean | V2 |
---

## 20. REKOMENDASI UNTUK PROMPT 3

### 20.1 Prioritas Migration

**Batch 1 (MVP):**
1. Create companies table
2. Alter brands - add company_id
3. Alter profiles - add phone, social_link
4. Create blog_posts table
5. Alter communities - add approval_required
6. Create premium_settings table

**Batch 2 (V2):**
7. Create friendships table
8. Create bookmarks table
9. Create member_galleries table
10. Create suggestions table
11. Create community_open_positions + applications tables
12. Create event_volunteer_positions + applications tables
13. Create event_financial_transactions table
14. Create admin_chats table
15. Create trial_subscriptions table
16. Alter profiles - add privacy

**Batch 3 (Phase 2):**
17. Create notifications table
18. Create cms_translations table

### 20.2 Model Updates
- Create Company model + relationships
- Create BlogPost model
- Create Suggestion model
- Create Friendship model
- Create Bookmark model
- Create MemberGallery model
- Create CommunityOpenPosition model
- Create EventVolunteerPosition model
- Create EventFinancialTransaction model
- Create AdminChat model
- Create TrialSubscription model
- Update Brand model - add company relationship
- Update Profile model - add phone, social_link, privacy

### 20.3 Seeder Updates
- CompanySeeder
- BlogPostSeeder
- Update RoleSeeder if needed

### 20.4 Index Optimization
- FK columns index
- Composite index for searches
- Soft delete query index
---

## 21. REQUIREMENT PRIORITIZATION TABLE

| Modul | Fitur | Priority | Phase |
|-------|-------|----------|-------|
| Auth | Register dasar | Must Have | MVP |
| Auth | Login separation | Must Have | MVP |
| Public | Homepage enhancement | Must Have | MVP |
| Public | Community directory | Must Have | MVP |
| Public | Event listing | Must Have | MVP |
| CMS | Blog system | Must Have | MVP |
| CMS | Tentang Kami | Must Have | MVP |
| CMS | Contact link | Must Have | MVP |
| Member | Profile edit | Must Have | MVP |
| Member | Interest | Must Have | MVP |
| Community | CRUD | Must Have | MVP |
| Community | Member mgmt | Must Have | MVP |
| Community | Pengurus mgmt | Must Have | MVP |
| Event | CRUD | Must Have | MVP |
| Event | Registration | Must Have | MVP |
| Event | Donation | Must Have | MVP |
| Brand | CRUD | Must Have | MVP |
| Company | Company mgmt | Must Have | MVP |
| Superadmin | Dashboard metrics | Must Have | MVP |
| Superadmin | User mgmt | Must Have | MVP |
| Superadmin | Community mgmt | Must Have | MVP |
| Superadmin | Brand mgmt | Must Have | MVP |
| Superadmin | Event mgmt | Must Have | MVP |
| Superadmin | Master data | Must Have | MVP |
| Superadmin | CMS mgmt | Must Have | MVP |
| Superadmin | Audit log | Must Have | MVP |
| Security | Transfer ownership | Must Have | MVP |
| Security | Ban with reason | Must Have | MVP |
| Security | Soft delete | Must Have | MVP |
| Member | Friend system | Should Have | V2 |
| Member | Bookmark | Should Have | V2 |
| Member | Gallery | Should Have | V2 |
| Member | History | Should Have | V2 |
| Community | Campaign kepengurusan | Should Have | V2 |
| Community | Advanced filter | Should Have | V2 |
| Event | Volunteer campaign | Should Have | V2 |
| Event | Finance report | Should Have | V2 |
| Brand | Transfer ownership | Should Have | V2 |
| Superadmin | Login activity | Should Have | V2 |
| Superadmin | Admin chat | Should Have | V2 |
| Superadmin | Premium/trial | Should Have | V2 |
| Platform | Multilanguage | Should Have | V2 |
| Platform | Notification | Could Have | Phase 2 |
| Platform | Payment gateway | Could Have | Phase 2 |
| Event | QR attendance | Could Have | Phase 2 |
| Event | Certificate | Could Have | Phase 2 |
| Platform | Mobile app | Could Have | Phase 2 |

---

## 22. STATUS PROMPT 2

| Item | Status |
|------|--------|
| Requirement KomunaID V2 selesai disusun | **Ya** |
| User Story selesai | **Ya** (46 user stories) |
| Use Case selesai | **Ya** (30 use cases) |
| Premium matrix selesai | **Ya** (43 fitur) |
| UI/UX requirement selesai | **Ya** |
| Environment requirement selesai | **Ya** |
| RTM draft selesai | **Ya** (50 entries) |
| NFR selesai | **Ya** |
| SDLC gap analysis selesai | **Ya** |
| Multilanguage requirement selesai | **Ya** |
| **Siap lanjut Prompt 3 - Database & Migration Enhancement** | **Ya** |

### Prompt 3 Focus Areas:
1. Buat migration untuk 16 tabel baru
2. Buat ALTER migration untuk 6 kolom tambahan
3. Update/buat Model dengan relationships
4. Update seeder
5. Update ERD
6. Update data dictionary
7. Optimasi index
8. Test backward compatibility
