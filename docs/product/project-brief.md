# Project Brief — KomunaID

| Field        | Value                       |
| ------------ | --------------------------- |
| **Project**  | KomunaID                    |
| **Company**  | PT Komuna Digital Indonesia |
| **Brand**    | KomunaID                    |
| **Platform** | Komuna.id                   |
| **Version**  | 1.0 — MVP                   |
| **Date**     | 7 Juli 2026                 |
| **Status**   | Initiated                   |

---

## 1. Project Overview

KomunaID adalah platform Community-Tech digital yang menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi. Platform ini menjadi jembatan antara orang yang mencari komunitas dengan komunitas yang ingin bertumbuh.

**Tagline**: Platform - People - Community - Partnership

---

## 2. Company Profile

| Field               | Value                                         |
| ------------------- | --------------------------------------------- |
| **Nama Perusahaan** | PT Komuna Digital Indonesia                   |
| **Domain**          | Komuna.id                                     |
| **Industri**        | Community-Tech / Platform Digital             |
| **Model Bisnis**    | B2C (Member) + B2B (Organization/Sponsorship) |

---

## 3. Brand Identity

| Field            | Value                            |
| ---------------- | -------------------------------- |
| **Nama Brand**   | KomunaID                         |
| **Logo**         | [待确定]                         |
| **Warna**        | [待确定]                         |
| **Font**         | [待确定]                         |
| **Voice & Tone** | Informatif, inklusif, inspiratif |

---

## 4. Platform

| Field          | Value                                                            |
| -------------- | ---------------------------------------------------------------- |
| **URL**        | https://komuna.id                                                |
| **Type**       | Web Application (Responsive)                                     |
| **Frontend**   | Next.js 15+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| **Backend**    | NestJS + TypeScript + Prisma ORM                                 |
| **Database**   | MySQL 8.x                                                        |
| **Deployment** | Vercel (Frontend) + Hostinger (Database)                         |

---

## 5. Purpose

### 5.1 Tujuan Utama Website

KomunaID bertujuan menjadi **one-stop platform** untuk:

1. **Discovery** — Memudahkan individu menemukan komunitas dan event yang relevan dengan minat mereka
2. **Management** — Menyediakan tools bagi komunitas dan organisasi untuk mengelola anggota, event, dan operasional
3. **Connection** — Menghubungkan komunitas, organisasi, dan brand dalam ekosistem kolaborasi yang terstruktur
4. **Moderation** — Menjamin keamanan dan kualitas ekosistem melalui sistem approval, moderasi, dan audit log

### 5.2 Masalah yang Diselesaikan

| No  | Masalah                                                                 | Solusi                                                               |
| --- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Informasi komunitas tersebar di Instagram, grup chat, rekomendasi teman | Sentralisasi data komunitas di platform yang bisa di-search & filter |
| 2   | Komunitas sulit mengelola anggota, event, pengurus, dan laporan         | Dashboard komunitas dengan tools manajemen lengkap                   |
| 3   | Brand/organisasi sulit menemukan komunitas aktif untuk partnership      | Direktori komunitas dengan metrik aktivitas dan kategori             |
| 4   | Tidak ada standar keamanan untuk ekosistem komunitas digital            | Sistem approval, moderasi, RBAC, dan audit log                       |

---

## 6. Target Users

| Segment                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| **Individual / Member** | Mencari & join komunitas, daftar event, kelola profil |
| **Community Owner**     | Membuat & mengelola komunitas, member, event          |
| **Community Admin**     | Membantu operasional komunitas                        |
| **Event Manager**       | Mengelola event komunitas                             |
| **Organization Owner**  | Membuat & mengelola organisasi                        |
| **Organization Admin**  | Membantu operasional organisasi                       |
| **Platform Admin**      | Approval, moderasi, support                           |
| **Super Admin**         | Kontrol penuh platform                                |

---

## 7. Stakeholder

| Role               | Responsibility                              |
| ------------------ | ------------------------------------------- |
| **Product Owner**  | Keputusan bisnis, prioritas fitur, approval |
| **Tech Lead**      | Keputusan teknis, architecture, code review |
| **Developer**      | Implementasi fitur                          |
| **QA Engineer**    | Testing, validasi requirement               |
| **Designer**       | UI/UX design                                |
| **DevOps**         | Deployment, infrastructure                  |
| **Content Writer** | Konten statis (About, FAQ, Terms)           |
| **Legal**          | Terms & Privacy Policy review               |

---

## 8. Value Proposition

### Untuk Individual/Member:

> "Temukan komunitas yang relevan dengan minatmu, bergabung, dan ikuti event yang menarik — semua di satu tempat."

### Untuk Community Owner:

> "Kelola komunitasmu dengan mudah — dari approval anggota hingga manajemen event, semuanya terpusat dan terorganisir."

### Untuk Organization/Brand:

> "Temukan komunitas aktif yang sesuai dengan target audiensmu untuk partnership, CSR, atau sponsorship."

---

## 9. Scope Awal MVP

### In Scope

| Module         | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| Public Website | Landing, direktori komunitas/event, detail, about, FAQ, contact, guidelines |
| Authentication | Register, login, logout, forgot/reset password                              |
| Member         | Profil, komunitas, event, bookmark, riwayat, notifikasi                     |
| Community      | CRUD, membership, approval, event, post                                     |
| Organization   | CRUD, team, approval                                                        |
| Event          | CRUD, registrasi, attendance                                                |
| Admin          | Dashboard, approval, user mgmt, role, moderasi, analytics dasar, audit log  |
| RBAC           | 9 role scope-based                                                          |
| API            | REST API v1                                                                 |
| Database       | MySQL + Prisma ORM                                                          |

### Scope yang Ditunda (Later)

| Feature                        | Reason                           |
| ------------------------------ | -------------------------------- |
| Payment gateway penuh          | Butuh integrasi payment provider |
| Chat internal                  | Kompleksitas real-time           |
| Wallet                         | Butuh payment gateway            |
| Marketplace penuh              | Fitur kompleks                   |
| Sponsorship marketplace        | Butuh brand management           |
| Venue booking                  | Butuh integrasi venue            |
| Native mobile app              | Web responsive dulu              |
| Advanced analytics             | Butuh data cukup                 |
| Recommendation engine          | Butuh data cukup                 |
| Gamification                   | Later scope                      |
| Public API                     | Butuh validasi keamanan          |
| Multi-language                 | Prioritas rendah                 |
| Sub/Regional community         | Kompleksitas struktur            |
| CMS/Blog                       | Prioritas rendah                 |
| Brand/Collaboration management | Later scope                      |

---

## 10. Tech Stack Summary

```
Monorepo: pnpm workspace

Frontend (apps/web):
  - Next.js 15+ (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui

Backend (apps/api):
  - NestJS
  - TypeScript
  - Prisma ORM
  - JWT (access + refresh token)
  - bcrypt

Database:
  - MySQL 8.x

Infrastructure:
  - Vercel (Frontend)
  - Hostinger (Database)
  - GitHub Actions (CI/CD)
  - S3/Vercel Blob (File Upload)
```

---

## 11. Key Metrics (MVP)

| Metric                 | Target              | Timeline               |
| ---------------------- | ------------------- | ---------------------- |
| User Registration      | 500 user/bulan      | 1 bulan setelah launch |
| Community Terdaftar    | 50 komunitas        | 3 bulan setelah launch |
| Event Terdaftar        | 100 event           | 3 bulan setelah launch |
| Approval Response Time | < 24 jam            | Ongoing                |
| User Retention         | > 30% dalam 30 hari | Ongoing                |

---

## 12. References

| Document             | Path                                        |
| -------------------- | ------------------------------------------- |
| BRD                  | `docs/requirements/brd.md`                  |
| Feature Requirements | `docs/requirements/feature-requirements.md` |
| User Requirements    | `docs/requirements/user-requirements.md`    |
| Role Access Overview | `docs/requirements/role-access-overview.md` |
| Constraints          | `docs/requirements/constraints.md`          |
| Assumptions          | `docs/requirements/assumptions.md`          |
