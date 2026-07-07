# Information Architecture — KomunaID

## Content Hierarchy

### Level 0: Root

- KomunaID Platform

### Level 1: Areas

```
├── Public (Informasi umum, marketing)
├── Auth (Autentikasi pengguna)
├── Member Dashboard (Area pribadi anggota)
├── Community Management (Manajemen komunitas)
├── Organization Management (Manajemen organisasi)
└── Admin Panel (Manajemen platform)
```

### Level 2: Sections (per Area)

#### Public

```
├── Home (Landing)
│   ├── Hero section
│   ├── Features overview
│   ├── Stats
│   └── CTA
├── About
│   ├── Mission & Vision
│   ├── Team
│   └── Timeline
├── Communities Directory
│   ├── Search & filter
│   ├── Category filter
│   └── Community cards
├── Organizations Directory
│   ├── Search & filter
│   ├── Industry filter
│   └── Organization cards
├── Events Directory
│   ├── Search & filter
│   ├── Date filter
│   └── Event cards
├── FAQ
├── Contact
├── Terms
├── Privacy
├── Community Guideline
└── Event Guideline
```

#### Auth

```
├── Login
│   ├── Email + password form
│   ├── Social login (future)
│   └── Forgot password link
├── Register
│   ├── Multi-step form
│   │   ├── Step 1: Account info
│   │   ├── Step 2: Profile info
│   │   └── Step 3: Interest selection
│   └── Email verification
├── Forgot Password
│   └── Email input form
└── Reset Password
    └── New password form
```

#### Member Dashboard

```
├── Dashboard (Overview)
│   ├── Stats cards
│   ├── Recent activity
│   └── Upcoming events
├── Profile
│   ├── Personal info
│   ├── Avatar upload
│   └── Bio & location
├── Interests
│   ├── Category selection
│   └── Tag cloud
├── My Communities
│   ├── Joined communities
│   ├── Owned communities
│   └── Create community
├── My Organizations
│   ├── Owned organizations
│   └── Create organization
├── My Events
│   ├── Registered events
│   └── Created events
├── Notifications
│   ├── Notification list
│   └── Read/unread filter
├── Activity
│   └── Activity timeline
├── Bookmarks
│   └── Bookmarked communities
├── Reports
│   └── Submitted reports
└── Settings
    ├── Change password
    └── Privacy settings
```

#### Community Management

```
├── Overview
│   ├── Stats
│   ├── Recent posts
│   └── Upcoming events
├── Profile
│   ├── Community info
│   ├── Logo & banner
│   └── Contact info
├── Members
│   ├── Member list
│   ├── Search & filter
│   └── Role management
├── Join Requests
│   ├── Pending requests
│   └── Approve/reject actions
├── Roles
│   ├── Role definitions
│   └── Permission matrix
├── Events
│   ├── Event list
│   ├── Create event
│   └── Event management
├── Participants
│   ├── Participant list
│   └── Check-in management
├── Posts
│   ├── Post list
│   ├── Create post
│   └── Post moderation
├── Reports
│   ├── Reported content
│   └── Review actions
└── Settings
    ├── Community settings
    ├── Danger zone
    └── Delete community
```

#### Organization Management

```
├── Overview
│   ├── Stats
│   ├── Recent activity
│   └── Team overview
├── Profile
│   ├── Organization info
│   ├── Logo & banner
│   └── Industry & size
├── Team
│   ├── Team members
│   ├── Invite member
│   └── Role management
├── Events
│   ├── Event list
│   ├── Create event
│   └── Event management
├── Participants
│   ├── Participant list
│   └── Attendance tracking
├── Content
│   ├── Content list
│   ├── Create content
│   └── Content management
├── Insight
│   ├── Analytics dashboard
│   ├── Engagement metrics
│   └── Growth metrics
└── Settings
    ├── Organization settings
    ├── Danger zone
    └── Delete organization
```

#### Admin Panel

```
├── Dashboard
│   ├── Platform stats
│   ├── Recent activity
│   └── Quick actions
├── Users
│   ├── User list
│   ├── Search & filter
│   ├── User detail
│   └── Suspend/ban actions
├── Roles
│   ├── Role list
│   ├── Create role
│   └── Permission management
├── Community Approval
│   ├── Pending communities
│   ├── Review details
│   └── Approve/reject actions
├── Organization Approval
│   ├── Pending organizations
│   ├── Review details
│   └── Approve/reject actions
├── Events
│   ├── Event list
│   ├── Pending events
│   └── Approve/reject actions
├── Categories
│   ├── Category list
│   ├── Create category
│   └── Category management
├── Reports
│   ├── Reported content
│   ├── Review queue
│   └── Action taken
├── Analytics
│   ├── Platform metrics
│   ├── Growth charts
│   └── Engagement data
├── Audit Log
│   ├── Log list
│   ├── Filter by action
│   └── Filter by user
└── Settings
    ├── Platform settings
    ├── Email templates
    └── System config
```

## Navigation Structure

### Public Navigation

```
Logo  |  Komunitas  |  Event  |  Tentang  |  FAQ  |  [Masuk]  [Daftar]
```

### Member Navigation

```
Logo  |  Dashboard  |  Komunitas  |  Event  |  [Notifikasi]  [Avatar ▼]
                                                          ├── Profil
                                                          ├── Minat
                                                          ├── Pengaturan
                                                          └── Keluar
```

### Community Manager Navigation

```
Logo  |  Dashboard  |  Komunitas  |  Event  |  [Notifikasi]  [Avatar ▼]

Sidebar (in community context):
├── Ringkasan
├── Profil
├── Anggota
├── Permintaan Bergabung
├── Role
├── Event
├── Peserta
├── Postingan
├── Laporan
└── Pengaturan
```

### Organization Manager Navigation

```
Logo  |  Dashboard  |  Komunitas  |  Event  |  [Notifikasi]  [Avatar ▼]

Sidebar (in organization context):
├── Ringkasan
├── Profil
├── Tim
├── Event
├── Peserta
├── Konten
├── Insight
└── Pengaturan
```

### Admin Navigation

```
Logo  |  Admin  |  [Notifikasi]  [Avatar ▼]

Sidebar:
├── Dashboard
├── Pengguna
├── Role
├── Persetujuan Komunitas
├── Persetujuan Organisasi
├── Event
├── Kategori
├── Laporan
├── Analitik
├── Log Audit
└── Pengaturan
```

## Breadcrumb Patterns

```
Home
Home > Komunitas
Home > Komunitas > [Community Name]
Home > Event
Home > Event > [Event Name]
Dashboard
Dashboard > Komunitas > [Community Name] > Anggota
Dashboard > Organisasi > [Org Name] > Tim
Admin > Pengguna
Admin > Log Audit
```

## Search Patterns

| Context            | Scope                | Filters                              |
| ------------------ | -------------------- | ------------------------------------ |
| Public communities | All approved         | Category, location, membership type  |
| Public events      | All approved         | Category, date range, online/offline |
| Member communities | Joined + owned       | Status                               |
| Member events      | Registered + created | Status, date                         |
| Admin users        | All users            | Role, status, search                 |
| Admin communities  | All communities      | Status, category                     |
| Admin events       | All events           | Status, category                     |
| Community members  | Community members    | Role, status, search                 |
