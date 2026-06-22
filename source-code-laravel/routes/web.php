<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\PublicCommunityController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\Superadmin\DashboardController as SADashboard;
use App\Http\Controllers\Superadmin\MemberController as SAMember;
use App\Http\Controllers\Superadmin\CommunityController as SACommunity;
use App\Http\Controllers\Superadmin\BrandController as SABrand;
use App\Http\Controllers\Superadmin\EventController as SAEvent;
use App\Http\Controllers\Superadmin\RoleRequestController as SARoleRequest;
use App\Http\Controllers\Superadmin\ApprovalController as SAApproval;
use App\Http\Controllers\CommunityOwner\DashboardController as CODashboard;
use App\Http\Controllers\CommunityOwner\CommunityController as COCommunity;
use App\Http\Controllers\CommunityOwner\MemberController as COMember;
use App\Http\Controllers\CommunityOwner\EventController as COEvent;
use App\Http\Controllers\CommunityOwner\PostController as COPost;
use App\Http\Controllers\CommunityOwner\MessageController as COMessage;
use App\Http\Controllers\CommunityOwner\CollaborationController as COCollaboration;
use App\Http\Controllers\BrandOwner\DashboardController as BODashboard;
use App\Http\Controllers\BrandOwner\BrandController as BOBrand;
use App\Http\Controllers\BrandOwner\CampaignController as BOCampaign;
use App\Http\Controllers\BrandOwner\CollaborationController as BOCollaboration;
use App\Http\Controllers\BrandOwner\CommunityController as BOCommunity;
use App\Http\Controllers\BrandOwner\StaffController as BOStaff;
use App\Http\Controllers\Member\DashboardController as MemberDashboard;
use App\Http\Controllers\Member\ProfileController as MemberProfile;
use App\Http\Controllers\Member\CommunityController as MemberCommunity;
use App\Http\Controllers\Member\EventController as MemberEvent;
use App\Http\Controllers\Member\WalletController as MemberWallet;
use App\Http\Controllers\Member\RoleRequestController as MemberRoleRequest;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/communities', [PublicCommunityController::class, 'index'])->name('public.communities');
Route::get('/communities/{slug}', [PublicCommunityController::class, 'show'])->name('public.community-detail');

// Dashboard redirect
Route::get('/dashboard', DashboardRedirectController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Superadmin Routes
Route::middleware(['auth', 'role:superadmin'])->prefix('superadmin')->name('superadmin.')->group(function () {
    Route::get('/dashboard', [SADashboard::class, 'index'])->name('dashboard');
    Route::get('/members', [SAMember::class, 'index'])->name('members.index');
    Route::get('/members/{user}', [SAMember::class, 'show'])->name('members.show');
    Route::get('/communities', [SACommunity::class, 'index'])->name('communities.index');
    Route::get('/communities/{community}', [SACommunity::class, 'show'])->name('communities.show');
    Route::put('/communities/{community}/approve', [SACommunity::class, 'approve'])->name('communities.approve');
    Route::put('/communities/{community}/reject', [SACommunity::class, 'reject'])->name('communities.reject');
    Route::get('/brands', [SABrand::class, 'index'])->name('brands.index');
    Route::put('/brands/{brand}/approve', [SABrand::class, 'approve'])->name('brands.approve');
    Route::put('/brands/{brand}/reject', [SABrand::class, 'reject'])->name('brands.reject');
    Route::get('/events', [SAEvent::class, 'index'])->name('events.index');
    Route::put('/events/{event}/approve', [SAEvent::class, 'approve'])->name('events.approve');
    Route::put('/events/{event}/reject', [SAEvent::class, 'reject'])->name('events.reject');
    Route::get('/role-requests', [SARoleRequest::class, 'index'])->name('role-requests.index');
    Route::put('/role-requests/{roleRequest}/approve', [SARoleRequest::class, 'approve'])->name('role-requests.approve');
    Route::put('/role-requests/{roleRequest}/reject', [SARoleRequest::class, 'reject'])->name('role-requests.reject');
    Route::get('/approvals', [SAApproval::class, 'index'])->name('approvals.index');
});

// Community Owner Routes
Route::middleware(['auth', 'role:community_owner'])->prefix('community-owner')->name('community-owner.')->group(function () {
    Route::get('/dashboard', [CODashboard::class, 'index'])->name('dashboard');
    Route::resource('communities', COCommunity::class)->except(['show']);
    Route::get('/communities/{community}/members', [COMember::class, 'index'])->name('communities.members.index');
    Route::put('/communities/{community}/members/{member}/approve', [COMember::class, 'approve'])->name('communities.members.approve');
    Route::put('/communities/{community}/members/{member}/reject', [COMember::class, 'reject'])->name('communities.members.reject');
    Route::put('/communities/{community}/members/{member}/remove', [COMember::class, 'remove'])->name('communities.members.remove');
    Route::get('/communities/{community}/events', [COEvent::class, 'index'])->name('communities.events.index');
    Route::get('/communities/{community}/events/create', [COEvent::class, 'create'])->name('communities.events.create');
    Route::post('/communities/{community}/events', [COEvent::class, 'store'])->name('communities.events.store');
    Route::get('/communities/{community}/events/{event}/edit', [COEvent::class, 'edit'])->name('communities.events.edit');
    Route::put('/communities/{community}/events/{event}', [COEvent::class, 'update'])->name('communities.events.update');
    Route::delete('/communities/{community}/events/{event}', [COEvent::class, 'destroy'])->name('communities.events.destroy');
    Route::get('/communities/{community}/posts', [COPost::class, 'index'])->name('communities.posts.index');
    Route::post('/communities/{community}/posts', [COPost::class, 'store'])->name('communities.posts.store');
    Route::delete('/communities/{community}/posts/{post}', [COPost::class, 'destroy'])->name('communities.posts.destroy');
    Route::get('/communities/{community}/messages', [COMessage::class, 'index'])->name('communities.messages.index');
    Route::post('/communities/{community}/messages', [COMessage::class, 'store'])->name('communities.messages.store');
    Route::get('/communities/{community}/collaborations', [COCollaboration::class, 'index'])->name('communities.collaborations.index');
    Route::put('/collaborations/{collaboration}/approve', [COCollaboration::class, 'approve'])->name('collaborations.approve');
    Route::put('/collaborations/{collaboration}/reject', [COCollaboration::class, 'reject'])->name('collaborations.reject');
});

// Brand Owner Routes
Route::middleware(['auth', 'role:brand_owner'])->prefix('brand-owner')->name('brand-owner.')->group(function () {
    Route::get('/dashboard', [BODashboard::class, 'index'])->name('dashboard');

    // Brand CRUD
    Route::get('/brands', [BOBrand::class, 'index'])->name('brands.index');
    Route::get('/brands/create', [BOBrand::class, 'create'])->name('brands.create');
    Route::post('/brands', [BOBrand::class, 'store'])->name('brands.store');
    Route::get('/brands/{brand}', [BOBrand::class, 'show'])->name('brands.show');
    Route::get('/brands/{brand}/edit', [BOBrand::class, 'edit'])->name('brands.edit');
    Route::put('/brands/{brand}', [BOBrand::class, 'update'])->name('brands.update');
    Route::delete('/brands/{brand}', [BOBrand::class, 'destroy'])->name('brands.destroy');

    // Campaign CRUD
    Route::get('/campaigns', [BOCampaign::class, 'index'])->name('campaigns.index');
    Route::get('/campaigns/create', [BOCampaign::class, 'create'])->name('campaigns.create');
    Route::post('/campaigns', [BOCampaign::class, 'store'])->name('campaigns.store');
    Route::get('/campaigns/{campaign}', [BOCampaign::class, 'show'])->name('campaigns.show');
    Route::get('/campaigns/{campaign}/edit', [BOCampaign::class, 'edit'])->name('campaigns.edit');
    Route::put('/campaigns/{campaign}', [BOCampaign::class, 'update'])->name('campaigns.update');
    Route::delete('/campaigns/{campaign}', [BOCampaign::class, 'destroy'])->name('campaigns.destroy');

    // Collaboration
    Route::get('/collaborations', [BOCollaboration::class, 'index'])->name('collaborations.index');
    Route::get('/collaborations/create', [BOCollaboration::class, 'create'])->name('collaborations.create');
    Route::post('/collaborations', [BOCollaboration::class, 'store'])->name('collaborations.store');
    Route::get('/collaborations/{collaboration}', [BOCollaboration::class, 'show'])->name('collaborations.show');

    // Staff Management
    Route::get('/brands/{brand}/staff', [BOStaff::class, 'index'])->name('staff.index');
    Route::post('/brands/{brand}/staff', [BOStaff::class, 'store'])->name('staff.store');
    Route::delete('/brands/{brand}/staff/{member}', [BOStaff::class, 'remove'])->name('staff.remove');
    Route::get('/brands/{brand}/staff/search', [BOStaff::class, 'searchUsers'])->name('staff.search-users');

    // Community Directory
    Route::get('/communities', [BOCommunity::class, 'index'])->name('communities.index');
    Route::get('/communities/{community}', [BOCommunity::class, 'show'])->name('communities.show');
});

// Member Routes
Route::middleware(['auth', 'role:member,community_owner,brand_owner,superadmin'])->prefix('member')->name('member.')->group(function () {
    Route::get('/dashboard', [MemberDashboard::class, 'index'])->name('dashboard');
    Route::get('/profile', [MemberProfile::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [MemberProfile::class, 'update'])->name('profile.update');
    Route::get('/communities', [MemberCommunity::class, 'index'])->name('communities.index');
    Route::post('/communities/{community}/join', [MemberCommunity::class, 'join'])->name('communities.join');
    Route::post('/communities/{community}/leave', [MemberCommunity::class, 'leave'])->name('communities.leave');
    Route::get('/events', [MemberEvent::class, 'index'])->name('events.index');
    Route::post('/events/{event}/register', [MemberEvent::class, 'register'])->name('events.register');
    Route::post('/events/{event}/cancel', [MemberEvent::class, 'cancel'])->name('events.cancel');
    Route::get('/wallet', [MemberWallet::class, 'index'])->name('wallet.index');
    Route::post('/wallet/topup', [MemberWallet::class, 'topup'])->name('wallet.topup');
    Route::get('/wallet/history', [MemberWallet::class, 'history'])->name('wallet.history');
    Route::get('/role-request', [MemberRoleRequest::class, 'create'])->name('role-request.create');
    Route::post('/role-request', [MemberRoleRequest::class, 'store'])->name('role-request.store');
    Route::get('/role-request/status', [MemberRoleRequest::class, 'status'])->name('role-request.status');
});

require __DIR__.'/auth.php';
