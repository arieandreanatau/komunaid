# KOMUNAID MVP PHASE 1.1 — DATABASE MIGRATION REPORT

**Date:** 2026-07-12
**Migration:** `20260712022854_remediation_p0`

---

## SCHEMA CHANGES

### 1. VARCHAR → TEXT Conversions

| Table | Column | Before | After | Impact |
|-------|--------|--------|-------|--------|
| `users` | `bio` | VARCHAR(191) | TEXT | Supports 65K chars |
| `communities` | `description` | VARCHAR(191) | TEXT | Supports 65K chars |
| `communities` | `admin_note` | VARCHAR(191) | TEXT | Supports 65K chars |
| `organizations` | `description` | VARCHAR(191) | TEXT | Supports 65K chars |
| `organizations` | `admin_note` | VARCHAR(191) | TEXT | Supports 65K chars |
| `events` | `description` | VARCHAR(191) | TEXT | Supports 65K chars |
| `volunteer_opportunities` | `description` | VARCHAR(191) | TEXT | Supports 65K chars |
| `volunteer_positions` | `description` | VARCHAR(191) | TEXT | Supports 65K chars |
| `volunteer_positions` | `requirement` | VARCHAR(191) | TEXT | Supports 65K chars |
| `volunteer_applications` | `motivation` | VARCHAR(191) | TEXT | Supports 65K chars |
| `volunteer_applications` | `experience` | VARCHAR(191) | TEXT | Supports 65K chars |
| `volunteer_applications` | `availability` | VARCHAR(191) | TEXT | Supports 65K chars |
| `volunteer_applications` | `review_note` | VARCHAR(191) | TEXT | Supports 65K chars |
| `reports` | `description` | VARCHAR(191) | TEXT | Supports 65K chars |
| `reports` | `review_note` | VARCHAR(191) | TEXT | Supports 65K chars |
| `categories` | `description` | VARCHAR(191) | TEXT | Supports 65K chars |
| `join_requests` | `message` | VARCHAR(191) | TEXT | Supports 65K chars |
| `volunteer_assignments` | `notes` | VARCHAR(191) | TEXT | Supports 65K chars |

### 2. New Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `users` | `users_deletedAt_idx` | Soft delete filter |
| `communities` | `communities_deletedAt_idx` | Soft delete filter |
| `community_members` | `community_members_deletedAt_idx` | Soft delete filter |
| `community_media` | `community_media_deletedAt_idx` | Soft delete filter |
| `organizations` | `organizations_deletedAt_idx` | Soft delete filter |
| `organization_members` | `organization_members_deletedAt_idx` | Soft delete filter |
| `events` | `events_deletedAt_idx` | Soft delete filter |
| `volunteer_opportunities` | `volunteer_opportunities_deletedAt_idx` | Soft delete filter |
| `reports` | `reports_deletedAt_idx` | Soft delete filter |

## DATA LOSS ANALYSIS

| Change | Data Loss Risk | Mitigation |
|--------|:--------------:|------------|
| VARCHAR → TEXT | **ZERO** | TEXT is superset. All existing data preserved. |
| New indexes | **ZERO** | Additive change. No data modification. |

## ROLLBACK PLAN

If rollback is needed:
1. Revert VARCHAR→TEXT by running `ALTER TABLE ... MODIFY COLUMN ... VARCHAR(191)` (truncation risk!)
2. Drop new indexes: `DROP INDEX idx_name ON table_name`
3. Revert Prisma schema to previous version

**Note:** VARCHAR→TEXT rollback risks data loss if any field now exceeds 191 chars.

## PERFORMANCE IMPACT

| Change | Expected Impact |
|--------|----------------|
| VARCHAR→TEXT | Negligible for MySQL (both stored inline for < 255 bytes) |
| New indexes | Improves query performance for all soft-delete filtered queries |
| Combined | Net positive: faster list queries, no measurable write overhead |

## MIGRATION STATUS: ✅ READY TO APPLY
