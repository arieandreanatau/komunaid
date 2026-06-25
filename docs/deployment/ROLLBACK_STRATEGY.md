# KomunaID V2 — Rollback Strategy

> Strategi rollback jika deployment bermasalah.

---

## Kapan Rollback Dilakukan

1. Error 500 setelah deploy
2. Migration gagal di production
3. Fitur critical tidak berfungsi
4. Performance degradation signifik
5. Security vulnerability ditemukan

---

## Pre-Rollback Checklist

| # | Item | Confirmed |
|---|------|-----------|
| 1 | Error/issue teridentifikasi | [ ] |
| 2 | Backup terbaru tersedia | [ ] |
| 3 | Database backup tersedia | [ ] |
| 4 | Stakeholder dinotifikasi | [ ] |
| 5 | Maintenance mode dipertimbangkan | [ ] |

---

## Rollback Steps (Git-based)

### 1. Maintenance Mode

```bash
php artisan down
```

### 2. Restore Code

```bash
# Option A: Checkout previous tag
git fetch origin
git checkout v2.0.0-pre-deploy

# Option B: Revert to previous commit
git revert HEAD
```

### 3. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

### 4. Database Rollback (jika migration breaking)

```bash
# Rollback last batch
php artisan migrate:rollback

# Atau restore from backup
mysql -u USER -p DATABASE_NAME < backup_komunaid_YYYYMMDD.sql
```

> **WARNING:** Database rollback hati-hati jika data baru sudah masuk setelah migration.

### 5. Clear & Rebuild Cache

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 6. Storage Rollback (jika perlu)

```bash
# Restore storage dari backup
tar -xzf storage_backup_YYYYMMDD.tar.gz -C /var/www/komunaid/
php artisan storage:link
```

### 7. Bring App Up

```bash
php artisan up
```

### 8. Smoke Test

Lihat [SMOKE_TEST_CHECKLIST.md](./SMOKE_TEST_CHECKLIST.md)

### 9. Notify Stakeholder

```
Rollback completed.
Previous version restored.
Root cause: [DESCRIPTION]
Next steps: [ACTION PLAN]
```

### 10. Document Incident

Catat di incident log:
- Waktu issue ditemukan
- Waktu rollback dimulai
- Waktu rollback selesai
- Root cause
- Impact
- Prevention plan

---

## Rollback Commands Reference

```bash
# Full rollback sequence
php artisan down
git checkout vPREVIOUS_VERSION
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
```

---

## Shared Hosting Rollback

Jika tidak ada git:

1. Upload backup zip release sebelumnya
2. Replace current files (kecuali `.env`)
3. Restore database dari backup
4. Clear cache: `php artisan optimize:clear`
5. Rebuild: `php artisan config:cache && php artisan route:cache && php artisan view:cache`
6. Test

---

## Rollback Decision Matrix

| Scenario | Code Rollback | DB Rollback | Storage Rollback |
|----------|--------------|-------------|------------------|
| Bug in new feature | Yes | No | No |
| Migration failed | Yes | Yes | No |
| Data corruption | Yes | Yes (from backup) | Yes |
| Performance issue | Yes | No | No |
| Security vulnerability | Yes | Depends | Depends |

---

## Post-Rollback

1. Fix root cause di staging
2. Test thoroughly
3. Re-deploy with fix
4. Update incident documentation
5. Implement prevention measures
