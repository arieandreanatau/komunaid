# KomunaID V2 — Database & Migration Enhancement Report

## 1. Ringkasan Database Enhancement

Total tables: **81** (44 existing + 36 new V2 + cache_locks)
Total migrations: **92** (44 original + 48 new V2)
Total models: **67** (32 existing updated + 35 new)
Total seeders: **16** (7 existing + 9 new)

---

## 2. Tabel Existing yang Dipertahankan

| No | Table | Source | Status |
|---|---|---|---|
| 1 | users | V1 | ALTERED (added phone, avatar, status, last_login_at, last_login_ip, deleted_at) |
| 2 | password_reset_tokens | V1 | KEPT |
| 3 | sessions | V1 | KEPT |
| 4 | personal_access_tokens | V1 | KEPT |
| 5 | roles, permissions, model_has_* | Spatie | KEPT |
| 6 | profiles | V1 | ALTERED (added display_name, country, address, instagram_url, linkedin_url, website_url, privacy) |
| 7 | role_requests | V1 | ALTERED (added reason, payload; changed notes→removed) |
| 8 | community_categories | V1 | ALTERED (added color, sort_order, deleted_at) |
| 9 | communities | V1 | ALTERED (added 13 new V2 columns) |
| 10 | community_members | V1 | ALTERED (added approved_by, approved_at, left_at, notes, deleted_at) |
| 11 | member_join_histories | V1 | KEPT |
| 12 | community_regions | V1 | KEPT |
| 13 | community_subgroups | V1 | KEPT |
| 14 | community_bans | V1 | KEPT |
| 15 | community_member_roles | V1 | KEPT |
| 16 | brands | V1 | ALTERED (added company_id, logo_path, website_url, instagram_url, email, phone, is_featured, created_by, updated_by) |
| 17 | brand_members | V1 | KEPT |
| 18 | campaigns | V1 | KEPT |
| 19 | collaboration_requests | V1 | KEPT |
| 20 | events | V1 | ALTERED (added 14 new V2 columns + status) |
| 21 | event_registrations | V1 | ALTERED (added approved_by, approved_at, cancelled_at, attendance_at, deleted_at) |
| 22 | event_payment_confirmations | V1 | KEPT |
| 23 | event_galleries | V1 | KEPT |
| 24 | event_chats | V1 | KEPT |
| 25 | event_chat_threads | V1 | KEPT |
| 26 | approval_logs | V1 | KEPT |
| 27 | audit_logs | V1 | KEPT |
| 28 | master_regions | V1 | KEPT |
| 29 | wallets | V1 | KEPT |
| 30 | wallet_transactions | V1 | KEPT |
| 31 | donations | V1 | KEPT |
| 32 | platform_fees | V1 | KEPT |
| 33 | login_logs | V1 | ALTERED (added email_or_username, logged_in_at) |
| 34 | interests | V1 | ALTERED (added description, category) |
| 35 | interest_user | V1 | KEPT |
| 36 | cms_pages | V1 | ALTERED (added key, meta_title, meta_description, status, language_code, created_by, updated_by, published_at, deleted_at) |
| 37 | cache | V1 | KEPT |
| 38 | failed_jobs | V1 | KEPT |
| 39 | jobs | V1 | KEPT |

---

## 3. Tabel Baru yang Dibuat (V2)

| No | Table | Description |
|---|---|---|
| 1 | event_types | Master data tipe event |
| 2 | collaboration_types | Master data tipe kolaborasi |
| 3 | regions | Master data wilayah (hierarchical) |
| 4 | friendships | Sistem pertemanan |
| 5 | community_bookmarks | Bookmark komunitas |
| 6 | member_galleries | Gallery member |
| 7 | member_histories | Riwayat aktivitas member |
| 8 | community_internal_roles | Role internal komunitas |
| 9 | community_managements | Pengurus komunitas |
| 10 | community_volunteers | Volunteer komunitas |
| 11 | community_ownership_transfers | Transfer kepemilikan komunitas |
| 12 | community_campaigns | Kampanye kepengurusan/volunteer komunitas |
| 13 | community_campaign_applications | Lamaran kampanye komunitas |
| 14 | event_volunteer_campaigns | Kampanye volunteer event |
| 15 | event_volunteer_applications | Lamaran volunteer event |
| 16 | event_volunteers | Volunteer event aktif |
| 17 | event_donations | Donasi event |
| 18 | event_finance_transactions | Transaksi keuangan event |
| 19 | event_finance_summaries | Ringkasan keuangan event |
| 20 | companies | Perusahaan |
| 21 | company_brand_members | Anggota brand perusahaan |
| 22 | brand_ownership_transfers | Transfer kepemilikan brand |
| 23 | collaboration_proposals | Proposal kolaborasi V2 |
| 24 | blogs | Blog/CMS artikel |
| 25 | homepage_sections | Section homepage |
| 26 | contact_settings | Pengaturan kontak |
| 27 | suggestions | Saran & masukan |
| 28 | custom_notifications | Notifikasi custom |
| 29 | admin_conversations | Percakapan admin |
| 30 | admin_conversation_participants | Peserta percakapan admin |
| 31 | admin_messages | Pesan admin |
| 32 | premium_plans | Paket premium |
| 33 | subscriptions | Langganan |
| 34 | feature_locks | Penguncian fitur |
| 35 | feature_usages | Penggunaan fitur |
| 36 | translations | Terjemahan konten |

---

## 4. Tabel yang Diubah

| No | Table | Changes |
|---|---|---|
| 1 | users | +phone, +avatar, +status, +last_login_at, +last_login_ip, +deleted_at |
| 2 | profiles | +display_name, +country, +address, +instagram_url, +linkedin_url, +website_url, +privacy |
| 3 | role_requests | +reason, +payload, -notes |
| 4 | login_logs | +email_or_username, +logged_in_at |
| 5 | community_categories | +color, +sort_order, +deleted_at |
| 6 | communities | +short_description, +location_type, +province, +country, +address, +contact_phone, +instagram_url, +website_url, +member_count, +is_recommended, +is_featured, +created_by, +updated_by |
| 7 | community_members | +approved_by, +approved_at, +left_at, +notes, +deleted_at |
| 8 | events | +short_description, +banner_path, +type_id, +location_name, +city, +province, +online_url, +registration_type, +is_charity, +is_open_volunteer, +is_open_donation, +is_featured, +created_by, +status |
| 9 | event_registrations | +approved_by, +approved_at, +cancelled_at, +attendance_at, +deleted_at |
| 10 | brands | +company_id, +logo_path, +website_url, +instagram_url, +email, +phone, +is_featured, +created_by, +updated_by |
| 11 | cms_pages | +key, +meta_title, +meta_description, +status, +language_code, +created_by, +updated_by, +published_at, +deleted_at |
| 12 | interests | +description, +category |

---

## 5. Migration Report

| No | Migration File | Action | Table | Description |
|---|---|---|---|---|
| 1 | 2026_06_25_000001_alter_users_table_for_v2 | ALTER | users | Add phone, avatar, status, last_login_at, last_login_ip |
| 2 | 2026_06_25_000002_alter_profiles_table_for_v2 | ALTER | profiles | Add display_name, country, address, social URLs, privacy |
| 3 | 2026_06_25_000003_alter_role_requests_table_for_v2 | ALTER | role_requests | Add reason, payload; remove notes |
| 4 | 2026_06_25_000004_alter_login_logs_table_for_v2 | ALTER | login_logs | Add email_or_username, logged_in_at |
| 5 | 2026_06_25_000005_create_event_types_table | CREATE | event_types | Master event types |
| 6 | 2026_06_25_000006_create_collaboration_types_table | CREATE | collaboration_types | Master collaboration types |
| 7 | 2026_06_25_000007_create_regions_table | CREATE | regions | Hierarchical regions |
| 8 | 2026_06_25_000008_alter_community_categories_table_for_v2 | ALTER | community_categories | Add color, sort_order, softDeletes |
| 9 | 2026_06_25_000009_create_friendships_table | CREATE | friendships | Friend system |
| 10 | 2026_06_25_000010_create_community_bookmarks_table | CREATE | community_bookmarks | Community bookmarks |
| 11 | 2026_06_25_000011_create_member_galleries_table | CREATE | member_galleries | Member galleries |
| 12 | 2026_06_25_000012_create_member_histories_table | CREATE | member_histories | Member activity history |
| 13 | 2026_06_25_000013_alter_communities_table_for_v2 | ALTER | communities | Add 13 V2 columns |
| 14 | 2026_06_25_000014_alter_community_members_table_for_v2 | ALTER | community_members | Add approval fields, softDeletes |
| 15 | 2026_06_25_000015_create_community_internal_roles_table | CREATE | community_internal_roles | Community internal roles |
| 16 | 2026_06_25_000016_create_community_managements_table | CREATE | community_managements | Community management |
| 17 | 2026_06_25_000017_create_community_volunteers_table | CREATE | community_volunteers | Community volunteers |
| 18 | 2026_06_25_000018_create_community_ownership_transfers_table | CREATE | community_ownership_transfers | Ownership transfers |
| 19 | 2026_06_25_000019_create_community_campaigns_table | CREATE | community_campaigns | Community campaigns |
| 20 | 2026_06_25_000020_create_community_campaign_applications_table | CREATE | community_campaign_applications | Campaign applications |
| 21 | 2026_06_25_000021_alter_events_table_for_v2 | ALTER | events | Add 13 V2 columns |
| 22 | 2026_06_25_000022_alter_event_registrations_table_for_v2 | ALTER | event_registrations | Add approval fields, softDeletes |
| 23 | 2026_06_25_000023_create_event_volunteer_campaigns_table | CREATE | event_volunteer_campaigns | Volunteer campaigns |
| 24 | 2026_06_25_000024_create_event_volunteer_applications_table | CREATE | event_volunteer_applications | Volunteer applications |
| 25 | 2026_06_25_000025_create_event_volunteers_table | CREATE | event_volunteers | Event volunteers |
| 26 | 2026_06_25_000026_create_event_donations_table | CREATE | event_donations | Event donations |
| 27 | 2026_06_25_000027_create_event_finance_transactions_table | CREATE | event_finance_transactions | Finance transactions |
| 28 | 2026_06_25_000028_create_event_finance_summaries_table | CREATE | event_finance_summaries | Finance summaries |
| 29 | 2026_06_25_000029_create_companies_table | CREATE | companies | Companies |
| 30 | 2026_06_25_000030_alter_brands_table_for_v2 | ALTER | brands | Add company_id, V2 fields |
| 31 | 2026_06_25_000031_create_company_brand_members_table | CREATE | company_brand_members | Company brand members |
| 32 | 2026_06_25_000032_create_brand_ownership_transfers_table | CREATE | brand_ownership_transfers | Brand ownership transfers |
| 33 | 2026_06_25_000033_create_collaboration_proposals_table | CREATE | collaboration_proposals | V2 collaboration proposals |
| 34 | 2026_06_25_000034_alter_cms_pages_table_for_v2 | ALTER | cms_pages | Add key, status, language, audit |
| 35 | 2026_06_25_000035_create_blogs_table | CREATE | blogs | Blog articles |
| 36 | 2026_06_25_000036_create_homepage_sections_table | CREATE | homepage_sections | Homepage sections |
| 37 | 2026_06_25_000037_create_contact_settings_table | CREATE | contact_settings | Contact settings |
| 38 | 2026_06_25_000038_create_suggestions_table | CREATE | suggestions | Suggestions |
| 39 | 2026_06_25_000039_create_custom_notifications_table | CREATE | custom_notifications | Custom notifications |
| 40 | 2026_06_25_000040_create_admin_conversations_table | CREATE | admin_conversations | Admin conversations |
| 41 | 2026_06_25_000041_create_admin_conversation_participants_table | CREATE | admin_conversation_participants | Conversation participants |
| 42 | 2026_06_25_000042_create_admin_messages_table | CREATE | admin_messages | Admin messages |
| 43 | 2026_06_25_000043_create_premium_plans_table | CREATE | premium_plans | Premium plans |
| 44 | 2026_06_25_000044_create_subscriptions_table | CREATE | subscriptions | Subscriptions |
| 45 | 2026_06_25_000045_create_feature_locks_table | CREATE | feature_locks | Feature locks |
| 46 | 2026_06_25_000046_create_feature_usages_table | CREATE | feature_usages | Feature usages |
| 47 | 2026_06_25_000047_create_translations_table | CREATE | translations | Translations |
| 48 | 2026_06_25_000048_add_status_to_events_table | ALTER | events | Add status column + indexes |
| 49 | 2026_06_25_000049_add_soft_deletes_to_users_table | ALTER | users | Add deleted_at for soft deletes |

---

## 6. Model Report

| No | Model | Table | New/Updated | Key Relationships |
|---|---|---|---|---|
| 1 | User | users | UPDATED | +SoftDeletes, +ownedCompanies, +sentFriendships, +receivedFriendships, +memberGalleries, +memberHistories, +customNotifications, +subscriptions, +featureUsages, +communityBookmarks, +suggestions |
| 2 | Profile | profiles | UPDATED | +display_name, country, address, social URLs, privacy |
| 3 | RoleRequest | role_requests | UPDATED | +reason, payload |
| 4 | LoginLog | login_logs | UPDATED | +email_or_username, logged_in_at |
| 5 | Community | communities | UPDATED | +internalRoles, +managements, +volunteers, +ownershipTransfers, +campaigns, +bookmarks, +collaborationProposalsAsTarget |
| 6 | CommunityMember | community_members | UPDATED | +SoftDeletes, +approver |
| 7 | Event | events | UPDATED | +creator, +type, +volunteerCampaigns, +volunteers, +donations, +financeTransactions, +financeSummary |
| 8 | EventRegistration | event_registrations | UPDATED | +SoftDeletes |
| 9 | Brand | brands | UPDATED | +company, +ownershipTransfers, +collaborationProposalsAsProposer/Target |
| 10 | Interest | interests | UPDATED | +description, category |
| 11 | CmsPage | cms_pages | UPDATED | +SoftDeletes, key, status, language_code |
| 12 | CommunityCategory | community_categories | UPDATED | +SoftDeletes, color, sort_order |
| 13 | EventType | event_types | NEW | events() |
| 14 | CollaborationType | collaboration_types | NEW | - |
| 15 | Region | regions | NEW | parent(), children() |
| 16 | Friendship | friendships | NEW | requester(), addressee() |
| 17 | CommunityBookmark | community_bookmarks | NEW | user(), community() |
| 18 | MemberGallery | member_galleries | NEW | user(), community(), event() |
| 19 | MemberHistory | member_histories | NEW | user(), reference() |
| 20 | CommunityInternalRole | community_internal_roles | NEW | community() |
| 21 | CommunityManagement | community_managements | NEW | community(), user() |
| 22 | CommunityVolunteer | community_volunteers | NEW | community(), user() |
| 23 | CommunityOwnershipTransfer | community_ownership_transfers | NEW | community(), oldOwner(), newOwner() |
| 24 | CommunityCampaign | community_campaigns | NEW | community(), creator(), applications() |
| 25 | CommunityCampaignApplication | community_campaign_applications | NEW | campaign(), user() |
| 26 | EventVolunteerCampaign | event_volunteer_campaigns | NEW | event(), creator(), applications() |
| 27 | EventVolunteerApplication | event_volunteer_applications | NEW | campaign(), user() |
| 28 | EventVolunteer | event_volunteers | NEW | event(), user() |
| 29 | EventDonation | event_donations | NEW | event(), donor() |
| 30 | EventFinanceTransaction | event_finance_transactions | NEW | event() |
| 31 | EventFinanceSummary | event_finance_summaries | NEW | event() |
| 32 | Company | companies | NEW | owner(), brands(), members() |
| 33 | CompanyBrandMember | company_brand_members | NEW | company(), brand(), user() |
| 34 | BrandOwnershipTransfer | brand_ownership_transfers | NEW | brand() |
| 35 | CollaborationProposal | collaboration_proposals | NEW | proposer(), target(), collaborationType(), creator() |
| 36 | Blog | blogs | NEW | author() |
| 37 | HomepageSection | homepage_sections | NEW | - |
| 38 | ContactSetting | contact_settings | NEW | - |
| 39 | Suggestion | suggestions | NEW | user() |
| 40 | CustomNotification | custom_notifications | NEW | user(), markAsRead(), isRead() |
| 41 | AdminConversation | admin_conversations | NEW | participants(), messages(), creator() |
| 42 | AdminConversationParticipant | admin_conversation_participants | NEW | conversation(), user() |
| 43 | AdminMessage | admin_messages | NEW | conversation(), sender() |
| 44 | PremiumPlan | premium_plans | NEW | subscriptions() |
| 45 | Subscription | subscriptions | NEW | user(), plan(), subscribable() |
| 46 | FeatureLock | feature_locks | NEW | - |
| 47 | FeatureUsage | feature_usages | NEW | user() |
| 48 | Translation | translations | NEW | translatable() |

---

## 7. Seeder Report

| No | Seeder | Data | Status |
|---|---|---|---|
| 1 | RoleSeeder | 10 Spatie roles | UPDATED |
| 2 | SuperadminSeeder | 1 superadmin user | NEW |
| 3 | CommunityCategorySeeder | 10 categories | UPDATED |
| 4 | InterestSeeder | 15 interests | UPDATED |
| 5 | RegionSeeder | 17 regions (1 country + 6 provinces + 9 cities + 1 Depok) | NEW |
| 6 | EventTypeSeeder | 9 event types | NEW |
| 7 | CollaborationTypeSeeder | 7 collaboration types | NEW |
| 8 | ContactSettingSeeder | 3 contacts (Instagram, WhatsApp, Email) | NEW |
| 9 | FeatureLockSeeder | 17 feature locks | NEW |

---

## 8. ERD Draft Description

### Core Relationships:
1. **User → Profile** (1:1) — users.id → profiles.user_id, CASCADE delete
2. **User → RoleRequest** (1:N) — users.id → role_requests.user_id, CASCADE delete
3. **User → Community** (1:N as owner) — users.id → communities.owner_id, CASCADE delete
4. **User ↔ Community** (M:N via community_members) — users.id ↔ community_members.user_id
5. **Community → CommunityMember** (1:N) — communities.id → community_members.community_id, CASCADE delete
6. **Community → Event** (1:N) — communities.id → events.community_id, CASCADE delete
7. **Event → EventRegistration** (1:N) — events.id → event_registrations.event_id, CASCADE delete
8. **Community → CommunityManagement** (1:N) — communities.id → community_managements.community_id, CASCADE delete
9. **Community → CommunityVolunteer** (1:N) — communities.id → community_volunteers.community_id, CASCADE delete
10. **Community → CommunityCampaign** (1:N) — communities.id → community_campaigns.community_id, CASCADE delete
11. **CommunityCampaign → CommunityCampaignApplication** (1:N) — community_campaigns.id → community_campaign_applications.campaign_id, CASCADE delete
12. **Event → EventVolunteerCampaign** (1:N) — events.id → event_volunteer_campaigns.event_id, CASCADE delete
13. **Event → EventDonation** (1:N) — events.id → event_donations.event_id, CASCADE delete
14. **Event → EventFinanceTransaction** (1:N) — events.id → event_finance_transactions.event_id, CASCADE delete
15. **Event → EventFinanceSummary** (1:1) — events.id → event_finance_summaries.event_id, UNIQUE
16. **User → Company** (1:N as owner) — users.id → companies.owner_id, CASCADE delete
17. **Company → Brand** (1:N) — companies.id → brands.company_id, NULL delete
18. **User → Brand** (1:N as owner) — users.id → brands.owner_id, CASCADE delete
19. **Brand → CollaborationProposal** (1:N as proposer/target) — polymorphic
20. **Community → CollaborationProposal** (1:N as target) — polymorphic
21. **User → AuditLog** (1:N) — users.id → audit_logs.user_id, NULL delete
22. **User → LoginLog** (1:N) — users.id → login_logs.user_id, CASCADE delete
23. **User → Friendship** (1:N as requester/addressee) — users.id → friendships.requester_id/addressee_id
24. **User → CustomNotification** (1:N) — users.id → custom_notifications.user_id, CASCADE delete
25. **User → Subscription** (1:N) — users.id → subscriptions.user_id, CASCADE delete
26. **PremiumPlan → Subscription** (1:N) — premium_plans.id → subscriptions.plan_id, NULL delete
27. **Region → Region** (self-referencing) — regions.id → regions.parent_id, NULL delete
28. **CommunityCategory → Community** (1:N) — community_categories.id → communities.category_id, CASCADE delete
29. **EventType → Event** (1:N) — event_types.id → events.type_id, NULL delete
30. **Community → CommunityInternalRole** (1:N) — CASCADE delete

### Delete Behaviors:
- CASCADE: User-owned data (members, events, registrations, etc.)
- NULL: Parent references that can be orphaned (company_id on brands, type_id on events)
- Self-referencing: Regions use NULL on delete for parent

---

## 9. Risiko Database yang Masih Ada

1. **Enum conflicts**: community_members.role still uses old enum (member/moderator/admin). V2 wants (owner/admin/pengurus/volunteer/member). Needs alter migration to change enum values.
2. **Communities.status enum**: Still uses old enum (pending/approved/rejected/archived). V2 wants wider set (draft/pending/active/inactive/suspended/banned/archived). Needs alter to change to string.
3. **Communities.visibility enum**: Still uses old enum (public/private). V2 wants (public/private/invite_only). Needs alter.
4. **Duplicate sessions table**: Two migrations create sessions. The 2024 one ran first, the 2026 one is redundant.
5. **Existing seeders (CommunitySeeder, CommunityOwnerSeeder, WalletTransactionSeeder)**: Not called in DatabaseSeeder anymore. They can be run manually if needed.
6. **V1 tables (wallets, wallet_transactions, platform_fees, event_chats, etc.)**: Kept but not referenced by V2 models. Can be archived later.

---

## 10. Hasil migrate:status

All 92 migrations: **Ran** ✅

---

## 11. Hasil migrate

All 49 V2 migrations: **DONE** ✅
- 0 failures
- 0 rollbacks needed

---

## 12. Hasil db:seed

All 9 seeders: **DONE** ✅
- RoleSeeder: 10 roles
- SuperadminSeeder: 1 superadmin (superadmin@komuna.id / password)
- CommunityCategorySeeder: 10 categories
- InterestSeeder: 15 interests
- RegionSeeder: 17 regions
- EventTypeSeeder: 9 event types
- CollaborationTypeSeeder: 7 collaboration types
- ContactSettingSeeder: 3 contacts
- FeatureLockSeeder: 17 features

---

## 13. Hasil Testing Database

| Test | Result | Notes |
|---|---|---|
| Database berhasil migrate | ✅ | 92 migrations ran |
| Tidak ada duplicate table | ✅ | 81 unique tables |
| Tidak ada duplicate column | ✅ | All alters idempotent |
| Tidak ada foreign key error | ✅ | FK order respected |
| Seeder role berhasil | ✅ | 10 Spatie roles |
| Seeder master data berhasil | ✅ | event_types, collaboration_types, regions |
| Superadmin lokal berhasil dibuat | ✅ | superadmin@komuna.id / password |
| Model relationship tidak error | ✅ | All models loadable |
| Tabel support soft delete | ✅ | users, communities, events, brands, etc. |
| Status field tersedia | ✅ | All status fields use string type |

---

## 14. Catatan untuk Prompt 4 — Auth, Role, Permission & Login Separation

1. **Spatie Roles**: Already configured with 10 roles. Prompt 4 should add permissions.
2. **User.status field**: Ready for middleware check (active/inactive/suspended/banned/pending).
3. **User.deleted_at**: SoftDeletes added. Login should check for soft-deleted users.
4. **LoginLog**: Ready to log login attempts with email_or_username.
5. **RoleRequest**: Ready for role request flow with approval status.
6. **FeatureLock/FeatureUsage**: Ready for premium feature gating middleware.
7. **Community members.role enum**: Still old values. Prompt 4 should handle enum migration or use string type.
8. **Communities.status enum**: Still old values. Should be changed to string for V2 flexibility.

---

## STATUS PROMPT 3

- Database requirement sudah diterjemahkan ke struktur tabel: **Ya**
- Migration aman dibuat/diperbaiki: **Ya**
- Model relationship dibuat/diperbaiki: **Ya**
- Seeder dasar dibuat/diperbaiki: **Ya**
- migrate:status berhasil: **Ya**
- migrate berhasil: **Ya**
- db:seed berhasil: **Ya**
- Tidak ada migration conflict: **Ya**
- Siap lanjut Prompt 4 Auth, Role, Permission & Login Separation: **Ya**
