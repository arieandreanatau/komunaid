# KomunaID V2 — Local Deployment Guide

> Panduan lengkap menjalankan KomunaID di local environment (XAMPP + Windows).

---

## Prasyarat

| Software | Versi Minimum | Download |
|----------|---------------|----------|
| XAMPP | 8.2+ | https://www.apachefriends.org |
| PHP | 8.2+ | included in XAMPP |
| Composer | 2.x | https://getcomposer.org |
| Node.js | 18+ | https://nodejs.org |
| NPM | 9+ | included with Node.js |
| MySQL | 8.0+ | included in XAMPP |
| Git | 2.x (optional) | https://git-scm.com |

### Cek Versi

```bash
php -v
composer -V
node -v
npm -v
git --version
```

---

## Step-by-Step

### 1. Start XAMPP

1. Buka XAMPP Control Panel
2. Start **Apache**
3. Start **MySQL**
4. Pastikan keduanya status Running (hijau)

### 2. Clone / Copy Project

```bash
cd C:\xampp\htdocs
# Jika via git:
git clone <repository-url> komunaid

# Atau copy project ke C:\xampp\htdocs\komunaid
```

### 3. Copy .env

```bash
cd C:\xampp\htdocs\komunaid
copy .env.example .env
```

Edit `.env` sesuai local config:

```env
APP_NAME=KomunaID
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=komunaid
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Install Dependency

```bash
# PHP dependencies
composer install

# JavaScript dependencies
npm install
```

### 5. Generate Key

```bash
php artisan key:generate
```

### 6. Setup Database

Buka phpMyAdmin: `http://127.0.0.1/phpmyadmin`

Buat database `komunaid` dengan collation `utf8mb4_unicode_ci`.

### 7. Migration

```bash
# Fresh migration + seed untuk first-time setup
php artisan migrate:fresh --seed

# Atau hanya jalankan migration (jika DB sudah ada)
php artisan migrate
```

### 8. Storage Link

```bash
php artisan storage:link
```

### 9. Build Asset

```bash
# Untuk production-like
npm run build

# Atau untuk development (hot reload)
npm run dev
```

### 10. Clear Cache

```bash
php artisan optimize:clear
```

### 11. Jalankan Server

**Option A — Artisan Serve:**
```bash
php artisan serve
# Buka: http://127.0.0.1:8000
```

**Option B — XAMPP Apache:**
- Akses: `http://localhost/komunaid/public`

**Option C — Dev Mode (dengan hot reload):**
```bash
# Terminal 1:
npm run dev

# Terminal 2:
php artisan serve
```

---

## Demo Users (Local Only)

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `superadmin@komuna.id` | `password` |
| Member | `member@komuna.id` | `password` |
| Community Owner | `community@komuna.id` | `password` |
| Brand Owner | `brand@komuna.id` | `password` |

> **Warning:** User demo ini HANYA untuk local development. Jangan gunakan di production.

---

## Troubleshooting

### APP_KEY missing

```bash
php artisan key:generate
```

### DB Connection Refused

1. Pastikan MySQL running di XAMPP
2. Cek `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` di `.env`
3. Pastikan database `komunaid` sudah dibuat

### Permission storage

```bash
# Windows: set Full Control pada folder storage/
# Linux/Mac:
sudo chmod -R 775 storage bootstrap/cache
```

### Vite manifest not found

```bash
npm run build
```

### Route cache issue

```bash
php artisan optimize:clear
```

### Storage image not found

```bash
php artisan storage:link
```

### Composer autoload issue

```bash
composer dump-autoload
php artisan optimize:clear
```
