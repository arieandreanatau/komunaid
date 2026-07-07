# KomunaID Deployment Architecture

## 1. Environment Matrix

| Environment     | Frontend                                 | API                                 | Database                                      | Purpose                                     |
| --------------- | ---------------------------------------- | ----------------------------------- | --------------------------------------------- | ------------------------------------------- |
| **Dev (local)** | Vercel preview / `pnpm dev` (port 3000)  | Docker container (port 4000)        | Local MySQL 8 via `docker-compose.yml`        | Local development and debugging             |
| **Staging**     | Vercel preview deployment (branch-based) | Docker container on staging host    | Managed MySQL staging instance (Hostinger)    | QA, integration testing, stakeholder review |
| **Production**  | Vercel production deployment             | Docker container on production host | Managed MySQL production instance (Hostinger) | Live traffic                                |

## 2. Infrastructure Components

| Component          | Service           | Role                                                                     |
| ------------------ | ----------------- | ------------------------------------------------------------------------ |
| **Frontend**       | Vercel            | Next.js 15 hosting, edge network, ISR/SSG, automatic preview deployments |
| **API**            | Docker container  | NestJS backend on port 4000, built from `Dockerfile.api`                 |
| **Database**       | MySQL 8 (managed) | Hostinger managed MySQL or equivalent RDS-compatible service             |
| **Object Storage** | S3-compatible     | Vercel Blob or AWS S3 for file uploads (avatars, documents)              |
| **Email**          | Resend API        | Transactional emails (verification, password reset, notifications)       |

## 3. Deployment Flow

### Development

```bash
# Start local infrastructure
docker-compose up -d mysql

# Start API
pnpm dev:api

# Start frontend
pnpm dev:web

# Run migrations
pnpm db:migrate
```

### Staging

1. Push to `develop` branch
2. GitHub Actions triggers:
   - Lint and typecheck
   - Run test suite
   - Build Docker image
   - Deploy API container to staging host
   - Run `prisma migrate deploy` against staging database
3. Vercel auto-deploys preview deployment from branch

### Production

1. Push to `main` branch (or merge PR)
2. GitHub Actions triggers:
   - Lint and typecheck
   - Run test suite
   - Build Docker image with production tag
   - **Manual approval gate**
   - Deploy API container to production host
   - Run `prisma migrate deploy` against production database
3. Vercel auto-deploys to production domain

## 4. Docker Configuration

### Dockerfile.api

Multi-stage build based on `node:22-alpine`:

1. **Base stage**: Installs pnpm via corepack
2. **Builder stage**: Installs dependencies, builds `@komunaid/shared`, generates Prisma client, builds API
3. **Runner stage**: Copies built artifacts, exposes port 4000, runs `node dist/main.js`

### docker-compose.yml

Services:

| Service | Image                       | Port                  | Health Check                |
| ------- | --------------------------- | --------------------- | --------------------------- |
| `mysql` | `mysql:8.0`                 | `127.0.0.1:3306:3306` | `mysqladmin ping` every 10s |
| `api`   | Build from `Dockerfile.api` | `4000:4000`           | Depends on mysql healthy    |

Key configurations:

- MySQL data persisted via `mysql_data` named volume
- API connects to MySQL via service name `mysql` (Docker network)
- MySQL port bound to `127.0.0.1` only (not exposed externally)

## 5. Environment Variables

See [environment-variables.md](./environment-variables.md) for the complete reference.

### Critical Production Variables

| Variable                | Source                          | Notes                        |
| ----------------------- | ------------------------------- | ---------------------------- |
| `DATABASE_URL`          | Managed MySQL connection string | Use SSL in production        |
| `JWT_SECRET`            | Secret manager / env            | Min 32 chars, random         |
| `REFRESH_TOKEN_SECRET`  | Secret manager / env            | Separate from JWT_SECRET     |
| `PASSWORD_RESET_SECRET` | Secret manager / env            | Separate from JWT_SECRET     |
| `SMTP_*`                | Resend API credentials          | Use API key as password      |
| `S3_*`                  | Object storage credentials      | Scoped to upload bucket only |
| `CORS_ORIGIN`           | Production frontend URL         | `https://komuna.id`          |

## 6. Database Migration Strategy

### Development

```bash
# Create new migration
pnpm db:migrate

# Reset database (destructive)
pnpm db:reset

# Seed database
pnpm db:seed
```

### Staging / Production

```bash
# Deploy pending migrations (non-destructive)
npx prisma migrate deploy
```

- Migrations run as part of CI/CD pipeline before API container starts
- `prisma migrate deploy` applies pending migrations without generating new ones
- No automatic rollback mechanism

### Rollback

- Rollback requires manual SQL scripts documented alongside each migration
- Each migration file should include a corresponding `down` comment describing the reversal
- Database backups taken before production migration deployments

## 7. Rollback Strategy

### Frontend (Vercel)

- **Instant rollback**: Vercel retains all previous deployments
- Navigate to Vercel dashboard > Deployments > click "..." on target deployment > "Promote to Production"
- Zero-downtime rollback

### API (Docker)

- Previous Docker images are tagged and retained in container registry
- Rollback steps:
  1. Identify last known good image tag
  2. Update deployment to use previous image tag
  3. Redeploy container
- Estimated rollback time: < 2 minutes

### Database

- **No automatic rollback** - Prisma does not support migration down out of the box
- Rollback procedure:
  1. Stop API container (prevent writes)
  2. Execute manual rollback SQL (documented per migration)
  3. Verify data integrity
  4. Deploy API with compatible code version
  5. Resume traffic

### Disaster Recovery

- Database backups: Daily automated backups via managed MySQL provider
- Point-in-time recovery: Available through Hostinger/RDS backup logs
- RTO (Recovery Time Objective): < 1 hour
- RPO (Recovery Point Objective): < 24 hours (daily backups)
