# 20 — ROLE & PERMISSION MATRIX (FINAL V3)

## 20.1 Role catalog (normalized)

| # | Role | Scope | Notes |
|---|---|---|---|
| 1 | guest | unauthenticated | Default before login |
| 2 | member | platform | Default after register |
| 3 | superadmin | platform | Top-level |
| 4 | platform_admin | platform | KomunaID staff |
| 5 | community_owner | organization | Owns ≥ 1 community |
| 6 | community_admin | organization | Internal admin |
| 7 | community_core_team | organization | Core pengurus |
| 8 | community_volunteer | organization | Community volunteer |
| 9 | event_volunteer | event | Event-scoped |
| 10 | brand_owner | organization | Owns ≥ 1 brand |
| 11 | brand_admin | organization | Brand staff admin |
| 12 | brand_employee | organization | Brand staff |
| 13 | brand_intern | organization | Brand intern |
| 14 | company_owner | organization | Owns ≥ 1 company |
| 15 | company_admin | organization | Company staff admin |
| 16 | company_employee | organization | Company staff |
| 17 | company_intern | organization | Company intern |

## 20.2 Permission matrix

Action codes: V=view, C=create, U=update, D=delete, AP=approve, RJ=reject, SP=suspend, RS=restore, EX=export, IM=import, UL=upload, DL=download, AR=assign_role, RR=revoke_role, AL=audit_log, MM=master_data, MP=manage_payment, MPF=manage_platform_fee, MC=manage_cms, SM=send_message.

Data scope: PUB=public, OWN=own_data, ORG=own_organization, COM=own_community, BR=own_brand, CO=own_company, EV=own_event, ALL=all_data, SYS=system_only.

| Module | Action | guest | member | community_owner | community_admin | community_volunteer | event_volunteer | brand_owner | brand_admin | brand_employee | company_owner | company_admin | company_employee | platform_admin | superadmin | Data scope | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Public pages | V | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PUB | — |
| Public profile | V | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PUB | respect privacy |
| Community list | V | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PUB | — |
| Community detail | V | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PUB | — |
| Community join | C | — | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | — | — | OWN | respects 3x rule |
| Community leave | C | — | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — | — | — | — | OWN | logged |
| Community create | C | — | — | ✓ | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ORG | rule: 1st must be approved |
| Community edit | U | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | ORG/ALL | — |
| Community delete | D | — | — | ✓ (own) | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ORG/ALL | — |
| Community approve | AP | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | — |
| Community suspend | SP | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | — |
| Member list (own community) | V | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | COM | respect privacy |
| Member detail | V | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | COM | respect privacy |
| Member ban | C | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | COM | — |
| Member role change | U | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | COM | — |
| Sub community | C/U/D | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | COM | — |
| Community region | C/U/D | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | COM | — |
| Community event create | C | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | COM | — |
| Community event edit | U | — | — | ✓ | ✓ | — | — | — | — | — | — | — | — | ✓ | ✓ | COM | — |
| Event register | C | ✓ (info-only/free-public) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | EV | — |
| Event volunteer apply | C | — | ✓ | — | — | ✓ | — | — | — | — | — | — | — | — | — | EV | — |
| Event gallery upload | UL | — | ✓ (own) | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | EV/ORG | — |
| Event chat | SM | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | EV | — |
| Brand create | C | — | — | — | — | — | — | ✓ | — | — | ✓ (under company) | — | — | ✓ | ✓ | ORG | max 3 brands per brand_owner |
| Brand edit | U | — | — | — | — | — | — | ✓ | ✓ | — | ✓ | ✓ | — | ✓ | ✓ | BR | — |
| Brand staff manage | C/U/D | — | — | — | — | — | — | ✓ | ✓ | — | ✓ | ✓ | — | ✓ | ✓ | BR | — |
| Brand campaign | C/U | — | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | BR | — |
| Brand event | C/U | — | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | BR | — |
| Company create | C | — | — | — | — | — | — | — | — | — | ✓ | — | — | ✓ | ✓ | CO | — |
| Company brand attach | C | — | — | — | — | — | — | — | — | — | ✓ | ✓ | — | ✓ | ✓ | CO | — |
| Company staff manage | C/U/D | — | — | — | — | — | — | — | — | — | ✓ | ✓ | — | ✓ | ✓ | CO | — |
| Collaboration proposal | C/U/D | — | — | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ORG | — |
| Campaign ads | C/U | — | — | ✓ | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ORG | — |
| Wallet view | V | — | ✓ | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | OWN | — |
| Wallet transaction | C | — | ✓ (self) | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | OWN | — |
| Donation | C | — | ✓ | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | OWN | recipient = community/event |
| Payment | MP | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | SYS | Phase 3 |
| Platform fee | MPF | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | SYS | — |
| CMS | MC | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | — |
| Master data | MM | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | — |
| Audit log | V | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | — |
| Report export | EX | — | ✓ (own) | ✓ (own) | ✓ (own) | — | — | ✓ (own) | ✓ (own) | — | ✓ (own) | ✓ (own) | — | ✓ | ✓ | OWN/ALL | rate-limited |
| User suspend | SP | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | — |
| User delete | D | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | — |
| Assign role | AR | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | logged |
| Revoke role | RR | — | — | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ALL | logged |
| Login log | V | — | ✓ (self) | — | — | — | — | — | — | — | — | — | — | ✓ | ✓ | OWN/ALL | — |
| Send message (admin chat) | SM | — | ✓ (to admin) | ✓ (to admin) | — | — | — | ✓ (to admin) | — | — | ✓ (to admin) | — | — | ✓ | ✓ | OWN | — |

## 20.3 Implementation guidance
- All permission checks must be in the **backend** (Policy / Gate / middleware).
- The frontend menu only mirrors backend policy; never trust the frontend.
- Cross-org reads must return 403, not empty list, to avoid silent leak.
- Every role change / suspension writes to `audit_logs`.
- Every export writes to `exports` and increments `feature_usages`.
