# KomunaID

Platform digital untuk menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi.

**Platform - People - Community - Partnership**

## Tech Stack

- **Monorepo**: pnpm workspace
- **Frontend**: Next.js + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + TypeScript + Prisma ORM
- **Database**: MySQL
- **Auth**: JWT (access + refresh token) + bcrypt

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MySQL 8.0+

### Setup

```bash
# Clone & install
git clone <repo-url> komunaid
cd komunaid
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
pnpm --filter @komunaid/database db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start dev servers
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs

### Default Credentials

| Role           | Email              | Password  |
| -------------- | ------------------ | --------- |
| Super Admin    | admin@komuna.id    | Admin123! |
| Platform Admin | platform@komuna.id | Admin123! |
| Test User      | john@example.com   | User123!  |

## Project Structure

```
komunaid/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── shared/       # Shared types, validators, utils
│   └── database/     # Prisma schema, migrations, seed
├── tools/
├── docs/
├── .github/workflows/
├── pnpm-workspace.yaml
└── package.json
```

## Scope MVP

See docs/ directory for full scope documentation.

### In Scope

- Public website (landing, directories, detail pages)
- Authentication (register, login, forgot/reset password)
- Member features (profile, interests, joined communities, events)
- Community management (create, approve, membership, posts, events)
- Organization management (create, approve, team, events)
- Admin (super admin, platform admin, approvals, moderation, audit log)
- Core technical (RBAC, REST API, MySQL, Prisma, audit log, pagination, search)

### Later Scope (Not Built Yet)

- Payment gateway, wallet, marketplace
- Chat internal
- Native mobile app
- Advanced analytics
- Public API

## License

Proprietary - PT Komuna Digital Indonesia
