# KomunaID

**Connect. Collaborate. Community.**

Platform komunitas digital yang menghubungkan komunitas, brand, dan member dalam satu ekosistem kolaborasi.

---

## Overview

KomunaID adalah platform berbasis web yang memungkinkan:
- **Member** menemukan dan bergabung dengan komunitas, mengikuti event, dan membangun jejaring
- **Community Owner** mengelola komunitas, anggota, event, keuangan, dan kolaborasi
- **Brand Owner** menemukan komunitas dan mengirim proposal kolaborasi
- **Company Owner** mengelola brand dan berkolaborasi dengan komunitas
- **Superadmin** mengelola seluruh platform, CMS, dan konten publik

---

## Main Features

| Module | Features |
|--------|----------|
| Public Website | Homepage, community directory, event listing, blog, about, contact |
| Auth & Role | Register, login, password reset, onboarding, role request, 11 roles |
| Member | Dashboard, profile, interests, communities, events, friends, bookmarks, gallery, wallet |
| Community Owner | CRUD community, members, pengurus, volunteers, campaigns, events, wallet, collaborations |
| Brand Owner | CRUD brand, campaigns, proposals, community discovery, staff, ownership transfer |
| Company Owner | CRUD company, brand management, proposals, settings |
| Event | CRUD, registration, volunteers, donations, finance tracking |
| Collaboration | Polymorphic proposals, draft/sent/accepted/rejected workflow |
| Premium/Trial | Feature locks, plans, trial subscriptions, locked UI |
| CMS | Homepage sections, blog, pages, contact settings, suggestions |
| Admin Chat | Conversations, messages, participants, search, archive |
| Documentation | BRD/FRD/SRS generator, preview, download |
| Multilanguage | Indonesian (id), English (en) support |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 11, PHP 8.2+ |
| Frontend | Blade Templates, Vite 5, Tailwind CSS 4 |
| Database | MySQL 8.0 |
| Auth | Laravel Breeze (session-based) |
| Permission | Spatie Laravel Permission v6 |
| API | Laravel Sanctum |
| Build | Vite with Tailwind CSS plugin |

---

## Requirements

- XAMPP 8.2+ (Apache + MySQL) or equivalent
- Composer 2.x
- Node.js 18+
- Git

---

## Local Installation

### Fresh Setup

```bash
# Clone repository
git clone https://github.com/komunaid/komunaid.git
cd komunaid

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database (ensure MySQL is running)
php artisan migrate
php artisan db:seed

# Create storage link
php artisan storage:link

# Build frontend assets
npm run build

# Clear cache
php artisan optimize:clear

# Start server
php artisan serve
```

Open browser: **http://127.0.0.1:8000**

### Update Existing Setup

```bash
php artisan optimize:clear
php artisan migrate
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=FeatureLockSeeder
php artisan db:seed --class=PremiumPlanSeeder
npm run build
php artisan serve
```

---

## Environment Setup

Copy `.env.example` to `.env` and configure:

```env
APP_NAME=KomunaID
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
APP_LOCALE=id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=komunaid
DB_USERNAME=root
DB_PASSWORD=

CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
MAIL_MAILER=log
FILESYSTEM_DISK=public
```

**WARNING:** Never commit `.env` with production credentials.

---

## Database Migration

```bash
# Run all pending migrations
php artisan migrate

# Check migration status
php artisan migrate:status

# WARNING: Do NOT run migrate:fresh in production
```

---

## Seeder

### Master Seeders (always run)

| Seeder | Data |
|--------|------|
| RoleSeeder | 11 roles (Spatie Permission) |
| SuperadminSeeder | Default superadmin account |
| CommunityCategorySeeder | 10 community categories |
| InterestSeeder | 15 interest tags |
| RegionSeeder | 6 provinces + 9 cities |
| EventTypeSeeder | 9 event types |
| CollaborationTypeSeeder | 7 collaboration types |
| ContactSettingSeeder | 3 contact settings |
| FeatureLockSeeder | 17 feature locks |
| PremiumPlanSeeder | 3 premium plans |
| CmsPageSeeder | Basic CMS page |
| HomepageSectionSeeder | 6 homepage sections |

### Demo Seeders (local only, auto-seeded in APP_ENV=local)

| Seeder | Data |
|--------|------|
| DemoUserSeeder | 8 demo users (all roles) |
| DemoCommunitySeeder | 5 communities with members |
| DemoEventSeeder | 5 events with registrations/donations |
| DemoBrandCompanySeeder | 2 companies + 3 brands |
| DemoCollaborationSeeder | 3 collaboration proposals |
| DemoPremiumTrialSeeder | 3 trial subscriptions |
| DemoCmsContentSeeder | Homepage sections, CMS pages, blogs |
| DemoAdminChatSeeder | 1 conversation + 3 messages |

```bash
# Seed everything (safe in local)
php artisan db:seed

# Seed specific seeder
php artisan db:seed --class=DemoUserSeeder
```

---

## Running the App

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
php artisan serve
```

Open: **http://127.0.0.1:8000**

---

## Demo Accounts (LOCAL ONLY)

> **WARNING:** Password `password` is for local/staging only. NEVER use in production.

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Superadmin | `superadmin@komuna.test` | `password` | active |
| Platform Admin | `admin@komuna.test` | `password` | active |
| Member | `member@komuna.test` | `password` | active |
| Community Owner | `community.owner@komuna.test` | `password` | active |
| Brand Owner | `brand.owner@komuna.test` | `password` | active |
| Company Owner | `company.owner@komuna.test` | `password` | active |
| Banned User | `banned@komuna.test` | `password` | banned |
| Suspended User | `suspended@komuna.test` | `password` | suspended |

Additional superadmin (master seeder): `superadmin@komuna.id` / `password`

---

## Main Routes

### Public
| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/tentang-kami` | About |
| `/hubungi-kami` | Contact |
| `/blog` | Blog listing |
| `/komunitas` | Community directory |
| `/event` | Event listing |

### Member
| Route | Description |
|-------|-------------|
| `/member` | Dashboard |
| `/member/profile` | Edit profile |
| `/member/interests` | Manage interests |
| `/member/communities` | My communities |
| `/member/events` | My events |
| `/member/friends` | Friends |
| `/member/bookmarks` | Bookmarks |
| `/member/galleries` | Gallery |
| `/member/wallet` | Wallet |

### Community Owner
| Route | Description |
|-------|-------------|
| `/community-own` | Dashboard |
| `/community-own/communities` | My communities |
| `/community-own/events` | Events |
| `/community-own/wallet` | Wallet |
| `/community-own/collaborations` | Collaborations |
| `/community-own/proposals` | Incoming proposals |

### Brand Owner
| Route | Description |
|-------|-------------|
| `/brand` | Dashboard |
| `/brand/brands` | My brands |
| `/brand/campaigns` | Campaigns |
| `/brand/proposals` | Proposals |
| `/brand/community-directory` | Community discovery |
| `/brand/settings` | Settings |

### Company Owner
| Route | Description |
|-------|-------------|
| `/company-owner` | Dashboard |
| `/company-owner/companies` | My companies |
| `/company-owner/collaborations` | Collaborations |
| `/company-owner/settings` | Settings |

### Superadmin
| Route | Description |
|-------|-------------|
| `/superadmin` | Dashboard |
| `/superadmin/users` | Manage users |
| `/superadmin/communities` | Manage communities |
| `/superadmin/events` | Manage events |
| `/superadmin/cms/*` | CMS management |
| `/superadmin/admin-chat` | Admin chat |
| `/superadmin/documentation` | Documentation generator |

---

## Role Overview

| Role | Access |
|------|--------|
| superadmin | Full admin access, CMS, master data, audit logs |
| platform_admin | Limited admin (users, communities, events) |
| member | Profile, communities, events, friends, bookmarks |
| community_owner | Community CRUD, members, events, wallet, collaborations |
| brand_owner | Brand CRUD, proposals, campaigns, community discovery |
| company_owner | Company CRUD, brand management, proposals |
| brand_staff | Limited brand operations |
| community_admin | Limited community management |
| community_volunteer | Volunteer activities |
| event_volunteer | Event volunteer activities |

---

## Testing

```bash
# Run all tests
php artisan test

# Note: Automated test suite is not yet implemented (see Known Issues)
```

---

## Deployment

See deployment documentation:
- [Local Deployment](docs/deployment/DEPLOYMENT_LOCAL.md)
- [Staging Deployment](docs/deployment/DEPLOYMENT_STAGING.md)
- [Production Deployment](docs/deployment/DEPLOYMENT_PRODUCTION.md)

### Production Commands

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan down
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
```

---

## Folder Structure

```
komunaid/
├── app/
│   ├── Enums/                    # Enum classes
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/             # Authentication controllers
│   │   │   ├── Guest/            # Guest controllers
│   │   │   ├── Public/           # Public page controllers
│   │   │   ├── Member/           # Member controllers
│   │   │   ├── CommunityOwner/   # Community owner controllers
│   │   │   ├── BrandOwner/       # Brand owner controllers
│   │   │   └── CompanyOwner/     # Company owner controllers
│   │   └── Middleware/           # Auth & role middleware
│   ├── Models/                   # 69 Eloquent models
│   └── Services/                 # Business logic services
├── database/
│   ├── migrations/               # 98 migration files
│   └── seeders/                  # Master + demo seeders
├── docs/                         # Documentation
├── lang/                         # Translation files
├── public/
│   └── build/                    # Compiled assets (Vite)
├── resources/
│   ├── views/
│   │   ├── auth/                 # Auth views
│   │   ├── brand/                # Brand owner views
│   │   ├── company-owner/        # Company owner views
│   │   ├── community-owner/      # Community owner views
│   │   ├── components/           # Reusable Blade components
│   │   ├── layouts/              # Layout templates
│   │   ├── member/               # Member views
│   │   ├── public/               # Public page views
│   │   └── superadmin/           # Superadmin views
│   ├── lang/                     # (not used, see root lang/)
│   └── css/                      # Tailwind CSS
├── routes/
│   └── web.php                   # All web routes
├── storage/
│   └── app/
│       ├── deployment/           # Deployment templates
│       ├── documentation/        # Generated documentation
│       └── qa/                   # QA output
├── .env.example                  # Environment template
├── README.md                     # This file
└── composer.json
```

---

## Security Notes

- Never commit `.env` file
- Never use demo passwords in production
- Demo seeders only run in `APP_ENV=local`
- All role-protected routes use Spatie middleware
- Banned/suspended users are blocked by `ActiveUser` middleware
- CSRF protection enabled on all forms
- Passwords are hidden in model serialization
- Soft deletes used on critical models

---

## Known Issues

1. **No automated test suite** — only TestCase.php boilerplate
2. **Limited multilanguage** — only admin_chat.php lang file
3. **No real-time chat** — admin chat requires page refresh
4. **No payment gateway** — trial managed manually
5. **No email notifications** — manual communication required
6. **No logo image** — text-based logo fallback

See [KNOWN_ISSUES_AND_ROADMAP.md](docs/KNOWN_ISSUES_AND_ROADMAP.md) for full list.

---

## Roadmap

### Phase 2
1. Payment gateway (Midtrans/Xendit)
2. Real-time chat (Laravel Reverb)
3. QR attendance
4. Certificate generator
5. Full multilanguage (id/en/su)
6. Automated test suite
7. REST API for mobile app
8. Advanced analytics
9. Email/push notifications
10. Advanced recommendation engine

See [KNOWN_ISSUES_AND_ROADMAP.md](docs/KNOWN_ISSUES_AND_ROADMAP.md) for full roadmap.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Handover](docs/HANDOVER_KOMUNAID_V2.md) | Complete handover document |
| [Known Issues](docs/KNOWN_ISSUES_AND_ROADMAP.md) | Issues and roadmap |
| [Release Notes](docs/RELEASE_NOTES_KOMUNAID_V2.md) | v2.0.0-mvp release notes |
| [Readiness Matrix](docs/FINAL_READINESS_MATRIX.md) | Deployment readiness |
| [Requirements](docs/01-requirements/) | BRD, PRD, User Stories, Use Cases |
| [System Design](docs/02-system-design/) | HLD, LLD, DFD, Wireframe |
| [Database](docs/03-database/) | ERD, Data Dictionary |
| [Testing](docs/04-testing/) | Test Plan, Test Cases |
| [Deployment](docs/deployment/) | Local, Staging, Production guides |

---

## License

MIT License

---

> **Version:** v2.0.0-mvp
> **Maintained by:** KomunaID Team
