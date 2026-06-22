# KomunaID - Route/API Endpoints

## Public Routes (No Auth)

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | / | HomeController@index | Landing page |
| GET | /communities | CommunityController@index | Community list |
| GET | /communities/{slug} | CommunityController@show | Community detail |
| GET | /search | CommunityController@search | Search communities |

## Auth Routes (Laravel Breeze)

| Method | URI | Description |
|--------|-----|-------------|
| GET | /register | Registration form |
| POST | /register | Process registration |
| GET | /login | Login form |
| POST | /login | Process login |
| POST | /logout | Logout |
| GET | /forgot-password | Forgot password form |
| POST | /forgot-password | Send reset link |
| GET | /reset-password/{token} | Reset password form |
| POST | /reset-password | Process reset |
| GET | /verify-email | Email verification notice |
| GET | /verify-email/{id}/{hash} | Verify email |
| POST | /email/verification-notification | Resend verification |
| GET | /confirm-password | Password confirmation form |
| POST | /confirm-password | Confirm password |
| PUT | /password | Update password |

## Superadmin Routes

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | /superadmin/dashboard | DashboardController@index | Dashboard |
| GET | /superadmin/members | MemberController@index | List members |
| GET | /superadmin/members/{user} | MemberController@show | Member detail |
| PUT | /superadmin/members/{user}/ban | MemberController@ban | Ban member |
| PUT | /superadmin/members/{user}/unban | MemberController@unban | Unban member |
| GET | /superadmin/communities | CommunityController@index | List communities |
| PUT | /superadmin/communities/{community}/approve | CommunityController@approve | Approve community |
| PUT | /superadmin/communities/{community}/reject | CommunityController@reject | Reject community |
| GET | /superadmin/brands | BrandController@index | List brands |
| PUT | /superadmin/brands/{brand}/approve | BrandController@approve | Approve brand |
| PUT | /superadmin/brands/{brand}/reject | BrandController@reject | Reject brand |
| GET | /superadmin/events | EventController@index | List events |
| PUT | /superadmin/events/{event}/approve | EventController@approve | Approve event |
| PUT | /superadmin/events/{event}/reject | EventController@reject | Reject event |
| GET | /superadmin/role-requests | RoleRequestController@index | List role requests |
| PUT | /superadmin/role-requests/{request}/approve | RoleRequestController@approve | Approve role |
| PUT | /superadmin/role-requests/{request}/reject | RoleRequestController@reject | Reject role |
| GET | /superadmin/approvals | ApprovalController@index | All pending approvals |

## Community Owner Routes

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | /community-owner/dashboard | DashboardController@index | Dashboard |
| GET | /community-owner/communities | CommunityController@index | My communities |
| GET | /community-owner/communities/create | CommunityController@create | Create form |
| POST | /community-owner/communities | CommunityController@store | Store community |
| GET | /community-owner/communities/{community}/edit | CommunityController@edit | Edit form |
| PUT | /community-owner/communities/{community} | CommunityController@update | Update community |
| DELETE | /community-owner/communities/{community} | CommunityController@destroy | Delete community |
| GET | /community-owner/communities/{community}/members | MemberController@index | List members |
| PUT | /community-owner/communities/{community}/members/{member}/approve | MemberController@approve | Approve member |
| PUT | /community-owner/communities/{community}/members/{member}/remove | MemberController@remove | Remove member |
| GET | /community-owner/communities/{community}/events | EventController@index | List events |
| GET | /community-owner/communities/{community}/events/create | EventController@create | Create form |
| POST | /community-owner/communities/{community}/events | EventController@store | Store event |
| GET | /community-owner/communities/{community}/events/{event}/edit | EventController@edit | Edit form |
| PUT | /community-owner/communities/{community}/events/{event} | EventController@update | Update event |
| DELETE | /community-owner/communities/{community}/events/{event} | EventController@destroy | Delete event |
| GET | /community-owner/communities/{community}/gallery | GalleryController@index | Gallery list |
| POST | /community-owner/communities/{community}/gallery | GalleryController@store | Upload |
| DELETE | /community-owner/communities/{community}/gallery/{gallery} | GalleryController@destroy | Delete |
| GET | /community-owner/communities/{community}/posts | PostController@index | Posts list |
| POST | /community-owner/communities/{community}/posts | PostController@store | Create post |
| GET | /community-owner/communities/{community}/messages | MessageController@index | Chat |
| POST | /community-owner/communities/{community}/messages | MessageController@store | Send message |
| GET | /community-owner/communities/{community}/collaborations | CollaborationController@index | List |
| PUT | /community-owner/collaborations/{collaboration}/approve | CollaborationController@approve | Approve |
| PUT | /community-owner/collaborations/{collaboration}/reject | CollaborationController@reject | Reject |
| GET | /community-owner/communities/{community}/sub-communities | SubCommunityController@index | List |
| POST | /community-owner/communities/{community}/sub-communities | SubCommunityController@store | Create |
| DELETE | /community-owner/communities/{community}/sub-communities/{sub} | SubCommunityController@destroy | Delete |

## Brand Owner Routes

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | /brand-owner/dashboard | DashboardController@index | Dashboard |
| GET | /brand-owner/brands | BrandController@index | My brands |
| GET | /brand-owner/brands/create | BrandController@create | Create form |
| POST | /brand-owner/brands | BrandController@store | Store brand |
| GET | /brand-owner/brands/{brand}/edit | BrandController@edit | Edit form |
| PUT | /brand-owner/brands/{brand} | BrandController@update | Update brand |
| GET | /brand-owner/communities | CommunityController@index | Browse communities |
| GET | /brand-owner/campaigns | CampaignController@index | My campaigns |
| GET | /brand-owner/campaigns/create | CampaignController@create | Create form |
| POST | /brand-owner/campaigns | CampaignController@store | Store campaign |
| GET | /brand-owner/campaigns/{campaign}/edit | CampaignController@edit | Edit form |
| PUT | /brand-owner/campaigns/{campaign} | CampaignController@update | Update campaign |
| GET | /brand-owner/collaborations | CollaborationController@index | My collaborations |
| POST | /brand-owner/collaborations | CollaborationController@store | Submit collaboration |

## Member Routes

| Method | URI | Controller | Description |
|--------|-----|------------|-------------|
| GET | /member/dashboard | DashboardController@index | Dashboard |
| GET | /member/profile | ProfileController@edit | Edit profile |
| PUT | /member/profile | ProfileController@update | Update profile |
| GET | /member/communities | CommunityController@index | My communities |
| POST | /member/communities/{community}/join | CommunityController@join | Join community |
| POST | /member/communities/{community}/leave | CommunityController@leave | Leave community |
| GET | /member/events | EventController@index | My events |
| POST | /member/events/{event}/register | EventController@register | Register event |
| POST | /member/events/{event}/cancel | EventController@cancel | Cancel registration |
| GET | /member/wallet | WalletController@index | Wallet |
| POST | /member/wallet/topup | WalletController@topup | Top up |
| POST | /member/wallet/donate | WalletController@donate | Donate |
| GET | /member/wallet/history | WalletController@history | Transaction history |
| GET | /member/role-request | RoleRequestController@create | Request form |
| POST | /member/role-request | RoleRequestController@store | Submit request |
| GET | /member/role-request/status | RoleRequestController@status | Check status |
