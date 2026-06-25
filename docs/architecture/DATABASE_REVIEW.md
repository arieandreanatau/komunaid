# KomunaID — Database Review

**Last updated:** 2026-06-25
**Total migrations:** 99
**Migrations run:** 99 (batch [1])

---

## 1. Migration Overview

| Batch | Date prefix | Purpose | Count |
|---|---|---|---|
| 1 | `2024_01_*` | V1 baseline | 36 |
| 1 | `2026_06_24_*` | Laravel scaffolding (sessions, cache, jobs) | 4 |
| 1 | `2026_06_25_*` | V2 enhancements | 59 |

**Pattern observed:** V2 used **additive migrations** (ALTER + new tables) — no edits to old migrations. This is correct and safe.

---

## 2. Tables (Conceptual Groups)

### Identity & Auth
- `users` (V1 + V2 alters: status, banned_at, soft_deletes, email nullable, status index)
- `password_reset_tokens` (Breeze)
- `sessions` (V2 scaffolding)
- `personal_access_tokens` (Sanctum)
- `profiles` (V1 + V2 expand)
- `role_requests` (V1 + V2 status enum expand: cancelled)
- `login_logs` (V1 + V2 user_id nullable)
- `audit_logs`
- `permission_tables` (Spatie)

### Community
- `community_categories` (V1 + V2 alter)
- `communities` (V1 + V2 alter)
- `community_members` (V1 + V2 alter)
- `community_member_roles` (V1)
- `community_regions` (V1 — per-community)
- `community_subgroups` (V1)
- `community_bans` (V1)
- `community_internal_roles` (V2)
- `community_managements` (V2)
- `community_volunteers` (V2)
- `community_ownership_transfers` (V2)
- `community_campaigns` (V2)
- `community_campaign_applications` (V2)
- `member_join_histories` (V1)
- `community_bookmarks` (V2)

### Event
- `events` (V1 + V2 alters: status, type)
- `event_types` (V2 master)
- `event_registrations` (V1 + V2 alter)
- `event_payment_confirmations` (V1)
- `event_galleries` (V1)
- `event_chats` (V1)
- `event_chat_threads` (V1)
- `event_volunteer_campaigns` (V2)
- `event_volunteer_applications` (V2)
- `event_volunteers` (V2)
- `event_donations` (V2)
- `event_finance_transactions` (V2)
- `event_finance_summaries` (V2)

### Brand & Company
- `brands` (V1 + V2 alter)
- `brand_members` (V1)
- `brand_ownership_transfers` (V2)
- `companies` (V2)
- `company_brand_members` (V2)

### Collaboration
- `collaboration_requests` (V1 — **DEPRECATED, kept for data integrity**)
- `collaboration_proposals` (V2)
- `collaboration_types` (V2 master)

### Donation & Finance
- `donations` (V1 — community-donation legacy, **kept**)
- `wallets` (V1)
- `wallet_transactions` (V1)
- `platform_fees` (V1)

### Premium
- `premium_plans` (V2)
- `subscriptions` (V2)
- `feature_locks` (V2)
- `feature_usages` (V2)

### CMS
- `cms_pages` (V1 + V2 alter)
- `blogs` (V2)
- `homepage_sections` (V2)
- `contact_settings` (V2)
- `suggestions` (V2)

### Admin Chat
- `admin_conversations` (V2 + chat alter)
- `admin_conversation_participants` (V2)
- `admin_messages` (V2 + rename message→body)

### Documentation
- `documentation_files` (V2)

### Multilanguage / Region
- `translations` (V2)
- `regions` (V2 — canonical)
- `master_regions` (V1 — **DEPRECATED, kept**)
- `interests` (V2)
- `campaigns` (V1 — brand-level, **kept, different scope from community_campaigns**)

### System
- `cache` (V2 scaffolding)
- `jobs`, `failed_jobs` (V2 scaffolding)
- `custom_notifications` (V2)
- `friendships` (V2)
- `member_galleries` (V2)
- `member_histories` (V2)
- `role_approvals` (V1)
- `approval_logs` (V1)

---

## 3. Deprecated Tables (Kept, No Data Migration)

| Table | Reason | Action |
|---|---|---|
| `collaboration_requests` | Replaced by `collaboration_proposals` (V2) | Add `@deprecated` to model; no drop in this refactor |
| `master_regions` | Replaced by `regions` (V2) | Add `@deprecated`; no drop |
| `donations` (community) | Still used by `CommunityOwner\DonationController` for community donation confirm flow | No drop; scope different from `event_donations` |
| `campaigns` (brand) | Different scope from `community_campaigns` | No drop |
| `community_regions` | Per-community scope, NOT same as `regions` (master) | No drop |

---

## 4. Indexes

V2 added several useful indexes:
- `users.status` index (V2.002)
- FK indexes implicit on every FK

**Phase 2:** Add explicit indexes for:
- `community_members(community_id, user_id)` composite
- `event_registrations(event_id, user_id)` composite
- `event_donations(event_id, status)` composite
- `collaboration_proposals(status, sender_id)` composite

---

## 5. Foreign Key Cascade Rules

Spot-checked: most FK use `onDelete('cascade')` for owned resources. Some use `restrict` (e.g. `roles` to prevent accidental Spatie role deletion).

---

## 6. Data Dictionary (Selected)

| Table | Key Columns | Notes |
|---|---|---|
| `users` | id, name, username, email (nullable), password, status (active/banned/suspended), banned_at, deleted_at | soft deletes added V2.49 |
| `communities` | id, owner_id, name, slug, description, category_id, status, region_id, etc. | status enum (pending/active/banned/suspended/archived) |
| `events` | id, community_id, owner_id, title, slug, event_type, status, start_at, end_at, location, etc. | status enum (draft/published/ongoing/completed/cancelled/archived) |
| `brands` | id, owner_id, name, slug, industry, status, etc. | status enum |
| `companies` | id, owner_id, name, slug, status, etc. | status enum |
| `collaboration_proposals` | id, sender_type, sender_id, receiver_type, receiver_id, type, status, message, etc. | polymorphic |
| `premium_plans` | id, name, slug, price, duration_days, features (json), is_active | |
| `subscriptions` | id, user_id, plan_id, starts_at, ends_at, status | |
| `feature_locks` | id, feature_key, role, plan_id, is_locked | controls access |
| `feature_usages` | id, user_id, feature_key, period, count | rate tracking |
| `admin_conversations` | id, subject, type, status, last_message_at | |
| `admin_messages` | id, conversation_id, sender_id, body (renamed from `message`) | |
| `documentation_files` | id, key, title, content, generated_at, format | |
| `translations` | id, locale, key, value | |

---

## 7. Soft Deletes

| Table | Soft Deletes |
|---|---|
| `users` | yes (V2.49) |
| All other tables | no |

---

## 8. Recommendations (Phase 2)

1. Add composite indexes per §4.
2. Add `event_finance_summaries` cache invalidation trigger on `event_finance_transactions` insert.
3. Add fulltext index on `events(title, description)` and `communities(name, description)` for public search.
4. Consider `notifications` table for unified in-app + email queue (current `custom_notifications` is custom; not Bell/Spatie notifiable).
5. Add `password_reset_tokens` audit log (who reset, when, IP).

---

## 9. No-Action Items (kept as-is)

- V1 enum strings remain (e.g. `users.status = 'active'`). Migrating to lookup tables = too disruptive for MVP.
- V1 + V2 schema coexist. Do not consolidate in this refactor.
