# Module Structure

> Snapshot of KomunaID's role-based module organization, post-V2.

## Module Map

| Module | Namespace | Models (key) | Views root |
|---|---|---|---|
| Public | `App\Http\Controllers\Public`, `Guest` | Community, Event, Blog, CmsPage, HomepageSection, MasterRegion, Region | `resources/views/public` |
| Auth | `App\Http\Controllers\Auth` | User, RoleRequest | `resources/views/auth` |
| Member | `App\Http\Controllers\Member` | User, Profile, Interest, Community, Event, Friendship, CommunityBookmark, MemberGallery, MemberHistory | `resources/views/member` |
| Community Owner | `App\Http\Controllers\CommunityOwner`, `Community` | Community, CommunityMember, CommunityManagement, CommunityVolunteer, CommunityCampaign, Event, Donation, Wallet, CollaborationProposal | `resources/views/community-owner`, `resources/views/community` |
| Brand Owner | `App\Http\Controllers\BrandOwner` | Brand, CompanyBrandMember, BrandOwnershipTransfer, Community, CollaborationProposal | `resources/views/brand` |
| Company Owner | `App\Http\Controllers\CompanyOwner` | Company, Brand, CompanyBrandMember, CollaborationProposal | `resources/views/company-owner` |
| Superadmin | `App\Http\Controllers\Superadmin` (+ `Cms`) | all + AdminConversation, AdminMessage, DocumentationFile, PremiumPlan, Subscription, FeatureLock, CmsPage, Blog, HomepageSection, ContactSetting, Suggestion, CustomNotification, LoginLog, AuditLog, ApprovalLog | `resources/views/superadmin` |
| Shared | n/a | (helpers, language, exports) | `resources/views/components`, `partials` |

## Public Controllers

- `Public\PublicHomeController`
- `Public\PublicCommunityController`
- `Public\PublicEventController`
- `Public\PublicBlogController`
- `Public\PublicPageController`
- `Public\PublicContactController`
- `Public\PublicSuggestionController`
- `Guest\HomeController` *(legacy, shadowed by Public — see audit BUG-02)*
- `Guest\PublicEventController` *(legacy)*
- `Guest\PublicBlogController` *(legacy)*
- `Guest\PublicCommunityController` *(legacy)*
- `Guest\PublicContactController` *(legacy)*
- `Guest\PublicPageController` *(legacy)*
- `Guest\CommunityDirectoryController` *(legacy)*

> **Note (BUG-02):** `Guest` and `Public` namespaces duplicate actions. The active route is whichever was registered last. Both kept for backward compatibility; new code should target `Public`.

## Superadmin

- `DashboardController`
- `MemberController`
- `UserController`
- `CommunityController` (+ `CommunityOwnerController`)
- `EventController`
- `BrandController` (+ `BrandOwnerController`)
- `CompanyController`
- `RoleRequestController`
- `Cms\PageController`, `Cms\BlogController`, `Cms\HomepageController`, `Cms\ContactController`, `Cms\SuggestionController`
- `PremiumController`
- `AdminChatController`
- `DocumentationController`
- `MasterDataController`, `MasterRegionController`, `InterestController`
- `WalletController`, `PlatformFeeController`, `DonationController`
- `LoginLogController`, `AuditLogController`, `ApprovalLogController`
- `CollaborationController`
- `SettingController` (profile + password)
- `ApprovalController` (centralized approval queue)
