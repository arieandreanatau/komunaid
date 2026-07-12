# 15 — Migration Summary

> KomunaID Super Admin MVP — Platform Governance Module

---

## Prasyarat

- Node.js 20+ terinstall
- pnpm 9+ terinstall
- MySQL 8.0+ accessible
- Backup database sudah dilakukan
- Semua developer sudah pull code terbaru

---

## Langkah-Langkah Migrasi

### Fase 1: Persiapan (H-1)

**1. Backup Database**

```bash
mysqldump -u root -p komuna_id > backup_komuna_id_$(date +%Y%m%d_%H%M%S).sql
```

Verifikasi backup:

```bash
ls -la backup_komuna_id_*.sql
```

**2. Pull Code Terbaru**

```bash
git fetch origin
git checkout main
git pull origin main
```

**3. Install Dependencies**

```bash
pnpm install
```

**4. Verifikasi Environment Variables**

Pastikan file `.env` di `apps/api/` memiliki:

```
DATABASE_URL="mysql://user:password@localhost:3306/komuna_id"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
AWS_S3_BUCKET="komuna-id-assets"
AWS_S3_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
```

---

### Fase 2: Database Migration (H-0, Maintenance Window)

**5. Jalankan Prisma Migration**

```bash
cd packages/database
npx prisma migrate deploy
```

Atau dengan generate:

```bash
cd packages/database
npx prisma generate
npx prisma migrate deploy
```

**6. Verifikasi Migration**

```bash
npx prisma migrate status
```

Pastikan output menunjukkan semua migration sudah ter-apply.

**7. Seed Data (opsional)**

```bash
cd packages/database
npx tsx prisma/seed.ts
```

Seed akan membuat:
- 1 akun Super Admin default
- Data master provinces (34 provinsi Indonesia)
- Data countries (negara utama)
- Settings default platform
- Kategori default (Lingkungan Hidup, Pendidikan, Sosial, dll.)

---

### Fase 3: Build & Deploy (H-0)

**8. Build Semua Package**

```bash
pnpm build
```

Atau build per-package:

```bash
cd packages/constants && pnpm build
cd packages/shared && pnpm build
cd packages/database && pnpm build
cd apps/api && pnpm build
cd apps/web && pnpm build
```

**9. Build Order (Dependencies)**

1. `packages/constants` — Tidak ada dependency internal
2. `packages/shared` — Depends on `packages/constants`
3. `packages/database` — Depends on `packages/shared`
4. `apps/api` — Depends on semua packages
5. `apps/web` — Depends on `packages/shared`

**10. Deploy API**

```bash
cd apps/api
pnpm start
```

**11. Deploy Web**

```bash
cd apps/web
pnpm start
```

Atau deploy ke Vercel:

```bash
vercel --prod
```

---

### Fase 4: Verifikasi (H+0)

**12. Health Check API**

```bash
curl https://api.komuna.id/health
```

**13. Login sebagai Super Admin**

Buka `https://admin.komuna.id` dan login dengan akun Super Admin.

**14. Verifikasi Dashboard**

- Cek statistik muncul dengan benar
- Cek grafik pertumbuhan berfungsi

**15. Verifikasi Setiap Module**

| Module | Endpoint Test | Status |
|--------|---------------|--------|
| Dashboard | `GET /api/v1/admin/dashboard` | [] |
| Users | `GET /api/v1/admin/users` | [] |
| Communities | `GET /api/v1/admin/communities` | [] |
| Events | `GET /api/v1/admin/events` | [] |
| Volunteers | `GET /api/v1/admin/volunteers` | [] |
| Reports | `GET /api/v1/admin/reports` | [] |
| CMS Pages | `GET /api/v1/admin/cms/pages` | [] |
| CMS Banners | `GET /api/v1/admin/cms/banners` | [] |
| Categories | `GET /api/v1/admin/categories` | [] |
| Master Data | `GET /api/v1/admin/master-data/provinces` | [] |
| Audit Logs | `GET /api/v1/admin/audit-logs` | [] |
| Notifications | `GET /api/v1/admin/notifications` | [] |
| Settings | `GET /api/v1/admin/settings` | [] |
| Security | `GET /api/v1/admin/security/login-history` | [] |

**16. Verifikasi RBAC**

- Login sebagai user biasa → akses admin endpoint → harus 403
- Login sebagai Community Admin → akses admin endpoint → harus 403
- Login sebagai Super Admin → akses admin endpoint → harus 200

**17. Verifikasi Audit Log**

Lakukan aksi admin (suspend user) dan cek audit log tercatat.

---

## Rollback Plan

### Jika Migration Gagal

**Step 1: Stop Semua Service**

```bash
# Stop API
kill $(pgrep -f "apps/api")

# Stop Web
kill $(pgrep -f "apps/web")
```

**Step 2: Restore Database dari Backup**

```bash
mysql -u root -p komuna_id < backup_komuna_id_YYYYMMDD_HHMMSS.sql
```

**Step 3: Checkout Code Versi Sebelumnya**

```bash
git checkout HEAD~1
pnpm install
pnpm build
```

**Step 4: Restart Services**

```bash
cd apps/api && pnpm start
cd apps/web && pnpm start
```

### Jika Migration Berhasil tapi ada Bug

**Step 1: Rollback Migration Tertentu**

```bash
cd packages/database
npx prisma migrate reset --force
```

Peringatan: ini akan menghapus semua data dan menjalankan ulang semua migration.

**Step 2: Atau Rollback Satu Migration**

```bash
npx prisma migrate resolve --rolled-back "20260711_add_admin_tables"
```

### Emergency Rollback

Jika downtime terjadi, gunakan tombol maintenance mode:

1. Login ke database langsung
2. Update setting: `UPDATE settings SET value = 'true' WHERE key = 'platform.maintenance_mode'`
3. Restart API service
4. User akan melihat halaman maintenance
5. Lakukan rollback sesuai langkah di atas

---

## Timeline

| Waktu | Aktivitas | Owner |
|-------|-----------|-------|
| H-1 | Backup database, pull code, install deps | DevOps |
| H-0 (00:00) | Masuk maintenance window | Tim |
| H-0 (00:05) | Jalankan database migration | Backend Dev |
| H-0 (00:10) | Build semua package | Backend Dev |
| H-0 (00:15) | Deploy API | Backend Dev |
| H-0 (00:20) | Deploy Web | Frontend Dev |
| H-0 (00:25) | Health check & smoke test | QA |
| H-0 (00:30) | Verifikasi fitur utama | QA |
| H+0 (00:35) | Buka dari maintenance mode | DevOps |
| H+0 (00:40) | Monitor error logs 15 menit | Tim |
| H+1 | Post-deployment review | Tim |

---

## Kontak Darurat

| Peran | Nama | Telepon |
|-------|------|---------|
| Backend Lead | — | — |
| Frontend Lead | — | — |
| DevOps | — | — |
| Database Admin | — | — |
