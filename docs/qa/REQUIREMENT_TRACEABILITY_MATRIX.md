# Requirement Traceability Matrix

Status date: 2026-08-14.

| Requirement ID | Requirement | Source | Implementation | Test/Evidence | Status |
|---|---|---|---|---|---|
| AUTH-003 | Session invalidation | Stage 1 FR | `auth.ts`, `refresh-token.ts` | API unit suite, refresh atomic-consume regression | PARTIAL |
| AUTH-007 | Single-use refresh rotation | Stage 1 FR | `refresh-token.ts` | 26 refresh service tests, atomic-loss test | VERIFIED FIXED at unit level |
| COM-003 | Community content visibility | Stage 1 FR | `communities.ts` | No vulnerability regression yet; file active | FAIL / BLOCKED |
| ORG-004 | Organization event visibility | Stage 1 FR | `organizations.ts` | No private/deleted event regression yet; file active | FAIL / BLOCKED |
| ADM-002 | Admin user moderation | Stage 1 RTM | `admin/users.ts` | Admin integration and typecheck | PARTIAL |
| ADM-003 | Privileged role protection | Stage 1 RTM | `admin/users.ts` | Targeted admin integration; full hierarchy matrix missing | PARTIAL |
| DB-001 | Reproducible production migrations | Schema source of truth | Prisma migrations | Schema validates; clean MySQL rehearsal unavailable | BLOCKED |
| OPS-001 | Health endpoint | AGENTS.md | Next rewrite + Hono handler | `https://komuna.my.id/health` returned 200 | PARTIAL |

`docs/sdlc-stage1/10-RTM.md` remains historical requirements-planning material. It must not be used as current implementation proof.
