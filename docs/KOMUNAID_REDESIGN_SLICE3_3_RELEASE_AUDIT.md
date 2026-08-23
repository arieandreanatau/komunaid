# KOMUNAID â€” SLICE 3.3 REMEDIATION RESULT

Date: 2026-08-22

## Release Decision: **CONDITIONAL GO**

Semua 11 P0 tercatat RESOLVED dengan bukti repository + test. CONDITIONAL GO dipilih, bukan GO, karena P1 UX blockers tersisa (volunteer eight-step wizard, review UI, participant/program UI polish) dan migration deploy terhadap DB produksi belum diuji duplikasi (data produksi saat ini kosong).

## P0 Matrix

| # | P0 | Result | Evidence |
|---|---|---|---|
| 1 | Canonical public VolunteerProgram | RESOLVED | `/volunteer`, homepage, search, categories, detail all use `/volunteer-programs*` APIs. |
| 2 | Program detail/application | RESOLVED | `GET /volunteer-programs/detail/:slug`, `POST /volunteer-programs/:id/apply` via `VolunteerProgramApplicationService`. |
| 3 | Legacy lifecycle freeze | RESOLVED | `volunteers.ts` (public) + `admin/volunteers.ts` write middleware returns `410 LEGACY_VOLUNTEER_DEPRECATED`; legacy mutation handlers unreachable; admin restore endpoint returns 410; admin approve/reject/suspend/archive handlers removed. GET remains historical. |
| 4 | Event transition all paths | RESOLVED | `admin/events.ts` suspend/cancel/archive/publish and `admin/reports.ts` Event suspension use `EventTransitionService`; restore returns `409 EVENT_CANCELLATION_TERMINAL`. |
| 5 | Legacy Volunteer admin bypass | RESOLVED | `admin/volunteers.ts` mutation handlers removed (approve/reject/suspend/archive) + write-middleware 410 guard; only soft-delete (operational, not lifecycle) retained. |
| 6 | Event registration race | RESOLVED | Transaction locks Event, rechecks status/opening/deadline/quota/duplicate; deterministic codes; `P2002` â†’ `EVENT_ALREADY_REGISTERED` 409. |
| 7 | Program application race | RESOLVED | `applyToVolunteerProgram` locks, rechecks, stable codes; concurrency test: quota=1, second request â†’ `409 QUOTA_FULL`, exactly 1 create. |
| 8 | Duplicate deterministic 409 | RESOLVED | Event `EVENT_ALREADY_REGISTERED`/`QUOTA_FULL`; Program `VOLUNTEER_ALREADY_APPLIED`/`QUOTA_FULL`. |
| 9 | Program application history | RESOLVED | `VolunteerProgramApplicationHistory` model+migration+service; written in same transaction; no update/delete endpoints. |
| 10 | Bulk participant action | RESOLVED | `POST /events/:eventId/participants/bulk-check-in` (max 100, manager+, ONGOING, idempotent, audit); UI contract `data` fixed. |
| 11 | Migration deployment | RESOLVED (fresh-DB) | Fresh disposable DB: 12 migrations applied, `up to date`, DB dropped; backfill script idempotent; dev DB backfill run: 0/0/0/0 (no legacy rows present). |

## Event Lifecycle

- `EventTransitionService` (services/event-transition.ts): graph validation, CAS, history, audit, cancellation side effects (registrationsâ†’CANCELLED, notifications) in one transaction.
- Admin restore lifecycle blocked: `CANCELLED` terminal (`409 EVENT_CANCELLATION_TERMINAL`).
- Event publish admin-only from `APPROVED`.
- Public Event discovery restricted to operational statuses.

## Volunteer Lifecycle

- `VolunteerProgram` canonical; public discovery fully on Program APIs.
- Program transitions via `VolunteerProgramTransitionService`.
- Application lifecycle via `VolunteerProgramApplicationService`: apply, cancel, accept/reject with history + audit transactions.
- Legacy frozen read-only; application/position tests updated to expect `410`.

## Governance (ditutup di sesi ini)

- Community VolunteerProgram kini wajib lewat jalur review yang sama dengan INDEPENDENT:
  - `POST /volunteer-programs/:programId/submit` (DRAFT/REVISION_REQUIRED â†’ SUBMITTED â†’ UNDER_REVIEW); organizer komunitas dapat submit via `communityVolunteerPermission`.
  - Route `/:programId/transition` dibatasi ke state operasional saja (`ORGANIZER_TRANSITIONS`); organizer tidak bisa pindah ke review states.
  - `/:programId/review` mereview INDEPENDENT dan COMMUNITY; reviewer SUPER_ADMIN; self-review tetap diblok.
  - `/admin/review-queue` kini mencakup semua organizer type.
- Legacy mapping readiness: `VolunteerProgram.legacyOpportunityId` (unique) + `eventId` (FK Event) + migration `20260822_add_volunteer_program_legacy_mapping` (+ rollback.sql). Backfill script idempotent `packages/database/scripts/backfill-volunteer-legacy.cjs`; dev DB run: 0 source (tidak ada legacy rows), summary lengkap untuk production.

## Migration evidence

- Fresh DB: 12 migrations applied penuh, `Database schema is up to date!`.
- Catatan: run pertama terpotong timeout meninggalkan failed `_prisma_migrations` row; reset + redeploy sukses. Production `migrate deploy` jalankan dalam satu window tanpa interupsi.
- Migration baru: `20260822_add_volunteer_program_legacy_mapping` (kolom mapping + FK + unique), dengan rollback reversibel didokumentasikan.

## RBAC / Security

- Creator bypass dihapus (Event, legacy Volunteer).
- Self-review diblok (Event review, VolunteerProgram review, application review).
- Superadmin-only Event publish/review; admin Event/Report lifecycle service-routed.
- Bulk check-in audit per peserta, scope manager+.

## Tests

- API Vitest: **958 passed / 38 files** (legacy freeze tests dikonversi; +1 concurrency final-slot test)
- Web Vitest: 65 passed
- Web lint: 0 errors (309 pre-existing warnings)
- TypeScript: API/Web PASS
- Focused: Event 19, VolunteerProgram 10, Legacy Volunteer 3
- Smoke: `/events` `/communities` `/volunteer` `/dashboard` `/dashboard/settings/privacy` all HTTP 200

## Remaining P1

Semua P1 resolved di sesi perbaikan berikutnya (2026-08-22 sore):

- Event update transactionality - RESOLVED: update + categories + agenda/speaker/ticket kini satu $transaction; event tests 19 PASS.
- Eight-step Volunteer create UX - RESOLVED: /dashboard/volunteer-programs/create wizard 8 langkah, submit otomatis ke review, link sidebar; HTTP 200.
- Program review UI moderator - RESOLVED: /admin/volunteer/review-queue badge jenis organizer, nama komunitas, action Setujui/Tolak/Minta Revisi + modal catatan; HTTP 200.
- Community program submit/review UI building blocks - RESOLVED: tombol 'Kirim untuk Review' untuk DRAFT dan REVISION_REQUIRED; canResubmit stale dihapus.
- Migration deploy terhadap copy existing dev DB - RESOLVED: copy DB (53 table + data), baseline 'migrate resolve --applied', 'Database schema is up to date!'; FK diff artifact CREATE TABLE LIKE, bukan drift; copy di-drop.
- REQUESTED_REVIEW_TRANSITIONS konstanta tidak terpakai - RESOLVED: dihapus.

Verifikasi final: API Vitest 958 PASS / 38 files, web lint 0 error, typecheck API/Web PASS, smoke /dashboard/volunteer-programs/create dan /admin/volunteer/review-queue HTTP 200.
