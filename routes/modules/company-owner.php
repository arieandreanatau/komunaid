<?php

declare(strict_types=1);

use App\Http\Controllers\CompanyOwner\CompanyBrandController as CompanyOwnerBrandController;
use App\Http\Controllers\CompanyOwner\CompanyController as CompanyOwnerCompanyController;
use App\Http\Controllers\CompanyOwner\DashboardController as CompanyOwnerDashboardController;
use App\Http\Controllers\CompanyOwner\ProposalCollaborationController as CompanyOwnerProposalController;
use App\Http\Controllers\CompanyOwner\SettingController as CompanyOwnerSettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Company Owner Routes
|--------------------------------------------------------------------------
| URL prefix /company-owner, name prefix company-owner.*.
| Middleware: role:company_owner|superadmin
*/

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
