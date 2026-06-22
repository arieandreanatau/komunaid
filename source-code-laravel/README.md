# KomunaID

Platform untuk menghubungkan komunitas, brand, dan member dalam satu ekosistem terintegrasi.

## Tech Stack

- **Backend:** Laravel 12
- **Frontend:** Laravel Blade + Tailwind CSS
- **Database:** MySQL (XAMPP)
- **Auth:** Laravel Breeze
- **Role Permission:** Spatie Laravel Permission

## Requirements

- PHP 8.2+
- Composer
- XAMPP (Apache + MySQL)
- Node.js & NPM

## Installation

### 1. Start XAMPP
Buka XAMPP Control Panel, start **Apache** dan **MySQL**.

### 2. Create Database
Buka phpMyAdmin (`http://localhost/phpmyadmin`), buat database baru bernama `komunaid`.

### 3. Setup Project
```bash
cd C:\xampp\htdocs\komunaid\source-code-laravel
```

### 4. Install Dependencies
```bash
composer install
npm install
npm run build
```

### 5. Configure Environment
Copy file `.env.example` ke `.env` (sudah ada), lalu edit:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=komunaid
DB_USERNAME=root
DB_PASSWORD=
```

### 6. Generate Key
```bash
php artisan key:generate
```

### 7. Run Migration & Seed
```bash
php artisan migrate:fresh --seed
```

### 8. Create Storage Link
```bash
php artisan storage:link
```

### 9. Start Development Server
```bash
php artisan serve
```

Aplikasi bisa diakses di `http://localhost:8000`.

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Superadmin | admin@komunaid.com | password |
| Community Owner | budi@komunaid.com | password |
| Community Owner | rina@komunaid.com | password |
| Brand Owner | ahmad@komunaid.com | password |
| Brand Owner | sari@komunaid.com | password |
| Member | andi@komunaid.com | password |
| Member | dewi@komunaid.com | password |
| Member | fajar@komunaid.com | password |

## Project Structure

```
komunaid/
├── docs/                          # SDLC Documentation
│   ├── README.md
│   ├── 00-project-overview.md
│   ├── 01-requirements.md
│   ├── 02-database-design.md
│   ├── 03-modules.md
│   ├── 04-architecture.md
│   ├── 05-development-phases.md
│   ├── 06-roles-permissions.md
│   ├── 07-api-endpoints.md
│   ├── 08-ui-ux-design.md
│   ├── 09-module-checklist.md
│   └── 10-seed-data.md
└── source-code-laravel/           # Laravel Source Code
    ├── app/
    │   ├── Http/Controllers/
    │   │   ├── Superadmin/        # 7 controllers
    │   │   ├── CommunityOwner/    # 7 controllers
    │   │   ├── BrandOwner/        # 5 controllers
    │   │   └── Member/            # 6 controllers
    │   ├── Models/                # 15 models
    │   └── Http/Middleware/       # CheckRole middleware
    ├── database/
    │   ├── migrations/            # 20 migration files
    │   └── seeders/               # 5 seeder files
    ├── resources/views/
    │   ├── layouts/               # app.blade.php, auth.blade.php
    │   ├── landing/               # Public pages
    │   ├── superadmin/            # SA dashboard & management
    │   ├── community-owner/       # CO dashboard & management
    │   ├── brand-owner/           # BO dashboard & management
    │   └── member/                # Member features
    └── routes/web.php             # All routes
```

## Features

### Public (No Login)
- Landing page
- Community listing & search
- Community detail

### Authentication
- Register / Login / Logout
- Default role: member
- Role-based dashboard redirect

### Superadmin
- Dashboard with stats
- Approval center (communities, brands, events, role requests)
- Member management
- Community management
- Brand management
- Event management
- Role request management

### Community Owner
- Dashboard
- Create/edit/delete communities
- Manage members (approve/reject/remove)
- Create/edit/delete events
- Post announcements & discussions
- Simple chat
- Manage collaborations

### Brand Owner
- Dashboard
- Create/edit brand profiles
- Browse communities
- Create/manage campaigns
- Submit collaboration proposals

### Member
- Dashboard
- Edit profile
- Join/leave communities
- Register for events
- Wallet (top up, transaction history)
- Request role (community owner / brand owner)

## Color Palette

| Color | Hex |
|-------|-----|
| Navy | #09318E |
| Blue | #0D7AFC |
| Sky Blue | #29B8FD |
| Soft Background | #E9F2FA |
| White | #FFFFFF |

## License

MIT
