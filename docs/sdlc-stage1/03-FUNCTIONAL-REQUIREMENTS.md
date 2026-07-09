# 03 — FUNCTIONAL REQUIREMENTS

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Module 1: Public Website

| Req ID | Feature | Description | Actor | Priority | Status |
|--------|---------|-------------|-------|----------|--------|
| PUB-001 | Landing Page | Platform overview, stats, features, CTA | Guest | Critical | ✅ Done |
| PUB-002 | Community Directory | List approved communities with search & pagination | Guest | Critical | ✅ Done |
| PUB-003 | Community Detail | View community profile, members, events | Guest | Critical | ✅ Done |
| PUB-004 | Organization Directory | List approved organizations with search & pagination | Guest | High | ✅ Done |
| PUB-005 | Organization Detail | View organization profile, members, events | Guest | High | 🔲 Page empty |
| PUB-006 | Event Directory | List upcoming events with search & pagination | Guest | Critical | ✅ Done |
| PUB-007 | Event Detail | View event info, register/unregister | Guest/Member | Critical | ✅ Done |
| PUB-008 | FAQ Page | Frequently asked questions | Guest | Medium | ✅ Done |
| PUB-009 | Contact Page | Contact information/form | Guest | Medium | ✅ Done |
| PUB-010 | About Page | Platform description | Guest | Medium | ✅ Done |
| PUB-011 | Terms Page | Terms & conditions | Guest | Medium | ✅ Done |
| PUB-012 | Privacy Page | Privacy policy | Guest | Medium | ✅ Done |
| PUB-013 | Community Guidelines | Community conduct guidelines | Guest | Medium | ✅ Done |
| PUB-014 | Event Guidelines | Event participation guidelines | Guest | Medium | ✅ Done |

---

## Module 2: Authentication

| Req ID | Feature | Description | Actor | Priority | Status |
|--------|---------|-------------|-------|----------|--------|
| AUTH-001 | Register | Email + password registration with validation | Guest | Critical | ✅ Done (API + Web) |
| AUTH-002 | Login | Email + password login, JWT cookie | Guest | Critical | ✅ Done (API + Web) |
| AUTH-003 | Logout | Clear cookies, invalidate session | Member | Critical | ✅ Done (API) |
| AUTH-004 | Forgot Password | Request password reset via email | Guest | High | 🔲 API missing |
| AUTH-005 | Reset Password | Token-based password reset | Guest | High | 🔲 API + Web missing |
| AUTH-006 | Email Verification | Verify email address (optional) | Member | Low | 🔲 Not implemented |
| AUTH-007 | Session Management | Token refresh via refresh token cookie | Member | Critical | ✅ Done (API) |

---

## Module 3: Member

| Req ID | Feature | Description | Actor | Priority | Status |
|--------|---------|-------------|-------|----------|--------|
| MEM-001 | Profile | View/edit user profile (name, bio, location, avatar, phone) | Member | Critical | ✅ API done, 🔲 Web missing |
| MEM-002 | Interest | Set/update user interests | Member | Medium | ✅ API done, 🔲 Web missing |
| MEM-003 | Location Preference | Set location preference | Member | Low | 🔲 Not in schema |
| MEM-004 | Notification | View notifications, mark as read | Member | Medium | ✅ API done, 🔲 Web missing |
| MEM-005 | Activity History | View personal activity history | Member | Low | ✅ API done, 🔲 Web missing |
| MEM-006 | Joined Community | View communities joined | Member | Medium | 🔲 Not as dedicated endpoint |
| MEM-007 | Registered Event | View events registered for | Member | Medium | 🔲 Not as dedicated endpoint |
| MEM-008 | Report Abuse | Report content/user/community/event | Member | High | ✅ API done, 🔲 Web missing |

---

## Module 4: Community

| Req ID | Feature | Description | Actor | Priority | Status |
|--------|---------|-------------|-------|----------|--------|
| COM-001 | Create Community | Submit new community for approval | Member | Critical | ✅ API done, 🔲 Web missing |
| COM-002 | Approval | Platform admin approves/suspends community | Platform Admin | Critical | ✅ API done, 🔲 Web missing |
| COM-003 | Profile | View/edit community profile | Community Owner/Admin | High | ✅ API done (partial), 🔲 Web missing |
| COM-004 | Join Request | Request to join restricted community | Member | High | ✅ API done, 🔲 Web missing |
| COM-005 | Membership | Manage members (role, ban, remove) | Community Admin | High | 🔲 Limited in API |
| COM-006 | Community Admin | Admin role management within community | Community Owner | Medium | ✅ RBAC middleware done |
| COM-007 | Community Owner | Owner has full control | Community Owner | Medium | ✅ RBAC middleware done |
| COM-008 | Event Management | Create/manage events within community | Community Event Manager | High | 🔲 Limited |
| COM-009 | Insight | Community analytics/stats | Community Owner/Admin | Low | 🔲 Not implemented |

---

## Module 5: Organization

| Req ID | Feature | Description | Actor | Priority | Status |
|--------|---------|-------------|-------|----------|--------|
| ORG-001 | Create Organization | Submit new organization for approval | Member | Critical | ✅ API done, 🔲 Web missing |
| ORG-002 | Approval | Platform admin approves/suspends organization | Platform Admin | Critical | ✅ API done, 🔲 Web missing |
| ORG-003 | Team Management | Manage organization members/roles | Organization Owner/Admin | High | ✅ API partial, 🔲 Web missing |
| ORG-004 | Event Management | Create/manage events within organization | Organization Admin | High | 🔲 Limited |
| ORG-005 | Participant Management | View event participants | Organization Admin | Medium | 🔲 Not as dedicated endpoint |
| ORG-006 | Insight | Organization analytics/stats | Organization Owner/Admin | Low | 🔲 Not implemented |

---

## Module 6: Event

| Req ID | Feature | Description | Actor | Priority | Status |
|--------|---------|-------------|-------|----------|--------|
| EVT-001 | Create Event | Create event with validation (date, quota) | Community/Org Event Manager | Critical | ✅ API done, 🔲 Web missing |
| EVT-002 | Register | Register for event (capacity check) | Member | Critical | ✅ API done, 🔲 Web missing |
| EVT-003 | Cancel Registration | Cancel event registration | Member | High | ✅ API done, 🔲 Web missing |
| EVT-004 | Event List | List events with filters (date, community, org) | Guest/Member | High | ✅ Done (API + Web) |
| EVT-005 | Event Detail | View full event info + registration status | Guest/Member | High | ✅ Done (API + Web) |

---

## Module 7: Administration

| Req ID | Feature | Description | Actor | Priority | Status |
|--------|---------|-------------|-------|----------|--------|
| ADM-001 | Dashboard | Platform overview stats | Platform Admin | Critical | ✅ API done, 🔲 Web missing |
| ADM-002 | User Management | List, search, suspend, activate users | Platform Admin | Critical | ✅ API done, 🔲 Web missing |
| ADM-003 | Role Management | Change user platform roles | Super Admin | High | ✅ API done, 🔲 Web missing |
| ADM-004 | Community Approval | Approve/suspend communities | Platform Admin | Critical | ✅ API done, 🔲 Web missing |
| ADM-005 | Organization Approval | Approve/suspend organizations | Platform Admin | Critical | ✅ API done, 🔲 Web missing |
| ADM-006 | Report Moderation | Review, resolve, dismiss reports | Platform Admin | High | ✅ API done, 🔲 Web missing |
| ADM-007 | Audit Log | View immutable audit trail | Super Admin | High | ✅ API done, 🔲 Web missing |
| ADM-008 | Settings | Platform settings management | Super Admin | Medium | 🔲 API not implemented |
| ADM-009 | Analytics | Platform analytics dashboard | Platform Admin | Medium | 🔲 Not implemented |
| ADM-010 | Category Management | CRUD for categories | Platform Admin | Medium | ✅ API done, 🔲 Web missing |
