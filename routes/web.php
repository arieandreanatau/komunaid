<?php

declare(strict_types=1);

use App\Http\Controllers\Shared\CronController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| KomunaID route registry. Routes are split by role/module under
| routes/modules/ for maintainability. Each module is responsible for its
| own middleware stack and route name prefix.
|
| Public, guest, and account-restricted routes are loaded directly.
| Authenticated role modules are wrapped here with the shared middleware
| stack (auth, active_user, not.banned, role).
*/

// Public site (no auth)
require __DIR__.'/modules/public.php';

// User auth (login/register/password) and superadmin auth + onboarding + dashboard redirect
require __DIR__.'/modules/auth.php';

// Authenticated role modules
Route::middleware(['auth'])->group(function () {
    // Onboarding + dashboard redirect + member-only endpoints
    require __DIR__.'/modules/member.php';

    Route::middleware(['active_user', 'not.banned'])->group(function () {
        // Community owner
        require __DIR__.'/modules/community-owner.php';
        // Brand owner / staff
        require __DIR__.'/modules/brand-owner.php';
        // Company owner
        require __DIR__.'/modules/company-owner.php';
    });
});

// Superadmin (separate middleware alias `admin` => EnsureSuperadmin)
Route::middleware(['auth', 'admin'])->group(function () {
    require __DIR__.'/modules/superadmin.php';
});

// CRON (token-protected, called by Vercel Cron Jobs)
Route::get('/api/cron/scheduler', [CronController::class, 'run'])
    ->middleware('cron.token')
    ->name('cron.scheduler');
