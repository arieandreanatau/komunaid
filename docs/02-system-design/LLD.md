# KomunaID — Low Level Design (LLD)

## 1. Laravel Folder Structure

```
KomunaID/
├── app/
│   ├── Console/
│   │   └── Kernel.php
│   ├── Enums/
│   │   ├── UserRole.php
│   │   ├── ApprovalStatus.php
│   │   ├── CommunityMemberRole.php
│   │   └── EventAttendeeStatus.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── RegisteredUserController.php
│   │   │   │   ├── AuthenticatedSessionController.php
│   │   │   │   └── PasswordResetLinkController.php
│   │   │   ├── Guest/
│   │   │   │   ├── HomeController.php
│   │   │   │   ├── CommunityController.php
│   │   │   │   └── BrandController.php
│   │   │   ├── Member/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── ProfileController.php
│   │   │   │   ├── RoleApprovalController.php
│   │   │   │   ├── EventRsvpController.php
│   │   │   │   └── CommunityJoinController.php
│   │   │   ├── Community/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── CommunityController.php
│   │   │   │   ├── MemberController.php
│   │   │   │   └── EventController.php
│   │   │   ├── Brand/
│   │   │   │   ├── DashboardController.php
│   │   │   │   └── BrandController.php
│   │   │   └── Superadmin/
│   │   │       ├── DashboardController.php
│   │   │       ├── UserController.php
│   │   │       └── RoleApprovalController.php
│   │   ├── Middleware/
│   │   │   ├── RoleMiddleware.php
│   │   │   ├── ApprovalMiddleware.php
│   │   │   └── ActiveMiddleware.php
│   │   └── Requests/
│   │       ├── Auth/
│   │       │   ├── RegisterRequest.php
│   │       │   └── LoginRequest.php
│   │       ├── Member/
│   │       │   ├── UpdateProfileRequest.php
│   │       │   └── RoleApprovalRequest.php
│   │       ├── Community/
│   │       │   ├── StoreCommunityRequest.php
│   │       │   ├── UpdateCommunityRequest.php
│   │       │   ├── StoreEventRequest.php
│   │       │   └── UpdateEventRequest.php
│   │       └── Brand/
│   │           ├── StoreBrandRequest.php
│   │           └── UpdateBrandRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── RoleApproval.php
│   │   ├── Community.php
│   │   ├── CommunityMember.php
│   │   ├── Event.php
│   │   ├── EventAttendee.php
│   │   └── Brand.php
│   ├── Services/
│   │   ├── CommunityService.php
│   │   ├── BrandService.php
│   │   ├── EventService.php
│   │   └── RoleApprovalService.php
│   └── Providers/
│       └── AppServiceProvider.php
├── bootstrap/
│   └── app.php
├── config/
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_roles_table.php
│   │   ├── 0001_01_01_000002_create_role_approvals_table.php
│   │   ├── 0001_01_01_000003_create_communities_table.php
│   │   ├── 0001_01_01_000004_create_community_members_table.php
│   │   ├── 0001_01_01_000005_create_events_table.php
│   │   ├── 0001_01_01_000006_create_event_attendees_table.php
│   │   └── 0001_01_01_000007_create_brands_table.php
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── RoleSeeder.php
│   │   └── SuperadminSeeder.php
│   └── factories/
├── public/
│   ├── build/         (compiled assets)
│   ├── images/
│   └── index.php
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   │   ├── app.blade.php
│   │   │   ├── guest.blade.php
│   │   │   └── superadmin.blade.php
│   │   ├── components/
│   │   │   ├── alert.blade.php
│   │   │   ├── badge.blade.php
│   │   │   ├── button.blade.php
│   │   │   ├── card.blade.php
│   │   │   ├── empty-state.blade.php
│   │   │   ├── modal.blade.php
│   │   │   └── sidebar.blade.php
│   │   ├── guest/
│   │   │   ├── home.blade.php
│   │   │   ├── communities/
│   │   │   │   ├── index.blade.php
│   │   │   │   └── show.blade.php
│   │   │   └── brands/
│   │   │       ├── index.blade.php
│   │   │       └── show.blade.php
│   │   ├── auth/
│   │   │   ├── login.blade.php
│   │   │   ├── register.blade.php
│   │   │   └── passwords/
│   │   │       ├── reset.blade.php
│   │   │       └── sent.blade.php
│   │   ├── member/
│   │   │   ├── dashboard.blade.php
│   │   │   ├── profile/
│   │   │   │   └── edit.blade.php
│   │   │   └── role-approval/
│   │   │       ├── index.blade.php
│   │   │       └── create.blade.php
│   │   ├── community/
│   │   │   ├── dashboard.blade.php
│   │   │   ├── communities/
│   │   │   │   ├── index.blade.php
│   │   │   │   ├── create.blade.php
│   │   │   │   ├── show.blade.php
│   │   │   │   └── edit.blade.php
│   │   │   ├── members/
│   │   │   │   └── index.blade.php
│   │   │   └── events/
│   │   │       ├── index.blade.php
│   │   │       ├── create.blade.php
│   │   │       ├── show.blade.php
│   │   │       └── edit.blade.php
│   │   ├── brand/
│   │   │   ├── dashboard.blade.php
│   │   │   └── brands/
│   │   │       ├── index.blade.php
│   │   │       ├── create.blade.php
│   │   │       ├── show.blade.php
│   │   │       └── edit.blade.php
│   │   └── superadmin/
│   │       ├── dashboard.blade.php
│   │       ├── users/
│   │       │   ├── index.blade.php
│   │       │   └── show.blade.php
│   │       └── role-approvals/
│   │           └── index.blade.php
│   ├── css/
│   │   └── app.css
│   └── js/
│       └── app.js
├── routes/
│   ├── web.php
│   ├── api.php
│   └── auth.php
├── storage/
│   ├── app/
│   │   ├── public/       (uploaded files)
│   │   │   ├── avatars/
│   │   │   ├── banners/
│   │   │   └── logos/
│   │   └── private/
│   ├── framework/
│   └── logs/
├── tests/
│   ├── Unit/
│   └── Feature/
├── .env
├── composer.json
├── package.json
└── vite.config.js
```

---

## 2. Route Structure

### Public Routes (Guest)

| Method | URI | Controller | Name |
|--------|-----|-----------|------|
| GET | `/` | `Guest\HomeController@index` | `home` |
| GET | `/communities` | `Guest\CommunityController@index` | `guest.communities.index` |
| GET | `/communities/{community:slug}` | `Guest\CommunityController@show` | `guest.communities.show` |
| GET | `/brands` | `Guest\BrandController@index` | `guest.brands.index` |
| GET | `/brands/{brand:slug}` | `Guest\BrandController@show` | `guest.brands.show` |

### Auth Routes (Laravel Breeze)

| Method | URI | Controller | Name |
|--------|-----|-----------|------|
| GET | `/register` | `Auth\RegisteredUserController@create` | `register` |
| POST | `/register` | `Auth\RegisteredUserController@store` | — |
| GET | `/login` | `Auth\AuthenticatedSessionController@create` | `login` |
| POST | `/login` | `Auth\AuthenticatedSessionController@store` | — |
| POST | `/logout` | `Auth\AuthenticatedSessionController@destroy` | `logout` |
| GET | `/forgot-password` | `Auth\PasswordResetLinkController@create` | `password.request` |
| POST | `/forgot-password` | `Auth\PasswordResetLinkController@store` | `password.email` |

### Member Routes (Prefix: `/member`, Middleware: `auth,verified`)

| Method | URI | Controller | Name |
|--------|-----|-----------|------|
| GET | `/member/dashboard` | `Member\DashboardController@index` | `member.dashboard` |
| GET | `/member/profile` | `Member\ProfileController@edit` | `member.profile.edit` |
| PATCH | `/member/profile` | `Member\ProfileController@update` | `member.profile.update` |
| DELETE | `/member/profile` | `Member\ProfileController@destroy` | `member.profile.destroy` |
| GET | `/member/role-approval` | `Member\RoleApprovalController@index` | `member.role-approval.index` |
| POST | `/member/role-approval` | `Member\RoleApprovalController@store` | `member.role-approval.store` |

### Member Action Routes (Prefix: `/`, Middleware: `auth,verified`)

| Method | URI | Controller | Name |
|--------|-----|-----------|------|
| POST | `/events/{event}/rsvp` | `Member\EventRsvpController@store` | `events.rsvp` |
| DELETE | `/events/{event}/rsvp` | `Member\EventRsvpController@destroy` | `events.rsvp.cancel` |
| POST | `/communities/{community:slug}/join` | `Member\CommunityJoinController@store` | `communities.join` |
| DELETE | `/communities/{community:slug}/join` | `Member\CommunityJoinController@destroy` | `communities.leave` |

### Community Owner Routes (Prefix: `/community`, Middleware: `auth,role:community_owner`)

| Method | URI | Controller | Name |
|--------|-----|-----------|------|
| GET | `/community/dashboard` | `Community\DashboardController@index` | `community.dashboard` |
| GET | `/community/communities` | `Community\CommunityController@index` | `community.communities.index` |
| GET | `/community/communities/create` | `Community\CommunityController@create` | `community.communities.create` |
| POST | `/community/communities` | `Community\CommunityController@store` | `community.communities.store` |
| GET | `/community/communities/{community:slug}` | `Community\CommunityController@show` | `community.communities.show` |
| GET | `/community/communities/{community:slug}/edit` | `Community\CommunityController@edit` | `community.communities.edit` |
| PUT | `/community/communities/{community:slug}` | `Community\CommunityController@update` | `community.communities.update` |
| DELETE | `/community/communities/{community:slug}` | `Community\CommunityController@destroy` | `community.communities.destroy` |
| GET | `/community/communities/{community:slug}/members` | `Community\MemberController@index` | `community.members.index` |
| POST | `/community/communities/{community:slug}/members/{user}/approve` | `Community\MemberController@approve` | `community.members.approve` |
| POST | `/community/communities/{community:slug}/members/{user}/reject` | `Community\MemberController@reject` | `community.members.reject` |
| GET | `/community/communities/{community:slug}/events` | `Community\EventController@index` | `community.events.index` |
| GET | `/community/communities/{community:slug}/events/create` | `Community\EventController@create` | `community.events.create` |
| POST | `/community/communities/{community:slug}/events` | `Community\EventController@store` | `community.events.store` |
| GET | `/community/communities/{community:slug}/events/{event:slug}` | `Community\EventController@show` | `community.events.show` |
| GET | `/community/communities/{community:slug}/events/{event:slug}/edit` | `Community\EventController@edit` | `community.events.edit` |
| PUT | `/community/communities/{community:slug}/events/{event:slug}` | `Community\EventController@update` | `community.events.update` |
| DELETE | `/community/communities/{community:slug}/events/{event:slug}` | `Community\EventController@destroy` | `community.events.destroy` |

### Brand Owner Routes (Prefix: `/brand`, Middleware: `auth,role:brand_owner`)

| Method | URI | Controller | Name |
|--------|-----|-----------|------|
| GET | `/brand/dashboard` | `Brand\DashboardController@index` | `brand.dashboard` |
| GET | `/brand/brands` | `Brand\BrandController@index` | `brand.brands.index` |
| GET | `/brand/brands/create` | `Brand\BrandController@create` | `brand.brands.create` |
| POST | `/brand/brands` | `Brand\BrandController@store` | `brand.brands.store` |
| GET | `/brand/brands/{brand:slug}` | `Brand\BrandController@show` | `brand.brands.show` |
| GET | `/brand/brands/{brand:slug}/edit` | `Brand\BrandController@edit` | `brand.brands.edit` |
| PUT | `/brand/brands/{brand:slug}` | `Brand\BrandController@update` | `brand.brands.update` |
| DELETE | `/brand/brands/{brand:slug}` | `Brand\BrandController@destroy` | `brand.brands.destroy` |

### Superadmin Routes (Prefix: `/superadmin`, Middleware: `auth,role:superadmin`)

| Method | URI | Controller | Name |
|--------|-----|-----------|------|
| GET | `/superadmin/dashboard` | `Superadmin\DashboardController@index` | `superadmin.dashboard` |
| GET | `/superadmin/users` | `Superadmin\UserController@index` | `superadmin.users.index` |
| GET | `/superadmin/users/{user}` | `Superadmin\UserController@show` | `superadmin.users.show` |
| PATCH | `/superadmin/users/{user}/toggle-active` | `Superadmin\UserController@toggleActive` | `superadmin.users.toggle-active` |
| GET | `/superadmin/role-approvals` | `Superadmin\RoleApprovalController@index` | `superadmin.role-approvals.index` |
| POST | `/superadmin/role-approvals/{roleApproval}/approve` | `Superadmin\RoleApprovalController@approve` | `superadmin.role-approvals.approve` |
| POST | `/superadmin/role-approvals/{roleApproval}/reject` | `Superadmin\RoleApprovalController@reject` | `superadmin.role-approvals.reject` |

---

## 3. Controller List

### Auth Controllers (Laravel Breeze)

| Controller | Responsibility |
|-----------|---------------|
| `RegisteredUserController` | Handle registration form & store new user |
| `AuthenticatedSessionController` | Handle login form, authenticate, logout |
| `PasswordResetLinkController` | Handle forgot password & reset |

### Guest Controllers

| Controller | Methods | Responsibility |
|-----------|---------|---------------|
| `Guest\HomeController` | `index` | Render landing page with stats & featured communities |
| `Guest\CommunityController` | `index`, `show` | Public community directory & detail |
| `Guest\BrandController` | `index`, `show` | Public brand directory & detail |

### Member Controllers

| Controller | Methods | Responsibility |
|-----------|---------|---------------|
| `Member\DashboardController` | `index` | Member dashboard (joined communities, upcoming events) |
| `Member\ProfileController` | `edit`, `update`, `destroy` | Profile management |
| `Member\RoleApprovalController` | `index`, `store` | View & submit role upgrade request |
| `Member\EventRsvpController` | `store`, `destroy` | RSVP / cancel RSVP to events |
| `Member\CommunityJoinController` | `store`, `destroy` | Join / leave a community |

### Community Controllers

| Controller | Methods | Responsibility |
|-----------|---------|---------------|
| `Community\DashboardController` | `index` | Community owner dashboard with stats |
| `Community\CommunityController` | `index`, `create`, `store`, `show`, `edit`, `update`, `destroy` | Full CRUD for communities |
| `Community\MemberController` | `index`, `approve`, `reject` | Manage community membership requests |
| `Community\EventController` | `index`, `create`, `store`, `show`, `edit`, `update`, `destroy` | Full CRUD for events within a community |

### Brand Controllers

| Controller | Methods | Responsibility |
|-----------|---------|---------------|
| `Brand\DashboardController` | `index` | Brand owner dashboard |
| `Brand\BrandController` | `index`, `create`, `store`, `show`, `edit`, `update`, `destroy` | Full CRUD for brands |

### Superadmin Controllers

| Controller | Methods | Responsibility |
|-----------|---------|---------------|
| `Superadmin\DashboardController` | `index` | Platform overview (total users, communities, brands, events) |
| `Superadmin\UserController` | `index`, `show`, `toggleActive` | List, view, activate/deactivate users |
| `Superadmin\RoleApprovalController` | `index`, `approve`, `reject` | Review & process role upgrade requests |

---

## 4. Model List & Relationships

### User Model

```php
class User extends Authenticatable
{
    // Relationships
    role()           → belongsTo(Role)
    roleApprovals()  → hasMany(RoleApproval)
    ownedCommunities() → hasMany(Community, 'owner_id')
    communityMemberships() → hasMany(CommunityMember)
    eventsCreated()  → hasMany(Event, 'created_by')
    eventAttendances() → hasMany(EventAttendee)
    ownedBrands()    → hasMany(Brand, 'owner_id')
}
```

### Role Model

```php
class Role extends Model
{
    // Relationships
    users() → hasMany(User)
}
```

### RoleApproval Model

```php
class RoleApproval extends Model
{
    // Relationships
    user()       → belongsTo(User)
    reviewer()   → belongsTo(User, 'reviewed_by')
}
```

### Community Model

```php
class Community extends Model
{
    // Relationships
    owner()     → belongsTo(User, 'owner_id')
    members()   → hasMany(CommunityMember)
    events()    → hasMany(Event)

    // Accessors
    memberCount → computed from members()->count()
}
```

### CommunityMember Model

```php
class CommunityMember extends Model
{
    // Relationships
    community() → belongsTo(Community)
    user()      → belongsTo(User)
}
```

### Event Model

```php
class Event extends Model
{
    // Relationships
    community()  → belongsTo(Community)
    creator()    → belongsTo(User, 'created_by')
    attendees()  → hasMany(EventAttendee)

    // Accessors
    attendeeCount → computed from attendees()->count()
}
```

### EventAttendee Model

```php
class EventAttendee extends Model
{
    // Relationships
    event() → belongsTo(Event)
    user()  → belongsTo(User)
}
```

### Brand Model

```php
class Brand extends Model
{
    // Relationships
    owner() → belongsTo(User, 'owner_id')
}
```

---

## 5. Service Class List

| Service | Responsibility | Methods |
|---------|---------------|---------|
| `CommunityService` | Business logic for community operations | `create()`, `update()`, `delete()`, `join()`, `leave()`, `approveMember()`, `rejectMember()`, `getPublicCommunities()`, `search()` |
| `BrandService` | Business logic for brand operations | `create()`, `update()`, `delete()`, `getPublicBrands()`, `search()` |
| `EventService` | Business logic for event operations | `create()`, `update()`, `delete()`, `rsvp()`, `cancelRsvp()`, `getUpcomingEvents()` |
| `RoleApprovalService` | Business logic for role approval workflow | `submitRequest()`, `approve()`, `reject()`, `getPendingRequests()` |

---

## 6. Middleware List

| Middleware | Alias | Responsibility |
|-----------|-------|---------------|
| `RoleMiddleware` | `role` | Check if authenticated user has the required role. Usage: `middleware('role:community_owner')` |
| `ApprovalMiddleware` | `approval` | Check if user's role has been approved (for community_owner/brand_owner). Usage: `middleware('approval')` |
| `ActiveMiddleware` | `active` | Check if user account is active (`is_active = true`). Usage: `middleware('active')` |

### Middleware Registration (bootstrap/app.php)

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\RoleMiddleware::class,
        'approval' => \App\Http\Middleware\ApprovalMiddleware::class,
        'active' => \App\Http\Middleware\ActiveMiddleware::class,
    ]);
})
```

---

## 7. Policy List

| Policy | Model | Responsibility |
|--------|-------|---------------|
| `CommunityPolicy` | `Community` | Check if user can view/edit/delete community (owner only for edit/delete) |
| `BrandPolicy` | `Brand` | Check if user can view/edit/delete brand (owner only for edit/delete) |
| `EventPolicy` | `Event` | Check if user can view/edit/delete event (community owner only for edit/delete) |
| `CommunityMemberPolicy` | `CommunityMember` | Check if community owner can approve/reject members |

### Policy Example

```php
class CommunityPolicy
{
    public function view(User $user, Community $community): bool
    {
        return $community->is_public || $user->id === $community->owner_id;
    }

    public function update(User $user, Community $community): bool
    {
        return $user->id === $community->owner_id;
    }

    public function delete(User $user, Community $community): bool
    {
        return $user->id === $community->owner_id;
    }
}
```

---

## 8. Validation Request List

### Auth Requests

| Form Request | Fields | Rules |
|-------------|--------|-------|
| `RegisterRequest` | `name`, `email`, `password`, `password_confirmation` | name:required,string,max:255; email:required,email,unique:users; password:required,min:8,confirmed |
| `LoginRequest` | `email`, `password`, `remember` | email:required,email; password:required |

### Member Requests

| Form Request | Fields | Rules |
|-------------|--------|-------|
| `UpdateProfileRequest` | `name`, `email`, `phone`, `avatar` | name:required,string,max:255; email:required,email,unique:users,email,{id}; phone:nullable,string,max:20; avatar:nullable,image|max:2048 |
| `RoleApprovalRequest` | `requested_role`, `notes` | requested_role:required,in:community_owner,brand_owner; notes:nullable,string|max:1000 |

### Community Requests

| Form Request | Fields | Rules |
|-------------|--------|-------|
| `StoreCommunityRequest` | `name`, `description`, `banner`, `logo`, `category`, `location`, `website`, `is_public` | name:required,string,max:255; description:nullable,string; banner:nullable,image|max:4096; logo:nullable,image|max:2048; category:nullable,string|max:100; location:nullable,string|max:255; website:nullable,url,max:255; is_public:boolean |
| `UpdateCommunityRequest` | Same as above | Same, but name unique except current community |

### Event Requests

| Form Request | Fields | Rules |
|-------------|--------|-------|
| `StoreEventRequest` | `title`, `description`, `location`, `start_time`, `end_time`, `banner`, `is_published` | title:required,string,max:255; description:nullable,string; location:nullable,string,max:255; start_time:required|date; end_time:nullable|date|after:start_time; banner:nullable,image|max:4096; is_published:boolean |
| `UpdateEventRequest` | Same as above | Same, but title unique except current event within community |

### Brand Requests

| Form Request | Fields | Rules |
|-------------|--------|-------|
| `StoreBrandRequest` | `name`, `description`, `logo`, `banner`, `website`, `industry` | name:required,string,max:255; description:nullable,string; logo:nullable,image|max:2048; banner:nullable,image|max:4096; website:nullable,url,max:255; industry:nullable,string|max:100 |
| `UpdateBrandRequest` | Same as above | Same, but name unique except current brand |

---

## 9. View / Page List

### Guest Pages

| View | File | Description |
|------|------|-------------|
| Landing Page | `guest/home.blade.php` | Hero section, features, CTA, featured communities |
| Community Directory | `guest/communities/index.blade.php` | Browse all public communities with search/filter |
| Community Detail | `guest/communities/show.blade.php` | Community info, members, events |
| Brand Directory | `guest/brands/index.blade.php` | Browse all public brands |
| Brand Detail | `guest/brands/show.blade.php` | Brand info and details |

### Auth Pages

| View | File | Description |
|------|------|-------------|
| Login | `auth/login.blade.php` | Email + password form |
| Register | `auth/register.blade.php` | Name, email, phone, password form |
| Forgot Password | `auth/passwords/reset.blade.php` | Email input for reset link |
| Reset Password | `auth/passwords/reset.blade.php` | New password form |

### Member Pages

| View | File | Description |
|------|------|-------------|
| Member Dashboard | `member/dashboard.blade.php` | Overview: joined communities, upcoming events |
| Profile Edit | `member/profile/edit.blade.php` | Edit name, email, phone, avatar |
| Role Approval | `member/role-approval/create.blade.php` | Form to request community_owner or brand_owner role |

### Community Owner Pages

| View | File | Description |
|------|------|-------------|
| Community Dashboard | `community/dashboard.blade.php` | Stats: total communities, members, events |
| Community List | `community/communities/index.blade.php` | List owned communities |
| Community Create | `community/communities/create.blade.php` | Form to create community |
| Community Detail | `community/communities/show.blade.php` | Community info, quick actions |
| Community Edit | `community/communities/edit.blade.php` | Edit community details |
| Member Management | `community/members/index.blade.php` | List pending/approved members |
| Event List | `community/events/index.blade.php` | List events for community |
| Event Create | `community/events/create.blade.php` | Form to create event |
| Event Detail | `community/events/show.blade.php` | Event info, attendee list |
| Event Edit | `community/events/edit.blade.php` | Edit event details |

### Brand Owner Pages

| View | File | Description |
|------|------|-------------|
| Brand Dashboard | `brand/dashboard.blade.php` | Stats: total brands |
| Brand List | `brand/brands/index.blade.php` | List owned brands |
| Brand Create | `brand/brands/create.blade.php` | Form to create brand |
| Brand Detail | `brand/brands/show.blade.php` | Brand info |
| Brand Edit | `brand/brands/edit.blade.php` | Edit brand details |

### Superadmin Pages

| View | File | Description |
|------|------|-------------|
| Superadmin Dashboard | `superadmin/dashboard.blade.php` | Platform stats: users, communities, brands, events |
| User List | `superadmin/users/index.blade.php` | List all users with filters |
| User Detail | `superadmin/users/show.blade.php` | User profile, activity |
| Role Approval Queue | `superadmin/role-approvals/index.blade.php` | List pending role requests with approve/reject |

---

## 10. Component List

| Component | File | Description |
|-----------|------|-------------|
| Alert | `components/alert.blade.php` | Flash message (success, error, warning, info) |
| Badge | `components/badge.blade.php` | Status badge (pending, approved, rejected) |
| Button | `components/button.blade.php` | Reusable button with variants (primary, secondary, danger) |
| Card | `components/card.blade.php` | Content card wrapper |
| Empty State | `components/empty-state.blade.php` | Shown when no data available |
| Modal | `components/modal.blade.php` | Confirmation dialogs |
| Sidebar | `components/sidebar.blade.php` | Dashboard sidebar navigation |
| Avatar | `components/avatar.blade.php` | User avatar with fallback |
| Pagination | `components/pagination.blade.php` | Custom pagination links |
| Search Input | `components/search-input.blade.php` | Debounced search field |
| File Upload | `components/file-upload.blade.php` | Image upload with preview |
| Stats Card | `components/stats-card.blade.php` | Dashboard statistics card |
| Table | `components/data-table.blade.php` | Reusable data table |
| Dropdown | `components/dropdown.blade.php` | Dropdown menu |
| Breadcrumb | `components/breadcrumb.blade.php` | Page breadcrumb navigation |
