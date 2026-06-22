# KomunaID — Wireframe (Low Fidelity)

Semua wireframe dibuat dalam format teks ASCII untuk kemudahan implementasi menggunakan Blade + Tailwind CSS.

---

## 1. Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Communities    Brands    Events        [Login] [Daftar]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              ╔═══════════════════════════════════════╗          │
│              ║    Connect. Collaborate. Community.   ║          │
│              ║                                       ║          │
│              ║   Temukan komunitas yang sesuai       ║          │
│              ║   minatmu. Bergabung, berkolaborasi,  ║          │
│              ║   dan bangun komunitas bersama.        ║          │
│              ║                                       ║          │
│              ║   [  Mulai Sekarang  ]  [  Jelajahi  ]║          │
│              ╚═══════════════════════════════════════╝          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                       Mengapa KomunaID?                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  [Icon]      │  │  [Icon]      │  │  [Icon]      │          │
│  │  Temukan     │  │  Kelola      │  │  Kolaborasi  │          │
│  │  Komunitas   │  │  Komunitas   │  │  dengan      │          │
│  │              │  │              │  │  Brand       │          │
│  │  Browse &    │  │  CRUD, event,│  │  Partnership │          │
│  │  search      │  │  member mgmt │  │  & campaign  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    Komunitas Populer                             │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │  [Banner]  │  │  [Banner]  │  │  [Banner]  │  │ [Banner]  │ │
│  │            │  │            │  │            │  │           │ │
│  │  Nama      │  │  Nama      │  │  Nama      │  │  Nama     │ │
│  │  Komunitas │  │  Komunitas │  │  Komunitas │  │ Komunitas │ │
│  │  📍 Lokasi │  │  📍 Lokasi │  │  📍 Lokasi │  │ 📍 Lokasi │ │
│  │  👥 120    │  │  👥 85     │  │  👥 230    │  │ 👥 56     │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│                                                                 │
│                    [ Lihat Semua Komunitas → ]                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                        Brand Partners                           │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │  [Logo]    │  │  [Logo]    │  │  [Logo]    │  │  [Logo]   │ │
│  │  Brand A   │  │  Brand B   │  │  Brand C   │  │  Brand D  │ │
│  │  Industry  │  │  Industry  │  │  Industry  │  │  Industry │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [LOGO KomunaID]                                               │
│  Tentang    Blog     Bantuan     Kontak                         │
│  © 2026 KomunaID. All rights reserved.                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Community Directory

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Communities    Brands    Events     [Dashboard] [Avatar]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Komunitas                                                    │
│  ─────────                                                     │
│                                                                 │
│  ┌──────────────────────────────────────┐  Filter:              │
│  │ 🔍 Search komunitas...              │  ┌──────────────────┐ │
│  └──────────────────────────────────────┘  │ Semua Kategori ▼ │ │
│                                            │ Semua Lokasi   ▼ │ │
│  Menampilkan 48 komunitas                  └──────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Banner Image]                                          │  │
│  │                                                          │  │
│  │  Komunitas Teknologi Indonesia              [Badge: Aktif]│  │
│  │  📍 Jakarta  👥 230 anggota  📅 12 event                  │  │
│  │  Komunitas untuk para pegiat teknologi di Indonesia...   │  │
│  │                                         [ Lihat Detail → ]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Banner Image]                                          │  │
│  │                                                          │  │
│  │  Indonesia Design Community                 [Badge: Aktif]│  │
│  │  📍 Bandung  👥 180 anggota  📅 8 event                   │  │
│  │  Komunitas desainer grafis dan UI/UX...                  │  │
│  │                                         [ Lihat Detail → ]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Banner Image]                                          │  │
│  │                                                          │  │
│  │  Startup Founder Indonesia                  [Badge: Aktif]│  │
│  │  📍 Surabaya  👥 95 anggota  📅 5 event                   │  │
│  │  Komunitas founder startup pemula...                     │  │
│  │                                         [ Lihat Detail → ]│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│                    [< Prev]  1  2  3  4  5  [Next >]            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Community Detail

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Communities    Brands    Events     [Dashboard] [Avatar]│
├─────────────────────────────────────────────────────────────────┤
│  Breadcrumb: Home > Communities > Komunitas Teknologi Indonesia │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   [Banner Image]                         │  │
│  │  ┌──────┐                                                │  │
│  │  │[Logo]│  Komunitas Teknologi Indonesia                │  │
│  │  └──────┘  📍 Jakarta  🌐 komunitastekno.id             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────────────────────┐    │
│  │                 │  │  Tentang Komunitas               │    │
│  │  [ Join Komunitas ] │  │                                  │    │
│  │  (atau: Sudah Bergabung) │  │  Komunitas untuk para pegiat │    │
│  │                 │  │  teknologi di Indonesia.          │    │
│  │  👥 230 Anggota │  │  Kami rutin mengadakan meetup,   │    │
│  │  📅 12 Event    │  │  workshop, dan sharing session.   │    │
│  │  📂 Teknologi   │  │                                  │    │
│  │  📍 Jakarta     │  │  [Website]  [Kontak]             │    │
│  │                 │  └──────────────────────────────────┘    │
│  └─────────────────┘                                          │
│                                                                 │
│  ┌── Tab Navigation ──────────────────────────────────────┐   │
│  │  [Anggota]    [Event]    [Tentang]                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  -- Tab: Anggota --                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ [Avatar]  │  │ [Avatar]  │  │ [Avatar]  │  │ [Avatar]  │      │
│  │ Andi      │  │ Budi      │  │ Citra     │  │ Deddi     │      │
│  │ Admin     │  │ Member    │  │ Member    │  │ Member    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  -- Tab: Event --                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Banner]  Meetup Teknologi #24                         │  │
│  │  📅 15 Jul 2026  🕐 14:00 WIB  📍 Jakarta Convention    │  │
│  │  👥 45 hadir                                    [ Detail ]│  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Banner]  Workshop React Advanced                      │  │
│  │  📅 22 Jul 2026  🕐 09:00 WIB  📍 Online               │  │
│  │  👥 30 hadir                                    [ Detail ]│  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Login / Register

### Login Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              ┌───────────────────────────────┐                  │
│              │        [LOGO KomunaID]        │                  │
│              │                               │                  │
│              │  Email                       │                  │
│              │  ┌─────────────────────────┐ │                  │
│              │  │ email@domain.com        │ │                  │
│              │  └─────────────────────────┘ │                  │
│              │                               │                  │
│              │  Password                    │                  │
│              │  ┌─────────────────────────┐ │                  │
│              │  │ ••••••••               │ │                  │
│              │  └─────────────────────────┘ │                  │
│              │                               │                  │
│              │  ☐ Ingat saya                 │                  │
│              │                               │                  │
│              │  [    Masuk    ]              │                  │
│              │                               │                  │
│              │  Lupa password?               │                  │
│              │                               │                  │
│              │  ─── atau ───                │                  │
│              │                               │                  │
│              │  Belum punya akun? Daftar     │                  │
│              └───────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Register Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              ┌───────────────────────────────┐                  │
│              │        [LOGO KomunaID]        │                  │
│              │                               │                  │
│              │  Nama Lengkap                │                  │
│              │  ┌─────────────────────────┐ │                  │
│              │  │ John Doe                │ │                  │
│              │  └─────────────────────────┘ │                  │
│              │                               │                  │
│              │  Email                       │                  │
│              │  ┌─────────────────────────┐ │                  │
│              │  │ john@email.com          │ │                  │
│              │  └─────────────────────────┘ │                  │
│              │                               │                  │
│              │  No. Telepon (opsional)      │                  │
│              │  ┌─────────────────────────┐ │                  │
│              │  │ 0812xxxxxxx             │ │                  │
│              │  └─────────────────────────┘ │                  │
│              │                               │                  │
│              │  Password                    │                  │
│              │  ┌─────────────────────────┐ │                  │
│              │  │ ••••••••               │ │                  │
│              │  └─────────────────────────┘ │                  │
│              │                               │                  │
│              │  Konfirmasi Password         │                  │
│              │  ┌─────────────────────────┐ │                  │
│              │  │ ••••••••               │ │                  │
│              │  └─────────────────────────┘ │                  │
│              │                               │                  │
│              │  [    Daftar    ]             │                  │
│              │                               │                  │
│              │  Sudah punya akun? Masuk      │                  │
│              └───────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Member Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Dashboard    Komunitas    Event    [Profil] [Avatar] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Selamat Datang, John! 👋                                       │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  👥         │  │  📅         │  │  ⭐         │                │
│  │  3          │  │  2          │  │  Member     │                │
│  │  Komunitas  │  │  Event      │  │  Role       │                │
│  │  Diikuti    │  │  Mendatang  │  │  Aktif      │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                 │
│  ┌── Komunitas Saya ─────────────────────────────────────┐    │
│  │                                                        │    │
│  │  ┌──────┐  Komunitas Teknologi Indonesia              │    │
│  │  │[Logo]│  👥 230 anggota  📍 Jakarta                  │    │
│  │  └──────┘  [Lihat Komunitas]                           │    │
│  │                                                        │    │
│  │  ┌──────┐  Indonesia Design Community                 │    │
│  │  │[Logo]│  👥 180 anggota  📍 Bandung                  │    │
│  │  └──────┘  [Lihat Komunitas]                           │    │
│  │                                                        │    │
│  │  ┌──────┐  Startup Founder Indonesia                  │    │
│  │  │[Logo]│  👥 95 anggota  📍 Surabaya                  │    │
│  │  └──────┘  [Lihat Komunitas]                           │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── Event Mendatang ────────────────────────────────────┐    │
│  │                                                        │    │
│  │  📅 Meetup Teknologi #24                              │    │
│  │  📆 15 Jul 2026  🕐 14:00 WIB                         │    │
│  │  📍 Jakarta Convention Center                          │    │
│  │  Komunitas Teknologi Indonesia                         │    │
│  │  [Lihat Detail]                                        │    │
│  │                                                        │    │
│  │  📅 Workshop React Advanced                           │    │
│  │  📆 22 Jul 2026  🕐 09:00 WIB                         │    │
│  │  📍 Online (Zoom)                                      │    │
│  │  Komunitas Teknologi Indonesia                         │    │
│  │  [Lihat Detail]                                        │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── Upgrade Role ───────────────────────────────────────┐    │
│  │  Ingin membuat komunitas sendiri atau brand?          │    │
│  │  Ajukan role Community Owner atau Brand Owner.        │    │
│  │  [Ajukan Sekarang →]                                  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Community Owner Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Dashboard    Komunitas    Event    Member    [Avatar] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Community Dashboard                                           │
│  ─────────────────                                             │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │  🏘️         │  │  👥         │  │  📅         │  │  📋         │ │
│  │  2          │  │  410        │  │  12         │  │  5          │ │
│  │  Komunitas  │  │  Total      │  │  Event      │  │  Pending    │ │
│  │  Dikelola   │  │  Members    │  │  Dibuat     │  │  Join Req   │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│                                                                 │
│  ┌── Komunitas Saya ─────────────────────────────────────┐    │
│  │  [+ Buat Komunitas Baru]                               │    │
│  │                                                        │    │
│  │  ┌──────┐  Komunitas Teknologi Indonesia              │    │
│  │  │[Logo]│  👥 230  📅 8 event  ✅ Aktif                │    │
│  │  └──────┘  [Kelola]  [Lihat Publik]                    │    │
│  │                                                        │    │
│  │  ┌──────┐  Tech Meetup Jakarta                        │    │
│  │  │[Logo]│  👥 180  📅 4 event  ✅ Aktif                │    │
│  │  └──────┘  [Kelola]  [Lihat Publik]                    │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── Pending Member Requests ────────────────────────────┐    │
│  │                                                        │    │
│  │  [Avatar] Andi Saputra - Join Komunitas Teknologi     │    │
│  │           📅 20 Jun 2026          [Approve] [Reject]   │    │
│  │                                                        │    │
│  │  [Avatar] Rina Wati - Join Tech Meetup Jakarta        │    │
│  │           📅 21 Jun 2026          [Approve] [Reject]   │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── Event Terbaru ──────────────────────────────────────┐    │
│  │                                                        │    │
│  │  📅 Meetup Teknologi #24  │  📆 15 Jul  │  👥 45 RSVP  │    │
│  │  [Edit] [Lihat]                                           │    │
│  │                                                        │    │
│  │  📅 Workshop React       │  📆 22 Jul  │  👥 30 RSVP  │    │
│  │  [Edit] [Lihat]                                           │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Brand Owner Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Dashboard    Brands    [Avatar]                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Brand Dashboard                                               │
│  ──────────────                                                │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  🏢         │  │  🤝         │  │  👁️         │                │
│  │  1          │  │  3          │  │  500        │                │
│  │  Brand      │  │  Kolaborasi │  │  Total      │                │
│  │  Dikelola   │  │  Aktif      │  │  Views      │                │
│  └────────────┘  └────────────┘  └────────────┘                │
│                                                                 │
│  ┌── Brand Saya ─────────────────────────────────────────┐    │
│  │  [+ Buat Brand Baru]                                   │    │
│  │                                                        │    │
│  │  ┌──────┐  TechCorp Indonesia                        │    │
│  │  │[Logo]│  📂 Teknologi  🌐 techcorp.id              │    │
│  │  └──────┘  ✅ Aktif                                    │    │
│  │           [Edit] [Lihat Publik]                         │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── Kolaborasi ─────────────────────────────────────────┐    │
│  │                                                        │    │
│  │  ⏳ Pending: Kolaborasi dengan Komunitas Teknologi    │    │
│  │     Status: Menunggu persetujuan komunitas             │    │
│  │                                                        │    │
│  │  ✅ Diterima: Partnership dengan Design Community     │    │
│  │     Status: Berlangsung                                │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Superadmin Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO Admin]  Dashboard  Users  Approvals  Communities  Brands │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Superadmin Dashboard                                          │
│  ──────────────────                                            │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │  👥         │  │  🏘️         │  │  🏢         │  │  📅         │ │
│  │  1,234      │  │  48         │  │  15         │  │  120       │ │
│  │  Total      │  │  Komunitas  │  │  Brands     │  │  Events    │ │
│  │  Users      │  │  Aktif      │  │  Aktif      │  │  Total     │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│                                                                 │
│  ┌── Approval Queue ─────────────────────────────────────┐    │
│  │                                                        │    │
│  │  Role Requests (3) │ Communities (2) │ Brands (1)       │    │
│  │                                                        │    │
│  │  ┌─────────────────────────────────────────────────┐  │    │
│  │  │ 📋 Role Requests                                │  │    │
│  │  │                                                  │  │    │
│  │  │  [Avatar] Ahmad Fauzi                            │  │    │
│  │  │  Requested: Community Owner                      │  │    │
│  │  │  Motivasi: "Ingin membuat komunitas developer.." │  │    │
│  │  │  📅 20 Jun 2026                                   │  │    │
│  │  │  [Approve] [Reject] [Lihat Detail]               │  │    │
│  │  │                                                  │  │    │
│  │  │  [Avatar] Sari Dewi                              │  │    │
│  │  │  Requested: Brand Owner                          │  │    │
│  │  │  Motivasi: "Brand fashion saya ingin kolaborasi.."│  │    │
│  │  │  📅 21 Jun 2026                                   │  │    │
│  │  │  [Approve] [Reject] [Lihat Detail]               │  │    │
│  │  └─────────────────────────────────────────────────┘  │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── Recent Activity ────────────────────────────────────┐    │
│  │                                                        │    │
│  │  📅 22 Jun 2026 - User baru: John Doe (Member)        │    │
│  │  📅 22 Jun 2026 - Komunitas baru: Tech Meetup Bandung │    │
│  │  📅 21 Jun 2026 - Role approved: Ahmad Fauzi          │    │
│  │  📅 20 Jun 2026 - Event baru: Workshop React          │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌── User Management ────────────────────────────────────┐    │
│  │  🔍 Search user...   Filter: [Semua Role ▼] [Status ▼]│    │
│  │                                                        │    │
│  │  Name          │ Email            │ Role    │ Status    │    │
│  │  ──────────────┼─────────────────┼─────────┼─────────  │    │
│  │  John Doe      │ john@mail.com   │ Member  │ ✅ Active │    │
│  │  Ahmad Fauzi   │ ahmad@mail.com  │ CO      │ ✅ Active │    │
│  │  Sari Dewi     │ sari@mail.com   │ BO      │ ⏳ Pending│    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Community Form (Create / Edit)

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Dashboard    Komunitas        [Avatar]               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Breadcrumb: Dashboard > Komunitas > Buat Baru                 │
│                                                                 │
│  Buat Komunitas Baru                                           │
│  ─────────────────                                             │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  Nama Komunitas *                                     │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │                                                │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Deskripsi                                            │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │                                                │   │   │
│  │  │                                                │   │   │
│  │  │                                                │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Kategori                                             │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ Pilih Kategori...                           ▼ │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │  (Teknologi, Desain, Bisnis, Olahraga, Sosial, Lainnya)│  │
│  │                                                        │   │
│  │  Lokasi                                               │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ Jakarta, Indonesia                             │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Website                                              │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ https://                                        │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Banner Komunitas                                     │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  [Klik atau drag & drop untuk upload banner]  │   │   │
│  │  │  Format: JPG, PNG. Maks: 4MB                   │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Logo Komunitas                                       │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  [Klik atau drag & drop untuk upload logo]    │   │   │
│  │  │  Format: JPG, PNG. Maks: 2MB                   │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  ☐ Komunitas Publik (terlihat oleh semua orang)       │   │
│  │                                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │   Batal      │  │   Simpan     │                   │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Event Form (Create / Edit)

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Dashboard    Komunitas > [Nama] > Events             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Breadcrumb: ... > Komunitas > Event > Buat Baru               │
│                                                                 │
│  Buat Event Baru                                               │
│  ─────────────                                                 │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                                                        │   │
│  │  Judul Event *                                        │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ Meetup Teknologi #25                           │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Deskripsi                                            │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │                                                │   │   │
│  │  │                                                │   │   │
│  │  │                                                │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Lokasi                                               │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ Jakarta Convention Center                      │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Tanggal & Waktu                                      │   │
│  │  ┌──────────────────┐  ┌──────────────────┐          │   │
│  │  │ Mulai:           │  │ Selesai:          │          │   │
│  │  │ 15/07/2026 14:00 │  │ 15/07/2026 17:00  │          │   │
│  │  └──────────────────┘  └──────────────────┘          │   │
│  │                                                        │   │
│  │  Banner Event                                         │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │  [Klik atau drag & drop untuk upload banner]  │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  ☐ Publikasikan Event (tampilkan ke publik)           │   │
│  │                                                        │   │
│  │  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │   Batal      │  │   Simpan     │                   │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Collaboration Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    Dashboard    Brands    Kolaborasi    [Avatar]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Kolaborasi                                                    │
│  ──────────                                                    │
│                                                                 │
│  ┌── Tab: Diajukan ─── Tab: Diterima ─── Tab: Semua ─────┐   │
│  │                                                         │   │
│  │  [+ Ajukan Kolaborasi Baru]                            │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Kolaborasi dengan Komunitas Teknologi Indonesia │  │   │
│  │  │  Status: ⏳ Menunggu Persetujuan                 │  │   │
│  │  │  Diajukan: 20 Jun 2026                           │  │   │
│  │  │  Tujuan: Brand awareness untuk produk tech       │  │   │
│  │  │  Benefit: Sponsorship event, merchandise         │  │   │
│  │  │  Durasi: 3 bulan                                 │  │   │
│  │  │                                  [Batal] [Edit]  │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Partnership dengan Design Community             │  │   │
│  │  │  Status: ✅ Diterima                             │  │   │
│  │  │  Diajukan: 15 Jun 2026                           │  │   │
│  │  │  Diterima: 17 Jun 2026                           │  │   │
│  │  │  [Lihat Detail]                                  │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  -- Form Ajukan Kolaborasi (Modal / Halaman Baru) --           │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Pilih Komunitas Target                               │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ Pilih komunitas...                          ▼ │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Tujuan Kolaborasi                                    │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │                                                │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Benefit untuk Komunitas                              │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │                                                │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  Durasi Kolaborasi                                    │   │
│  │  ┌────────────────────────────────────────────────┐   │   │
│  │  │ 1 bulan ▼                                      │   │   │
│  │  └────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  │  [Batal]  [Kirim Ajuan]                               │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Approval Center (Superadmin)

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO Admin]  Dashboard  Users  Approvals  Communities  Brands │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Approval Center                                               │
│  ──────────────                                                │
│                                                                 │
│  ┌── Role Requests ──┐ ┌── Community ──┐ ┌── Brand ──────────┐│
│  │     (3)           │ │    (2)        │ │     (1)           ││
│  └───────────────────┘ └──────────────┘ └────────────────────┘│
│                                                                 │
│  Filter: [Semua Status ▼] [Semua Role ▼]  🔍 Search...         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📋 Role Requests                                        │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  [Avatar] Ahmad Fauzi                             │ │  │
│  │  │  Email: ahmad@mail.com                             │ │  │
│  │  │  Requested Role: Community Owner                   │ │  │
│  │  │  Motivasi:                                         │ │  │
│  │  │  "Saya ingin membuat komunitas developer           │ │  │
│  │  │   di Surabaya untuk sharing ilmu编程..."           │ │  │
│  │  │  📅 Diajukan: 20 Jun 2026                          │ │  │
│  │  │                                                    │ │  │
│  │  │  ┌────────────────┐  ┌────────────────┐           │ │  │
│  │  │  │  ✅ Approve    │  │  ❌ Reject     │           │ │  │
│  │  │  └────────────────┘  └────────────────┘           │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  [Avatar] Sari Dewi                               │ │  │
│  │  │  Email: sari@mail.com                              │ │  │
│  │  │  Requested Role: Brand Owner                       │ │  │
│  │  │  Motivasi:                                         │ │  │
│  │  │  "Brand fashion saya ingin berkolaborasi           │ │  │
│  │  │   dengan komunitas kreatif..."                     │ │  │
│  │  │  📅 Diajukan: 21 Jun 2026                          │ │  │
│  │  │                                                    │ │  │
│  │  │  ┌────────────────┐  ┌────────────────┐           │ │  │
│  │  │  │  ✅ Approve    │  │  ❌ Reject     │           │ │  │
│  │  │  └────────────────┘  └────────────────┘           │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌── Community Moderation ─────────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  🏘️ Tech Meetup Bandung                           │ │   │
│  │  │  Owner: Budi Santoso                               │ │   │
│  │  │  Category: Teknologi                               │ │   │
│  │  │  Location: Bandung                                 │ │   │
│  │  │  Status: ⏳ Menunggu Approval                      │ │   │
│  │  │  [Approve]  [Reject]  [Lihat Detail]               │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```
