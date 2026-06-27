# KomunaID Module Structure (Final)

## App Layer

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/                         (5 controllers)
│   │   │   ├── AccountRestrictedController.php
│   │   │   ├── AuthenticatedSessionController.php
│   │   │   ├── DashboardRedirectController.php
│   │   │   ├── NewPasswordController.php
│   │   │   ├── OnboardingController.php
│   │   │   ├── PasswordResetLinkController.php
│   │   │   └── RegisteredUserController.php
│   │   ├── Member/                       (14 controllers)
│   │   │   ├── BookmarkController.php
│   │   │   ├── CommunityController.php   (= MyCommunityController)
│   │   │   ├── DashboardController.php
│   │   │   ├── DonationController.php
│   │   │   ├── EventChatController.php
│   │   │   ├── EventController.php
│   │   │   ├── FriendController.php
│   │   │   ├── GalleryController.php
│   │   │   ├── HistoryController.php
│   │   │   ├── InterestController.php
│   │   │   ├── MyCommunityController.php
│   │   │   ├── MyEventController.php
│   │   │   ├── PremiumDemoController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── RoleRequestController.php
│   │   │   └── WalletController.php
│   │   ├── CommunityOwner/               (20 controllers)
│   │   │   ├── CommunityCollaborationController.php
│   │   │   ├── CommunityController.php
│   │   │   ├── CommunityWalletController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── DonationController.php
│   │   │   ├── EventChatController.php
│   │   │   ├── EventController.php
│   │   │   ├── EventDonationController.php
│   │   │   ├── EventFinanceController.php
│   │   │   ├── EventGalleryController.php
│   │   │   ├── EventParticipantController.php
│   │   │   ├── EventVolunteerApplicationController.php
│   │   │   ├── EventVolunteerCampaignController.php
│   │   │   ├── EventVolunteerController.php
│   │   │   ├── MemberController.php
│   │   │   ├── ProposalCollaborationController.php
│   │   │   ├── RegionController.php
│   │   │   └── SubgroupController.php
│   │   ├── BrandOwner/                   (9 controllers)
│   │   │   ├── BrandController.php
│   │   │   ├── CampaignController.php
│   │   │   ├── CollaborationController.php
│   │   │   ├── CommunityDirectoryController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── OwnershipTransferController.php
│   │   │   ├── ProposalCollaborationController.php
│   │   │   ├── SettingController.php
│   │   │   └── StaffController.php
│   │   ├── CompanyOwner/                 (5 controllers)
│   │   │   ├── CompanyBrandController.php
│   │   │   ├── CompanyController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── ProposalCollaborationController.php
│   │   │   └── SettingController.php
│   │   ├── Public/                       (7 controllers)
│   │   │   ├── PublicBlogController.php
│   │   │   ├── PublicCommunityController.php
│   │   │   ├── PublicContactController.php
│   │   │   ├── PublicEventController.php
│   │   │   ├── PublicHomeController.php
│   │   │   ├── PublicPageController.php
│   │   │   └── PublicSuggestionController.php
│   │   ├── Superadmin/                   (25+ controllers)
│   │   │   ├── AdminChatController.php
│   │   │   ├── ApprovalCenterController.php
│   │   │   ├── AuditLogController.php
│   │   │   ├── BrandController.php
│   │   │   ├── BrandOwnerController.php
│   │   │   ├── CategoryController.php
│   │   │   ├── CollaborationController.php
│   │   │   ├── CommunityController.php
│   │   │   ├── CommunityOwnerController.php
│   │   │   ├── CompanyController.php
│   │   │   ├── CmsController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── DocumentationController.php
│   │   │   ├── DonationController.php
│   │   │   ├── EventController.php
│   │   │   ├── EventTypeController.php
│   │   │   ├── InterestController.php
│   │   │   ├── LoginController.php
│   │   │   ├── LoginLogController.php
│   │   │   ├── MasterRegionController.php
│   │   │   ├── MemberController.php
│   │   │   ├── OwnershipTransferController.php
│   │   │   ├── PlatformFeeController.php
│   │   │   ├── RoleRequestController.php
│   │   │   ├── SettingController.php
│   │   │   ├── UserController.php
│   │   │   ├── WalletController.php
│   │   │   └── Cms/                      (subnamespace, 6 controllers)
│   │   ├── Shared/
│   │   │   └── CronController.php
│   │   └── Controller.php                (base)
│   ├── Middleware/                       (5 custom)
│   │   ├── ActiveUser.php
│   │   ├── EnsureNotBanned.php
│   │   ├── EnsureNotSuperadmin.php
│   │   ├── EnsureSuperadmin.php
│   │   └── VerifyCronToken.php
│   └── Requests/                         (50+ requests, see below)
├── Models/                               (60+ models)
├── Policies/                             (8 policies)
├── Providers/
│   ├── AppServiceProvider.php
│   └── (route discovery only)
├── Services/
│   ├── AdminChat/
│   │   └── AdminChatService.php          (moved from root in R7)
│   ├── Auth/
│   │   └── RedirectByRoleService.php
│   ├── Brand/
│   ├── Collaboration/
│   ├── Company/
│   ├── Documentation/
│   │   └── DocumentationGeneratorService.php
│   ├── Event/
│   ├── Export/
│   ├── Finance/
│   │   ├── PlatformFeeService.php
│   │   └── WalletService.php
│   └── Premium/
│       ├── PremiumAccessService.php
│       └── SubscriptionService.php
│   (root level, candidates for further organization)
│   ├── EventFinanceService.php
│   └── RoleRequestService.php
└── Shims/
    └── FactoryShimBootstrap.php          (pre-existing)
```

## Routes Layer

```
routes/
├── web.php                               (35 lines, thin shell)
├── console.php                           (default Laravel)
└── modules/
    ├── public.php                        (7 routes)
    ├── auth.php                          (8 routes + onboarding + community actions)
    ├── member.php                        (40+ routes)
    ├── community-owner.php               (90+ routes)
    ├── brand-owner.php                   (30+ routes)
    ├── company-owner.php                 (15+ routes)
    └── superadmin.php                    (150+ routes)
```

## Resources Layer

```
resources/
├── views/
│   ├── layouts/                          (7 layouts)
│   ├── components/                       (9 components)
│   ├── public/                           (public site views)
│   ├── auth/                             (login, register, etc.)
│   ├── superadmin/                       (superadmin dashboard, CMS, etc.)
│   ├── member/                           (member dashboard, etc.)
│   ├── community-owner/                  (community dashboard, etc.)
│   ├── brand-owner/                      (brand dashboard, etc.)
│   ├── company-owner/                    (company dashboard, etc.)
│   ├── shared/                           (partials)
│   └── form/                             (form layouts)
├── css/
└── js/
```

## Database Layer

```
database/
├── migrations/                           (96 files: 95 V1+V2 + 1 audit)
├── seeders/
│   ├── DatabaseSeeder.php
│   ├── PermissionSeeder.php
│   ├── Master/                           (always runs)
│   │   ├── CmsPageSeeder.php
│   │   ├── CollaborationTypeSeeder.php
│   │   ├── CommunityCategorySeeder.php
│   │   ├── CommunityOwnerSeeder.php
│   │   ├── CommunitySeeder.php
│   │   ├── ContactSettingSeeder.php
│   │   ├── EventTypeSeeder.php
│   │   ├── FeatureLockSeeder.php
│   │   ├── HomepageSectionSeeder.php
│   │   ├── InterestSeeder.php
│   │   ├── PremiumPlanSeeder.php
│   │   ├── RegionSeeder.php
│   │   ├── RoleSeeder.php
│   │   ├── SuperadminSeeder.php
│   │   └── WalletTransactionSeeder.php
│   └── Demo/                             (gated on local)
│       ├── DemoAdminChatSeeder.php
│       ├── DemoBrandCompanySeeder.php
│       ├── DemoCmsContentSeeder.php
│       ├── DemoCollaborationSeeder.php
│       ├── DemoCommunitySeeder.php
│       ├── DemoEventSeeder.php
│       ├── DemoExtraDataSeeder.php
│       ├── DemoPremiumTrialSeeder.php
│       └── DemoUserSeeder.php
└── factories/                            (9 factories)
```

## Tests Layer

```
tests/
├── CreatesApplication.php
├── TestCase.php
├── Feature/                              (26 feature tests)
│   ├── AdminChatTest.php
│   ├── AuthTest.php
│   ├── BannedAndSuspendedTest.php        (NEW in R10)
│   ├── BrandCompanyCollaborationTest.php
│   ├── CmsPolicyTest.php
│   ├── CommunityModuleTest.php
│   ├── CompanyPolicyTest.php
│   ├── CronRouteTest.php
│   ├── DocumentationGeneratorTest.php
│   ├── DocumentationPolicyTest.php
│   ├── EventFinanceServiceTest.php
│   ├── EventModuleTest.php
│   ├── HttpPolicyEnforcementTest.php
│   ├── MemberModuleTest.php
│   ├── MultilanguageTest.php
│   ├── PremiumFeatureTest.php
│   ├── PublicPageTest.php
│   ├── RoleAccessTest.php
│   ├── RouteNamingTest.php               (NEW in R10)
│   ├── SecurityTest.php
│   └── SuperadminDashboardTest.php
└── Unit/                                 (1 unit test)
    └── RedirectByRoleServiceTest.php
```

## Docs Layer

```
docs/
├── architecture/
│   ├── ARCHITECTURE_AUDIT_V1_V2.md       (18-section audit)
│   ├── BASELINE.md                       (R0 snapshot)
│   ├── COVERAGE_MATRIX_V1_V2.md          (24-row module matrix)
│   ├── DATABASE_REVIEW.md                (data dictionary)
│   ├── HANDOVER_REFACTOR_SUMMARY.md      (exec summary)
│   ├── MODULE_STRUCTURE.md               (this file)
│   ├── REFACTOR_BLUEPRINT.md             (final blueprint)
│   ├── REFACTOR_EXECUTION_REPORT.md      (what was changed)
│   ├── REFACTOR_TEST_RESULT.md           (test result table)
│   ├── ROLE_PERMISSION_REVIEW.md         (role × permission matrix)
│   └── ROUTE_STRUCTURE.md                (final route table)
├── deployment/
│   ├── DEPLOYMENT_RECOMMENDATION.md      (final recommendation)
│   ├── NON_VERCEL_FALLBACK.md            (Forge/Ploi/RunCloud/cPanel)
│   └── VERCEL_HARDENING.md               (Vercel env checklist)
└── qa/
    └── REFACTOR_TEST_RESULT.md           (test result)
```
