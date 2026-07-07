# Project Objective — KomunaID

| Field       | Value                       |
| ----------- | --------------------------- |
| **Project** | KomunaID                    |
| **Company** | PT Komuna Digital Indonesia |
| **Version** | 1.0 — MVP                   |
| **Date**    | 7 Juli 2026                 |

---

## 1. Vision

> Menjadi platform Community-Tech terdepan di Indonesia yang menghubungkan individu, komunitas, organisasi, dan ekosistem kolaborasi secara terstruktur, aman, dan efisien.

---

## 2. Mission

1. **Discovery** — Memudahkan individu menemukan komunitas dan event yang relevan
2. **Management** — Menyediakan tools manajemen komunitas yang efisien dan terpusat
3. **Connection** — Menghubungkan komunitas, organisasi, dan brand dalam ekosistem kolaborasi
4. **Safety** — Menjamin keamanan dan kualitas ekosistem melalui sistem approval dan moderasi

---

## 3. Business Goals

| No    | Goal                    | KPI              | Target                | Timeline               |
| ----- | ----------------------- | ---------------- | --------------------- | ---------------------- |
| BG-01 | User registration aktif | Registrasi/bulan | 500 user/bulan        | 1 bulan setelah launch |
| BG-02 | Komunitas terdaftar     | Total komunitas  | 50 komunitas approved | 3 bulan setelah launch |
| BG-03 | Event terdaftar         | Total event      | 100 event terdaftar   | 3 bulan setelah launch |
| BG-04 | Approval response time  | Jam response     | < 24 jam              | Ongoing                |
| BG-05 | User retention          | Return rate      | > 30% dalam 30 hari   | Ongoing                |

---

## 4. Product Objectives (MVP)

### 4.1 Functional Objectives

| No    | Objective                                                    | Module         | Priority | Acceptance Criteria                                     |
| ----- | ------------------------------------------------------------ | -------------- | -------- | ------------------------------------------------------- |
| FO-01 | Platform bisa diakses dan browsing konten publik tanpa login | Public Website | High     | Landing, direktori, detail pages load < 3 detik         |
| FO-02 | User bisa register, login, dan mengelola profil              | Auth + Member  | High     | Register → auto login → redirect dashboard              |
| FO-03 | User bisa mencari, join, dan berinteraksi dengan komunitas   | Community      | High     | Search, filter, join (open/approval) berfungsi          |
| FO-04 | Community owner bisa mengelola komunitasnya                  | Community      | High     | CRUD, member management, approval berfungsi             |
| FO-05 | User bisa mencari dan daftar event                           | Event          | High     | Search, register, cancel berfungsi                      |
| FO-06 | Organization bisa membuat profil dan mengelola team          | Organization   | Medium   | CRUD, team management berfungsi                         |
| FO-07 | Admin bisa mengelola platform                                | Admin          | High     | Dashboard, approval, user mgmt, audit log berfungsi     |
| FO-08 | RBAC scope-based berfungsi untuk semua role                  | RBAC           | High     | 9 role dengan permission yang benar                     |
| FO-09 | Notifikasi in-app berfungsi                                  | Notification   | High     | Approval, join request, event registration notif muncul |
| FO-10 | User bisa melaporkan konten/user bermasalah                  | Report         | Medium   | Report, moderation queue, resolve berfungsi             |

### 4.2 Technical Objectives

| No    | Objective      | Metric                           | Target                     |
| ----- | -------------- | -------------------------------- | -------------------------- |
| TO-01 | Performance    | Lighthouse Performance Score     | ≥ 80                       |
| TO-02 | Accessibility  | Lighthouse Accessibility Score   | ≥ 90                       |
| TO-03 | SEO            | Lighthouse SEO Score             | ≥ 90                       |
| TO-04 | Security       | Critical vulnerabilities         | 0                          |
| TO-05 | Responsive     | Mobile & Desktop rendering       | 100% functional            |
| TO-06 | API Response   | Average response time            | < 500ms                    |
| TO-07 | Database       | Query optimization               | N+1 query eliminated       |
| TO-08 | Error Handling | Global error boundary            | All errors caught & logged |
| TO-09 | Code Quality   | TypeScript strict mode           | 0 any types                |
| TO-10 | Testing        | Unit + Integration test coverage | ≥ 70%                      |

### 4.3 Business Objectives

| No    | Objective               | Metric                  | Target                     |
| ----- | ----------------------- | ----------------------- | -------------------------- |
| BO-01 | Platform launch on time | Launch date             | Sesuai timeline            |
| BO-02 | Deployment successful   | Production URL          | Accessible & functional    |
| BO-03 | Default seed data       | Communities & events    | ≥ 10 seed data each        |
| BO-04 | Admin ready             | Platform admin assigned | ≥ 1 admin aktif            |
| BO-05 | Documentation complete  | SDLC docs               | Semua tahap terdokumentasi |

---

## 5. Scope Boundaries

### 5.1 In Scope (MVP)

```
✅ Public Website (landing, directories, detail, about, FAQ, contact, guidelines)
✅ Authentication (register, login, logout, forgot/reset password)
✅ Member Dashboard (profile, communities, events, bookmarks, notifications, activity)
✅ Community Management (CRUD, membership, approval, posts, analytics)
✅ Organization Management (CRUD, team, approval)
✅ Event Management (CRUD, registration, attendance, check-in)
✅ Admin Dashboard (approvals, user mgmt, roles, moderation, analytics, audit log)
✅ RBAC (9 scope-based roles)
✅ REST API v1
✅ MySQL + Prisma ORM
✅ In-app Notifications
✅ Report Abuse & Moderation
✅ Contact Form
```

### 5.2 Out of Scope (Later)

```
❌ Payment Gateway
❌ Chat / Internal Messaging
❌ Wallet / Top-up / Withdraw
❌ Marketplace
❌ Sponsorship Marketplace
❌ Venue Booking
❌ Native Mobile App
❌ Advanced Analytics
❌ Recommendation Engine
❌ Gamification (Points, Badges, Leaderboard)
❌ Public API
❌ Multi-language
❌ Sub / Regional Community
❌ Volunteer Management
❌ CMS / Blog
❌ Brand / Collaboration Management
```

---

## 6. Value Proposition

### 6.1 For Individual/Member

| Benefit          | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| **Discovery**    | Temukan komunitas berdasarkan minat, lokasi, dan kategori  |
| **Connection**   | Bergabung dengan komunitas dan ikuti event menarik         |
| **Contribution** | Berkontribusi melalui post, diskusi, dan partisipasi event |
| **Tracking**     | Lacak riwayat keanggotaan dan partisipasi event            |

### 6.2 For Community Owner

| Benefit        | Description                                         |
| -------------- | --------------------------------------------------- |
| **Management** | Kelola anggota, event, dan konten di satu dashboard |
| **Approval**   | Kontrol kualitas anggota melalui sistem approval    |
| **Analytics**  | Pantau pertumbuhan dan aktivitas komunitas          |
| **Moderation** | Moderasi konten untuk menjaga kualitas diskusi      |

### 6.3 For Organization/Brand

| Benefit       | Description                                         |
| ------------- | --------------------------------------------------- |
| **Discovery** | Temukan komunitas aktif untuk partnership           |
| **Profile**   | Buat profil organisasi yang terlihat oleh komunitas |
| **Team**      | Kelola tim dan role dalam organisasi                |
| **Network**   | Akses jaringan komunitas yang relevan               |

### 6.4 For Platform Admin

| Benefit        | Description                                      |
| -------------- | ------------------------------------------------ |
| **Control**    | Approval semua entity baru sebelum tampil publik |
| **Moderation** | Kelola laporan dan tindak lanjut pelanggaran     |
| **Audit**      | Pantau semua aksi penting melalui audit log      |
| **Analytics**  | Lihat metrik platform secara real-time           |

---

## 7. Key Differentiators

| Differentiator        | Description                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| **Approval System**   | Semua komunitas/organisasi harus di-approve admin — menjamin kualitas ekosistem    |
| **Scope-based RBAC**  | 9 role dengan permission yang fleksibel berdasarkan scope (community/org/platform) |
| **Audit Log**         | Semua action penting tercatat — meningkatkan accountability                        |
| **Community-Centric** | Dirancang khusus untuk kebutuhan komunitas Indonesia                               |
| **Moderation**        | Sistem report & moderation yang terstruktur                                        |

---

## 8. Success Criteria Summary

| Category      | Criteria                      | Target                                  |
| ------------- | ----------------------------- | --------------------------------------- |
| **Product**   | Semua MVP features functional | 100% pass E2E test                      |
| **Technical** | Performance & Security        | Lighthouse ≥ 80, 0 critical vuln        |
| **Business**  | User adoption                 | 500 user/bulan, 50 komunitas, 100 event |
| **Launch**    | Deployment readiness          | Production URL accessible               |

---

## 9. References

| Document             | Path                                        |
| -------------------- | ------------------------------------------- |
| BRD                  | `docs/requirements/brd.md`                  |
| Feature Requirements | `docs/requirements/feature-requirements.md` |
| User Requirements    | `docs/requirements/user-requirements.md`    |
| Project Brief        | `docs/product/project-brief.md`             |
| Problem Statement    | `docs/product/problem-statement.md`         |
| Success Criteria     | `docs/product/success-criteria.md`          |
