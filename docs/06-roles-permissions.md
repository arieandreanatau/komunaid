# KomunaID - Roles & Permissions

## Roles

| Role | Deskripsi | Level |
|------|-----------|-------|
| superadmin | Pemilik dan pengelola platform | 1 (highest) |
| community_owner | Pengelola komunitas | 2 |
| brand_owner | Pemilik brand | 3 |
| member | Pengguna biasa | 4 (default) |

### Note
- User bisa memiliki lebih dari satu role
- Dashboard redirect berdasarkan role tertinggi
- Role community_owner dan brand_owner harus di-approve oleh superadmin

## Permissions

### Superadmin Permissions
- manage_members
- manage_communities
- manage_brands
- manage_events
- manage_roles
- approve_communities
- approve_brands
- approve_events
- approve_role_requests
- view_revenue
- manage_platform

### Community Owner Permissions
- manage_own_community
- manage_community_members
- manage_community_roles
- manage_community_events
- manage_community_gallery
- manage_community_posts
- manage_community_messages
- manage_community_collaborations
- manage_sub_communities

### Brand Owner Permissions
- manage_own_brand
- manage_brand_campaigns
- browse_communities
- manage_brand_collaborations

### Member Permissions
- view_profile
- edit_profile
- join_community
- leave_community
- register_event
- donate
- request_role
- view_own_history

## Spatie Permission Setup

```php
// Seeder: RolePermissionSeeder.php

// Roles
Role::create(['name' => 'superadmin']);
Role::create(['name' => 'community_owner']);
Role::create(['name' => 'brand_owner']);
Role::create(['name' => 'member']);

// Superadmin Permissions
Permission::create(['name' => 'manage_members']);
Permission::create(['name' => 'manage_communities']);
Permission::create(['name' => 'manage_brands']);
Permission::create(['name' => 'manage_events']);
Permission::create(['name' => 'manage_roles']);
Permission::create(['name' => 'approve_communities']);
Permission::create(['name' => 'approve_brands']);
Permission::create(['name' => 'approve_events']);
Permission::create(['name' => 'approve_role_requests']);
Permission::create(['name' => 'view_revenue']);
Permission::create(['name' => 'manage_platform']);

// Community Owner Permissions
Permission::create(['name' => 'manage_own_community']);
Permission::create(['name' => 'manage_community_members']);
Permission::create(['name' => 'manage_community_roles']);
Permission::create(['name' => 'manage_community_events']);
Permission::create(['name' => 'manage_community_gallery']);
Permission::create(['name' => 'manage_community_posts']);
Permission::create(['name' => 'manage_community_messages']);
Permission::create(['name' => 'manage_community_collaborations']);
Permission::create(['name' => 'manage_sub_communities']);

// Brand Owner Permissions
Permission::create(['name' => 'manage_own_brand']);
Permission::create(['name' => 'manage_brand_campaigns']);
Permission::create(['name' => 'browse_communities']);
Permission::create(['name' => 'manage_brand_collaborations']);

// Member Permissions
Permission::create(['name' => 'view_profile']);
Permission::create(['name' => 'edit_profile']);
Permission::create(['name' => 'join_community']);
Permission::create(['name' => 'leave_community']);
Permission::create(['name' => 'register_event']);
Permission::create(['name' => 'donate']);
Permission::create(['name' => 'request_role']);
Permission::create(['name' => 'view_own_history']);

// Assign permissions to roles
$superadmin = Role::findByName('superadmin');
$superadmin->givePermissionTo(Permission::all());

$communityOwner = Role::findByName('community_owner');
$communityOwner->givePermissionTo([
    'manage_own_community', 'manage_community_members',
    'manage_community_roles', 'manage_community_events',
    'manage_community_gallery', 'manage_community_posts',
    'manage_community_messages', 'manage_community_collaborations',
    'manage_sub_communities', 'edit_profile', 'view_profile'
]);

$brandOwner = Role::findByName('brand_owner');
$brandOwner->givePermissionTo([
    'manage_own_brand', 'manage_brand_campaigns',
    'browse_communities', 'manage_brand_collaborations',
    'edit_profile', 'view_profile'
]);

$member = Role::findByName('member');
$member->givePermissionTo([
    'view_profile', 'edit_profile', 'join_community',
    'leave_community', 'register_event', 'donate',
    'request_role', 'view_own_history'
]);
```

## Custom Middleware

```php
// app/Http/Middleware/CheckRole.php

public function handle($request, Closure $next, ...$roles)
{
    if (!auth()->check()) {
        return redirect('/login');
    }

    if (!$request->user()->hasAnyRole($roles)) {
        abort(403, 'Unauthorized access.');
    }

    return $next($request);
}
```

## Route Protection Examples

```php
// Superadmin only
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/superadmin/dashboard', ...);
});

// Community Owner only
Route::middleware(['auth', 'role:community_owner'])->group(function () {
    Route::get('/community-owner/dashboard', ...);
});

// Member (including those with higher roles)
Route::middleware(['auth', 'role:member,community_owner,brand_owner,superadmin'])->group(function () {
    Route::get('/member/dashboard', ...);
});
```

## Blade Authorization

```blade
{{-- Check if user is superadmin --}}
@if(auth()->user()->hasRole('superadmin'))
    <a href="{{ route('superadmin.dashboard') }}">Admin Panel</a>
@endif

{{-- Check permission --}}
@can('manage_own_community')
    <a href="{{ route('community-owner.communities.create') }}">Create Community</a>
@endcan
```
