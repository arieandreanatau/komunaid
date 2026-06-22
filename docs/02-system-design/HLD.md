# KomunaID — High Level Design (HLD)

## 1. Architecture Overview

KomunaID menggunakan arsitektur **Monolithic MVC** berbasis Laravel 11 dengan pendekatan server-rendered pages menggunakan Blade + Livewire.

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT                             │
│              Browser (Desktop / Mobile)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   WEB SERVER                             │
│              Apache (XAMPP / Nginx)                      │
│                   PHP 8.2+                               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                LARAVEL APPLICATION                       │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Routes   │→│Middleware │→│Controller │              │
│  └──────────┘  └──────────┘  └─────┬────┘              │
│                                     │                    │
│                    ┌────────────────┼───────────┐       │
│                    ▼                ▼           ▼       │
│              ┌──────────┐   ┌──────────┐ ┌────────┐   │
│              │ Services  │   │  Models   │ │ Views  │   │
│              │ (Logic)   │   │(Eloquent) │ │(Blade) │   │
│              └──────────┘   └─────┬────┘ └────────┘   │
│                                    │                    │
│                                    ▼                    │
│                           ┌──────────────┐             │
│                           │   Database    │             │
│                           │   MySQL 8     │             │
│                           └──────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | PHP | 8.2+ |
| Framework | Laravel | 11.x |
| Database | MySQL / MariaDB | 8.x / 10.x |
| Templating | Blade + Livewire | 3.x |
| CSS | Tailwind CSS | 3.x |
| JS | Alpine.js | 3.x |
| Auth | Laravel Breeze | Latest |
| Build Tool | Vite | 5.x |

---

## 2. Module Overview

```
KomunaID Modules
│
├── [MVP] Authentication & Authorization
│   ├── Registration (name, email, phone, password)
│   ├── Login / Logout
│   ├── Password Reset
│   └── Role-based Middleware
│
├── [MVP] User Management
│   ├── Profile Management (avatar, name, phone)
│   ├── Role Request (community_owner / brand_owner)
│   └── Account Settings
│
├── [MVP] Community Module
│   ├── Community CRUD (owner only)
│   ├── Community Directory (public browse & search)
│   ├── Member Management (join/leave/approve/reject)
│   └── Community Detail Page
│
├── [MVP] Brand Module
│   ├── Brand CRUD (owner only)
│   ├── Brand Directory (public browse & search)
│   └── Brand Detail Page
│
├── [MVP] Event Module
│   ├── Event CRUD (community owner only)
│   ├── Event RSVP (member)
│   └── Event Listing per Community
│
├── [MVP] Superadmin Dashboard
│   ├── User Management (list, activate/deactivate)
│   ├── Role Approval Queue
│   ├── Community & Brand Moderation
│   └── Basic Analytics
│
├── [Fase 2] Wallet & Payment
├── [Fase 2] Donation System
├── [Fase 2] Campaign Management
├── [Fase 2] Collaboration Hub
├── [Fase 3] Chat / Messaging
└── [Fase 3] Social Feed
```

---

## 3. User Role Overview

| Role | Code | Permission Scope |
|------|------|-----------------|
| **Guest** | `guest` | Browse public pages, landing page, community/brand directory |
| **Member** | `member` | Dashboard, profile, join community, RSVP events, request role upgrade |
| **Community Owner** | `community_owner` | All member permissions + CRUD communities, manage members, CRUD events |
| **Brand Owner** | `brand_owner` | All member permissions + CRUD brands |
| **Superadmin** | `superadmin` | Full platform access: user management, approve/reject roles, moderate all content |

### Role Hierarchy

```
Superadmin
    │
    ├── Community Owner
    │       └── Member
    │               └── Guest
    │
    └── Brand Owner
            └── Member
                    └── Guest
```

### Role Approval Flow

```
Member ──request──▶ [role_approvals] ──pending──▶ Superadmin
                                                     │
                                          ┌──────────┴──────────┐
                                          ▼                     ▼
                                       Approved              Rejected
                                     (role updated)       (notes added)
```

---

## 4. Data Flow (High Level)

### A. Registration & Role Upgrade

```
Guest ──register──▶ Member ──request role──▶ Pending Approval ──approved by SA──▶ Community Owner / Brand Owner
```

### B. Community Lifecycle

```
Community Owner ──create──▶ Community ──pending approval──▶ Superadmin approve ──▶ Published Community
                                                                              │
Member ──join request──▶ Pending Membership ──CO approve──▶ Active Member
Member ──leave──▶ Removed from Community
```

### C. Event Lifecycle

```
Community Owner ──create event──▶ Draft Event ──publish──▶ Published Event
                                                              │
Member ──RSVP──▶ Going / Maybe
```

### D. Brand Lifecycle

```
Brand Owner ──create──▶ Brand ──pending approval──▶ Superadmin approve ──▶ Published Brand
```

---

## 5. Deployment Overview (Local — XAMPP)

### Prerequisites

| Component | Version |
|-----------|---------|
| XAMPP | 8.2+ |
| PHP | 8.2+ |
| MySQL | 8.x (included in XAMPP) |
| Composer | 2.x |
| Node.js | 18+ |
| Git | Latest |

### Directory Structure (XAMPP)

```
C:\xampp\htdocs\KomunaID\
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
├── resources/
├── routes/
├── storage/
├── tests/
├── .env
├── composer.json
├── package.json
└── vite.config.js
```

### Setup Steps

```bash
# 1. Start Apache & MySQL via XAMPP Control Panel

# 2. Create database via phpMyAdmin
# URL: http://localhost/phpmyadmin
# Database name: komunaid

# 3. Clone/install project
cd C:\xampp\htdocs
git clone <repo-url> KomunaID
cd KomunaID

# 4. Install dependencies
composer install
npm install

# 5. Configure .env
cp .env.example .env
# Edit: DB_DATABASE=komunaid, DB_USERNAME=root, DB_PASSWORD=

# 6. Generate key
php artisan key:generate

# 7. Run migrations & seeders
php artisan migrate --seed

# 8. Build assets
npm run dev

# 9. Start dev server
php artisan serve
# Access: http://localhost:8000
```

### Access Points

| Service | URL |
|---------|-----|
| Application | http://localhost:8000 |
| phpMyAdmin | http://localhost/phpmyadmin |
| Vite Dev Server | http://localhost:5173 |

---

## 6. Security Overview

### Authentication

- Laravel Breeze (session-based authentication)
- CSRF protection on all forms
- Password hashing via bcrypt
- Email verification (optional for MVP)

### Authorization

- Role-based middleware (`RoleMiddleware`)
- Approval-based middleware (`ApprovalMiddleware`)
- Active status middleware (`ActiveMiddleware`)
- Policy-based authorization (community, brand, event ownership)

### Input Validation

- Form Request validation classes for all write operations
- Server-side validation on all endpoints
- Blade `{{ }}` auto-escaping (XSS prevention)
- Eloquent parameterized queries (SQL injection prevention)

### File Upload Security

- Whitelist allowed MIME types (images only)
- File size limits
- Randomized file names
- Storage outside public directory (or controlled access)

### Session & Cookie

- Laravel session management
- Session expiration
- Secure cookie flags (production)

---

## 7. Integration Overview

### MVP Integrations (Minimal)

| Integration | Purpose | Status |
|-------------|---------|--------|
| Local File Storage | Avatar, banner, logo upload | MVP |
| phpMyAdmin | Database management | Dev Tool |
| Tailwind CSS CDN/Build | Styling | MVP |

### Future Integrations (Fase 2+)

| Integration | Purpose | Phase |
|-------------|---------|-------|
| Payment Gateway (Midtrans/Xendit) | Event paid, donations | Fase 2 |
| Email Service (Mailgun/SendGrid) | Notifications, verification | Fase 2 |
| Cloud Storage (S3/Cloudflare R2) | File storage at scale | Fase 2 |
| Push Notification (Firebase) | Real-time notifications | Fase 3 |
| WhatsApp API | Notification via WA | Fase 3 |
| Elasticsearch | Advanced search | Fase 3 |
| WebSocket (Laravel Reverb) | Real-time features | Fase 3 |
| REST API | Mobile app integration | Fase 3 |

---

## 8. Future Scalability Plan

### Phase 2 Enhancements

- **Wallet System**: E-wallet untuk transaksi dalam platform
- **Donation System**: Donasi transparan ke komunitas/event
- **Campaign Management**: Brand membuat kampanye bersama komunitas
- **Collaboration Hub**: Platform kolaborasi brand × komunitas
- **Notification System**: Email + in-app notification
- **Payment Gateway**: Integrasi Midtrans/Xendit

### Phase 3 Enhancements

- **Chat/Messaging**: Real-time chat antar user dan komunitas
- **Social Feed**: Post, comment, like, share
- **Mobile App**: React Native / Flutter
- **Advanced Search**: Elasticsearch integration
- **Real-time Features**: WebSocket via Laravel Reverb
- **Gamification**: Badges, points, leaderboard
- **Multi-language**: i18n support

### Architectural Scaling

| Concern | Current (MVP) | Future |
|---------|---------------|--------|
| Architecture | Monolith | Modular Monolith → Microservices |
| Database | Single MySQL | Read Replicas + Redis Cache |
| Queue | Database driver | Redis / SQS |
| Storage | Local | S3 / Cloudflare R2 |
| Search | MySQL LIKE | Elasticsearch / Meilisearch |
| Real-time | Polling | WebSocket (Reverb) |
| Auth | Session-based | JWT for API + Mobile |
| Deployment | XAMPP local | Docker → Kubernetes |
| CDN | None | Cloudflare CDN |

### Performance Targets

| Metric | MVP Target | Phase 3 Target |
|--------|-----------|----------------|
| Page Load | < 3s | < 1.5s |
| Time to First Byte | < 1s | < 500ms |
| Concurrent Users | 100 | 10,000+ |
| Database Queries/Page | < 30 | < 15 |
| Uptime | N/A (dev) | 99.9% |
