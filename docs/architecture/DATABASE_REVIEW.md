# KomunaID Database Review (Data Dictionary)

## Total: 96 migrations (95 V1+V2 + 1 audit). 60+ tables.

## V1 Tables (2024 batch — base domain)

| Table | Description | Notable Columns |
|---|---|---|
| `users` | Core user table | id, name, email (nullable V2), username, password, banned_at, status, soft_deletes (V2) |
| `password_reset_tokens` | Laravel default | email, token |
| `sessions` | Laravel session (DB driver) | id, user_id, payload, last_activity |
| `cache` | Laravel default | key, value, expiration |
| `jobs` | Queue jobs | queue, payload, attempts |
| `failed_jobs` | Failed queue jobs | uuid, queue, exception |
| `personal_access_tokens` | Sanctum tokens | tokenable_id, name, token |
| `profiles` | User profile | user_id, display_name, bio, city, province, country, privacy, V2 alters |
| `role_requests` | Role upgrade requests | user_id, requested_role, status (V2 added `cancelled`), reviewer_id, reviewed_at |
| `permission_tables` (Spatie) | permissions, roles, model_has_permissions, model_has_roles, role_has_permissions | |
| `master_regions` | Indonesian region master | name, code, parent_id |
| `audit_logs` | System audit log | user_id, action, auditable_type, auditable_id, description |
| `approval_logs` | Approval workflow log | approvable_type, approvable_id, action, user_id |
| `wallets` | User wallet | user_id, balance |
| `wallet_transactions` | Wallet txns | wallet_id, type (credit/debit), amount, balance_before, balance_after, description, category, reference |
| `donations` | Donations (V1) | donor_id, amount, donation_type, status, community_id, event_id, message, confirmed_at |
| `platform_fees` | Platform fee rules | name, percentage, min_amount, max_amount |
| `interests` | User interests master | name, slug, icon |
| `community_categories` | Community category master | name, slug, icon |
| `communities` | Community | owner_id, category_id, name, slug, description, about, region, city, status, is_public, V2 alters |
| `community_member_roles` | Community member role enum | role (member/volunteer/admin), community_id |
| `community_members` | Membership | community_id, user_id, role, status, joined_at, V2 alters |
| `community_subgroups` | Subgroups | community_id, name, description |
| `community_regions` | Community region scope | community_id, region_id |
| `community_bans` | Ban list | community_id, user_id, reason, banned_at, banned_by |
| `member_join_histories` | Join history log | community_id, user_id, action, acted_at |
| `brands` | Brand | owner_id, name, slug, description, status, V2 alters |
| `brand_members` | Brand staff | brand_id, user_id, role |
| `campaigns` | Brand campaigns | brand_id, name, description, budget, start_date, end_date, status |
| `collaboration_requests` | V1 collaboration system | sender_type, sender_id, receiver_type, receiver_id, message, status |
| `events` | Community event | community_id, title, slug, description, start_at, end_at, location, status, event_type (V2), V2 alters |
| `event_registrations` | Event registration | event_id, user_id, status, payment_status |
| `event_payment_confirmations` | Payment proof | registration_id, amount, bank_name, account_name, transfer_proof_path, status |
| `event_galleries` | Event gallery | event_id, user_id, image_path, caption |
| `event_chats` | Event forum chats | event_id, user_id, message, parent_id |
| `event_chat_threads` | Event chat reply threads | chat_id, user_id, message |
| `cms_pages` | CMS pages | slug, title, body, status, V2 alters |

## V2 New Tables (2026-06-25 batch — enhancements)

### Community enhancements
| Table | Description |
|---|---|
| `community_internal_roles` | Granular internal roles |
| `community_managements` | Management team records |
| `community_volunteers` | Volunteer pool |
| `community_campaigns` | Community campaigns |
| `community_campaign_applications` | Volunteer applications to campaigns |
| `community_ownership_transfers` | Ownership transfer requests |
| `community_bookmarks` | Member bookmarks |
| `friendships` | Member-to-member friend relations |
| `member_galleries` | Member gallery images |
| `member_histories` | Member activity history |
| `regions` | Region taxonomy |
| `event_types` | Event type taxonomy |
| `collaboration_types` | Collaboration type taxonomy |

### Event enhancements
| Table | Description |
|---|---|
| `event_donations` | Event-level donations |
| `event_finance_transactions` | Event finance ledger |
| `event_finance_summaries` | Aggregated finance per event |
| `event_volunteers` | Active volunteers per event |
| `event_volunteer_campaigns` | Volunteer recruitment campaigns |
| `event_volunteer_applications` | Volunteer applications |

### Brand/Company enhancements
| Table | Description |
|---|---|
| `companies` | Company profile |
| `company_brand_members` | Company ↔ Brand pivot |
| `brand_ownership_transfers` | Brand ownership transfer requests |
| `collaboration_proposals` | V2 collaboration system (replaces/augments `collaboration_requests`) |

### CMS
| Table | Description |
|---|---|
| `blogs` | Blog posts |
| `homepage_sections` | Homepage section config |
| `contact_settings` | Contact form settings |
| `suggestions` | Public suggestions inbox |

### Admin chat
| Table | Description |
|---|---|
| `admin_conversations` | Conversation thread |
| `admin_conversation_participants` | Pivot with role/joined_at/last_read_at/archived_at |
| `admin_messages` | Messages (body column was renamed from `message` in V2) |

### Premium / Feature gating
| Table | Description |
|---|---|
| `premium_plans` | Subscription plan catalog |
| `subscriptions` | User subscription records |
| `feature_locks` | Per-feature lock state |
| `feature_usages` | Usage counters |

### Other
| Table | Description |
|---|---|
| `custom_notifications` | In-app notifications |
| `translations` | Translation key-value store |
| `login_logs` | Login audit log (V2 alters) |
| `documentation_files` | Generated documentation artifacts |

## V2 Audit (R5)

| Migration | Date | Purpose |
|---|---|---|
| `2026_06_27_000001_audit_v1_v2_alignment` | 2026-06-27 | No-op schema audit. Verifies presence of every V1+V2 table and key columns. Throws on MySQL if any are missing. |

## V2 Alters (column-level changes, no destructive)

V2 batch contains alters that:
- Add `status` enum to `events` (draft/published/ongoing/done/cancelled)
- Expand `event_type` column
- Add `cancelled` to `role_requests.status` enum
- Add soft deletes to `users`
- Add `status` index to `users`
- Add `region_id` columns where needed
- Add nullable email to `users`
- Add `body` rename to `admin_messages`
- Various other additive changes

## Critical Concerns

1. **`community_members.role` migration** (`2024_01_03_000006_alter_community_members_role_enum_table.php`) uses MySQL `MODIFY COLUMN` syntax. **Will fail on sqlite.** Project defaults to `DB_CONNECTION=mysql` so this is not a blocker for production. **Documented in NON_VERCEL_FALLBACK.md if migrating to sqlite for local testing.**

2. **No destructive migrations** in V2 batch. All V1 tables preserved. Safe to apply on existing data.

3. **Spatie permission tables** are created by `2024_01_01_000002_create_permission_tables.php` and use standard Spatie schema. Compatible with Spatie 6.

4. **Soft deletes** added to users only. Other models (Community, Event, Brand, etc.) use status enum + status_changed_at columns instead of soft_deletes. Acceptable since the application semantics are different.

5. **No `drop table` migrations** found in the entire 95-file set.

## Index Recommendations (Phase 2)

- `community_members(community_id, user_id)` — composite index for membership lookups
- `event_registrations(event_id, user_id)` — already has individual indexes
- `event_finance_transactions(event_id, created_at)` — for finance aggregation
- `collaboration_proposals(target_id, status)` — for proposal inbox queries
- `audit_logs(auditable_type, auditable_id)` — for audit trail lookups

## Migration Run Order

The 95 migrations have date prefixes that ensure correct order. New audit migration `2026_06_27_000001_audit_v1_v2_alignment` runs last by design. `php artisan migrate` from scratch applies them in order; `php artisan migrate:status` shows all `[1] Ran` after a clean apply.
