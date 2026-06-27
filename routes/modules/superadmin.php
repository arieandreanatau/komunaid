<?php

declare(strict_types=1);

use App\Http\Controllers\Superadmin\AdminChatController as SuperadminAdminChatController;
use App\Http\Controllers\Superadmin\ApprovalCenterController as SuperadminApprovalCenterController;
use App\Http\Controllers\Superadmin\AuditLogController as SuperadminAuditLogController;
use App\Http\Controllers\Superadmin\BrandController as SuperadminBrandController;
use App\Http\Controllers\Superadmin\BrandOwnerController as SuperadminBrandOwnerController;
use App\Http\Controllers\Superadmin\CategoryController as SuperadminCategoryController;
use App\Http\Controllers\Superadmin\Cms\SuperadminBlogController as SuperadminCmsBlogController;
use App\Http\Controllers\Superadmin\Cms\SuperadminCmsDashboardController;
use App\Http\Controllers\Superadmin\Cms\SuperadminContactSettingController;
use App\Http\Controllers\Superadmin\Cms\SuperadminHomepageSectionController;
use App\Http\Controllers\Superadmin\Cms\SuperadminPageController;
use App\Http\Controllers\Superadmin\Cms\SuperadminSuggestionController;
use App\Http\Controllers\Superadmin\CollaborationController as SuperadminCollaborationController;
use App\Http\Controllers\Superadmin\CommunityController as SuperadminCommunityController;
use App\Http\Controllers\Superadmin\CommunityOwnerController as SuperadminCommunityOwnerController;
use App\Http\Controllers\Superadmin\CompanyController as SuperadminCompanyController;
use App\Http\Controllers\Superadmin\DashboardController as SuperadminDashboardController;
use App\Http\Controllers\Superadmin\DocumentationController as SuperadminDocumentationController;
use App\Http\Controllers\Superadmin\DonationController as SuperadminDonationController;
use App\Http\Controllers\Superadmin\EventController as SuperadminEventController;
use App\Http\Controllers\Superadmin\EventTypeController as SuperadminEventTypeController;
use App\Http\Controllers\Superadmin\InterestController as SuperadminInterestController;
use App\Http\Controllers\Superadmin\LoginLogController as SuperadminLoginLogController;
use App\Http\Controllers\Superadmin\MasterRegionController as SuperadminMasterRegionController;
use App\Http\Controllers\Superadmin\MemberController as SuperadminMemberController;
use App\Http\Controllers\Superadmin\OwnershipTransferController as SuperadminOwnershipTransferController;
use App\Http\Controllers\Superadmin\PlatformFeeController as SuperadminPlatformFeeController;
use App\Http\Controllers\Superadmin\RoleRequestController;
use App\Http\Controllers\Superadmin\SettingController as SuperadminSettingController;
use App\Http\Controllers\Superadmin\UserController as SuperadminUserController;
use App\Http\Controllers\Superadmin\WalletController as SuperadminWalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Superadmin Routes
|--------------------------------------------------------------------------
| URL prefix /superadmin, name prefix superadmin.*.
| Middleware: admin (EnsureSuperadmin).
| Note: duplicate ->name() registrations in legacy web.php were consolidated
|       to the .index form (e.g. cms.homepage + cms.homepage.index kept as
|       cms.homepage.index only). Views in layouts/admin.blade.php and
|       superadmin/cms/index.blade.php updated to use the .index form.
*/

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
    Route::get('/role-requests', [RoleRequestController::class, 'index'])->name('role-requests.index');
    Route::get('/role-requests/{roleRequest}', [RoleRequestController::class, 'show'])->name('role-requests.show');
    Route::post('/role-requests/{roleRequest}/approve', [RoleRequestController::class, 'approve'])->name('role-requests.approve');
    Route::post('/role-requests/{roleRequest}/reject', [RoleRequestController::class, 'reject'])->name('role-requests.reject');

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

    // Members (Enhanced User Management)
    Route::get('/members', [SuperadminMemberController::class, 'index'])->name('members.index');
    Route::get('/members/export', [SuperadminMemberController::class, 'export'])->name('members.export');
    Route::get('/members/{user}', [SuperadminMemberController::class, 'show'])->name('members.show');
    Route::get('/members/{user}/edit', [SuperadminMemberController::class, 'edit'])->name('members.edit');
    Route::put('/members/{user}', [SuperadminMemberController::class, 'update'])->name('members.update');
    Route::post('/members/{user}/suspend', [SuperadminMemberController::class, 'suspend'])->name('members.suspend');
    Route::post('/members/{user}/ban', [SuperadminMemberController::class, 'ban'])->name('members.ban');
    Route::post('/members/{user}/activate', [SuperadminMemberController::class, 'activate'])->name('members.activate');
    Route::delete('/members/{user}', [SuperadminMemberController::class, 'destroy'])->name('members.destroy');

    // Community Owners
    Route::get('/community-owners', [SuperadminCommunityOwnerController::class, 'index'])->name('community-owners.index');
    Route::get('/community-owners/export', [SuperadminCommunityOwnerController::class, 'export'])->name('community-owners.export');
    Route::get('/community-owners/{user}', [SuperadminCommunityOwnerController::class, 'show'])->name('community-owners.show');
    Route::get('/community-owners/{user}/communities', [SuperadminCommunityOwnerController::class, 'communities'])->name('community-owners.communities');
    Route::post('/community-owners/{user}/suspend', [SuperadminCommunityOwnerController::class, 'suspend'])->name('community-owners.suspend');
    Route::post('/community-owners/{user}/ban', [SuperadminCommunityOwnerController::class, 'ban'])->name('community-owners.ban');
    Route::post('/community-owners/{user}/activate', [SuperadminCommunityOwnerController::class, 'activate'])->name('community-owners.activate');

    // Brand Owners
    Route::get('/brand-owners', [SuperadminBrandOwnerController::class, 'index'])->name('brand-owners.index');
    Route::get('/brand-owners/export', [SuperadminBrandOwnerController::class, 'export'])->name('brand-owners.export');
    Route::get('/brand-owners/{user}', [SuperadminBrandOwnerController::class, 'show'])->name('brand-owners.show');
    Route::get('/brand-owners/{user}/brands', [SuperadminBrandOwnerController::class, 'brands'])->name('brand-owners.brands');
    Route::post('/brand-owners/{user}/suspend', [SuperadminBrandOwnerController::class, 'suspend'])->name('brand-owners.suspend');
    Route::post('/brand-owners/{user}/ban', [SuperadminBrandOwnerController::class, 'ban'])->name('brand-owners.ban');
    Route::post('/brand-owners/{user}/activate', [SuperadminBrandOwnerController::class, 'activate'])->name('brand-owners.activate');

    // Companies
    Route::get('/companies', [SuperadminCompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/export', [SuperadminCompanyController::class, 'export'])->name('companies.export');
    Route::get('/companies/{company}', [SuperadminCompanyController::class, 'show'])->name('companies.show');
    Route::post('/companies/{company}/verify', [SuperadminCompanyController::class, 'verify'])->name('companies.verify');
    Route::post('/companies/{company}/suspend', [SuperadminCompanyController::class, 'suspend'])->name('companies.suspend');
    Route::post('/companies/{company}/ban', [SuperadminCompanyController::class, 'ban'])->name('companies.ban');
    Route::post('/companies/{company}/activate', [SuperadminCompanyController::class, 'activate'])->name('companies.activate');
    Route::delete('/companies/{company}', [SuperadminCompanyController::class, 'destroy'])->name('companies.destroy');

    // Collaborations (Proposals)
    Route::get('/collaborations', [SuperadminCollaborationController::class, 'index'])->name('collaborations.index');
    Route::get('/collaborations/{proposal}', [SuperadminCollaborationController::class, 'show'])->name('collaborations.show');
    Route::post('/collaborations/{proposal}/archive', [SuperadminCollaborationController::class, 'archive'])->name('collaborations.archive');
    Route::get('/collaborations/export', [SuperadminCollaborationController::class, 'export'])->name('collaborations.export');

    // Communities (Enhanced)
    Route::post('/communities/{community}/ban', [SuperadminCommunityController::class, 'ban'])->name('communities.ban');
    Route::post('/communities/{community}/activate', [SuperadminCommunityController::class, 'activate'])->name('communities.activate');
    Route::get('/communities/export', [SuperadminCommunityController::class, 'export'])->name('communities.export');
    Route::get('/communities/{community}/transfer-owner', [SuperadminOwnershipTransferController::class, 'showCommunityTransfer'])->name('communities.transfer-owner');
    Route::post('/communities/{community}/transfer-owner', [SuperadminOwnershipTransferController::class, 'storeCommunityTransfer'])->name('communities.transfer-owner.store');

    // Brands (Enhanced)
    Route::post('/brands/{brand}/ban', [SuperadminBrandController::class, 'ban'])->name('brands.ban');
    Route::post('/brands/{brand}/activate', [SuperadminBrandController::class, 'activate'])->name('brands.activate');
    Route::get('/brands/export', [SuperadminBrandController::class, 'export'])->name('brands.export');
    Route::get('/brands/{brand}/transfer-owner', [SuperadminOwnershipTransferController::class, 'showBrandTransfer'])->name('brands.transfer-owner');
    Route::post('/brands/{brand}/transfer-owner', [SuperadminOwnershipTransferController::class, 'storeBrandTransfer'])->name('brands.transfer-owner.store');

    // Events
    Route::get('/events', [SuperadminEventController::class, 'index'])->name('events.index');
    Route::get('/events/export', [SuperadminEventController::class, 'export'])->name('events.export');
    Route::get('/events/{event}', [SuperadminEventController::class, 'show'])->name('events.show');
    Route::post('/events/{event}/cancel', [SuperadminEventController::class, 'cancel'])->name('events.cancel');
    Route::post('/events/{event}/archive', [SuperadminEventController::class, 'archive'])->name('events.archive');
    Route::delete('/events/{event}', [SuperadminEventController::class, 'destroy'])->name('events.destroy');

    // Login Logs
    Route::get('/login-logs', [SuperadminLoginLogController::class, 'index'])->name('login-logs.index');
    Route::get('/login-logs/today', [SuperadminLoginLogController::class, 'today'])->name('login-logs.today');

    // Settings
    Route::get('/settings/profile', [SuperadminSettingController::class, 'editProfile'])->name('settings.profile');
    Route::put('/settings/profile', [SuperadminSettingController::class, 'updateProfile'])->name('settings.profile.update');
    Route::get('/settings/password', [SuperadminSettingController::class, 'editPassword'])->name('settings.password');
    Route::put('/settings/password', [SuperadminSettingController::class, 'updatePassword'])->name('settings.password.update');
    Route::post('/settings/reset-demo-passwords', [SuperadminSettingController::class, 'resetDemoPasswords'])->name('settings.reset-demo-passwords');

    // Master Data
    Route::get('/master-data', [SuperadminInterestController::class, 'masterDataIndex'])->name('master-data.index');
    Route::get('/master-data/interests', [SuperadminInterestController::class, 'index'])->name('master-data.interests.index');
    Route::post('/master-data/interests', [SuperadminInterestController::class, 'store'])->name('master-data.interests.store');
    Route::put('/master-data/interests/{interest}', [SuperadminInterestController::class, 'update'])->name('master-data.interests.update');
    Route::delete('/master-data/interests/{interest}', [SuperadminInterestController::class, 'destroy'])->name('master-data.interests.destroy');
    Route::get('/master-data/event-types', [SuperadminEventTypeController::class, 'index'])->name('master-data.event-types.index');
    Route::post('/master-data/event-types', [SuperadminEventTypeController::class, 'store'])->name('master-data.event-types.store');
    Route::put('/master-data/event-types/{eventType}', [SuperadminEventTypeController::class, 'update'])->name('master-data.event-types.update');
    Route::delete('/master-data/event-types/{eventType}', [SuperadminEventTypeController::class, 'destroy'])->name('master-data.event-types.destroy');

    // CMS Management
    Route::prefix('cms')->name('cms.')->group(function () {
        Route::get('/', [SuperadminCmsDashboardController::class, 'index'])->name('index');

        // Homepage Sections
        Route::get('/homepage', [SuperadminHomepageSectionController::class, 'index'])->name('homepage.index');
        Route::get('/homepage/create', [SuperadminHomepageSectionController::class, 'create'])->name('homepage.create');
        Route::post('/homepage', [SuperadminHomepageSectionController::class, 'store'])->name('homepage.store');
        Route::get('/homepage/{section}/edit', [SuperadminHomepageSectionController::class, 'edit'])->name('homepage.edit');
        Route::put('/homepage/{section}', [SuperadminHomepageSectionController::class, 'update'])->name('homepage.update');
        Route::delete('/homepage/{section}', [SuperadminHomepageSectionController::class, 'destroy'])->name('homepage.destroy');

        // Blogs
        Route::get('/blogs', [SuperadminCmsBlogController::class, 'index'])->name('blogs.index');
        Route::get('/blogs/create', [SuperadminCmsBlogController::class, 'create'])->name('blogs.create');
        Route::post('/blogs', [SuperadminCmsBlogController::class, 'store'])->name('blogs.store');
        Route::get('/blogs/{blog}/edit', [SuperadminCmsBlogController::class, 'edit'])->name('blogs.edit');
        Route::put('/blogs/{blog}', [SuperadminCmsBlogController::class, 'update'])->name('blogs.update');
        Route::delete('/blogs/{blog}', [SuperadminCmsBlogController::class, 'destroy'])->name('blogs.destroy');
        Route::post('/blogs/{blog}/publish', [SuperadminCmsBlogController::class, 'publish'])->name('blogs.publish');
        Route::post('/blogs/{blog}/archive', [SuperadminCmsBlogController::class, 'archive'])->name('blogs.archive');

        // Pages
        Route::get('/pages', [SuperadminPageController::class, 'index'])->name('pages.index');
        Route::get('/pages/{page}/edit', [SuperadminPageController::class, 'edit'])->name('pages.edit');
        Route::put('/pages/{page}', [SuperadminPageController::class, 'update'])->name('pages.update');

        // Contact Settings
        Route::get('/contact', [SuperadminContactSettingController::class, 'index'])->name('contact.index');
        Route::put('/contact', [SuperadminContactSettingController::class, 'update'])->name('contact.update');

        // Suggestions
        Route::get('/suggestions', [SuperadminSuggestionController::class, 'index'])->name('suggestions.index');
        Route::get('/suggestions/{suggestion}', [SuperadminSuggestionController::class, 'show'])->name('suggestions.show');
        Route::post('/suggestions/{suggestion}/mark-reviewed', [SuperadminSuggestionController::class, 'markReviewed'])->name('suggestions.mark-reviewed');
        Route::post('/suggestions/{suggestion}/archive', [SuperadminSuggestionController::class, 'archive'])->name('suggestions.archive');
    });

    // Admin Chat
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

    // Documentation
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
