# Database Review

> Data dictionary, V1/V2 cohabitation, and additive migration plan for KomunaID.

## V1 Tables (Deprecated, Not Dropped — by design)

These tables still exist and are used by older controllers. They are NOT dropped. New code prefers V2 tables where applicable.

| Table | Purpose | Replaced by (V2) |
|---|---|---|
| `community_regions` | region-based grouping of communities | `regions` + `community_internal_roles` |
| `community_subgroups` | subgroups inside community | (kept; still useful) |
| `community_bans` | per-community bans | (kept; still useful) |
| `community_member_roles` | per-community role enum on `community_members.role` | `community_managements` (richer role model) |
| `collaboration_requests` | V1 collaboration flow | `collaboration_proposals` |
| `wallets` (community-level) | community wallet | (kept; used) |
| `wallet_transactions` | community wallet tx | (kept) |
| `donations` | community-level donations | `event_donations` (per-event) |
| `platform_fees` | platform fees on community donations | (kept) |
| `event_payment_confirmations` | V1 payment confirm | (kept for record) |
| `event_chats`, `event_chat_threads` | V1 event chat | (kept; admin chat now in `admin_conversations`) |
| `event_galleries` | V1 event gallery | `member_galleries` (cross-feature) |

## V2 Tables (Current)

| Table | Purpose | Owner column | Soft delete | Key indexes |
|---|---|---|---|---|
| `users` | platform users | (self) | yes (`deleted_at`) | `status`, `banned_at` (via migration) |
| `profiles` | user profile | `user_id` | no | `user_id` unique |
| `role_requests` | role upgrade requests | `user_id` | no | `user_id`, `status` |
| `communities` | community | `owner_id` | no | `owner_id`, `status` |
| `community_members` | membership | `community_id`,`user_id` | no | composite |
| `community_managements` | pengurus + roles | `community_id`,`user_id` | no | `community_id` |
| `community_volunteers` | community-level volunteers | `community_id`,`user_id` | no | `community_id` |
| `community_ownership_transfers` | transfer ownership | `community_id`,`from_user_id`,`to_user_id` | no | `community_id` |
| `community_campaigns` | community campaigns | `community_id` | no | `community_id` |
| `community_campaign_applications` | apply to community campaigns | `community_campaign_id`,`user_id` | no | `community_campaign_id` |
| `community_internal_roles` | rich role catalog | `community_id` | no | `community_id` |
| `events` | events | `community_id`,`owner_id` | no | `community_id`,`status`,`event_type_id` |
| `event_registrations` | RSVPs | `event_id`,`user_id` | no | `event_id` |
| `event_volunteer_campaigns` | event volunteer calls | `event_id` | no | `event_id` |
| `event_volunteer_applications` | apply to event volunteer | `event_volunteer_campaign_id`,`user_id` | no | `event_volunteer_campaign_id` |
| `event_volunteers` | accepted volunteers | `event_id`,`user_id` | no | `event_id` |
| `event_donations` | per-event donations | `event_id` | no | `event_id` |
| `event_finance_transactions` | per-event finance ledger | `event_id` | no | `event_id` |
| `event_finance_summaries` | per-event rollup | `event_id` | no | `event_id` unique |
| `event_types` | catalog | n/a | no | (small) |
| `brands` | brand | `owner_id` | no | `owner_id` |
| `brand_ownership_transfers` | brand transfer | `brand_id`,`from_user_id`,`to_user_id` | no | `brand_id` |
| `companies` | company | `owner_id` | no | `owner_id` |
| `company_brand_members` | link brand ↔ company | `company_id`,`brand_id` | no | composite |
| `collaboration_proposals` | V2 collaboration | `proposer_id`,`recipient_type`,`recipient_id` | no | `proposer_id`,`status` |
| `collaboration_types` | catalog | n/a | no | (small) |
| `premium_plans` | subscription plans | n/a | no | (small) |
| `subscriptions` | user/owner subscriptions | `subscriber_id`,`subscriber_type` | no | `subscriber_id` |
| `feature_locks` | which feature is locked | `owner_type`,`owner_id`,`feature_key` | no | composite |
| `feature_usages` | usage tracking | `owner_id`,`feature_key` | no | composite |
| `cms_pages` | CMS pages | n/a | no | `slug` unique |
| `blogs` | blog posts | `author_id` | no | `slug` unique |
| `homepage_sections` | dynamic homepage | n/a | no | `position` |
| `contact_settings` | contact info | n/a | no | (singleton) |
| `suggestions` | public suggestions | `user_id` nullable | no | `status` |
| `custom_notifications` | in-app notifications | `user_id` | no | `user_id`,`read_at` |
| `admin_conversations` | admin↔user chat thread | n/a | no | `status`,`subject_type` |
| `admin_conversation_participants` | thread members | `conversation_id`,`user_id` | no | composite |
| `admin_messages` | admin chat messages | `conversation_id`,`sender_id` | yes | `conversation_id` |
| `documentation_files` | generated docs | `owner_id` | no | `owner_id`,`category` |
| `friendships` | member friend graph | `user_id`,`friend_id` | no | composite |
| `community_bookmarks` | member bookmarks | `user_id`,`community_id` | no | composite |
| `member_galleries` | member photo gallery | `user_id` | no | `user_id` |
| `member_histories` | member activity log | `user_id` | no | `user_id` |
| `regions` | V2 region catalog | n/a | no | `parent_id` |
| `master_regions` | V1 region catalog (legacy) | n/a | no | (kept) |
| `interests` | interest catalog | n/a | no | (small) |
| `login_logs` | login audit | `user_id` nullable | no | `user_id`,`created_at` |
| `audit_logs` | admin action audit | `actor_id` | no | `actor_id`,`action` |
| `approval_logs` | approval workflow | `actor_id`,`subject_type`,`subject_id` | no | composite |
| `role_approvals` | per-role approval record | `role_request_id`,`role` | no | `role_request_id` |
| `community_categories` | community category | `parent_id` | no | `parent_id` |
| `community_member_roles` | V1 per-community role enum | n/a | no | (small) |

## Column Drift Risks

- `admin_messages.message` → renamed to `body` via `2026_06_25_030001`. Model updated.

## Recommended Additive Migrations

These are the only migrations the refactor author will add (none applied by default — author creates them only if a fix is needed):

1. `2026_06_25_100001_add_banned_at_datetime_cast.php` — informational, MySQL `TIMESTAMP` already works; no schema change needed. The fix is on the Eloquent model (see Phase 1 below).
2. `2026_06_25_100002_add_status_index_to_users_table.php` — if missing (one was already added `2026_06_25_000002`); verify.
3. `2026_06_25_100003_add_index_to_role_requests_status.php` — only if needed (verify with `EXPLAIN`).

The implementation plan is: **prefer to NOT add migrations unless the audit proves a real performance or correctness issue**. The shipped migrations already cover V1→V2 progression.

## Soft Deletes

- `users` (via `add_soft_deletes_to_users_table`).
- `admin_messages` (per the model trait).
- No other tables have `deleted_at` columns.
