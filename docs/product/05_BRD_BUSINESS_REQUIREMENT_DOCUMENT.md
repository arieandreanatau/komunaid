# 05 — BRD: BUSINESS REQUIREMENT DOCUMENT (V1 + V2 + V3)

## 1. Business objective
Build a single, trusted platform that converts Indonesia's fragmented community landscape into a measurable, monetizable, and governable ecosystem connecting **members ↔ communities ↔ brands ↔ companies**, while preserving community autonomy and brand safety.

## 2. Stakeholders
| Stakeholder | Interest | Influence |
|---|---|---|
| Founder / Product Owner | Product-market fit, growth, monetization | High |
| KomunaID Platform Team (Superadmin / Platform Admin) | Operational control, auditability, fairness | High |
| Community Owners | Reach, members, donations, brand partnership | High |
| Members | Discovery, belonging, event access | High |
| Brand Owners | Targeted community reach, campaign ROI | High |
| Company Owners | Brand portfolio, CSR, hiring | High |
| End advertisers / sponsors | Transparent reporting | Medium |
| Regulator (UU PDP, Kemenkominfo) | Data privacy, content moderation | High |

## 3. Business process (current vs future)
| Process | Today (V1+V2) | Future (V3) |
|---|---|---|
| Community discovery | Web directory only | Directory + filter by region, category, member count + recommendation |
| Collaboration | Manual DM | Structured `collaboration_proposals` with status lifecycle, audit, and document trail |
| Event ticketing | Free + paid placeholder | Free + paid + donation + platform fee + EO mode |
| Brand → community campaign | Email / WhatsApp | Tap-in requests, event participation proposals, marketplace |
| Reporting | CSV export | Dashboard metrics + scheduled exports + per-role scope |
| Compliance | Basic | Audit log, banned/suspended, soft delete, account restricted page, role change trail |

## 4. Business requirements
| BR-ID | Statement | Priority |
|---|---|---|
| BR-001 | Any user can browse public content without registering | P0 |
| BR-002 | Registration must accept email OR username, plus password ≥ 8 chars | P0 |
| BR-003 | Default role for a new registration is `member` | P0 |
| BR-004 | Only `superadmin` / `platform_admin` can approve community / brand / company | P0 |
| BR-005 | Community owner cannot create a 2nd community until the 1st is approved | P1 |
| BR-006 | Brand owner is limited to 3 brands | P1 |
| BR-007 | A user cannot join the same community more than 3 times (rule can be relaxed per request) | P1 |
| BR-008 | All state-changing actions must be in `audit_logs` | P0 |
| BR-009 | All data exports must be scoped to caller role and rate-limited | P0 |
| BR-010 | All login attempts (success + failure) must be in `login_logs` | P0 |
| BR-011 | All payment / donation / wallet schema writes are journaled | P1 |
| BR-012 | All UI uses the KomunaID design system (Tailwind v4 theme) | P0 |

## 5. Business rules
See `14_BUSINESS_RULES.md`.

## 6. Approval rules
| Entity | Approver | Notes |
|---|---|---|
| Community | superadmin / platform_admin | Can be rejected with reason |
| Sub community | superadmin / platform_admin | Same flow as parent |
| Regional | superadmin / platform_admin | Same flow |
| Brand | superadmin / platform_admin | Same flow |
| Company | superadmin / platform_admin | Same flow |
| Role request (community_staff, brand_staff, etc.) | superadmin / platform_admin | Auto-approve off by default |
| Event (paid) | superadmin / platform_admin | Free events can be auto-published if community is approved |
| Campaign (ads / product) | superadmin / platform_admin | Reviewed before going public |
| Tap-in request | Community owner (target side) | Confirmed by counter-party |
| Collaboration proposal | Counter-party | Mutually accepted |

## 7. Reporting requirement
| Report | Audience | Frequency | Source |
|---|---|---|---|
| Member activity | superadmin / platform_admin | Daily | `member_histories`, `login_logs` |
| Community metrics | community owner | On-demand | `community_members`, `events`, `donations` |
| Event finance | community / brand / company owner | Per event | `event_finance_transactions`, `event_finance_summaries` |
| Platform fee revenue | superadmin | Daily | `platform_fees` |
| Brand campaign performance | brand / company owner | Per campaign | `community_campaigns`, `community_campaign_applications` |
| Audit trail | superadmin | On-demand | `audit_logs` |
| Login history | self + superadmin | On-demand | `login_logs` |

## 8. Compliance / privacy concern
- **UU PDP (Indonesia Personal Data Protection)** compliance: data minimization, purpose limitation, accuracy, security, accountability.
- Sensitive data classification in `25_DATA_SECURITY_PRIVACY_POLICY.md`.
- Right to access, correct, and delete (soft delete then hard delete after retention).
- Data export must not include credentials, tokens, or unrelated personal data.

## 9. Business risk
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Vercel hosting not ideal for Laravel full app | High | High | Document in `47_DEPLOYMENT_AUDIT_AND_RECOMMENDATION.md`; recommend Forge / Ploi / VPS for production |
| Brand / community conflict (scam, plagiarism) | Medium | High | Report system + admin moderation |
| Wallet / payment abuse | Medium | High | Manual review until gateway integrated; rate limits on topup |
| Scope creep (V3 too large) | High | High | Phased roadmap + MVP cutline |
| Test DB drift | Medium | Medium | Add setup script + CI hint |
| Live deployment secrets leakage | Low | Critical | Never log secrets, never commit `.env` |
