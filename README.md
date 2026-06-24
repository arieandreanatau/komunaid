# KomunaID

**Connect. Collaborate. Community.**

Platform komunitas digital yang menghubungkan komunitas, brand, dan member dalam satu ekosistem.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 11, PHP 8.2+ |
| Frontend | Blade, Vite, Tailwind CSS |
| Database | MySQL 8.0 |
| Auth | Laravel Breeze |
| Permission | Spatie Laravel Permission |
| API | Laravel Sanctum |

---

## Quick Start

### Prasyarat

- XAMPP 8.2+ (Apache + MySQL)
- Composer 2.x
- Node.js 18+
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/komunaid/komunaid.git
cd komunaid

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database (pastikan MySQL sudah jalan di XAMPP)
php artisan migrate:fresh --seed

# Buat storage link
php artisan storage:link
```

### Jalankan

Buka 2 terminal:

```bash
# Terminal 1
npm run dev

# Terminal 2
php artisan serve
```

Buka browser: **http://127.0.0.1:8000**

---

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Superadmin | `superadmin@komuna.id` | `password` |
| Member | `member@komuna.id` | `password` |
| Community Owner | `community@komuna.id` | `password` |
| Brand Owner | `brand@komuna.id` | `password` |

---

## Project Structure

```
komunaid/
├── app/
│   ├── Http/Controllers/
│   ├── Models/
│   └── Services/
├── database/
│   ├── migrations/
│   └── seeders/
├── docs/
│   ├── 01-requirements/
│   ├── 02-system-design/
│   ├── 03-database/
│   ├── 04-testing/
│   └── 05-deployment/
├── public/
├── resources/views/
├── routes/
├── storage/
├── .env.example
├── artisan
├── composer.json
└── package.json
```

---

## Documentation

| Dokumen | Deskripsi |
|---------|-----------|
| [Runbook](docs/05-deployment/Runbook.md) | Panduan deployment & production |
| [Troubleshooting](docs/05-deployment/Troubleshooting.md) | Mengatasi masalah umum |
| [Project Overview](docs/00-project-overview.md) | Ringkasan project |
| [Product Overview](docs/01-product-overview.md) | Detail produk |
| [Requirements](docs/01-requirements.md) | Functional & non-functional requirements |
| [Database Design](docs/02-database-design.md) | Schema & relationships |
| [Modules](docs/03-modules.md) | Module breakdown |
| [Architecture](docs/04-architecture.md) | System architecture |
| [Development Phases](docs/05-development-phases.md) | Timeline development |
| [Roles & Permissions](docs/06-roles-permissions.md) | Roles & permissions setup |
| [API Endpoints](docs/07-api-endpoints.md) | Semua route endpoints |
| [UI/UX Design](docs/08-ui-ux-design.md) | Wireframe & design system |
| [Seed Data](docs/10-seed-data.md) | Data seed plan |

---

## Common Commands

```bash
# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed

# Cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan optimize:clear

# Route
php artisan route:list

# Assets
npm run dev
npm run build
```

---

## Deployment

Lihat [Runbook](docs/05-deployment/Runbook.md) untuk panduan lengkap deployment ke production.

---

## License

MIT License

---

> **Maintained by:** KomunaID Team
