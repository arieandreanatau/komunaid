# KomunaID Environment Variables

Complete reference for all environment variables used across the KomunaID stack.

> Copy `.env.example` to `.env` and fill in values. **Never commit `.env` files.**

## 1. Application

| Variable   | Required | Default                 | Description                          | Example                 |
| ---------- | -------- | ----------------------- | ------------------------------------ | ----------------------- |
| `NODE_ENV` | Yes      | `development`           | Runtime environment mode             | `production`            |
| `APP_NAME` | No       | `KomunaID`              | Application display name             | `KomunaID`              |
| `APP_URL`  | No       | `http://localhost:3000` | Frontend base URL (used server-side) | `https://komuna.id`     |
| `API_URL`  | No       | `http://localhost:4000` | API base URL                         | `https://api.komuna.id` |
| `APP_PORT` | No       | `3000`                  | Frontend dev server port             | `3000`                  |
| `API_PORT` | No       | `4000`                  | API server port                      | `4000`                  |

## 2. Database

| Variable       | Required | Default | Description                             | Example                                |
| -------------- | -------- | ------- | --------------------------------------- | -------------------------------------- |
| `DATABASE_URL` | Yes      | —       | MySQL connection string (Prisma format) | `mysql://user:pass@host:3306/komunaid` |

### Local Development

```
DATABASE_URL="mysql://root:password@localhost:3306/komunaid"
```

### Production (with SSL)

```
DATABASE_URL="mysql://user:pass@host:3306/komunaid?sslaccept=strict"
```

## 3. Authentication

| Variable                   | Required | Default | Description                                                           | Example           |
| -------------------------- | -------- | ------- | --------------------------------------------------------------------- | ----------------- |
| `JWT_SECRET`               | Yes      | —       | Secret key for signing access tokens. Min 32 characters.              | `a3f8b2c1d4e5...` |
| `JWT_EXPIRES_IN`           | No       | `15m`   | Access token expiry duration (ms, s, m, h, d)                         | `15m`             |
| `REFRESH_TOKEN_SECRET`     | Yes      | —       | Secret key for signing refresh tokens. Must differ from `JWT_SECRET`. | `b7d4e1a9c3f2...` |
| `REFRESH_TOKEN_EXPIRES_IN` | No       | `30d`   | Refresh token expiry duration                                         | `30d`             |
| `PASSWORD_RESET_SECRET`    | Yes      | —       | Secret key for password reset tokens. Must differ from others.        | `c5a2d8f1b9e4...` |
| `BCRYPT_SALT_ROUNDS`       | No       | `12`    | Bcrypt hashing rounds (higher = slower but more secure)               | `12`              |

### Security Notes

- Use `openssl rand -hex 32` to generate secrets
- Never reuse the same secret across `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, and `PASSWORD_RESET_SECRET`
- In production, store secrets in a secret manager (AWS Secrets Manager, Vercel Encrypted Env, etc.)

## 4. Email (SMTP)

| Variable    | Required | Default                          | Description                            | Example                        |
| ----------- | -------- | -------------------------------- | -------------------------------------- | ------------------------------ |
| `SMTP_HOST` | Yes      | `localhost`                      | SMTP server hostname                   | `smtp.resend.com`              |
| `SMTP_PORT` | No       | `1025`                           | SMTP server port                       | `587`                          |
| `SMTP_USER` | Yes      | `""`                             | SMTP authentication username           | `resend`                       |
| `SMTP_PASS` | Yes      | `""`                             | SMTP authentication password / API key | `re_xxxxx...`                  |
| `SMTP_FROM` | No       | `"KomunaID <noreply@komuna.id>"` | Default sender address                 | `"KomunaID <hello@komuna.id>"` |

### Resend Configuration

```
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_your_api_key_here
SMTP_FROM="KomunaID <noreply@komuna.id>"
```

### Local Development (MailHog/Mailpit)

```
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""
```

## 5. File Storage (S3-compatible)

| Variable        | Required | Default     | Description                                  | Example                                     |
| --------------- | -------- | ----------- | -------------------------------------------- | ------------------------------------------- |
| `S3_ENDPOINT`   | Yes      | —           | S3-compatible endpoint URL                   | `https://s3.us-east-1.amazonaws.com`        |
| `S3_BUCKET`     | No       | `komunaid`  | S3 bucket name                               | `komunaid-uploads`                          |
| `S3_ACCESS_KEY` | Yes      | —           | S3 access key ID                             | `AKIA...`                                   |
| `S3_SECRET_KEY` | Yes      | —           | S3 secret access key                         | `wJalr...`                                  |
| `S3_REGION`     | No       | `us-east-1` | S3 bucket region                             | `ap-southeast-1`                            |
| `S3_PUBLIC_URL` | Yes      | —           | Public URL base for accessing uploaded files | `https://komunaid-uploads.s3.amazonaws.com` |

## 6. Frontend & CORS

| Variable       | Required | Default                 | Description                                           | Example             |
| -------------- | -------- | ----------------------- | ----------------------------------------------------- | ------------------- |
| `FRONTEND_URL` | Yes      | `http://localhost:3000` | Frontend URL used by API for email links, redirects   | `https://komuna.id` |
| `CORS_ORIGIN`  | Yes      | `http://localhost:3000` | Allowed CORS origin(s). Comma-separated for multiple. | `https://komuna.id` |

## Environment-Specific Configuration

### Local Development

```env
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/komunaid"
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Production

```env
NODE_ENV=production
DATABASE_URL="mysql://user:pass@managed-host:3306/komunaid?sslaccept=strict"
JWT_SECRET=<generated>
REFRESH_TOKEN_SECRET=<generated>
PASSWORD_RESET_SECRET=<generated>
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_<api_key>
SMTP_FROM="KomunaID <noreply@komuna.id>"
S3_ENDPOINT=https://s3.ap-southeast-1.amazonaws.com
S3_BUCKET=komunaid-production
S3_ACCESS_KEY=<generated>
S3_SECRET_KEY=<generated>
S3_REGION=ap-southeast-1
S3_PUBLIC_URL=https://komunaid-production.s3.ap-southeast-1.amazonaws.com
FRONTEND_URL=https://komuna.id
CORS_ORIGIN=https://komuna.id
```
