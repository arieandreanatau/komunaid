# KomunaID - System Architecture

## Architecture Pattern

Menggunakan **MVC (Model-View-Controller)** pattern dari Laravel dengan penambahan **Service Layer** untuk bisnis logic kompleks.

## High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                 Browser                     │
│            (Blade Templates)                │
└──────────────────┬──────────────────────────┘
                   │ HTTP Request
┌──────────────────▼──────────────────────────┐
│              Laravel Router                  │
│              (routes/web.php)                │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Middleware Layer                     │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │  auth       │  │  CheckRole           │  │
│  │  verified   │  │  (superadmin, etc)   │  │
│  └─────────────┘  └──────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Controller Layer                   │
│  ┌────────────────────────────────────────┐  │
│  │ Superadmin/CommunityOwner/BrandOwner/  │  │
│  │ Member controllers                     │  │
│  └────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Eloquent ORM (Models)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ User     │ │Community │ │ Brand    │    │
│  │ Profile  │ │ Member   │ │ Event    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            MySQL Database                   │
│         (via XAMPP / phpMyAdmin)            │
└─────────────────────────────────────────────┘
```

## Directory Structure

```
source-code-laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Request handling
│   │   ├── Middleware/       # Request filtering
│   │   └── Requests/        # Form validation
│   ├── Models/              # Eloquent models
│   ├── Policies/            # Authorization
│   └── View/                # Blade components
├── bootstrap/
├── config/
├── database/
│   ├── migrations/          # Database schema
│   └── seeders/             # Sample data
├── public/
│   └── storage/             # Uploaded files
├── resources/
│   ├── views/               # Blade templates
│   │   ├── layouts/         # Main layouts
│   │   ├── components/      # Reusable components
│   │   ├── landing/         # Public pages
│   │   ├── auth/            # Auth pages
│   │   ├── superadmin/      # SA dashboard
│   │   ├── community-owner/ # CO dashboard
│   │   ├── brand-owner/     # BO dashboard
│   │   └── member/          # Member pages
│   └── css/
├── routes/
│   └── web.php              # All routes
└── docs/                    # Documentation
```

## Routing Strategy

```php
// routes/web.php structure:

// Public routes
Route::get('/', [HomeController::class, 'index']);
Route::get('/communities', [CommunityController::class, 'index']);
Route::get('/communities/{slug}', [CommunityController::class, 'show']);

// Auth routes (Laravel Breeze)
require __DIR__.'/auth.php';

// Superadmin routes
Route::middleware(['auth', 'role:superadmin'])->prefix('superadmin')->group(function () {
    Route::get('/dashboard', ...);
    Route::resource('/members', ...);
    Route::resource('/communities', ...);
    // ...
});

// Community Owner routes
Route::middleware(['auth', 'role:community_owner'])->prefix('community-owner')->group(function () {
    Route::get('/dashboard', ...);
    Route::resource('/communities', ...);
    // ...
});

// Brand Owner routes
Route::middleware(['auth', 'role:brand_owner'])->prefix('brand-owner')->group(function () {
    Route::get('/dashboard', ...);
    Route::resource('/brands', ...);
    // ...
});

// Member routes
Route::middleware(['auth', 'role:member'])->prefix('member')->group(function () {
    Route::get('/dashboard', ...);
    Route::resource('/profile', ...);
    // ...
});
```

## Authentication Flow

```
1. User Register (email + password)
   → Default role: "member"
   → Auto-create wallet with balance 0
   → Auto-create empty user_profile

2. User Login
   → Check credentials
   → Set session
   → Redirect based on role:
     - superadmin → /superadmin/dashboard
     - community_owner → /community-owner/dashboard
     - brand_owner → /brand-owner/dashboard
     - member → /member/dashboard

3. Role Request Flow
   - Member submits request → status: pending
   - Superadmin reviews → approve/reject
   - If approved → assign new role via Spatie
```

## Authorization Flow

```
1. Middleware Check (Route Level)
   → role:superadmin, role:community_owner, etc.

2. Policy Check (Model Level)
   → CommunityPolicy: view, create, update, delete
   → BrandPolicy: view, create, update, delete
   → EventPolicy: view, create, update, delete

3. Blade Check (View Level)
   @can('update', $community)
       <a href="...">Edit</a>
   @endcan
```

## File Upload Strategy

```
1. Upload to public/storage/{type}/
   - avatars/    → user profile photos
   - communities/ → community logos and banners
   - brands/     → brand logos and banners
   - events/     → event banners
   - galleries/  → community gallery
   - documents/  → role request evidence

2. Validation:
   - Image: jpeg, png, webp, max 2MB
   - Document: pdf, max 5MB

3. Storage link:
   php artisan storage:link
```

## Dashboard Routing Logic

```
After login, redirect based on highest role:

1. Check if user has "superadmin" role → /superadmin/dashboard
2. Check if user has "community_owner" role → /community-owner/dashboard
3. Check if user has "brand_owner" role → /brand-owner/dashboard
4. Default → /member/dashboard

Note: A user can have multiple roles but dashboard shows
the highest privilege level.
```
