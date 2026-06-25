# KomunaID V2 — Log Monitoring Guide

> Panduan monitoring log dan troubleshooting error umum.

---

## Log Location

| Log | Path |
|-----|------|
| Application log | `storage/logs/laravel.log` |
| Queue worker log | `storage/logs/worker.log` (if configured) |
| Web server log | `/var/log/nginx/access.log` (VPS) |
| Web server error | `/var/log/nginx/error.log` (VPS) |
| PHP-FPM log | `/var/log/php8.2-fpm.log` (VPS) |
| MySQL error | `/var/log/mysql/error.log` (VPS) |

---

## Log Commands

```bash
# View last 100 lines
tail -100 storage/logs/laravel.log

# Follow log in real-time
tail -f storage/logs/laravel.log

# Search for errors
grep "ERROR" storage/logs/laravel.log

# Search for specific error
grep "SQLSTATE" storage/logs/laravel.log

# Count errors
grep -c "local.ERROR" storage/logs/laravel.log

# Clear log (if too large)
echo "" > storage/logs/laravel.log
```

---

## Common Errors & Troubleshooting

### 1. Error 500 (Internal Server Error)

**Possible causes:**
- APP_KEY missing
- .env configuration error
- PHP error (syntax, missing class)
- Database connection failed

**Check:**
```bash
tail -50 storage/logs/laravel.log
php artisan about
```

**Fix:**
```bash
php artisan key:generate
php artisan config:clear
php artisan config:cache
```

### 2. Database Connection Error

**Log pattern:**
```
SQLSTATE[HY000] [2002] Connection refused
SQLSTATE[HY000] [1045] Access denied
```

**Fix:**
```bash
# Check MySQL running
sudo systemctl status mysql

# Check .env config
php artisan tinker --execute="echo config('database.connections.mysql');"

# Clear config cache
php artisan config:clear
php artisan config:cache
```

### 3. Permission Denied

**Log pattern:**
```
failed to open stream: Permission denied
```

**Fix:**
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 4. View Not Found

**Log pattern:**
```
View [xxx] not found
```

**Fix:**
```bash
php artisan view:clear
php artisan view:cache
# Check view file exists
```

### 5. Route Not Defined

**Log pattern:**
```
Route [xxx] not defined
```

**Fix:**
```bash
php artisan route:clear
php artisan route:cache
php artisan route:list | findstr "route_name"
```

### 6. Vite Manifest Not Found

**Log pattern:**
```
Vite manifest not found
```

**Fix:**
```bash
npm run build
# Check public/build/manifest.json exists
```

### 7. Session/Cache Issue

**Log pattern:**
```
Session store not set on request
```

**Fix:**
```bash
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```

### 8. Queue Job Failed

**Log pattern:**
```
App\Jobs\xxx has failed
```

**Check:**
```bash
# View failed jobs table
php artisan tinker --execute="echo App\Models\FailedJob::latest()->get();"

# Retry failed job
php artisan queue:retry all
```

### 9. Mail Error

**Log pattern:**
```
Connection could not be established with host
```

**Fix:**
```bash
# Check mail config
php artisan about | findstr "Mail"

# In production, ensure MAIL_MAILER is not "log"
```

### 10. Migration Error

**Log pattern:**
```
Migration table not found
SQLSTATE[42S02]: Base table or view not found
```

**Fix:**
```bash
php artisan migrate --force
```

---

## Log Levels

| Level | When to Use |
|-------|-------------|
| debug | Local development only |
| info | General information |
| notice | Normal but significant |
| warning | Warning conditions |
| error | Error conditions |
| critical | Critical conditions |
| alert | Immediate action needed |
| emergency | System unusable |

**Production recommended:** `LOG_LEVEL=error`

---

## Escalation

| Severity | Response Time | Action |
|----------|---------------|--------|
| Emergency | Immediate | Rollback, notify team |
| Critical | < 1 hour | Fix or rollback |
| Warning | < 24 hours | Monitor, plan fix |
| Info | Next sprint | Log for review |

---

## Log Rotation

Production server should configure log rotation:

```bash
# /etc/logrotate.d/komunaid
/var/www/komunaid/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

Or use Laravel's built-in log rotation by adding to `.env`:

```env
LOG_DAILY_DAYS=14
```
