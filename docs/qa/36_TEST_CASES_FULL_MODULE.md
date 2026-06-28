# 36 — TEST CASES (FULL MODULE)

Selected detailed cases. Full set: 200+ cases; this doc samples the highest-risk paths.

| Test Case ID | Module | Role | Scenario | Precondition | Steps | Test Data | Expected Result | Actual | Status | Severity | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-AUTH-01 | Auth | guest | Register member | no session | 1. /register 2. name, username, email, password, confirm 3. submit | u=tc01, e=tc01@x.io, p=password123 | 302 → /onboarding, user created, role=member | OK | — | — | — |
| TC-AUTH-02 | Auth | guest | Register fails (empty) | — | submit empty form | — | Per-field + top-of-form error | OK | — | — | — |
| TC-AUTH-03 | Auth | guest | Register fails (dup email) | existing user | submit with same email | — | Email error | OK | — | — | — |
| TC-AUTH-04 | Auth | guest | Register fails (dup username) | existing user | submit with same username | — | Username error | OK | — | — | — |
| TC-AUTH-05 | Auth | guest | Login with email | existing user | /login with email + password | — | 302 → member.dashboard | OK | — | — | — |
| TC-AUTH-06 | Auth | guest | Login with username | existing user | /login with username + password | — | 302 → member.dashboard | OK | — | — | — |
| TC-AUTH-07 | Auth | guest | Login wrong password | existing user | /login with wrong password | — | Error "Data login tidak sesuai." | OK | — | — | — |
| TC-AUTH-08 | Auth | banned | Login banned | banned user | /login | — | Redirected to /account/restricted | OK | — | — | — |
| TC-AUTH-09 | Auth | superadmin | Login via /login | superadmin | /login with superadmin creds | — | Rejected "login via admin panel" | OK | — | — | — |
| TC-AUTH-10 | Auth | member | Login via /admin/login | member | /admin/login | — | Rejected | OK | — | — | — |
| TC-AUTH-11 | Auth | any | Logout | logged in | POST /logout | — | 302 → /login | OK | — | — | — |
| TC-AUTH-12 | Auth | any | Forgot password | — | /forgot-password with email | — | Status message | OK | — | — | — |
| TC-AUTH-13 | Auth | any | Reset password | valid token | /reset-password/{token} → new password | — | Password updated, login | OK | — | — | — |
| TC-COMM-01 | Community | member | Join community | community approved | click Gabung | — | Member added | OK | — | — | — |
| TC-COMM-02 | Community | member | Rejoin 4th time | 3 prior leaves | click Gabung | — | Blocked | TO DO | Medium | P1 | (controller check) |
| TC-COMM-03 | Community | community_owner | Create community | role | submit form | — | Status pending | OK | — | — | — |
| TC-COMM-04 | Community | community_owner | Create 2nd community (1st pending) | first pending | submit | — | Blocked (P1 rule) | TO DO | High | P1 | BR-005 |
| TC-SUPER-01 | Superadmin | superadmin | Approve community | pending | click approve | — | Status active, notification | OK | — | — | — |
| TC-SUPER-02 | Superadmin | superadmin | Reject community | pending | click reject with reason | — | Status rejected, notification | OK | — | — | — |
| TC-SUPER-03 | Superadmin | superadmin | Suspend user | active | click suspend | — | Status suspended, audit log entry | OK | — | — | — |
| TC-SUPER-04 | Superadmin | superadmin | View audit log | — | /superadmin/audit-logs | — | List of actions | OK | — | — | — |
| TC-EVENT-01 | Event | community_owner | Create event | community approved | submit | — | Draft | OK | — | — | — |
| TC-EVENT-02 | Event | community_owner | Submit event for approval | draft | submit | — | Submitted, superadmin notified | OK | — | — | — |
| TC-EVENT-03 | Event | superadmin | Approve paid event | submitted | click approve | — | Published | OK | — | — | — |
| TC-EVENT-04 | Event | member | Register for free event | event published | click Daftar | — | Registration created | OK | — | — | — |
| TC-EVENT-05 | Event | member | Register for paid event | event published fee>0 | click Daftar | — | Payment flow | OK (placeholder) | — | — | — |
| TC-BRAND-01 | Brand | brand_owner | Create brand | role | submit | — | Status pending | OK | — | — | — |
| TC-BRAND-02 | Brand | brand_owner | Create 4th brand | already 3 | submit | — | Blocked (P1 rule) | TO DO | High | P1 | BR-006 |
| TC-COMP-01 | Company | company_owner | Create company | role | submit | — | Status pending | OK | — | — | — |
| TC-COLLAB-01 | Collab | brand_owner | Send proposal | brand approved | submit proposal | — | Status submitted, target notified | OK | — | — | — |
| TC-COLLAB-02 | Collab | community_owner | Accept proposal | submitted | click accept | — | Status accepted | OK | — | — | — |
| TC-PUB-01 | Public | guest | GET /communities | — | curl | — | 200 | 404 → fix scheduled | High | P1 | LIVE-001 |
| TC-PUB-02 | Public | guest | GET /blog | — | curl | — | 200 | 404 → fix scheduled | High | P1 | LIVE-001 |
| TC-SEC-01 | Security | any | Login throttle | 5 failed in 1 min | 6th attempt | — | 429 | TO DO | High | P1 | SEC-01 |
| TC-SEC-02 | Security | any | Forgot throttle | 3+ in 1 min | — | — | 429 | TO DO | Medium | P1 | SEC-06 |
| TC-UX-01 | Auth UX | guest | Top-of-form error on register | — | submit invalid | — | `<x-alert type="error">` visible | TO DO | Medium | P1 | LIVE-003 |
| TC-UX-02 | Auth UX | guest | Top-of-form error on login | — | submit invalid | — | `<x-alert type="error">` visible | TO DO | Medium | P1 | LIVE-003 |
| TC-SEED-01 | Ops | superadmin | Run seed on fresh DB | empty DB | `migrate --seed` | — | Roles + permissions + master data | TO DO | High | P1 | LOCAL-001 |
