<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Guest\HomeController;
use App\Http\Controllers\Guest\CommunityDirectoryController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Member\ProfileController;
use App\Http\Controllers\Member\RoleRequestController;
use App\Http\Controllers\Member\CommunityController as MemberCommunityController;
use App\Http\Controllers\Member\EventController as MemberEventController;
use App\Http\Controllers\Member\EventChatController as MemberEventChatController;
use App\Http\Controllers\CommunityOwner\DashboardController as CommunityOwnerDashboardController;
use App\Http\Controllers\CommunityOwner\CommunityController as CommunityOwnerCommunityController;
use App\Http\Controllers\CommunityOwner\MemberController as CommunityOwnerMemberController;
use App\Http\Controllers\CommunityOwner\RegionController as CommunityOwnerRegionController;
use App\Http\Controllers\CommunityOwner\SubgroupController as CommunityOwnerSubgroupController;
use App\Http\Controllers\CommunityOwner\EventController as CommunityOwnerEventController;
use App\Http\Controllers\CommunityOwner\EventGalleryController as CommunityOwnerEventGalleryController;
use App\Http\Controllers\CommunityOwner\EventChatController as CommunityOwnerEventChatController;
use App\Http\Controllers\CommunityOwner\CommunityCollaborationController as CommunityCollaborationController;
use App\Http\Controllers\BrandOwner\DashboardController as BrandOwnerDashboardController;
use App\Http\Controllers\BrandOwner\BrandController as BrandController;
use App\Http\Controllers\BrandOwner\CampaignController as CampaignController;
use App\Http\Controllers\BrandOwner\CollaborationController as CollaborationController;
use App\Http\Controllers\BrandOwner\StaffController as StaffController;
use App\Http\Controllers\BrandOwner\CommunityDirectoryController as BrandCommunityDirectoryController;
use App\Http\Controllers\Superadmin\DashboardController as SuperadminDashboardController;
use App\Http\Controllers\Superadmin\ApprovalCenterController as SuperadminApprovalCenterController;
use App\Http\Controllers\Superadmin\UserController as SuperadminUserController;
use App\Http\Controllers\Superadmin\CommunityController as SuperadminCommunityController;
use App\Http\Controllers\Superadmin\BrandController as SuperadminBrandController;
use App\Http\Controllers\Superadmin\CategoryController as SuperadminCategoryController;
use App\Http\Controllers\Superadmin\MasterRegionController as SuperadminMasterRegionController;
use App\Http\Controllers\Superadmin\AuditLogController as SuperadminAuditLogController;

// ─── Public Routes ─────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::prefix('komunitas')->name('communities.')->group(function () {
    Route::get('/', [CommunityDirectoryController::class, 'index'])->name('directory');
    Route::get('/{community:slug}', [CommunityDirectoryController::class, 'show'])->name('detail');
});

Route::prefix('events')->name('events.')->group(function () {
    Route::get('/', [MemberEventController::class, 'index'])->name('index');
    Route::get('/{event:slug}', [MemberEventController::class, 'show'])->name('show');
});

// ─── Auth Routes ─────────────────────────────────────────────
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

// ─── Authenticated Routes ────────────────────────────────────
Route::middleware(['auth'])->group(function () {

    // ─── Member Community Actions ──────────────────────────
    Route::post('/komunitas/{community:slug}/join', [MemberCommunityController::class, 'join'])
        ->name('community_action.join');
    Route::post('/komunitas/{community:slug}/leave', [MemberCommunityController::class, 'leave'])
        ->name('community_action.leave');

    // ─── Member Routes ──────────────────────────────────────
    Route::prefix('member')->name('member.')->group(function () {
        Route::get('/dashboard', [MemberDashboardController::class, 'index'])->name('dashboard');
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // Role Request
        Route::get('/role-request', [RoleRequestController::class, 'index'])->name('role-request.index');
        Route::post('/role-request', [RoleRequestController::class, 'store'])->name('role-request.store');

        // Member Event Registration
        Route::post('/events/{event:slug}/register', [MemberEventController::class, 'register'])->name('events.register');
        Route::post('/events/{event:slug}/payment/{registration}', [MemberEventController::class, 'uploadPayment'])->name('events.upload-payment');
        Route::post('/events/{event:slug}/cancel/{registration}', [MemberEventController::class, 'cancelRegistration'])->name('events.cancel');
        Route::get('/my-registrations', [MemberEventController::class, 'myRegistrations'])->name('events.my-registrations');

        // Member Event Chat
        Route::get('/events/{event:slug}/chat/{chat}', [MemberEventChatController::class, 'show'])->name('events.chat.show');
        Route::post('/events/{event:slug}/chat/{chat}/reply', [MemberEventChatController::class, 'storeThread'])->name('events.chat.reply');
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
        Route::put('/brands/{brand}', [BrandOwnerDashboardController::class, 'update'])->name('brands.update');
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy');

        // Campaign CRUD
        Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
        Route::get('/campaigns/create', [CampaignController::class, 'create'])->name('campaigns.create');
        Route::post('/campaigns', [CampaignController::class, 'store'])->name('campaigns.store');
        Route::get('/campaigns/{campaign}', [CampaignController::class, 'show'])->name('campaigns.show');
        Route::get('/campaigns/{campaign}/edit', [CampaignController::class, 'edit'])->name('campaigns.edit');
        Route::put('/campaigns/{campaign}', [CampaignController::class, 'update'])->name('campaigns.update');
        Route::delete('/campaigns/{campaign}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');

        // Collaboration Requests
        Route::get('/collaborations', [CollaborationController::class, 'index'])->name('collaborations.index');
        Route::get('/collaborations/create', [CollaborationController::class, 'create'])->name('collaborations.create');
        Route::post('/collaborations', [CollaborationController::class, 'store'])->name('collaborations.store');
        Route::get('/collaborations/{collaboration}', [CollaborationController::class, 'show'])->name('collaborations.show');
        Route::delete('/collaborations/{collaboration}', [CollaborationController::class, 'destroy'])->name('collaborations.destroy');

        // Staff Management
        Route::get('/brands/{brand}/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::post('/brands/{brand}/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::delete('/brands/{brand}/staff/{member}', [StaffController::class, 'remove'])->name('staff.remove');
        Route::get('/brands/{brand}/staff/search', [StaffController::class, 'searchUsers'])->name('staff.search-users');

        // Community Directory (browsing approved communities)
        Route::get('/communities', [BrandCommunityDirectoryController::class, 'index'])->name('community-directory.index');
        Route::get('/communities/{community}', [BrandCommunityDirectoryController::class, 'show'])->name('community-directory.show');
    });

    // ─── Superadmin Routes ──────────────────────────────────
    Route::prefix('superadmin')->name('superadmin.')->middleware('role:superadmin')->group(function () {
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
    });
});
