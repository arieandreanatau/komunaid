# KomunaID

Platform Komunitas Digital Indonesia — menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi secara terstruktur.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Hono, Node.js |
| Database | MySQL, Prisma ORM |
| State | Zustand, TanStack Query |
| Validation | Zod |
| Auth | JWT (jose), bcryptjs, Cookie |
| Email | Nodemailer |
| Deployment | Vercel |

## Monorepo Structure

```
komunaid/
├── apps/
│   ├── api/            # Hono REST API
│   └── web/            # Next.js Frontend
├── packages/
│   ├── config/         # Shared config
│   ├── constants/      # App constants
│   ├── database/       # Prisma schema & client
│   ├── shared/         # Shared Zod schemas & types
│   ├── ui/             # Shared UI components
│   └── utils/          # Utility functions
├── assets/             # Brand assets
└── docs/               # SDLC documentation
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MySQL 8.0+

### Installation

```bash
pnpm install
```

### Environment Setup

```bash
cp .env.example .env.development
# Edit .env.development with your database credentials
```

### Database Setup

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:seed        # Seed initial data
```

### Development

```bash
pnpm dev            # Start both API and Web
pnpm dev:web        # Start web only
pnpm dev:api        # Start API only
```

### Build

```bash
pnpm build          # Build both API and Web
```

## Public Website Module

### Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page (hero, features, communities, events, organizations, volunteer, stats, testimonials, partners, FAQ) |
| `/about` | About page (visi, misi, cara kerja, nilai) |
| `/communities` | Community directory (search, filter by category/type, sort, pagination) |
| `/communities/[slug]` | Community detail (profile, members, events, tags, social, related) |
| `/organizations` | Organization directory (search, filter, sort, pagination) |
| `/organizations/[slug]` | Organization detail (profile, members, events, tags, contact, related) |
| `/events` | Event directory (status tabs, search, location filter, sort, pagination) |
| `/events/[slug]` | Event detail (registration, quota, organizer, gallery, related) |
| `/volunteer` | Volunteer directory (search, status filter, pagination) |
| `/volunteer/[slug]` | Volunteer detail (positions, apply, schedule, related) |
| `/about` | About page |
| `/faq` | FAQ page (expandable accordion) |
| `/contact` | Contact page |
| `/terms` | Terms & conditions |
| `/privacy` | Privacy policy |
| `/community-guidelines` | Community guidelines |
| `/event-guidelines` | Event guidelines |
| `/volunteer-guidelines` | Volunteer guidelines |
| `/maintenance` | Maintenance page |
| `/not-found` | 404 page |
| `/500` | 500 server error page |

### Components

| Component | Path | Description |
|-----------|------|-------------|
| Header | `components/header.tsx` | Global navigation header (responsive, user dropdown) |
| Footer | `components/footer.tsx` | Global footer (4-column, brand, links, copyright) |
| Breadcrumbs | `components/breadcrumbs.tsx` | Breadcrumb navigation |
| Pagination | `components/pagination.tsx` | Smart pagination with ellipsis |
| JsonLd | `components/json-ld.tsx` | JSON-LD structured data |
| VolunteerCTA | `components/volunteer-cta.tsx` | Reusable volunteer CTA banner |
| EmptyState | `components/empty-state.tsx` | Reusable empty state |
| Skeleton | `components/skeleton.tsx` | Loading skeleton components |
| ErrorBoundary | `components/error-boundary.tsx` | React error boundary |

### SEO Implementation

- **Metadata**: Title, description, keywords, OpenGraph, Twitter Card on all pages
- **JSON-LD**: Structured data for website and organization
- **Sitemap**: Dynamic sitemap with static pages + API-fetched slugs
- **robots.txt**: Allow public routes, disallow admin/dashboard/api
- **manifest.json**: PWA manifest
- **Breadcrumbs**: On all detail pages
- **Canonical URLs**: Via metadataBase

### Design System

- **Font**: Plus Jakarta Sans
- **Colors**: Deep Navy (#0A1D4D), Royal Blue (#1D4ED8), Teal (#11A79B), Aqua (#00C8E6)
- **Responsive**: Desktop, Tablet, Mobile breakpoints

### Security

- Only APPROVED + PUBLIC communities/organizations visible
- No draft/pending/rejected/suspended data exposed
- No private events exposed
- Soft-deleted data excluded from queries

## API

API runs at `http://localhost:3001` in development.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/register | No | Register new user |
| POST | /api/v1/auth/login | No | Login |
| GET | /api/v1/auth/me | Yes | Get current user |
| GET | /api/v1/communities | No | List communities |
| GET | /api/v1/communities/:slug | No | Community detail |
| GET | /api/v1/organizations | No | List organizations |
| GET | /api/v1/organizations/:slug | No | Organization detail |
| GET | /api/v1/events | No | List events |
| GET | /api/v1/events/:slug | No | Event detail |
| GET | /api/v1/volunteer | No | List volunteer opportunities |
| GET | /api/v1/volunteer/detail/:slug | No | Volunteer detail |
| GET | /api/v1/categories | No | List categories |

### RBAC Roles

| Role | Level | Permissions |
|------|-------|-------------|
| SUPER_ADMIN | Platform | Full access, master data, audit logs |
| PLATFORM_ADMIN | Platform | User/community/org/event moderation |
| MEMBER | Platform | Create communities, orgs, events |
| OWNER | Community/Org | Full management of owned entity |
| ADMIN | Community/Org | Manage members, settings |
| EVENT_MANAGER | Community | Create/manage events |
| MEMBER | Community/Org | Basic participation |

## Database

Schema located at `packages/database/prisma/schema.prisma`.

### Key Models

- User, UserRole
- Community, CommunityMember, CommunitySettings
- Organization, OrganizationMember, OrganizationSettings
- Event, EventRegistration
- VolunteerOpportunity, VolunteerPosition, VolunteerApplication
- Report, AuditLog, Notification

### Soft Delete

User, Community, Organization, Event, VolunteerOpportunity, OrganizationMember, and Report support soft delete via `deletedAt` field.

## Testing

```bash
pnpm lint           # Run linter
pnpm typecheck      # Run type checking
```

## License

Private — PT Komuna Digital Indonesia
