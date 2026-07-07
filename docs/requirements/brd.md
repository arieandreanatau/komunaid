# Business Requirements Document (BRD) — KomunaID

| Field        | Value                       |
| ------------ | --------------------------- |
| **Project**  | KomunaID                    |
| **Company**  | PT Komuna Digital Indonesia |
| **Platform** | Komuna.id                   |
| **Version**  | 1.0 — MVP                   |
| **Date**     | 7 Juli 2026                 |

---

## 1. Business Context

### 1.1 Problem Statement

- Orang sulit menemukan komunitas relevan karena informasi tersebar di Instagram, grup chat, dan rekomendasi teman.
- Komunitas sulit mengelola anggota, event, pengurus, dan laporan.
- Brand/organisasi sulit menemukan komunitas aktif untuk sponsorship, CSR, atau partnership.
- Platform membutuhkan sistem approval, moderasi, role permission, audit log untuk ekosistem yang aman.

### 1.2 Solution

Platform digital untuk discovery komunitas & event, manajemen komunitas, dashboard admin, dan ekosistem kolaborasi antara member, komunitas, dan organisasi.

### 1.3 Target Users

| Segment             | Description                                           |
| ------------------- | ----------------------------------------------------- |
| Individual / Member | Mencari & join komunitas, daftar event, kelola profil |
| Community Owner     | Membuat & mengelola komunitas, member, event          |
| Community Admin     | Membantu operasional komunitas                        |
| Event Manager       | Mengelola event komunitas                             |
| Organization Owner  | Membuat & mengelola organisasi                        |
| Organization Admin  | Membantu operasional organisasi                       |
| Platform Admin      | Approval, moderasi, support                           |
| Super Admin         | Kontrol penuh platform                                |

---

## 2. Business Goals

| No    | Goal                    | KPI              | Target               | Acceptance Criteria                                                        |
| ----- | ----------------------- | ---------------- | -------------------- | -------------------------------------------------------------------------- |
| BG-01 | User registration aktif | Registrasi/bulan | 500 user/bulan (MVP) | GIVEN platform launch WHEN 1 bulan berlalu THEN ≥ 500 user terdaftar       |
| BG-02 | Komunitas terdaftar     | Total komunitas  | 50 komunitas (MVP)   | GIVEN platform launch WHEN 3 bulan berlalu THEN ≥ 50 komunitas approved    |
| BG-03 | Event terdaftar         | Total event      | 100 event (MVP)      | GIVEN platform launch WHEN 3 bulan berlalu THEN ≥ 100 event terdaftar      |
| BG-04 | Approval response time  | Jam response     | < 24 jam             | GIVEN komunitas/organisasi submit WHEN admin review THEN response < 24 jam |
| BG-05 | User retention          | Return rate      | > 30% dalam 30 hari  | GIVEN user register WHEN 30 hari berlalu THEN > 30% user login kembali     |

---

## 3. Business Rules

| No    | Rule                                                                  | Module       | Acceptance Criteria                                                                            |
| ----- | --------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| BR-01 | Semua komunitas baru harus di-approve admin sebelum tampil publik     | Community    | GIVEN komunitas baru dibuat WHEN status dicek THEN = PENDING, tidak tampil di direktori publik |
| BR-02 | Semua organisasi baru harus di-approve admin                          | Organization | GIVEN organisasi baru dibuat WHEN status dicek THEN = PENDING                                  |
| BR-03 | Event harus terkait komunitas/organisasi yang sudah approved          | Event        | GIVEN event dibuat WHEN parent entity dicek THEN status = APPROVED                             |
| BR-04 | User baru default role = MEMBER                                       | Auth         | GIVEN user register WHEN role dicek THEN = MEMBER                                              |
| BR-05 | Super Admin tidak bisa register publik, hanya via seed/invitation     | Auth         | GIVEN /register diakses WHEN role Super Admin dicari THEN tidak ada opsi                       |
| BR-06 | 1 user hanya boleh punya 1 organization sebagai owner (MVP)           | Organization | GIVEN user sudah punya org WHEN buat org baru THEN ditolak dengan pesan                        |
| BR-07 | Community membership type: OPEN atau APPROVAL                         | Community    | GIVEN komunitas dibuat WHEN membership type dipilih THEN hanya bisa OPEN atau APPROVAL         |
| BR-08 | Max 3x join-leave bisa membatasi join ulang                           | Community    | GIVEN user join-leave 3x WHEN join lagi THEN ditolak/di-delay                                  |
| BR-9  | Semua action penting (approval, suspend, role change) wajib audit log | Audit        | GIVEN action penting terjadi WHEN audit log dicek THEN action tercatat                         |
| BR-10 | Soft delete untuk data kritikal (user, community, org, event, post)   | Data         | GIVEN data dihapus WHEN deletedAt dicek THEN tidak null                                        |
| BR-11 | User yang suspended tidak bisa login                                  | Auth         | GIVEN user suspended WHEN login THEN ditolak                                                   |
| BR-12 | Admin bisa suspend/activate user, community, organization             | Admin        | GIVEN admin akses entity WHEN suspend/activate THEN status berubah                             |

---

## 4. Scope Summary

### 4.1 In Scope (MVP)

| Module         | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| Public Website | Landing, direktori komunitas/event, detail, about, FAQ, contact, guidelines |
| Authentication | Register, login, logout, forgot/reset password                              |
| Member         | Profil, komunitas, event, bookmark, riwayat, notifikasi                     |
| Community      | CRUD, membership, approval, event, post, galeri                             |
| Organization   | CRUD, team, approval                                                        |
| Event          | CRUD, registrasi, attendance                                                |
| Admin          | Dashboard, approval, user mgmt, role, moderasi, analytics dasar, audit log  |
| RBAC           | 9 role scope-based                                                          |
| API            | REST API v1                                                                 |
| Database       | MySQL + Prisma ORM                                                          |

### 4.2 Out of Scope (Later)

| Feature                       | Reason                                            |
| ----------------------------- | ------------------------------------------------- |
| Payment gateway penuh         | Butuh integrasi payment provider, MVP gratis saja |
| Chat internal                 | Kompleksitas real-time, later scope               |
| Wallet                        | Butuh payment gateway dulu                        |
| Marketplace penuh             | Fitur kompleks, later scope                       |
| Sponsorship marketplace penuh | Butuh brand management dulu                       |
| Venue booking real-time       | Butuh integrasi venue, later scope                |
| Native mobile app             | Web responsive dulu                               |
| Advanced analytics            | Analytics dasar saja di MVP                       |
| Recommendation engine         | Butuh data cukup dulu                             |
| Gamification                  | Later scope                                       |
| Sub community                 | Kompleksitas struktur                             |
| Regional community            | Kompleksitas struktur                             |
| Volunteer management          | Kompleksitas operasional                          |
| CMS / Blog                    | Prioritas rendah                                  |
| Collaboration module          | Butuh brand management dulu                       |
| Brand management              | Later scope                                       |

---

## 5. Success Criteria

| No    | Criteria                                    | Measurement           | Acceptance Criteria                                                                  |
| ----- | ------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| SC-01 | Platform bisa diakses dari mobile & desktop | Responsive testing    | GIVEN user akses dari mobile/desktop WHEN layout dicek THEN responsive dan berfungsi |
| SC-02 | Load time < 3 detik                         | Lighthouse score > 80 | GIVEN Lighthouse audit WHEN score dicek THEN Performance ≥ 80                        |
| SC-03 | Zero critical security vulnerability        | Security audit        | GIVEN security audit WHEN vulnerability dicek THEN zero critical                     |
| SC-04 | All MVP features functional                 | E2E test pass         | GIVEN E2E test dijalankan WHEN result dicek THEN all pass                            |
| SC-05 | Deploy ke Vercel berhasil                   | Production URL active | GIVEN deploy selesai WHEN URL dicek THEN accessible dan berfungsi                    |

---

## 6. Stakeholder

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

## 7. Assumptions

Lihat `docs/requirements/assumptions.md` untuk daftar lengkap.

---

## 8. Constraints

Lihat `docs/requirements/constraints.md` untuk daftar lengkap.

---

## 9. Dependencies

Lihat `docs/requirements/dependencies.md` untuk daftar lengkap.
