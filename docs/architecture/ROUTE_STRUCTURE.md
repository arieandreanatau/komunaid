# Route Structure

> Snapshot of `routes/web.php` after audit. 426 routes, 423 unique named routes, 3 unnamed (`POST /login`, `POST /register`, `GET /up`).

## Public

| Method | URI | Name | Middleware |
|---|---|---|---|
| GET | `/` | `home` | web |
| GET | `/communities` | `public.communities.index` | web |
| GET | `/events` | `public.events.index` | web |
| GET | `/blogs` | `public.blogs.index` | web |
| GET | `/about` | `public.about` | web |
| GET | `/contact` | `public.contact` | web |
| GET | `/language/{locale}` | `language.switch` | web |
| POST | `/suggestions` | `public.suggestions.store` | web |

## Auth

| Method | URI | Name | Middleware |
|---|---|---|---|
| GET | `/login` | `login` | web, guest |
| POST | `/login` | (unnamed) | web, guest |
| GET | `/register` | `register` | web, guest |
| POST | `/register` | (unnamed) | web, guest |
| POST | `/logout` | `logout` | web, auth |
| GET | `/onboarding` | `onboarding` | web, auth |
| GET/POST | `/role-request` | `role-request.*` | web, auth |

## Superadmin (excerpt — 100+ routes)

| Method | URI | Name |
|---|---|---|
| GET | `/superadmin/login` | `admin.login` |
| POST | `/superadmin/login` | `admin.login.attempt` |
| POST | `/superadmin/logout` | `admin.logout` |
| GET | `/superadmin/dashboard` | `superadmin.dashboard` |
| GET | `/superadmin/members` | `superadmin.members.index` |
| GET | `/superadmin/communities` | `superadmin.communities.index` |
| GET | `/superadmin/events` | `superadmin.events.index` |
| GET | `/superadmin/brands` | `superadmin.brands.index` |
| GET | `/superadmin/companies` | `superadmin.companies.index` |
| GET | `/superadmin/role-requests` | `superadmin.role-requests.index` |
| GET | `/superadmin/cms` | `superadmin.cms.dashboard` |
| GET | `/superadmin/cms/blogs` | `superadmin.cms.blogs.index` |
| GET | `/superadmin/cms/pages` | `superadmin.cms.pages.index` |
| GET | `/superadmin/cms/homepage` | `superadmin.cms.homepage.index` |
| GET | `/superadmin/cms/contact` | `superadmin.cms.contact.edit` |
| GET | `/superadmin/cms/suggestions` | `superadmin.cms.suggestions.index` |
| GET | `/superadmin/premium` | `superadmin.premium.index` |
| GET | `/superadmin/admin-chat` | `superadmin.admin-chat.index` |
| GET | `/superadmin/documentation` | `superadmin.documentation.index` |
| GET | `/superadmin/login-logs` | `superadmin.login-logs.index` |
| GET | `/superadmin/audit-logs` | `superadmin.audit-logs.index` |
| GET | `/superadmin/wallets` | `superadmin.wallets.index` |
| GET | `/superadmin/platform-fees` | `superadmin.platform-fees.index` |
| GET | `/superadmin/donations` | `superadmin.donations.index` |
| GET | `/superadmin/collaborations` | `superadmin.collaborations.index` |
| GET | `/superadmin/categories` | `superadmin.categories.index` |
| GET | `/superadmin/regions` | `superadmin.regions.index` |
| GET | `/superadmin/master-data` | `superadmin.master-data.index` |
| GET | `/superadmin/approval` | `superadmin.approval.index` |
| GET | `/superadmin/users` | `superadmin.users.index` |
| GET | `/superadmin/settings/profile` | `superadmin.settings.profile` |
| GET | `/superadmin/settings/password` | `superadmin.settings.password` |

## Member

| Method | URI | Name |
|---|---|---|
| GET | `/member/dashboard` | `member.dashboard` |
| GET | `/member/profile` | `member.profile.*` |
| GET | `/member/interests` | `member.interests.*` |
| GET | `/member/communities` | `member.communities.*` |
| GET | `/member/events` | `member.events.*` |
| GET | `/member/friends` | `member.friends.*` |
| GET | `/member/bookmarks` | `member.bookmarks.*` |
| GET | `/member/gallery` | `member.gallery.*` |
| GET | `/member/history` | `member.history.*` |

## Community Owner

| Method | URI | Name |
|---|---|---|
| GET | `/community-owner/dashboard` | `community-owner.dashboard` |
| CRUD | `/community-owner/communities` | `community-owner.communities.*` |
| CRUD | `/community-owner/events` | `community-owner.events.*` |
| GET/POST | `/community-owner/collaborations` | `community-owner.collaborations.*` |

## Brand Owner

| Method | URI | Name |
|---|---|---|
| GET | `/brand-owner/dashboard` | `brand-owner.dashboard` |
| CRUD | `/brand-owner/brands` | `brand-owner.brands.*` |
| CRUD | `/brand-owner/collaborations` | `brand-owner.collaborations.*` |
| GET | `/brand-owner/community-directory` | `brand-owner.community-directory.*` |

## Company Owner

| Method | URI | Name |
|---|---|---|
| GET | `/company-owner/dashboard` | `company-owner.dashboard` |
| CRUD | `/company-owner/companies` | `company-owner.companies.*` |
| GET | `/company-owner/companies/{company}/brands` | `company-owner.companies.brands.*` |
| CRUD | `/company-owner/collaborations` | `company-owner.collaborations.*` |

## Audit Notes

- **Duplicate route names:** none detected.
- **Write-on-GET risks:** none detected (all `*.ban`, `*.suspend`, `*.destroy` are POST/PUT/DELETE).
- **Missing route:** none observed at audit time. Sidebar smoke test confirms.
- **Unnamed routes:** `POST /login`, `POST /register` (auth), `GET /up` (health) — acceptable.
