# Local Development Setup

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MySQL 8.0+ (local or Docker)
- Git

## Quick Start

```bash
# Clone repository
git clone https://github.com/arieandreanatau/komunaid.git komunaid
cd komunaid

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Start MySQL (via Docker)
docker compose up -d mysql

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start development servers
pnpm dev
```

## Services

| Service  | URL                            | Description                  |
| -------- | ------------------------------ | ---------------------------- |
| Frontend | http://localhost:3000          | Next.js web application      |
| API      | http://localhost:4000          | NestJS REST API              |
| Swagger  | http://localhost:4000/api/docs | API documentation (dev only) |

## Default Credentials

| Role           | Email              | Password  |
| -------------- | ------------------ | --------- |
| Super Admin    | admin@komuna.id    | Admin123! |
| Platform Admin | platform@komuna.id | Admin123! |
| Test User      | john@example.com   | User123!  |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
DATABASE_URL="mysql://root:password@localhost:3306/komunaid"
JWT_SECRET="your-secure-random-string"
REFRESH_TOKEN_SECRET="your-secure-random-string"
PASSWORD_RESET_SECRET="your-secure-random-string"
```

See `docs/deployment/environment-variables.md` for full reference.

## IDE Setup

### VS Code

Recommended extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- TypeScript Nightly

Workspace settings are configured in `.vscode/settings.json` (not committed).
