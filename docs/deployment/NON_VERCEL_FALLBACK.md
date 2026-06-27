# KomunaID Non-Vercel Deployment Fallback

This document describes the steps to deploy KomunaID to a traditional PHP host (VPS, cPanel, or Laravel-managed host) when Vercel becomes impractical.

## Recommended Targets (in order of preference)

### 1. Laravel Forge (https://forge.laravel.com)

- Provisions Ubuntu servers on DigitalOcean, AWS, Linode, Vultr.
- One-click PHP 8.2 + Nginx + MySQL + Redis stack.
- Built-in deploy script, queue worker supervisor, scheduler cron.
- SSL via Let's Encrypt automatic.
- Recommended for teams that want full control without sysadmin work.

**Forge deploy script:**

```bash
cd /home/forge/komunaid.komuna.id
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```

Add the scheduler cron in Forge: `* * * * * cd /home/forge/komunaid.komuna.id && php artisan schedule:run >> /dev/null 2>&1`

Add a queue worker via Forge's "Queue" tab: `php artisan queue:work --sleep=1 --tries=3 --max-time=3600`

### 2. Ploi (https://ploi.io)

- Similar to Forge. Supports Laravel out of the box.
- One-click deploy from GitHub, automatic queue + scheduler.
- Server management UI.

### 3. RunCloud (https://runcloud.io)

- Panel-based, supports multiple PHP versions.
- Good for cPanel-style server administration.

### 4. Cloudways (https://cloudways.com)

- Managed hosting on top of DigitalOcean/AWS/GCP.
- Built-in Laravel installer.
- Higher cost but zero sysadmin work.

### 5. cPanel / Shared Hosting

- Works but limited. PHP 8.2 + MySQL required.
- Cron via cPanel: `* * * * * /usr/bin/php /home/<user>/public_html/artisan schedule:run`
- No queue worker — use `QUEUE_CONNECTION=sync` and accept that long jobs block the request.
- Upload storage: use the same `local` disk (no S3 needed unless traffic is high).

## Migration Checklist

When moving from Vercel to a VPS:

1. Provision a server (Ubuntu 22.04 LTS, 2GB RAM minimum).
2. Install PHP 8.2, Composer 2, Node 20, Nginx, MySQL 8 / MariaDB 10.4+, Redis 6+.
3. Clone the repo: `git clone https://github.com/<org>/komunaid.git /var/www/komunaid`.
4. Set up `.env` with production values. **Do not commit `.env`**.
5. Run the deploy script above.
6. Configure Nginx to serve `public/` as the root.
7. Configure systemd to keep `queue:work` alive (Forge/Ploi do this automatically).
8. Set up SSL via Let's Encrypt.
9. Configure backups: MySQL daily, `storage/app/public` (if used) daily, S3 (if used) is durable.
10. Test with `php artisan test` then run smoke tests.

## Nginx Server Block (example)

```nginx
server {
    listen 80;
    server_name komunaid.komuna.id;
    root /var/www/komunaid/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## Database Migration

1. On the source (Vercel) database: `mysqldump --routines komunaid > dump.sql`.
2. On the new server: `mysql komunaid < dump.sql`.
3. Update `.env` with new DB credentials.
4. Run `php artisan migrate --force` to apply any pending migrations.

## DNS Cutover

1. Lower TTL 24 hours before the cutover.
2. Update the A / CNAME record on the new host.
3. Monitor `php artisan log:tail` for 500s.

## Cost Comparison (rough, monthly, USD)

| Target | Cost | Maintenance |
|---|---|---|
| Vercel Pro | $20 + external DB/Redis/S3 | Low (managed) |
| Forge + DO 2GB | $12 + DO | Low (provisioned) |
| Ploi + DO 2GB | $12 + DO | Low |
| Cloudways 2GB | $30+ | Lowest |
| cPanel shared | $5–10 | None, limited |
| Raw VPS (manual) | $6–12 | High |

## Recommendation

For KomunaID's traffic profile (Indonesia + SEA, growing), the right balance is **Forge on a 4GB DigitalOcean droplet** with managed MySQL (DigitalOcean Managed Database) and Upstash Redis. Total cost ~$60/month. Queue worker + scheduler + daily backups all included by default.

Vercel is fine for the first 1k users. After that, move to Forge.
