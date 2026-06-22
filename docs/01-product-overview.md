# KomunaID — Product Overview

## 1. Ringkasan Produk

KomunaID adalah platform digital yang menghubungkan masyarakat (member) dengan komunitas, komunitas dengan komunitas, dan komunitas dengan brand. Platform ini menjadi pusat discovery komunitas, manajemen keanggotaan, event management, kolaborasi, kampanye, donasi, wallet, dan berkembang menjadi social community platform.

**Tagline:** "Connect. Collaborate. Community."

---

## 2. Problem Statement

- Masyarakat kesulitan menemukan dan bergabung dengan komunitas yang relevan dengan minat mereka.
- Komunitas kesulitan mengelola keanggotaan, event, dan kolaborasi secara terpusat.
- Brand kesulitan menemukan komunitas yang tepat untuk kolaborasi dan kampanye.
- Tidak ada satu platform yang menyatukan semua kebutuhan komunitas dalam satu ekosistem.
- Transparansi donasi dan kontribusi komunitas masih rendah.

---

## 3. Solution Statement

KomunaID menyediakan satu platform terpadu yang memungkinkan:
- **Member** untuk menemukan, bergabung, dan berinteraksi dengan komunitas.
- **Community Owner** untuk mengelola keanggotaan, event, kampanye, dan donasi.
- **Brand Owner** untuk menemukan dan berkolaborasi dengan komunitas.
- **Superadmin** untuk mengawasi seluruh aktivitas dan mengelola role pengguna.

---

## 4. Target User

| Role | Deskripsi |
|------|-----------|
| **Guest** | Pengunjung yang belum terdaftar, dapat melihat halaman publik |
| **Member** | Pengguna terdaftar yang dapat bergabung dengan komunitas |
| **Community Owner** | Member yang disetujui untuk membuat dan mengelola komunitas |
| **Brand Owner** | Member yang disetujui untuk membuat dan mengelola brand |
| **Superadmin** | Pengelola platform yang mengawasi seluruh aktivitas |

---

## 5. Value Proposition

- **Untuk Member:** Temukan komunitas yang sesuai minat, kelola keanggotaan dalam satu platform, ikuti event dan kampanye.
- **Untuk Community Owner:** Kelola komunitas secara digital, tingkatkan engagement, dapatkan kolaborasi dengan brand.
- **Untuk Brand Owner:** Temukan komunitas target, jalankan kampanye,ukur dampak.
- **Untuk Superadmin:** Kontrol penuh atas platform, data transparan, moderasi konten.

---

## 6. MVP Scope (Fase 1)

### Yang MASUK di MVP:
1. **Authentication & Authorization**
   - Registration, login, logout
   - Role-based access (Guest, Member, Community Owner, Brand Owner, Superadmin)
   - Role approval workflow (ajuan role → approve/reject oleh Superadmin)

2. **Landing Page & Public Pages**
   - Landing page dengan CTA register/login
   - Daftar komunitas publik (browse & search)
   - Detail komunitas publik (terbatas)

3. **Member Dashboard**
   - Profile management
   - Daftar komunitas yang diikuti
   - Riwayat aktivitas

4. **Community Management**
   - Community Owner dashboard
   - CRUD Komunitas (create, read, update, delete)
   - Manajemen anggota komunitas (approve/reject keanggotaan)
   - Settings komunitas

5. **Brand Management**
   - Brand Owner dashboard
   - CRUD Brand (create, read, update, delete)
   - Brand profile

6. **Superadmin Dashboard**
   - User management
   - Role approval queue
   - Community approval & moderation
   - Brand approval & moderation
   - Basic analytics

7. **Event Management (Basic)**
   - Community Owner dapat membuat event
   - Member dapat melihat dan RSVP event

---

### Yang TIDAK MASUK di MVP (Backlog Fase 2+):
1. Wallet & Payment Integration
2. Donation System
3. Campaign Management
4. Collaboration Hub (brand × community)
5. Chat / Messaging
6. Social Media Features (feed, post, comment, like)
7. Notification System (push, email, in-app)
8. Advanced Analytics & Reporting
9. Mobile App (React Native / Flutter)
10. Gamification (badges, points, leaderboard)
11. Content Management System (CMS)
12. Multi-language Support
13. API for Third-party Integration
14. Advanced Search (Elasticsearch)
15. Real-time Features (WebSocket, Live Streaming)

---

## 7. Modul Utama Aplikasi

| No | Modul | Deskripsi | MVP? |
|----|-------|-----------|------|
| 1 | Auth | Registration, login, role management | ✅ |
| 2 | User | Profile, settings, role approval | ✅ |
| 3 | Community | CRUD komunitas, manajemen anggota | ✅ |
| 4 | Brand | CRUD brand, profil brand | ✅ |
| 5 | Event | Buat, kelola, RSVP event | ✅ |
| 6 | Superadmin | Dashboard, moderasi, approval | ✅ |
| 7 | Wallet | Saldo, transaksi, top-up | ❌ Fase 2 |
| 8 | Donation | Donasi ke komunitas/event | ❌ Fase 2 |
| 9 | Campaign | Kampanye brand × komunitas | ❌ Fase 2 |
| 10 | Collaboration | Kolaborasi antar komunitas & brand | ❌ Fase 2 |
| 11 | Chat | Messaging antar user/komunitas | ❌ Fase 3 |
| 12 | Social | Feed, post, comment, like | ❌ Fase 3 |

---

## 8. Rekomendasi Tech Stack Final

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Backend** | Laravel 11 | PHP framework mature, ecosystem luas, cocok untuk MVP |
| **Database** | MySQL 8 | Reliable, well-supported oleh Laravel |
| **Frontend** | Blade + Livewire | Simple, tidak perlu SPA complex untuk MVP, tetap interaktif |
| **CSS** | Tailwind CSS | Utility-first, cepat untuk prototyping |
| **JS** | Alpine.js | Lightweight, cukup untuk interaksi kecil |
| **Auth** | Laravel Breeze | Simple auth scaffolding, bisa di-custom |
| **Storage** | Local/S3 | File upload untuk avatar, banner komunitas |
| **Queue** | Laravel Queue (database) | Untuk email, notifikasi async |
| **Testing** | PHPUnit | Built-in Laravel |
| **Version Control** | Git + GitHub | Standard |
| **CI/CD** | GitHub Actions | Free untuk public repo |

---

## 9. Rekomendasi Struktur Folder Project

```
KomunaID/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   ├── Web/
│   │   │   │   ├── Guest/
│   │   │   │   ├── Member/
│   │   │   │   ├── Community/
│   │   │   │   ├── Brand/
│   │   │   │   └── Superadmin/
│   │   │   └── Api/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Community.php
│   │   ├── CommunityMember.php
│   │   ├── Brand.php
│   │   ├── Event.php
│   │   ├── EventAttendee.php
│   │   ├── RoleApproval.php
│   │   └── ...
│   ├── Services/
│   │   ├── CommunityService.php
│   │   ├── BrandService.php
│   │   └── EventService.php
│   └── Enums/
│       ├── UserRole.php
│       └── ApprovalStatus.php
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── resources/
│   ├── views/
│   │   ├── layouts/
│   │   ├── components/
│   │   ├── guest/
│   │   ├── member/
│   │   ├── community/
│   │   ├── brand/
│   │   └── superadmin/
│   ├── css/
│   └── js/
├── routes/
│   ├── web.php
│   └── api.php
├── docs/
│   ├── 01-product-overview.md
│   ├── 02-database-design.md
│   ├── 03-api-design.md
│   └── 04-development-tasks.md
├── tests/
│   ├── Unit/
│   └── Feature/
├── .env.example
├── composer.json
├── package.json
├── vite.config.js
└── README.md
```

---

## 10. Development Timeline (Estimasi)

| Fase | Durasi | Output |
|------|--------|--------|
| Phase 1: Planning & Setup | 1-2 hari | Dokumen, project setup |
| Phase 2: Auth & User Management | 3-5 hari | Registration, login, role |
| Phase 3: Community Module | 3-5 hari | CRUD komunitas, keanggotaan |
| Phase 4: Brand Module | 2-3 hari | CRUD brand |
| Phase 5: Event Module | 2-3 hari | Event management |
| Phase 6: Superadmin Dashboard | 3-5 hari | Admin panel |
| Phase 7: Public Pages | 2-3 hari | Landing page, browse |
| Phase 8: Polish & QA | 3-5 hari | Bug fixing, refinement |
| Phase 9: Deployment | 1-2 hari | Production setup |

**Total Estimasi MVP: 20-33 hari (1-1.5 bulan)**
