# 18 — Technical Debt

> KomunaID Super Admin MVP — Platform Governance Module

---

## Kategori

1. **Infrastructure** — Hal-hal terkait deployment, CI/CD, monitoring
2. **Code Quality** — Refactoring, pola yang perlu diperbaiki
3. **Performance** — Optimasi yang belum dilakukan
4. **Security** — Peningkatan keamanan yang tertunda
5. **Testing** — Cakupan testing yang kurang

---

## 1. Infrastructure

### INF-001: Belum Ada CI/CD Pipeline

**Prioritas:** High
**Estimasi:** 2 minggu
**Dampak:** Deploy manual berisiko human error. Tidak ada automated testing sebelum deploy.

**Deskripsi:**
Tidak ada pipeline otomatis untuk lint, typecheck, test, build, dan deploy. Semua dilakukan manual oleh developer.

**Solusi:**
- Buat GitHub Actions workflow
- Trigger on push ke main
- Steps: install, lint, typecheck, test, build, deploy
- Tambahkan status check di PR

---

### INF-002: Belum Ada Staging Environment

**Prioritas:** High
**Estimasi:** 1 minggu
**Dampak:** Testing langsung di production. Bug bisa sampai ke user.

**Deskripsi:**
Tidak ada environment staging terpisah untuk testing sebelum deploy ke production.

**Solusi:**
- Buat environment staging di Vercel (apps/web) dan Railway/Fly.io (apps/api)
- Buat database staging terpisah
- Konfigurasi environment variables terpisah

---

### INF-003: Belum Ada Monitoring & Alerting

**Prioritas:** High
**Estimasi:** 1 minggu
**Dampak:** Error tidak terdeteksi hingga user melapor. Tidak ada visibility ke production.

**Deskripsi:**
Tidak ada monitoring aplikasi (error tracking, performance monitoring, uptime monitoring).

**Solusi:**
- Integrasi Sentry untuk error tracking
- Integrasi APM (New Relic / Datadog / Vercel Analytics)
- Setup uptime monitoring (BetterStack / UptimeRobot)
- Setup alerting ke Slack/Email

---

### INF-004: Belum Ada Logging Aggregation

**Prioritas:** Medium
**Estimasi:** 3 hari
**Dampak:** Sulit debugging production issues. Log tersebar di multiple server.

**Deskripsi:**
Log ditulis ke stdout/file lokal. Tidak ada centralized logging.

**Solusi:**
- Integrasi Pino dengan logging service (BetterStack / Logtail)
- Atau gunakan cloud logging (GCP Cloud Logging / AWS CloudWatch)

---

### INF-005: Blue-Green Deployment Belum Diimplementasi

**Prioritas:** Medium
**Estimasi:** 1 minggu
**Dampak:** Deploy menyebabkan downtime beberapa detik.

**Deskripsi:**
Deploy menghentikan service lama sebelum memulai yang baru. Ada jeda singkat di mana service tidak tersedia.

**Solusi:**
- Implementasi zero-downtime deployment dengan rolling update
- Atau gunakan blue-green deployment dengan load balancer

---

## 2. Code Quality

### CQ-001: Tidak Ada Error Boundaries di Frontend

**Prioritas:** Medium
**Estimasi:** 2-3 hari
**Dampak:** Error di satu komponen bisa merusak seluruh halaman.

**Deskripsi:**
React error boundaries belum diimplementasikan di admin panel. Error di satu komponen bisa crash seluruh page.

**Solusi:**
- Buat `ErrorBoundary` component
- Wrap setiap page dengan error boundary
- Tampilkan fallback UI yang informatif

---

### CQ-002: Duplikasi Logic Antara Service dan Repository

**Prioritas:** Low
**Estimasi:** 1 minggu
**Dampak:** Maintenance sulit. Perubahan di satu tempat harus diulang di tempat lain.

**Deskripsi:**
Beberapa business logic bocor ke repository layer. Service layer kadang hanya melewati data tanpa transformasi.

**Solusi:**
- Review dan refactor: pastikan repository hanya handle database operations
- Service layer handle semua business logic dan validation
- Buat shared utility functions untuk transformasi data

---

### CQ-003: Tidak Ada DTO (Data Transfer Object)

**Prioritas:** Low
**Estimasi:** 1 minggu
**Dampak:** Risk data leakage. Response bisa meng-expose field yang tidak seharusnya.

**Deskripsi:**
Response API langsung mengembalikan Prisma model tanpa mapping ke DTO. Field sensitif bisa bocor.

**Solusi:**
- Buat DTO types untuk setiap entity
- Map Prisma model ke DTO di service layer
- Gunakan `select` atau `omit` di Prisma query

---

### CQ-004: Inconsistent Naming Convention

**Prioritas:** Low
**Estimasi:** 2-3 hari
**Dampak:** Kode sulit dibaca dan dipahami.

**Deskripsi:**
Beberapa file menggunakan camelCase, beberapa menggunakan PascalCase untuk nama yang sama. Konsistensi naming belum di-enforce.

**Solusi:**
- Definisikan naming convention di AGENTS.md
- Files: `kebab-case.ts` (Next.js) atau `camelCase.ts`
- Components: `PascalCase.tsx`
- Services: `camelCase.service.ts`
- Repositories: `camelCase.repository.ts`

---

### CQ-005: Tidak Ada API Response Types

**Prioritas:** Medium
**Estimasi:** 2-3 hari
**Dampak:** Frontend tidak punya type safety untuk API response.

**Deskripsi:**
Frontend tidak share types dengan backend. API response types didefinisikan ulang di frontend.

**Solusi:**
- Generate types dari Zod schemas (zod-to-openapi atau similar)
- Atau share types dari packages/shared
- Auto-generate TypeScript types dari Prisma schema

---

## 3. Performance

### PERF-001: Belum Ada Caching

**Prioritas:** High
**Estimasi:** 1 minggu
**Dampak:** Response time lambat untuk data yang jarang berubah. Database load tinggi.

**Deskripsi:**
Tidak ada caching layer. Semua request langsung query database. Data statis seperti master data, settings, dan roles di-query setiap request.

**Solusi:**
- Setup Redis untuk caching
- Cache master data (TTL: 1 jam)
- Cache settings (TTL: 5 menit)
- Cache dashboard stats (TTL: 1 menit)
- Invalidate cache saat data berubah

---

### PERF-002: Query N+1 Problem

**Prioritas:** Medium
**Estimasi:** 2-3 hari
**Dampak:** Banyak query ke database untuk list view. Response time meningkat seiring jumlah data.

**Deskripsi:**
Beberapa endpoint melakukan query berulang untuk data terkait (N+1 problem). Contoh: query users, lalu query communities untuk setiap user.

**Solusi:**
- Gunakan Prisma `include` atau `select` untuk eager loading
- Review semua list endpoints
- Gunakan `Promise.all` untuk parallel queries

---

### PERF-003: Pagination Tidak Konsisten

**Prioritas:** Low
**Estimasi:** 1 hari
**Dampak:** UX buruk. User tidak tahu ada berapa halaman.

**Deskripsi:**
Beberapa endpoint mengembalikan pagination lengkap (page, limit, total, totalPages), beberapa hanya mengembalikan data tanpa metadata.

**Solusi:**
- Standardisasi response format pagination
- Pastikan semua list endpoints mengembalikan pagination metadata
- Buat helper function `buildPaginationResponse()`

---

### PERF-004: Tidak Ada Database Indexing Optimization

**Prioritas:** Medium
**Estimasi:** 2-3 hari
**Dampak:** Query lambat untuk table besar. Full table scan terjadi.

**Deskripsi:**
Index di Prisma schema sudah cukup, tapi belum di-analyze untuk query patterns yang sebenarnya. Beberapa query mungkin tidak menggunakan index yang tersedia.

**Solusi:**
- Jalankan `EXPLAIN` untuk semua query di list endpoints
- Tambahkan index berdasarkan query patterns
- Hapus index yang tidak digunakan
- Setup slow query log di MySQL

---

## 4. Security

### SEC-001: Tidak Ada 2FA

**Prioritas:** High
**Estimasi:** 1 minggu
**Dampak:** Akun Super Admin rentan jika password bocor.

**Deskripsi:**
Super Admin tidak diwajibkan menggunakan two-factor authentication. Akun admin sangat sensitive dan perlu perlindungan ekstra.

**Solusi:**
- Implementasi TOTP (Time-based One-Time Password)
- Gunakan library seperti `otplib` atau `speakeasy`
- Buat setup flow: generate secret → show QR code → verify code → enable 2FA
- Buat login flow: password → 2FA code → token

---

### SEC-002: Tidak Ada Rate Limiting Per-Endpoint

**Prioritas:** Medium
**Estimasi:** 2-3 hari
**Dampak:** Endpoint tertentu bisa di-abuse dengan rate limit yang sama untuk semua endpoint.

**Deskripsi:**
Rate limiting diterapkan global (100/user/min). Beberapa endpoint sensitif (force-logout, broadcast) perlu rate limit yang lebih ketat.

**Solusi:**
- Buat rate limit config per endpoint
- Force logout: 10/user/hour
- Broadcast: 5/user/hour
- Reset password: 3/user/hour

---

### SEC-003: JWT Token Tidak ada Revocation

**Prioritas:** Medium
**Estimasi:** 3 hari
**Dampak:** Token yang sudah di-force-logout masih bisa digunakan hingga expired.

**Deskripsi:**
Setelah force logout, JWT token masih valid hingga expiry time. Tidak ada mekanisme untuk membatalkan token yang sudah dikeluarkan.

**Solusi:**
- Implementasi token blacklist di Redis
- Atau gunasi refresh token pattern
- Short-lived access token (15 menit) + long-lived refresh token (7 hari)

---

### SEC-004: Tidak ada Input Sanitization yang Komprehensif

**Prioritas:** Medium
**Estimasi:** 2-3 hari
**Dampak:** Risk XSS di CMS content dan user inputs.

**Deskripsi:**
CMS content menggunakan raw HTML. Tidak ada sanitization untuk mencegah XSS melalui user-generated content.

**Solusi:**
- Gunakan DOMPurify untuk sanitasi HTML content
- Sanitize semua user input sebelum disimpan
- Gunakan Content-Security-Policy header

---

## 5. Testing

### TEST-001: Tidak Ada Unit Tests

**Prioritas:** High
**Estimasi:** 2 minggu
**Dampak:** Regression bug tidak terdeteksi. Refactoring berisiko.

**Deskripsi:**
Tidak ada unit tests untuk service layer, repository layer, dan utility functions.

**Solusi:**
- Setup Vitest atau Jest
- Tulis unit tests untuk semua services
- Target: 80% code coverage untuk business logic
- Jalankan tests di CI/CD pipeline

---

### TEST-002: Tidak Ada Integration Tests

**Prioritas:** High
**Estimasi:** 1 minggu
**Dampak:** API behavior tidak terverifikasi secara end-to-end.

**Deskripsi:**
Tidak ada integration tests yang menguji API endpoints secara utuh (request → middleware → handler → database → response).

**Solusi:**
- Setup integration test dengan test database
- Gunakan Vitest atau Jest dengan Supertest
- Tulis tests untuk semua admin endpoints
- Test happy path dan error scenarios

---

### TEST-003: Tidak Ada E2E Tests

**Prioritas:** Medium
**Estimasi:** 2 minggu
**Dampak:** User workflow tidak terverifikasi secara end-to-end.

**Deskripsi:**
Tidak ada E2E tests yang menguji user workflow di browser.

**Solusi:**
- Setup Playwright atau Cypress
- Tulis E2E tests untuk critical paths:
  - Login sebagai admin
  - Suspend user
  - Approve komunitas
  - Broadcast notifikasi
  - Edit CMS page

---

### TEST-004: Tidak Ada Load Testing

**Prioritas:** Low
**Estimasi:** 2-3 hari
**Dampak:** Performance di bawah load tidak diketahui.

**Deskripsi:**
Tidak ada load testing untuk memverifikasi performance di bawah traffic tinggi.

**Solusi:**
- Setup k6 atau Artillery
- Test scenarios:
  - 100 concurrent users akses dashboard
  - 50 concurrent users search users
  - 10 concurrent users perform heavy queries
- Identify bottleneck dan optimize

---

## Prioritas Summary

| Prioritas | Item | Estimasi Total |
|-----------|------|----------------|
| **High** | INF-001, INF-002, INF-003, PERF-001, SEC-001, TEST-001, TEST-002 | ~7 minggu |
| **Medium** | INF-004, INF-005, CQ-001, CQ-005, PERF-002, PERF-004, SEC-002, SEC-003, SEC-004, TEST-003 | ~8 minggu |
| **Low** | CQ-002, CQ-003, CQ-004, PERF-003, TEST-004 | ~4 minggu |

---

## Rekomendasi Prioritas

### Sprint 1 (Minggu 1-2)
- INF-001: CI/CD Pipeline
- INF-002: Staging Environment
- TEST-001: Unit Tests (setup + critical paths)

### Sprint 2 (Minggu 3-4)
- INF-003: Monitoring & Alerting
- PERF-001: Caching Layer
- SEC-001: 2FA

### Sprint 3 (Minggu 5-6)
- TEST-002: Integration Tests
- PERF-002: N+1 Query Fix
- SEC-003: JWT Revocation

### Sprint 4 (Minggu 7-8)
- INF-004: Logging Aggregation
- CQ-001: Error Boundaries
- CQ-005: API Response Types
- TEST-003: E2E Tests
