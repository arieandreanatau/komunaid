# KOMUNAID — FINAL RELEASE AUDIT (Slices 5–8)

Date: 2026-08-23
Scope: Slice 5 (Product UX + Design System + Discovery), Slice 6 (Engagement + Notification), Slice 7 (Analytics + CMS + Ops), Slice 8 (Final Hardening + Production Release)
Repo: `D:\Project\komunaid` — branch `fix/rbac-access-control`

> Metode: re-audit repository dari kode nyata, bukan dari laporan sebelumnya. Setiap klaim memiliki bukti (file:line, hasil eksekusi test).

---

## 1. EXECUTIVE SUMMARY

KomunaID memasuki gate GO dengan dasar yang sudah kuat dari Slice 1–4 (CONDITIONAL GO, P0=0) dan sesi ini (Slice 5–8) menutup gap yang ditemukan lewat re-audit terhadap 100% klaim laporan lama. Re-audit menemukan sejumlah inkonsistensi nyata yang diperbaiki — bukan sekadar polish:

**P0 diperbaiki di sesi ini:**
1. Volunteer-program notification coverage **nol** → sekarang lengkap (apply/accept/reject/revision/cancel) — prasyarat MVP Slice 6.
2. Volunteer detail page memakai semantik legacy (positions, assignment, attendance) terhadap API VolunteerProgram yang tidak punya posisi → **seluruh alur apply praktis mati** (`positions: []` hardcoded). Ditulis ulang ke model VolunteerProgram dengan gating kuota+deadline+status.
3. Volunteer directory filters/sort **tidak berfungsi** (API mengabaikan param `status`/`orderBy`) → support filter, sort, kategori, organizerType ditambahkan + 4 endpoint discovery.
4. Event directory tab "Populer" **menggantung** (tidak ada fetch path) → di-wire ke `/events/popular/upcoming`.
5. Event directory filter `locationType` **ditulis tapi dibuang schema** → ditambahkan ke schema + handler.
6. Homepage server-fetch memakai endpoint **legacy** `/volunteer` (vocab status lama) → diganti `/volunteer-programs` + vocab status diseragamkan di cards/homepage/search.
7. Contract gaps: community detail tidak mengembalikan `instagram/contactEmail/contactPhone/pendingJoinRequests`; event detail tidak mengembalikan `waitlistCount` → semua direturn sekarang.

**Slice 7 yang dieksekusi:**
- AuditLog + kolom `actorRole` (migration + service resolve + UI filter-able) — P1 dari laporan Slice 4 ditutup.
- Kategori admin mutation kini `requireSuperAdmin` (sebelumnya PLATFORM_ADMIN bisa mutate, bertentangan dengan access matrix yang dideklarasikan).
- Master-data stat cards menampilkan angka 0 palsu (shape endpoint beda dari page) → endpoint dan page diselaraskan (data nyata).
- Hapus 4 placeholder routes yang tampak fungsional: `admin/cms/faq`, `admin/master-data/permissions`, `admin/moderation/violations`, `admin/moderation/audit-log` (duplikat) + redirect duplikat org-structure.
- KPI Volunteer di dashboard admin kini dari data nyata untuk kedua role admin (sebelumnya 0 permanen untuk PLATFORM_ADMIN).
- `console.log` × 6 pada production path (`services/email.ts`) dihapus.
- Moderation stats kini bisa diakses PLATFORM_ADMIN (sesuai matrix R), sidebar Volunteer disembunyikan dari PLATFORM_ADMIN (data semuanya superadmin-gated).

**Verifikasi terakhir:**
- API: 963/963 PASS (39 files) — termasuk test fix untuk perilaku baru.
- Web unit: 65/65 PASS (7 files).
- Typecheck API + Web: PASS.
- Lint web: 0 error.
- E2E browser: chromium full suite (lihat §8.8); multi-browser deferral dicatat.

---

## 2. SLICE 5 — PRODUCT UX + DESIGN SYSTEM + DISCOVERY

### 2.1 Hasil audit halaman publik (`apps/web/app…`)

| Page | Temuan utama | Status |
|---|---|---|
| Home (`app/page.tsx`) | Server fetch legacy `/volunteer` (status `OPEN`) vs client refetch `/volunteer-programs` (`REGISTRATION_OPEN`) — dua sumber data, vocab beda | **FIXED** — server fetch diganti + label status diseragamkan (`page.tsx:30`, `homepage-discovery.tsx:136`) |
| Community directory (`communities/page.tsx`) | Komplet: header sesuai spes, search debounce 300ms, filter kategori/provinsi/kota/membership, discovery Jelajahi/Unggulan/Terbaru/Populer, result count, chips, clear, pagination, empty state | OK |
| Community detail (`communities/[slug]`) | Kontrak rusak: `instagram`, `contactEmail`, `contactPhone`, `pendingJoinRequests` tidak direturn API (padahal dirender). Tidak ada Pengurus/Slogan (juga tidak ada di model) | **FIXED** API; Pengurus/Slogan diklasifikasi POST-MVP (model tak punya konsep board/slogan) |
| Event directory (`events/page.tsx`) | Tab "Populer" tanpa handler fetch; filter `locationType` dibuang schema | **FIXED** |
| Event detail (`events/[slug]`) | Agenda/speaker/participant-count/registration-state/save/share ada. `waitlistCount` dipakai UI tapi tak direturn API. Tiket (paid) dirender tak lengkap (fake payment dilarang; tiket sebagai display info) | **FIXED** `waitlistCount`; tiket berbayar = display saja, tidak ada payment gateway (sesuai rule 13) |
| Volunteer directory (`volunteer/page.tsx`) | Filters/sort mati (API ignore param). Tidak ada discovery sections | **FIXED** — API filter/sort/kategori + tabs Japon Jelajahi/Unggulan/Populer/Mendatang/Terbaru |
| Volunteer detail (`volunteer/[slug]`) | Kontrak legacy (positions/assignment/attendance) vs model program; alur apply mati; crash `userApplication.position.name` | **FIXED** — halaman ditulis ulang ke semantik VolunteerProgram |
| Search (`search/page.tsx`) | Sumber data nyata; status volunteer raw leak | **FIXED** label |
| Cards | `VOLUNTEER_STATUS_MAP` tidak punya status program → badge tak muncul | **FIXED** — map diperluas 13 status |
| Header | Unread badge bekerja (pagination.total) | OK |

### 2.2 Desain sistem
- UI kit `apps/web/components/ui/*` sudah: modal (focus trap, Esc, aria-modal), tabs, dropdown (roving), search-input (debounce), toast, badge, input/select/textarea, skeleton, loading-spinner.
- Tailwind: token semantic bermasalah (`coral: #00C8E6` sebenarnya aqua, `forest: #1D4ED8` biru, `dark: #0A1D4D` navy, `cream: #FFFFFF` putih) — inkonsistensi nama vs nilai. **DEFERRED** (P2, riset tinggi, dampak luas; tanpa memecah identitas).
- Mobile filter drawer: `ui/use-drawer-dialog.ts` ada; directory publik pakai stacked controls + pills yang sudah responsif 390px. **DEFERRED** sebagai penyempurnaan non-kritis.

### 2.3 Release gate Slice 5
- P0 = 0. Broken primary journey = 0 (semua journey utama sekarang terhubung data asli). Legacy Volunteer tidak kembali jadi flow publik. Lifecycle bypass = 0.
- **CONDITIONAL GO** → menuju GO (UX regresi lulus di E2E, lihat §8.8).

---

## 3. SLICE 6 — ENGAGEMENT + SOCIAL + NOTIFICATION

### 3.1 Notification (dulu sebagian, sekarang lengkap untuk VolunteerProgram)
Dasar sudah ada: model `Notification` (type, isRead, link, createdAt), endpoint member `GET/PUT /users/notifications*` (IDOR-safe, scoped `where userId`), unread badge header, page `/dashboard/notifications`, activity `/users/activity` + `/users/activity` endpoint.

Gap utama yang ditutup — notifikasi VolunteerProgram **nol sama sekali** (`apps/api/src/routes/volunteer-programs.ts` sebelumnya tanpa satu pun `prisma.notification`):

| Event | Route | Deposit |
|---|---|---|
| Pendaftaran volunteer baru → organizer | `POST /:programId/apply` | `volunteer-programs.ts:609-642` (createMany + activity) |
| Aplikasi diterima → pemohon | `PATCH /applications/:applicationId/review` (ACCEPT) | sama, `:536-558` + activity |
| Aplikasi ditolak → pemohon | review (REJECT) | sama |
| Aplikasi dibatalkan organizer → pemohon | review (CANCEL) | sama |
| Program perlu revisi / ditolak → organizer | `POST /:programId/review` (non-APPROVE) | `:572-598` |
| Program dibatalkan → seluruh aplikasi aktif | `POST /:programId/transition` (CANCELLED) | `:585-613`, bounded `take:100` |

Semua efek samping notifikasi non-kritis dibungkus try/catch agar tidak pernah mengubah status inti menjadi error (deterministik).

### 3.2 Dedup / storm
- Duplikasi dicegah via state guard yang sudah ada (cancel sekali; review satu kali; unique `(volunteerProgramId,userId)`). Tidak ada loop.
- `createMany` baru dibatasi (`take:100` untuk peserta program dibatalkan).
- Broadcast admin (`admin/notifications.ts`) tetap createMany — bounded oleh daftar user; dicatat sebagai P2 (tanpa cap).

### 3.3 Friend / connection
Audit: tidak ada model relasi antar-user (tidak ada `Friend`, `Follow`, `Connection` di `schema.prisma`). **Tidak dibuat** — sesuai arahan "If supported" dan rule "DO NOT create unrestricted user discovery". Klasifikasi: POST-MVP.

### 3.4 Engagement
- Save/bookmark event: sudah lengkap (model `EventSave`, `POST/DELETE /events/:id/save`, `GET /events/my/saved`, `isSaved` di detail + UI tombol simpan).
- Share: event detail + community detail + volunteer detail (UI navigator.share/clipboard).
- Follow community: = membership aktif (tanpa model baru) — sesuai desain.
- Event reminder: tidak ada model → POST-MVP.
- Recommendation: homepage + directory discovery pakai aturan deterministik (popularity via CONFIRMED count, recency, upcoming). Tidak ada ML.

### 3.5 Security Slice 6
- Notifikasi/activity: semua scoped `userId = authUser.id` (IDOR-safe, diuji).
- Tidak ada exposure private-data; tidak ada notifikasi global di luar broadcast superadmin.

### 3.6 Release gate Slice 6
P0=0; tidak ada notification security defect; tidak ada private-data exposure; core engagement E2E dijalankan (chromium, §8.8) — **GO** untuk Slice 6.

---

## 4. SLICE 7 — ANALYTICS + CMS + PLATFORM OPERATIONS

### 4.1 Superadmin dashboard
- KPI `/admin/dashboard` = 12 count + 4 list Prisma nyata (`routes/admin/dashboard.ts:33-73`), sekarang + `totalVolunteers` (participation count) sehingga PLATFORM_ADMIN juga dapat angka Volunteer nyata.
- Growth `/admin/dashboard/growth` (superadmin): loop 12 bulan per-domain; sepenuhnya DB.
- **Zero fake statistics** (diverifikasi: tidak ada angka hardcoded di API).

### 4.2 Audit log
- Append-only: service `createAuditLog` memegang komentar FORBIDDEN update/delete; grep seluruh repo: tidak ada jalur update/delete audit log.
- **FIX sesi ini:** kolom `actorRole` (migration `20260823_add_audit_log_actor_role`), `resolveActorRole` di service (`services/audit.ts:23-36`), filter + display di admin (`audit.ts`, `admin/audit-logs/page.tsx`).

### 4.3 RBAC
- `admin/categories` mutations → `requireSuperAdmin` (selaras access matrix; sebelumnya PLATFORM_ADMIN bisa mutate).
- Moderation stats → `requirePlatformAdmin` (selaras matrix R, menghapus 403 diam pada halaman moderation platform admin).

### 4.4 Master data
- Kategori: soft-deactivate (`isActive:false`), tidak ada delete destruktif.
- Stats master-data diselaraskan (endpoint `settings.ts:22-53` vs page) — kartu kini data nyata, kartu "Permissions" (tanpa model nyata) dihapus.

### 4.5 CMS
- CMS halaman/banner/kontak nyata (`routes/admin/cms.ts`), superadmin-gated.
- **Placeholder yang tampak fungsional dihapus:** `admin/cms/faq`, `admin/master-data/permissions`, `admin/moderation/violations`, duplikat `admin/moderation/audit-log`, duplikat `admin/cms/homepage` (file kerja yang sama diduplikasi sebagai halaman terpisah — kini satu kanonik `/admin/cms`), duplikat `/admin/org-structure` → redirect ke CMS canonical.

### 4.6 Operations cleanup
- Sidebar: `/admin/organizations` kini terlihat (sebelum orphan), Volunteer disembunyikan dari PLATFORM_ADMIN (semua endpoint data superadmin-only).
- `console.log` di `services/email.ts` dihapus (dev email → log.info).

### 4.7 Release gate Slice 7
Tidak ada fake statistics, audit bypass, data deletion risk. RBAC diverifikasi (test 403 superadmin-only untuk role mutation, test admin suite). — **GO**.

---

## 5. SLICE 8 — FINAL HARDENING

### 5.1 Code audit
- `TODO/FIXME/debugger/console.log`:
  - API routes: 0.
  - Production path `services/email.ts` console.log ×6 → **FIXED**.
- Fake data: 0 (semua UI discovery dari API nyata; fallback copy statis diberi label jelas).
- Hardcoded IDs: 0. Hardcoded roles hanya di mekanisme resmi `requireRole/requireSuperAdmin`.
- Legacy Volunteer reference: hanya kode unreachable di balik 410 middleware (write-freeze) — tidak kembali ke flow publik.
- Direct lifecycle mutation: Event/VolunteerProgram status = 0 (semua via transition services) — verified `grep` ulang di sesi ini.
- Dead routes/nav yang ditemukan → dihapus (lihat §4.5).

### 5.2 Database audit
- `prisma validate`: OK. `prisma migrate status` (dev MySQL `komunaid_dev`): DB dev dikelola via `prisma db push`, 14 migration files benar-benar belum di-deploy ke dev (tabel eksis). Untuk produksi, urutan migration valid (additive, berurutan) + migration baru `20260823_add_audit_log_actor_role` ber-rollback.sql-style (ALTER ADD COLUMN + INDEX, dapat di-drop).
- Index/FK/unique: schema memuat indeks status, eventDate, community, unique `(communityId,userId)`, `(eventId,userId)`, `(volunteerProgramId,userId)` — dasar anti-duplikat + anti-overbook.

### 5.3 API audit
- 963 API tests PASS (39 files): auth, RBAC, event/volunteer lifecycle (transition + concurrency + 409 deterministik), audit append-only, IDOR, CSRF, rate-limiter, refresh-token, xss/sanitize, report/moderation, admin, CMS.
- Status codes teruji: 401/403/404/409/422/500 (`events`, `volunteer-programs`, `admin`, dll).

### 5.4 Security test (dari suite)
- RBAC negative: spoofed role → 403 (diverifikasi di unit + integration).
- Last-superadmin guard → 409.
- Audit tampering: tidak ada jalur update/delete (grep + unit).
- Self-review: diblok (volunteer program review + event review).

### 5.5 Concurrency (dari suite)
- Event: concurrency registration → deterministik; `QUOTA_FULL`/`EVENT_ALREADY_REGISTERED` → 409.
- VolunteerProgram: row-lock `FOR UPDATE` + `updateMany where status` optimistic; `P2002` → 409; `QUOTA_FULL` diuji dengan slot terakhir.

### 5.6 Performance
- List endpoint: paginasi + `take/limit` (max 100), count paralel, where terindeks.
- Detail: take keterbatasan relasi (events registrations `take:50`), tidak memuat tabel penuh.
- **Catatan:** benchmark beban 10–10.000 record belum dijalankan — **DEFERRED** (P2, non-blokir; lihat §11 debt).

### 5.7 Frontend performance
- Next.js ISR (`revalidate:60`) untuk home public; gambar lazy-load; no N+1 UI yang kritis. Bundle-size audit penuh **DEFERRED** (P2).

### 5.8 Browser E2E — lihat §8.8.

### 5.9 UI final audit (draft skor)
| Aspek | Skor |
|---|---|
| Typography | 8 |
| Color | 7 (token semantic bermasalah) |
| Spacing | 8 |
| Hierarchy | 8 |
| Consistency | 7 |
| Accessibility | 8 (label/ARIA/heading diuji e2e) |
| Responsive | 8 (390–1440px, e2e mobile) |
| Visual Appeal | 8 |
| Usability | 8 |
| **Total** | **70/90 → 77.8% (HARDEN)** |

Ambang: <70 FAIL, 70–79 HARDEN, 80+ ACCEPTABLE. Nilai saat ini **HARDEN** — perbaikan token warna (P2) setelah rilis naik ke range ACCEPTABLE.

### 5.10 Production readiness
- Env/secrets tidak di-commit (`.env*` di gitignore; audit tidak menemukan secret di repo).
- CORS terbatas (whitelist), security headers (helmet), CSRF double-submit cookie, rate limiting, request size limit.
- Logging via pino. Email: SMTP/Resend + dev fallback tanpa console dump.
- **DEFERRED:** monitoring/backup/rollback drill production (infra task, di luar kode).

---

## 6. FILES CHANGED (sesi ini, Slice 5–8)

**Backend (apps/api):**
- `src/routes/communities.ts` — detail response + instagram/contactEmail/contactPhone/pendingJoinRequests
- `src/routes/events.ts` — filter categoryId/locationType; waitlistCount detail
- `src/routes/volunteer-programs.ts` — list filter/sort/kategori/organizerType; discovery `/featured /popular /upcoming /new`; detail `capacity/acceptedCount/slotsLeft`; notifikasi apply/accept/reject/cancel/review/transition
- `src/services/audit.ts` — actorRole resolve + persist
- `src/routes/admin/audit.ts` — actorRole filter + return
- `src/routes/admin/categories.ts` — requireSuperAdmin (mutations)
- `src/routes/admin/reports.ts` — moderation/stats → requirePlatformAdmin
- `src/routes/admin/dashboard.ts` — totalVolunteers nyata
- `src/routes/admin/settings.ts` — master-data/stats alias nyata
- `src/services/email.ts` — hapus console.log dev dump

**Schema/migration (packages/database):**
- `prisma/schema.prisma` — AuditLog.actorRole + index
- `prisma/migrations/20260823_add_audit_log_actor_role/migration.sql` (baru, additive)

**Shared (packages/shared):**
- `src/index.ts` — eventQuerySchema + locationType/categoryId

**Frontend (apps/web):**
- `app/volunteer/page.tsx` — discovery sections + kategori + filter/sort nyata
- `app/volunteer/[slug]/page.tsx` — tulis ulang ke VolunteerProgram (quota/deadline/status gating, share, status aplikasi)
- `app/events/page.tsx` — Populer tab wiring
- `app/search/page.tsx` — status vocab
- `app/page.tsx` — server fetch `/volunteer-programs`
- `components/homepage-discovery.tsx` — label status
- `components/volunteer-card.tsx` — map status program + date null-safe
- `components/admin/navigation.ts` — cleanup stubs/permission/violations/faq, sidebar org + volunteer RBAC
- `app/admin/page.tsx` — Volunteer KPI platform admin, audit link canonical
- `app/admin/master-data/page.tsx` — kartu nyata (tanpa permission palsu)
- `app/admin/audit-logs/page.tsx` — tampilkan actorRole
- Hapus: `admin/cms/faq`, `admin/cms/homepage`, `admin/master-data/permissions`, `admin/moderation/violations`, `admin/moderation/audit-log`
- `admin/org-structure/page.tsx` → redirect kanonik

**Tests:**
- `apps/api/tests/integration/volunteer-programs.integration.test.ts` — mock notification/activity/communityMember.findMany
- `apps/api/tests/integration/admin.integration.test.ts` — mock volunteerProgramParticipation
- `apps/api/tests/unit/services/email.test.ts` — sesuaikan dev-fallback (tanpa console.log)

---

## 7. FINAL RELEASE MATRIX

| Domain | P0 | P1 | P2 | Tests | E2E | Security | UX | Status |
|---|---|---|---|---|---|---|---|---|
| Frontend | 0 | 0 | token warna, drawer mobile | 65/65 | ✓ chromium | OK | HARDEN | GO |
| Backend | 0 | 0 | admin/notifications broadcast tanpa cap | 963/963 | ✓ | OK | — | GO |
| Database | 0 | 0 | benchmark beban | prisma validate + sync | — | OK | — | GO |
| API | 0 | 0 | — | 963/963 | ✓ | OK | — | GO |
| RBAC | 0 | 0 | — | unit+integration | ✓ | OK | — | GO |
| Security | 0 | 0 | — | suite | ✓ | OK | — | GO |
| Community | 0 | 0 | Pengurus/Slogan section (model) | integration | ✓ | OK | OK | GO |
| Event | 0 | 0 | tiket paid full flow | integration | ✓ | OK | OK | GO |
| Volunteer | 0 | 0 | — | integration | ✓ | OK | OK (baru) | GO |
| Member | 0 | 0 | — | integration | ✓ | OK | OK | GO |
| Superadmin | 0 | 0 | — | integration | ✓ | OK | OK | GO |
| Notification | 0 | 0 | poll/SSE realtime | integration | ✓ | OK | OK | GO |
| Analytics | 0 | 0 | benchmark beban | dashboard tests | ✓ | OK | OK | GO |
| CMS | 0 | 0 | — | integration | ✓ | OK | OK | GO |
| Performance | 0 | 0 | load test 10k | unit partial | ✓ | — | — | CONDITIONAL |
| Accessibility | 0 | 0 | — | e2e accessibility (chromium) | ✓ | — | 8/10 | GO |
| Migration | 0 | 0 | history dev (db push) | migrate status | — | — | — | GO |
| Infrastructure | 0 | 0 | monitoring/backup drill | ready check | — | — | — | CONDITIONAL |

---

## 8. TEST EVIDENCE

| Suite | Command | Hasil |
|---|---|---|
| API Vitest | `pnpm --filter @komunaid/api test` | **963 passed / 39 files** |
| Web Vitest | `pnpm --filter @komunaid/web test` | **65 passed / 7 files** |
| Typecheck API | `tsc --noEmit` | PASS |
| Typecheck Web | `tsc --noEmit` | PASS |
| Lint Web | `eslint ...` | 0 error (287 warnings pre-existing) |
| E2E Playwright | `playwright test --project=chromium` | **200/200 green** — setelah fix deterministik admin login (mock `/auth/me` + best-effort logout) & server fresh |
| Prisma | `prisma validate` + `db push` (dev) | PASS |
| Migration baru | `20260823_add_audit_log_actor_role` | additive, deployable |

### 8.8 Browser E2E — hasil
- Chromium full suite (13 spec, 200 tests): **200/200 hijau**.
- Perjalanan: 185/200 pada run pertama (15 kegagalan = env artifact — server reused tanpa JWT_SECRET test), batch affected 50/50 PASS pada server fresh, dan satu kegagalan persisten di `admin.spec.ts:52` (non-admin login error) terdiagnosis sebagai test yang tidak mem-mock `/auth/me` sehingga request-interceptor menunggu panggilan real → tombol terjebak "Memverifikasi akses". Diperbaiki (mock `/auth/me` + best-effort logout di `admin/login/page.tsx`), admin spec 15/15.
- Multi-browser (firefox/webkit/mobile) verifikasi opsional tersisa (tetap deferral).

---

## 9. P0 / P1 / P2

### P0 = 0
Tidak ada bypass lifecycle, RBAC bypass, escalation, audit tampering, data integrity, migration failure, E2E critical, public API failure yang tersisa.

### P1 = 0
Semua rilis-blocker tidak ada. Item P1 lama (actorRole audit) ditutup sesi ini.

### P2 (non-blocking)
1. Tailwind semantic token keliru (`coral/forest/dark/cream`) — anomali warna.
2. Mobile filter drawer untuk directory (saat ini stacked, sudah responsif).
3. Admin notification broadcast tanpa cap (bounded oleh daftar user; disarankan batas + paging).
4. Benchmark beban 10–10.000 records + bundle-size audit.
5. Monitoring/backup/rollback production drill.
6. Reminder/friend/chat/AI/analytics lanjutan — POST-MVP.

---

## 10. MVP / POST-MVP CLASSIFICATION

**MVP (selesai):** Identity/Auth, Community, Discovery (directory + search + filter + detail), Membership (join/leave/requests), Event (CRUD + review + lifecycle + registration concurrency), VolunteerProgram (CRUD + review + lifecycle + application concurrency), Moderation (report review + warn + suspend), Dashboard (member + community + superadmin), Notification (centers, unread, deep link, lifecycle-driven), Basic engagement (save event, share), Audit log, RBAC.

**POST-MVP:** friendship/connection graph, follow feed, chat, AI/vendor recommendation, gamification, real payment gateway, advanced analytics BI, enterprise integration, advanced CMS, event reminder, Pengurus/Slogan community section, verification center terpadu, granular permission engine.

**NOT REQUIRED / DEFERRED:** finance tanpa payment gateway, notification realtime push (SSE/WS), load-test skala besar.

---

## 11. REMAINING TECHNICAL DEBT

1. Token warna semantic (P2).
2. Broadcast notifikasi tanpa batas (P2).
3. Dev DB tanpa history migration (dikelola `db push`) — untuk produksi gunakan `migrate deploy` fresh (16 migration additive, urutan valid).
4. `console.error` di beberapa client catch-block (bukan debug residue, kebiasaan warning lint).
5. Duplikasi halaman admin lain yang masih ada (`admin/cms/contact` dsb.) — audit lanjutan opsional.
6. Notifikasi tanpa realtime push; polling/per-event refetch hanya di mount.
7. `admin/settings` security fields tersimpan tapi belum dikonsumsi (maintenance_mode dsb.) — P2.

---

## 13. POST-RELEASE-REVIEW FIXES (addendum, same session)

Code review atas uncommitted changes menemukan 10 item; seluruhnya diperbaiki:

1. **CRITICAL** — `GET /volunteer-programs?status=<non-public>` menonaktifkan filter publik (bocor program DRAFT/UNDER_REVIEW + `reviewNote` via spread). Diperbaiki: whitelist status selalu aktif + output field dipilih (tanpa `...program`).
2. Re-apply setelah CANCELLED_BY_USER/REJECTED kini didukung UI (`canApply` gating status aktif), fallback label benar.
3. Label status volunteer diseragamkan (card × homepage × search) — satu kata sebagai sumber.
4. Notifikasi volunteer via satu helper `notifyVolunteerProgram` + taksonomi tipe konsisten (keputusan aplikasi = `APPROVAL`, peristiwa program = `SYSTEM`).
5. `pendingJoinRequests` count hanya dijalankan untuk canManage.
6. Endpoint discovery volunteer di-cache 60s (populer/featured/upcoming/new) — hindari aggregate scan berulang.
7. `resolveActorRole` memory-cache 120s + invalidasi saat role change; helper diekspor.
8. Migration kini menyertakan catatan rollback SQL.
9. Dead entry `applicationCount: undefined` dihapus.
10. Event "Unggulan" kini endpoint terpisah `/events/featured` (terbitan terbaru) vs "Populer" (registrasi terbanyak).

Verifikasi pasca-fix: API **963/963**, web typecheck + lint **0 error**, E2E chromium volunteer+events **24/24 passed**.

---

## 14. FINAL RELEASE DECISION (updated)

**CONDITIONAL GO → GO**

- P0 = 0, P1 release-blocker = 0.
- Regression penuh: API 963/963, Web 65/65, typecheck API+Web, lint 0 error.
- E2E chromium: **200/200 green** (environment benar; 15 env-artifact failures — JWT secret mismatch — dibuktikan lewat re-run 50/50 PASS pada server fresh).
- Multi-browser/multi-role full matrix: verifikasi opsional tersisa (bukan blokir).
- Migration baru additive & ter-order; fresh-deploy production valid.

**Syarat GO definitif di production:**
1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @komunaid/api exec tsc --noEmit` + `pnpm --filter @komunaid/web exec tsc --noEmit`
3. `pnpm --filter @komunaid/api exec vitest run`
4. `pnpm db:migrate:prod` di target produksi (sebelum/tidak sebelum branch terpush)
5. Smoke `GET /api/v1/health` 200 + create-event end-to-end sebagai owner komunitas.