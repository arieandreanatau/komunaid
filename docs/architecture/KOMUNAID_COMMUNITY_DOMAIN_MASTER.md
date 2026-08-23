# KomunaID Community Domain — Master Audit & Architecture (V1.1 → V1.5)

Dokumen sumber kebenaran *Community Domain* KomunaID. Menyampaikan 17 deliverable MASTER PROMPT (V1.1→V1.5) sebelum implementasi, hasil audit kode langsung (`apps/api`, `apps/web`, `packages/*`), dan keputusan scope.

Tanggal: 2026-08-23. Basis: kode saat ini di `main`.

---

## 1. Community Domain Audit

### 1.1 Backend (apps/api + packages/database)

| Pilar | Ada | Catatan |
|---|---|---|
| Community entity | ✅ | `Community` (`schema.prisma:104`), status `DRAFT/PENDING/APPROVED/SUSPENDED/ARCHIVED/REJECTED/REVISION_REQUIRED`, visibility `PUBLIC/PRIVATE`, membershipType `OPEN/RESTRICTED` |
| Membership | ✅ | `CommunityMember` (`:177`), role `OWNER/ADMIN/EVENT_MANAGER/VOLUNTEER_COORDINATOR/MEMBER`, status `ACTIVE/PENDING/REJECTED/BANNED/LEFT` |
| Join request | ✅ | `JoinRequest` PENDING/APPROVED/REJECTED + approve/reject/cancel |
| Event engine | ✅ | `Event` lifecycle 13 status, kuota, waitlist, save, check-in, status history, agenda/speaker/ticket |
| Volunteer engine | ⚠️ | `VolunteerProgram` kanonik (organizer `COMMUNITY\|INDEPENDENT`); legacy `VolunteerOpportunity` write di-410 |
| Content (Gallery/Thread/News) | ⚠️ | Satu model `CommunityMedia` (`ANNOUNCEMENT\|NEWS\|GALLERY\|FORUM_POST`) + `ForumReply`. TIDAK ada tabel Gallery/Thread terpisah, tanpa edit reply, tanpa target report utk media |
| Officers | ⚠️ | Tanpa endpoint officer; officer = filter role pada members list |
| Network antar community | ❌ | Tidak ada model/route/service; flag `COLLABORATION_ENABLED`/`PARTNERSHIP_ENABLED` default off |
| Collaboration (community×community) | ❌ | Greenfield penuh |
| Statistics | ⚠️ | `CommunityStatistic` write-only, tanpa endpoint tren |
| RBAC granular | ⚠️ | Tanpa tabel permission; role array hard-coded inline per route |

### 1.2 Frontend (apps/web)

| Experience | Ada | Detail |
|---|---|---|
| Discovery `/communities` | ✅ | search (debounce), filter kategori/provinsi/kota/membership, sort, pagination, tabs Jelajahi/Unggulan/Terbaru/Populer, card, create CTA |
| Detail `/communities/[slug]` | ⚠️ | Header, about, kategori, tag, event tabs, media (Pengumuman+Berita), Galeri, Forum, members preview, Komunitas Terkait. **Belum ada**: Officers, volunteer preview, activity summary eksplisit, network/collaboration |
| Admin `/dashboard/communities/[id]` | ⚠️ | Ringkasan/Event/Anggota/Permintaan/Media/Pengaturan/Insight. **Belum ada**: officers page, volunteer tab (modul terpisah), moderasi forum, network/collaboration |
| Create community | ✅ | Wizard 6 langkah → DRAFT → redirect `/dashboard/my-submissions` |
| Platform admin `/admin` | ✅ | Communities/Events/Volunteer review, users, categories, master-data, audit |

### 1.3 RBAC ringkas

- Platform: `UserRole` (`SUPER_ADMIN|PLATFORM_ADMIN|MEMBER`), gate `requireRole/requirePlatformAdmin/requireSuperAdmin` (`middleware/rbac.ts`).
- Community: `CommunityMember.role` + `status ACTIVE` + `deletedAt null`. `requireCommunityOwner` (OWNER), `requireCommunityAdmin` (OWNER|ADMIN).
- Inline: `canManageEvent` (OWNER|ADMIN|EVENT_MANAGER, **tanpa VOLUNTEER_COORDINATOR**), `communityVolunteerPermission` (OWNER|ADMIN|VOLUNTEER_COORDINATOR), media create (FORUM_POST: member; NEWS/GALLERY/ANNOUNCEMENT: OWNER|ADMIN).
- `canMutateTarget` = helper lokal `admin/users.ts` (bukan middleware global).
- Frontend authz = HANYA UX visibility (isOwner/isAdmin inline). Server-side enforcement sudah ada di semua mutasi — policy terjaga, dipertahankan.

---

## 2. Existing vs Target — Gap Analysis

Prioritas gap (urut dampak × risiko), bukan daftar semua.

| # | Gap | Backend | Frontend | Risiko | Putusan |
|---|---|---|---|---|---|
| G1 | Network antar community (V1.5) | ❌ belum ada | ❌ brosur statis `/network` | Tinggi, greenfield | Defer → M2 (bagian 12) |
| G2 | Collaboration community×community (V1.5) | ❌ belum ada | ❌ brosur statis `/kolaborasi` | Tinggi, greenfield | Defer → M2 |
| G3 | Volunteer tak muncul di Community Detail publik | ⚠️ daftar publik tanpa filter `communityId` | ❌ no section | Rendah | **Implement sekarang** (§11, §14 item 2) |
| G4 | Officers tak tampil terpisah di detail | ⚠️ data ada di `membersPreview` (ikut role) | ❌ | Rendah | **Implement sekarang** (§14 item 4) |
| G5 | `COMMUNITY_ROLES` constants kurang `VOLUNTEER_COORDINATOR` | — | ⚠️ mislabelling | Rendah | **Implement sekarang** (§14 item 3) |
| G6 | Tidak ada unban/restore member | ❌ → **Fixed** `POST /members/:memberId/restore` (BANNED→ACTIVE, guard ADMIN-owner) | ✅ tab Anggota + filter Diblokir + tombol Pulihkan | Sedang | **Fixed** |
| G7 | Tidak ada endpoint officers agregat | ❌ | — | Sedang | Defer; derive frontend cukup utk V1.1 |
| G8 | Volunteer module dashboard terpisah dari tab nav | — | ⚠️ | Sedang | Defer; hindari broad refactor |
| G9 | Dashboard tanpa Gallery/Discussion management | media CRUD ada | ⚠️ Media tab hanya ANNOUNCEMENT/NEWS | Sedang | **Fixed** — Media tab + Galeri/Diskusi (M1) |
| G10 | `CommunityStatistic` write-only | ⚠️ | ⚠️ insight sumber beda | Rendah | Defer |
| G11 | 3 permukaan settings tumpang tindih (edit/settings/dashboard) | — | ⚠️ | Rendah | Konsolidasi berikutnya, bukan refactor broad |
| G12 | E2E community dashboard tipis | — | ❌ | Sedang | Rencana test (§15) |

---

## 3. Community Information Architecture

```
PUBLIC
├── Beranda            /
├── Komunitas          /communities
│   │                  /communities?q&categoryId&province&city&membership&sort&page
│   ├── Detail         /communities/[slug]
│   │   ├── Edit       /communities/[slug]/edit      (owner/admin)
│   │   ├── Settings   /communities/[slug]/settings  (owner/admin)
│   │   ├── Members    /communities/[slug]/members   (respek showMemberList)
│   │   └── Requests   /communities/[slug]/join-requests (owner/admin)
├── Event              /events · /events/[slug]
├── Volunteer          /volunteer · /volunteer/[slug]
├── Network (V1.5)     /network        → ekosistem mutual relation
└── Kolaborasi (V1.5)  /kolaborasi     → kolaborasi aktif

MANAGEMENT (auth)
├── Dashboard user     /dashboard
├── Komunitas saya     /dashboard/communities
└── Community admin    /dashboard/communities/[communityId]
    ├── /overview /events /members /requests
    ├── /volunteer /volunteer/create /media /insights /settings
    └── (V1.5) /network /collaboration

PLATFORM
└── /admin  (SUPER_ADMIN | PLATFORM_ADMIN only)
```

Aturan: Community admin HANYA operasional komunitas. Users/Platform/RBAC platform TIDAK masuk Community Admin — sudah sesuai.

---

## 4. Community UX Architecture

| Layer | Tajuk | Tujuan | Visual |
|---|---|---|---|
| Discovery `/communities` | "Temukan Komunitas" | Find | bersih, card-rich, filter/search dominan — ✅ |
| Detail `/communities/[slug]` | "Kenali & Terlibat" | Join + Participate | identitas, sosial, participatory — ⚠️ kurang Officers/Volunteer |
| Admin `/dashboard/communities/[id]` | "Kelola & Tumbuh" | Manage + Operate | workspace, data-oriented — ✅ |

Gap UX: detail belum eksplisit menampilkan activity summary ("12 event, 4 volunteer", §10), section Volunteer (§15), dan Officers (§13). Stat card menampung activity summary implisit; Officers+Volunteer diimplementasi sekarang.

---

## 5. Community Domain Architecture

### Boundary domain

```
 identity/     Community, Category, CommunityTag, CommunitySettings, JoinRequest
 membership/   CommunityMember, MembershipHistory
 activity/     Event(+registrasi), VolunteerProgram(+aplikasi)
 content/      CommunityMedia, ForumReply
 relationship/ (V1.5) CommunityNetwork, Collaboration — GREENFIELD
 platform/     PlatformRole, Report, Notification, AuditLog, Setting
 identity/     User
```

Aturan (§35): UI → route → service (jika ada) → prisma; no direct DB access from UI. Jangan duplikat endpoint bila existing memadai (events by community via `GET /events?communityId=`; members via `GET /communities/:id/members`).

---

## 6. Community Data Relationship

```
User ──UserRole──────▶ PlatformRole
User ──CommunityMember──▶ Community   (OWNER/ADMIN/EVENT_MANAGER/VOLUNTEER_COORDINATOR/MEMBER)
User ──JoinRequest──────▶ Community
User ──EventRegistration─▶ Event
User ──VolunteerProgramApplication──▶ VolunteerProgram ──Community
User ──created──▶ Community(ownerId) · Event(createdById) · VolunteerProgram(organizerUserId)

Community ─▶ CommunityMember · JoinRequest · Event · VolunteerProgram
           · CommunityMedia · ForumReply · CommunityTag · CommunityCategory
           · CommunitySettings · CommunityStatistic
Event ────▶ EventRegistration · EventSave · EventCategory · EventAgenda
           · EventSpeaker · EventTicket · EventStatusHistory · VolunteerOpportunity(legacy)
VolunteerProgram ─▶ VolunteerProgramApplication(+History) · Participation
                   · OrganizerAccess · StatusHistory

(V1.5)
Community ─(CommunityNetwork)─▶ Community
Community ─(Collaboration)────▶ Community ─▶ shared Event / VolunteerProgram
```

`CommunityMember` UNIQUE `[communityId, userId]` menjamin 1 keanggotaan per komunitas. Tidak ada private data diekspos tanpa authz.

---

## 7. Community RBAC Matrix

| Role | Scope | Community baca | Community tulis | Platform |
|---|---|---|---|---|
| Guest | — | detail publik, discovery | — | — |
| MEMBER | platform | detail, anggota (sesuai settings), forum reply, media publik | join/leave, thread (FORUM_POST), apply volunteer, register event | — |
| OWNER | community | semua | semua: profile, settings, members, role, requests, media, archive, suspend, insight | — |
| ADMIN | community | semua | semua kecuali: ubah role member, archive, suspend (`requireCommunityOwner`) | — |
| EVENT_MANAGER | community (event) | semua | create/edit/publish/cancel event (`canManageEvent`) | — |
| VOLUNTEER_COORDINATOR | community (volunteer) | semua | buat/kelola VolunteerProgram (`communityVolunteerPermission`) | — |
| PLATFORM_ADMIN | platform | semua | review/approve/suspend/restore community, categories, contact | manajemen platform |
| SUPER_ADMIN | platform | semua | approve/publish event & volunteer, users, audit, security, CMS, master-data | autoritas penuh |

Catatan: `EVENT_MANAGER` tanpa akses volunteer program (by design); `VOLUNTEER_COORDINATOR` TIDAK termasuk `requireCommunityAdmin`/`canManageEvent` (by design). Escalation guard `canMutateTarget` lindungi SUPER/PATCH_ADMIN dari mutasi admin rendah. Frontend visibility ≠ authorization; semua mutasi divalidasi server-side.

---

## 8. Community Route Map

Rute faktual backend (`/api/v1`) + halaman Next.js. Inti:

| Fungsi | Rute | Auth |
|---|---|---|
| Discovery | `GET /communities` · `featured|new|popular/list` · `meta/provinces` | publik |
| Detail | `GET /communities/:slug` | optionalAuth |
| Buat | `POST /communities` (→ DRAFT) | auth |
| Update draft | `PATCH /communities/:id` · `POST /:id/submit` | owner |
| Update live | `PUT /communities/:id` · `/profile` · `/banner` · `/logo` | requireCommunityAdmin |
| Settings | `GET|PUT /communities/:id/settings` | requireCommunityAdmin |
| Dashboard/insight | `GET /communities/:id/dashboard|insight|statistics` | requireCommunityAdmin |
| Join/leave/cancel | `POST /communities/:id/join|leave|cancel-request` | auth |
| Requests | `GET .../join-requests` · `PUT .../join-requests/:requestId` | requireCommunityAdmin |
| Members | `GET .../members` (publik respek settings) · `GET .../members/history` · `DELETE .../members/:memberId` · `PUT .../members/:memberId/role` | baca optionalAuth; tulis admin/owner |
| Media | `GET|POST /communities/:id/media` · `PUT|DELETE /media/:mediaId` · replies GET/POST/DELETE | baca publik (published); tulis member/admin |
| Event | `GET /events?communityId=` · CRUD `/events` · lifecycle `/events/:id/*` | baca publik; tulis member-role |
| Volunteer | `GET /volunteer-programs` (publik) · `/communities/:communityId` (manager) · `/:programId/*` | G3: tambah filter communityId |
| Admin | `/admin/communities|events|volunteers|users|roles|categories|...` | platform-admin / super-admin |
| Network & Collaboration | — | **belum ada** (G1, G2) |

---

## 9. Component Architecture

### Design system existing

- `packages/ui`: `button`, `card`, `input` (cva + `cn`).
- `apps/web/components/ui/`: avatar, badge, confirm-dialog, data-table, dropdown, modal, pagination, search-input, select, tabs, toast, use-drawer-dialog.
- Feature: community-card, event-card, volunteer-card, gallery-section, forum-section, community-event-tab, community-dashboard-route, member-dashboard-ui (Header/Surface/Loading/Empty/Error), pagination, skeleton, empty-state, error-boundary; admin workspace-tabs/toolbar/navigation.

### Anatomi Community Detail (target setelah implementasi)

```
community-detail (client page)
├── BannerHero + Logo + Identitas + Share + Join CTA
├── Tentang · Kategori · Tag
├── Event (tabs)                  → GET /events?communityId
├── Activity summary (stats)      → payload detail
├── Volunteer Preview  (BARU)     → GET /volunteer-programs?communityId&limit=5
├── Pengumuman & Berita           → GET /communities/:id/media
├── Galeri                        → gallery-section
├── Forum                         → forum-section
├── Pengurus (Officers) (BARU)     → field `officers` payload detail (role ≠ MEMBER)
├── Anggota preview               → membersPreview (respek showMemberList)
└── Komunitas Terkait
```

Admin memakai single-component tab registry (`community-dashboard-route.tsx`). Tidak di-refactor bulk; modul baru ditambah dengan pola sama (contoh: volunteer module terpisah).

---

## 10. API/Data Mapping

| Kebutuhan UI | API existing | Kesenjangan |
|---|---|---|
| Discovery card | `GET /communities` + featured/new/popular | — |
| Detail identity | `GET /communities/:slug` | — |
| Event per komunitas | `GET /events?communityId=` | — |
| Volunteer per komunitas (publik) | `GET /volunteer-programs` | **tambah query `communityId`** (G3) |
| Join/leave/status | `POST /communities/:id/join\|leave` | — |
| Members list | `GET /communities/:id/members` | — |
| Officers | derive dari payload detail (`officers`, backend role ≠ MEMBER) | officer endpoint agregat utuh opsional (G7) |
| Media/galeri/thread | `GET\|POST .../media*` | — |
| Network / collaboration | — | **greenfield** (G1, G2) |

Prinsip §55: tidak duplikat endpoint. Solusi G3 menambah filter pada endpoint publik existing, bukan endpoint baru.

---

## 11. V1.1 Scope (utama, fase ini)

1. **Discovery** — ✅ selesai.
2. **Detail** — lengkapi: **Officers** (BARU, §13), **Volunteer preview** (BARU, §15), activity summary implisit via stats card.
3. **Membership** — join/leave/pending/approve/reject/remove/role ✅.
4. **Event engine** — ✅ full lifecycle.
5. **Volunteer discovery per komunitas** — filter `communityId` + section UI (BARU).
6. **RBAC consistency** — perbaiki konstanta `COMMUNITY_ROLES` (+`VOLUNTEER_COORDINATOR`).
7. **Admin dashboard** — modul existing memadai; officers-nav & volunteer-in-nav ditunda (hindari broad refactor).

## 12. V1.5 Scope (rencana terstruktur — bagian berikutnya dieksekusi)

**M1 — Officers & Content Management (selesai, 2026-08-23):**
- ✅ Officers: payload detail (`GET /communities/:slug`) mengembalikan array `officers` (role ≠ MEMBER, order `joinedAt`, cap 10) + tab dashboard **Pengurus** (list officer, ubah peran owner-only, keluarkan) di `/dashboard/communities/[id]/pengurus`.
- ✅ Dashboard tab Media: filter tipe Galeri (`GALLERY`) & Diskusi (`FORUM_POST`), badge per tipe, form buat/edit dgn URL gambar untuk galeri.
- ✅ **Unban/restore (G6)**: endpoint `POST /communities/:id/members/:memberId/restore` (`requireCommunityAdmin`, 400 bila bukan BANNED, owner-only utk restore ADMIN, audit+activity). Members list dukung filter `?status=` (list BANNED/LEFT/PENDING/REJECTED hanya utk OWNER/ADMIN; publik tetap ACTIVE). UI: tab Anggota + status pill Diblokir + tombol Pulihkan.

**M2 — Community Network & Collaboration (greenfield):**
- Schema baru (dengan migration + audit): `CommunityNetworkRelationship` (requesterId, targetId, status `REQUESTED|ACCEPTED|DECLINED|REMOVED`, unique pair) dan `Collaboration` (communityAId, communityBId, title, description, status `DRAFT|INVITED|ACTIVE|COMPLETED|CANCELLED`, targetType `EVENT|VOLUNTEER`, targetEventId/targetProgramId nullable). Aktivasi flag `COLLABORATION_ENABLED`.
- API: `/communities/:id/network` (list/request/accept/decline/remove), `/collaborations` (create/invite/accept/reject/manage/status). RBAC create/invite → OWNER/ADMIN; penerimaan butuh OWNER/ADMIN target.
- Web: section Network + Collaboration di Community Detail, `/network` & `/kolaborasi` data-driven, dashboard tabs Network & Collaboration.
- E2E: request → accept → shared event lifecycle.

**M3 — Activity Summary** (§10): count events/volunteers/collaborations per komunitas di payload detail.

## 13. Deferred V2 Scope

- **Organization/Brand/Institution/Enterprise Partnership** — JANGAN core community object. Boundary: reuse pola `Organization` existing; organization-community relationship tunduk pada expansion V2.
- Follow komunitas, chat komunitas, social feed global, marketplace, donation/finance/wallet — di luar scope; flags default off.
- Batch admin actions (`adminBulkActionSchema` ada, tanpa endpoint bulk).

---

## 14. Implementation Plan — eksekusi sesi ini

Urutan eksekusi (hanya item in-scope V1.1, low-risk, tanpa schema change):

1. **Backend** — `apps/api/src/routes/volunteer-programs.ts`: tambah filter `communityId` pada `GET /` public discovery (baris ±182-253). Hanya menambah `where.communityId`, tidak menyentuh response shape maupun authz. Langkah: baca handler -> tambah parse query -> filter where.
2. **Test backend** — `apps/api/tests/integration/volunteer-programs.integration.test.ts`: tambah kasus discovery publik dengan `?communityId=` (memastikan where terbawa + status publik tetap dijaga).
3. **Konstanta** — `packages/constants/src/index.ts`: tambah `VOLUNTEER_COORDINATOR` ke `COMMUNITY_ROLES` (perbaiki drift G5).
4. **Frontend detail** — `apps/web/app/communities/[slug]/page.tsx`:
   - Section **Pengurus (Officers)**: backend `GET /communities/:slug` kini mengembalikan array `officers` (query `communityMember` role ≠ MEMBER, order `joinedAt`, cap 10) — mengoreksi window `membersPreview take:20` yang bisa menelan officer. Frontend render `officers`, gated `showMemberList`.
   - Section **Kesempatan Volunteer**: fetch `GET /volunteer-programs?communityId=<id>&limit=5` via effect terpisah (tidak refetch saat join/leave), tampilkan program publik (title, tanggal, status label, CTA ke `/volunteer/[slug]`), empty state "Belum ada kesempatan volunteer."
5. **Verifikasi** — `pnpm --filter @komunaid/api exec tsc --noEmit`, `pnpm --filter @komunaid/api exec vitest run`, `pnpm --filter @komunaid/web exec tsc --noEmit`.

Item M1/M2 (V1.5) TIDAK dieksekusi sekarang — membutuhkan keputusan domain + migration terpisah.

## 15. Test Plan

**Backend (Vitest, mock prisma):**
- Volunteer discovery `?communityId=`: termasuk status publik, filter komunitas tepat, independen tanpa komunitas tersembunyi. (BARU)
- Regression: suite existing communities/events/volunteer-programs/rbac tetap hijau.

**Frontend (Playwright E2E existing + extension):**
- `communities.spec.ts` menutup discovery. **BARU `community-detail.spec.ts`** (4 test, hijau): officers card + role labels, officers tersembunyi saat `showMemberList=false`, volunteer preview + status label + link detail, empty state volunteer.
- Belum ada E2E submission create + join-request approve → rencana M1.

**RBAC coverage yang WAJIB (existing + berjalan):**
Guest, MEMBER, OWNER, ADMIN, EVENT_MANAGER, VOLUNTEER_COORDINATOR, PLATFORM_ADMIN, SUPER_ADMIN — horizontal/vertical escalation sudah ditutup `rbac.integration.test.ts` + `rbac-escalation.integration.test.ts`.

## 16. Regression Risk

| Risiko | Mitigasi |
|---|---|
| Filter baru mengubah hasil discovery volunteer global | Filter aktif HANYA bila `communityId` ada; behavior tanpa param identik |
| Trailing `,` / API shape drift di detail page | Test integration + tsc — response shape volunteer-programs TIDAK diubah |
| Constanta role baru memecah UI yang switch role literal | `COMMUNITY_ROLES` bersifat deklaratif; UI membandingkan string literal — penambahan kunci baru tidak merusak kode existing |
| Detail page bertambah section → beban render | Lazy-fetch volunteer hanya setelah payload detail sukses; section jumlah kecil |

## 17. Final Acceptance Criteria

**Discovery (`/communities`)** — [x] search · [x] filter · [x] category · [x] pagination · [x] card konsisten · [x] detail nav · [x] create CTA · [x] event/volunteer preview lewat card → detail · [x] responsive · [x] loading/empty/error.

**Detail (`/communities/[slug]`)** — [x] identitas jelas · [x] about · [x] membership correct · [x] event correct · [x] **volunteer preview BARU** · [x] members respek privacy · [x] **officers BARU** · [x] gallery · [x] forum · [x] media (news) · [~] network V1.5 (defer M2) · [~] collaboration V1.5 (defer M2) · [x] authorized CTA benar · [x] responsive · [~] aksesibilitas (section baru memakai tag semantik & label yang sama).

**Admin (`/dashboard/communities/[id]`)** — [x] hanya user berizin akses · [x] overview · [x] profile · [x] members · [x] officers (tab Pengurus + unban/restore) · [x] events · [x] volunteer (modul terpisah) · [x] content management gallery/discussion (Media tab) · [~] network/collaboration (M2) · [x] settings · [x] RBAC enforced server-side · [x] audit/history · [x] responsive.

Legend: `[x]` terpenuhi/hijau saat ini (setelah implementasi sesi ini), `[~]` deferred V1.5.

---

## Lampiran — Ringkasan Putusan

- **PRIORITAS dipertahankan:** Business Rule > Security > Authorization > Domain Integrity > Functional Correctness > UX > UI Polish.
- **Keputusan terbaru menang** atas konflik prompt lama (sesuai §0 instruksi).
- **Tanpa asumsi diam-diam:** semua kebuntuan tercatat sebagai GAP dengan milik owner putusan (G6 butuh keputusan domain; G1/G2 masuk rencana V1.5).
- Organisasi/Brand **tidak** menjadi core community object pada V1.1/V1.5.