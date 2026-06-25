# 01 — PLATFORM OVERVIEW & ENHANCEMENT

**Modul:** M01-M52 (Overview)
**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Platform Overview

KomunaID adalah platform komunitas berbasis web application untuk menghubungkan:

| No | Koneksi | Aktor |
|----|---------|-------|
| 1 | Member ↔ Komunitas | Member, Community Owner |
| 2 | Komunitas ↔ Komunitas | Community Owner |
| 3 | Komunitas ↔ Brand | Brand Owner, Community Owner |
| 4 | Brand ↔ Perusahaan | Company Owner, Brand Owner |
| 5 | Brand/Perusahaan ↔ Event Komunitas | Brand Owner, Company Owner, Community Owner |
| 6 | Superadmin ↔ Semua | Superadmin, Platform Admin |

### Tech Stack

- **Backend:** Laravel 11
- **Database:** MySQL
- **Frontend:** Blade + Tailwind CSS
- **Auth:** Spatie Permission (10 roles)
- **Deploy:** Vercel

---

## 2. Existing Features (Hasil Prompt 0 & 1)

| No | Fitur | Status | Catatan |
|----|-------|--------|---------|
| 1 | Auth (Login/Register/Logout) | ✅ Existing | Basic auth berfungsi |
| 2 | Onboarding pasca-register | ✅ Existing | Basic onboarding flow |
| 3 | Role Request (community_owner, brand_owner) | ✅ Existing | Pending/approve/reject |
| 4 | Member Dashboard | ✅ Existing | Basic dashboard |
| 5 | Member Profile Edit | ✅ Existing | Profile CRUD |
| 6 | Community Directory (Public) | ✅ Existing | Listing + detail |
| 7 | Community CRUD (Owner) | ✅ Existing | Full CRUD |
| 8 | Community Members Management | ✅ Existing | Approve/ban/unban/role |
| 9 | Community Regions | ✅ Existing | CRUD regions |
| 10 | Community Subgroups | ✅ Existing | CRUD subgroups |
| 11 | Community Bans | ✅ Existing | Ban management |
| 12 | Community Member Roles | ✅ Existing | Role assignment |
| 13 | Event CRUD (Owner) | ✅ Existing | Full CRUD + types |
| 14 | Event Registration | ✅ Existing | Register/cancel flow |
| 15 | Event Payment Confirmation | ✅ Existing | Upload bukti transfer |
| 16 | Event Gallery | ✅ Existing | Upload/delete images |
| 17 | Event Chat & Threads | ✅ Existing | Chat per event |
| 18 | Brand CRUD (Owner) | ✅ Existing | Full CRUD |
| 19 | Brand Members/Staff | ✅ Existing | Add/remove staff |
| 20 | Campaign (Brand) | ✅ Existing | Basic CRUD |
| 21 | Collaboration Request | ✅ Existing | Brand ↔ Community |
| 22 | Donation System | ✅ Existing | Basic donation flow |
| 23 | Wallet System | ✅ Existing | Credit/debit |
| 24 | Platform Fee | ✅ Existing | Basic fee tracking |
| 25 | Superadmin Dashboard | ✅ Existing | Basic metrics |
| 26 | Superadmin Approval Center | ✅ Existing | Multi-entity approval |
| 27 | Superadmin User Management | ✅ Existing | View/suspend/ban |
| 28 | Superadmin Community Management | ✅ Existing | View/approve/reject/suspend |
| 29 | Superadmin Brand Management | ✅ Existing | View/approve/reject/suspend |
| 30 | Superadmin Category Management | ✅ Existing | CRUD |
| 31 | Superadmin Master Region | ✅ Existing | CRUD |
| 32 | Superadmin Audit Log | ✅ Existing | View logs |
| 33 | Superadmin Wallet Management | ✅ Existing | View/adjust |
| 34 | Superadmin Donation Management | ✅ Existing | View/confirm/reject |
| 35 | Superadmin Platform Fee | ✅ Existing | View reports |
| 36 | Superadmin Login (Separate) | ✅ Existing | /admin/login |
| 37 | CMS Pages | ✅ Existing | Basic CRUD |
| 38 | Interests | ✅ Existing | Multi-select interest |
| 39 | Login Logs | ✅ Existing | Track login activity |
| 40 | Member Join History | ✅ Existing | Track community joins |
| 41 | Spatie Roles & Permissions | ✅ Existing | 10 roles defined |
| 42 | Policies | ✅ Existing | Brand, Community, Event, Collab |

---

## 3. Gap Analysis

### 3.1 Features Perlu Enhancement

| No | Fitur | Status Gap | Keterangan |
|----|-------|------------|------------|
| 1 | Register — email/username flexible | ⚠️ Partial | Perlu validasi flexible |
| 2 | Public Homepage | ⚠️ Basic | Perlu hero, rekomendasi, blog section |
| 3 | Member History (Lengkap) | ⚠️ Partial | MemberJoinHistory ada, belum lengkap |
| 4 | Community Filter (Advanced) | ⚠️ Basic | Directory ada, filter belum lengkap |
| 5 | Event Volunteer Campaign | ⚠️ Partial | EventType volunteer ada, detail belum |
| 6 | Event Finance Report | ⚠️ Partial | Wallet ada, laporan detail belum |
| 7 | Contact Management (CMS) | ⚠️ Basic | CMS page ada, link management belum |
| 8 | Superadmin Metrics (Detail) | ⚠️ Basic | Dashboard ada, metrics detail belum |
| 9 | Superadmin Login Activity | ⚠️ Partial | LoginLogs ada, tampilan perlu enhance |
| 10 | Public Event Listing | ⚠️ Partial | Event index ada, filter perlu enhance |

### 3.2 Features Missing

| No | Fitur | Keterangan |
|----|-------|------------|
| 1 | Member Friend System | Belum ada tabel relasi teman |
| 2 | Member Bookmark | Belum ada tabel bookmark |
| 3 | Member Gallery | Event gallery ada, member gallery tidak |
| 4 | Campaign Open Kepengurusan | Belum ada tabel community_open_positions |
| 5 | Campaign Open Volunteer | Belum ada campaign volunteer khusus |
| 6 | Company Management | Tabel companies belum ada |
| 7 | Brand-Company Relation | Belum ada relasi brand→company |
| 8 | Blog System | CMS pages ada, blog-specific belum |
| 9 | Saran/Suggestion | Belum ada tabel suggestions |
| 10 | Admin Internal Chat | Belum ada sistem chat admin |
| 11 | Multilanguage | Belum ada file translation |
| 12 | Premium Feature Lock | Belum ada feature flag |
| 13 | Trial Premium | Belum ada sistem trial |
| 14 | Notification System | Belum ada notification table/driver |
| 15 | Member Privacy Settings | Belum ada privacy field di profile |
| 16 | Community Transfer Ownership | Belum ada mekanisme transfer |
| 17 | Brand Transfer Ownership | Belum ada mekanisme transfer |
| 18 | Export Data (CSV) | Belum ada export functionality |

---

## 4. New Features for V2

| No | Fitur | Phase | Priority |
|----|-------|-------|----------|
| 1 | Friend System | V2 | Should Have |
| 2 | Member Bookmark | V2 | Should Have |
| 3 | Member Gallery | V2 | Should Have |
| 4 | Company Management | MVP | Must Have |
| 5 | Blog System | MVP | Must Have |
| 6 | Suggestion System | V2 | Should Have |
| 7 | Campaign Open Kepengurusan | V2 | Should Have |
| 8 | Event Volunteer Campaign Detail | V2 | Should Have |
| 9 | Event Finance Report | V2 | Should Have |
| 10 | Admin Internal Chat | V2 | Should Have |
| 11 | Multilanguage | V2 | Should Have |
| 12 | Premium Feature Lock | V2 | Should Have |
| 13 | Trial Premium | V2 | Should Have |
| 14 | Notification System | Phase 2 | Could Have |
| 15 | Advanced Export | V2 | Should Have |
| 16 | CMS Enhancement | MVP | Must Have |
