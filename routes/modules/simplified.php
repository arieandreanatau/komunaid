<?php

declare(strict_types=1);

use App\Http\Controllers\Simplified\Admin\ApprovalController;
use App\Http\Controllers\Simplified\Auth\LoginController;
use App\Http\Controllers\Simplified\Auth\RegisterController;
use App\Http\Controllers\Simplified\Dashboard\DashboardController;
use App\Http\Controllers\Simplified\Dashboard\SubmissionsController;
use App\Http\Controllers\Simplified\Submission\SubmissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| KomunaID Simplified Auth & Entity Submission Routes
|--------------------------------------------------------------------------
| One register, one login, adaptive dashboard, entity-as-submission.
| Coexists with the legacy role-segmented flow during migration.
*/

// Auth (guest only)
Route::middleware(['web', 'guest'])->group(function () {
    Route::get('/v2/register', [RegisterController::class, 'create'])->name('simplified.register');
    Route::post('/v2/register', [RegisterController::class, 'store']);

    Route::get('/v2/login', [LoginController::class, 'create'])->name('simplified.login');
    Route::post('/v2/login', [LoginController::class, 'store']);
});

// Authenticated
Route::middleware(['web', 'auth'])->group(function () {
    Route::post('/v2/logout', [LoginController::class, 'destroy'])->name('simplified.logout');

    // Dashboard
    Route::get('/v2/dashboard', [DashboardController::class, 'index'])->name('simplified.dashboard');

    // Submissions list & detail
    Route::get('/v2/dashboard/submissions', [SubmissionsController::class, 'index'])->name('simplified.submissions.index');
    Route::get('/v2/dashboard/submissions/{type}/{id}', [SubmissionsController::class, 'show'])
        ->where(['type' => 'community|brand|company', 'id' => '[0-9]+'])
        ->name('simplified.submissions.show');

    // Apply forms
    Route::get('/v2/dashboard/apply/community', [SubmissionController::class, 'createCommunity'])->name('simplified.apply.community.create');
    Route::post('/v2/dashboard/apply/community', [SubmissionController::class, 'storeCommunity'])->name('simplified.apply.community.store');

    Route::get('/v2/dashboard/apply/brand', [SubmissionController::class, 'createBrand'])->name('simplified.apply.brand.create');
    Route::post('/v2/dashboard/apply/brand', [SubmissionController::class, 'storeBrand'])->name('simplified.apply.brand.store');

    Route::get('/v2/dashboard/apply/company', [SubmissionController::class, 'createCompany'])->name('simplified.apply.company.create');
    Route::post('/v2/dashboard/apply/company', [SubmissionController::class, 'storeCompany'])->name('simplified.apply.company.store');
});

// Admin approvals (gated to superadmin / admin_platform)
Route::middleware(['web', 'auth', 'role:superadmin|admin_platform'])->prefix('/v2/admin/approvals')->group(function () {
    Route::get('/', [ApprovalController::class, 'index'])->name('simplified.admin.approvals.index');

    Route::get('/communities', [ApprovalController::class, 'communities'])->name('simplified.admin.approvals.communities.index');
    Route::get('/communities/{id}', [ApprovalController::class, 'showCommunity'])->name('simplified.admin.approvals.communities.show');
    Route::post('/communities/{id}/approve', [ApprovalController::class, 'approveCommunity'])->name('simplified.admin.approvals.communities.approve');
    Route::post('/communities/{id}/reject', [ApprovalController::class, 'rejectCommunity'])->name('simplified.admin.approvals.communities.reject');
    Route::post('/communities/{id}/request-revision', [ApprovalController::class, 'revisionCommunity'])->name('simplified.admin.approvals.communities.revision');
    Route::post('/communities/{id}/suspend', [ApprovalController::class, 'suspendCommunity'])->name('simplified.admin.approvals.communities.suspend');

    Route::get('/brands', [ApprovalController::class, 'brands'])->name('simplified.admin.approvals.brands.index');
    Route::get('/brands/{id}', [ApprovalController::class, 'showBrand'])->name('simplified.admin.approvals.brands.show');
    Route::post('/brands/{id}/approve', [ApprovalController::class, 'approveBrand'])->name('simplified.admin.approvals.brands.approve');
    Route::post('/brands/{id}/reject', [ApprovalController::class, 'rejectBrand'])->name('simplified.admin.approvals.brands.reject');
    Route::post('/brands/{id}/request-revision', [ApprovalController::class, 'revisionBrand'])->name('simplified.admin.approvals.brands.revision');
    Route::post('/brands/{id}/suspend', [ApprovalController::class, 'suspendBrand'])->name('simplified.admin.approvals.brands.suspend');

    Route::get('/companies', [ApprovalController::class, 'companies'])->name('simplified.admin.approvals.companies.index');
    Route::get('/companies/{id}', [ApprovalController::class, 'showCompany'])->name('simplified.admin.approvals.companies.show');
    Route::post('/companies/{id}/approve', [ApprovalController::class, 'approveCompany'])->name('simplified.admin.approvals.companies.approve');
    Route::post('/companies/{id}/reject', [ApprovalController::class, 'rejectCompany'])->name('simplified.admin.approvals.companies.reject');
    Route::post('/companies/{id}/request-revision', [ApprovalController::class, 'revisionCompany'])->name('simplified.admin.approvals.companies.revision');
    Route::post('/companies/{id}/suspend', [ApprovalController::class, 'suspendCompany'])->name('simplified.admin.approvals.companies.suspend');
});
