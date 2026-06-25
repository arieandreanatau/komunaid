# KomunaID V2 — Backup Strategy

> Strategi backup untuk local, staging, dan production.

---

## 1. Database Backup

### Manual Backup

```bash
mysqldump -u USER -p DATABASE_NAME > backup_komunaid_$(date +%Y%m%d_%H%M%S).sql
```

### Automated Backup (Production)

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/komunaid"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u DB_USER -p'DB_PASSWORD' DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Remove old backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "[$(date)] Database backup completed: db_$DATE.sql.gz"
```

### Cron Schedule

```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/komunaid-backup.sh >> /var/log/komunaid-backup.log 2>&1
```

---

## 2. Storage Backup

### What to Backup

| Path | Content | Priority |
|------|---------|----------|
| `storage/app/public/` | Public uploads (avatars, logos, banners) | High |
| `storage/app/documentation/` | Generated documentation | Medium |
| `.env` | Environment config (PRIVATE) | Critical |

### Backup Command

```bash
# Public uploads
tar -czf storage_public_$(date +%Y%m%d).tar.gz storage/app/public/

# All storage (excluding cache)
tar -czf storage_full_$(date +%Y%m%d).tar.gz --exclude='storage/framework' --exclude='storage/logs' storage/
```

---

## 3. Code Backup

### Git Tags

```bash
# Before deployment
git tag -a v2.0.0-pre -m "Pre-deployment tag"
git push origin v2.0.0-pre

# After successful deployment
git tag -a v2.0.0 -m "Production release v2.0.0"
git push origin v2.0.0
```

### Full Backup

```bash
tar -czf komunaid_code_$(date +%Y%m%d).tar.gz --exclude='node_modules' --exclude='vendor' --exclude='.env' .
```

---

## 4. .env Backup

```bash
# Simpan di lokasi AMAN (tidak di public_html)
cp .env /secure/backup/location/.env.backup.$(date +%Y%m%d)
```

> **WARNING:** .env berisi credential. Jangan simpan di lokasi public.

---

## 5. Backup Frequency

| Item | Frequency | Retention |
|------|-----------|-----------|
| Database | Daily | 30 days |
| Storage uploads | Weekly | 60 days |
| Code (git tag) | Every deploy | Permanent |
| .env | Before each deploy | 10 versions |

---

## 6. Backup Location

| Environment | Location |
|-------------|----------|
| Local | `C:\xampp\mysql\data\komunaid\` (XAMPP data) |
| Staging | `/var/backups/komunaid-staging/` |
| Production | `/var/backups/komunaid/` |

> **Rule:** Backup tidak disimpan di `public_html`. Backup memiliki permission terbatas (600 untuk files, 700 for directories).

---

## 7. Restore Testing

### Test di Staging

```bash
# Restore database
mysql -u USER -p DATABASE_NAME < backup_komunaid_YYYYMMDD.sql

# Restore storage
tar -xzf storage_public_YYYYMMDD.tar.gz -C /var/www/komunaid-staging/
```

### Verify

```bash
php artisan migrate:status
php artisan tinker --execute="echo App\Models\User::count() . ' users';"
```

---

## 8. Backup Checklist

- [ ] Database backup sebelum deploy
- [ ] Storage backup sebelum deploy major
- [ ] Code backup via git tag
- [ ] .env backup di lokasi aman
- [ ] Backup retention policy aktif
- [ ] Restore test di staging
- [ ] Backup permission aman
