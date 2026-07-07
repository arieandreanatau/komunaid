# Tahap 0 — Project Initiation

| Field          | Value                       |
| -------------- | --------------------------- |
| **Project**    | KomunaID                    |
| **Company**    | PT Komuna Digital Indonesia |
| **Platform**   | Komuna.id                   |
| **Version**    | 1.0 — MVP                   |
| **Date**       | 7 Juli 2026                 |
| **Status**     | Completed                   |
| **SDLC Phase** | 00 — Project Initiation     |

---

## 1. Ringkasan Project Initiation

### 1.1 Apa itu KomunaID?

KomunaID adalah platform Community-Tech digital yang menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi. Platform ini menjadi jembatan antara orang yang mencari komunitas dengan komunitas yang ingin bertumbuh.

**Tagline**: Platform - People - Community - Partnership

### 1.2 Mengapa KomunaID Dibuat?

| Masalah                                          | Dampak                       | Solusi KomunaID                                     |
| ------------------------------------------------ | ---------------------------- | --------------------------------------------------- |
| Info komunitas tersebar di Instagram, WA, manual | Sulit discovery komunitas    | Direktori komunitas terpusat dengan search & filter |
| Komunitas kelola anggota manual                  | Operasional tidak efisien    | Dashboard komunitas dengan tools manajemen          |
| Brand sulit temukan komunitas partner            | Kolaborasi tidak terstruktur | Direktori komunitas dengan metrik aktivitas         |
| Tidak ada standar keamanan                       | Ekosistem tidak aman         | Approval, moderation, RBAC, audit log               |

### 1.3 Siapa yang Diuntungkan?

| Stakeholder        | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| Individual/Member  | Discovery komunitas & event, kontribusi, tracking     |
| Community Owner    | Management tools, approval, analytics, moderation     |
| Organization/Brand | Discovery komunitas partner, profile, team management |
| Platform Admin     | Control, moderation, audit, analytics                 |

---

## 2. Project Identity

| Field               | Value                        |
| ------------------- | ---------------------------- |
| **Nama Proyek**     | KomunaID                     |
| **Nama Perusahaan** | PT Komuna Digital Indonesia  |
| **Brand**           | KomunaID                     |
| **Platform**        | Komuna.id                    |
| **Domain**          | https://komuna.id            |
| **Type**            | Web Application (Responsive) |

---

## 3. Tech Stack

```
Monorepo: pnpm workspace

Frontend (apps/web):
  ├── Next.js 15+ (App Router)
  ├── TypeScript
  ├── Tailwind CSS
  └── shadcn/ui

Backend (apps/api):
  ├── NestJS
  ├── TypeScript
  ├── Prisma ORM
  ├── JWT (access + refresh token)
  └── bcrypt

Database:
  └── MySQL 8.x

Infrastructure:
  ├── Vercel (Frontend)
  ├── Hostinger (Database)
  ├── GitHub Actions (CI/CD)
  └── S3/Vercel Blob (File Upload)
```

---

## 4. Scope Summary

### 4.1 In Scope (MVP)

| Module         | Key Features                                                             |
| -------------- | ------------------------------------------------------------------------ |
| Public Website | Landing, directories, detail, about, FAQ, contact, guidelines            |
| Authentication | Register, login, logout, forgot/reset password                           |
| Member         | Profile, communities, events, bookmarks, notifications, activity         |
| Community      | CRUD, membership, approval, posts, analytics                             |
| Organization   | CRUD, team, approval                                                     |
| Event          | CRUD, registration, attendance, check-in                                 |
| Admin          | Dashboard, approvals, user mgmt, roles, moderation, analytics, audit log |
| RBAC           | 9 scope-based roles                                                      |
| API            | REST API v1                                                              |
| Database       | MySQL + Prisma ORM                                                       |

### 4.2 Out of Scope (Later)

Payment gateway, chat internal, wallet, marketplace, sponsorship marketplace, venue booking, native mobile app, advanced analytics, recommendation engine, gamification, public API, multi-language, sub/regional community, volunteer management, CMS/blog, brand/collaboration management.

---

## 5. Stakeholder

| Role           | Responsibility                              |
| -------------- | ------------------------------------------- |
| Product Owner  | Keputusan bisnis, prioritas fitur, approval |
| Tech Lead      | Keputusan teknis, architecture, code review |
| Developer      | Implementasi fitur                          |
| QA Engineer    | Testing, validasi requirement               |
| Designer       | UI/UX design                                |
| DevOps         | Deployment, infrastructure                  |
| Content Writer | Konten statis (About, FAQ, Terms)           |
| Legal          | Terms & Privacy Policy review               |

---

## 6. Success Criteria Summary

### Product

- Semua MVP features functional — 100% pass E2E test

### Technical

- Lighthouse Performance ≥ 80
- 0 critical security vulnerabilities
- 100% responsive (mobile & desktop)
- API response < 500ms

### Business

- 500 user/bulan (1 bulan setelah launch)
- 50 komunitas approved (3 bulan setelah launch)
- 100 event terdaftar (3 bulan setelah launch)
- Approval response < 24 jam
- User retention > 30% dalam 30 hari

### Launch Readiness

- Production URL accessible
- SSL certificate active
- Database production connected
- Email service active
- Seed data loaded
- CI/CD pipeline active

---

## 7. Dokumen yang Dibuat (Tahap 0)

| No  | Document           | Path                                 | Description                                                                           |
| --- | ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------- |
| 1   | Project Brief      | `docs/product/project-brief.md`      | Ringkasan proyek: nama, brand, platform, tujuan, scope, tech stack                    |
| 2   | Problem Statement  | `docs/product/problem-statement.md`  | Analisis masalah yang diselesaikan: root cause, affected stakeholders, personas       |
| 3   | Project Objective  | `docs/product/project-objective.md`  | Tujuan proyek: vision, mission, business goals, product/technical/business objectives |
| 4   | Success Criteria   | `docs/product/success-criteria.md`   | Kriteria keberhasilan: product, technical, business, launch readiness                 |
| 5   | Project Initiation | `docs/sdlc/00-project-initiation.md` | Dokumen induk Tahap 0 ini                                                             |

---

## 8. Checklist Tahap 0

| No  | Item                                         | Status                                       |
| --- | -------------------------------------------- | -------------------------------------------- |
| 1   | Nama proyek ditentukan                       | ✅ KomunaID                                  |
| 2   | Nama perusahaan ditentukan                   | ✅ PT Komuna Digital Indonesia               |
| 3   | Brand ditentukan                             | ✅ KomunaID                                  |
| 4   | Platform ditentukan                          | ✅ Komuna.id                                 |
| 5   | Tech stack ditentukan                        | ✅ Next.js + NestJS + MySQL + Prisma         |
| 6   | Tujuan utama website didefinisikan           | ✅ Discovery, Management, Connection, Safety |
| 7   | Masalah yang diselesaikan dianalisis         | ✅ 5 masalah utama teridentifikasi           |
| 8   | Target user didefinisikan                    | ✅ 8 user segment                            |
| 9   | Stakeholder diidentifikasi                   | ✅ 8 stakeholder role                        |
| 10  | Value proposition didefinisikan              | ✅ Per stakeholder segment                   |
| 11  | Scope awal MVP didefinisikan                 | ✅ 11 module in scope                        |
| 12  | Scope yang ditunda didefinisikan             | ✅ 17 feature later scope                    |
| 13  | Success criteria produk ditentukan           | ✅ 10 criteria                               |
| 14  | Success criteria teknis ditentukan           | ✅ 15 criteria                               |
| 15  | Success criteria bisnis ditentukan           | ✅ 10 criteria                               |
| 16  | Success criteria launch readiness ditentukan | ✅ 15 criteria                               |
| 17  | Semua dokumen Tahap 0 dibuat                 | ✅ 5 dokumen                                 |
| 18  | Tidak ada kode aplikasi dibuat               | ✅ Tidak ada kode                            |

---

## 9. Catatan Risiko Awal

| No   | Risk                                                                | Impact | Probability | Mitigation                                                   |
| ---- | ------------------------------------------------------------------- | ------ | ----------- | ------------------------------------------------------------ |
| R-01 | Database MySQL remote dari Hostinger tidak bisa diakses dari Vercel | High   | Medium      | Test koneksi sebelum development, gunakan connection pooling |
| R-02 | File upload di Vercel serverless terbatas                           | Medium | High        | Gunakan S3-compatible storage (Vercel Blob)                  |
| R-03 | JWT di environment serverless                                       | Medium | Low         | Test JWT signing/verification di serverless environment      |
| R-04 | Email service tidak berfungsi                                       | Medium | Low         | Setup email provider (Resend/SMTP) sebelum launch            |
| R-05 | Komunitas existing tidak bergabung                                  | High   | Medium      | Siapkan seed data + marketing plan sebelum launch            |
| R-06 | Scope creep - fitur later scope masuk MVP                           | High   | Medium      | Enforce scope freeze, document semua request di backlog      |
| R-07 | Tim development kecil                                               | Medium | High        | Fokus MVP scope, iterasi bertahap                            |
| R-08 | Brand identity belum final                                          | Medium | Medium      | Siapkan placeholder, finalisasi sebelum launch               |

---

## 10. Rekomendasi Lanjut

### Tahap 1 Sudah Selesai ✅

Requirement Gathering sudah completed dengan dokumen lengkap:

- BRD, User Requirements, Admin Requirements, Feature Requirements
- Content Requirements, Role Access Overview, Traceability Matrix
- Open Questions sudah resolved

### Lanjut ke Tahap 2 — System Design & Architecture

**Aktivitas Tahap 2:**

1. Database schema refinement (Prisma schema final)
2. API endpoint design (REST API specification)
3. Component architecture (Frontend + Backend)
4. UI/UX wireframe
5. Deployment architecture
6. Security architecture

**Output Tahap 2:**

- `docs/sdlc/02-system-design.md`
- `docs/design/database-schema.md`
- `docs/design/api-specification.md`
- `docs/design/component-architecture.md`
- `docs/design/ui-ux-wireframe.md`
- `docs/design/deployment-architecture.md`
- `docs/design/security-architecture.md`

---

## 11. References

### Existing Documents

| Document                    | Path                                               |
| --------------------------- | -------------------------------------------------- |
| BRD                         | `docs/requirements/brd.md`                         |
| Feature Requirements        | `docs/requirements/feature-requirements.md`        |
| User Requirements           | `docs/requirements/user-requirements.md`           |
| Admin Requirements          | `docs/requirements/admin-requirements.md`          |
| Content Requirements        | `docs/requirements/content-requirements.md`        |
| Role Access Overview        | `docs/requirements/role-access-overview.md`        |
| Traceability Matrix         | `docs/requirements/traceability-matrix.md`         |
| Assumptions                 | `docs/requirements/assumptions.md`                 |
| Constraints                 | `docs/requirements/constraints.md`                 |
| Dependencies                | `docs/requirements/dependencies.md`                |
| Glossary                    | `docs/requirements/glossary.md`                    |
| Non-Functional Requirements | `docs/requirements/non-functional-requirements.md` |
| User Journeys               | `docs/requirements/user-journeys.md`               |
| Requirement Gathering       | `docs/sdlc/01-requirement-gathering.md`            |

### Tahap 0 Documents

| Document           | Path                                 |
| ------------------ | ------------------------------------ |
| Project Brief      | `docs/product/project-brief.md`      |
| Problem Statement  | `docs/product/problem-statement.md`  |
| Project Objective  | `docs/product/project-objective.md`  |
| Success Criteria   | `docs/product/success-criteria.md`   |
| Project Initiation | `docs/sdlc/00-project-initiation.md` |
