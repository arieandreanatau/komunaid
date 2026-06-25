# KomunaID — Route Structure

**Last updated:** 2026-06-25
**Total routes:** 426 (verified via `php artisan route:list`)

---

## 1. Naming Convention

- Module prefix: `{role}.` (e.g. `superadmin.dashboard`, `member.profile`).
- Resource actions: `{resource}.{action}` (e.g. `brands.create`, `brands.store`).
- Sub-resources: `{parent}.{child}.{action}` (e.g. `community.events.registrations`).
- No duplicate route names (verified).

---

## 2. Public Routes

| Method | URI | Name | Controller |
|---|---|---|---|
| GET | `/` | `home` | `Public\PublicHomeController@index` |
| GET | `/komunitas` | `communities.directory` | `Public\PublicCommunityController@index` |
| GET | `/komunitas/{slug}` | `communities.detail` | `Public\PublicCommunityController@show` |
| GET | `/events` | `events.index` | `Public\PublicEventController@index` |
| GET | `/events/{slug}` | `events.show` | `Public\PublicEventController@show` |
| GET | `/blogs` | `public.blogs.index` | `Public\PublicBlogController@index` |
| GET | `/blogs/{slug}` | `public.blogs.show` | `Public\PublicBlogController@show` |
| GET | `/about` | `public.about` | `Public\PublicPageController@about` |
| GET | `/contact` | `contact` | `Public\PublicContactController@index` |
| POST | `/contact/suggestions` | `suggestions.store` | `Public\PublicSuggestionController@store` |
| GET | `/language/{locale}` | `language.switch` | `Public\LanguageController@switch` |

---

## 3. Auth Routes

| Method | URI | Name | Notes |
|---|---|---|---|
| GET | `/login` | `login` | guest only |
| POST | `/login` | — | guest only |
| GET | `/register` | `register` | guest only |
| POST | `/register` | — | guest only |
| POST | `/logout` | `logout` | auth |
| GET | `/forgot-password` | `password.request` | guest |
| POST | `/forgot-password` | `password.email` | guest |
| GET | `/reset-password/{token}` | `password.reset` | guest |
| POST | `/reset-password` | `password.store` | guest |
| GET | `/dashboard` | `dashboard.redirect` | auth → role redirect |
| GET | `/onboarding` | `onboarding` | auth |
| POST | `/onboarding/continue-as-member` | `onboarding.continue-as-member` | auth |
| GET | `/onboarding/role-request` | `onboarding.role-request` | auth |
| POST | `/onboarding/role-request` | `onboarding.role-request.store` | auth |
| GET | `/onboarding/role-request/status/{roleRequest}` | `onboarding.role-request.status` | auth |
| GET | `/account/restricted` | `account.restricted` | — |

---

## 4. Member Routes (`/member/*`)

Middleware: `auth`, `role:member|admin_platform|superadmin`, `not.banned`
Prefix: `member.`

Groups:
- `member.dashboard` (GET `/member/dashboard`)
- `member.profile.*` (GET/PATCH/DELETE, avatar, password)
- `member.interests.*` (GET/PUT)
- `member.communities.*` (index, show, export)
- `member.events.*` (index, register, cancel, donate, volunteer, chat, export)
- `member.friends.*` (index, search, request, accept, reject, remove, communities)
- `member.bookmarks.*` (index, store, destroy)
- `member.galleries.*` (resource)
- `member.history.*` (index)
- `member.donations.*` (resource + community-donate + event-donate)
- `member.wallet.*` (index, history)
- `member.role-requests.*` (resource)
- `member.event-volunteer-applications.index`

---

## 5. Community Owner Routes (`/community-own/*`)

Middleware: `auth`, `role:community_owner|admin_platform|superadmin`, `not.banned`
Prefix: `community.`

Groups:
- `community.dashboard`
- `community.communities.*` (resource + show nested sub-resources)
- `community.members.*` (nested under `{community}/members/{member}/...` actions)
- `community.regions.*` (nested)
- `community.subgroups.*` (nested)
- `community.events.*` (resource + nested sub-resources: registrations, donations, finance, galleries, chats, volunteer-campaigns, participants, volunteers)
- `community.donations.*` (legacy confirm flow)
- `community.wallet.index`
- `community.collaborations.*` (V1 accept/cancel/complete/reject)
- `community.proposals.*` (V2 review/accept/reject/cancel/complete + export)

---

## 6. Brand Owner Routes (`/brand/*`)

Middleware: `auth`, `role:brand_owner|admin_platform|superadmin`, `not.banned`
Prefix: `brand.`

Groups:
- `brand.dashboard`
- `brand.brands.*` (resource + archive, transfer-owner, staff nested)
- `brand.staff.*` (nested: search, store, remove)
- `brand.brands.transfer-owner.*` (GET/POST)
- `brand.campaigns.*` (resource)
- `brand.collaborations.*` (legacy V1)
- `brand.proposals.*` (V2 + export + send + cancel)
- `brand.community-directory.*` (index, show)
- `brand.settings.profile.*` (GET/PUT)

---

## 7. Company Owner Routes (`/company-owner/*`)

Middleware: `auth`, `role:company_owner|admin_platform|superadmin`, `not.banned`
Prefix: `company-owner.`

Groups:
- `company-owner.dashboard`
- `company-owner.companies.*` (resource + archive + nested brands)
- `company-owner.companies.brands.*` (attach/detach/create)
- `company-owner.collaborations.*` (V2 + export + send + cancel)
- `company-owner.settings.profile.*`

---

## 8. Superadmin Routes (`/superadmin/*`)

Middleware: `auth`, `admin`, `not.banned`
Prefix: `superadmin.`

Groups:
- `superadmin.dashboard`
- `superadmin.users.*` (show, activate, ban, suspend)
- `superadmin.members.*` (index, show, edit, update, destroy, activate, ban, suspend, export)
- `superadmin.community-owners.*` (index, show, activate, ban, suspend, communities, export)
- `superadmin.brand-owners.*` (index, show, activate, ban, suspend, brands, export)
- `superadmin.communities.*` (index, show, destroy, activate, approve, ban, reject, suspend, transfer-owner, export)
- `superadmin.events.*` (index, show, destroy, archive, cancel, export)
- `superadmin.brands.*` (index, show, destroy, activate, approve, ban, reject, suspend, verify, transfer-owner, export)
- `superadmin.companies.*` (index, show, destroy, activate, ban, suspend, verify, export)
- `superadmin.collaborations.*` (index, show, export, archive)
- `superadmin.donations.*` (index, show, confirm, reject)
- `superadmin.wallets.*` (index, show, adjust)
- `superadmin.platform-fees.*` (index, show)
- `superadmin.login-logs.*` (index, today)
- `superadmin.audit-logs.*` (index, show)
- `superadmin.role-requests.*` (index, show, approve, reject)
- `superadmin.approval-center.*` (index + per-domain approve/reject)
- `superadmin.categories.*` (resource)
- `superadmin.regions.*` (resource)
- `superadmin.master-data.interests.*` (resource)
- `superadmin.master-data.event-types.*` (resource)
- `superadmin.cms.*` (dashboard, blogs, pages, homepage, contact, suggestions)
- `superadmin.admin-chat.*` (resource + nested participants/messages)
- `superadmin.documentation.*` (index, generate, generate-all, generate-single, tools/database, tools/routes, show, download, preview, destroy)
- `superadmin.settings.profile.*`
- `superadmin.settings.password.*`

---

## 9. Cron Route

| Method | URI | Name | Middleware | Notes |
|---|---|---|---|---|
| GET | `/api/cron/scheduler` | `cron.scheduler` | `cron.token` | Vercel Cron triggers; verifies `?token=` matches `CRON_SECRET` env; calls `Artisan::call('schedule:run')` |

---

## 10. Storage

| Method | URI | Name | Notes |
|---|---|---|---|
| GET | `/storage/{path}` | `storage.local` | local dev only; in production files served via R2 public URL |

---

## 11. Health

| Method | URI | Notes |
|---|---|---|
| GET | `/up` | Laravel health check (registered in `bootstrap/app.php`) |

---

## 12. Sidebar Visibility Rule

Sidebar/menu links use `route()` helper. If route is missing → exception. **Action:** keep all declared routes consistent with sidebar; do not delete a route without removing the menu link.
