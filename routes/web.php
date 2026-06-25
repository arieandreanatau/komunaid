<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Shared\CronController;
use App\Http\Controllers\Guest\HomeController;
use App\Http\Controllers\Guest\CommunityDirectoryController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Member\ProfileController;
use App\Http\Controllers\Member\RoleRequestController;
use App\Http\Controllers\Member\CommunityController as MemberCommunityController;
use App\Http\Controllers\Member\EventController as MemberEventController;
use App\Http\Controllers\Member\EventChatController as MemberEventChatController;
use App\Http\Controllers\Member\WalletController as MemberWalletController;
use App\Http\Controllers\Member\DonationController as MemberDonationController;
use App\Http\Controllers\CommunityOwner\EventParticipantController as CommunityOwnerEventParticipantController;
use App\Http\Controllers\CommunityOwner\EventVolunteerCampaignController as CommunityOwnerEventVolunteerCampaignController;
use App\Http\Controllers\CommunityOwner\EventVolunteerApplicationController as CommunityOwnerEventVolunteerApplicationController;
use App\Http\Controllers\CommunityOwner\EventVolunteerController as CommunityOwnerEventVolunteerController;
use App\Http\Controllers\CommunityOwner\EventDonationController as CommunityOwnerEventDonationController;
use App\Http\Controllers\CommunityOwner\EventFinanceController as CommunityOwnerEventFinanceController;
use App\Http\Controllers\Member\InterestController as MemberInterestController;
use App\Http\Controllers\Member\MyCommunityController as MemberMyCommunityController;
use App\Http\Controllers\Member\MyEventController as MemberMyEventController;
use App\Http\Controllers\Member\FriendController as MemberFriendController;
use App\Http\Controllers\Member\BookmarkController as MemberBookmarkController;
use App\Http\Controllers\Member\GalleryController as MemberGalleryController;
use App\Http\Controllers\Member\HistoryController as MemberHistoryController;
use App\Http\Controllers\Member\PremiumDemoController as MemberPremiumDemoController;
use App\Http\Controllers\CommunityOwner\DashboardController as CommunityOwnerDashboardController;
use App\Http\Controllers\CommunityOwner\CommunityController as CommunityOwnerCommunityController;
use App\Http\Controllers\CommunityOwner\MemberController as CommunityOwnerMemberController;
use App\Http\Controllers\CommunityOwner\RegionController as CommunityOwnerRegionController;
use App\Http\Controllers\CommunityOwner\SubgroupController as CommunityOwnerSubgroupController;
use App\Http\Controllers\CommunityOwner\EventController as CommunityOwnerEventController;
use App\Http\Controllers\CommunityOwner\EventGalleryController as CommunityOwnerEventGalleryController;
use App\Http\Controllers\CommunityOwner\EventChatController as CommunityOwnerEventChatController;
use App\Http\Controllers\CommunityOwner\CommunityCollaborationController as CommunityCollaborationController;
use App\Http\Controllers\CommunityOwner\DonationController as CommunityOwnerDonationController;
use App\Http\Controllers\CommunityOwner\CommunityWalletController;
use App\Http\Controllers\BrandOwner\DashboardController as BrandOwnerDashboardController;
use App\Http\Controllers\BrandOwner\BrandController as BrandController;
use App\Http\Controllers\BrandOwner\CampaignController as CampaignController;
use App\Http\Controllers\BrandOwner\CollaborationController as CollaborationController;
use App\Http\Controllers\BrandOwner\StaffController as StaffController;
use App\Http\Controllers\BrandOwner\CommunityDirectoryController as BrandCommunityDirectoryController;
use App\Http\Controllers\BrandOwner\OwnershipTransferController as BrandOwnershipTransferController;
use App\Http\Controllers\BrandOwner\ProposalCollaborationController as BrandProposalCollaborationController;
use App\Http\Controllers\BrandOwner\SettingController as BrandSettingController;
use App\Http\Controllers\Superadmin\LoginController as SuperadminLoginController;
use App\Http\Controllers\Superadmin\DashboardController as SuperadminDashboardController;
use App\Http\Controllers\Superadmin\ApprovalCenterController as SuperadminApprovalCenterController;
use App\Http\Controllers\Superadmin\UserController as SuperadminUserController;
use App\Http\Controllers\Superadmin\CommunityController as SuperadminCommunityController;
use App\Http\Controllers\Superadmin\BrandController as SuperadminBrandController;
use App\Http\Controllers\Superadmin\CategoryController as SuperadminCategoryController;
use App\Http\Controllers\Superadmin\MasterRegionController as SuperadminMasterRegionController;
use App\Http\Controllers\Superadmin\AuditLogController as SuperadminAuditLogController;
use App\Http\Controllers\Superadmin\WalletController as SuperadminWalletController;
use App\Http\Controllers\Superadmin\DonationController as SuperadminDonationController;
use App\Http\Controllers\Superadmin\PlatformFeeController as SuperadminPlatformFeeController;
use App\Http\Controllers\CompanyOwner\DashboardController as CompanyOwnerDashboardController;
use App\Http\Controllers\CompanyOwner\CompanyController as CompanyOwnerCompanyController;
use App\Http\Controllers\CompanyOwner\CompanyBrandController as CompanyOwnerBrandController;
use App\Http\Controllers\CompanyOwner\ProposalCollaborationController as CompanyOwnerProposalController;
use App\Http\Controllers\CompanyOwner\SettingController as CompanyOwnerSettingController;
use App\Http\Controllers\Superadmin\MemberController as SuperadminMemberController;
use App\Http\Controllers\Superadmin\CommunityOwnerController as SuperadminCommunityOwnerController;
use App\Http\Controllers\Superadmin\BrandOwnerController as SuperadminBrandOwnerController;
use App\Http\Controllers\Superadmin\CompanyController as SuperadminCompanyController;
use App\Http\Controllers\Superadmin\CollaborationController as SuperadminCollaborationController;
use App\Http\Controllers\Superadmin\EventController as SuperadminEventController;
use App\Http\Controllers\Superadmin\OwnershipTransferController as SuperadminOwnershipTransferController;
use App\Http\Controllers\Superadmin\LoginLogController as SuperadminLoginLogController;
use App\Http\Controllers\Superadmin\SettingController as SuperadminSettingController;
use App\Http\Controllers\Superadmin\InterestController as SuperadminInterestController;
use App\Http\Controllers\Superadmin\EventTypeController as SuperadminEventTypeController;
use App\Http\Controllers\Superadmin\CmsController as SuperadminCmsController;
use App\Http\Controllers\Superadmin\AdminChatController as SuperadminAdminChatController;
use App\Http\Controllers\Superadmin\DocumentationController as SuperadminDocumentationController;

// ─── Public Routes ─────────────────────────────────────────────
use App\Http\Controllers\Public\PublicHomeController;
use App\Http\Controllers\Public\PublicBlogController;
use App\Http\Controllers\Public\PublicPageController;
use App\Http\Controllers\Public\PublicContactController;
use App\Http\Controllers\Public\PublicSuggestionController;
use App\Http\Controllers\Public\PublicCommunityController;
use App\Http\Controllers\Public\PublicEventController;
use App\Http\Controllers\Superadmin\Cms\SuperadminCmsDashboardController;
use App\Http\Controllers\Superadmin\Cms\SuperadminHomepageSectionController;
use App\Http\Controllers\Superadmin\Cms\SuperadminBlogController as SuperadminCmsBlogController;
use App\Http\Controllers\Superadmin\Cms\SuperadminPageController;
use App\Http\Controllers\Superadmin\Cms\SuperadminContactSettingController;
use App\Http\Controllers\Superadmin\Cms\SuperadminSuggestionController;

Route::get('/', [PublicHomeController::class, 'index'])->name('home');

Route::get('/about', fn () => app(PublicPageController::class)->show('about'))->name('about');
Route::get('/contact', [PublicContactController::class, 'index'])->name('contact');
Route::post('/contact/suggestions', [PublicSuggestionController::class, 'store'])->name('suggestions.store');

Route::prefix('blogs')->name('blogs.')->group(function () {
    Route::get('/', [PublicBlogController::class, 'index'])->name('index');
    Route::get('/{slug}', [PublicBlogController::class, 'show'])->name('show');
});

Route::get('/komunitas', [PublicCommunityController::class, 'index'])->name('communities.directory');
Route::get('/komunitas/{slug}', [PublicCommunityController::class, 'show'])->name('communities.detail');
Route::get('/events', [PublicEventController::class, 'index'])->name('events.index');
Route::get('/events/{slug}', [PublicEventController::class, 'show'])->name('events.show');

// ─── Superadmin Auth Routes (separate login) ──────────────────
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [SuperadminLoginController::class, 'showLoginForm'])->name('login')->middleware('guest');
    Route::post('/login', [SuperadminLoginController::class, 'login'])->name('login.submit')->middleware('guest');
    Route::post('/logout', [SuperadminLoginController::class, 'logout'])->name('logout')->middleware('auth');
});

// ─── Auth Routes (user login) ─────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

// ─── Public Routes (no auth required) ────────────────────────
Route::get('/account-restricted', [\App\Http\Controllers\Auth\AccountRestrictedController::class, '__invoke'])
    ->name('account.restricted');

// ─── Authenticated Routes ────────────────────────────────────
Route::middleware(['auth'])->group(function () {

    // ─── Dashboard Redirect ────────────────────────────────
    Route::get('/dashboard', [\App\Http\Controllers\Auth\DashboardRedirectController::class, '__invoke'])
        ->name('dashboard.redirect');

    // ─── Onboarding ────────────────────────────────────────
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');
    Route::get('/onboarding/role-request', [OnboardingController::class, 'roleRequest'])->name('onboarding.role-request');
    Route::post('/onboarding/role-request', [OnboardingController::class, 'storeRoleRequest'])->name('onboarding.role-request.store');
    Route::get('/onboarding/role-request/status/{roleRequest}', [OnboardingController::class, 'roleRequestStatus'])->name('onboarding.role-request.status');
    Route::post('/onboarding/continue-as-member', [OnboardingController::class, 'continueAsMember'])->name('onboarding.continue-as-member');

    // ─── Member Community Actions ──────────────────────────
    Route::post('/komunitas/{community:slug}/join', [MemberCommunityController::class, 'join'])
        ->name('community_action.join')->middleware('active_user');
    Route::post('/komunitas/{community:slug}/leave', [MemberCommunityController::class, 'leave'])
        ->name('community_action.leave')->middleware('active_user');
    Route::post('/komunitas/{community:slug}/report', [MemberCommunityController::class, 'report'])
        ->name('community_action.report')->middleware('active_user');

    // ─── Member Routes ──────────────────────────────────────
    Route::prefix('member')->name('member.')->middleware('active_user')->group(function () {
        // Dashboard
        Route::get('/dashboard', [MemberDashboardController::class, 'index'])->name('dashboard');

        // Premium Demo (uses PremiumAccessService)
        Route::get('/premium-demo', [MemberPremiumDemoController::class, 'show'])->name('premium-demo');

        // Profile
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
        Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('profile.avatar.delete');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // Interests
        Route::get('/interests', [MemberInterestController::class, 'index'])->name('interests.index');
        Route::put('/interests', [MemberInterestController::class, 'update'])->name('interests.update');

        // My Communities
        Route::get('/communities', [MemberMyCommunityController::class, 'index'])->name('communities.index');
        Route::get('/communities/export', [MemberMyCommunityController::class, 'export'])->name('communities.export');
        Route::get('/communities/{community}', [MemberMyCommunityController::class, 'show'])->name('communities.show');

        // My Events
        Route::get('/events', [MemberMyEventController::class, 'index'])->name('events.index');
        Route::get('/events/export', [MemberMyEventController::class, 'export'])->name('events.export');

        // Friends
        Route::get('/friends', [MemberFriendController::class, 'index'])->name('friends.index');
        Route::get('/friends/search', [MemberFriendController::class, 'search'])->name('friends.search');
        Route::post('/friends/{user}/request', [MemberFriendController::class, 'request'])->name('friends.request');
        Route::post('/friends/{friendship}/accept', [MemberFriendController::class, 'accept'])->name('friends.accept');
        Route::post('/friends/{friendship}/reject', [MemberFriendController::class, 'reject'])->name('friends.reject');
        Route::delete('/friends/{friendship}', [MemberFriendController::class, 'remove'])->name('friends.remove');
        Route::get('/friends/{user}/communities', [MemberFriendController::class, 'communities'])->name('friends.communities');

        // Bookmarks
        Route::get('/bookmarks', [MemberBookmarkController::class, 'index'])->name('bookmarks.index');
        Route::post('/bookmarks/{community}', [MemberBookmarkController::class, 'store'])->name('bookmarks.store');
        Route::delete('/bookmarks/{community}', [MemberBookmarkController::class, 'destroy'])->name('bookmarks.destroy');

        // Gallery
        Route::get('/gallery', [MemberGalleryController::class, 'index'])->name('galleries.index');
        Route::get('/gallery/create', [MemberGalleryController::class, 'create'])->name('galleries.create');
        Route::post('/gallery', [MemberGalleryController::class, 'store'])->name('galleries.store');
        Route::get('/gallery/{gallery}/edit', [MemberGalleryController::class, 'edit'])->name('galleries.edit');
        Route::put('/gallery/{gallery}', [MemberGalleryController::class, 'update'])->name('galleries.update');
        Route::delete('/gallery/{gallery}', [MemberGalleryController::class, 'destroy'])->name('galleries.destroy');

        // History
        Route::get('/history', [MemberHistoryController::class, 'index'])->name('history.index');

        // Role Request
        Route::get('/role-requests', [RoleRequestController::class, 'index'])->name('role-requests.index');
        Route::get('/role-requests/create', [RoleRequestController::class, 'create'])->name('role-requests.create');
        Route::post('/role-requests', [RoleRequestController::class, 'store'])->name('role-requests.store');
        Route::get('/role-requests/{roleRequest}', [RoleRequestController::class, 'show'])->name('role-requests.show');

        // Member Event Registration (existing)
        Route::post('/events/{event:slug}/register', [MemberEventController::class, 'register'])->name('events.register');
        Route::post('/events/{event:slug}/payment/{registration}', [MemberEventController::class, 'uploadPayment'])->name('events.upload-payment');
        Route::post('/events/{event:slug}/cancel/{registration}', [MemberEventController::class, 'cancelRegistration'])->name('events.cancel');
        Route::get('/my-registrations', [MemberEventController::class, 'myRegistrations'])->name('events.my-registrations');

        // Member Event Chat
        Route::get('/events/{event:slug}/chat/{chat}', [MemberEventChatController::class, 'show'])->name('events.chat.show');
        Route::post('/events/{event:slug}/chat/{chat}/reply', [MemberEventChatController::class, 'storeThread'])->name('events.chat.reply');

        // Member Event Volunteer Application
        Route::get('/events/{event:slug}/volunteer/apply', [MemberEventController::class, 'showVolunteerApply'])->name('events.volunteer.apply');
        Route::post('/events/{event:slug}/volunteer/apply', [MemberEventController::class, 'storeVolunteerApply'])->name('events.volunteer.apply.store');
        Route::get('/event-volunteer-applications', [MemberEventController::class, 'myVolunteerApplications'])->name('event-volunteer-applications.index');

        // Member Event Donation (EventDonation)
        Route::get('/events/{event:slug}/donate', [MemberEventController::class, 'showEventDonation'])->name('events.donate');
        Route::post('/events/{event:slug}/donate', [MemberEventController::class, 'storeEventDonation'])->name('events.donate.store');

        // Wallet
        Route::get('/wallet', [MemberWalletController::class, 'index'])->name('wallet.index');
        Route::get('/wallet/history', [MemberWalletController::class, 'history'])->name('wallet.history');

        // Donations
        Route::get('/donations', [MemberDonationController::class, 'index'])->name('donations.index');
        Route::get('/donations/{donation}', [MemberDonationController::class, 'show'])->name('donations.show');
        Route::get('/donations/event/{event:slug}', [MemberDonationController::class, 'createEventDonation'])->name('donations.create-event');
        Route::post('/donations/event/{event:slug}', [MemberDonationController::class, 'storeEventDonation'])->name('donations.store-event');
        Route::get('/donations/community/{community}', [MemberDonationController::class, 'createCommunityDonation'])->name('donations.create-community');
        Route::post('/donations/community/{community}', [MemberDonationController::class, 'storeCommunityDonation'])->name('donations.store-community');
    });

    // ─── Community Owner Routes ─────────────────────────────
    Route::prefix('community-own')->name('community.')->middleware('role:community_owner')->group(function () {
        Route::get('/dashboard', [CommunityOwnerDashboardController::class, 'index'])->name('dashboard');

        // Community CRUD
        Route::get('/communities', [CommunityOwnerCommunityController::class, 'index'])->name('communities.index');
        Route::get('/communities/create', [CommunityOwnerCommunityController::class, 'create'])->name('communities.create');
        Route::post('/communities', [CommunityOwnerCommunityController::class, 'store'])->name('communities.store');
        Route::get('/communities/{community}', [CommunityOwnerCommunityController::class, 'show'])->name('communities.show');
        Route::get('/communities/{community}/edit', [CommunityOwnerCommunityController::class, 'edit'])->name('communities.edit');
        Route::put('/communities/{community}', [CommunityOwnerCommunityController::class, 'update'])->name('communities.update');
        Route::delete('/communities/{community}', [CommunityOwnerCommunityController::class, 'destroy'])->name('communities.destroy');

        // Member Management
        Route::get('/communities/{community}/members', [CommunityOwnerMemberController::class, 'index'])->name('members.index');
        Route::post('/communities/{community}/members/{member}/approve', [CommunityOwnerMemberController::class, 'approveMember'])->name('members.approve');
        Route::put('/communities/{community}/members/{member}/role', [CommunityOwnerMemberController::class, 'updateRole'])->name('members.update-role');
        Route::delete('/communities/{community}/members/{member}/remove', [CommunityOwnerMemberController::class, 'remove'])->name('members.remove');
        Route::post('/communities/{community}/members/{member}/ban', [CommunityOwnerMemberController::class, 'ban'])->name('members.ban');
        Route::post('/communities/{community}/members/{member}/unban', [CommunityOwnerMemberController::class, 'unban'])->name('members.unban');

        // Region Management
        Route::get('/communities/{community}/regions', [CommunityOwnerRegionController::class, 'index'])->name('regions.index');
        Route::get('/communities/{community}/regions/create', [CommunityOwnerRegionController::class, 'create'])->name('regions.create');
        Route::post('/communities/{community}/regions', [CommunityOwnerRegionController::class, 'store'])->name('regions.store');
        Route::get('/communities/{community}/regions/{region}', [CommunityOwnerRegionController::class, 'show'])->name('regions.show');
        Route::delete('/communities/{community}/regions/{region}', [CommunityOwnerRegionController::class, 'destroy'])->name('regions.destroy');

        // Subgroup Management
        Route::get('/communities/{community}/subgroups', [CommunityOwnerSubgroupController::class, 'index'])->name('subgroups.index');
        Route::get('/communities/{community}/subgroups/create', [CommunityOwnerSubgroupController::class, 'create'])->name('subgroups.create');
        Route::post('/communities/{community}/subgroups', [CommunityOwnerSubgroupController::class, 'store'])->name('subgroups.store');
        Route::delete('/communities/{community}/subgroups/{subgroup}', [CommunityOwnerSubgroupController::class, 'destroy'])->name('subgroups.destroy');

        // Event Management
        Route::get('/events', [CommunityOwnerEventController::class, 'index'])->name('events.index');
        Route::get('/events/create', [CommunityOwnerEventController::class, 'create'])->name('events.create');
        Route::post('/events', [CommunityOwnerEventController::class, 'store'])->name('events.store');
        Route::get('/events/{event}', [CommunityOwnerEventController::class, 'show'])->name('events.show');
        Route::get('/events/{event}/edit', [CommunityOwnerEventController::class, 'edit'])->name('events.edit');
        Route::put('/events/{event}', [CommunityOwnerEventController::class, 'update'])->name('events.update');
        Route::delete('/events/{event}', [CommunityOwnerEventController::class, 'destroy'])->name('events.destroy');

        // Event Registrations
        Route::get('/events/{event}/registrations', [CommunityOwnerEventController::class, 'registrations'])->name('events.registrations');
        Route::post('/events/{event}/registrations/{registration}/confirm', [CommunityOwnerEventController::class, 'confirmPayment'])->name('events.confirm-payment');
        Route::post('/events/{event}/registrations/{registration}/reject', [CommunityOwnerEventController::class, 'rejectPayment'])->name('events.reject-payment');

        // Event Actions (publish/cancel/archive)
        Route::post('/events/{event}/publish', [CommunityOwnerEventController::class, 'publish'])->name('events.publish');
        Route::post('/events/{event}/cancel', [CommunityOwnerEventController::class, 'cancel'])->name('events.cancel');
        Route::post('/events/{event}/archive', [CommunityOwnerEventController::class, 'archive'])->name('events.archive');

        // Event Participants
        Route::get('/events/{event}/participants', [CommunityOwnerEventParticipantController::class, 'index'])->name('events.participants.index');
        Route::get('/events/{event}/participants/export', [CommunityOwnerEventParticipantController::class, 'export'])->name('events.participants.export');
        Route::post('/events/{event}/participants/{registration}/approve', [CommunityOwnerEventParticipantController::class, 'approve'])->name('events.participants.approve');
        Route::post('/events/{event}/participants/{registration}/reject', [CommunityOwnerEventParticipantController::class, 'reject'])->name('events.participants.reject');
        Route::post('/events/{event}/participants/{registration}/mark-attended', [CommunityOwnerEventParticipantController::class, 'markAttended'])->name('events.participants.mark-attended');
        Route::post('/events/{event}/participants/{registration}/cancel', [CommunityOwnerEventParticipantController::class, 'cancelParticipant'])->name('events.participants.cancel');

        // Event Volunteer Campaign
        Route::get('/events/{event}/volunteer-campaign', [CommunityOwnerEventVolunteerCampaignController::class, 'show'])->name('events.volunteer-campaign.show');
        Route::get('/events/{event}/volunteer-campaign/create', [CommunityOwnerEventVolunteerCampaignController::class, 'create'])->name('events.volunteer-campaign.create');
        Route::post('/events/{event}/volunteer-campaign', [CommunityOwnerEventVolunteerCampaignController::class, 'store'])->name('events.volunteer-campaign.store');
        Route::get('/events/{event}/volunteer-campaign/{campaign}/edit', [CommunityOwnerEventVolunteerCampaignController::class, 'edit'])->name('events.volunteer-campaign.edit');
        Route::put('/events/{event}/volunteer-campaign/{campaign}', [CommunityOwnerEventVolunteerCampaignController::class, 'update'])->name('events.volunteer-campaign.update');
        Route::post('/events/{event}/volunteer-campaign/{campaign}/open', [CommunityOwnerEventVolunteerCampaignController::class, 'open'])->name('events.volunteer-campaign.open');
        Route::post('/events/{event}/volunteer-campaign/{campaign}/close', [CommunityOwnerEventVolunteerCampaignController::class, 'close'])->name('events.volunteer-campaign.close');
        Route::delete('/events/{event}/volunteer-campaign/{campaign}', [CommunityOwnerEventVolunteerCampaignController::class, 'destroy'])->name('events.volunteer-campaign.destroy');

        // Event Volunteer Applications
        Route::get('/events/{event}/volunteer-campaign/{campaign}/applications', [CommunityOwnerEventVolunteerApplicationController::class, 'index'])->name('events.volunteer-applications.index');
        Route::get('/events/{event}/volunteer-campaign/{campaign}/applications/{application}', [CommunityOwnerEventVolunteerApplicationController::class, 'show'])->name('events.volunteer-applications.show');
        Route::post('/events/{event}/volunteer-campaign/{campaign}/applications/{application}/accept', [CommunityOwnerEventVolunteerApplicationController::class, 'accept'])->name('events.volunteer-applications.accept');
        Route::post('/events/{event}/volunteer-campaign/{campaign}/applications/{application}/reject', [CommunityOwnerEventVolunteerApplicationController::class, 'reject'])->name('events.volunteer-applications.reject');

        // Event Volunteers
        Route::get('/events/{event}/volunteers', [CommunityOwnerEventVolunteerController::class, 'index'])->name('events.volunteers.index');
        Route::get('/events/{event}/volunteers/export', [CommunityOwnerEventVolunteerController::class, 'export'])->name('events.volunteers.export');
        Route::post('/events/{event}/volunteers/{volunteer}/activate', [CommunityOwnerEventVolunteerController::class, 'activate'])->name('events.volunteers.activate');
        Route::post('/events/{event}/volunteers/{volunteer}/deactivate', [CommunityOwnerEventVolunteerController::class, 'deactivate'])->name('events.volunteers.deactivate');
        Route::delete('/events/{event}/volunteers/{volunteer}', [CommunityOwnerEventVolunteerController::class, 'destroy'])->name('events.volunteers.destroy');

        // Event Donations (EventDonation model)
        Route::get('/events/{event}/donations', [CommunityOwnerEventDonationController::class, 'index'])->name('events.donations.index');
        Route::get('/events/{event}/donations/export', [CommunityOwnerEventDonationController::class, 'export'])->name('events.donations.export');
        Route::post('/events/{event}/donations/{donation}/verify', [CommunityOwnerEventDonationController::class, 'verify'])->name('events.donations.verify');
        Route::post('/events/{event}/donations/{donation}/reject', [CommunityOwnerEventDonationController::class, 'reject'])->name('events.donations.reject');

        // Event Finance
        Route::get('/events/{event}/finance', [CommunityOwnerEventFinanceController::class, 'index'])->name('events.finance.index');
        Route::get('/events/{event}/finance/create', [CommunityOwnerEventFinanceController::class, 'create'])->name('events.finance.create');
        Route::post('/events/{event}/finance', [CommunityOwnerEventFinanceController::class, 'store'])->name('events.finance.store');
        Route::get('/events/{event}/finance/{transaction}/edit', [CommunityOwnerEventFinanceController::class, 'edit'])->name('events.finance.edit');
        Route::put('/events/{event}/finance/{transaction}', [CommunityOwnerEventFinanceController::class, 'update'])->name('events.finance.update');
        Route::post('/events/{event}/finance/{transaction}/verify', [CommunityOwnerEventFinanceController::class, 'verify'])->name('events.finance.verify');
        Route::post('/events/{event}/finance/{transaction}/reject', [CommunityOwnerEventFinanceController::class, 'reject'])->name('events.finance.reject');
        Route::delete('/events/{event}/finance/{transaction}', [CommunityOwnerEventFinanceController::class, 'destroy'])->name('events.finance.destroy');
        Route::get('/events/{event}/finance/export', [CommunityOwnerEventFinanceController::class, 'export'])->name('events.finance.export');

        // Event Gallery
        Route::get('/events/{event}/galleries', [CommunityOwnerEventGalleryController::class, 'index'])->name('events.galleries.index');
        Route::post('/events/{event}/galleries', [CommunityOwnerEventGalleryController::class, 'store'])->name('events.galleries.store');
        Route::delete('/events/{event}/galleries/{gallery}', [CommunityOwnerEventGalleryController::class, 'destroy'])->name('events.galleries.destroy');

        // Event Chat (Forum)
        Route::get('/events/{event}/chats', [CommunityOwnerEventChatController::class, 'index'])->name('events.chats.index');
        Route::post('/events/{event}/chats', [CommunityOwnerEventChatController::class, 'store'])->name('events.chats.store');
        Route::get('/events/{event}/chats/{chat}', [CommunityOwnerEventChatController::class, 'show'])->name('events.chats.show');
        Route::post('/events/{event}/chats/{chat}/pin', [CommunityOwnerEventChatController::class, 'togglePin'])->name('events.chats.pin');
        Route::delete('/events/{event}/chats/{chat}', [CommunityOwnerEventChatController::class, 'destroy'])->name('events.chats.destroy');
        Route::post('/events/{event}/chats/{chat}/threads/{thread}/approve', [CommunityOwnerEventChatController::class, 'approveThread'])->name('events.chats.approve-thread');
        Route::post('/events/{event}/chats/{chat}/threads/{thread}/reject', [CommunityOwnerEventChatController::class, 'rejectThread'])->name('events.chats.reject-thread');

        // Community Collaboration (incoming & outgoing)
        Route::get('/collaborations', [CommunityCollaborationController::class, 'index'])->name('collaborations.index');
        Route::get('/collaborations/create', [CommunityCollaborationController::class, 'create'])->name('collaborations.create');
        Route::post('/collaborations', [CommunityCollaborationController::class, 'store'])->name('collaborations.store');
        Route::get('/collaborations/{collaboration}', [CommunityCollaborationController::class, 'show'])->name('collaborations.show');
        Route::post('/collaborations/{collaboration}/accept', [CommunityCollaborationController::class, 'accept'])->name('collaborations.accept');
        Route::post('/collaborations/{collaboration}/reject', [CommunityCollaborationController::class, 'reject'])->name('collaborations.reject');
        Route::post('/collaborations/{collaboration}/cancel', [CommunityCollaborationController::class, 'cancel'])->name('collaborations.cancel');
        Route::post('/collaborations/{collaboration}/complete', [CommunityCollaborationController::class, 'complete'])->name('collaborations.complete');

        // Collaboration Proposals (new system - from brand/company)
        Route::get('/proposals', [\App\Http\Controllers\CommunityOwner\ProposalCollaborationController::class, 'index'])->name('proposals.index');
        Route::get('/proposals/{proposal}', [\App\Http\Controllers\CommunityOwner\ProposalCollaborationController::class, 'show'])->name('proposals.show');
        Route::post('/proposals/{proposal}/review', [\App\Http\Controllers\CommunityOwner\ProposalCollaborationController::class, 'review'])->name('proposals.review');
        Route::post('/proposals/{proposal}/accept', [\App\Http\Controllers\CommunityOwner\ProposalCollaborationController::class, 'accept'])->name('proposals.accept');
        Route::post('/proposals/{proposal}/reject', [\App\Http\Controllers\CommunityOwner\ProposalCollaborationController::class, 'reject'])->name('proposals.reject');
        Route::post('/proposals/{proposal}/complete', [\App\Http\Controllers\CommunityOwner\ProposalCollaborationController::class, 'complete'])->name('proposals.complete');
        Route::post('/proposals/{proposal}/cancel', [\App\Http\Controllers\CommunityOwner\ProposalCollaborationController::class, 'cancel'])->name('proposals.cancel');
        Route::get('/proposals/export', [\App\Http\Controllers\CommunityOwner\ProposalCollaborationController::class, 'export'])->name('proposals.export');

        // Community Wallet
        Route::get('/wallet', [CommunityWalletController::class, 'index'])->name('wallet.index');

        // Donations Management
        Route::get('/donations', [CommunityOwnerDonationController::class, 'index'])->name('donations.index');
        Route::get('/donations/{donation}', [CommunityOwnerDonationController::class, 'show'])->name('donations.show');
        Route::post('/donations/{donation}/confirm', [CommunityOwnerDonationController::class, 'confirm'])->name('donations.confirm');
        Route::post('/donations/{donation}/reject', [CommunityOwnerDonationController::class, 'reject'])->name('donations.reject');
    });

    // ─── Brand Owner Routes ─────────────────────────────────
    Route::prefix('brand')->name('brand.')->middleware('role:brand_owner|brand_staff')->group(function () {
        Route::get('/dashboard', [BrandOwnerDashboardController::class, 'index'])->name('dashboard');

        // Brand CRUD
        Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
        Route::get('/brands/create', [BrandController::class, 'create'])->name('brands.create');
        Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
        Route::get('/brands/{brand}', [BrandController::class, 'show'])->name('brands.show');
        Route::get('/brands/{brand}/edit', [BrandController::class, 'edit'])->name('brands.edit');
        Route::put('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update');
        Route::post('/brands/{brand}/archive', [BrandController::class, 'destroy'])->name('brands.archive');
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

        // Brand Ownership Transfer
        Route::get('/brands/{brand}/transfer-owner', [BrandOwnershipTransferController::class, 'show'])->name('brands.transfer-owner');
        Route::post('/brands/{brand}/transfer-owner', [BrandOwnershipTransferController::class, 'store'])->name('brands.transfer-owner.store');

        // Campaign CRUD
        Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
        Route::get('/campaigns/create', [CampaignController::class, 'create'])->name('campaigns.create');
        Route::post('/campaigns', [CampaignController::class, 'store'])->name('campaigns.store');
        Route::get('/campaigns/{campaign}', [CampaignController::class, 'show'])->name('campaigns.show');
        Route::get('/campaigns/{campaign}/edit', [CampaignController::class, 'edit'])->name('campaigns.edit');
        Route::put('/campaigns/{campaign}', [CampaignController::class, 'update'])->name('campaigns.update');
        Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');

        // Collaboration Requests (legacy)
        Route::get('/collaborations', [CollaborationController::class, 'index'])->name('collaborations.index');
        Route::get('/collaborations/create', [CollaborationController::class, 'create'])->name('collaborations.create');
        Route::post('/collaborations', [CollaborationController::class, 'store'])->name('collaborations.store');
        Route::get('/collaborations/{collaboration}', [CollaborationController::class, 'show'])->name('collaborations.show');
        Route::delete('/collaborations/{collaboration}', [CollaborationController::class, 'destroy'])->name('collaborations.destroy');

        // Collaboration Proposals (new system)
        Route::get('/proposals', [BrandProposalCollaborationController::class, 'index'])->name('proposals.index');
        Route::get('/proposals/create', [BrandProposalCollaborationController::class, 'create'])->name('proposals.create');
        Route::post('/proposals', [BrandProposalCollaborationController::class, 'store'])->name('proposals.store');
        Route::get('/proposals/{proposal}', [BrandProposalCollaborationController::class, 'show'])->name('proposals.show');
        Route::get('/proposals/{proposal}/edit', [BrandProposalCollaborationController::class, 'edit'])->name('proposals.edit');
        Route::put('/proposals/{proposal}', [BrandProposalCollaborationController::class, 'update'])->name('proposals.update');
        Route::post('/proposals/{proposal}/send', [BrandProposalCollaborationController::class, 'send'])->name('proposals.send');
        Route::post('/proposals/{proposal}/cancel', [BrandProposalCollaborationController::class, 'cancel'])->name('proposals.cancel');
        Route::get('/proposals/export', [BrandProposalCollaborationController::class, 'export'])->name('proposals.export');

        // Staff Management
        Route::get('/brands/{brand}/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::post('/brands/{brand}/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::delete('/brands/{brand}/staff/{member}', [StaffController::class, 'remove'])->name('staff.remove');
        Route::get('/brands/{brand}/staff/search', [StaffController::class, 'searchUsers'])->name('staff.search-users');

        // Community Directory (browsing approved communities)
        Route::get('/communities', [BrandCommunityDirectoryController::class, 'index'])->name('community-directory.index');
        Route::get('/communities/{community}', [BrandCommunityDirectoryController::class, 'show'])->name('community-directory.show');

        // Settings
        Route::get('/settings/profile', [BrandSettingController::class, 'profile'])->name('settings.profile');
        Route::put('/settings/profile', [BrandSettingController::class, 'updateProfile'])->name('settings.profile.update');
    });

    // ─── Company Owner Routes ──────────────────────────────
    Route::prefix('company-owner')->name('company-owner.')->middleware('role:company_owner|superadmin')->group(function () {
        Route::get('/dashboard', [CompanyOwnerDashboardController::class, 'index'])->name('dashboard');

        // Company CRUD
        Route::get('/companies', [CompanyOwnerCompanyController::class, 'index'])->name('companies.index');
        Route::get('/companies/create', [CompanyOwnerCompanyController::class, 'create'])->name('companies.create');
        Route::post('/companies', [CompanyOwnerCompanyController::class, 'store'])->name('companies.store');
        Route::get('/companies/{company}', [CompanyOwnerCompanyController::class, 'show'])->name('companies.show');
        Route::get('/companies/{company}/edit', [CompanyOwnerCompanyController::class, 'edit'])->name('companies.edit');
        Route::put('/companies/{company}', [CompanyOwnerCompanyController::class, 'update'])->name('companies.update');
        Route::post('/companies/{company}/archive', [CompanyOwnerCompanyController::class, 'archive'])->name('companies.archive');
        Route::delete('/companies/{company}', [CompanyOwnerCompanyController::class, 'destroy'])->name('companies.destroy');

        // Company Brands Management
        Route::get('/companies/{company}/brands', [CompanyOwnerBrandController::class, 'index'])->name('companies.brands.index');
        Route::get('/companies/{company}/brands/create', [CompanyOwnerBrandController::class, 'create'])->name('companies.brands.create');
        Route::post('/companies/{company}/brands', [CompanyOwnerBrandController::class, 'store'])->name('companies.brands.store');
        Route::post('/companies/{company}/brands/{brand}/attach', [CompanyOwnerBrandController::class, 'attach'])->name('companies.brands.attach');
        Route::post('/companies/{company}/brands/{brand}/detach', [CompanyOwnerBrandController::class, 'detach'])->name('companies.brands.detach');

        // Collaboration Proposals
        Route::get('/collaborations', [CompanyOwnerProposalController::class, 'index'])->name('collaborations.index');
        Route::get('/collaborations/create', [CompanyOwnerProposalController::class, 'create'])->name('collaborations.create');
        Route::post('/collaborations', [CompanyOwnerProposalController::class, 'store'])->name('collaborations.store');
        Route::get('/collaborations/{proposal}', [CompanyOwnerProposalController::class, 'show'])->name('collaborations.show');
        Route::post('/collaborations/{proposal}/send', [CompanyOwnerProposalController::class, 'send'])->name('collaborations.send');
        Route::post('/collaborations/{proposal}/cancel', [CompanyOwnerProposalController::class, 'cancel'])->name('collaborations.cancel');
        Route::get('/collaborations/export', [CompanyOwnerProposalController::class, 'export'])->name('collaborations.export');

        // Settings
        Route::get('/settings/profile', [CompanyOwnerSettingController::class, 'profile'])->name('settings.profile');
        Route::put('/settings/profile', [CompanyOwnerSettingController::class, 'updateProfile'])->name('settings.profile.update');
    });

    // ─── Superadmin Routes ──────────────────────────────────
    Route::prefix('superadmin')->name('superadmin.')->middleware('admin')->group(function () {
        Route::get('/dashboard', [SuperadminDashboardController::class, 'index'])->name('dashboard');

        // Approval Center
        Route::get('/approval-center', [SuperadminApprovalCenterController::class, 'index'])->name('approval-center.index');
        Route::post('/approval-center/role-requests/{roleRequest}/approve', [SuperadminApprovalCenterController::class, 'approveRoleRequest'])->name('approval-center.role-requests.approve');
        Route::post('/approval-center/role-requests/{roleRequest}/reject', [SuperadminApprovalCenterController::class, 'rejectRoleRequest'])->name('approval-center.role-requests.reject');
        Route::post('/approval-center/communities/{community}/approve', [SuperadminApprovalCenterController::class, 'approveCommunity'])->name('approval-center.communities.approve');
        Route::post('/approval-center/communities/{community}/reject', [SuperadminApprovalCenterController::class, 'rejectCommunity'])->name('approval-center.communities.reject');
        Route::post('/approval-center/brands/{brand}/approve', [SuperadminApprovalCenterController::class, 'approveBrand'])->name('approval-center.brands.approve');
        Route::post('/approval-center/brands/{brand}/reject', [SuperadminApprovalCenterController::class, 'rejectBrand'])->name('approval-center.brands.reject');
        Route::post('/approval-center/events/{event}/approve', [SuperadminApprovalCenterController::class, 'approveEvent'])->name('approval-center.events.approve');
        Route::post('/approval-center/events/{event}/reject', [SuperadminApprovalCenterController::class, 'rejectEvent'])->name('approval-center.events.reject');
        Route::post('/approval-center/payments/{payment}/confirm', [SuperadminApprovalCenterController::class, 'confirmPayment'])->name('approval-center.payments.confirm');
        Route::post('/approval-center/payments/{payment}/reject', [SuperadminApprovalCenterController::class, 'rejectPayment'])->name('approval-center.payments.reject');
        Route::post('/approval-center/collaborations/{collaboration}/{status}', [SuperadminApprovalCenterController::class, 'updateCollaborationStatus'])->name('approval-center.collaborations.update');

        // Role Request Management
        Route::get('/role-requests', [\App\Http\Controllers\Superadmin\RoleRequestController::class, 'index'])->name('role-requests.index');
        Route::get('/role-requests/{roleRequest}', [\App\Http\Controllers\Superadmin\RoleRequestController::class, 'show'])->name('role-requests.show');
        Route::post('/role-requests/{roleRequest}/approve', [\App\Http\Controllers\Superadmin\RoleRequestController::class, 'approve'])->name('role-requests.approve');
        Route::post('/role-requests/{roleRequest}/reject', [\App\Http\Controllers\Superadmin\RoleRequestController::class, 'reject'])->name('role-requests.reject');

        // User Management
        Route::get('/users', [SuperadminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [SuperadminUserController::class, 'show'])->name('users.show');
        Route::post('/users/{user}/suspend', [SuperadminUserController::class, 'suspend'])->name('users.suspend');
        Route::post('/users/{user}/ban', [SuperadminUserController::class, 'ban'])->name('users.ban');
        Route::post('/users/{user}/activate', [SuperadminUserController::class, 'activate'])->name('users.activate');

        // Community Management
        Route::get('/communities', [SuperadminCommunityController::class, 'index'])->name('communities.index');
        Route::get('/communities/{community}', [SuperadminCommunityController::class, 'show'])->name('communities.show');
        Route::post('/communities/{community}/approve', [SuperadminCommunityController::class, 'approve'])->name('communities.approve');
        Route::post('/communities/{community}/reject', [SuperadminCommunityController::class, 'reject'])->name('communities.reject');
        Route::post('/communities/{community}/suspend', [SuperadminCommunityController::class, 'suspend'])->name('communities.suspend');
        Route::delete('/communities/{community}', [SuperadminCommunityController::class, 'destroy'])->name('communities.destroy');

        // Brand Management
        Route::get('/brands', [SuperadminBrandController::class, 'index'])->name('brands.index');
        Route::get('/brands/{brand}', [SuperadminBrandController::class, 'show'])->name('brands.show');
        Route::post('/brands/{brand}/approve', [SuperadminBrandController::class, 'approve'])->name('brands.approve');
        Route::post('/brands/{brand}/reject', [SuperadminBrandController::class, 'reject'])->name('brands.reject');
        Route::post('/brands/{brand}/verify', [SuperadminBrandController::class, 'verify'])->name('brands.verify');
        Route::post('/brands/{brand}/suspend', [SuperadminBrandController::class, 'suspend'])->name('brands.suspend');
        Route::delete('/brands/{brand}', [SuperadminBrandController::class, 'destroy'])->name('brands.destroy');

        // Category Management
        Route::get('/categories', [SuperadminCategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', [SuperadminCategoryController::class, 'create'])->name('categories.create');
        Route::post('/categories', [SuperadminCategoryController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category}/edit', [SuperadminCategoryController::class, 'edit'])->name('categories.edit');
        Route::put('/categories/{category}', [SuperadminCategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [SuperadminCategoryController::class, 'destroy'])->name('categories.destroy');

        // Master Region Management
        Route::get('/regions', [SuperadminMasterRegionController::class, 'index'])->name('regions.index');
        Route::get('/regions/create', [SuperadminMasterRegionController::class, 'create'])->name('regions.create');
        Route::post('/regions', [SuperadminMasterRegionController::class, 'store'])->name('regions.store');
        Route::get('/regions/{region}/edit', [SuperadminMasterRegionController::class, 'edit'])->name('regions.edit');
        Route::put('/regions/{region}', [SuperadminMasterRegionController::class, 'update'])->name('regions.update');
        Route::delete('/regions/{region}', [SuperadminMasterRegionController::class, 'destroy'])->name('regions.destroy');

        // Audit Logs
        Route::get('/audit-logs', [SuperadminAuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/audit-logs/{auditLog}', [SuperadminAuditLogController::class, 'show'])->name('audit-logs.show');

        // Wallet Management
        Route::get('/wallets', [SuperadminWalletController::class, 'index'])->name('wallets.index');
        Route::get('/wallets/{user}', [SuperadminWalletController::class, 'show'])->name('wallets.show');
        Route::post('/wallets/{user}/adjust', [SuperadminWalletController::class, 'adjust'])->name('wallets.adjust');

        // Donation Management
        Route::get('/donations', [SuperadminDonationController::class, 'index'])->name('donations.index');
        Route::get('/donations/{donation}', [SuperadminDonationController::class, 'show'])->name('donations.show');
        Route::post('/donations/{donation}/confirm', [SuperadminDonationController::class, 'confirm'])->name('donations.confirm');
        Route::post('/donations/{donation}/reject', [SuperadminDonationController::class, 'reject'])->name('donations.reject');

        // Platform Fee Reports
        Route::get('/platform-fees', [SuperadminPlatformFeeController::class, 'index'])->name('platform-fees.index');
        Route::get('/platform-fees/{platformFee}', [SuperadminPlatformFeeController::class, 'show'])->name('platform-fees.show');

        // ─── Members (Enhanced User Management) ──────────────
        Route::get('/members', [SuperadminMemberController::class, 'index'])->name('members.index');
        Route::get('/members/export', [SuperadminMemberController::class, 'export'])->name('members.export');
        Route::get('/members/{user}', [SuperadminMemberController::class, 'show'])->name('members.show');
        Route::get('/members/{user}/edit', [SuperadminMemberController::class, 'edit'])->name('members.edit');
        Route::put('/members/{user}', [SuperadminMemberController::class, 'update'])->name('members.update');
        Route::post('/members/{user}/suspend', [SuperadminMemberController::class, 'suspend'])->name('members.suspend');
        Route::post('/members/{user}/ban', [SuperadminMemberController::class, 'ban'])->name('members.ban');
        Route::post('/members/{user}/activate', [SuperadminMemberController::class, 'activate'])->name('members.activate');
        Route::delete('/members/{user}', [SuperadminMemberController::class, 'destroy'])->name('members.destroy');

        // ─── Community Owners ────────────────────────────────
        Route::get('/community-owners', [SuperadminCommunityOwnerController::class, 'index'])->name('community-owners.index');
        Route::get('/community-owners/export', [SuperadminCommunityOwnerController::class, 'export'])->name('community-owners.export');
        Route::get('/community-owners/{user}', [SuperadminCommunityOwnerController::class, 'show'])->name('community-owners.show');
        Route::get('/community-owners/{user}/communities', [SuperadminCommunityOwnerController::class, 'communities'])->name('community-owners.communities');
        Route::post('/community-owners/{user}/suspend', [SuperadminCommunityOwnerController::class, 'suspend'])->name('community-owners.suspend');
        Route::post('/community-owners/{user}/ban', [SuperadminCommunityOwnerController::class, 'ban'])->name('community-owners.ban');
        Route::post('/community-owners/{user}/activate', [SuperadminCommunityOwnerController::class, 'activate'])->name('community-owners.activate');

        // ─── Brand Owners ────────────────────────────────────
        Route::get('/brand-owners', [SuperadminBrandOwnerController::class, 'index'])->name('brand-owners.index');
        Route::get('/brand-owners/export', [SuperadminBrandOwnerController::class, 'export'])->name('brand-owners.export');
        Route::get('/brand-owners/{user}', [SuperadminBrandOwnerController::class, 'show'])->name('brand-owners.show');
        Route::get('/brand-owners/{user}/brands', [SuperadminBrandOwnerController::class, 'brands'])->name('brand-owners.brands');
        Route::post('/brand-owners/{user}/suspend', [SuperadminBrandOwnerController::class, 'suspend'])->name('brand-owners.suspend');
        Route::post('/brand-owners/{user}/ban', [SuperadminBrandOwnerController::class, 'ban'])->name('brand-owners.ban');
        Route::post('/brand-owners/{user}/activate', [SuperadminBrandOwnerController::class, 'activate'])->name('brand-owners.activate');

        // ─── Companies ───────────────────────────────────────
        Route::get('/companies', [SuperadminCompanyController::class, 'index'])->name('companies.index');
        Route::get('/companies/export', [SuperadminCompanyController::class, 'export'])->name('companies.export');
        Route::get('/companies/{company}', [SuperadminCompanyController::class, 'show'])->name('companies.show');
        Route::post('/companies/{company}/verify', [SuperadminCompanyController::class, 'verify'])->name('companies.verify');
        Route::post('/companies/{company}/suspend', [SuperadminCompanyController::class, 'suspend'])->name('companies.suspend');
        Route::post('/companies/{company}/ban', [SuperadminCompanyController::class, 'ban'])->name('companies.ban');
        Route::post('/companies/{company}/activate', [SuperadminCompanyController::class, 'activate'])->name('companies.activate');
        Route::delete('/companies/{company}', [SuperadminCompanyController::class, 'destroy'])->name('companies.destroy');

        // ─── Collaborations (Proposals) ──────────────────────
        Route::get('/collaborations', [SuperadminCollaborationController::class, 'index'])->name('collaborations.index');
        Route::get('/collaborations/{proposal}', [SuperadminCollaborationController::class, 'show'])->name('collaborations.show');
        Route::post('/collaborations/{proposal}/archive', [SuperadminCollaborationController::class, 'archive'])->name('collaborations.archive');
        Route::get('/collaborations/export', [SuperadminCollaborationController::class, 'export'])->name('collaborations.export');

        // ─── Communities (Enhanced) ──────────────────────────
        Route::post('/communities/{community}/ban', [SuperadminCommunityController::class, 'ban'])->name('communities.ban');
        Route::post('/communities/{community}/activate', [SuperadminCommunityController::class, 'activate'])->name('communities.activate');
        Route::get('/communities/export', [SuperadminCommunityController::class, 'export'])->name('communities.export');
        Route::get('/communities/{community}/transfer-owner', [SuperadminOwnershipTransferController::class, 'showCommunityTransfer'])->name('communities.transfer-owner');
        Route::post('/communities/{community}/transfer-owner', [SuperadminOwnershipTransferController::class, 'storeCommunityTransfer'])->name('communities.transfer-owner.store');

        // ─── Brands (Enhanced) ───────────────────────────────
        Route::post('/brands/{brand}/ban', [SuperadminBrandController::class, 'ban'])->name('brands.ban');
        Route::post('/brands/{brand}/activate', [SuperadminBrandController::class, 'activate'])->name('brands.activate');
        Route::get('/brands/export', [SuperadminBrandController::class, 'export'])->name('brands.export');
        Route::get('/brands/{brand}/transfer-owner', [SuperadminOwnershipTransferController::class, 'showBrandTransfer'])->name('brands.transfer-owner');
        Route::post('/brands/{brand}/transfer-owner', [SuperadminOwnershipTransferController::class, 'storeBrandTransfer'])->name('brands.transfer-owner.store');

        // ─── Events ──────────────────────────────────────────
        Route::get('/events', [SuperadminEventController::class, 'index'])->name('events.index');
        Route::get('/events/export', [SuperadminEventController::class, 'export'])->name('events.export');
        Route::get('/events/{event}', [SuperadminEventController::class, 'show'])->name('events.show');
        Route::post('/events/{event}/cancel', [SuperadminEventController::class, 'cancel'])->name('events.cancel');
        Route::post('/events/{event}/archive', [SuperadminEventController::class, 'archive'])->name('events.archive');
        Route::delete('/events/{event}', [SuperadminEventController::class, 'destroy'])->name('events.destroy');

        // ─── Login Logs ──────────────────────────────────────
        Route::get('/login-logs', [SuperadminLoginLogController::class, 'index'])->name('login-logs.index');
        Route::get('/login-logs/today', [SuperadminLoginLogController::class, 'today'])->name('login-logs.today');

        // ─── Settings ────────────────────────────────────────
        Route::get('/settings/profile', [SuperadminSettingController::class, 'editProfile'])->name('settings.profile');
        Route::put('/settings/profile', [SuperadminSettingController::class, 'updateProfile'])->name('settings.profile.update');
        Route::get('/settings/password', [SuperadminSettingController::class, 'editPassword'])->name('settings.password');
        Route::put('/settings/password', [SuperadminSettingController::class, 'updatePassword'])->name('settings.password.update');

        // ─── Master Data ─────────────────────────────────────
        Route::get('/master-data', [SuperadminInterestController::class, 'masterDataIndex'])->name('master-data.index');
        Route::get('/master-data/interests', [SuperadminInterestController::class, 'index'])->name('master-data.interests.index');
        Route::post('/master-data/interests', [SuperadminInterestController::class, 'store'])->name('master-data.interests.store');
        Route::put('/master-data/interests/{interest}', [SuperadminInterestController::class, 'update'])->name('master-data.interests.update');
        Route::delete('/master-data/interests/{interest}', [SuperadminInterestController::class, 'destroy'])->name('master-data.interests.destroy');
        Route::get('/master-data/event-types', [SuperadminEventTypeController::class, 'index'])->name('master-data.event-types.index');
        Route::post('/master-data/event-types', [SuperadminEventTypeController::class, 'store'])->name('master-data.event-types.store');
        Route::put('/master-data/event-types/{eventType}', [SuperadminEventTypeController::class, 'update'])->name('master-data.event-types.update');
        Route::delete('/master-data/event-types/{eventType}', [SuperadminEventTypeController::class, 'destroy'])->name('master-data.event-types.destroy');

        // ─── CMS Management ───────────────────────────────────
        Route::prefix('cms')->name('cms.')->group(function () {
            Route::get('/', [SuperadminCmsDashboardController::class, 'index'])->name('index');

            // Homepage Sections
            Route::get('/homepage', [SuperadminHomepageSectionController::class, 'index'])->name('homepage.index');
            Route::get('/homepage', [SuperadminHomepageSectionController::class, 'index'])->name('homepage');
            Route::get('/homepage/create', [SuperadminHomepageSectionController::class, 'create'])->name('homepage.create');
            Route::post('/homepage', [SuperadminHomepageSectionController::class, 'store'])->name('homepage.store');
            Route::get('/homepage/{section}/edit', [SuperadminHomepageSectionController::class, 'edit'])->name('homepage.edit');
            Route::put('/homepage/{section}', [SuperadminHomepageSectionController::class, 'update'])->name('homepage.update');
            Route::delete('/homepage/{section}', [SuperadminHomepageSectionController::class, 'destroy'])->name('homepage.destroy');

            // Blogs
            Route::get('/blogs', [SuperadminCmsBlogController::class, 'index'])->name('blogs.index');
            Route::get('/blogs', [SuperadminCmsBlogController::class, 'index'])->name('blogs');
            Route::get('/blogs/create', [SuperadminCmsBlogController::class, 'create'])->name('blogs.create');
            Route::post('/blogs', [SuperadminCmsBlogController::class, 'store'])->name('blogs.store');
            Route::get('/blogs/{blog}/edit', [SuperadminCmsBlogController::class, 'edit'])->name('blogs.edit');
            Route::put('/blogs/{blog}', [SuperadminCmsBlogController::class, 'update'])->name('blogs.update');
            Route::delete('/blogs/{blog}', [SuperadminCmsBlogController::class, 'destroy'])->name('blogs.destroy');
            Route::post('/blogs/{blog}/publish', [SuperadminCmsBlogController::class, 'publish'])->name('blogs.publish');
            Route::post('/blogs/{blog}/archive', [SuperadminCmsBlogController::class, 'archive'])->name('blogs.archive');

            // Pages
            Route::get('/pages', [SuperadminPageController::class, 'index'])->name('pages.index');
            Route::get('/pages', [SuperadminPageController::class, 'index'])->name('pages');
            Route::get('/pages/{page}/edit', [SuperadminPageController::class, 'edit'])->name('pages.edit');
            Route::put('/pages/{page}', [SuperadminPageController::class, 'update'])->name('pages.update');

            // Contact Settings
            Route::get('/contact', [SuperadminContactSettingController::class, 'index'])->name('contact.index');
            Route::get('/contact', [SuperadminContactSettingController::class, 'index'])->name('contact');
            Route::put('/contact', [SuperadminContactSettingController::class, 'update'])->name('contact.update');

            // Suggestions
            Route::get('/suggestions', [SuperadminSuggestionController::class, 'index'])->name('suggestions.index');
            Route::get('/suggestions', [SuperadminSuggestionController::class, 'index'])->name('suggestions');
            Route::get('/suggestions/{suggestion}', [SuperadminSuggestionController::class, 'show'])->name('suggestions.show');
            Route::post('/suggestions/{suggestion}/mark-reviewed', [SuperadminSuggestionController::class, 'markReviewed'])->name('suggestions.mark-reviewed');
            Route::post('/suggestions/{suggestion}/archive', [SuperadminSuggestionController::class, 'archive'])->name('suggestions.archive');
        });

        // ─── Admin Chat ─────────────────────────────────────
        Route::prefix('admin-chat')->name('admin-chat.')->group(function () {
            Route::get('/', [SuperadminAdminChatController::class, 'index'])->name('index');
            Route::get('/create', [SuperadminAdminChatController::class, 'create'])->name('create');
            Route::post('/', [SuperadminAdminChatController::class, 'store'])->name('store');
            Route::get('/search', [SuperadminAdminChatController::class, 'search'])->name('search');
            Route::get('/{conversation}', [SuperadminAdminChatController::class, 'show'])->name('show');
            Route::post('/{conversation}/messages', [SuperadminAdminChatController::class, 'storeMessage'])->name('messages.store');
            Route::post('/{conversation}/read', [SuperadminAdminChatController::class, 'read'])->name('read');
            Route::post('/{conversation}/archive', [SuperadminAdminChatController::class, 'archive'])->name('archive');
            Route::post('/{conversation}/unarchive', [SuperadminAdminChatController::class, 'unarchive'])->name('unarchive');
            Route::post('/{conversation}/participants', [SuperadminAdminChatController::class, 'addParticipant'])->name('participants.add');
            Route::delete('/{conversation}/participants/{participant}', [SuperadminAdminChatController::class, 'removeParticipant'])->name('participants.remove');
        });

        // ─── Documentation ──────────────────────────────────
        Route::prefix('documentation')->name('documentation.')->group(function () {
            Route::get('/', [SuperadminDocumentationController::class, 'index'])->name('index');
            Route::get('/generate', [SuperadminDocumentationController::class, 'generateIndex'])->name('generate.index');
            Route::post('/generate/{documentKey}', [SuperadminDocumentationController::class, 'generateSingle'])->name('generate.single');
            Route::post('/generate-all', [SuperadminDocumentationController::class, 'generateAll'])->name('generate.all');
            Route::get('/{documentationFile}', [SuperadminDocumentationController::class, 'show'])->name('show');
            Route::get('/{documentationFile}/download', [SuperadminDocumentationController::class, 'download'])->name('download');
            Route::get('/{documentationFile}/preview', [SuperadminDocumentationController::class, 'preview'])->name('preview');
            Route::delete('/{documentationFile}', [SuperadminDocumentationController::class, 'destroy'])->name('destroy');
            Route::get('/tools/routes', [SuperadminDocumentationController::class, 'routeInventory'])->name('tools.routes');
            Route::get('/tools/database', [SuperadminDocumentationController::class, 'databaseInventory'])->name('tools.database');
        });
    });
});

// ============================================================
// CRON (token-protected, called by Vercel Cron Jobs)
// ============================================================
Route::get('/api/cron/scheduler', [CronController::class, 'run'])
    ->middleware('cron.token')
    ->name('cron.scheduler');
