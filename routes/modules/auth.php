<?php

declare(strict_types=1);

use App\Http\Controllers\Auth\AccountRestrictedController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\DashboardRedirectController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Superadmin\LoginController as SuperadminLoginController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
| Login / register / password / onboarding for regular users.
| Separate /admin/* login is for superadmin.
*/

// Superadmin (admin) auth – separate from user auth
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [SuperadminLoginController::class, 'showLoginForm'])->name('login')->middleware('guest');
    Route::post('/login', [SuperadminLoginController::class, 'login'])->name('login.submit')->middleware('guest');
    Route::post('/logout', [SuperadminLoginController::class, 'logout'])->name('logout')->middleware('auth');
});

// User-facing auth
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

// Account restricted (banned / suspended landing)
Route::get('/account-restricted', AccountRestrictedController::class)
    ->name('account.restricted');
