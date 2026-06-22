# KomunaID — Routes & Controller Structure

## Routes (web.php)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Guest\HomeController;
use App\Http\Controllers\Guest\CommunityController as GuestCommunityController;
use App\Http\Controllers\Guest\BrandController as GuestBrandController;
use App\Http\Controllers\Member\DashboardController as MemberDashboardController;
use App\Http\Controllers\Member\ProfileController;
use App\Http\Controllers\Member\RoleApprovalController;
use App\Http\Controllers\Community\DashboardController as CommunityDashboardController;
use App\Http\Controllers\Community\CommunityController;
use App\Http\Controllers\Community\MemberController;
use App\Http\Controllers\Community\EventController as CommunityEventController;
use App\Http\Controllers\Brand\DashboardController as BrandDashboardController;
use App\Http\Controllers\Brand\BrandController;
use App\Http\Controllers\Superadmin\DashboardController as SuperadminDashboardController;
use App\Http\Controllers\Superadmin\UserController;
use App\Http\Controllers\Superadmin\RoleApprovalController as SuperadminRoleApprovalController;

// ─── Guest Routes (Public) ─────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/communities', [GuestCommunityController::class, 'index'])->name('guest.communities.index');
Route::get('/communities/{community:slug}', [GuestCommunityController::class, 'show'])->name('guest.communities.show');
Route::get('/brands', [GuestBrandController::class, 'index'])->name('guest.brands.index');
Route::get('/brands/{brand:slug}', [GuestBrandController::class, 'show'])->name('guest.brands.show');

// ─── Auth Routes ────────────────────────────────────────────
require __DIR__.'/auth.php';

// ─── Authenticated Routes ───────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // ─── Member Routes ──────────────────────────────────────
    Route::prefix('member')->name('member.')->group(function () {
        Route::get('/dashboard', [MemberDashboardController::class, 'index'])->name('dashboard');
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // Role Approval
        Route::get('/role-approval', [RoleApprovalController::class, 'index'])->name('role-approval.index');
        Route::post('/role-approval', [RoleApprovalController::class, 'store'])->name('role-approval.store');
    });

    // ─── Community Owner Routes ─────────────────────────────
    Route::prefix('community')->name('community.')->middleware('role:community_owner')->group(function () {
        Route::get('/dashboard', [CommunityDashboardController::class, 'index'])->name('dashboard');

        // Community CRUD
        Route::get('/communities', [CommunityController::class, 'index'])->name('communities.index');
        Route::get('/communities/create', [CommunityController::class, 'create'])->name('communities.create');
        Route::post('/communities', [CommunityController::class, 'store'])->name('communities.store');
        Route::get('/communities/{community:slug}', [CommunityController::class, 'show'])->name('communities.show');
        Route::get('/communities/{community:slug}/edit', [CommunityController::class, 'edit'])->name('communities.edit');
        Route::put('/communities/{community:slug}', [CommunityController::class, 'update'])->name('communities.update');
        Route::delete('/communities/{community:slug}', [CommunityController::class, 'destroy'])->name('communities.destroy');

        // Member Management
        Route::get('/communities/{community:slug}/members', [MemberController::class, 'index'])->name('members.index');
        Route::post('/communities/{community:slug}/members/{user}/approve', [MemberController::class, 'approve'])->name('members.approve');
        Route::post('/communities/{community:slug}/members/{user}/reject', [MemberController::class, 'reject'])->name('members.reject');

        // Event Management
        Route::get('/communities/{community:slug}/events', [CommunityEventController::class, 'index'])->name('events.index');
        Route::get('/communities/{community:slug}/events/create', [CommunityEventController::class, 'create'])->name('events.create');
        Route::post('/communities/{community:slug}/events', [CommunityEventController::class, 'store'])->name('events.store');
        Route::get('/communities/{community:slug}/events/{event:slug}', [CommunityEventController::class, 'show'])->name('events.show');
        Route::get('/communities/{community:slug}/events/{event:slug}/edit', [CommunityEventController::class, 'edit'])->name('events.edit');
        Route::put('/communities/{community:slug}/events/{event:slug}', [CommunityEventController::class, 'update'])->name('events.update');
        Route::delete('/communities/{community:slug}/events/{event:slug}', [CommunityEventController::class, 'destroy'])->name('events.destroy');
    });

    // ─── Brand Owner Routes ─────────────────────────────────
    Route::prefix('brand')->name('brand.')->middleware('role:brand_owner')->group(function () {
        Route::get('/dashboard', [BrandDashboardController::class, 'index'])->name('dashboard');

        // Brand CRUD
        Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
        Route::get('/brands/create', [BrandController::class, 'create'])->name('brands.create');
        Route::post('/brands', [BrandController::class, 'store'])->name('brands.store');
        Route::get('/brands/{brand:slug}', [BrandController::class, 'show'])->name('brands.show');
        Route::get('/brands/{brand:slug}/edit', [BrandController::class, 'edit'])->name('brands.edit');
        Route::put('/brands/{brand:slug}', [BrandController::class, 'update'])->name('brands.update');
        Route::delete('/brands/{brand:slug}', [BrandController::class, 'destroy'])->name('brands.destroy');
    });

    // ─── Member Event Routes ────────────────────────────────
    Route::post('/events/{event}/rsvp', [App\Http\Controllers\Member\EventRsvpController::class, 'store'])->name('events.rsvp');
    Route::delete('/events/{event}/rsvp', [App\Http\Controllers\Member\EventRsvpController::class, 'destroy'])->name('events.rsvp.cancel');
    Route::post('/communities/{community:slug}/join', [App\Http\Controllers\Member\CommunityJoinController::class, 'store'])->name('communities.join');
    Route::delete('/communities/{community:slug}/join', [App\Http\Controllers\Member\CommunityJoinController::class, 'destroy'])->name('communities.leave');
});

// ─── Superadmin Routes ──────────────────────────────────────
Route::prefix('superadmin')->name('superadmin.')->middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/dashboard', [SuperadminDashboardController::class, 'index'])->name('dashboard');

    // User Management
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');

    // Role Approval
    Route::get('/role-approvals', [SuperadminRoleApprovalController::class, 'index'])->name('role-approvals.index');
    Route::post('/role-approvals/{roleApproval}/approve', [SuperadminRoleApprovalController::class, 'approve'])->name('role-approvals.approve');
    Route::post('/role-approvals/{roleApproval}/reject', [SuperadminRoleApprovalController::class, 'reject'])->name('role-approvals.reject');
});
```

---

## Controller Structure

```
app/Http/Controllers/
├── Auth/
│   ├── RegisteredUserController.php      (customize from Breeze)
│   ├── AuthenticatedSessionController.php
│   └── PasswordResetLinkController.php
├── Guest/
│   ├── HomeController.php
│   ├── CommunityController.php
│   └── BrandController.php
├── Member/
│   ├── DashboardController.php
│   ├── ProfileController.php
│   ├── RoleApprovalController.php
│   ├── EventRsvpController.php
│   └── CommunityJoinController.php
├── Community/
│   ├── DashboardController.php
│   ├── CommunityController.php
│   ├── MemberController.php
│   └── EventController.php
├── Brand/
│   ├── DashboardController.php
│   └── BrandController.php
└── Superadmin/
    ├── DashboardController.php
    ├── UserController.php
    └── RoleApprovalController.php
```

---

## Middleware

```
app/Http/Middleware/
├── RoleMiddleware.php
├── ApprovalMiddleware.php
└── ActiveMiddleware.php
```

---

## Form Requests

```
app/Http/Requests/
├── Auth/
│   ├── RegisterRequest.php
│   └── LoginRequest.php
├── Member/
│   ├── UpdateProfileRequest.php
│   └── RoleApprovalRequest.php
├── Community/
│   ├── StoreCommunityRequest.php
│   ├── UpdateCommunityRequest.php
│   ├── StoreEventRequest.php
│   └── UpdateEventRequest.php
└── Brand/
    ├── StoreBrandRequest.php
    └── UpdateBrandRequest.php
```
