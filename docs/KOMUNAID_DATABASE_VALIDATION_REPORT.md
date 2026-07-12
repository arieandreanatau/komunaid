# KOMUNAID — DATABASE VALIDATION REPORT

**Date:** 2026-07-12
**Mode:** Post-Remediation Database Validation

---

## SCHEMA CHANGES

### New Composite Indexes

| Table | Index | Purpose | Impact |
|-------|-------|---------|--------|
| `event_registrations` | `[eventId, status]` | Fast confirmed/pending counts | High |
| `community_members` | `[communityId, status]` | Fast active member counts | High |
| `organization_members` | `[organizationId, status]` | Fast active member counts | High |
| `events` | `[organizationId, status, eventDate]` | Fast org event listing | High |
| `refresh_tokens` | `[userId, isRevoked]` | Fast active session queries | High |

### Constraint Changes

| Table | Change | Purpose |
|-------|--------|---------|
| `audit_logs` | `onDelete: Restrict` on user relation | Prevent cascade delete of audit trail |

### Raw SQL Fix

| Location | Before | After |
|----------|--------|-------|
| `events.ts:880` | `SELECT "quota" FROM "events"` (PostgreSQL) | `` SELECT `quota` FROM `events` `` (MySQL) |

## DATA LOSS ANALYSIS

| Change | Data Loss Risk |
|--------|:--------------:|
| New indexes | **ZERO** — Additive |
| AuditLog restrict | **ZERO** — More restrictive |
| MySQL syntax fix | **ZERO** — Same semantics |

## ROLLBACK PLAN

1. Drop new indexes: `DROP INDEX idx_name ON table_name`
2. Revert AuditLog relation: remove `onDelete: Restrict`
3. Revert MySQL syntax: change backticks to quotes (will break again)

## MIGRATION STATUS: ✅ READY TO APPLY
