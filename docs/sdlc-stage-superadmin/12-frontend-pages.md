# 12 — Frontend Pages: Admin Dashboard

> KomunaID Super Admin MVP — Platform Governance Module

Framework: Next.js 15 App Router, React 19, Tailwind CSS, Shadcn/UI

---

## Struktur Routing

```
apps/web/app/(admin)/
├── layout.tsx                          # Admin layout (sidebar + topbar)
├── page.tsx                            # Dashboard utama
├── users/
│   ├── page.tsx                        # Daftar pengguna
│   └── [userId]/
│       └── page.tsx                    # Detail pengguna
├── communities/
│   ├── page.tsx                        # Daftar komunitas
│   ├── review-queue/
│   │   └── page.tsx                    # Antrian review
│   └── [communityId]/
│       └── page.tsx                    # Detail komunitas
├── events/
│   ├── page.tsx                        # Daftar event
│   └── [eventId]/
│       ├── page.tsx                    # Detail event
│       └── registrations/
│           └── page.tsx                # Pendaftar event
├── volunteers/
│   ├── page.tsx                        # Daftar relawan
│   └── [volunteerId]/
│       ├── page.tsx                    # Detail relawan
│       └── applications/
│           └── page.tsx                # Lamaran relawan
├── reports/
│   ├── page.tsx                        # Daftar laporan
│   └── [reportId]/
│       └── page.tsx                    # Detail laporan
├── cms/
│   ├── pages/
│   │   ├── page.tsx                    # Daftar halaman CMS
│   │   ├── new/
│   │   │   └── page.tsx               # Buat halaman baru
│   │   └── [pageId]/
│   │       └── edit/
│   │           └── page.tsx           # Edit halaman CMS
│   └── banners/
│       ├── page.tsx                    # Daftar banner
│       ├── new/
│       │   └── page.tsx               # Buat banner baru
│       └── [bannerId]/
│           └── edit/
│               └── page.tsx           # Edit banner
├── categories/
│   └── page.tsx                        # Manajemen kategori
├── master-data/
│   ├── page.tsx                        # Hub master data
│   ├── provinces/
│   │   └── page.tsx                    # Data provinsi
│   ├── cities/
│   │   └── page.tsx                    # Data kota
│   ├── countries/
│   │   └── page.tsx                    # Data negara
│   ├── districts/
│   │   └── page.tsx                    # Data kecamatan
│   ├── kelurahan/
│   │   └── page.tsx                    # Data kelurahan
│   ├── interests/
│   │   └── page.tsx                    # Data minat
│   └── tags/
│       └── page.tsx                    # Data tag
├── audit-logs/
│   ├── page.tsx                        # Log audit sistem
│   └── user/
│       └── [userId]/
│           └── page.tsx               # Log audit per pengguna
├── notifications/
│   ├── page.tsx                        # Daftar notifikasi
│   ├── broadcast/
│   │   └── page.tsx                    # Kirim broadcast
│   └── templates/
│       ├── page.tsx                    # Daftar template
│       ├── new/
│       │   └── page.tsx               # Buat template baru
│       └── [templateId]/
│           └── edit/
│               └── page.tsx           # Edit template
├── settings/
│   ├── page.tsx                        # Pengaturan umum
│   └── platform/
│       └── general/
│           └── page.tsx               # Pengaturan platform
└── security/
    ├── page.tsx                        # Hub keamanan
    ├── login-history/
    │   └── page.tsx                    # Riwayat login
    ├── failed-logins/
    │   └── page.tsx                    # Login gagal
    ├── suspicious-activity/
    │   └── page.tsx                    # Aktivitas mencurigakan
    └── locked-users/
        └── page.tsx                    # Pengguna terkunci
```

---

## Detail Halaman

### 1. Dashboard Utama

| Field | Value |
|-------|-------|
| URL | `/admin` |
| Komponen | `AdminDashboardPage` |
| Deskripsi | Ringkasan platform: total pengguna, komunitas, event, laporan aktif, grafik pertumbuhan |

**Komponen:**
- `StatCard` — Kartu statistik (total users, communities, events, reports)
- `GrowthChart` — Grafik pertumbuhan (harian/mingguan/bulanan)
- `RecentActivityFeed` — Feed aktivitas terbaru
- `QuickActions` — Tombol aksi cepat (kirim broadcast, review queue)

---

### 2. Users Management

#### Daftar Pengguna

| Field | Value |
|-------|-------|
| URL | `/admin/users` |
| Komponen | `UsersListPage` |
| Deskripsi | Tabel daftar pengguna dengan pencarian, filter role/status, sorting, pagination |

**Komponen:**
- `UsersTable` — Tabel data pengguna
- `UsersFilters` — Filter pencarian, role, status
- `UserStatusBadge` — Badge status (Active, Suspended, Archived)
- `UserRoleBadge` — Badge role (Super Admin, Community Admin, User)
- `UserActionsDropdown` — Dropdown aksi (suspend, activate, archive, change role, reset password)

#### Detail Pengguna

| Field | Value |
|-------|-------|
| URL | `/admin/users/:userId` |
| Komponen | `UserDetailPage` |
| Deskripsi | Profil lengkap pengguna, komunitas terdaftar, aktivitas, audit logs |

**Komponen:**
- `UserProfileCard` — Kartu profil dengan avatar, nama, email
- `UserActivityLog` — Log aktivitas pengguna
- `UserCommunitiesList` — Daftar komunitas yang diikuti
- `UserSecurityInfo` — Info keamanan (terakhir login, sesi aktif)
- `UserActionPanel` — Panel aksi admin

---

### 3. Communities Management

#### Daftar Komunitas

| Field | Value |
|-------|-------|
| URL | `/admin/communities` |
| Komponen | `CommunitiesListPage` |
| Deskripsi | Tabel daftar komunitas dengan filter status, pencarian |

**Komponen:**
- `CommunitiesTable` — Tabel data komunitas
- `CommunityStatusBadge` — Badge status (Active, Suspended, Pending, Rejected)
- `CommunityActionsDropdown` — Dropdown aksi (approve, suspend, restore, reject, request revision)

#### Antrian Review

| Field | Value |
|-------|-------|
| URL | `/admin/communities/review-queue` |
| Komponen | `CommunityReviewQueuePage` |
| Deskripsi | Daftar komunitas yang menunggu persetujuan, lengkap dengan dokumen |

**Komponen:**
- `ReviewQueueList` — Daftar antrian review
- `CommunityDocumentsPreview` — Preview dokumen yang diunggah
- `ApprovalDialog` — Dialog konfirmasi persetujuan
- `RejectionDialog` — Dialog penolakan dengan alasan
- `RevisionRequestDialog` — Dialog permintaan revisi

#### Detail Komunitas

| Field | Value |
|-------|-------|
| URL | `/admin/communities/:communityId` |
| Komponen | `CommunityDetailPage` |
| Deskripsi | Detail komunitas, daftar anggota, event terkait |

**Komponen:**
- `CommunityProfileCard` — Kartu profil komunitas
- `CommunityMembersList` — Daftar anggota
- `CommunityEventsList` — Daftar event komunitas
- `CommunityActionPanel` — Panel aksi admin

---

### 4. Events Management

#### Daftar Event

| Field | Value |
|-------|-------|
| URL | `/admin/events` |
| Komponen | `EventsListPage` |
| Deskripsi | Tabel daftar event dengan filter status, tanggal, komunitas |

**Komponen:**
- `EventsTable` — Tabel data event
- `EventStatusBadge` — Badge status (Draft, Published, Suspended, Cancelled, Archived)
- `EventActionsDropdown` — Dropdown aksi (publish, suspend, cancel, archive, soft-delete)

#### Detail Event

| Field | Value |
|-------|-------|
| URL | `/admin/events/:eventId` |
| Komponen | `EventDetailPage` |
| Deskripsi | Detail event, info pendaftaran, aksi admin |

**Komponen:**
- `EventProfileCard` — Kartu profil event
- `EventRegistrationStats` — Statistik pendaftaran
- `EventActionPanel` — Panel aksi admin

#### Pendaftar Event

| Field | Value |
|-------|-------|
| URL | `/admin/events/:eventId/registrations` |
| Komponen | `EventRegistrationsPage` |
| Deskripsi | Daftar pendaftar event dengan status kehadiran |

**Komponen:**
- `RegistrationsTable` — Tabel pendaftar
- `RegistrationStatusBadge` — Badge status (Confirmed, Pending, Attended, Cancelled)
- `RegistrationExportButton` — Tombol ekspor data

---

### 5. Volunteers Management

#### Daftar Relawan

| Field | Value |
|-------|-------|
| URL | `/admin/volunteers` |
| Komponen | `VolunteersListPage` |
| Deskripsi | Tabel daftar relawan dengan filter skill, status, rating |

**Komponen:**
- `VolunteersTable` — Tabel data relawan
- `VolunteerStatusBadge` — Badge status (Active, Suspended, Archived)
- `VolunteerSkillsBadge` — Badge skill relawan
- `VolunteerActionsDropdown` — Dropdown aksi (suspend, archive, soft-delete, restore)

#### Detail Relawan

| Field | Value |
|-------|-------|
| URL | `/admin/volunteers/:volunteerId` |
| Komponen | `VolunteerDetailPage` |
| Deskripsi | Profil relawan, riwayat kegiatan, lamaran, statistik jam kerja |

**Komponen:**
- `VolunteerProfileCard` — Kartu profil relawan
- `VolunteerStatsCard` — Statistik (jam kerja, event selesai, rating)
- `VolunteerApplicationsList` — Daftar lamaran
- `VolunteerActionPanel` — Panel aksi admin

#### Lamaran Relawan

| Field | Value |
|-------|-------|
| URL | `/admin/volunteers/:volunteerId/applications` |
| Komponen | `VolunteerApplicationsPage` |
| Deskripsi | Daftar lamaran relawan dengan aksi approve/reject |

**Komponen:**
- `ApplicationsTable` — Tabel lamaran
- `ApplicationStatusBadge` — Badge status (Pending, Approved, Rejected)
- `ApprovalDialog` — Dialog persetujuan
- `RejectionDialog` — Dialog penolakan

---

### 6. Reports Management

| Field | Value |
|-------|-------|
| URL | `/admin/reports` |
| Komponen | `ReportsListPage` |
| Deskripsi | Tabel daftar laporan dengan filter tipe, severity, status |

**Komponen:**
- `ReportsTable` — Tabel data laporan
- `ReportTypeBadge` — Badge tipe (Spam, Abuse, Inappropriate Content, Other)
- `ReportSeverityBadge` — Badge severity (Low, Medium, High, Critical)
- `ReportStatusBadge` — Badge status (Pending, Under Review, Resolved)
- `ReportActionsDropdown` — Dropdown aksi (resolve, under-review, warn)

#### Detail Laporan

| Field | Value |
|-------|-------|
| URL | `/admin/reports/:reportId` |
| Komponen | `ReportDetailPage` |
| Deskripsi | Detail laporan, info pelapor & target, aksi admin |

**Komponen:**
- `ReportDetailCard` — Detail laporan
- `ReporterInfoCard` — Info pelapor
- `TargetInfoCard` — Info target laporan
- `ReportActionPanel` — Panel aksi (resolve, warn, under-review)
- `ResolutionForm` — Form penyelesaian laporan

---

### 7. CMS Management

#### Daftar Halaman CMS

| Field | Value |
|-------|-------|
| URL | `/admin/cms/pages` |
| Komponen | `CmsPagesListPage` |
| Deskripsi | Tabel daftar halaman CMS dengan aksi CRUD |

**Komponen:**
- `CmsPagesTable` — Tabel halaman
- `PageStatusBadge` — Badge status (Draft, Published)
- `PageActionsDropdown` — Dropdown aksi (edit, delete)

#### Buat/Edit Halaman CMS

| Field | Value |
|-------|-------|
| URL | `/admin/cms/pages/new` dan `/admin/cms/pages/:pageId/edit` |
| Komponen | `CmsPageEditorPage` |
| Deskripsi | Editor halaman CMS dengan rich text editor |

**Komponen:**
- `CmsPageForm` — Form pembuatan/edit halaman
- `RichTextEditor` — Editor konten (TipTap / Lexical)
- `SeoFieldsGroup` — Fields SEO (meta title, meta description)
- `PagePreview` — Preview halaman

#### Daftar Banner

| Field | Value |
|-------|-------|
| URL | `/admin/cms/banners` |
| Komponen | `CmsBannersListPage` |
| Deskripsi | Tabel daftar banner dengan preview gambar |

**Komponen:**
- `BannersTable` — Tabel banner
- `BannerPreview` — Preview gambar banner
- `BannerStatusBadge` — Badge status (Active, Inactive)
- `BannerPositionBadge` — Badge posisi (Home Top, Home Middle, Sidebar)

#### Buat/Edit Banner

| Field | Value |
|-------|-------|
| URL | `/admin/cms/banners/new` dan `/admin/cms/banners/:bannerId/edit` |
| Komponen | `CmsBannerEditorPage` |
| Deskripsi | Form pembuatan/edit banner dengan upload gambar |

**Komponen:**
- `CmsBannerForm` — Form banner
- `ImageUploadField` — Upload gambar banner
- `DateRangePicker` — Pilih rentang tanggal tampil
- `PositionSelector` — Pilih posisi banner

---

### 8. Categories Management

| Field | Value |
|-------|-------|
| URL | `/admin/categories` |
| Komponen | `CategoriesPage` |
| Deskripsi | Manajemen kategori komunitas dan event dengan drag-to-reorder |

**Komponen:**
- `CategoriesList` — Daftar kategori
- `CategoryFormDialog` — Dialog form tambah/edit kategori
- `CategoryTypeTab` — Tab tipe (Community, Event)
- `DraggableCategoryItem` — Item kategori draggable untuk reorder
- `DeleteConfirmDialog` — Dialog konfirmasi hapus

---

### 9. Master Data

#### Hub Master Data

| Field | Value |
|-------|-------|
| URL | `/admin/master-data` |
| Komponen | `MasterDataHubPage` |
| Deskripsi | Dashboard navigasi ke setiap jenis master data |

**Komponen:**
- `MasterDataGrid` — Grid kartu navigasi (Provinsi, Kota, Negara, dll.)

#### Halaman Master Data per Jenis

| Field | Value |
|-------|-------|
| URL | `/admin/master-data/{provinces|cities|countries|districts|kelurahan|interests|tags}` |
| Komponen | `MasterDataListPage` |
| Deskripsi | Tabel data master dengan inline editing dan bulk update |

**Komponen (dinamis berdasarkan jenis):**
- `MasterDataTable` — Tabel data master
- `MasterDataInlineEditor` — Inline editor untuk edit cepat
- `BulkUpdateButton` — Tombol bulk update dari sumber eksternal
- `MasterDataSearchFilter` — Filter pencarian

---

### 10. Audit Logs

#### Log Audit Sistem

| Field | Value |
|-------|-------|
| URL | `/admin/audit-logs` |
| Komponen | `AuditLogsPage` |
| Deskripsi | Log semua aksi admin di sistem dengan filter tanggal, aksi, entity |

**Komponen:**
- `AuditLogsTable` — Tabel log audit
- `AuditLogFilters` — Filter (action, entity type, date range)
- `AuditLogDetailDialog` — Detail log dengan metadata lengkap

#### Log Audit Per Pengguna

| Field | Value |
|-------|-------|
| URL | `/admin/audit-logs/user/:userId` |
| Komponen | `UserAuditLogsPage` |
| Deskripsi | Log audit spesifik untuk satu pengguna |

**Komponen:**
- `UserAuditHeader` — Header info pengguna
- `AuditLogsTable` — Tabel log audit (komponen yang sama)
- `TimelineView` — View timeline untuk riwayat aktivitas

---

### 11. Notifications

#### Daftar Notifikasi

| Field | Value |
|-------|-------|
| URL | `/admin/notifications` |
| Komponen | `NotificationsListPage` |
| Deskripsi | Daftar notifikasi yang sudah dikirim admin |

**Komponen:**
- `NotificationsTable` — Tabel notifikasi
- `NotificationTypeBadge` — Badge tipe (System Announcement, Maintenance, Policy Update)
- `NotificationStatusBadge` — Badge status (Sent, Draft, Failed)

#### Kirim Broadcast

| Field | Value |
|-------|-------|
| URL | `/admin/notifications/broadcast` |
| Komponen | `BroadcastNotificationPage` |
| Deskripsi | Form pengiriman notifikasi broadcast ke semua/target pengguna |

**Komponen:**
- `BroadcastForm` — Form broadcast
- `TargetRoleSelector` — Pilih target role
- `NotificationPreview` — Preview notifikasi
- `SendConfirmDialog` — Dialog konfirmasi kirim

#### Template Notifikasi

| Field | Value |
|-------|-------|
| URL | `/admin/notification-templates` |
| Komponen | `NotificationTemplatesPage` |
| Deskripsi | Daftar template notifikasi dengan CRUD |

**Komponen:**
- `TemplatesTable` — Tabel template
- `TemplateFormDialog` — Dialog form tambah/edit template
- `TemplatePreview` — Preview template dengan sample data

---

### 12. Settings

#### Pengaturan Umum

| Field | Value |
|-------|-------|
| URL | `/admin/settings` |
| Komponen | `SettingsPage` |
| Deskripsi | Pengaturan platform: maintenance mode, registrasi, dll. |

**Komponen:**
- `SettingsForm` — Form pengaturan
- `MaintenanceModeToggle` — Toggle mode pemeliharaan
- `RegistrationToggle` — Toggle aktivasi registrasi
- `SaveButton` — Tombol simpan dengan konfirmasi

#### Pengaturan Platform

| Field | Value |
|-------|-------|
| URL | `/admin/settings/platform/general` |
| Komponen | `PlatformGeneralSettingsPage` |
| Deskripsi | Pengaturan detail platform: nama, tagline, logo, warna, timezone |

**Komponen:**
- `PlatformSettingsForm` — Form pengaturan platform
- `LogoUploadField` — Upload logo
- `FaviconUploadField` — Upload favicon
- `ColorPickerField` — Pilih warna primary
- `TimezoneSelector` — Pilih timezone

---

### 13. Security

#### Hub Keamanan

| Field | Value |
|-------|-------|
| URL | `/admin/security` |
| Komponen | `SecurityHubPage` |
| Deskripsi | Dashboard keamanan: statistik login, aktivitas mencurigakan, pengguna terkunci |

**Komponen:**
- `SecurityStatsGrid` — Grid statistik keamanan
- `RecentSuspiciousActivity` — Aktivitas mencurigakan terbaru
- `QuickActions` — Aksi cepat (force logout, lock user)

#### Riwayat Login

| Field | Value |
|-------|-------|
| URL | `/admin/security/login-history` |
| Komponen | `LoginHistoryPage` |
| Deskripsi | Daftar riwayat login semua pengguna dengan filter tanggal dan status |

**Komponen:**
- `LoginHistoryTable` — Tabel riwayat login
- `LoginHistoryFilters` — Filter (user, date range, status)
- `LoginStatusBadge` — Badge status (Success, Failed)
- `DeviceInfoCell` — Info device & browser

#### Login Gagal

| Field | Value |
|-------|-------|
| URL | `/admin/security/failed-logins` |
| Komponen | `FailedLoginsPage` |
| Deskripsi | Daftar percobaan login gagal, potensi brute force**

**Komponen:**
- `FailedLoginsTable` — Tabel login gagal
- `BlockedIpBadge` — Badge IP terblokir
- `ForceUnlockButton` — Tombol buka kunci

#### Aktivitas Mencurigakan

| Field | Value |
|-------|-------|
| URL | `/admin/security/suspicious-activity` |
| Komponen | `SuspiciousActivityPage` |
| Deskripsi | Daftar aktivitas mencurigakan yang terdeteksi sistem**

**Komponen:**
- `SuspiciousActivityTable` — Tabel aktivitas mencurigakan
- `SeverityBadge` — Badge severity (Low, Medium, High, Critical)
- `ActivityTypeBadge` — Badge tipe aktivitas
- `ActionDialog` — Dialog aksi (lock user, force logout, dismiss)

#### Pengguna Terkunci

| Field | Value |
|-------|-------|
| URL | `/admin/security/locked-users` |
| Komponen | `LockedUsersPage` |
| Deskripsi | Daftar pengguna yang terkunci dengan opsi buka kunci**

**Komponen:**
- `LockedUsersTable` — Tabel pengguna terkunci
- `LockInfoCard` — Info penguncian (alasan, durasi, kadaluarsa)
- `UnlockButton` — Tombol buka kunci

---

## Shared Components

### Layout

| Komponen | Deskripsi |
|----------|-----------|
| `AdminSidebar` | Sidebar navigasi dengan ikon dan label |
| `AdminTopbar` | Top bar dengan breadcrumbs, notifikasi bell, avatar admin |
| `AdminLayout` | Layout wrapper (sidebar + topbar + content area) |
| `SidebarMenuItem` | Item menu sidebar dengan icon |

### UI Components (Shadcn/UI)

| Komponen | Deskripsi |
|----------|-----------|
| `DataTable` | Tabel dengan sorting, pagination, bulk select |
| `DataTablePagination` | Komponen pagination |
| `DataTableToolbar` | Toolbar pencarian & filter |
| `DataTableColumnHeader` | Header kolom dengan sort |
| `Dialog` | Dialog modal |
| `AlertDialog` | Dialog konfirmasi |
| `DropdownMenu` | Menu dropdown |
| `Badge` | Badge status |
| `Card` | Kartu container |
| `Tabs` | Tab navigasi |
| `Toast` | Notifikasi toast |
| `Form` | Form dengan validasi (React Hook Form + Zod) |
| `Select` | Dropdown select |
| `DatePicker` | Date picker |
| `Command` | Command palette (search) |

### Hooks

| Hook | Deskripsi |
|------|-----------|
| `useAdminApi` | Hook untuk fetch data admin API dengan SWR |
| `useDataTable` | Hook untuk konfigurasi tabel |
| `useDebounce` | Debounce untuk pencarian |
| `useConfirmDialog` | Hook untuk dialog konfirmasi |
| `useToast` | Hook untuk notifikasi toast |
| `usePagination` | Hook untuk pagination state |

---

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| `< 768px (mobile)` | Sidebar tersembunyi, hamburger menu, tabel scroll horizontal |
| `768px - 1024px (tablet)` | Sidebar collapsible, tabel full-width |
| `> 1024px (desktop)` | Sidebar expanded, layout dua kolom |

---

## Accessibility

- Semua interaksi keyboard-accessible (tab navigation, enter to activate)
- ARIA labels pada semua interactive elements
- Color contrast ratio minimum 4.5:1 (WCAG AA)
- Screen reader compatible dengan proper heading hierarchy
- Focus management pada dialog dan modal
