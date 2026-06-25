# KomunaID V2 — Staging Deployment Guide

> Panduan deployment ke staging/development server.

---

## Prasyarat

- Server/hosting dengan PHP 8.2+, MySQL 8.0+, Composer, Node.js
- SSH access (jika VPS)
- Database staging terpisah dari production

---

## Step-by-Step

### 1. Upload / Clone Code

```bash
# Via git
ssh user@staging-server
cd /var/www
git clone <repository-url> komunaid-staging
cd komunaid-staging
git checkout develop
```

### 2. Setup Database

```sql
CREATE DATABASE komunaid_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'komunaid_staging'@'localhost' IDENTIFIED BY 'STAGING_PASSWORD_PLACEHOLDER';
GRANT ALL PRIVILEGES ON komunaid_staging.* TO 'komunaid_staging'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Setup .env

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
APP_NAME=KomunaID
APP_ENV=staging
APP_KEY=base64:GENERATED_KEY_HERE
APP_DEBUG=true
APP_URL=https://staging.your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=komunaid_staging
DB_USERNAME=komunaid_staging
DB_PASSWORD=STAGING_PASSWORD_PLACEHOLDER

CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

FILESYSTEM_DISK=public
PUBLIC_DISK_DRIVER=local
PUBLIC_DISK_URL="${APP_URL}/storage"

MAIL_MAILER=log
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

> **Note:** APP_DEBUG=true di staging hanya jika staging bersifat private. Jika staging public, set APP_DEBUG=false.

### 4. Install Dependencies

```bash
# Jika staging perlu dev tools:
composer install

# Atau production-like:
composer install --no-dev --optimize-autoloader

npm install
npm run build
```

### 5. File Permission

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 6. Migration

```bash
php artisan migrate --force
```

### 7. Seeder

```bash
# Jalankan seeder safe saja
php artisan db:seed --force
```

> **Note:** Jangan seed dummy user di staging jika staging dekat dengan production.

### 8. Cache Optimization

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 9. Storage Link

```bash
php artisan storage:link
```

### 10. Queue Worker (jika diperlukan)

```bash
php artisan queue:work --sleep=3 --tries=3
```

### 11. Scheduler (cron)

```bash
# crontab -e
* * * * * cd /var/www/komunaid-staging && php artisan schedule:run >> /dev/null 2>&1
```

### 12. Smoke Test

Lihat [SMOKE_TEST_CHECKLIST.md](./SMOKE_TEST_CHECKLIST.md)

---

## Staging Notes

- Database staging harus terpisah dari production
- APP_DEBUG=true hanya jika staging private
- Jangan expose credential staging
- Gunakan SSL jika staging public
- Backup staging sebelum testing besar

---

## Rollback Staging

```bash
php artisan down
git checkout previous_branch_or_commit
composer install --no-dev --optimize-autoloader
npm run build
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
```
