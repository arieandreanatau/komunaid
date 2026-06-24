# KomunaID - Deployment Runbook

> Panduan lengkap untuk menjalankan dan mendeploy KomunaID.

---

## Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Local Run dengan XAMPP](#2-local-run-dengan-xampp)
3. [Database Setup](#3-database-setup)
4. [Akun Demo](#4-akun-demo)
5. [Common Commands](#5-common-commands)
6. [Future Production Deployment](#6-future-production-deployment)

---

## 1. Prasyarat

Sebelum memulai, pastikan sudah terinstall:

| Software | Versi Minimum | Download |
|----------|---------------|----------|
| XAMPP | 8.2+ | https://www.apachefriends.org |
| PHP | 8.2+ | ( included in XAMPP ) |
| Composer | 2.x | https://getcomposer.org |
| Node.js | 18+ | https://nodejs.org |
| Git | 2.x | https://git-scm.com |

### Cek Versi

```bash
php -v
composer -V
node -v
npm -v
git --version
```

---

## 2. Local Run dengan XAMPP

### Langkah 1: Start Apache dan MySQL

1. Buka **XAMPP Control Panel**
2. Klik **Start** pada **Apache**
3. Klik **Start** pada **MySQL**
4. Pastikan kedua service berstatus **Running** (hijau)

> **Tips:** Jika port 80 sudah dipakai, klik **Config** > **Apache (httpd.conf)** > ubah `Listen 80` menjadi `Listen 8080`

### Langkah 2: Buka Terminal di Folder Source Code

```bash
cd C:\xampp\htdocs\komunaid
```

### Langkah 3: Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### Langkah 4: Setup Environment

```bash
# Copy file environment
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Langkah 5: Setup Database

```bash
# Jalankan migration dan seeder
php artisan migrate:fresh --seed
```

### Langkah 6: Buat Storage Link

```bash
php artisan storage:link
```

### Langkah 7: Jalankan Development Server

Buka **2 terminal** secara terpisah:

**Terminal 1 - Vite Dev Server:**
```bash
npm run dev
```

**Terminal 2 - Laravel Artisan Server:**
```bash
php artisan serve
```

### Langkah 8: Buka Browser

```
http://127.0.0.1:8000
```

---

## 3. Database Setup

### Konfigurasi Database

| Parameter | Value |
|-----------|-------|
| Nama Database | `komunaid_db` |
| DB Host | `127.0.0.1` atau `localhost` |
| DB Port | `3306` |
| DB Username | `root` |
| DB Password | _(kosong untuk XAMPP default)_ |
| Collation | `utf8mb4_unicode_ci` |

### Buat Database

**Via phpMyAdmin:**
1. Buka `http://127.0.0.1/phpmyadmin`
2. Klik tab **Databases**
3. Masukkan nama database: `komunaid_db`
4. Pilih Collation: `utf8mb4_unicode_ci`
5. Klik **Create**

**Via SQL:**
```sql
CREATE DATABASE komunaid_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Update File .env

Buka file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=komunaid_db
DB_USERNAME=root
DB_PASSWORD=
```

### Jalankan Migration

```bash
# Buat semua tabel dari awal
php artisan migrate:fresh --seed

# Atau hanya jalankan migration tanpa seed
php artisan migrate
```

---

## 4. Akun Demo

Setelah menjalankan `php artisan migrate:fresh --seed`, akun berikut sudah tersedia:

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `superadmin@komuna.id` | `password` |
| Member | `member@komuna.id` | `password` |
| Community Owner | `community@komuna.id` | `password` |
| Brand Owner | `brand@komuna.id` | `password` |

### Cara Login

1. Buka `http://127.0.0.1:8000`
2. Klik menu **Login**
3. Masukkan email dan password dari tabel di atas
4. Klik **Login**

---

## 5. Common Commands

### Database

```bash
# Jalankan semua migration
php artisan migrate

# Reset database dan jalankan seeder
php artisan migrate:fresh --seed

# Jalankan seeder saja (tanpa reset)
php artisan db:seed

# Rollback migration (kembalikan 1 langkah)
php artisan migrate:rollback

# Rollback semua migration
php artisan migrate:reset
```

### Cache & Config

```bash
# Bersihkan semua cache
php artisan cache:clear

# Bersihkan config cache
php artisan config:clear

# Bersihkan view cache
php artisan view:clear

# Bersihkan route cache
php artisan route:clear

# Rebuild semua cache
php artisan optimize:clear
```

### Assets

```bash
# Jalankan Vite dev server
npm run dev

# Build untuk production
npm run build
```

### Route & Debug

```bash
# Lihat semua route
php artisan route:list

# Lihat semua route (detail)
php artisan route:list -v

# Lihat semua route tertentu
php artisan route:list --name=community

# Buat storage link (untuk upload file)
php artisan storage:link
```

### Generators

```bash
# Buat controller baru
php artisan make:controller NamaController

# Buat model baru
php artisan make:model NamaModel -m

# Buat migration baru
php artisan make:migration create_nama_table

# Buat seeder baru
php artisan make:seeder NamaSeeder

# Buat request validation
php artisan make:form-request NamaRequest

# Buat event
php artisan make:event NamaEvent

# Buat listener
php artisan make:listener NamaListener
```

---

## 6. Future Production Deployment

> Bagian ini menjelaskan langkah-langkah untuk deployment ke production server.

### 6.1 Pilih VPS Provider

Rekomendasi VPS untuk deployment:

| Provider | Spesifikasi Minimum | Harga Mulai |
|----------|-------------------|-------------|
| DigitalOcean | 1 vCPU, 1GB RAM | $5/bulan |
| Vultr | 1 vCPU, 1GB RAM | $5/bulan |
| Hetzner | 1 vCPU, 2GB RAM | €4/bulan |
| AWS EC2 | t3.micro | Free tier |

### 6.2 Setup Domain

1. **Beli domain** di registrar (Namecheap, Cloudflare, dll)
2. **Point DNS** ke IP VPS:
   ```
   Type: A Record
   Name: @
   Value: [IP Address VPS]
   TTL: Auto
   ```
3. **Tambahkan subdomain** untuk staging jika diperlukan:
   ```
   Type: A Record
   Name: staging
   Value: [IP Address VPS]
   TTL: Auto
   ```

### 6.3 Setup SSL (HTTPS)

**Menggunakan Let's Encrypt (gratis):**

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Dapatkan SSL certificate
sudo certbot --nginx -d komunaid.com -d www.komunaid.com

# Auto-renewal (sudah otomatis via cron)
sudo certbot renew --dry-run
```

**Menggunakan Cloudflare SSL:**
1. Daftar domain di Cloudflare
2. Ubah nameserver domain ke Cloudflare
3. Aktifkan **Full (Strict)** SSL mode di dashboard Cloudflare

### 6.4 MySQL Production

```bash
# Install MySQL
sudo apt install mysql-server

# Secure installation
sudo mysql_secure_installation

# Buat database dan user
mysql -u root -p
```

```sql
CREATE DATABASE komunaid_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'komunaid_user'@'localhost' IDENTIFIED BY 'password_yang_sangat_kuat';
GRANT ALL PRIVILEGES ON komunaid_db.* TO 'komunaid_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 6.5 Queue Worker

Laravel queue untuk memproses job async (email, notifikasi, dll):

```bash
# Install supervisor (Ubuntu)
sudo apt install supervisor

# Buat config supervisor
sudo nano /etc/supervisor/conf.d/komunaid-worker.conf
```

```ini
[program:komunaid-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/komunaid/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/komunaid/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start komunaid-worker:*
```

### 6.6 Scheduler (Cron Job)

```bash
# Edit crontab
sudo crontab -e
```

Tambahkan baris berikut:

```cron
* * * * * cd /var/www/komunaid && php artisan schedule:run >> /dev/null 2>&1
```

### 6.7 Backup

```bash
# Buat script backup
sudo nano /usr/local/bin/komunaid-backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/komunaid"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

# Backup database
mysqldump -u komunaid_user -p'password' komunaid_db > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/komunaid/storage

# Hapus backup lama
find $BACKUP_DIR -type f -mtime +$KEEP_DAYS -delete

echo "Backup completed: $DATE"
```

```bash
# Buat executable
sudo chmod +x /usr/local/bin/komunaid-backup.sh

# Jadwalkan backup harian (jam 2 pagi)
sudo crontab -e
```

```cron
0 2 * * * /usr/local/bin/komunaid-backup.sh >> /var/log/komunaid-backup.log 2>&1
```

### 6.8 Monitoring

**Monitoring Aplikasi:**
- **Laravel Telescope** - Debugging dan monitoring
- **Uptime Robot** - Monitor uptime server
- **Grafana + Prometheus** - Monitoring performa

**Install Laravel Telescope (opsional):**

```bash
composer require laravel/telescope
php artisan telescope:install
php artisan migrate
```

**Log Monitoring:**

```bash
# Lihat error log
tail -f /var/www/komunaid/storage/logs/laravel.log

# Cari error
grep "ERROR" /var/www/komunaid/storage/logs/laravel.log
```

### 6.9 CI/CD dengan GitHub Actions

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy KomunaID

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: komunaid_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, xml, ctype, json, bcmath, pdo, pdo_mysql
          coverage: none

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install Dependencies
        run: composer install --no-progress --prefer-dist

      - name: Install NPM Dependencies
        run: npm ci

      - name: Build Assets
        run: npm run build

      - name: Copy Environment File
        run: cp .env.example .env

      - name: Generate Application Key
        run: php artisan key:generate

      - name: Run Tests
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: komunaid_test
          DB_USERNAME: root
          DB_PASSWORD: password
        run: php artisan test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/komunaid
            git pull origin main
            composer install --no-dev --optimize-autoloader
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan event:cache
            sudo systemctl restart php-fpm
            sudo systemctl restart nginx
```

**Setup GitHub Secrets:**

| Secret Name | Value |
|-------------|-------|
| `SERVER_HOST` | IP address VPS |
| `SERVER_USER` | Username SSH (e.g., `root` atau `ubuntu`) |
| `SSH_PRIVATE_KEY` | Private key SSH |

### 6.10 Deploy ke Production

**Tahapan Deployment:**

```bash
# 1. SSH ke server
ssh user@your-server-ip

# 2. Clone repository
git clone https://github.com/username/komunaid.git /var/www/komunaid

# 3. Masuk ke directory
cd /var/www/komunaid

# 4. Install dependencies
composer install --no-dev --optimize-autoloader
npm ci && npm run build

# 5. Setup environment
cp .env.example .env
php artisan key:generate

# 6. Edit .env (isi konfigurasi production)
nano .env

# 7. Jalankan migration
php artisan migrate --force

# 8. Jalankan seeder (jika diperlukan)
php artisan db:seed --force

# 9. Setup storage link
php artisan storage:link

# 10. Set permissions
sudo chown -R www-data:www-data /var/www/komunaid
sudo chmod -R 755 /var/www/komunaid/storage
sudo chmod -R 755 /var/www/komunaid/bootstrap/cache

# 11. Cache optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 12. Setup web server (Nginx)
sudo nano /etc/nginx/sites-available/komunaid
```

**Konfigurasi Nginx:**

```nginx
server {
    listen 80;
    server_name komunaid.com www.komunaid.com;
    root /var/www/komunaid/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

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

```bash
# Aktifkan site
sudo ln -s /etc/nginx/sites-available/komunaid /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Checklist Deployment

- [ ] VPS sudah aktif dan SSH bisa diakses
- [ ] Domain sudah di-point ke IP server
- [ ] SSL certificate sudah terinstall
- [ ] MySQL sudah terinstall dan database sudah dibuat
- [ ] PHP 8.2+ sudah terinstall beserta extensions
- [ ] Composer dan NPM sudah terinstall
- [ ] Repository sudah di-clone ke server
- [ ] File `.env` sudah dikonfigurasi
- [ ] Migration sudah dijalankan
- [ ] Seeder sudah dijalankan (jika diperlukan)
- [ ] Storage link sudah dibuat
- [ ] File permissions sudah di-set
- [ ] Nginx/Apache sudah dikonfigurasi
- [ ] Queue worker sudah berjalan
- [ ] Scheduler (cron) sudah di-set
- [ ] Backup script sudah di-setup
- [ ] Monitoring sudah aktif
- [ ] CI/CD pipeline sudah dikonfigurasi

---

> **Dokumentasi ini terakhir diperbarui:** Juni 2026
