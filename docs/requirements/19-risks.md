# 19 — RISKS & NOTES

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Risiko

| No | Risiko | Dampak | Mitigasi |
|----|--------|--------|----------|
| 1 | Scope creep dari V2 ke Phase 2 | Delay MVP | Strict MVP boundary |
| 2 | Tabel baru terlalu banyak | Migration complexity | Break migration ke batch |
| 3 | Multilanguage memakan waktu | Delay | MVP fokus lang files |
| 4 | Premium feature lock belum teruji | Error | Config flag sederhana dulu |
| 5 | Transfer ownership edge case | Data integrity | Test thoroughly |
| 6 | Performance dengan data besar | Slow | Index optimization |
| 7 | Friend system complex | Feature creep | Sederhana dulu |

---

## 2. Catatan Penting

1. MVP boundary ketat — tidak tambah fitur di luar daftar
2. Existing feature jangan di-break
3. Soft delete untuk semua data penting
4. Audit log wajib untuk aksi SA
5. Empty state handling untuk metrics
6. No credential in source code
7. Seeder demo hanya untuk local dev

---

## 3. Database Tables Baru (untuk Prompt 3)

| No | Table | Modul | Phase |
|----|-------|-------|-------|
| 1 | companies | M31 | MVP |
| 2 | blog_posts | M02 | MVP |
| 3 | suggestions | M05 | V2 |
| 4 | friendships | M12 | V2 |
| 5 | bookmarks | M13 | V2 |
| 6 | member_galleries | M14 | V2 |
| 7 | community_open_positions | M23 | V2 |
| 8 | community_position_applications | M23 | V2 |
| 9 | event_volunteer_positions | M26 | V2 |
| 10 | event_volunteer_applications | M26 | V2 |
| 11 | event_financial_transactions | M28 | V2 |
| 12 | admin_chats | M46 | V2 |
| 13 | trial_subscriptions | M49 | V2 |
| 14 | premium_settings | M48 | V2 |
| 15 | cms_translations | M47 | Phase 2 |
| 16 | notifications | M50 | Phase 2 |

---

## 4. ALTER Existing Tables

| No | Table | Column | Type | Phase |
|----|-------|--------|------|-------|
| 1 | profiles | privacy | enum(public,friends,private) | V2 |
| 2 | profiles | phone | nullable string | MVP |
| 3 | profiles | social_link | nullable json | V2 |
| 4 | brands | company_id | nullable FK | MVP |
| 5 | communities | approval_required | boolean | MVP |
| 6 | events | requires_approval | boolean | V2 |
