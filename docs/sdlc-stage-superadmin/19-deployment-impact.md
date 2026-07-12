# 19 — Deployment Impact

> KomunaID Super Admin MVP — Platform Governance Module

---

## Environment Variables

### apps/api/.env

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | MySQL connection string | `mysql://user:pass@host:3306/komuna_id` |
| `JWT_SECRET` | Yes | Secret key untuk JWT signing | `your-super-secret-key-min-32-chars` |
| `JWT_EXPIRES_IN` | Yes | Token expiry duration | `7d` |
| `PORT` | No | Server port (default: 3001) | `3001` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `SMTP_HOST` | Yes | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Yes | Email SMTP port | `587` |
| `SMTP_USER` | Yes | Email SMTP username | `noreply@komuna.id` |
| `SMTP_PASS` | Yes | Email SMTP password | `app-specific-password` |
| `AWS_S3_BUCKET` | Yes | S3 bucket untuk file upload | `komuna-id-assets` |
| `AWS_S3_REGION` | Yes | S3 region | `ap-southeast-1` |
| `AWS_ACCESS_KEY_ID` | Yes | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS secret key | `wJalr...` |
| `CORS_ORIGIN` | Yes | Allowed CORS origin | `https://admin.komuna.id` |
| `LOG_LEVEL` | No | Logging level (default: info) | `info` |
| `REDIS_URL` | No | Redis URL (untuk caching, future) | `redis://localhost:6379` |

### apps/web/.env.local

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL | `https://api.komuna.id/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | Yes | App name | `KomunaID Admin` |

### packages/database/.env

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | MySQL connection string | `mysql://user:pass@host:3306/komuna_id` |

---

## Database Migration Steps

### Pre-Deployment

1. **Backup database**

```bash
mysqldump -u root -p komuna_id > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Verify backup**

```bash
mysql -u root -p komuna_id < backup_YYYYMMDD_HHMMSS.sql --dry-run
```

### Deployment

3. **Run Prisma migration**

```bash
cd packages/database
npx prisma generate
npx prisma migrate deploy
```

4. **Verify migration status**

```bash
npx prisma migrate status
```

Expected output: "All migrations have been applied"

5. **Seed data (opsional)**

```bash
npx tsx prisma/seed.ts
```

### Post-Deployment

6. **Verify API health**

```bash
curl https://api.komuna.id/health
```

7. **Test admin login**

```bash
curl -X POST https://api.komuna.id/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@komuna.id","password":"your-password"}'
```

8. **Verify database connection**

```bash
curl https://api.komuna.id/api/v1/admin/dashboard \
  -H "Authorization: Bearer <token>"
```

---

## Vercel Configuration (apps/web)

### vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.komuna.id/api/v1"
  },
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Vercel Environment Variables

| Variable | Environment | Value |
|----------|-------------|-------|
| `NEXT_PUBLIC_API_URL` | Production | `https://api.komuna.id/api/v1` |
| `NEXT_PUBLIC_API_URL` | Preview | `https://api-staging.komuna.id/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | All | `KomunaID Admin` |

### Vercel Build Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && pnpm build` |
| Output Directory | `.next` |
| Node.js Version | 20.x |
| Install Command | `cd ../.. && pnpm install` |

---

## Server Configuration (apps/api)

### Process Manager (PM2)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'komuna-api',
    script: 'dist/index.js',
    cwd: './apps/api',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    max_memory_restart: '512M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true
  }]
}
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.komuna.id;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

### SSL/TLS

```bash
# Using Certbot
certbot --nginx -d api.komuna.id
certbot --nginx -d admin.komuna.id
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Backup database
- [ ] Pull latest code
- [ ] Install dependencies (`pnpm install`)
- [ ] Review environment variables
- [ ] Notify team tentang maintenance window
- [ ] Set maintenance mode ON (jika diperlukan)

### Deployment

- [ ] Run database migration (`npx prisma migrate deploy`)
- [ ] Verify migration status
- [ ] Build packages (`pnpm build`)
- [ ] Deploy API (restart PM2 / redeploy)
- [ ] Deploy Web (Vercel auto-deploy / manual)
- [ ] Verify API health check
- [ ] Verify Web loads correctly
- [ ] Test admin login
- [ ] Test critical admin functions

### Post-Deployment

- [ ] Set maintenance mode OFF
- [ ] Monitor error logs 15 menit
- [ ] Verify all API endpoints respond correctly
- [ ] Verify frontend renders correctly
- [ ] Notify team deployment selesai
- [ ] Update deployment log

---

## Rollback Procedure

### Jika Database Migration Gagal

1. Stop API service
2. Restore database dari backup:
```bash
mysql -u root -p komuna_id < backup_YYYYMMDD_HHMMSS.sql
```
3. Checkout code versi sebelumnya
4. Rebuild dan redeploy
5. Start API service

### Jika API Deploy Gagal

1. Rollback ke versi sebelumnya:
```bash
pm2 deploy production revert 1
```
2. Atau manual:
```bash
git checkout HEAD~1
pnpm install
pnpm build
pm2 restart komuna-api
```

### Jika Web Deploy Gagal

1. Vercel: rollback ke deployment sebelumnya via dashboard
2. Atau redeploy dari commit sebelumnya:
```bash
vercel --prod --force
```

### Emergency: Maintenance Mode

1. Login ke database langsung:
```sql
INSERT INTO settings (`key`, `value`, `type`, `description`, `group`)
VALUES ('platform.maintenance_mode', 'true', 'BOOLEAN', 'Mode pemeliharaan', 'general')
ON DUPLICATE KEY UPDATE value = 'true';
```
2. Restart API service
3. User akan melihat halaman maintenance

---

## Monitoring During Deployment

| Metrik | Threshold | Action |
|--------|-----------|--------|
| API Response Time | > 2s | Investigasi performance |
| Error Rate | > 1% | Check error logs |
| CPU Usage | > 80% | Scale up instances |
| Memory Usage | > 80% | Check for memory leaks |
| Database Connections | > 80% pool | Check connection pooling |
| HTTP 5xx Errors | Any spike | Rollback jika perlu |

---

## Post-Deployment Verification

### Automated Checks

```bash
# Health check
curl -f https://api.komuna.id/health || echo "FAILED"

# API response check
curl -s https://api.komuna.id/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

# Database connectivity
npx prisma migrate status
```

### Manual Checks

1. Login ke admin panel
2. Dashboard load dengan benar
3. Navigasi ke setiap menu
4. Test search functionality
5. Test aksi admin (suspend user test)
6. Cek audit log tercatat
7. Test broadcast notifikasi (ke test account)
8. Cek settings tersimpan dengan benar
9. Cek security dashboard menampilkan data

---

## Infrastructure Requirements

### Minimum Server Spec (API)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 2 GB | 4 GB |
| Storage | 20 GB SSD | 50 GB SSD |
| Bandwidth | 1 TB | Unmetered |

### Database

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| MySQL Version | 8.0 | 8.0+ |
| Storage | 10 GB | 50 GB |
| Connections | 100 | 200 |
| Backup | Daily | Every 6 hours |

### CDN

| Provider | Use Case |
|----------|----------|
| Cloudflare | DNS, DDoS protection, CDN |
| AWS CloudFront | Static assets, images |
| Vercel Edge | Next.js static generation |

---

## Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable features |
| `Content-Security-Policy` | `default-src 'self'` | Prevent XSS |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
