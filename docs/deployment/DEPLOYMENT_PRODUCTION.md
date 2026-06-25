# KomunaID V2 — Production Deployment Guide

> Panduan deployment ke production server.

---

## WARNING

- **JANGAN** jalankan `migrate:fresh` di production
- **JANGAN** jalankan `db:seed` dummy di production
- **JANGAN** set `APP_DEBUG=true` di production
- **JANGAN** tulis credential di dokumentasi publik
- **JANGAN** commit `.env` ke repository

---

## Pre-Deployment Checklist

| # | Item | Confirmed |
|---|------|-----------|
| 1 | Backup database production | [ ] |
| 2 | Backup storage/public uploads | [ ] |
| 3 | Backup current code (git tag) | [ ] |
| 4 | Maintenance window confirmed | [ ] |
| 5 | APP_ENV=production confirmed | [ ] |
| 6 | APP_DEBUG=false confirmed | [ ] |
| 7 | Database credential production ready | [ ] |
| 8 | Domain/SSL configured | [ ] |
| 9 | Storage permissions correct | [ ] |
| 10 | Migration reviewed (no destructive) | [ ] |
| 11 | QA staging passed | [ ] |
| 12 | Smoke test staging passed | [ ] |

---

## Deployment Steps

### 1. Backup

```bash
# Database
mysqldump -u USER -p DATABASE_NAME > backup_komunaid_$(date +%Y%m%d).sql

# Storage
tar -czf storage_backup_$(date +%Y%m%d).tar.gz storage/app/public

# Code (git tag)
git tag -a v2.0.0-pre-deploy -m "Pre-deployment backup"
git push origin v2.0.0-pre-deploy
```

### 2. Upload / Pull Code

```bash
ssh user@production-server
cd /var/www/komunaid
git fetch origin
git checkout main
git pull origin main
```

### 3. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

### 4. Maintenance Mode

```bash
php artisan down
```

### 5. Migration

```bash
php artisan migrate --force
```

> **Destructive migration:** Jika ada drop column/table/rename, review manual dulu. Jangan langsung jalankan.

### 6. Storage Link

```bash
php artisan storage:link
```

### 7. Cache Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 8. File Permission

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 9. Queue Worker (jika diperlukan)

```bash
# Setup supervisor atau jalankan:
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

### 10. Scheduler (cron)

```bash
# crontab -e
* * * * * cd /var/www/komunaid && php artisan schedule:run >> /dev/null 2>&1
```

### 11. Bring App Up

```bash
php artisan up
```

### 12. Post-Deployment Smoke Test

Lihat [SMOKE_TEST_CHECKLIST.md](./SMOKE_TEST_CHECKLIST.md)

### 13. Monitor Logs

```bash
tail -f storage/logs/laravel.log
```

---

## Production .env Template

```env
APP_NAME=KomunaID
APP_ENV=production
APP_KEY=base64:GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-domain.com

APP_LOCALE=id
APP_FALLBACK_LOCALE=id
APP_FAKER_LOCALE=id_ID

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=komunaid_production
DB_USERNAME=komunaid_user
DB_PASSWORD=SECURE_PASSWORD_HERE

CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_DOMAIN=your-domain.com
SESSION_SECURE_COOKIE=true

FILESYSTEM_DISK=public
PUBLIC_DISK_DRIVER=local
PUBLIC_DISK_URL="${APP_URL}/storage"

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"
```

> **Security:** Ganti semua placeholder dengan credential asli. Jangan commit file ini.

---

## VPS Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/komunaid/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## Shared Hosting / cPanel Notes

1. Upload project di luar `public_html` jika memungkinkan
2. Arahkan document root ke folder `public/`
3. Jika tidak bisa ubah document root:
   - Pindahkan isi `public/` ke `public_html/` dengan hati-hati
   - Update path di `index.php`
4. Setup `.env` di root project
5. Setup database MySQL via cPanel
6. Composer install via SSH (atau upload `vendor/` jika tidak ada SSH)
7. NPM build dilakukan lokal, upload `public/build/`
8. `php artisan storage:link` via SSH atau symlink manual
9. `storage/` dan `bootstrap/cache/` harus writable
10. Set `APP_DEBUG=false`

---

## Rollback Plan

Lihat [ROLLBACK_STRATEGY.md](./ROLLBACK_STRATEGY.md)
