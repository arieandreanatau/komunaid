<?php

declare(strict_types=1);

use App\Http\Controllers\BrandOwner\BrandController;
use App\Http\Controllers\BrandOwner\CampaignController;
use App\Http\Controllers\BrandOwner\CollaborationController;
use App\Http\Controllers\BrandOwner\CommunityDirectoryController as BrandCommunityDirectoryController;
use App\Http\Controllers\BrandOwner\DashboardController as BrandOwnerDashboardController;
use App\Http\Controllers\BrandOwner\OwnershipTransferController as BrandOwnershipTransferController;
use App\Http\Controllers\BrandOwner\ProposalCollaborationController as BrandProposalCollaborationController;
use App\Http\Controllers\BrandOwner\SettingController as BrandSettingController;
use App\Http\Controllers\BrandOwner\StaffController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Brand Owner Routes
|--------------------------------------------------------------------------
| URL prefix /brand, name prefix brand.* (kept for backward compat).
| Middleware: role:brand_owner|brand_staff
*/

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
