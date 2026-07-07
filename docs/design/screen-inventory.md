# Screen Inventory — KomunaID MVP

## Public Screens

| #   | Screen                 | Route                   | Purpose                              | Target Role | Layout                   | Permission |
| --- | ---------------------- | ----------------------- | ------------------------------------ | ----------- | ------------------------ | ---------- |
| 1   | Landing Page           | `/`                     | Hero, fitur, statistik, CTA          | Guest       | Public (navbar + footer) | Any        |
| 2   | About                  | `/about`                | Cerita, misi, visi KomunaID          | Guest       | Public (navbar + footer) | Any        |
| 3   | Community Directory    | `/communities`          | List/grid komunitas, filter, search  | Guest       | Public (navbar + footer) | Any        |
| 4   | Community Detail       | `/communities/[slug]`   | Profil komunitas, join button        | Guest       | Public (navbar + footer) | Any        |
| 5   | Organization Directory | `/organizations`        | List/grid organisasi, filter, search | Guest       | Public (navbar + footer) | Any        |
| 6   | Organization Detail    | `/organizations/[slug]` | Profil organisasi                    | Guest       | Public (navbar + footer) | Any        |
| 7   | Event Directory        | `/events`               | List/grid event, filter, search      | Guest       | Public (navbar + footer) | Any        |
| 8   | Event Detail           | `/events/[slug]`        | Info event, register button          | Guest       | Public (navbar + footer) | Any        |
| 9   | FAQ                    | `/faq`                  | Pertanyaan umum                      | Guest       | Public (navbar + footer) | Any        |
| 10  | Contact                | `/contact`              | Form kontak                          | Guest       | Public (navbar + footer) | Any        |
| 11  | Terms                  | `/terms`                | Syarat & ketentuan                   | Guest       | Public (navbar + footer) | Any        |
| 12  | Privacy                | `/privacy`              | Kebijakan privasi                    | Guest       | Public (navbar + footer) | Any        |
| 13  | Community Guideline    | `/community-guideline`  | Panduan komunitas                    | Guest       | Public (navbar + footer) | Any        |
| 14  | Event Guideline        | `/event-guideline`      | Panduan event                        | Guest       | Public (navbar + footer) | Any        |

## Auth Screens

| #   | Screen          | Route              | Purpose                 | Target Role | Layout               | Permission |
| --- | --------------- | ------------------ | ----------------------- | ----------- | -------------------- | ---------- |
| 15  | Login           | `/login`           | Form masuk              | Guest       | Auth (centered form) | Any        |
| 16  | Register        | `/register`        | Form daftar (3 langkah) | Guest       | Auth (centered form) | Any        |
| 17  | Forgot Password | `/forgot-password` | Input email reset       | Guest       | Auth (centered form) | Any        |
| 18  | Reset Password  | `/reset-password`  | Form password baru      | Guest       | Auth (centered form) | Any        |

## Member Dashboard Screens

| #   | Screen              | Route                       | Purpose                            | Target Role | Layout                       | Permission |
| --- | ------------------- | --------------------------- | ---------------------------------- | ----------- | ---------------------------- | ---------- |
| 19  | Dashboard Home      | `/app`                      | Ringkasan profil, komunitas, event | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 20  | Profile             | `/app/profile`              | Edit profil, avatar                | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 21  | Interests           | `/app/interests`            | Pilih minat & preferensi           | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 22  | My Communities      | `/app/communities`          | Daftar komunitas diikuti/dimiliki  | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 23  | Create Community    | `/app/communities/create`   | Buat komunitas baru                | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 24  | My Organizations    | `/app/organizations`        | Daftar organisasi dimiliki         | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 25  | Create Organization | `/app/organizations/create` | Buat organisasi baru               | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 26  | My Events           | `/app/events`               | Daftar event diikuti/dibuat        | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 27  | Notifications       | `/app/notifications`        | Daftar notifikasi                  | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 28  | Activity            | `/app/activity`             | Riwayat aktivitas                  | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 29  | Bookmarks           | `/app/bookmarks`            | Daftar bookmark komunitas          | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 30  | My Reports          | `/app/reports`              | Laporan yang diajukan              | Member      | Dashboard (sidebar + header) | MEMBER+    |
| 31  | Settings            | `/app/settings`             | Ubah password, pengaturan          | Member      | Dashboard (sidebar + header) | MEMBER+    |

## Community Management Screens

| #   | Screen                 | Route                               | Purpose                        | Target Role                         | Layout                       | Permission                          |
| --- | ---------------------- | ----------------------------------- | ------------------------------ | ----------------------------------- | ---------------------------- | ----------------------------------- |
| 32  | Community Overview     | `/app/community/[id]/overview`      | Ringkasan komunitas            | Community Owner/Admin               | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN               |
| 33  | Community Profile      | `/app/community/[id]/profile`       | Edit profil komunitas          | Community Owner                     | Dashboard (sidebar + header) | COMMUNITY_OWNER                     |
| 34  | Community Members      | `/app/community/[id]/members`       | Daftar anggota, search, filter | Community Owner/Admin               | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN               |
| 35  | Join Requests          | `/app/community/[id]/join-requests` | Permintaan bergabung pending   | Community Owner/Admin               | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN               |
| 36  | Community Roles        | `/app/community/[id]/roles`         | Role & permission management   | Community Owner                     | Dashboard (sidebar + header) | COMMUNITY_OWNER                     |
| 37  | Community Events       | `/app/community/[id]/events`        | Daftar event komunitas         | Community Owner/Admin               | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN               |
| 38  | Create Community Event | `/app/community/[id]/events/create` | Buat event baru                | Community Owner/Admin               | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN               |
| 39  | Community Participants | `/app/community/[id]/participants`  | Peserta event komunitas        | Community Owner/Admin/Event Manager | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN/EVENT_MANAGER |
| 40  | Community Posts        | `/app/community/[id]/posts`         | Daftar postingan               | Community Owner/Admin               | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN               |
| 41  | Create Post            | `/app/community/[id]/posts/create`  | Buat postingan baru            | Community Owner/Admin/Member        | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN/MEMBER        |
| 42  | Community Reports      | `/app/community/[id]/reports`       | Laporan konten komunitas       | Community Owner/Admin               | Dashboard (sidebar + header) | COMMUNITY_OWNER/ADMIN               |
| 43  | Community Settings     | `/app/community/[id]/settings`      | Pengaturan komunitas           | Community Owner                     | Dashboard (sidebar + header) | COMMUNITY_OWNER                     |

## Organization Management Screens

| #   | Screen                    | Route                                   | Purpose                    | Target Role              | Layout                       | Permission      |
| --- | ------------------------- | --------------------------------------- | -------------------------- | ------------------------ | ---------------------------- | --------------- |
| 44  | Organization Overview     | `/app/organization/[id]/overview`       | Ringkasan organisasi       | Organization Owner/Admin | Dashboard (sidebar + header) | ORG_OWNER/ADMIN |
| 45  | Organization Profile      | `/app/organization/[id]/profile`        | Edit profil organisasi     | Organization Owner       | Dashboard (sidebar + header) | ORG_OWNER       |
| 46  | Organization Team         | `/app/organization/[id]/team`           | Daftar tim, undang anggota | Organization Owner       | Dashboard (sidebar + header) | ORG_OWNER       |
| 47  | Organization Events       | `/app/organization/[id]/events`         | Daftar event organisasi    | Organization Owner/Admin | Dashboard (sidebar + header) | ORG_OWNER/ADMIN |
| 48  | Create Org Event          | `/app/organization/[id]/events/create`  | Buat event baru            | Organization Owner/Admin | Dashboard (sidebar + header) | ORG_OWNER/ADMIN |
| 49  | Organization Participants | `/app/organization/[id]/participants`   | Peserta event organisasi   | Organization Owner/Admin | Dashboard (sidebar + header) | ORG_OWNER/ADMIN |
| 50  | Organization Content      | `/app/organization/[id]/content`        | Daftar konten              | Organization Owner/Admin | Dashboard (sidebar + header) | ORG_OWNER/ADMIN |
| 51  | Create Org Content        | `/app/organization/[id]/content/create` | Buat konten baru           | Organization Owner/Admin | Dashboard (sidebar + header) | ORG_OWNER/ADMIN |
| 52  | Organization Insight      | `/app/organization/[id]/insight`        | Analitik & metrik          | Organization Owner       | Dashboard (sidebar + header) | ORG_OWNER       |
| 53  | Organization Settings     | `/app/organization/[id]/settings`       | Pengaturan organisasi      | Organization Owner       | Dashboard (sidebar + header) | ORG_OWNER       |

## Admin Screens

| #   | Screen                       | Route                               | Purpose                           | Target Role                | Layout                        | Permission                 |
| --- | ---------------------------- | ----------------------------------- | --------------------------------- | -------------------------- | ----------------------------- | -------------------------- |
| 54  | Admin Dashboard              | `/admin`                            | Statistik platform, quick actions | Platform Admin/Super Admin | Admin (dark sidebar + header) | PLATFORM_ADMIN/SUPER_ADMIN |
| 55  | User Management              | `/admin/users`                      | Daftar pengguna, search, filter   | Platform Admin/Super Admin | Admin (dark sidebar + header) | PLATFORM_ADMIN/SUPER_ADMIN |
| 56  | User Detail                  | `/admin/users/[id]`                 | Detail profil pengguna            | Platform Admin/Super Admin | Admin (dark sidebar + header) | PLATFORM_ADMIN/SUPER_ADMIN |
| 57  | Role Management              | `/admin/roles`                      | Daftar role, CRUD                 | Super Admin                | Admin (dark sidebar + header) | SUPER_ADMIN                |
| 58  | Role Detail                  | `/admin/roles/[id]`                 | Detail role & permission          | Super Admin                | Admin (dark sidebar + header) | SUPER_ADMIN                |
| 59  | Community Approval           | `/admin/community-approval`         | Komunitas pending approval        | Platform Admin             | Admin (dark sidebar + header) | PLATFORM_ADMIN             |
| 60  | Community Approval Detail    | `/admin/community-approval/[id]`    | Review komunitas                  | Platform Admin             | Admin (dark sidebar + header) | PLATFORM_ADMIN             |
| 61  | Organization Approval        | `/admin/organization-approval`      | Organisasi pending approval       | Platform Admin             | Admin (dark sidebar + header) | PLATFORM_ADMIN             |
| 62  | Organization Approval Detail | `/admin/organization-approval/[id]` | Review organisasi                 | Platform Admin             | Admin (dark sidebar + header) | PLATFORM_ADMIN             |
| 63  | Admin Events                 | `/admin/events`                     | Daftar event, approval            | Platform Admin             | Admin (dark sidebar + header) | PLATFORM_ADMIN             |
| 64  | Admin Event Detail           | `/admin/events/[id]`                | Review event                      | Platform Admin             | Admin (dark sidebar + header) | PLATFORM_ADMIN             |
| 65  | Categories                   | `/admin/categories`                 | CRUD kategori                     | Super Admin                | Admin (dark sidebar + header) | SUPER_ADMIN                |
| 66  | Category Detail              | `/admin/categories/[id]`            | Detail kategori                   | Super Admin                | Admin (dark sidebar + header) | SUPER_ADMIN                |
| 67  | Reports                      | `/admin/reports`                    | Laporan moderasi                  | Platform Admin             | Admin (dark sidebar + header) | PLATFORM_ADMIN             |
| 68  | Report Detail                | `/admin/reports/[id]`               | Review laporan                    | Platform Admin             | Admin (dark sidebar + header) | PLATFORM_ADMIN             |
| 69  | Analytics                    | `/admin/analytics`                  | Analitik platform                 | Super Admin                | Admin (dark sidebar + header) | SUPER_ADMIN                |
| 70  | Audit Log                    | `/admin/audit-log`                  | Log aktivitas                     | Super Admin                | Admin (dark sidebar + header) | SUPER_ADMIN                |
| 71  | Admin Settings               | `/admin/settings`                   | Pengaturan platform               | Super Admin                | Admin (dark sidebar + header) | SUPER_ADMIN                |

## Error Screens

| #   | Screen           | Route          | Purpose                 | Target Role | Layout     | Permission |
| --- | ---------------- | -------------- | ----------------------- | ----------- | ---------- | ---------- |
| 72  | 403 Forbidden    | `/403`         | Akses ditolak           | Any         | Error page | Any        |
| 73  | 404 Not Found    | `/404`         | Halaman tidak ditemukan | Any         | Error page | Any        |
| 74  | 500 Server Error | `/500`         | Server error            | Any         | Error page | Any        |
| 75  | Maintenance      | `/maintenance` | Maintenance mode        | Any         | Error page | Any        |

## Screen Summary

| Area                    | Count  |
| ----------------------- | :----: |
| Public                  |   14   |
| Auth                    |   4    |
| Member Dashboard        |   13   |
| Community Management    |   12   |
| Organization Management |   10   |
| Admin                   |   18   |
| Error                   |   4    |
| **Total**               | **75** |
