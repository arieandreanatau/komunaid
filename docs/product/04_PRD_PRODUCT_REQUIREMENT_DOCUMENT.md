# 04 — PRD: PRODUCT REQUIREMENT DOCUMENT (V1 + V2 + V3)

**Product**: KomunaID
**Tagline**: CONNECT • COMMUNITY • GROW
**Slogan**: Terhubung. Bertumbuh. Berdampak.
**Live URL**: https://komunaidv2-komuna.vercel.app/
**Local Path**: `C:\xampp\htdocs\komunaid`
**Version**: V3 (post V1 + V2 Enhancement)
**Date**: 2026-06-27

## 1. Background
KomunaID is a community-ecosystem platform that connects individuals (members), communities, brands, and companies for collaboration, events, volunteering, and growth. The product started with V1 (basic community + event directory) and grew into V2 (richer domain: companies, premium, finance, multilanguage, soft-delete, audit). V3 expands the relational ecosystem across 16 entity-pair connections and adds advanced collaboration, wallet, and event-tap-in flows.

## 2. Problem statement
Indonesian communities are abundant but fragmented. They lack:
- A single, trusted discovery surface.
- A way to manage members, events, and volunteers end-to-end.
- A way to receive proposals from brands and companies in a structured, auditable way.
- A way for brands and companies to run campaigns that target real, engaged communities instead of impersonal ad networks.

## 3. Product vision
To be the trusted operating system for community-ecosystem collaboration in Indonesia — where anyone can discover, join, and grow communities, and where communities, brands, and companies transact, collaborate, and report with confidence.

## 4. Target users
| Persona | Role | Needs |
|---|---|---|
| Guest | unauthenticated | Discover communities & events, see public campaigns |
| Member | authenticated end user | Join communities, attend events, bookmark, friend, donate, report |
| Community Owner | owner of ≥1 community | Manage profile, members, events, collaboration, donations |
| Community Admin / Staff | community-internal | Operate sub-regions, sub-groups, volunteers |
| Event Volunteer | event-scoped | Help run specific event |
| Brand Owner | owner of ≥1 brand | Create products, campaigns, events, brand staff |
| Brand Admin / Employee | brand-internal | Operate campaigns and events |
| Company Owner | owner of ≥1 company | Multi-brand portfolio, CSR, hiring, employee mgmt |
| Company Admin / Employee | company-internal | Operate brand portfolio and CSR |
| Platform Admin | KomunaID staff | Approve, moderate, audit, manage master data |
| Superadmin | KomunaID top-level | Same as Platform Admin plus role / permission changes |

## 5. Scope
### In scope (V1 + V2 + V3 MVP)
- Public website (landing, directory, blog, about, contact, multilanguage).
- Member, community, brand, company accounts.
- 3-stakeholder collaboration with audit.
- Community and event creation, moderation, approval.
- Donation / wallet (schema + UI skeleton).
- Premium / subscription (skeleton).
- Multilanguage, audit log, soft delete, banned/suspended accounts.
- Brand identity, design system.

### Out of scope (V3 MVP)
- Full payment gateway integration (Phase 3).
- Realtime WebSocket chat (Phase 3).
- Mobile app (Phase 4 / Future).
- AI matching (Phase 4 / Future).
- Multi-tenant enterprise package (Phase 4 / Future).
- Public API ecosystem (Phase 4 / Future).

## 6. MVP definition
A release is "MVP" when:
1. All P1 features in `12_MVP_SCOPE_AND_PHASED_ROADMAP.md` are functional in local + live.
2. All P0 bugs are fixed and retested.
3. Test suite is green.
4. Brand identity is consistent.
5. Superadmin can fully moderate.

## 7. Success metrics
| Metric | Target (V3 MVP) |
|---|---|
| `route:list` succeeds | 100% |
| `php artisan test` | 100% pass, no skipped |
| `npm run build` | 100% |
| `/login` HTTP 200 on live | Yes |
| `/register` HTTP 200 on live | Yes |
| Public pages link-broken count | 0 |
| Live UAT positive scenarios passed | ≥ 95% |
| Critical / High bugs open | 0 |

## 8. Feature list (P0 / P1)
See `13_FEATURE_BACKLOG_PRIORITY.md`.

## 9. User roles
See `20_ROLE_PERMISSION_MATRIX.md`.

## 10. User journey
See `10_CUSTOMER_JOURNEY.md`.

## 11. Acceptance criteria
See `16_USER_STORIES_AND_ACCEPTANCE_CRITERIA.md`.

## 12. Risks
See `51_FINAL_READINESS_REPORT.md` §Risk.

## 13. Release plan
- V3.0-alpha — internal UAT (P0 + P1 only).
- V3.0-beta — soft-launch to a closed group.
- V3.0-GA — public release.
- V3.1 — P2 enhancements.
- V3.2 — P3 advanced (payment, realtime).
- V4.0 — Future (mobile, AI, multi-tenant).
