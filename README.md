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

## API

API runs at `http://localhost:3001` in development.

### Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/register | No | Register new user |
| POST | /api/v1/auth/login | No | Login |
| GET | /api/v1/auth/me | Yes | Get current user |
| GET | /api/v1/communities | No | List communities |
| POST | /api/v1/communities | Yes | Create community |
| GET | /api/v1/events | No | List events |
| POST | /api/v1/events | Yes | Create event |
| GET | /api/v1/volunteer | No | List volunteer opportunities |

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
