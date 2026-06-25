# KomunaID — Module Structure

**Last updated:** 2026-06-25
**Pattern:** Modular monolith (single Laravel app, controllers grouped by role/module)

---

## 1. Top-Level Layout

| Layer | Path | Purpose |
|---|---|---|
| Controllers | `app/Http/Controllers/{Role}/` | HTTP entry per role |
| Middleware | `app/Http/Middleware/` | Cross-cutting HTTP filters |
| Requests | `app/Http/Requests/{Module}/` | Form validation per module |
| Models | `app/Models/` | Eloquent models (root) |
| Policies | `app/Policies/` | Authorization per resource |
| Services | `app/Services/{Domain}/` | Business logic per domain |
| Enums | `app/Support/Enums/` | String-backed enums for status/role |
| Helpers | `app/Support/Helpers/` | Pure utility functions |
| Migrations | `database/migrations/` | Schema versions |
| Seeders | `database/seeders/{Master\|Demo}/` | Idempotent data |
| Views | `resources/views/{role}/` | Blade per role |
| Tests | `tests/{Feature,Unit}/` | Automated tests |

---

## 2. Controller Modules

### Auth (`app/Http/Controllers/Auth/`)
- `AuthenticatedSessionController` — login, logout
- `RegisteredUserController` — register
- `PasswordResetLinkController` — forgot
- `NewPasswordController` — reset
- `OnboardingController` — post-registration routing
- `RoleRequestController` (if extracted from Onboarding) — role upgrade
- `DashboardRedirectController` — `/dashboard` → role-specific URL

### Public (`app/Http/Controllers/Public/`)
- `PublicHomeController` — `/`
- `PublicCommunityController` — `/komunitas`, `/komunitas/{slug}`
- `PublicEventController` — `/events`, `/events/{slug}`
- `PublicBlogController` — `/blogs`, `/blogs/{slug}`
- `PublicPageController` — `/about`, `/contact`
- `PublicContactController` — `/contact` form
- `PublicSuggestionController` — `/contact/suggestions`
- `LanguageController` — `/language/{locale}`

### Member (`app/Http/Controllers/Member/`)
- `DashboardController`
- `ProfileController`
- `InterestController`
- `MyCommunityController`
- `MyEventController`
- `EventController` — register, cancel, donate, volunteer
- `EventChatController`
- `FriendController`
- `BookmarkController`
- `GalleryController`
- `HistoryController`
- `WalletController`
- `DonationController`
- `RoleRequestController`

### CommunityOwner (`app/Http/Controllers/CommunityOwner/`)
- `DashboardController`
- `CommunityController`
- `MemberController`
- `RegionController`
- `SubgroupController`
- `EventController` (rich: registrations, donations, finance, galleries, chats, volunteer-campaigns)
- `EventRegistrationController` (or merged into Event)
- `EventDonationController`
- `EventFinanceController`
- `EventGalleryController`
- `EventChatController`
- `EventVolunteerController`
- `EventParticipantController`
- `DonationController` (community donation confirm — legacy)
- `CommunityWalletController`
- `CommunityCollaborationController`
- `ProposalCollaborationController`

### BrandOwner (`app/Http/Controllers/BrandOwner/`)
- `DashboardController`
- `BrandController`
- `StaffController`
- `CampaignController`
- `CollaborationController` (legacy)
- `ProposalCollaborationController` (v2)
- `CommunityDirectoryController`
- `OwnershipTransferController`
- `SettingController`

### CompanyOwner (`app/Http/Controllers/CompanyOwner/`)
- `DashboardController`
- `CompanyController`
- `CompanyBrandController`
- `ProposalCollaborationController`
- `SettingController`

### Superadmin (`app/Http/Controllers/Superadmin/`)
- `DashboardController`
- `UserController` — generic
- `MemberController`
- `CommunityOwnerController`
- `BrandOwnerController`
- `CommunityController`
- `EventController`
- `BrandController`
- `CompanyController`
- `CollaborationController` (v2 proposals)
- `ApprovalCenterController` — central approve/reject hub
- `RoleRequestController`
- `CategoryController`
- `MasterRegionController`
- `EventTypeController`
- `InterestController` (master data)
- `AuditLogController`
- `LoginLogController`
- `WalletController` — adjust balances
- `DonationController` — confirm
- `PlatformFeeController`
- `AdminChatController`
- `DocumentationController`
- `SettingController`
- `Cms\SuperadminCmsDashboardController`
- `Cms\SuperadminBlogController`
- `Cms\SuperadminPageController`
- `Cms\SuperadminContactSettingController`
- `Cms\SuperadminHomepageSectionController`
- `Cms\SuperadminSuggestionController`

### Shared (`app/Http/Controllers/Shared/`) — NEW
- `CronController` — `/api/cron/scheduler`

---

## 3. Model Modules

| Domain | Models |
|---|---|
| Identity | `User`, `Profile`, `RoleRequest`, `LoginLog`, `AuditLog` |
| Community | `Community`, `CommunityCategory`, `CommunityMember`, `CommunityMemberRole`, `CommunityInternalRole`, `CommunityManagement`, `CommunityVolunteer`, `CommunityCampaign`, `CommunityCampaignApplication`, `CommunityRegion`, `CommunitySubgroup`, `CommunityBan`, `CommunityOwnershipTransfer`, `MemberJoinHistory` |
| Event | `Event`, `EventType`, `EventRegistration`, `EventPaymentConfirmation`, `EventGallery`, `EventChat`, `EventChatThread`, `EventVolunteer`, `EventVolunteerCampaign`, `EventVolunteerApplication`, `EventDonation`, `EventFinanceTransaction`, `EventFinanceSummary` |
| Brand | `Brand`, `BrandMember`, `BrandOwnershipTransfer` |
| Company | `Company`, `CompanyBrandMember` |
| Collaboration | `CollaborationRequest` (legacy V1), `CollaborationProposal` (v2), `CollaborationType` |
| Donation/Finance | `Donation` (legacy V1), `Wallet`, `WalletTransaction`, `PlatformFee` |
| Premium | `PremiumPlan`, `Subscription`, `FeatureLock`, `FeatureUsage` |
| CMS | `CmsPage`, `Blog`, `HomepageSection`, `ContactSetting`, `Suggestion` |
| Admin Chat | `AdminConversation`, `AdminConversationParticipant`, `AdminMessage` |
| Documentation | `DocumentationFile` |
| Multilanguage | `Translation`, `Region` (v2), `MasterRegion` (legacy V1) |
| Member extras | `Friend` (Friendship), `CommunityBookmark`, `MemberGallery`, `MemberHistory`, `Interest` |
| Misc | `ApprovalLog`, `CustomNotification`, `Campaign` (V1 brand-level) |

---

## 4. Service Layer

- `app/Services/Auth/RedirectByRoleService.php`
- `app/Services/Auth/RoleRequestService.php` (NEW)
- `app/Services/Documentation/DocumentationGeneratorService.php`
- `app/Services/Premium/PremiumAccessService.php` (NEW)
- `app/Services/Event/EventFinanceService.php` (NEW)

---

## 5. Middleware

| Alias | Class | Purpose |
|---|---|---|
| `role` | Spatie | role check |
| `permission` | Spatie | permission check |
| `role_or_permission` | Spatie | either |
| `admin` | EnsureSuperadmin | superadmin OR admin_platform |
| `not.superadmin` | EnsureNotSuperadmin | block superadmin from user auth flows |
| `active_user` | ActiveUser | status = active |
| `not.banned` | EnsureNotBanned | status != banned/suspended |
| `cron.token` | VerifyCronToken (NEW) | match `?token=` to `CRON_SECRET` |

---

## 6. Cross-Cutting Concerns

- **Logging:** `storage/logs/laravel.log` locally; `LOG_CHANNEL=stderr` on Vercel.
- **File upload:** local disk in dev; S3 (R2) in production.
- **Multilanguage:** `setlocale` middleware; `trans()` helper; `translations` table fallback.
- **Premium gating:** `FeatureLock::isLocked($featureKey)` consulted in controllers/views.
- **Admin Chat:** RESTful POST + reload; no WebSocket.
- **Documentation:** rendered from `routes/`, migrations, models → stored in `documentation_files` table.
