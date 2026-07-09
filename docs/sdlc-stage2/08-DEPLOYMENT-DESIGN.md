# 08 — DEPLOYMENT DESIGN

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Environment Strategy

| Environment | Purpose | URL | Database |
|-------------|---------|-----|----------|
| Development | Local development | localhost:3000 (web), localhost:3001 (api) | Local MySQL |
| Staging | Pre-production testing | staging.komunaid.com | Staging MySQL |
| Production | Live platform | komunaid.com | Production MySQL |

---

## Environment Variables

### Backend API (.env)

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="mysql://user:password@localhost:3306/komunaid_dev"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Frontend Web (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Build & Deploy Pipeline

### Development

```bash
# Install dependencies
pnpm install

# Setup database
cd packages/database
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed

# Start development
pnpm dev  # Starts both api and web
```

### Build

```bash
# Build API
cd apps/api
pnpm build  # tsc → dist/

# Build Web
cd apps/web
pnpm build  # Next.js production build
```

### Production Run

```bash
# API
cd apps/api
pnpm start  # node dist/index.js

# Web
cd apps/web
pnpm start  # next start
```

---

## CI/CD Pipeline (Planned)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Push to  │───>│  Lint &  │───>│  Build   │───>│  Deploy  │
│  main     │    │  Test    │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                   │                │                │
                   ▼                ▼                ▼
              TypeScript       pnpm build       Production
              ESLint check     Prisma generate  Environment
              Unit tests       Next build       Health check
```

### Pipeline Steps

| Step | Tool | Command | Pass Criteria |
|------|------|---------|---------------|
| 1. Lint | ESLint | `pnpm lint` | 0 errors |
| 2. Type Check | TypeScript | `pnpm typecheck` | 0 errors |
| 3. Unit Tests | Vitest | `pnpm test` | All pass |
| 4. Build API | TypeScript | `cd apps/api && pnpm build` | Success |
| 5. Build Web | Next.js | `cd apps/web && pnpm build` | Success |
| 6. Prisma Generate | Prisma | `pnpm prisma generate` | Success |
| 7. Deploy API | Platform | Auto-deploy | Health check pass |
| 8. Deploy Web | Platform | Auto-deploy | Health check pass |

---

## Database Management

### Migration Workflow

```bash
# Create migration
cd packages/database
pnpm prisma migrate dev --name <migration_name>

# Apply in production
pnpm prisma migrate deploy

# Reset (development only)
pnpm prisma migrate reset

# Seed
pnpm prisma db seed
```

### Migration Rules

| Rule | Description |
|------|------------|
| No data loss | Always use additive migrations |
| Backward compatible | New fields must be nullable or have defaults |
| Rollback plan | Document rollback steps for each migration |
| Seed data | Include seed data for dev/staging |
| Production review | All migrations reviewed before deploy |

---

## Health Checks

### Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| GET / | API info | 200 { name, version, status } |
| GET /health | Health check | 200 { status: "ok" } |
| GET /ready | Readiness (DB check) | 200 { status: "ready", db: "connected" } |
| GET /live | Liveness | 200 { status: "alive" } |

### Monitoring

| Metric | Target | Alert |
|--------|--------|-------|
| API Response Time | < 200ms (p95) | > 500ms |
| Error Rate | < 1% | > 5% |
| CPU Usage | < 80% | > 90% |
| Memory Usage | < 80% | > 90% |
| DB Connections | < 80% pool | > 90% pool |
| Uptime | > 99.9% | < 99.5% |

---

## Logging Strategy

### Development

```json
{
  "level": "info",
  "transport": { "target": "pino-pretty" },
  "timestamp": true
}
```

### Production

```json
{
  "level": "info",
  "formatters": { "level": (label) => ({ level: label }) },
  "timestamp": true,
  "redact": ["password", "token", "authorization"]
}
```

### Log Levels

| Level | Usage |
|-------|-------|
| fatal | System crash |
| error | Unhandled errors, failed operations |
| warn | Deprecations, retryable failures |
| info | Request logging, audit events |
| debug | Development debugging |

---

## Performance Optimization

| Strategy | Implementation | Impact |
|----------|---------------|--------|
| Database Indexes | 24 indexes on frequently queried fields | Query speed |
| Pagination | Default 20, max 100 | Response size |
| Response Compression | gzip (via platform) | Bandwidth |
| Image Optimization | Next.js Image component | Load time |
| Code Splitting | Next.js automatic | Bundle size |
| ISR | 60s revalidation for static pages | TTFB |
| Connection Pooling | Prisma default pool | DB performance |

---

## Scaling Strategy

### Horizontal Scaling

```
Load Balancer
├── API Instance 1
├── API Instance 2
└── API Instance N

State Management:
  - JWT tokens (stateless)
  - In-memory rate limiter → Redis (production)
  - No session state on server
```

### Database Scaling

```
Phase 1 (MVP): Single MySQL instance
Phase 2: Read replicas for heavy read queries
Phase 3: Connection pooling (PgBouncer equivalent for MySQL)
```

---

## Backup Strategy

| Component | Frequency | Retention |
|-----------|-----------|-----------|
| Database | Daily | 30 days |
| Database | Weekly | 90 days |
| Audit Logs | Permanent | Never delete |
| User Data | Per GDPR request | On request |

---

## Security Checklist

| Item | Status | Notes |
|------|--------|-------|
| HTTPS enforced | ✅ | secure: true on cookies |
| Security headers | ✅ | Helmet-style headers |
| Rate limiting | ✅ | 100/15min |
| Input validation | ✅ | Zod schemas |
| SQL injection protection | ✅ | Prisma ORM |
| XSS protection | ✅ | httpOnly cookies + React |
| CSRF protection | ⚠ | sameSite + planned CSRF token |
| Environment secrets | ✅ | .env not committed |
| Audit trail | ✅ | Immutable AuditLog |
| Soft delete | ✅ | deletedAt on major entities |
| Password hashing | ✅ | bcryptjs 10 rounds |
| RBAC enforcement | ✅ | Middleware on all routes |

---

*Document generated: 2026-07-09*
*Stage: SDLC Stage 2 — System Analysis & Solution Design*
