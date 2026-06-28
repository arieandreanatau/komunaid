# KomunaID — Full Audit Report

> Hasil audit menyeluruh semua modul di `app/Http/Controllers/*` dan `routes/modules/*`.
> Status: **Ada (✅)**, **Parsial (⚠️)**, **Tidak Ada (❌)**.

## 1. Public / Umum

| Area | Status | Keterangan |
|------|--------|------------|
| Homepage | ✅ | `PublicHomeController@index` → `resources/views/public/home.blade.php` (200 OK, 46 KB) |
| Search komunitas | ✅ | `GET /komunitas` + filter (q/category/region) via `PublicCommunityController@index` |
| Filter komunitas | ✅ | Query string di `komunitas.directory` |
| List komunitas | ✅ | `/komunitas` & `/communities` (alias EN) |
| Detail komunitas | ✅ | `/komunitas/{slug}` & `/communities/{slug}` |
| List event | ✅ | `/events` (200 OK) |
| Detail event | ✅ | `/events/{slug}` |
| Campaign iklan/produk | ⚠️ | `Campaign` model ada, controller `BrandOwner/CampaignController` ada, tapi tidak ada halaman public yang menampilkan campaign ke pengunjung non-login. |
| Halaman tentang kami | ✅ | `/about` (200 OK) — **namun README pakai `/tentang-kami` (404)** |
| Halaman kontak | ✅ | `/contact` (200 OK) — **namun README pakai `/hubungi-kami` (404)** |
| Blog / CMS public | ✅ | `/blog` (200) + `/blogs` + `/blog/{slug}` |
| Register entry point | ✅ | `/register` (200, Breeze) |

## 2. Authentication

| Area | Status | Catatan |
|------|--------|---------|
| Register member | ✅ | Breeze `RegisteredUserController` + throttle 30/min |
| Register komunitas | ⚠️ | Tidak ada halaman register khusus "pemilik komunitas". User harus request role lewat `RoleRequest` lalu superadmin approve. (Sesuai desain v2.) |
| Register brand | ⚠️ | Sama: lewat `RoleRequest`. |
| Register perusahaan | ⚠️ | Sama: lewat `RoleRequest`. |
| Login member | ✅ | `/login` (Breeze) |
| Login komunitas | ✅ | Via role redirect setelah login (lihat `RedirectByRoleService`) |
| Login brand/perusahaan | ✅ | Sama — redirect by role |
| Login superadmin | ✅ | **Terpisah** di `/admin/login` (`SuperadminLoginController`) — alur benar |
| Logout | ✅ | POST `/logout` |
| Forgot password | ✅ | `PasswordResetLinkController` (throttle 3/min) |
| Reset password | ✅ | `NewPasswordController` |
| Session handling | ✅ | DB session di production; file di local — konsisten |
| Redirect by role | ✅ | `RedirectByRoleService` + `User::getDashboardRoute()` |
| Middleware proteksi route | ✅ | `auth`, `active_user`, `not.banned`, `admin` (superadmin only) |
| RBAC | ✅ | Spatie — 11 role; 3 middleware aliases (`role`, `permission`, `role_or_permission`) |

## 3. Member

| Area | Status | Catatan |
|------|--------|---------|
| Dashboard | ✅ | `Member/DashboardController` |
| Profile & edit | ✅ | `Member/ProfileController` |
| Foto profile | ⚠️ | Field `avatar` ada di `users`, tidak dijumpai controller upload-nya — perlu verifikasi |
| Search komunitas | ✅ | via public route, login dapat aksi "Join" |
| Join komunitas | ✅ | `User::canJoinCommunity()` + controller `Member/CommunityJoinController` |
| Leave komunitas | ✅ | Pivot `community_members` dengan status |
| Bookmark komunitas | ✅ | `CommunityBookmark` model + migration |
| History komunitas | ✅ | `MemberHistory` & `MemberJoinHistory` |
| Search event | ✅ | Public route `/events` |
| Register event | ✅ | `EventRegistration` |
| History event | ✅ | Pivot `event_registrations` |
| Chat teman | ✅ | `Friendship` model ada; chat messaging via `AdminConversation` (reuse) |
| Chat komunitas | ⚠️ | `EventChat`/`EventChatThread` ada, tapi **chat untuk komunitas non-event** tidak eksplisit — hanya untuk event. |
| Chat event | ✅ | `EventChat` + `EventChatThread` |
| Donasi komunitas | ✅ | `Donation` model |
| Donasi event | ✅ | `EventDonation` |
| Wallet/dompet | ✅ | `Wallet` + `WalletTransaction` + `WalletService` |
| Riwayat transaksi | ✅ | `walletTransactions()` relation + controller |
| Download report | ❌ | Tidak dijumpai method `export`/`pdf` di `Member/`. Bisa berupa gap. |
| Request role tambahan | ✅ | `RoleRequest` + `RoleRequestService` |

## 4. Komunitas / Owner Komunitas

| Area | Status | Catatan |
|------|--------|---------|
| Register owner komunitas | ⚠️ | Lewat `RoleRequest` |
| Create komunitas | ✅ | `CommunityOwner/CommunityController@store` |
| Approval komunitas | ✅ | `Superadmin/ApprovalCenterController@approveCommunity` |
| Edit komunitas | ✅ | `update` |
| Upload logo/banner/foto | ✅ | field di migration; controller menyimpan ke `public` disk |
| Manage members | ✅ | `CommunityOwner/MemberController` |
| Add / Remove / Ban member | ✅ | `CommunityBan` + `ban` action |
| Assign role pengurus | ✅ | `CommunityMemberRole` + `CommunityInternalRole` |
| Assign role volunteer | ✅ | `CommunityVolunteer` |
| Masa kepengurusan | ✅ | `CommunityManagement` (period) |
| Sub komunitas | ✅ | `CommunitySubgroup` |
| Sub regional | ✅ | `CommunityRegion` |
| Thread komunitas | ⚠️ | `EventChatThread` ada; untuk komunitas generic, hanya ada via event |
| Chat komunitas | ⚠️ | Lihat catatan di atas |
| Event komunitas | ✅ | penuh (lihat Event section) |
| Donasi komunitas | ✅ | `Donation` |
| Kerja sama masuk (incoming) | ✅ | `CommunityOwner/ProposalController` |
| Pengajuan kerja sama keluar | ✅ | `BrandOwner/ProposalController` + `CommunityOwner/ProposalController` (outgoing) |
| Dashboard komunitas | ✅ | `CommunityOwner/DashboardController` |
| Report komunitas | ✅ | `superadmin.communities.export`; komunitas owner — perlu dicek apakah ada halaman report untuk owner |

## 5. Event

| Area | Status | Catatan |
|------|--------|---------|
| Create event oleh komunitas | ✅ | `CommunityOwner/EventController` |
| Create event oleh brand/perusahaan | ❌ | Belum dijumpai route/controller terpisah |
| Event gratis untuk member | ✅ | field `is_free` di `events` |
| Event gratis untuk public | ✅ | `visibility` enum |
| Event berbayar | ✅ | `EventRegistration.payment_status` |
| Event kolaborasi | ✅ | lewat `CollaborationProposal` |
| Event campaign | ✅ | `CommunityCampaign` & `CommunityCampaignApplication` |
| Tap-in brand/perusahaan | ⚠️ | Tidak dijumpai model/entitas eksplisit. Donation + collaboration proposal menutupi sebagian. |
| Open volunteer event | ✅ | `EventVolunteerCampaign` |
| Registrasi volunteer | ✅ | `EventVolunteerApplication` |
| Gallery event | ✅ | `EventGallery` + upload |
| Chat event | ✅ | `EventChat` |
| Thread event | ✅ | `EventChatThread` |
| Kuota event | ✅ | `quota` field di `events` |
| Payment event | ✅ | `EventPaymentConfirmation` (manual, **tanpa gateway**) |
| Platform fee event | ✅ | `PlatformFee` + `PlatformFeeService` |
| Status event | ✅ | `EventStatus` (approved/draft/cancelled/completed) |
| Cancel event | ✅ | `Superadmin/EventController@cancel` + `CommunityOwner` |
| Event report | ✅ | `superadmin.events.export` |
| Attendance/check-in | ❌ | **Tidak ada modul QR check-in** (sesuai Known Issues) |

## 6. Brand / Owner Brand

| Area | Status | Catatan |
|------|--------|---------|
| Register owner brand | ⚠️ | Lewat `RoleRequest` |
| Create brand | ✅ | `BrandOwner/BrandController` |
| Approval brand | ✅ | `Superadmin/BrandController@approve` |
| Edit brand profile | ✅ | `BrandController@update` |
| Brand under company / independent | ✅ | `companies` FK di `brands` |
| Product management | ⚠️ | Model `Brand` ada, tetapi tidak dijumpai tabel `products` eksplisit. Fitur campaign menutupi. |
| Product category | ❌ | Tidak ada master data / migration untuk `product_categories` |
| Campaign iklan | ✅ | `Campaign` model + `BrandOwner/CampaignController` |
| Campaign penjualan | ⚠️ | Sama dengan campaign iklan; tidak ada `sale` flag |
| Campaign ke komunitas | ✅ | `CommunityCampaignApplication` |
| Permintaan kerja sama dari komunitas | ✅ | `CommunityOwner/ProposalController` incoming |
| Pengajuan kerja sama ke komunitas | ✅ | `BrandOwner/ProposalController` outgoing |
| Kerja sama dengan brand lain | ⚠️ | Tidak dijumpai; hanya community↔brand |
| Dashboard brand | ✅ | `BrandOwner/DashboardController` |
| Report brand | ✅ | `superadmin.brands.export` |
| Manage admin/karyawan brand | ✅ | `BrandMember` |
| Role karyawan/magang brand | ✅ | `BrandMember.role` enum |

## 7. Perusahaan / Owner Perusahaan

| Area | Status | Catatan |
|------|--------|---------|
| Register owner perusahaan | ⚠️ | Lewat `RoleRequest` |
| Create perusahaan | ✅ | `CompanyOwner/CompanyController` |
| Approval perusahaan | ✅ | `Superadmin/CompanyController@approve` (suspend, ban, verify) |
| Edit profile perusahaan | ✅ | `update` |
| Add existing brand under company | ✅ | `Brand.company_id` |
| Create new brand under company | ✅ | Brand creation flow allows `company_id` |
| Product by brand | ⚠️ | Lihat catatan Brand |
| CSR campaign | ⚠️ | Tidak ada modul `Csrcampaign` eksplisit; gunakan `Campaign` + `CollaborationProposal` (CSR tidak terpisah) |
| Collaboration request | ✅ | `CollaborationProposal` |
| Job vacancy/campaign lowongan | ❌ | Tidak ada |
| Manage karyawan perusahaan | ✅ | `CompanyBrandMember` |
| Manage magang perusahaan | ⚠️ | `CompanyBrandMember.role` bisa 'intern' (perlu verifikasi enum) |
| Dashboard perusahaan | ✅ | `CompanyOwner/DashboardController` |
| Report perusahaan | ✅ | `superadmin.companies.export` |

## 8. Superadmin

| Area | Status | Catatan |
|------|--------|---------|
| Login superadmin | ✅ | `/admin/login` |
| Dashboard | ✅ | `superadmin.dashboard` |
| Manage admin platform | ✅ | `superadmin.users` |
| Approval komunitas | ✅ | `superadmin.communities.approve` |
| Approval sub komunitas/regional | ⚠️ | Tidak dijumpai sub-approval spesifik; subgrup/region ikut komunitas |
| Approval brand | ✅ | `superadmin.brands.approve` |
| Approval perusahaan | ✅ | `superadmin.companies.approve` |
| Manage members | ✅ | `superadmin.members.*` |
| Manage komunitas/brand/perusahaan/owner | ✅ | controller masing-masing |
| Suspend/bekukan | ✅ | `ban`, `suspend` di semua controller |
| Delete/soft delete | ✅ | `User` pakai `SoftDeletes`; controller `destroy` |
| Manage event | ✅ | `superadmin.events.*` |
| Manage CMS | ✅ | `superadmin.cms.{homepage,blogs,pages,contact,suggestions}` |
| Manage blog | ✅ | `superadmin.cms.blogs.*` |
| Manage homepage content | ✅ | `superadmin.cms.homepage.*` |
| Manage platform fee | ✅ | `superadmin.platform-fees.*` |
| Revenue dashboard | ⚠️ | `DashboardController@index` — metrik didistribusikan; perlu konfirmasi `total_revenue` di view |
| Export report | ✅ | `export` route di communities, brands, companies, members, events, collaborations |
| Data master | ✅ | `superadmin.master-data.{interests,event-types}` + `categories` + `regions` |
| Audit log | ✅ | `AuditLog` + `superadmin.audit-logs.*` |
| Admin log | ✅ | `LoginLog` + `superadmin.login-logs.*` |

## 9. Collaboration / Kerja Sama

| Area | Status | Catatan |
|------|--------|---------|
| Permintaan kerja sama komunitas → brand | ✅ | `CollaborationProposal` polymorphic |
| komunitas → perusahaan | ✅ | Sama |
| brand/perusahaan → komunitas | ✅ | Sama |
| Kerja sama berbayar | ✅ | field `budget` di proposal |
| Kerja sama gratis | ✅ | `budget = 0` |
| CSR | ⚠️ | Tidak ada tipe `csr` di `CollaborationType` enum (cek) |
| Tap-in | ❌ | Tidak ada |
| Donasi | ✅ | `Donation` |
| Dana | ✅ | `Wallet` |
| Status pending/approved/rejected/cancelled/completed | ✅ | `CollaborationProposal.status` |
| Detail kerja sama | ✅ | `show` |
| Delete/withdraw request | ✅ | `destroy` / `cancel` |
| Notification kerja sama | ⚠️ | `CustomNotification` ada; perlu verifikasi trigger |
| Report kerja sama | ✅ | `superadmin.collaborations.export` |

## 10. Campaign

| Area | Status | Catatan |
|------|--------|---------|
| Campaign iklan | ✅ | `Campaign` + `CampaignStatus` |
| Campaign produk | ⚠️ | Lewat `Campaign` dengan type produk; tidak ada model produk terpisah |
| Campaign event | ✅ | `CommunityCampaign` |
| Campaign kolaborasi | ⚠️ | `CollaborationProposal` bukan `Campaign` |
| Campaign lowongan | ❌ | Tidak ada |
| Placement campaign | ❌ | Tidak ada placement |
| Status campaign | ✅ | `CampaignStatus` |
| Approval campaign | ❌ | Tidak ada approval eksplisit (cukup aktif/nonaktif) |
| Analytics campaign | ❌ | Tidak ada analytics module |

## 11. Payment / Wallet / Finance

| Area | Status | Catatan |
|------|--------|---------|
| Payment event | ✅ | `EventPaymentConfirmation` (manual) |
| Donation | ✅ | `Donation` + `EventDonation` |
| Wallet | ✅ | `Wallet` + `WalletTransaction` |
| Top up | ❌ | Tidak ada modul top-up otomatis |
| Riwayat transaksi | ✅ | `walletTransactions()` + view |
| Status transaksi | ✅ | `WalletTransaction.status` |
| Platform fee | ✅ | `PlatformFee` + `PlatformFeeService` |
| Settlement/payout | ❌ | Tidak ada |
| Refund | ❌ | Tidak ada |
| Invoice/receipt | ❌ | Tidak ada generator |
| Validasi keamanan transaksi | ✅ | middleware auth, CSRF, role |

## 12. Notification

| Area | Status | Catatan |
|------|--------|---------|
| Notifikasi approval | ✅ | `CustomNotification` |
| Join komunitas | ✅ | `CustomNotification` (manual) |
| Event | ⚠️ | Belum otomatis — perlu service |
| Payment | ✅ | lewat `Wallet` |
| Kerja sama | ✅ | lewat `CustomNotification` |
| Campaign | ⚠️ | Belum otomatis |
| Role request | ✅ | `RoleApproval` |
| Suspend/banned | ✅ | `AccountRestrictedController` |
| Email notification | ❌ | `MAIL_MAILER=log` (tidak ada SMTP) |
| In-app notification | ⚠️ | `CustomNotification` ada, tetapi UI notification center belum lengkap |

## 13. CMS & Content

| Area | Status |
|------|--------|
| Homepage | ✅ (`HomepageSection`) |
| Blog | ✅ (`Blog`) |
| Tentang kami | ✅ (`CmsPage` slug `about`) |
| Hubungi kami | ✅ (`ContactSetting` + `CmsPage`) |
| FAQ | ❌ (tidak ada model FAQ) |
| Terms & condition | ⚠️ (bisa lewat `CmsPage` tapi tidak ada entry default) |
| Privacy policy | ⚠️ (sama) |
| Banner | ✅ |
| Campaign placement | ❌ |

## 14. Data Master

| Master | Status | Tabel |
|--------|--------|-------|
| Role | ✅ | `roles` (Spatie) |
| Permission | ✅ | `permissions` (Spatie) |
| Community category | ✅ | `community_categories` |
| Interest | ✅ | `interests` + pivot `interest_user` |
| Region/province/city | ✅ | `regions` + `master_regions` (double) |
| Event type | ✅ | `event_types` |
| Event status | ✅ | `events.status` (enum) |
| Ticket type | ❌ | Tidak ada (event tidak jual tiket) |
| Collaboration type | ✅ | `collaboration_types` |
| Collaboration status | ✅ | `CollaborationProposal.status` |
| Campaign type | ⚠️ | tidak ada tabel khusus; enum di `Campaign` |
| Campaign placement | ❌ |
| Product category | ❌ |
| Brand category | ❌ |
| Company category | ❌ |
| Payment method | ❌ |
| Transaction status | ✅ | `WalletTransaction.status` |
| Platform fee | ✅ | `platform_fees` |
| Report reason | ❌ |
| Suspend reason | ❌ |
| Badge | ❌ |
| Language | ⚠️ | `translations` ada tapi tidak ada `languages` master |
| Notification template | ❌ |
| Email template | ❌ |
| CMS page type | ⚠️ | `CmsPage.type` ada; tidak ada UI untuk tambah type |

## 15. Security (Ringkasan)

Lihat `04_SECURITY_AUDIT.md` untuk detail.

| Item | Status |
|------|--------|
| Auth protection | ✅ |
| RBAC | ✅ |
| Password hashing | ✅ (Laravel `hashed` cast) |
| Session security | ✅ (regenerate on login/logout) |
| CSRF | ✅ (semua form POST) |
| XSS | ✅ (Blade `{{ }}` default escape) |
| SQL injection | ✅ (Eloquent parameterized) |
| File upload validation | ✅ (di `FormRequest`) |
| Rate limit login | ✅ (throttle:30,1) |
| Sensitive env protection | ⚠️ (`.env` ter-commit, `.gitignore` perlu dicek) |
| API authorization | ✅ (Sanctum terpasang tapi tidak ada API route mobile) |
| Ownership validation | ✅ (Policy classes) |
| Soft delete | ✅ (User) |
| Audit log | ✅ |
| Admin action log | ✅ (LoginLog) |
| **Demo password** | ⚠️ `password` untuk semua akun demo |
| **Session file driver local** | ⚠️ aman untuk local, akan jadi masalah jika ENV disalin mentah ke Vercel |

---

## 16. Temuan utama lain

1. `Auth\AccountRestrictedController` hanya Invokable controller, tidak ada method `__invoke` (perlu dicek).
2. `CLAUDE.md` menyebut `source-code-laravel/` (stale duplicate). Folder ini tidak ada di `app/`, sehingga aman.
3. `redirectUsersTo` di `bootstrap/app.php` line 38 mengirim ke `member.dashboard` — **tapi di `routes/modules/member.php`** perlu verifikasi route `member.dashboard` ada. (Akan diverifikasi.)
4. **Source `auth/login` view di resources/views/auth/login** — bukan `auth.login` default Breeze. (Periksa.)
5. **Breeze boilerplate di `app/Http/Controllers/Auth/`** masih ada `RegisteredUserController`, `LoginRequest`, `PasswordResetLinkController`, `NewPasswordController` — tidak ada masalah.

(Lanjutan modul gap dan perbaikan di `02_MODULE_GAP_ANALYSIS.md` dan `bugfix/`.)
