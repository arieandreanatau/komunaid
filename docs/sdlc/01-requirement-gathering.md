# Tahap 1 — Requirement Gathering

| Field          | Value                       |
| -------------- | --------------------------- |
| **Project**    | KomunaID                    |
| **Company**    | PT Komuna Digital Indonesia |
| **Platform**   | Komuna.id                   |
| **Date**       | 7 Juli 2026                 |
| **Status**     | Completed                   |
| **SDLC Phase** | 01 — Requirement Gathering  |

---

## 1. Ringkasan Requirement

### 1.1 Visi Produk

KomunaID adalah platform Community-Tech digital yang menghubungkan individu, komunitas, organisasi, event, dan ekosistem kolaborasi secara terstruktur. Fokus utama: discovery komunitas & event, onboarding member, dashboard owner/admin, approval, moderasi, notifikasi dasar, analytics dasar, audit log, RBAC, dan keamanan.

### 1.2 Target Pengguna

- Individu yang mencari komunitas & event
- Komunitas yang ingin mengelola anggota & kegiatan
- Organisasi/perusahaan yang ingin berkolaborasi dengan komunitas
- Tim platform yang mengelola operasional

### 1.3 Scope MVP

- Public website (landing, direktori komunitas/event, detail, about, FAQ, contact, guidelines)
- Authentication (register, login, logout, forgot/reset password)
- Member dashboard (profil, komunitas, event, bookmark, riwayat, notifikasi)
- Community management (CRUD, membership, approval, event, post, galeri)
- Organization management (CRUD, team, approval)
- Event management (CRUD, registrasi, attendance)
- Admin dashboard (approval, user management, role, moderasi, analytics dasar, audit log)
- RBAC scope-based (9 role)
- REST API v1, MySQL, Prisma ORM

### 1.4 Later Scope (TIDAK dibangun di MVP)

- Payment gateway penuh
- Chat internal / messaging
- Wallet / top-up / withdraw
- Marketplace penuh
- Sponsorship marketplace penuh
- Venue booking real-time
- Native mobile app
- Advanced analytics / Komuna Insight lanjutan
- Recommendation engine
- Gamification
- Public API
- Multi-language

---

## 2. Tahapan Requirement Gathering

| No  | Aktivitas                       | Output               | Status |
| --- | ------------------------------- | -------------------- | ------ |
| 1   | Identifikasi stakeholder & role | Role Access Overview | ✅     |
| 2   | Analisis kebutuhan bisnis       | BRD                  | ✅     |
| 3   | Kebutuhan user per role         | User Requirements    | ✅     |
| 4   | Kebutuhan admin per role        | Admin Requirements   | ✅     |
| 5   | Kebutuhan fitur per modul       | Feature Requirements | ✅     |
| 6   | Kebutuhan konten                | Content Requirements | ✅     |
| 7   | Akses & permission per role     | Role Access Overview | ✅     |
| 8   | Open questions & ambiguity      | Open Question List   | ✅     |
| 9   | Checklist tahap 1               | Checklist            | ✅     |

---

## 3. Document Index

| No  | Document             | Path                                        | Description                            |
| --- | -------------------- | ------------------------------------------- | -------------------------------------- |
| 1   | BRD                  | `docs/requirements/brd.md`                  | Business Requirements Document ringkas |
| 2   | User Requirements    | `docs/requirements/user-requirements.md`    | Kebutuhan user per role                |
| 3   | Admin Requirements   | `docs/requirements/admin-requirements.md`   | Kebutuhan admin per role               |
| 4   | Feature Requirements | `docs/requirements/feature-requirements.md` | Kebutuhan fitur per modul              |
| 5   | Content Requirements | `docs/requirements/content-requirements.md` | Kebutuhan konten                       |
| 6   | Role Access Overview | `docs/requirements/role-access-overview.md` | Akses & permission per role            |

---

## 4. Open Questions / Ambiguity

| No    | Question                                                 | Module       | Priority | Status                                                 |
| ----- | -------------------------------------------------------- | ------------ | -------- | ------------------------------------------------------ |
| OQ-01 | Apakah email wajib atau optional saat register?          | Auth         | High     | Resolved — optional pada MVP                           |
| OQ-02 | Apakah event berbayar termasuk MVP?                      | Event        | High     | Resolved — registrasi gratis saja, payment later scope |
| OQ-03 | Apakah sub-komunitas & regional komunitas termasuk MVP?  | Community    | Medium   | Resolved — later scope                                 |
| OQ-04 | Apakah volunteer management termasuk MVP?                | Event        | Medium   | Resolved — later scope                                 |
| OQ-05 | Apakah brand management termasuk MVP?                    | Organization | Medium   | Resolved — later scope                                 |
| OQ-06 | Bagaimana handling file upload di Vercel (serverless)?   | Tech         | High     | Resolved — S3-compatible / Vercel Blob                 |
| OQ-07 | Berapa max file upload size untuk avatar/logo?           | Profile      | Low      | Resolved — 2MB avatar, 5MB banner                      |
| OQ-08 | Apakah email verification wajib?                         | Auth         | Medium   | Resolved — optional, reminder only                     |
| OQ-09 | Apakah admin bisa register publik?                       | Admin        | High     | Resolved — tidak, hanya via seed/invitation            |
| OQ-10 | Berapa batas join-leave community sebelum restriction?   | Community    | Low      | Resolved — 3x                                          |
| OQ-11 | Bagaimana deployment MySQL di Hostinger untuk Vercel?    | Deploy       | High     | Resolved — remote MySQL, SSL, connection pooling       |
| OQ-12 | Apakah rate limiting wajib untuk MVP?                    | Security     | Medium   | Resolved — recommended, @nestjs/throttler              |
| OQ-13 | Berapa jumlah max komunitas yang bisa dibuat 1 user?     | Community    | Medium   | Resolved — unlimited untuk MVP                         |
| OQ-14 | Apakah organization bisa punya 1 owner saja?             | Organization | High     | Resolved — 1 org per user di MVP                       |
| OQ-15 | Apakah brand independent bisa dibuat tanpa organization? | Brand        | Medium   | Resolved — later scope, brand management later         |

---

## 5. Checklist Tahap 1

| No  | Item                                  | Status |
| --- | ------------------------------------- | ------ |
| 1   | BRD ringkas dibuat                    | ✅     |
| 2   | User requirement list dibuat          | ✅     |
| 3   | Admin requirement list dibuat         | ✅     |
| 4   | Feature requirement list dibuat       | ✅     |
| 5   | Content requirement list dibuat       | ✅     |
| 6   | Role access overview dibuat           | ✅     |
| 7   | Later scope dipisahkan dari MVP       | ✅     |
| 8   | Open question / ambiguity list dibuat | ✅     |
| 9   | Semua requirement punya kode unik     | ✅     |
| 10  | Semua requirement punya prioritas     | ✅     |
| 11  | Semua requirement punya role terkait  | ✅     |

---

## 6. Rekomendasi Tahap Selanjutnya

**Tahap 2 — System Design & Architecture**

- Database schema refinement
- API endpoint design
- Component architecture
- UI/UX wireframe
- Deployment architecture
- Security architecture
