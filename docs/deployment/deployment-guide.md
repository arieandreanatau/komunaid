# Deployment Guide

## Architecture Overview

```
GitHub Repository (github.com/arieandreanatau/komunaid)
        |
        | Push to main
        V
      Vercel
        |
    ----+----
    |       |
  Next.js   API (NestJS)
 Frontend   Backend
    |       |
    +---+---+
        |
    Hostinger MySQL
```

## Deployment Strategy

### Frontend (Vercel)

- **Framework**: Next.js 15
- **Build Command**: `pnpm install && pnpm build`
- **Output**: Static + SSR
- **Domain**: Configure in Vercel dashboard

### Backend (Vercel Serverless / Node.js)

- **Runtime**: Node.js 20+
- **Build**: `pnpm install && pnpm build`
- **Start**: `node apps/api/dist/main.js`

### Database (Hostinger MySQL)

- **Provider**: Hostinger MySQL 8.0+
- **Connection**: Via `DATABASE_URL` environment variable
- **Migrations**: Run `pnpm db:migrate` before deploy

## Pre-Deployment Checklist

1. Environment variables configured in Vercel
2. Database accessible from deployment environment
3. Prisma migrations run against production database
4. All tests passing
5. Build succeeds locally
6. CORS_ORIGIN updated for production domain

## Deployment Steps

### 1. Push to main branch

```bash
git push origin main
```

### 2. Vercel auto-deploys

Vercel automatically builds and deploys on push to `main`.

### 3. Run production migrations

```bash
DATABASE_URL="mysql://..." pnpm db:migrate:prod
```

### 4. Verify

- Frontend: Check production URL
- API: Check `GET /api/v1/health`
- Database: Verify data integrity

## Environment Variables (Production)

Set these in Vercel Dashboard > Settings > Environment Variables:

| Variable              | Description             | Example                          |
| --------------------- | ----------------------- | -------------------------------- |
| DATABASE_URL          | MySQL connection string | `mysql://user:pass@host:3306/db` |
| JWT_SECRET            | JWT signing secret      | Random 64-char string            |
| REFRESH_TOKEN_SECRET  | Refresh token secret    | Random 64-char string            |
| PASSWORD_RESET_SECRET | Password reset secret   | Random 64-char string            |
| CORS_ORIGIN           | Allowed origin          | `https://komuna.id`              |
| NODE_ENV              | Environment             | `production`                     |
