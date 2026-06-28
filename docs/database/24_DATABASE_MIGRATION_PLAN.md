# 24 — DATABASE MIGRATION PLAN

## Already applied (V1 + V2)
- 105 migrations, all RAN on local and on `komunaid_test`.
- See `docs/00_EXECUTION_LOG.md` and `docs/00_TEST_RUN.log`.

## Plan for V3 (P1)
1. **`add_throttle_to_users`** — add `failed_login_count` and `lock_until` for login throttling.
2. **`create_event_tap_ins`** (P2) — `event_id`, `requester_type`, `requester_id`, `terms`, `status`.
3. **`create_products`** (P2) — `brand_id`, `category_id`, `name`, `description`, `price`, `status`.
4. **`create_product_categories`** (P2) — `name`, `slug`.
5. **`create_csr_campaigns`** (P2) — `company_id`, `title`, `description`, `budget`, `status`.
6. **`add_brand_counters`** — `brands.brand_count` (denormalized for quick check).
7. **`add_event_state_history`** — `event_id`, `from_status`, `to_status`, `actor_id`, `at`.
8. **`add_announcements`** (P2) — `community_id`, `title`, `body`, `published_at`.

## Rollback plan
- Every migration is paired with a `down()` that reverses the operation.
- If a migration in production fails, run `php artisan migrate:rollback --step=1` immediately.
- Always snapshot DB before applying migrations in production.
- For destructive changes (`migrate:fresh`), **NEVER** run on production.

## Migration safety rules
1. **No `drop column` without prior backup**.
2. **No `rename column` without an alias column added in a prior migration**.
3. **Always add nullable columns with default**, then later tighten.
4. **Never edit a migration that has been run on production**. Add a new migration.
5. **Indexes** added concurrently.
6. **Foreign keys** use `restrict on delete` unless soft delete.
