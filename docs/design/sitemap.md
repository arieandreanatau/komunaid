# Sitemap — KomunaID MVP

## Public Area

```
/ (Landing Page)
├── /about
├── /communities
│   └── /communities/[slug]
├── /organizations
│   └── /organizations/[slug]
├── /events
│   └── /events/[slug]
├── /faq
├── /contact
├── /terms
├── /privacy
├── /community-guideline
└── /event-guideline
```

## Auth Area

```
/login
/register
/forgot-password
/reset-password
```

## Member Dashboard (/app)

```
/app (Dashboard)
├── /app/profile
├── /app/interests
├── /app/communities
│   └── /app/communities/create
├── /app/organizations
│   └── /app/organizations/create
├── /app/events
├── /app/notifications
├── /app/activity
├── /app/bookmarks
├── /app/reports
└── /app/settings
```

## Community Management (/app/community/[id])

```
/app/community/[id]
├── /overview
├── /profile
├── /members
├── /join-requests
├── /roles
├── /events
│   └── /events/create
├── /participants
├── /posts
│   └── /posts/create
├── /reports
└── /settings
```

## Organization Management (/app/organization/[id])

```
/app/organization/[id]
├── /overview
├── /profile
├── /team
├── /events
│   └── /events/create
├── /participants
├── /content
│   └── /content/create
├── /insight
└── /settings
```

## Admin Panel (/admin)

```
/admin (Dashboard)
├── /users
│   └── /users/[id]
├── /roles
│   └── /roles/[id]
├── /community-approval
│   └── /community-approval/[id]
├── /organization-approval
│   └── /organization-approval/[id]
├── /events
│   └── /events/[id]
├── /categories
│   └── /categories/[id]
├── /reports
│   └── /reports/[id]
├── /analytics
├── /audit-log
└── /settings
```

## Error Pages

```
/403
/404
/500
/maintenance
```

## Route Summary

| Area         | Routes | Total  |
| ------------ | ------ | ------ |
| Public       | 13     | 13     |
| Auth         | 4      | 4      |
| Member       | 12     | 12     |
| Community    | 12     | 12     |
| Organization | 10     | 10     |
| Admin        | 16     | 16     |
| Error        | 4      | 4      |
| **Total**    |        | **71** |

## Route Groups (Next.js App Router)

```
src/app/
├── (public)/              → Public routes (no auth required)
│   ├── page.tsx           → Landing page
│   ├── about/
│   ├── communities/
│   │   └── [slug]/
│   ├── organizations/
│   │   └── [slug]/
│   ├── events/
│   │   └── [slug]/
│   ├── faq/
│   ├── contact/
│   ├── terms/
│   ├── privacy/
│   ├── community-guideline/
│   └── event-guideline/
├── (auth)/                → Auth routes (redirect if logged in)
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── (dashboard)/           → Protected routes (auth required)
│   ├── layout.tsx         → Dashboard layout (sidebar + header)
│   ├── app/               → Member routes
│   │   ├── page.tsx       → Dashboard home
│   │   ├── profile/
│   │   ├── interests/
│   │   ├── communities/
│   │   │   └── create/
│   │   ├── organizations/
│   │   │   └── create/
│   │   ├── events/
│   │   ├── notifications/
│   │   ├── activity/
│   │   ├── bookmarks/
│   │   ├── reports/
│   │   └── settings/
│   ├── community/[id]/    → Community management
│   │   ├── overview/
│   │   ├── profile/
│   │   ├── members/
│   │   ├── join-requests/
│   │   ├── roles/
│   │   ├── events/
│   │   │   └── create/
│   │   ├── participants/
│   │   ├── posts/
│   │   │   └── create/
│   │   ├── reports/
│   │   └── settings/
│   ├── organization/[id]/ → Organization management
│   │   ├── overview/
│   │   ├── profile/
│   │   ├── team/
│   │   ├── events/
│   │   │   └── create/
│   │   ├── participants/
│   │   ├── content/
│   │   │   └── create/
│   │   ├── insight/
│   │   └── settings/
│   └── admin/             → Admin routes
│       ├── layout.tsx     → Admin layout (dark sidebar)
│       ├── page.tsx       → Admin dashboard
│       ├── users/
│       │   └── [id]/
│       ├── roles/
│       │   └── [id]/
│       ├── community-approval/
│       │   └── [id]/
│       ├── organization-approval/
│       │   └── [id]/
│       ├── events/
│       │   └── [id]/
│       ├── categories/
│       │   └── [id]/
│       ├── reports/
│       │   └── [id]/
│       ├── analytics/
│       ├── audit-log/
│       └── settings/
├── (error)/               → Error pages
│   ├── 403/
│   ├── 404/
│   ├── 500/
│   └── maintenance/
├── layout.tsx             → Root layout
├── page.tsx               → Landing page redirect
└── globals.css            → Global styles
```

## Access Control Matrix

| Route Group         |      Auth Required      | Role Required                          | Redirect If No Auth |
| ------------------- | :---------------------: | -------------------------------------- | ------------------- |
| (public)            |           No            | Any                                    | —                   |
| (auth)              | No (redirect if authed) | Any                                    | —                   |
| /app/*              |           Yes           | MEMBER+                                | /login              |
| /app/community/*    |           Yes           | COMMUNITY_OWNER/ADMIN/MODERATOR/MEMBER | /login              |
| /app/organization/* |           Yes           | ORG_OWNER/ADMIN/MEMBER                 | /login              |
| /admin/*            |           Yes           | SUPER_ADMIN/PLATFORM_ADMIN             | /login              |
| /403                |           No            | Any                                    | —                   |
| /404                |           No            | Any                                    | —                   |
| /500                |           No            | Any                                    | —                   |
| /maintenance        |           No            | Any                                    | —                   |

## Breadcrumb Patterns

```
Home
Home > Komunitas
Home > Komunitas > [Community Name]
Home > Organisasi
Home > Organisasi > [Organization Name]
Home > Event
Home > Event > [Event Name]
Home > FAQ
Home > Kontak
Home > Tentang
Home > Syarat & Ketentuan
Home > Kebijakan Privasi
Home > Pedoman Komunitas
Home > Pedoman Event

Dashboard
Dashboard > Profil
Dashboard > Minat
Dashboard > Komunitas Saya
Dashboard > Komunitas Saya > Buat Komunitas
Dashboard > Organisasi Saya
Dashboard > Organisasi Saya > Buat Organisasi
Dashboard > Event Saya
Dashboard > Notifikasi
Dashboard > Aktivitas
Dashboard > Bookmark
Dashboard > Laporan
Dashboard > Pengaturan

Dashboard > [Community Name] > Ringkasan
Dashboard > [Community Name] > Profil
Dashboard > [Community Name] > Anggota
Dashboard > [Community Name] > Permintaan Bergabung
Dashboard > [Community Name] > Role
Dashboard > [Community Name] > Event
Dashboard > [Community Name] > Event > Buat Event
Dashboard > [Community Name] > Peserta
Dashboard > [Community Name] > Postingan
Dashboard > [Community Name] > Postingan > Buat Postingan
Dashboard > [Community Name] > Laporan
Dashboard > [Community Name] > Pengaturan

Dashboard > [Organization Name] > Ringkasan
Dashboard > [Organization Name] > Profil
Dashboard > [Organization Name] > Tim
Dashboard > [Organization Name] > Event
Dashboard > [Organization Name] > Event > Buat Event
Dashboard > [Organization Name] > Peserta
Dashboard > [Organization Name] > Konten
Dashboard > [Organization Name] > Konten > Buat Konten
Dashboard > [Organization Name] > Insight
Dashboard > [Organization Name] > Pengaturan

Admin
Admin > Pengguna
Admin > Pengguna > [User Name]
Admin > Role
Admin > Role > [Role Name]
Admin > Persetujuan Komunitas
Admin > Persetujuan Komunitas > [Community Name]
Admin > Persetujuan Organisasi
Admin > Persetujuan Organisasi > [Organization Name]
Admin > Event
Admin > Event > [Event Name]
Admin > Kategori
Admin > Kategori > [Category Name]
Admin > Laporan
Admin > Laporan > [Report ID]
Admin > Analitik
Admin > Log Audit
Admin > Pengaturan
```

## Navigation Structure

### Public Navigation

```
Logo  |  Komunitas  |  Organisasi  |  Event  |  Tentang  |  FAQ  |  [Masuk]  [Daftar]
```

### Member Navigation

```
Logo  |  Dashboard  |  Komunitas  |  Organisasi  |  Event  |  [Notifikasi]  [Avatar ▼]
                                                          ├── Profil
                                                          ├── Pengaturan
                                                          └── Keluar
```

### Dashboard Sidebar (Member)

```
├── Dashboard (Ringkasan)
├── Profil
├── Minat & Preferensi
├── Komunitas Saya
├── Organisasi Saya
├── Event Saya
├── Notifikasi
├── Aktivitas
├── Bookmark
├── Laporan
└── Pengaturan
```

### Community Manager Sidebar

```
├── Ringkasan
├── Profil Komunitas
├── Anggota
├── Permintaan Bergabung
├── Role & Permission
├── Event
├── Peserta Event
├── Postingan
├── Laporan
└── Pengaturan
```

### Organization Manager Sidebar

```
├── Ringkasan
├── Profil Organisasi
├── Tim
├── Event
├── Peserta Event
├── Konten
├── Insight & Analitik
└── Pengaturan
```

### Admin Sidebar (Dark Theme)

```
├── Dashboard
├── Pengguna
├── Role
├── Persetujuan
│   ├── Komunitas
│   └── Organisasi
├── Event
├── Kategori
├── Laporan
├── Analitik
├── Log Audit
└── Pengaturan
```
