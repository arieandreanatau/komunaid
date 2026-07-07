# Development

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MySQL 8.0+

## Setup

```bash
# Clone
git clone <repo-url> komunaid
cd komunaid

# Install dependencies
pnpm install

# Environment
cp .env.example .env
# Edit .env — fill DATABASE_URL, JWT secrets, etc.

# Generate Prisma client
pnpm --filter @komunaid/database db:generate

# Run migrations
pnpm db:migrate

# Seed database (creates roles, users, communities, events, etc.)
pnpm db:seed

# Start dev servers (API + web in parallel)
pnpm dev
```

| Service  | URL                            |
| -------- | ------------------------------ |
| Frontend | http://localhost:3000          |
| API      | http://localhost:4000          |
| Swagger  | http://localhost:4000/api/docs |

## Dev Commands

```bash
pnpm dev              # Start all (api + web) in parallel
pnpm dev:api          # API only (nest start --watch)
pnpm dev:web          # Web only (next dev)

pnpm build            # Build all packages
pnpm build:api        # Build API only
pnpm build:web        # Build web only

pnpm lint             # Lint all packages
pnpm lint:fix         # Auto-fix lint issues

pnpm test             # Run tests across all packages
pnpm format           # Format with Prettier

# Database
pnpm db:migrate       # prisma migrate dev
pnpm db:seed          # Seed with sample data
pnpm db:reset         # Reset DB + re-seed
pnpm db:studio        # Open Prisma Studio (GUI)

# Single-package commands
pnpm --filter @komunaid/api lint
pnpm --filter @komunaid/web lint
pnpm --filter @komunaid/database db:generate
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                   | Description                           | Example                                     |
| -------------------------- | ------------------------------------- | ------------------------------------------- |
| `NODE_ENV`                 | Environment mode                      | `development`                               |
| `API_PORT`                 | API server port                       | `4000`                                      |
| `APP_PORT`                 | Web server port                       | `3000`                                      |
| `DATABASE_URL`             | MySQL connection string               | `mysql://root:pass@localhost:3306/komunaid` |
| `JWT_SECRET`               | Access token signing secret           | Random 64+ char string                      |
| `JWT_EXPIRES_IN`           | Access token TTL                      | `15m`                                       |
| `REFRESH_TOKEN_SECRET`     | Refresh token secret                  | Separate random string                      |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token TTL                     | `30d`                                       |
| `PASSWORD_RESET_SECRET`    | Password reset token secret           | Separate random string                      |
| `BCRYPT_SALT_ROUNDS`       | Password hashing rounds               | `12`                                        |
| `SMTP_HOST`                | SMTP server host                      | `localhost`                                 |
| `SMTP_PORT`                | SMTP server port                      | `1025`                                      |
| `S3_ENDPOINT`              | S3-compatible storage endpoint        | —                                           |
| `S3_BUCKET`                | S3 bucket name                        | `komunaid`                                  |
| `CORS_ORIGIN`              | Allowed CORS origin                   | `http://localhost:3000`                     |
| `FRONTEND_URL`             | Public frontend URL (for email links) | `http://localhost:3000`                     |

## Database Workflow

```bash
# After schema changes
pnpm --filter @komunaid/database db:generate   # Regenerate Prisma client

# Create migration
pnpm db:migrate                                # Interactive — names the migration

# Push schema without migration (prototyping)
pnpm --filter @komunaid/database db:push

# Reset entire database
pnpm db:reset                                  # Drops, recreates, migrates, seeds

# Browse data
pnpm db:studio                                 # Opens Prisma Studio at http://localhost:5555
```

## Docker (Local)

```bash
# Start MySQL only
docker compose up mysql -d

# Full stack (MySQL + API)
docker compose up
```

## Default Seed Accounts

| Role           | Email              | Password  |
| -------------- | ------------------ | --------- |
| Super Admin    | admin@komuna.id    | Admin123! |
| Platform Admin | platform@komuna.id | Admin123! |
| Test User      | john@example.com   | User123!  |
