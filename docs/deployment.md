# Deployment

## Overview

| Component      | Platform                     | Trigger                        |
| -------------- | ---------------------------- | ------------------------------ |
| Frontend (web) | **Vercel**                   | Push to `main`                 |
| Backend (api)  | **Docker** on Railway/Fly.io | Push to `main`                 |
| CI             | **GitHub Actions**           | Push/PR to `main` or `develop` |

## Frontend — Vercel

- Framework: Next.js 15 (auto-detected by Vercel)
- Configured in `.github/workflows/deploy-web.yml`
- Uses `amondnet/vercel-action@v25` with secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- Deploys with `--prod` flag from `apps/web` working directory

### Vercel Environment Variables

Set these in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://api.komuna.id/api/v1
```

## Backend — Docker

### Dockerfile (`Dockerfile.api`)

Multi-stage build:

1. **base**: Node 22 Alpine + pnpm
2. **builder**: Install deps → build shared → generate Prisma → build API
3. **runner**: Copy dist + node_modules + prisma → `node dist/main.js`

### Docker Compose (`docker-compose.yml`)

```bash
# Production stack
docker compose up -d

# Includes:
# - mysql:8.0 (port 3306, persistent volume)
# - api (port 4000, depends on mysql healthcheck)
```

### Environment Variables (Production)

Set via Docker environment or `.env`:

```bash
NODE_ENV=production
DATABASE_URL=mysql://user:pass@mysql:3306/komunaid
JWT_SECRET=<secure-random>
JWT_EXPIRES_IN=15m
PASSWORD_RESET_SECRET=<separate-random>
REFRESH_TOKEN_SECRET=<another-random>
REFRESH_TOKEN_EXPIRES_IN=30d
CORS_ORIGIN=https://komuna.id
```

### Deploy Commands

```bash
# Build image
docker build -f Dockerfile.api -t komunaid-api .

# Run
docker run -p 4000:4000 --env-file .env komunaid-api

# Docker Compose
docker compose up -d
```

## CI/CD Pipeline

### CI (`ci.yml`)

Runs on push/PR to `main` and `develop`:

1. **lint-and-build** (matrix: Node 20, 22)
   - `pnpm install --frozen-lockfile`
   - `pnpm build`
   - `pnpm lint`

2. **test** (depends on lint-and-build)
   - Spins up MySQL 8 service container
   - `pnpm --filter @komunaid/database db:generate`
   - `pnpm --filter @komunaid/database db:push`
   - `pnpm --filter @komunaid/database db:seed`
   - `pnpm test`

### Deploy Web (`deploy-web.yml`)

On push to `main` → builds web → deploys to Vercel via `amondnet/vercel-action`.

### Deploy API (`deploy-api.yml`)

On push to `main` → builds API → deploy step (configure for Railway/Fly.io/etc.).

## Production Checklist

- [ ] Set all environment variables (secrets, DB URL, CORS origin)
- [ ] Run `pnpm --filter @komunaid/database db:migrate:prod` (or Docker does it)
- [ ] Verify Swagger at `/api/docs`
- [ ] Configure CORS_ORIGIN to production frontend URL
- [ ] Set up MySQL backups
- [ ] Enable HTTPS
