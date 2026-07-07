# Success Criteria — KomunaID

| Field       | Value                       |
| ----------- | --------------------------- |
| **Project** | KomunaID                    |
| **Company** | PT Komuna Digital Indonesia |
| **Version** | 1.0 — MVP                   |
| **Date**    | 7 Juli 2026                 |

---

## 1. Product Success Criteria

| No    | Criteria                               | Measurement         | Target    | Acceptance Criteria                                                        |
| ----- | -------------------------------------- | ------------------- | --------- | -------------------------------------------------------------------------- |
| PC-01 | Semua MVP features functional          | E2E test pass rate  | 100%      | GIVEN E2E test dijalankan WHEN result dicek THEN all pass                  |
| PC-02 | User bisa register dan login           | Auth flow test      | 100% pass | GIVEN user register WHEN login THEN dashboard accessible                   |
| PC-03 | Community bisa dibuat dan di-approve   | Community flow test | 100% pass | GIVEN user buat community WHEN admin approve THEN community visible publik |
| PC-04 | Event bisa dibuat dan didaftar         | Event flow test     | 100% pass | GIVEN owner buat event WHEN member register THEN registrasi confirmed      |
| PC-05 | RBAC berfungsi untuk semua role        | Permission test     | 100% pass | GIVEN user dengan role tertentu WHEN akses resource THEN permission sesuai |
| PC-06 | Notifikasi muncul untuk action penting | Notification test   | 100% pass | GIVEN action terjadi WHEN notification dicek THEN notifikasi muncul        |
| PC-07 | Admin bisa approve/reject entity       | Admin flow test     | 100% pass | GIVEN entity pending WHEN admin approve/reject THEN status berubah         |
| PC-08 | Audit log mencatat action penting      | Audit test          | 100% pass | GIVEN action penting WHEN audit log dicek THEN action tercatat             |
| PC-09 | Report abuse bisa submit dan resolve   | Report flow test    | 100% pass | GIVEN user submit report WHEN admin resolve THEN status berubah            |
| PC-10 | Contact form bisa submit               | Contact test        | 100% pass | GIVEN guest submit contact WHEN form valid THEN pesan tersimpan            |

---

## 2. Technical Success Criteria

| No    | Criteria             | Measurement                     | Target     | Acceptance Criteria                                                    |
| ----- | -------------------- | ------------------------------- | ---------- | ---------------------------------------------------------------------- |
| TC-01 | Performance          | Lighthouse Performance Score    | ≥ 80       | GIVEN Lighthouse audit WHEN score dicek THEN Performance ≥ 80          |
| TC-02 | Accessibility        | Lighthouse Accessibility Score  | ≥ 90       | GIVEN Lighthouse audit WHEN score dicek THEN Accessibility ≥ 90        |
| TC-03 | SEO                  | Lighthouse SEO Score            | ≥ 90       | GIVEN Lighthouse audit WHEN score dicek THEN SEO ≥ 90                  |
| TC-04 | Best Practices       | Lighthouse Best Practices Score | ≥ 90       | GIVEN Lighthouse audit WHEN score dicek THEN Best Practices ≥ 90       |
| TC-05 | Security             | Security audit                  | 0 critical | GIVEN security audit WHEN vulnerability dicek THEN zero critical       |
| TC-06 | Responsive           | Mobile & Desktop testing        | 100%       | GIVEN user akses dari mobile/desktop WHEN layout dicek THEN responsive |
| TC-07 | API Response Time    | Average response time           | < 500ms    | GIVEN API endpoint WHEN response time dicek THEN < 500ms               |
| TC-08 | Database Performance | Query execution time            | < 100ms    | GIVEN database query WHEN execution time dicek THEN < 100ms            |
| TC-09 | Error Rate           | Application error rate          | < 1%       | GIVEN application running WHEN error rate dicek THEN < 1%              |
| TC-10 | Uptime               | Platform availability           | ≥ 99.5%    | GIVEN platform running WHEN uptime dicek THEN ≥ 99.5%                  |
| TC-11 | TypeScript           | Strict mode compliance          | 100%       | GIVEN codebase WHEN TypeScript strict mode dicek THEN 0 any types      |
| TC-12 | Code Quality         | ESLint pass rate                | 100%       | GIVEN linting WHEN result dicek THEN 0 errors                          |
| TC-13 | Test Coverage        | Unit + Integration test         | ≥ 70%      | GIVEN test run WHEN coverage dicek THEN ≥ 70%                          |
| TC-14 | Build Success        | Production build                | 100%       | GIVEN build command WHEN result dicek THEN success                     |
| TC-15 | Type Safety          | Prisma client generation        | 100%       | GIVEN prisma generate WHEN result dicek THEN no errors                 |

---

## 3. Business Success Criteria

| No    | Criteria            | Measurement               | Target              | Acceptance Criteria                                                        |
| ----- | ------------------- | ------------------------- | ------------------- | -------------------------------------------------------------------------- |
| BC-01 | User Registration   | Registrasi/bulan          | 500 user/bulan      | GIVEN platform launch WHEN 1 bulan berlalu THEN ≥ 500 user terdaftar       |
| BC-02 | Community Adoption  | Total komunitas           | 50 komunitas        | GIVEN platform launch WHEN 3 bulan berlalu THEN ≥ 50 komunitas approved    |
| BC-03 | Event Activity      | Total event               | 100 event           | GIVEN platform launch WHEN 3 bulan berlalu THEN ≥ 100 event terdaftar      |
| BC-04 | Approval Efficiency | Response time             | < 24 jam            | GIVEN komunitas/organisasi submit WHEN admin review THEN response < 24 jam |
| BC-05 | User Retention      | Return rate               | > 30% dalam 30 hari | GIVEN user register WHEN 30 hari berlalu THEN > 30% user login kembali     |
| BC-06 | Community Growth    | Member per community      | ≥ 20 avg            | GIVEN community active WHEN 3 bulan berlalu THEN avg member ≥ 20           |
| BC-07 | Event Attendance    | Check-in rate             | ≥ 60%               | GIVEN event berlangsung WHEN check-in dicek THEN ≥ 60% hadir               |
| BC-08 | Admin Response      | Approval queue cleared    | < 24 jam            | GIVEN admin login WHEN queue dicek THEN semua pending < 24 jam             |
| BC-09 | Platform Stability  | Downtime incidents        | < 3/bulan           | GIVEN platform running WHEN incident dicek THEN < 3/bulan                  |
| BC-10 | Support Response    | User complaint resolution | < 48 jam            | GIVEN user complaint WHEN resolve dicek THEN < 48 jam                      |

---

## 4. Launch Readiness Criteria

| No    | Criteria            | Measurement         | Target   | Acceptance Criteria                                                       |
| ----- | ------------------- | ------------------- | -------- | ------------------------------------------------------------------------- |
| LR-01 | Deployment Success  | Production URL      | Active   | GIVEN deploy selesai WHEN URL dicek THEN accessible                       |
| LR-02 | SSL Certificate     | HTTPS               | Active   | GIVEN domain dicek WHEN SSL dicek THEN valid & active                     |
| LR-03 | DNS Configuration   | Domain resolution   | Active   | GIVEN domain dicek WHEN DNS dicek THEN resolve ke production              |
| LR-04 | Database Production | MySQL connection    | Active   | GIVEN app running WHEN DB connection dicek THEN connected                 |
| LR-05 | Email Service       | Transactional email | Active   | GIVEN reset password WHEN email dicek THEN terkirim < 60 detik            |
| LR-06 | File Upload         | S3/Vercel Blob      | Active   | GIVEN upload avatar WHEN file dicek THEN tersimpan                        |
| LR-07 | Seed Data           | Default data        | Loaded   | GIVEN platform launch WHEN seed data dicek THEN ≥ 10 communities, events  |
| LR-08 | Admin Account       | Default admin       | Active   | GIVEN admin login WHEN credential dicek THEN bisa akses dashboard         |
| LR-09 | Error Monitoring    | Error tracking      | Active   | GIVEN error terjadi WHEN monitoring dicek THEN tercatat                   |
| LR-10 | Backup System       | Database backup     | Active   | GIVEN backup schedule WHEN backup dicek THEN terkonfigurasi               |
| LR-11 | CI/CD Pipeline      | GitHub Actions      | Active   | GIVEN push to main WHEN pipeline dicek THEN build & test pass             |
| LR-12 | Documentation       | SDLC docs           | Complete | GIVEN docs review WHEN completeness dicek THEN semua tahap terdokumentasi |
| LR-13 | Security Checklist  | Security review     | Passed   | GIVEN security checklist WHEN review dicek THEN all items pass            |
| LR-14 | Performance Check   | Lighthouse audit    | ≥ 80     | GIVEN Lighthouse audit WHEN score dicek THEN Performance ≥ 80             |
| LR-15 | Cross-browser       | Browser testing     | Pass     | GIVEN testing WHEN browser dicek THEN Chrome, Firefox, Safari, Edge pass  |

---

## 5. Quality Gates

### 5.1 Definition of Done (DoD)

| Item             | Criteria                                       |
| ---------------- | ---------------------------------------------- |
| Code Complete    | Semua fitur terimplementasi sesuai requirement |
| Code Review      | Semua code sudah di-review dan approve         |
| Unit Test        | Semua unit test pass                           |
| Integration Test | Semua integration test pass                    |
| E2E Test         | Semua E2E test pass                            |
| Lint Pass        | 0 ESLint errors                                |
| Type Check       | 0 TypeScript errors                            |
| Documentation    | Dokumentasi terupdate                          |
| Deployment       | Berhasil deploy ke staging                     |

### 5.2 Definition of Ready (DoR)

| Item                | Criteria                                 |
| ------------------- | ---------------------------------------- |
| Requirement Clear   | Requirement sudah jelas dan tidak ambigu |
| Design Available    | UI/UX design tersedia                    |
| API Spec            | API specification tersedia               |
| Database Schema     | Database schema sudah final              |
| Acceptance Criteria | Acceptance criteria sudah didefinisikan  |
| Priority Set        | Prioritas sudah ditentukan               |

---

## 6. Metrics Dashboard

### 6.1 Product Metrics

| Metric                 | Current | Target | Status         |
| ---------------------- | ------- | ------ | -------------- |
| Features Implemented   | 0       | 80+    | 🔴 Not Started |
| E2E Test Pass Rate     | 0%      | 100%   | 🔴 Not Started |
| Unit Test Coverage     | 0%      | ≥ 70%  | 🔴 Not Started |
| Lighthouse Performance | —       | ≥ 80   | 🔴 Not Started |

### 6.2 Business Metrics (Post-Launch)

| Metric                 | Current | Target     | Status          |
| ---------------------- | ------- | ---------- | --------------- |
| Total Users            | 0       | 500/month  | 🔴 Not Launched |
| Total Communities      | 0       | 50         | 🔴 Not Launched |
| Total Events           | 0       | 100        | 🔴 Not Launched |
| Approval Response Time | —       | < 24 hours | 🔴 Not Launched |
| User Retention         | —       | > 30%      | 🔴 Not Launched |

---

## 7. References

| Document                    | Path                                               |
| --------------------------- | -------------------------------------------------- |
| BRD                         | `docs/requirements/brd.md`                         |
| Feature Requirements        | `docs/requirements/feature-requirements.md`        |
| Non-Functional Requirements | `docs/requirements/non-functional-requirements.md` |
| Project Brief               | `docs/product/project-brief.md`                    |
| Problem Statement           | `docs/product/problem-statement.md`                |
| Project Objective           | `docs/product/project-objective.md`                |
