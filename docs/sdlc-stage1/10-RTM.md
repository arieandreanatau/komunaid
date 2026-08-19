# 10 — REQUIREMENT TRACEABILITY MATRIX

> Historical / Superseded for release evidence. Current remediation traceability lives in `docs/qa/REQUIREMENT_TRACEABILITY_MATRIX.md`.

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Full RTM

| Req ID | Business Rule | Module | Role | Future API Route | Future DB Model | Future Test Case |
|--------|--------------|--------|------|-----------------|-----------------|------------------|
| AUTH-001 | Registrasi Member | Auth | Guest | POST /auth/register | User, UserRole | TC-AUTH-001 to TC-AUTH-004 |
| AUTH-002 | RBAC | Auth | Guest | POST /auth/login | User | TC-AUTH-005 to TC-AUTH-006 |
| AUTH-003 | Session Management | Auth | Member | POST /auth/logout | — | TC-AUTH-007 |
| AUTH-004 | Validation | Auth | Guest | POST /auth/forgot-password | User | TC-AUTH-008 |
| AUTH-005 | Validation | Auth | Guest | POST /auth/reset-password | User | TC-AUTH-009 to TC-AUTH-010 |
| AUTH-007 | Session Management | Auth | Member | POST /auth/refresh | — | TC-AUTH-011 |
| MEM-001 | Scoped Permission | Member | Member | GET/PUT /users/profile | User | TC-MEM-001 to TC-MEM-002 |
| MEM-002 | Scoped Permission | Member | Member | PUT /users/interests | UserInterest | TC-MEM-003 |
| MEM-004 | Scoped Permission | Member | Member | GET /users/notifications | Notification | TC-MEM-004 |
| MEM-005 | Audit Trail | Member | Member | GET /users/activity | ActivityHistory | TC-MEM-005 |
| MEM-008 | Report Abuse | Member | Member | POST /reports | Report | TC-MEM-006 to TC-MEM-007 |
| COM-001 | Approval Community | Community | Member | POST /communities | Community | TC-COM-001 to TC-COM-002 |
| COM-002 | Approval Community | Community | Platform Admin | PUT /admin/communities/:id/approve | Community | TC-COM-003 to TC-COM-004 |
| COM-004 | Join Request | Community | Member | POST /communities/:id/join | JoinRequest | TC-COM-005 to TC-COM-007 |
| COM-005 | Multi Role | Community | Community Admin | GET/PUT /communities/:id/members | CommunityMember | TC-COM-008 to TC-COM-010 |
| COM-006 | RBAC | Community | Community Owner | PUT /communities/:id (role check) | CommunityMember | TC-COM-011 |
| COM-007 | RBAC | Community | Community Owner | PUT /communities/:id | Community | TC-COM-012 |
| ORG-001 | Approval Organization | Organization | Member | POST /organizations | Organization | TC-ORG-001 to TC-ORG-002 |
| ORG-002 | Approval Organization | Organization | Platform Admin | PUT /admin/organizations/:id/approve | Organization | TC-ORG-003 to TC-ORG-004 |
| ORG-003 | Multi Role | Organization | Organization Owner | PUT /organizations/:id/members | OrganizationMember | TC-ORG-005 to TC-ORG-006 |
| EVT-001 | Event Date Validation | Event | Community/Org Admin | POST /events | Event | TC-EVT-001 to TC-EVT-003 |
| EVT-002 | Event Capacity | Event | Member | POST /events/:id/register | EventRegistration | TC-EVT-004 to TC-EVT-006 |
| EVT-003 | Soft Delete | Event | Member | DELETE /events/:id/register | EventRegistration | TC-EVT-007 |
| ADM-001 | Pagination | Admin | Platform Admin | GET /admin/stats | — | TC-ADM-001 |
| ADM-002 | RBAC, Pagination | Admin | Platform Admin | GET/PUT /admin/users | User | TC-ADM-002 to TC-ADM-005 |
| ADM-003 | RBAC | Admin | Super Admin | PUT /admin/users/:id/role | UserRole | TC-ADM-006 to TC-ADM-007 |
| ADM-004 | Approval Community | Admin | Platform Admin | GET /admin/communities/pending | Community | TC-ADM-008 |
| ADM-005 | Approval Organization | Admin | Platform Admin | GET /admin/organizations/pending | Organization | TC-ADM-009 |
| ADM-006 | Report Abuse | Admin | Platform Admin | GET/PUT /admin/reports | Report | TC-ADM-010 to TC-ADM-012 |
| ADM-007 | Audit Trail | Admin | Super Admin | GET /admin/audit-logs | AuditLog | TC-ADM-013 |
| ADM-010 | Scoped Permission | Admin | Platform Admin | CRUD /categories | Category | TC-ADM-014 to TC-ADM-016 |
| PUB-002 | Search | Public Website | Guest | GET /communities | Community | TC-PUB-001 to TC-PUB-002 |
| PUB-006 | Search, Pagination | Public Website | Guest | GET /events | Event | TC-PUB-003 to TC-PUB-004 |

---

## Traceability by Module

| Module | Requirements | Business Rules | Roles | API Routes | DB Models | Test Cases |
|--------|-------------|----------------|-------|------------|-----------|------------|
| Auth | 6 | Registrasi Member, RBAC, Session Management, Validation | Guest, Member | 6 | User, UserRole | 11 |
| Member | 5 | Scoped Permission, Audit Trail, Report Abuse | Member | 4 | User, UserInterest, Notification, ActivityHistory, Report | 5 |
| Community | 6 | Approval Community, Join Request, Multi Role, RBAC | Member, Community Admin, Community Owner | 5 | Community, CommunityMember, JoinRequest | 12 |
| Organization | 3 | Approval Organization, Multi Role | Member, Org Owner, Platform Admin | 3 | Organization, OrganizationMember | 6 |
| Event | 3 | Event Date Validation, Event Capacity, Soft Delete | Member, Community/Org Admin | 3 | Event, EventRegistration | 7 |
| Admin | 7 | Pagination, RBAC, Approval, Report Abuse, Audit Trail, Scoped Permission | Platform Admin, Super Admin | 6 | User, UserRole, Community, Organization, Report, AuditLog, Category | 16 |
| Public Website | 2 | Search, Pagination | Guest | 2 | Community, Event | 4 |
| **Total** | **32** | **16 rules** | **9 roles** | **29 routes** | **16 models** | **61 test cases** |

---

## Traceability by Business Rule

| Business Rule | Requirements | Modules |
|--------------|-------------|---------|
| Registrasi Member | AUTH-001 | Auth |
| RBAC | AUTH-002, COM-006, COM-007, ADM-002, ADM-003 | Auth, Community, Admin |
| Session Management | AUTH-003, AUTH-007 | Auth |
| Validation | AUTH-004, AUTH-005 | Auth |
| Scoped Permission | MEM-001, MEM-002, MEM-004, ADM-010 | Member, Admin |
| Audit Trail | MEM-005, ADM-007 | Member, Admin |
| Report Abuse | MEM-008, ADM-006 | Member, Admin |
| Approval Community | COM-001, COM-002, ADM-004 | Community, Admin |
| Join Request | COM-004 | Community |
| Multi Role | COM-005, ORG-003 | Community, Organization |
| Approval Organization | ORG-001, ORG-002, ADM-005 | Organization, Admin |
| Event Date Validation | EVT-001 | Event |
| Event Capacity | EVT-002 | Event |
| Soft Delete | EVT-003 | Event |
| Search | PUB-002, PUB-006 | Public Website |
| Pagination | ADM-001, ADM-002, PUB-006 | Admin, Public Website |
