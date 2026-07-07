# Wireframe Notes — KomunaID

> Deskripsi struktur layout per halaman untuk developer. Bukan mockup visual, melainkan panduan komponen dan placement.

---

## 1. Landing Page (`/`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR (sticky)                             │
│ Logo   | Menu items          | Masuk | Daftar│
├─────────────────────────────────────────────┤
│ HERO SECTION                                │
│ ┌─────────────────────────────────────────┐ │
│ │ Headline + Subheadline                  │ │
│ │ CTA Button (Daftar Sekarang)            │ │
│ │ Hero illustration/image                 │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ STATS BAR                                   │
│ [Komunitas: XXX] [Event: XXX] [Anggota: XXX]│
├─────────────────────────────────────────────┤
│ FEATURES SECTION                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Feature 1│ │ Feature 2│ │ Feature 3│     │
│ │ Icon     │ │ Icon     │ │ Icon     │     │
│ │ Title    │ │ Title    │ │ Title    │     │
│ │ Desc     │ │ Desc     │ │ Desc     │     │
│ └──────────┘ └──────────┘ └──────────┘     │
├─────────────────────────────────────────────┤
│ COMMUNITIES SHOWCASE                        │
│ "Komunitas Populer"  [Lihat Semua →]        │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│ │ Card 1 │ │ Card 2 │ │ Card 3 │ │ Card 4 ││
│ └────────┘ └────────┘ └────────┘ └────────┘│
├─────────────────────────────────────────────┤
│ EVENTS SHOWCASE                             │
│ "Event Mendatang"  [Lihat Semua →]          │
│ ┌────────┐ ┌────────┐ ┌────────┐            │
│ │ Card 1 │ │ Card 2 │ │ Card 3 │            │
│ └────────┘ └────────┘ └────────┘            │
├─────────────────────────────────────────────┤
│ CTA SECTION                                 │
│ "Siap Bergabung?"  [Daftar Sekarang]        │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
│ Logo | Links | Social | Copyright            │
└─────────────────────────────────────────────┘
```

### Components Used

- Navbar (sticky, transparent → solid on scroll)
- Hero section (text + illustration)
- Stats bar (animated counters)
- Feature cards (icon + title + description)
- Community cards (horizontal scroll or grid)
- Event cards (horizontal scroll or grid)
- CTA section
- Footer

---

## 2. Communities Directory (`/communities`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ PAGE HEADER                                 │
│ "Jelajahi Komunitas"                        │
│ Subtitle text                               │
├─────────────────────────────────────────────┤
│ SEARCH & FILTERS                            │
│ [Search input          ] [Category ▼]       │
│ [Location ▼] [Membership Type ▼] [Sort ▼]  │
├─────────────────────────────────────────────┤
│ RESULTS COUNT                               │
│ "Menampilkan 24 komunitas"                  │
├─────────────────────────────────────────────┤
│ COMMUNITY GRID                              │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│ │ Banner     │ │ Banner     │ │ Banner     ││
│ │ Logo+Name  │ │ Logo+Name  │ │ Logo+Name  ││
│ │ Desc       │ │ Desc       │ │ Desc       ││
│ │ Members    │ │ Members    │ │ Members    ││
│ │ [Join]     │ │ [Join]     │ │ [Join]     ││
│ └────────────┘ └────────────┘ └────────────┘│
│ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│ │ ...        │ │ ...        │ │ ...        ││
│ └────────────┘ └────────────┘ └────────────┘│
├─────────────────────────────────────────────┤
│ PAGINATION                                  │
│ [< 1 2 3 ... 10 >]                          │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

### Components Used

- SearchBar
- FilterDropdown (multiple)
- CommunityCard
- Pagination
- EmptyState (no results)

---

## 3. Community Detail (`/communities/[slug]`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ BANNER (full width, 200px height)           │
│ ┌─────────────────────────────────────────┐ │
│ │ Logo (80x80, overlapping banner)        │ │
│ │ Community Name                          │ │
│ │ Short description                       │ │
│ │ Stats: Members | Posts | Events         │ │
│ │ [Join Button]                           │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ TABS: Tentang | Postingan | Event | Anggota │
├─────────────────────────────────────────────┤
│ TAB CONTENT                                 │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │ Content area (varies by tab)            │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

### Tab Content Details

- **Tentang**: Description, details (location, website, contact), founded date, membership type
- **Postingan**: Post list with create button (if member)
- **Event**: Event list (upcoming + past)
- **Anggota**: Member list with roles

---

## 4. Events Directory (`/events`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ PAGE HEADER                                 │
│ "Jelajahi Event"                            │
├─────────────────────────────────────────────┤
│ SEARCH & FILTERS                            │
│ [Search input          ] [Category ▼]       │
│ [Date Range] [Online/Offline ▼] [Sort ▼]   │
├─────────────────────────────────────────────┤
│ EVENT GRID                                  │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│ │ Banner     │ │ Banner     │ │ Banner     ││
│ │ Title      │ │ Title      │ │ Title      ││
│ │ Date/Time  │ │ Date/Time  │ │ Date/Time  ││
│ │ Location   │ │ Location   │ │ Location   ││
│ │ [Register] │ │ [Register] │ │ [Register] ││
│ └────────────┘ └────────────┘ └────────────┘│
├─────────────────────────────────────────────┤
│ PAGINATION                                  │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 5. Event Detail (`/events/[slug]`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ BANNER (full width)                         │
├─────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────┐ │
│ │ EVENT INFO          │ │ REGISTRATION    │ │
│ │ Title               │ │ [Register]      │ │
│ │ Date & Time         │ │ Capacity: XX/XX │ │
│ │ Location            │ │ Deadline: ...   │ │
│ │ Category badge      │ │ Organizer info  │ │
│ │ Description         │ │                 │ │
│ │ (markdown content)  │ │                 │ │
│ └─────────────────────┘ └─────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 6. Auth Pages

### Login (`/login`)

```
┌─────────────────────────────────────────────┐
│ NAVBAR (minimal)                            │
├─────────────────────────────────────────────┤
│ ┌─────────────────────┐                     │
│ │ LOGIN FORM          │                     │
│ │ Logo                │                     │
│ │ "Masuk ke Akun"     │                     │
│ │                     │                     │
│ │ Email input         │                     │
│ │ Password input      │                     │
│ │ "Lupa Password?"    │                     │
│ │                     │                     │
│ │ [Masuk Button]      │                     │
│ │                     │                     │
│ │ Belum punya akun?   │                     │
│ │ [Daftar]            │                     │
│ └─────────────────────┘                     │
├─────────────────────────────────────────────┤
│ FOOTER (minimal)                            │
└─────────────────────────────────────────────┘
```

### Register (`/register`)

```
┌─────────────────────────────────────────────┐
│ NAVBAR (minimal)                            │
├─────────────────────────────────────────────┤
│ ┌─────────────────────┐                     │
│ │ REGISTER FORM       │                     │
│ │ Logo                │                     │
│ │ "Buat Akun Baru"    │                     │
│ │                     │                     │
│ │ Progress: 1/3       │                     │
│ │ ─────────────────   │                     │
│ │ Step 1: Info Akun   │                     │
│ │ Email               │                     │
│ │ Username            │                     │
│ │ Password            │                     │
│ │ Confirm Password    │                     │
│ │                     │                     │
│ │ [Selanjutnya]       │                     │
│ │                     │                     │
│ │ Sudah punya akun?   │                     │
│ │ [Masuk]             │                     │
│ └─────────────────────┘                     │
├─────────────────────────────────────────────┤
│ FOOTER (minimal)                            │
└─────────────────────────────────────────────┘
```

---

## 7. Member Dashboard (`/app`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR (with notifications, avatar)         │
├─────────────────────────────────────────────┤
│ SIDEBAR (collapsible)  │  MAIN CONTENT      │
│                        │                    │
│ ┌──────────────┐       │ ┌────────────────┐ │
│ │ Dashboard    │       │ │ Stats Cards    │ │
│ │ Profil       │       │ │ [3-4 cards]    │ │
│ │ Minat        │       │ └────────────────┘ │
│ │ Komunitas    │       │ ┌────────────────┐ │
│ │ Event        │       │ │ Recent Activity│ │
│ │ Notifikasi   │       │ │ Activity list  │ │
│ │ Aktivitas    │       │ └────────────────┘ │
│ │ Laporan      │       │ ┌────────────────┐ │
│ │              │       │ │ Upcoming Events│ │
│ │              │       │ │ Event cards    │ │
│ │              │       │ └────────────────┘ │
│ └──────────────┘       │                    │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 8. Community Management (`/app/community/[id]/*`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ COMMUNITY HEADER                            │
│ Logo | Name | Status badge | Quick actions  │
├─────────────────────────────────────────────┤
│ TABS: Ringkasan | Profil | Anggota | ...    │
├─────────────────────────────────────────────┤
│ SIDEBAR (context)     │  MAIN CONTENT       │
│                       │                     │
│ ┌───────────────┐     │ ┌─────────────────┐ │
│ │ Ringkasan     │     │ │ Tab Content     │ │
│ │ Profil        │     │ │                 │ │
│ │ Anggota       │     │ │ (varies by tab) │ │
│ │ Join Requests │     │ │                 │ │
│ │ Roles         │     │ │                 │ │
│ │ Event         │     │ └─────────────────┘ │
│ │ Peserta       │     │                     │
│ │ Postingan     │     │                     │
│ │ Laporan       │     │                     │
│ │ Pengaturan    │     │                     │
│ └───────────────┘     │                     │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 9. Admin Panel (`/admin`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR (admin variant, dark)                │
├─────────────────────────────────────────────┤
│ SIDEBAR (dark, always visible) │ MAIN       │
│                                │ CONTENT    │
│ ┌──────────────────┐           │            │
│ │ Dashboard        │           │ ┌────────┐ │
│ │ Pengguna         │           │ │Content │ │
│ │ Role             │           │ │Area    │ │
│ │ Persetujuan      │           │ │        │ │
│ │  - Komunitas     │           │ │        │ │
│ │  - Organisasi    │           │ └────────┘ │
│ │ Event            │           │            │
│ │ Kategori         │           │            │
│ │ Laporan          │           │            │
│ │ Analitik         │           │            │
│ │ Log Audit        │           │            │
│ │ Pengaturan       │           │            │
│ └──────────────────┘           │            │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

### Admin Dashboard Content

```
┌─────────────────────────────────────────────┐
│ STATS CARDS (4 cards)                       │
│ [Users] [Communities] [Events] [Reports]    │
├─────────────────────────────────────────────┤
│ CHARTS ROW                                  │
│ [Growth Chart (70%)]  [Activity (30%)]      │
├─────────────────────────────────────────────┤
│ RECENT ACTIVITY TABLE                       │
│ Action | User | Target | Date | Status      │
├─────────────────────────────────────────────┤
│ QUICK ACTIONS                               │
│ [Review Communities] [Review Events]        │
└─────────────────────────────────────────────┘
```

---

## 10. Shared Patterns

### Modal/Dialog

```
┌─────────────────────────────┐
│ Overlay (dark, 50% opacity) │
│ ┌─────────────────────────┐ │
│ │ Title            [X]    │ │
│ │ ──────────────────────  │ │
│ │ Content                 │ │
│ │                         │ │
│ │ ──────────────────────  │ │
│ │ [Cancel]    [Confirm]   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Toast Notification

```
┌──────────────────────────────┐
│ [Icon] Message text    [X]  │
└──────────────────────────────┘
Position: bottom-right
Duration: 5s (auto-dismiss)
```

### Empty State

```
┌─────────────────────────────┐
│                             │
│      [Illustration]         │
│                             │
│   No data found             │
│   Description text          │
│                             │
│   [Action Button]           │
│                             │
└─────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────┐
│ [Skeleton placeholder]      │
│ [Skeleton placeholder]      │
│ [Skeleton placeholder]      │
└─────────────────────────────┘
```

### Error State

```
┌─────────────────────────────┐
│                             │
│      [Error Icon]           │
│                             │
│   Something went wrong      │
│   Error description         │
│                             │
│   [Retry Button]            │
│                             │
└─────────────────────────────┘
```

### Table Pattern

```
┌─────────────────────────────────────────┐
│ [Search input]              [Filter ▼]  │
├─────────────────────────────────────────┤
│ Header: Col1 | Col2 | Col3 | Actions   │
├─────────────────────────────────────────┤
│ Row 1: ... | ... | ...  | [Edit][Del]  │
│ Row 2: ... | ... | ...  | [Edit][Del]  │
│ Row 3: ... | ... | ...  | [Edit][Del]  │
├─────────────────────────────────────────┤
│ Showing 1-10 of 50     [< 1 2 3 >]     │
└─────────────────────────────────────────┘
```

### Pagination Pattern

```
[<] [1] [2] [3] ... [10] [>]
Active page: bg-royal text-white
Inactive: bg-white text-gray-700 hover:bg-gray-50
```

---

## 11. Error Pages

### 403 Forbidden (`/403`)

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│                                             │
│         ┌─────────────────────┐             │
│         │    [Shield Icon]    │             │
│         │                     │             │
│         │   Akses Ditolak     │             │
│         │                     │             │
│         │   Anda tidak memiliki│            │
│         │   akses ke halaman  │             │
│         │   ini.              │             │
│         │                     │             │
│         │   [Kembali ke Home] │             │
│         └─────────────────────┘             │
│                                             │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

### 404 Not Found (`/404`)

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│                                             │
│         ┌─────────────────────┐             │
│         │    [Map Icon]       │             │
│         │                     │             │
│         │   404               │             │
│         │                     │             │
│         │   Halaman Tidak     │             │
│         │   Ditemukan         │             │
│         │                     │             │
│         │   Halaman yang Anda │             │
│         │   cari tidak ada.   │             │
│         │                     │             │
│         │   [Kembali ke Home] │             │
│         └─────────────────────┘             │
│                                             │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

### 500 Server Error (`/500`)

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│                                             │
│         ┌─────────────────────┐             │
│         │    [Warning Icon]   │             │
│         │                     │             │
│         │   Terjadi Kesalahan │             │
│         │                     │             │
│         │   Server mengalami  │             │
│         │   masalah. Silakan  │             │
│         │   coba lagi.        │             │
│         │                     │             │
│         │   [Coba Lagi]       │             │
│         └─────────────────────┘             │
│                                             │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 12. Settings Page (`/app/settings`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ SIDEBAR (collapsible)  │  MAIN CONTENT      │
│                        │                    │
│ ┌──────────────┐       │ ┌────────────────┐ │
│ │ Dashboard    │       │ │ PENGATURAN     │ │
│ │ Profil       │       │ │                │ │
│ │ Minat        │       │ │ Ubah Password  │ │
│ │ Komunitas    │       │ │ ┌────────────┐ │ │
│ │ Organisasi   │       │ │ │ Password   │ │ │
│ │ Event        │       │ │ │ lama       │ │ │
│ │ Notifikasi   │       │ │ ├────────────┤ │ │
│ │ Aktivitas    │       │ │ │ Password   │ │ │
│ │ Bookmark     │       │ │ │ baru       │ │ │
│ │ Laporan      │       │ │ ├────────────┤ │ │
│ │ Pengaturan ★ │       │ │ │ Konfirmasi │ │ │
│ └──────────────┘       │ │ │ password   │ │ │
│                        │ │ ├────────────┤ │ │
│                        │ │ │ [Simpan]   │ │ │
│                        │ │ └────────────┘ │ │
│                        │ └────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 13. Community Create (`/app/communities/create`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ SIDEBAR (collapsible)  │  MAIN CONTENT      │
│                        │                    │
│ ┌──────────────┐       │ ┌────────────────┐ │
│ │ Dashboard    │       │ │ BUAT KOMUNITAS │ │
│ │ Profil       │       │ │                │ │
│ │ Minat        │       │ │ Progress: 1/4  │ │
│ │ Komunitas ★  │       │ │ ────────────── │ │
│ │ Organisasi   │       │ │                │ │
│ │ Event        │       │ │ Step 1: Info   │ │
│ │ Notifikasi   │       │ │ Dasar          │ │
│ │ Aktivitas    │       │ │                │ │
│ │ Bookmark     │       │ │ Nama *         │ │
│ │ Laporan      │       │ │ [input]        │ │
│ │ Pengaturan   │       │ │                │ │
│ └──────────────┘       │ │ Deskripsi *    │ │
│                        │ │ [textarea]     │ │
│                        │ │                │ │
│                        │ │ Kategori *     │ │
│                        │ │ [select]       │ │
│                        │ │                │ │
│                        │ │ Lokasi         │ │
│                        │ │ [input]        │ │
│                        │ │                │ │
│                        │ │ [Selanjutnya]  │ │
│                        │ └────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 14. Event Create (`/app/community/[id]/events/create`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ SIDEBAR (collapsible)  │  MAIN CONTENT      │
│                        │                    │
│ ┌──────────────┐       │ ┌────────────────┐ │
│ │ Ringkasan    │       │ │ BUAT EVENT     │ │
│ │ Profil       │       │ │                │ │
│ │ Anggota      │       │ │ Progress: 1/5  │ │
│ │ Permintaan   │       │ │ ────────────── │ │
│ │ Role         │       │ │                │ │
│ │ Event ★      │       │ │ Step 1: Info   │ │
│ │ Peserta      │       │ │ Dasar          │ │
│ │ Postingan    │       │ │                │ │
│ │ Laporan      │       │ │ Judul *        │ │
│ │ Pengaturan   │       │ │ [input]        │ │
│ └──────────────┘       │ │                │ │
│                        │ │ Deskripsi *    │ │
│                        │ │ [textarea]     │ │
│                        │ │                │ │
│                        │ │ Kategori *     │ │
│                        │ │ [select]       │ │
│                        │ │                │ │
│                        │ │ Deskripsi      │ │
│                        │ │ Singkat        │ │
│                        │ │ [input]        │ │
│                        │ │                │ │
│                        │ │ [Selanjutnya]  │ │
│                        │ └────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 15. Organization Directory (`/organizations`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ PAGE HEADER                                 │
│ "Jelajahi Organisasi"                       │
│ Subtitle text                               │
├─────────────────────────────────────────────┤
│ SEARCH & FILTERS                            │
│ [Search input          ] [Industry ▼]       │
│ [Location ▼] [Sort ▼]                      │
├─────────────────────────────────────────────┤
│ RESULTS COUNT                               │
│ "Menampilkan 18 organisasi"                 │
├─────────────────────────────────────────────┤
│ ORGANIZATION GRID                           │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│ │ Logo       │ │ Logo       │ │ Logo       ││
│ │ Name       │ │ Name       │ │ Name       ││
│ │ Industry   │ │ Industry   │ │ Industry   ││
│ │ Members    │ │ Members    │ │ Members    ││
│ │ [Kunjungi] │ │ [Kunjungi] │ │ [Kunjungi] ││
│ └────────────┘ └────────────┘ └────────────┘│
├─────────────────────────────────────────────┤
│ PAGINATION                                  │
│ [< 1 2 3 ... 10 >]                          │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 16. Organization Detail (`/organizations/[slug]`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ BANNER (full width, 200px height)           │
│ ┌─────────────────────────────────────────┐ │
│ │ Logo (80x80, overlapping banner)        │ │
│ │ Organization Name                       │ │
│ │ Industry | Location                     │ │
│ │ Stats: Members | Events                 │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ TABS: Tentang | Event | Anggota             │
├─────────────────────────────────────────────┤
│ TAB CONTENT                                 │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │ Content area (varies by tab)            │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 17. Admin User Detail (`/admin/users/[id]`)

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR (admin)                              │
├─────────────────────────────────────────────┤
│ SIDEBAR (dark)          │  MAIN CONTENT     │
│                         │                   │
│ ┌──────────────────┐    │ ┌───────────────┐ │
│ │ Dashboard        │    │ │ DETAIL USER   │ │
│ │ Pengguna ★       │    │ │               │ │
│ │ Role             │    │ │ ┌───────────┐ │ │
│ │ Persetujuan      │    │ │ │ Avatar    │ │ │
│ │ Event            │    │ │ │ Nama      │ │ │
│ │ Kategori         │    │ │ │ Email     │ │ │
│ │ Laporan          │    │ │ │ Status    │ │ │
│ │ Analitik         │    │ │ │ Role      │ │ │
│ │ Log Audit        │    │ │ └───────────┘ │ │
│ │ Pengaturan       │    │ │               │ │
│ └──────────────────┘    │ │ Role          │ │
│                         │ │ Assignments   │ │
│                         │ │ [Assign Role] │ │
│                         │ │               │ │
│                         │ │ Actions       │ │
│                         │ │ [Suspend]     │ │
│                         │ │ [Activate]    │ │
│                         │ │ [Ban]         │ │
│                         │ └───────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

---

## 18. Organization Management Sidebar

### Layout

```
┌─────────────────────────────────────────────┐
│ NAVBAR                                      │
├─────────────────────────────────────────────┤
│ ORG HEADER                                  │
│ Logo | Name | Status badge | Quick actions  │
├─────────────────────────────────────────────┤
│ SIDEBAR (context)     │  MAIN CONTENT       │
│                       │                     │
│ ┌───────────────┐     │ ┌─────────────────┐ │
│ │ Ringkasan     │     │ │ Tab Content     │ │
│ │ Profil        │     │ │                 │ │
│ │ Tim           │     │ │ (varies by tab) │ │
│ │ Event         │     │ │                 │ │
│ │ Peserta       │     │ │                 │ │
│ │ Konten        │     │ └─────────────────┘ │
│ │ Insight       │     │                     │
│ │ Pengaturan    │     │                     │
│ └───────────────┘     │                     │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```
