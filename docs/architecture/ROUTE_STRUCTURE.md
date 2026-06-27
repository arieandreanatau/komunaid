# KomunaID Route Structure (Final)

## Total: 428 routes, 425 named, 0 duplicate names

## Public Routes (`routes/modules/public.php`)

| Method | URI | Name | Controller |
|---|---|---|---|
| GET | / | home | PublicHomeController@index |
| GET | /about | about | PublicPageController@show (about) |
| GET | /contact | contact | PublicContactController@index |
| POST | /contact/suggestions | suggestions.store | PublicSuggestionController@store |
| GET | /blogs | blogs.index | PublicBlogController@index |
| GET | /blogs/{slug} | blogs.show | PublicBlogController@show |
| GET | /komunitas | communities.directory | PublicCommunityController@index |
| GET | /komunitas/{slug} | communities.detail | PublicCommunityController@show |
| GET | /events | events.index | PublicEventController@index |
| GET | /events/{slug} | events.show | PublicEventController@show |

## Auth Routes (`routes/modules/auth.php`)

### Superadmin auth (admin prefix)
| Method | URI | Name | Middleware |
|---|---|---|---|
| GET | /admin/login | admin.login | guest |
| POST | /admin/login | admin.login.submit | guest |
| POST | /admin/logout | admin.logout | auth |

### User auth
| Method | URI | Name | Middleware |
|---|---|---|---|
| GET | /register | register | guest |
| POST | /register | (no name) | guest |
| GET | /login | login | guest |
| POST | /login | (no name) | guest |
| GET | /forgot-password | password.request | guest |
| POST | /forgot-password | password.email | guest |
| GET | /reset-password/{token} | password.reset | guest |
| POST | /reset-password | password.store | guest |
| POST | /logout | logout | auth |

### Onboarding (auth)
| Method | URI | Name |
|---|---|---|
| GET | /onboarding | onboarding |
| GET | /onboarding/role-request | onboarding.role-request |
| POST | /onboarding/role-request | onboarding.role-request.store |
| GET | /onboarding/role-request/status/{roleRequest} | onboarding.role-request.status |
| POST | /onboarding/continue-as-member | onboarding.continue-as-member |

### Public + Dashboard
| Method | URI | Name | Middleware |
|---|---|---|---|
| GET | /account-restricted | account.restricted | (none) |
| GET | /dashboard | dashboard.redirect | auth |

### Community actions (auth + active_user)
| Method | URI | Name |
|---|---|---|
| POST | /komunitas/{community:slug}/join | community_action.join |
| POST | /komunitas/{community:slug}/leave | community_action.leave |
| POST | /komunitas/{community:slug}/report | community_action.report |

## Member Routes (`routes/modules/member.php`) — 40+ routes

Prefix: `/member`, name: `member.`, middleware: `auth`, `active_user`.

Key routes:
- `member.dashboard` (GET /member/dashboard)
- `member.premium-demo` (GET /member/premium-demo)
- `member.profile.edit/update/password.update/avatar.delete/destroy` (5 routes)
- `member.interests.index/update` (2 routes)
- `member.communities.index/export/show` (3 routes)
- `member.events.index/export/register/upload-payment/cancel/my-registrations` (6 routes)
- `member.friends.index/search/request/accept/reject/remove/communities` (7 routes)
- `member.bookmarks.index/store/destroy` (3 routes)
- `member.galleries.index/create/store/edit/update/destroy` (6 routes)
- `member.history.index` (1 route)
- `member.role-requests.index/create/store/show` (4 routes)
- `member.events.chat.show/reply` (2 routes)
- `member.events.volunteer.apply/apply.store/event-volunteer-applications.index` (3 routes)
- `member.events.donate/donate.store` (2 routes)
- `member.wallet.index/history` (2 routes)
- `member.donations.index/show/create-event/store-event/create-community/store-community` (6 routes)

## Community Owner Routes (`routes/modules/community-owner.php`) — 90+ routes

Prefix: `/community-own`, name: `community.`, middleware: `auth`, `active_user`, `not.banned`, `role:community_owner`.

Key route groups:
- Community CRUD (7 routes)
- Member management (6 routes)
- Region management (4 routes)
- Subgroup management (3 routes)
- Event management (10 routes)
- Event participants (5 routes)
- Event volunteer campaigns (8 routes)
- Event volunteer applications (3 routes)
- Event volunteers (4 routes)
- Event donations (4 routes)
- Event finance (8 routes)
- Event gallery (3 routes)
- Event chat (6 routes)
- Community collaborations (7 routes)
- Collaboration proposals (8 routes)
- Wallet (1 route)
- Donations management (3 routes)

Note: the URL prefix is `/community-own` (singular) and the name prefix is `community.` (no `-owner`). This is intentional from the original code and preserved to avoid breaking URLs.

## Brand Owner Routes (`routes/modules/brand-owner.php`) — 30+ routes

Prefix: `/brand`, name: `brand.`, middleware: `auth`, `active_user`, `not.banned`, `role:brand_owner|brand_staff`.

Note: URL prefix `/brand` (not `/brand-owner`) and name prefix `brand.` (no `-owner`). Preserved for backward compat.

## Company Owner Routes (`routes/modules/company-owner.php`) — 15+ routes

Prefix: `/company-owner`, name: `company-owner.`, middleware: `auth`, `active_user`, `not.banned`, `role:company_owner|superadmin`.

## Superadmin Routes (`routes/modules/superadmin.php`) — 150+ routes

Prefix: `/superadmin`, name: `superadmin.`, middleware: `auth`, `admin` (EnsureSuperadmin).

Key route groups:
- Dashboard (1)
- Approval Center (11)
- Role Request Management (4)
- User Management (5)
- Community Management (7)
- Brand Management (7)
- Category Management (5)
- Master Region Management (5)
- Audit Logs (2)
- Wallet Management (3)
- Donation Management (4)
- Platform Fee Reports (2)
- Members (8)
- Community Owners (7)
- Brand Owners (7)
- Companies (8)
- Collaborations (4)
- Communities (Enhanced) (5)
- Brands (Enhanced) (5)
- Events (6)
- Login Logs (2)
- Settings (4)
- Master Data (8)
- CMS Management — 5 submodules (homepage, blogs, pages, contact, suggestions) — 30+ routes
- Admin Chat (10)
- Documentation (10)

## Cron Route (in `routes/web.php`)

| Method | URI | Name | Middleware |
|---|---|---|---|
| GET | /api/cron/scheduler | cron.scheduler | cron.token |

## Stats

- Total routes: 428
- Named: 425
- Unnamed: 3 (POST register, POST login, plus the second webhook-style endpoint)
- Duplicates: 0
- File breakdown:
  - `routes/web.php`: 2 routes (dashboard.redirect, cron.scheduler)
  - `routes/modules/public.php`: 10 routes
  - `routes/modules/auth.php`: 21 routes
  - `routes/modules/member.php`: 50 routes
  - `routes/modules/community-owner.php`: 95 routes
  - `routes/modules/brand-owner.php`: 33 routes
  - `routes/modules/company-owner.php`: 18 routes
  - `routes/modules/superadmin.php`: 199 routes

## URL → Role Quick Reference

| URL Pattern | Role |
|---|---|
| `/`, `/about`, `/contact`, `/blogs/*`, `/komunitas`, `/events` | public |
| `/login`, `/register`, `/forgot-password`, `/reset-password/*`, `/logout` | guest/auth |
| `/admin/login`, `/admin/logout` | superadmin auth |
| `/account-restricted` | public |
| `/dashboard` | any auth |
| `/onboarding/*` | any auth |
| `/komunitas/{slug}/join\|leave\|report` | any auth |
| `/member/*` | member |
| `/community-own/*` | community_owner |
| `/brand/*` | brand_owner / brand_staff |
| `/company-owner/*` | company_owner / superadmin |
| `/superadmin/*` | superadmin |
| `/api/cron/scheduler` | token |
