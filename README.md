# KomunaID

Platform Komunitas Digital Indonesia — menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi secara terstruktur.

**Live:** [https://komuna.id](https://komuna.id)  
**Author:** PT Komuna Digital Indonesia  
**License:** Private

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm 10 workspaces |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 3.4 |
| Backend | Hono v4, Node.js 20+ |
| Database | MySQL 8, Prisma ORM 6 |
| State | Zustand 5, TanStack Query 5 |
| Validation | Zod (shared schemas) |
| Auth | JWT (jose HS256), bcryptjs, httpOnly cookies, CSRF double-submit |
| Email | Resend (primary), Nodemailer (fallback) |
| Logging | Pino |
| Security | Helmet, CSRF, RBAC, rate limiting |
| Testing | Playwright (E2E), Vitest (unit/integration) |
| Deployment | Vercel (web), Vercel/Fly.io (API) |
| Docs | Swagger UI + OpenAPI |

## Monorepo Structure

```
komunaid/
├── apps/
│   ├── api/                    # Hono REST API
│   │   ├── src/
│   │   │   ├── routes/         # 13 public route modules
│   │   │   ├── routes/admin/   # 15 admin route modules
│   │   │   ├── middleware/     # Auth, RBAC, CSRF, validation, security
│   │   │   ├── services/       # Email, audit, rate-limiter, refresh-token
│   │   │   ├── lib/            # Logger, pagination, sanitize, XSS
│   │   │   └── docs/           # OpenAPI spec
│   │   └── e2e/                # API integration tests (Vitest)
│   └── web/                    # Next.js 15 Frontend
│       ├── app/                # App Router (33 routes)
│       ├── components/         # Shared UI components
│       ├── e2e/                # 12 Playwright E2E spec files
│       └── public/             # Static assets
├── packages/
│   ├── constants/              # App constants
│   ├── database/               # Prisma schema & client (35 models)
│   ├── shared/                 # Shared Zod schemas & types (~860 lines)
│   ├── ui/                     # Shared UI components
│   └── utils/                  # Utility functions
├── assets/                     # Brand assets
├── docs/                       # SDLC documentation (stage 1-10)
└── scripts/                    # Seed & utility scripts
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MySQL 8.0+

### Installation

```bash
git clone https://github.com/<owner>/KomunaID.git
cd KomunaID
pnpm install
```

### Environment Setup

```bash
cp .env.example .env.development
```

Edit `.env.development` — minimum required variables:

```env
DATABASE_URL="mysql://root:password@localhost:3306/komunaid_dev"
JWT_SECRET="<min-64-chars>"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="30d"
COOKIE_SECRET="<min-64-chars>"
COOKIE_DOMAIN="localhost"
API_PORT=3001
API_URL="http://localhost:3001"
CORS_ORIGIN="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Optional: Redis, Resend API key, SMTP fallback, S3 storage — see `.env.example`.

### Database Setup

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:seed        # Seed initial data
```

### Development

```bash
pnpm dev            # Start both API and Web concurrently
pnpm dev:web        # Start web only (localhost:3000)
pnpm dev:api        # Start API only (localhost:3001)
```

### Build

```bash
pnpm build          # Build both API and Web
```

### Validation & CI

```bash
pnpm validate       # lint + typecheck + test + build
pnpm lint           # Run linter (all packages)
pnpm typecheck      # TypeScript type checking (all packages)
pnpm ci             # Frozen lockfile install + validate
```

## Public Website Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, features, communities, events, organizations, volunteer, stats, testimonials, partners, FAQ |
| `/about` | Visi, misi, cara kerja, nilai |
| `/communities` | Community directory (search, filter by category/type, sort, pagination) |
| `/communities/[slug]` | Community detail (profile, members, events, tags, social, related) |
| `/organizations` | Organization directory (search, filter, sort, pagination) |
| `/organizations/[slug]` | Organization detail (profile, members, events, tags, contact, related) |
| `/events` | Event directory (status tabs, search, location filter, sort, pagination) |
| `/events/[slug]` | Event detail (registration, quota, organizer, gallery, related) |
| `/volunteer` | Volunteer directory (search, status filter, pagination) |
| `/volunteer/[slug]` | Volunteer detail (positions, apply, schedule, related) |
| `/submit` | Submission form |
| `/organization-structure` | Organization structure |
| `/faq` | FAQ page (expandable accordion) |
| `/contact` | Contact page |
| `/terms`, `/privacy`, `/community-guidelines`, `/volunteer-guidelines`, `/event-guidelines` | Policy pages |
| `/maintenance`, `/not-found`, `/500`, `/forbidden` | Error & status pages |

### Dashboard Routes (Authenticated)

| Route | Description |
|-------|-------------|
| `/dashboard/profile` | User profile |
| `/dashboard/settings` | Account settings |
| `/dashboard/communities` | My communities |
| `/dashboard/organizations` | My organizations |
| `/dashboard/events` | My events |
| `/dashboard/volunteer` | My volunteer activities |
| `/dashboard/interests` | Manage interests |
| `/dashboard/notifications` | Notifications |
| `/dashboard/activity` | Activity history |
| `/dashboard/my-submissions` | My submissions |
| `/dashboard/my-organization-submissions` | Organization submissions |

### Auth Routes

| Route | Description |
|-------|-------------|
| `/login` | Login |
| `/register` | Registration |
| `/forgot-password` | Password reset request |
| `/reset-password` | Password reset form |

## API

Runs at `http://localhost:3001` in development. Swagger UI available at `/api/v1/docs`.

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/users/profile` | Get user profile |
| PUT | `/api/v1/users/profile` | Update profile |
| GET | `/api/v1/communities` | List communities |
| GET | `/api/v1/communities/:slug` | Community detail |
| GET | `/api/v1/organizations` | List organizations |
| GET | `/api/v1/organizations/:slug` | Organization detail |
| GET | `/api/v1/events` | List events |
| GET | `/api/v1/events/:slug` | Event detail |
| GET | `/api/v1/volunteer` | List volunteer opportunities |
| GET | `/api/v1/volunteer/detail/:slug` | Volunteer detail |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/master-data/*` | Provinces, cities, countries, interests, etc. |
| POST | `/api/v1/contact-messages` | Submit contact form |
| GET | `/api/v1/organization-structure` | Public org chart |
| POST | `/api/v1/upload` | File upload |
| GET | `/api/v1/health` | Health check |

### Admin Endpoints (`/api/v1/admin/*`)

15 admin modules: users, communities, organizations, events, volunteers, reports, categories, roles, settings, security, audit, CMS, notifications, dashboard, broadcast.

### RBAC Roles

| Role | Scope | Permissions |
|------|-------|-------------|
| SUPER_ADMIN | Platform | Full access, master data, audit logs |
| PLATFORM_ADMIN | Platform | User/community/org/event moderation |
| MEMBER | Platform | Create communities, orgs, events |
| OWNER | Community/Org | Full management of owned entity |
| ADMIN | Community/Org | Manage members, settings |
| EVENT_MANAGER | Community | Create/manage events |
| MEMBER | Community/Org | Basic participation |

## Security

- **JWT Auth:** Access token (15 min) + refresh token (30 days) with rotation and family tracking
- **CSRF:** Double-submit cookie pattern with `timingSafeEqual`, per-request rotation
- **RBAC:** Role-based access control with 10s in-memory cache
- **Rate Limiting:** Per-endpoint rate limits (login: 5/15min, forgot password: 3/hr, API: 100/15min, admin mutations: 30/min)
- **Headers:** X-Content-Type-Options, X-Frame-Options, HSTS, CSP via Helmet
- **Audit:** AuditLog model is immutable (Prisma middleware prevents update/delete)
- **Data Safety:** Only APPROVED + PUBLIC communities/organizations visible; no draft/pending/rejected/suspended data exposed; no private events; soft-deleted data excluded
- **XSS:** Sanitization via `lib/sanitize.ts` and `lib/xss.ts`

## Database

Schema at `packages/database/prisma/schema.prisma`. 35 models.

### Model Groups

| Domain | Models |
|--------|--------|
| User & Auth | User, UserRole, UserInterest, LoginHistory, RefreshToken |
| Community | Community, CommunityMember, CommunityCategory, CommunityTag, CommunitySettings, CommunityMedia, ForumReply, CommunityStatistic, JoinRequest |
| Organization | Organization, OrganizationMember, OrganizationCategory, OrganizationTag, OrganizationSettings |
| Event | Event, EventRegistration, EventSave, EventCategory |
| Volunteer | VolunteerOpportunity, VolunteerPosition, VolunteerApplication, VolunteerAssignment, VolunteerAttendance |
| Category | Category |
| Moderation | Report (polymorphic), AuditLog |
| Notification | Notification, NotificationTemplate |
| CMS | CmsPage, CmsBanner, CmsContact |
| Other | Setting, OrganizationStructure, OrganizationStructureMember, ContactMessage, MembershipHistory, ActivityHistory |

### Soft Delete

User, Community, Organization, Event, VolunteerOpportunity, OrganizationMember, and Report support soft delete via `deletedAt` field.

## Testing

### Unit & Integration (Vitest)

```bash
pnpm test               # Run API unit tests
pnpm test:coverage      # Run with coverage
pnpm test:watch         # Watch mode
pnpm test:web           # Run web unit tests
```

### E2E (Playwright)

```bash
pnpm test:e2e           # Run all E2E tests
pnpm test:e2e:ui        # Run with Playwright UI
```

12 spec files: landing, auth, navigation, communities, events, volunteer, dashboard, admin, seo, search, accessibility, error-pages.

## Scripts

```bash
scripts/seed-admins.ts     # Seed admin accounts
scripts/seed-superadmin.ts # Seed super admin account
```

## Deployment

### Web (Vercel)

Proyek Vercel menunjuk root monorepo dan `apps/web` sebagai direktori build. Environment variables diset di Vercel dashboard.

### API (Vercel / Fly.io)

```bash
# Fly.io
cd apps/api
fly launch --no-deploy
fly secrets set DATABASE_URL=... JWT_SECRET=...
fly deploy
```

### Database Migration (Production)

```bash
pnpm db:migrate:prod
```

### Environment Variables (Production)

Diset di platform deploy, **bukan** di `.env` yang di-commit:

| Variable | Used By |
|----------|---------|
| `DATABASE_URL` | API |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | API |
| `COOKIE_SECRET`, `COOKIE_DOMAIN` | API |
| `CSRF_SECRET` | API |
| `RESEND_API_KEY` | API (email) |
| `REDIS_URL` | API (rate limiting) |
| `NEXT_PUBLIC_API_URL` | Web |
| `NEXT_PUBLIC_APP_URL` | Web |

### Post-Deploy Smoke Test

1. `GET /health` returns 200
2. Login sebagai owner komunitas
3. Submit create event end-to-end
4. Verifikasi `eventDate` tersimpan dengan offset benar

## Feature Flags

Modul yang belum aktif dapat diaktifkan via env vars. Lihat `.env.example` untuk daftar lengkap: `BRAND_ENABLED`, `CAMPAIGN_ENABLED`, `MARKETPLACE_ENABLED`, `DONATION_ENABLED`, `CHAT_ENABLED`, dll.

## License

Private — PT Komuna Digital Indonesia
