# Role Based UI — KomunaID

## Role Matrix

| Role               | Code            | Scope                  | Dashboard                        | Sidebar Items             | Header Actions     |
| ------------------ | --------------- | ---------------------- | -------------------------------- | ------------------------- | ------------------ |
| Guest              | —               | Public                 | —                                | —                         | Masuk, Daftar      |
| Member             | MEMBER          | Platform               | /app                             | Full member sidebar       | Notifikasi, Avatar |
| Community Owner    | COMMUNITY_OWNER | Community              | /app/community/[id]              | Full community sidebar    | Notifikasi, Avatar |
| Community Admin    | COMMUNITY_ADMIN | Community (limited)    | /app/community/[id]              | Limited community sidebar | Notifikasi, Avatar |
| Event Manager      | EVENT_MANAGER   | Event                  | /app/community/[id]/participants | Event management only     | Notifikasi, Avatar |
| Organization Owner | ORG_OWNER       | Organization           | /app/organization/[id]           | Full org sidebar          | Notifikasi, Avatar |
| Organization Admin | ORG_ADMIN       | Organization (limited) | /app/organization/[id]           | Limited org sidebar       | Notifikasi, Avatar |
| Platform Admin     | PLATFORM_ADMIN  | Platform               | /admin                           | Admin sidebar (limited)   | Notifikasi, Avatar |
| Super Admin        | SUPER_ADMIN     | Platform (full)        | /admin                           | Full admin sidebar        | Notifikasi, Avatar |

---

## 1. Guest

### Menu

```
Navbar: Logo | Komunitas | Organisasi | Event | Tentang | FAQ | [Masuk] [Daftar]
Footer: Platform | Jelajahi | Legal
```

### Accessible Pages

- All public pages (/)
- Auth pages (/login, /register)

### Hidden Components

- Dashboard sidebar
- Notification bell
- User avatar menu
- Create/edit/delete buttons
- Admin panel

### CTA

- "Daftar Sekarang" (hero)
- "Masuk" (various pages)
- "Join" (community detail → redirect to register)

---

## 2. Member

### Menu

```
Navbar: Logo | Dashboard | Komunitas | Organisasi | Event | [Notifikasi] [Avatar ▼]
Sidebar: Dashboard | Profil | Minat | Komunitas Saya | Organisasi Saya | Event Saya | Notifikasi | Aktivitas | Bookmark | Laporan | Pengaturan
Footer: Platform | Jelajahi | Legal
```

### Dashboard Widgets

- Stats card: Komunitas diikuti, Event diikuti, Notifikasi
- Recent activity feed
- Upcoming events

### Hidden Components

- Admin sidebar
- Community management sidebar (until they own/admin a community)
- Organization management sidebar (until they own/admin an org)
- Create post button (in non-member communities)
- Approve/reject buttons

### Visible Actions

- Join community
- Register for event
- Create community
- Create organization
- Bookmark community
- Submit report
- Edit profile

---

## 3. Community Owner

### Menu

```
Same as Member + Community Management sidebar
Sidebar: Ringkasan | Profil Komunitas | Anggota | Permintaan Bergabung | Role | Event | Peserta | Postingan | Laporan | Pengaturan
```

### Dashboard Widgets (Community Context)

- Community stats: Total anggota, postingan, event
- Recent posts
- Pending join requests count
- Upcoming events

### Visible Actions (Community Context)

- Edit community profile
- Change membership type
- Approve/reject join requests
- Ban/remove members
- Assign admin/moderator roles
- Create/edit/delete posts
- Moderate posts
- Create/edit events
- View event participants
- Check-in participants
- View community reports
- Update community settings
- Delete community (danger zone)

### Hidden Components

- Platform admin features
- Organization management (unless also org owner)

---

## 4. Community Admin

### Menu

```
Same as Community Owner but with limited items
Sidebar: Ringkasan | Anggota | Permintaan Bergabung | Event | Postingan | Laporan
```

### Visible Actions (Community Context)

- View member list
- Approve/reject join requests
- Create event (draft only)
- Create/edit posts
- Moderate posts
- View reports

### Hidden Actions

- Edit community profile
- Change membership type
- Ban/remove members
- Assign roles
- Delete community
- Community settings

---

## 5. Event Manager

### Menu

```
Limited to event management
Sidebar: Event | Peserta
```

### Visible Actions (Event Context)

- View event details
- Edit event details
- View participant list
- Check-in participants
- View event reports

### Hidden Actions

- Community management
- Member management
- Post management
- Community settings

---

## 6. Organization Owner

### Menu

```
Same as Member + Organization Management sidebar
Sidebar: Ringkasan | Profil Organisasi | Tim | Event | Peserta | Konten | Insight | Pengaturan
```

### Dashboard Widgets (Organization Context)

- Organization stats: Total tim, event, konten
- Recent activity
- Team overview

### Visible Actions (Organization Context)

- Edit organization profile
- Invite team members
- Assign team roles
- Create/edit events
- View event participants
- Create/edit content
- View insight analytics
- Update organization settings
- Delete organization (danger zone)

### Hidden Components

- Platform admin features
- Community management (unless also community owner)

---

## 7. Organization Admin

### Menu

```
Limited to organization management
Sidebar: Ringkasan | Tim | Event | Konten
```

### Visible Actions (Organization Context)

- View organization overview
- View team members (read-only)
- View events
- View content
- Edit organization profile (limited)

### Hidden Actions

- Invite team members
- Assign roles
- Delete organization
- Organization settings
- Insight analytics

---

## 8. Platform Admin

### Menu

```
Admin Panel with limited items
Sidebar: Dashboard | Persetujuan (Komunitas, Organisasi) | Event | Laporan | Analitik
```

### Dashboard Widgets

- Platform stats: Total users, communities, events, reports
- Pending approvals count
- Recent activity table
- Quick actions

### Visible Actions

- View/approve/reject communities
- View/approve/reject organizations
- View/approve/reject events
- View/resolve/dismiss reports
- View analytics
- View users (read-only)

### Hidden Actions

- User management CRUD
- Role management
- Category management
- Audit log
- Platform settings

---

## 9. Super Admin

### Menu

```
Full Admin Panel
Sidebar: Dashboard | Pengguna | Role | Persetujuan (Komunitas, Organisasi) | Event | Kategori | Laporan | Analitik | Log Audit | Pengaturan
```

### Dashboard Widgets

- Full platform stats
- Growth charts
- Recent activity table
- Quick actions

### Visible Actions

- All Platform Admin actions
- User CRUD (create, edit, suspend, activate, ban)
- Role CRUD
- Category CRUD
- Audit log view with filters
- Platform settings management
- Export data

### Hidden Components

- None (full access)

---

## Role-Based Route Protection

### Public Routes (No Auth)

```
/ → Any
/about → Any
/communities → Any
/communities/[slug] → Any
/organizations → Any
/organizations/[slug] → Any
/events → Any
/events/[slug] → Any
/faq → Any
/contact → Any
/terms → Any
/privacy → Any
/community-guideline → Any
/event-guideline → Any
```

### Auth Routes (Redirect if Authed)

```
/login → Redirect to /app if authed
/register → Redirect to /app if authed
/forgot-password → Any
/reset-password → Any
```

### Member Routes (MEMBER+)

```
/app → MEMBER+
/app/profile → MEMBER+
/app/interests → MEMBER+
/app/communities → MEMBER+
/app/communities/create → MEMBER+
/app/organizations → MEMBER+
/app/organizations/create → MEMBER+
/app/events → MEMBER+
/app/notifications → MEMBER+
/app/activity → MEMBER+
/app/bookmarks → MEMBER+
/app/reports → MEMBER+
/app/settings → MEMBER+
```

### Community Routes (COMMUNITY_OWNER/ADMIN/MODERATOR/MEMBER)

```
/app/community/[id]/overview → COMMUNITY_OWNER/ADMIN/MODERATOR/MEMBER
/app/community/[id]/profile → COMMUNITY_OWNER
/app/community/[id]/members → COMMUNITY_OWNER/ADMIN
/app/community/[id]/join-requests → COMMUNITY_OWNER/ADMIN
/app/community/[id]/roles → COMMUNITY_OWNER
/app/community/[id]/events → COMMUNITY_OWNER/ADMIN
/app/community/[id]/events/create → COMMUNITY_OWNER/ADMIN
/app/community/[id]/participants → COMMUNITY_OWNER/ADMIN/EVENT_MANAGER
/app/community/[id]/posts → COMMUNITY_OWNER/ADMIN/MEMBER
/app/community/[id]/posts/create → COMMUNITY_OWNER/ADMIN/MEMBER
/app/community/[id]/reports → COMMUNITY_OWNER/ADMIN
/app/community/[id]/settings → COMMUNITY_OWNER
```

### Organization Routes (ORG_OWNER/ADMIN/MEMBER)

```
/app/organization/[id]/overview → ORG_OWNER/ADMIN/MEMBER
/app/organization/[id]/profile → ORG_OWNER
/app/organization/[id]/team → ORG_OWNER
/app/organization/[id]/events → ORG_OWNER/ADMIN
/app/organization/[id]/events/create → ORG_OWNER/ADMIN
/app/organization/[id]/participants → ORG_OWNER/ADMIN
/app/organization/[id]/content → ORG_OWNER/ADMIN
/app/organization/[id]/content/create → ORG_OWNER/ADMIN
/app/organization/[id]/insight → ORG_OWNER
/app/organization/[id]/settings → ORG_OWNER
```

### Admin Routes (SUPER_ADMIN/PLATFORM_ADMIN)

```
/admin → SUPER_ADMIN/PLATFORM_ADMIN
/admin/users → SUPER_ADMIN/PLATFORM_ADMIN
/admin/users/[id] → SUPER_ADMIN/PLATFORM_ADMIN
/admin/roles → SUPER_ADMIN
/admin/roles/[id] → SUPER_ADMIN
/admin/community-approval → PLATFORM_ADMIN
/admin/community-approval/[id] → PLATFORM_ADMIN
/admin/organization-approval → PLATFORM_ADMIN
/admin/organization-approval/[id] → PLATFORM_ADMIN
/admin/events → PLATFORM_ADMIN
/admin/events/[id] → PLATFORM_ADMIN
/admin/categories → SUPER_ADMIN
/admin/categories/[id] → SUPER_ADMIN
/admin/reports → PLATFORM_ADMIN
/admin/reports/[id] → PLATFORM_ADMIN
/admin/analytics → SUPER_ADMIN
/admin/audit-log → SUPER_ADMIN
/admin/settings → SUPER_ADMIN
```
