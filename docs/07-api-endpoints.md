# KomunaID - Route/API Endpoints

> Terakhir diperbarui: sesuai `routes/web.php` (329 lines)

## Public Routes (No Auth)

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/` | Guest\HomeController@index | Landing page |
| GET | `/komunitas` | Guest\CommunityDirectoryController@index | Community directory |
| GET | `/komunitas/{community:slug}` | Guest\CommunityDirectoryController@show | Community detail |
| GET | `/events` | Member\EventController@index | Public event listing |
| GET | `/events/{event:slug}` | Member\EventController@show | Public event detail |

## Superadmin Auth (Separate Login)

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/admin/login` | Superadmin\LoginController@showLoginForm | SA login form |
| POST | `/admin/login` | Superadmin\LoginController@login | SA login process |
| POST | `/admin/logout` | Superadmin\LoginController@logout | SA logout |

## Auth Routes (User Login)

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/register` | Auth\RegisteredUserController@create | Registration form |
| POST | `/register` | Auth\RegisteredUserController@store | Process registration |
| GET | `/login` | Auth\AuthenticatedSessionController@create | Login form |
| POST | `/login` | Auth\AuthenticatedSessionController@store | Process login |
| GET | `/forgot-password` | Auth\PasswordResetLinkController@create | Forgot password form |
| POST | `/forgot-password` | Auth\PasswordResetLinkController@store | Send reset link |
| GET | `/reset-password/{token}` | Auth\NewPasswordController@create | Reset password form |
| POST | `/reset-password` | Auth\NewPasswordController@store | Process reset |
| POST | `/logout` | Auth\AuthenticatedSessionController@destroy | Logout |

## Authenticated - Onboarding

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/onboarding` | Auth\OnboardingController@index | Onboarding page |

## Authenticated - Member Community Actions

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| POST | `/komunitas/{community:slug}/join` | Member\CommunityController@join | Join community |
| POST | `/komunitas/{community:slug}/leave` | Member\CommunityController@leave | Leave community |

## Member Routes (`/member`)

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/member/dashboard` | Member\DashboardController@index | Member dashboard |
| GET | `/member/profile` | Member\ProfileController@edit | Edit profile form |
| PATCH | `/member/profile` | Member\ProfileController@update | Update profile |
| DELETE | `/member/profile` | Member\ProfileController@destroy | Delete account |
| GET | `/member/role-request` | Member\RoleRequestController@index | Role request list |
| POST | `/member/role-request` | Member\RoleRequestController@store | Submit role request |
| POST | `/member/events/{event:slug}/register` | Member\EventController@register | Register for event |
| POST | `/member/events/{event:slug}/payment/{registration}` | Member\EventController@uploadPayment | Upload payment proof |
| POST | `/member/events/{event:slug}/cancel/{registration}` | Member\EventController@cancelRegistration | Cancel registration |
| GET | `/member/my-registrations` | Member\EventController@myRegistrations | My event registrations |
| GET | `/member/events/{event:slug}/chat/{chat}` | Member\EventChatController@show | View event chat |
| POST | `/member/events/{event:slug}/chat/{chat}/reply` | Member\EventChatController@storeThread` | Reply to event chat |
| GET | `/member/wallet` | Member\WalletController@index | Wallet dashboard |
| GET | `/member/wallet/history` | Member\WalletController@history | Wallet transaction history |
| GET | `/member/donations` | Member\DonationController@index` | My donations list |
| GET | `/member/donations/{donation}` | Member\DonationController@show | Donation detail |
| GET | `/member/donations/event/{event:slug}` | Member\DonationController@createEventDonation | Donate to event form |
| POST | `/member/donations/event/{event:slug}` | Member\DonationController@storeEventDonation | Store event donation |
| GET | `/member/donations/community/{community}` | Member\DonationController@createCommunityDonation | Donate to community form |
| POST | `/member/donations/community/{community}` | Member\DonationController@storeCommunityDonation | Store community donation |

## Community Owner Routes (`/community-own`)

> Middleware: `role:community_owner`

### Dashboard
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/dashboard` | CommunityOwner\DashboardController@index | CO dashboard |

### Community CRUD
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/communities` | CommunityOwner\CommunityController@index | My communities |
| GET | `/community-own/communities/create` | CommunityOwner\CommunityController@create | Create form |
| POST | `/community-own/communities` | CommunityOwner\CommunityController@store | Store community |
| GET | `/community-own/communities/{community}` | CommunityOwner\CommunityController@show | Community detail |
| GET | `/community-own/communities/{community}/edit` | CommunityOwner\CommunityController@edit | Edit form |
| PUT | `/community-own/communities/{community}` | CommunityOwner\CommunityController@update | Update community |
| DELETE | `/community-own/communities/{community}` | CommunityOwner\CommunityController@destroy | Delete community |

### Member Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/communities/{community}/members` | CommunityOwner\MemberController@index | List members |
| POST | `/community-own/communities/{community}/members/{member}/approve` | CommunityOwner\MemberController@approveMember | Approve member |
| PUT | `/community-own/communities/{community}/members/{member}/role` | CommunityOwner\MemberController@updateRole | Update member role |
| DELETE | `/community-own/communities/{community}/members/{member}/remove` | CommunityOwner\MemberController@remove | Remove member |
| POST | `/community-own/communities/{community}/members/{member}/ban` | CommunityOwner\MemberController@ban | Ban member |
| POST | `/community-own/communities/{community}/members/{member}/unban` | CommunityOwner\MemberController@unban | Unban member |

### Region Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/communities/{community}/regions` | CommunityOwner\RegionController@index | List regions |
| GET | `/community-own/communities/{community}/regions/create` | CommunityOwner\RegionController@create | Create form |
| POST | `/community-own/communities/{community}/regions` | CommunityOwner\RegionController@store | Store region |
| GET | `/community-own/communities/{community}/regions/{region}` | CommunityOwner\RegionController@show | Region detail |
| DELETE | `/community-own/communities/{community}/regions/{region}` | CommunityOwner\RegionController@destroy | Delete region |

### Subgroup Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/communities/{community}/subgroups` | CommunityOwner\SubgroupController@index | List subgroups |
| GET | `/community-own/communities/{community}/subgroups/create` | CommunityOwner\SubgroupController@create | Create form |
| POST | `/community-own/communities/{community}/subgroups` | CommunityOwner\SubgroupController@store | Store subgroup |
| DELETE | `/community-own/communities/{community}/subgroups/{subgroup}` | CommunityOwner\SubgroupController@destroy | Delete subgroup |

### Event Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/events` | CommunityOwner\EventController@index | My events |
| GET | `/community-own/events/create` | CommunityOwner\EventController@create | Create form |
| POST | `/community-own/events` | CommunityOwner\EventController@store | Store event |
| GET | `/community-own/events/{event}` | CommunityOwner\EventController@show | Event detail |
| GET | `/community-own/events/{event}/edit` | CommunityOwner\EventController@edit | Edit form |
| PUT | `/community-own/events/{event}` | CommunityOwner\EventController@update | Update event |
| DELETE | `/community-own/events/{event}` | CommunityOwner\EventController@destroy | Delete event |

### Event Registrations
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/events/{event}/registrations` | CommunityOwner\EventController@registrations | List registrations |
| POST | `/community-own/events/{event}/registrations/{registration}/confirm` | CommunityOwner\EventController@confirmPayment | Confirm payment |
| POST | `/community-own/events/{event}/registrations/{registration}/reject` | CommunityOwner\EventController@rejectPayment | Reject payment |

### Event Gallery
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/events/{event}/galleries` | CommunityOwner\EventGalleryController@index | List gallery |
| POST | `/community-own/events/{event}/galleries` | CommunityOwner\EventGalleryController@store` | Upload to gallery |
| DELETE | `/community-own/events/{event}/galleries/{gallery}` | CommunityOwner\EventGalleryController@destroy | Delete from gallery |

### Event Chat (Forum)
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/events/{event}/chats` | CommunityOwner\EventChatController@index | List chats |
| POST | `/community-own/events/{event}/chats` | CommunityOwner\EventChatController@store | Create chat |
| GET | `/community-own/events/{event}/chats/{chat}` | CommunityOwner\EventChatController@show | View chat |
| POST | `/community-own/events/{event}/chats/{chat}/pin` | CommunityOwner\EventChatController@togglePin | Toggle pin |
| DELETE | `/community-own/events/{event}/chats/{chat}` | CommunityOwner\EventChatController@destroy | Delete chat |
| POST | `/community-own/events/{event}/chats/{chat}/threads/{thread}/approve` | CommunityOwner\EventChatController@approveThread | Approve reply |
| POST | `/community-own/events/{event}/chats/{chat}/threads/{thread}/reject` | CommunityOwner\EventChatController@rejectThread | Reject reply |

### Collaboration
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/collaborations` | CommunityOwner\CommunityCollaborationController@index | List collaborations |
| GET | `/community-own/collaborations/create` | CommunityOwner\CommunityCollaborationController@create | Create form |
| POST | `/community-own/collaborations` | CommunityOwner\CommunityCollaborationController@store | Store collaboration |
| GET | `/community-own/collaborations/{collaboration}` | CommunityOwner\CommunityCollaborationController@show | Detail |
| POST | `/community-own/collaborations/{collaboration}/accept` | CommunityOwner\CommunityCollaborationController@accept | Accept |
| POST | `/community-own/collaborations/{collaboration}/reject` | CommunityOwner\CommunityCollaborationController@reject | Reject |
| POST | `/community-own/collaborations/{collaboration}/cancel` | CommunityOwner\CommunityCollaborationController@cancel | Cancel |
| POST | `/community-own/collaborations/{collaboration}/complete` | CommunityOwner\CommunityCollaborationController@complete | Complete |

### Wallet & Donations
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/community-own/wallet` | CommunityOwner\CommunityWalletController@index | Community wallet |
| GET | `/community-own/donations` | CommunityOwner\DonationController@index | Donations list |
| GET | `/community-own/donations/{donation}` | CommunityOwner\DonationController@show | Donation detail |
| POST | `/community-own/donations/{donation}/confirm` | CommunityOwner\DonationController@confirm | Confirm donation |
| POST | `/community-own/donations/{donation}/reject` | CommunityOwner\DonationController@reject | Reject donation |

## Brand Owner Routes (`/brand`)

> Middleware: `role:brand_owner|brand_staff`

### Dashboard
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/brand/dashboard` | BrandOwner\DashboardController@index | Brand dashboard |

### Brand CRUD
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/brand/brands` | BrandOwner\BrandController@index | My brands |
| GET | `/brand/brands/create` | BrandOwner\BrandController@create | Create form |
| POST | `/brand/brands` | BrandOwner\BrandController@store | Store brand |
| GET | `/brand/brands/{brand}` | BrandOwner\BrandController@show | Brand detail |
| GET | `/brand/brands/{brand}/edit` | BrandOwner\BrandController@edit | Edit form |
| PUT | `/brand/brands/{brand}` | BrandOwner\DashboardController@update | Update brand |
| DELETE | `/brand/brands/{brand}` | BrandOwner\BrandController@destroy | Delete brand |

### Campaign CRUD
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/brand/campaigns` | BrandOwner\CampaignController@index | My campaigns |
| GET | `/brand/campaigns/create` | BrandOwner\CampaignController@create | Create form |
| POST | `/brand/campaigns` | BrandOwner\CampaignController@store | Store campaign |
| GET | `/brand/campaigns/{campaign}` | BrandOwner\CampaignController@show | Campaign detail |
| GET | `/brand/campaigns/{campaign}/edit` | BrandOwner\CampaignController@edit | Edit form |
| PUT | `/brand/campaigns/{campaign}` | BrandOwner\CampaignController@update | Update campaign |
| DELETE | `/brand/campaigns/{campaign}` | BrandOwner\CampaignController@destroy | Delete campaign |

### Collaboration Requests
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/brand/collaborations` | BrandOwner\CollaborationController@index | My collaborations |
| GET | `/brand/collaborations/create` | BrandOwner\CollaborationController@create | Create form |
| POST | `/brand/collaborations` | BrandOwner\CollaborationController@store | Submit collaboration |
| GET | `/brand/collaborations/{collaboration}` | BrandOwner\CollaborationController@show | Detail |
| DELETE | `/brand/collaborations/{collaboration}` | BrandOwner\CollaborationController@destroy | Delete |

### Staff Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/brand/brands/{brand}/staff` | BrandOwner\StaffController@index | List staff |
| POST | `/brand/brands/{brand}/staff` | BrandOwner\StaffController@store | Add staff |
| DELETE | `/brand/brands/{brand}/staff/{member}` | BrandOwner\StaffController@remove | Remove staff |
| GET | `/brand/brands/{brand}/staff/search` | BrandOwner\StaffController@searchUsers | Search users |

### Community Directory
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/brand/communities` | BrandOwner\CommunityDirectoryController@index | Browse communities |
| GET | `/brand/communities/{community}` | BrandOwner\CommunityDirectoryController@show | Community detail |

## Superadmin Routes (`/superadmin`)

> Middleware: `admin`

### Dashboard
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/dashboard` | Superadmin\DashboardController@index | Dashboard |

### Approval Center
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/approval-center` | Superadmin\ApprovalCenterController@index | All pending approvals |
| POST | `/superadmin/approval-center/role-requests/{roleRequest}/approve` | Superadmin\ApprovalCenterController@approveRoleRequest | Approve role request |
| POST | `/superadmin/approval-center/role-requests/{roleRequest}/reject` | Superadmin\ApprovalCenterController@rejectRoleRequest | Reject role request |
| POST | `/superadmin/approval-center/communities/{community}/approve` | Superadmin\ApprovalCenterController@approveCommunity | Approve community |
| POST | `/superadmin/approval-center/communities/{community}/reject` | Superadmin\ApprovalCenterController@rejectCommunity | Reject community |
| POST | `/superadmin/approval-center/brands/{brand}/approve` | Superadmin\ApprovalCenterController@approveBrand | Approve brand |
| POST | `/superadmin/approval-center/brands/{brand}/reject` | Superadmin\ApprovalCenterController@rejectBrand | Reject brand |
| POST | `/superadmin/approval-center/events/{event}/approve` | Superadmin\ApprovalCenterController@approveEvent | Approve event |
| POST | `/superadmin/approval-center/events/{event}/reject` | Superadmin\ApprovalCenterController@rejectEvent | Reject event |
| POST | `/superadmin/approval-center/payments/{payment}/confirm` | Superadmin\ApprovalCenterController@confirmPayment | Confirm payment |
| POST | `/superadmin/approval-center/payments/{payment}/reject` | Superadmin\ApprovalCenterController@rejectPayment | Reject payment |
| POST | `/superadmin/approval-center/collaborations/{collaboration}/{status}` | Superadmin\ApprovalCenterController@updateCollaborationStatus | Update collaboration status |

### User Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/users` | Superadmin\UserController@index | List users |
| GET | `/superadmin/users/{user}` | Superadmin\UserController@show | User detail |
| POST | `/superadmin/users/{user}/suspend` | Superadmin\UserController@suspend | Suspend user |
| POST | `/superadmin/users/{user}/ban` | Superadmin\UserController@ban | Ban user |
| POST | `/superadmin/users/{user}/activate` | Superadmin\UserController@activate | Activate user |

### Community Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/communities` | Superadmin\CommunityController@index | List communities |
| GET | `/superadmin/communities/{community}` | Superadmin\CommunityController@show | Community detail |
| POST | `/superadmin/communities/{community}/approve` | Superadmin\CommunityController@approve | Approve community |
| POST | `/superadmin/communities/{community}/reject` | Superadmin\CommunityController@reject | Reject community |
| POST | `/superadmin/communities/{community}/suspend` | Superadmin\CommunityController@suspend | Suspend community |
| DELETE | `/superadmin/communities/{community}` | Superadmin\CommunityController@destroy | Delete community |

### Brand Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/brands` | Superadmin\BrandController@index | List brands |
| GET | `/superadmin/brands/{brand}` | Superadmin\BrandController@show | Brand detail |
| POST | `/superadmin/brands/{brand}/approve` | Superadmin\BrandController@approve | Approve brand |
| POST | `/superadmin/brands/{brand}/reject` | Superadmin\BrandController@reject | Reject brand |
| POST | `/superadmin/brands/{brand}/suspend` | Superadmin\BrandController@suspend | Suspend brand |
| DELETE | `/superadmin/brands/{brand}` | Superadmin\BrandController@destroy | Delete brand |

### Category Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/categories` | Superadmin\CategoryController@index | List categories |
| GET | `/superadmin/categories/create` | Superadmin\CategoryController@create | Create form |
| POST | `/superadmin/categories` | Superadmin\CategoryController@store | Store category |
| GET | `/superadmin/categories/{category}/edit` | Superadmin\CategoryController@edit | Edit form |
| PUT | `/superadmin/categories/{category}` | Superadmin\CategoryController@update | Update category |
| DELETE | `/superadmin/categories/{category}` | Superadmin\CategoryController@destroy | Delete category |

### Master Region Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/regions` | Superadmin\MasterRegionController@index | List regions |
| GET | `/superadmin/regions/create` | Superadmin\MasterRegionController@create | Create form |
| POST | `/superadmin/regions` | Superadmin\MasterRegionController@store | Store region |
| GET | `/superadmin/regions/{region}/edit` | Superadmin\MasterRegionController@edit | Edit form |
| PUT | `/superadmin/regions/{region}` | Superadmin\MasterRegionController@update | Update region |
| DELETE | `/superadmin/regions/{region}` | Superadmin\MasterRegionController@destroy | Delete region |

### Audit Logs
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/audit-logs` | Superadmin\AuditLogController@index | List audit logs |
| GET | `/superadmin/audit-logs/{auditLog}` | Superadmin\AuditLogController@show | Audit log detail |

### Wallet Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/wallets` | Superadmin\WalletController@index | List user wallets |
| GET | `/superadmin/wallets/{user}` | Superadmin\WalletController@show | User wallet detail |
| POST | `/superadmin/wallets/{user}/adjust` | Superadmin\WalletController@adjust | Adjust wallet balance |

### Donation Management
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/donations` | Superadmin\DonationController@index | List donations |
| GET | `/superadmin/donations/{donation}` | Superadmin\DonationController@show | Donation detail |
| POST | `/superadmin/donations/{donation}/confirm` | Superadmin\DonationController@confirm | Confirm donation |
| POST | `/superadmin/donations/{donation}/reject` | Superadmin\DonationController@reject | Reject donation |

### Platform Fee Reports
| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | `/superadmin/platform-fees` | Superadmin\PlatformFeeController@index | List platform fees |
| GET | `/superadmin/platform-fees/{platformFee}` | Superadmin\PlatformFeeController@show | Fee detail |
