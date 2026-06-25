# Test Cases — KomunaID V2

## AUTH Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-AUTH-001 | Auth | Register with email | Guest | POST /register with email+password | User created, role=member, redirect /onboarding | Pass | Pass | |
| TC-AUTH-002 | Auth | Register with username | Guest | POST /register with username+password | User created, role=member, redirect /onboarding | Pass | Pass | |
| TC-AUTH-003 | Auth | Register without email & username | Guest | POST /register with only password | Validation error on username | Pass | Pass | |
| TC-AUTH-004 | Auth | Login with email | Guest | POST /login with email+password | Login success, redirect member dashboard | Pass | Pass | |
| TC-AUTH-005 | Auth | Login with username | Guest | POST /login with username+password | Login success, redirect member dashboard | Pass | Pass | |
| TC-AUTH-006 | Auth | Login wrong password | Guest | POST /login with wrong password | Validation error | Pass | Pass | |
| TC-AUTH-007 | Auth | Superadmin login via /admin/login | Guest | POST /admin/login as superadmin | Redirect superadmin dashboard | Pass | Pass | |
| TC-AUTH-008 | Auth | Member login via /admin/login rejected | Guest | POST /admin/login as member | Validation error "bukan akun admin" | Pass | Pass | |
| TC-AUTH-009 | Auth | Superadmin rejected from user login | Guest | POST /login as superadmin | Validation error "login di admin panel" | Pass | Pass | |
| TC-AUTH-010 | Auth | Banned user login | Banned user exists | POST /login as banned user | Redirect account-restricted | Pass | Pass | |
| TC-AUTH-011 | Auth | Suspended user login | Suspended user exists | POST /login as suspended user | Redirect account-restricted | Pass | Pass | |
| TC-AUTH-012 | Auth | Logout invalidates session | Authenticated user | POST /logout | Session invalidated, redirect /login | Pass | Pass | |
| TC-AUTH-013 | Auth | Superadmin logout | Authenticated superadmin | POST /admin/logout | Redirect admin login | Pass | Pass | |
| TC-AUTH-014 | Auth | Duplicate email registration | Existing user | POST /register with duplicate email | Validation error | Pass | Pass | |
| TC-AUTH-015 | Auth | Duplicate username registration | Existing user | POST /register with duplicate username | Validation error | Pass | Pass | |

## PUBLIC PAGE Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-PUB-001 | Public | Homepage loads | None | GET / | Status 200 | Pass | Pass | |
| TC-PUB-002 | Public | About page loads | None | GET /about | Status 200 | Pass | Pass | |
| TC-PUB-003 | Public | Contact page loads | None | GET /contact | Status 200 | Pass | Pass | |
| TC-PUB-004 | Public | Blogs page loads | None | GET /blogs | Status 200 | Pass | Pass | |
| TC-PUB-005 | Public | Communities page loads | None | GET /communities | Status 200 | Pass | Pass | |
| TC-PUB-006 | Public | Events page loads | None | GET /events | Status 200 | Pass | Pass | |
| TC-PUB-007 | Public | Account restricted page | None | GET /account-restricted | Status 200 | Pass | Pass | |

## ROLE ACCESS Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-ROLE-001 | Role | Guest redirect to login (member) | Guest | GET /member/dashboard | Redirect /login | Pass | Pass | |
| TC-ROLE-002 | Role | Guest redirect to login (superadmin) | Guest | GET /superadmin/dashboard | Redirect (login) | Pass | Pass | |
| TC-ROLE-003 | Role | Member cannot access superadmin | Member user | GET /superadmin/dashboard | 403 | Pass | Pass | |
| TC-ROLE-004 | Role | Member cannot access community owner | Member user | GET /community-own/dashboard | 403 | Pass | Pass | |
| TC-ROLE-005 | Role | Community owner can access dashboard | Community owner | GET /community-own/dashboard | 200 | Pass | Pass | |
| TC-ROLE-006 | Role | Brand owner can access dashboard | Brand owner | GET /brand/dashboard | 200 | Pass | Pass | |
| TC-ROLE-007 | Role | Company owner can access dashboard | Company owner | GET /company-owner/dashboard | 200 | Pass | Pass | |
| TC-ROLE-008 | Role | Superadmin can access dashboard | Superadmin | GET /superadmin/dashboard | 200 | Pass | Pass | |
| TC-ROLE-009 | Role | Platform admin can access superadmin | Platform admin | GET /superadmin/dashboard | 200 | Pass | Pass | |
| TC-ROLE-010 | Role | Banned user redirected from dashboard | Banned user | GET /member/dashboard | Redirect /login | Pass | Pass | |

## SUPERADMIN Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-SUP-001 | Superadmin | Dashboard loads | Superadmin auth | GET /superadmin/dashboard | 200 | Pass | Pass | |
| TC-SUP-002 | Superadmin | Members index | Superadmin auth | GET /superadmin/members | 200 | Pass | Pass | |
| TC-SUP-003 | Superadmin | Communities index | Superadmin auth | GET /superadmin/communities | 200 | Pass | Pass | |
| TC-SUP-004 | Superadmin | Events index | Superadmin auth | GET /superadmin/events | 200 | Pass | Pass | |
| TC-SUP-005 | Superadmin | Brands index | Superadmin auth | GET /superadmin/brands | 200 | Pass | Pass | |
| TC-SUP-006 | Superadmin | Companies index | Superadmin auth | GET /superadmin/companies | 200 | Pass | Pass | |
| TC-SUP-007 | Superadmin | CMS dashboard | Superadmin auth | GET /superadmin/cms | 200 | Pass | Pass | |
| TC-SUP-008 | Superadmin | Admin chat index | Superadmin auth | GET /superadmin/admin-chat | 200 | Pass | Pass | |
| TC-SUP-009 | Superadmin | Documentation index | Superadmin auth | GET /superadmin/documentation | 200 | Pass | Pass | |
| TC-SUP-010 | Superadmin | Approval center | Superadmin auth | GET /superadmin/approval-center | 200 | Pass | Pass | |
| TC-SUP-011 | Superadmin | Role requests | Superadmin auth | GET /superadmin/role-requests | 200 | Pass | Pass | |
| TC-SUP-012 | Superadmin | Login logs | Superadmin auth | GET /superadmin/login-logs | 200 | Pass | Pass | |
| TC-SUP-013 | Superadmin | Audit logs | Superadmin auth | GET /superadmin/audit-logs | 200 | Pass | Pass | |
| TC-SUP-014 | Superadmin | Master data | Superadmin auth | GET /superadmin/master-data | 200 | Pass | Pass | |
| TC-SUP-015 | Superadmin | Settings profile | Superadmin auth | GET /superadmin/settings/profile | 200 | Pass | Pass | |
| TC-SUP-016 | Superadmin | Settings password | Superadmin auth | GET /superadmin/settings/password | 200 | Pass | Pass | |
| TC-SUP-017 | Superadmin | Non-superadmin gets 403 | Member user | GET /superadmin/dashboard | 403 | Pass | Pass | |

## MEMBER Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-MEM-001 | Member | Dashboard loads | Member auth | GET /member/dashboard | 200 | Pass | Pass | |
| TC-MEM-002 | Member | Profile loads | Member auth | GET /member/profile | 200 | Pass | Pass | |
| TC-MEM-003 | Member | Interests loads | Member auth | GET /member/interests | 200 | Pass | Pass | |
| TC-MEM-004 | Member | Communities loads | Member auth | GET /member/communities | 200 | Pass | Pass | |
| TC-MEM-005 | Member | Events loads | Member auth | GET /member/events | 200 | Pass | Pass | |
| TC-MEM-006 | Member | Friends loads | Member auth | GET /member/friends | 200 | Pass | Pass | |
| TC-MEM-007 | Member | Bookmarks loads | Member auth | GET /member/bookmarks | 200 | Pass | Pass | |
| TC-MEM-008 | Member | Gallery loads | Member auth | GET /member/gallery | 500 | Fail | Deferred | View not found |
| TC-MEM-009 | Member | History loads | Member auth | GET /member/history | 200 | Pass | Pass | |
| TC-MEM-010 | Member | Wallet loads | Member auth | GET /member/wallet | 200 | Pass | Pass | |
| TC-MEM-011 | Member | Role requests loads | Member auth | GET /member/role-requests | 200 | Pass | Pass | |
| TC-MEM-012 | Member | Donations loads | Member auth | GET /member/donations | 200 | Pass | Pass | |

## COMMUNITY OWNER Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-COM-001 | Community | Dashboard loads | Community owner auth | GET /community-own/dashboard | 200 | Pass | Pass | |
| TC-COM-002 | Community | Communities index | Community owner auth | GET /community-own/communities | 200 | Pass | Pass | |
| TC-COM-003 | Community | Create community form | Community owner auth | GET /community-own/communities/create | 200 | Pass | Pass | |
| TC-COM-004 | Community | Events index | Community owner auth | GET /community-own/events | 200 | Pass | Pass | |
| TC-COM-005 | Community | Collaborations index | Community owner auth | GET /community-own/collaborations | 200 | Pass | Pass | |
| TC-COM-006 | Community | Proposals index | Community owner auth | GET /community-own/proposals | 200 | Pass | Pass | |
| TC-COM-007 | Community | Wallet index | Community owner auth | GET /community-own/wallet | 200 | Pass | Pass | |
| TC-COM-008 | Community | Member cannot access | Member user | GET /community-own/dashboard | 403 | Pass | Pass | |

## EVENT Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-EVT-001 | Event | Community owner events index | CO auth | GET /community-own/events | 200 | Pass | Pass | |
| TC-EVT-002 | Event | Create event form | CO auth | GET /community-own/events/create | 200 | Pass | Pass | |
| TC-EVT-003 | Event | Public events index | None | GET /events | 200 | Pass | Pass | |
| TC-EVT-004 | Event | Member events index | Member auth | GET /member/events | 200 | Pass | Pass | |
| TC-EVT-005 | Event | My registrations | Member auth | GET /member/my-registrations | 500 | Fail | Deferred | Missing route |

## BRAND/COMPANY Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-BRN-001 | Brand | Dashboard loads | Brand owner auth | GET /brand/dashboard | 200 | Pass | Pass | |
| TC-BRN-002 | Brand | Brands index | Brand owner auth | GET /brand/brands | 200 | Pass | Pass | |
| TC-BRN-003 | Brand | Create brand form | Brand owner auth | GET /brand/brands/create | 200 | Pass | Pass | |
| TC-BRN-004 | Brand | Campaigns index | Brand owner auth | GET /brand/campaigns | 200 | Pass | Pass | |
| TC-BRN-005 | Brand | Collaborations index | Brand owner auth | GET /brand/collaborations | 200 | Pass | Pass | |
| TC-BRN-006 | Brand | Proposals index | Brand owner auth | GET /brand/proposals | 200 | Pass | Pass | |
| TC-BRN-007 | Company | Dashboard loads | Company owner auth | GET /company-owner/dashboard | 200 | Pass | Pass | |
| TC-BRN-008 | Company | Companies index | Company owner auth | GET /company-owner/companies | 200 | Pass | Pass | |
| TC-BRN-009 | Company | Create company form | Company owner auth | GET /company-owner/companies/create | 200 | Pass | Pass | |
| TC-BRN-010 | Company | Collaborations index | Company owner auth | GET /company-owner/collaborations | 200 | Pass | Pass | |
| TC-BRN-011 | Brand | Member cannot access | Member user | GET /brand/dashboard | 403 | Pass | Pass | |
| TC-BRN-012 | Company | Member cannot access | Member user | GET /company-owner/dashboard | 403 | Pass | Pass | |

## PREMIUM Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-PRM-001 | Premium | FeatureLock factory works | Test DB | Create FeatureLock | Database has record | Pass | Pass | |
| TC-PRM-002 | Premium | Superadmin access documentation | Superadmin auth | GET /superadmin/documentation | 200 | Pass | Pass | |
| TC-PRM-003 | Premium | Member cannot access documentation | Member user | GET /superadmin/documentation | 403 | Pass | Pass | |

## MULTILANGUAGE Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-LAN-001 | Multilanguage | Default locale is id | None | GET / | locale=id | Pass | Pass | |
| TC-LAN-002 | Multilanguage | Switch to English | None | GET /?lang=en | Status 200 | Pass | Pass | |
| TC-LAN-003 | Multilanguage | Switch to Sunda | None | GET /?lang=su | Status 200 | Pass | Pass | |
| TC-LAN-004 | Multilanguage | Invalid locale no 500 | None | GET /?lang=xyz | No 500 | Pass | Pass | |

## ADMIN CHAT Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-CHT-001 | AdminChat | Index loads | Superadmin auth | GET /superadmin/admin-chat | 200 | Pass | Pass | |
| TC-CHT-002 | AdminChat | Create page loads | Superadmin auth | GET /superadmin/admin-chat/create | 200 | Pass | Pass | |
| TC-CHT-003 | AdminChat | Search loads | Superadmin auth | GET /superadmin/admin-chat/search | 200 | Pass | Pass | |
| TC-CHT-004 | AdminChat | Member cannot access | Member user | GET /superadmin/admin-chat | 403 | Pass | Pass | |
| TC-CHT-005 | AdminChat | Create conversation | Superadmin auth | POST /superadmin/admin-chat | Redirect, DB has record | Pass | Pass | |
| TC-CHT-006 | AdminChat | Send message | Superadmin auth | POST /superadmin/admin-chat/{id}/messages | DB has message | Pass | Pass | |
| TC-CHT-007 | AdminChat | XSS in message body | Superadmin auth | POST message with `<script>` | HTML escaped | Pass | Pass | |

## DOCUMENTATION GENERATOR Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-DOC-001 | Documentation | Dashboard loads | Superadmin auth | GET /superadmin/documentation | 200 | Pass | Pass | |
| TC-DOC-002 | Documentation | Generate index loads | Superadmin auth | GET /superadmin/documentation/generate | 200 | Pass | Pass | |
| TC-DOC-003 | Documentation | Route inventory | Superadmin auth | GET /superadmin/documentation/tools/routes | 200 | Pass | Pass | |
| TC-DOC-004 | Documentation | Database inventory | Superadmin auth | GET /superadmin/documentation/tools/database | 200 | Pass | Pass | |
| TC-DOC-005 | Documentation | Member cannot access | Member user | GET /superadmin/documentation | 403 | Pass | Pass | |
| TC-DOC-006 | Documentation | Factory works | Test DB | Create DocumentationFile | DB has record | Pass | Pass | |

## SECURITY Test Cases

| Test Case ID | Module | Scenario | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| TC-SEC-001 | Security | Guest cannot access member | Guest | GET /member/dashboard | Redirect login | Pass | Pass | |
| TC-SEC-002 | Security | Guest cannot access superadmin | Guest | GET /superadmin/dashboard | Redirect | Pass | Pass | |
| TC-SEC-003 | Security | Member 403 on superadmin | Member user | GET /superadmin/dashboard | 403 | Pass | Pass | |
| TC-SEC-004 | Security | Banned user cannot access member | Banned user | GET /member/dashboard | Redirect login | Pass | Pass | |
| TC-SEC-005 | Security | Suspended user cannot access | Suspended user | GET /member/dashboard | Redirect login | Pass | Pass | |
| TC-SEC-006 | Security | No GET for delete actions | Superadmin | GET /superadmin/communities/1 | Not 405 | Pass | Pass | |
| TC-SEC-007 | Security | Export no password | Superadmin | GET /superadmin/members/export | No "password" | Pass | Pass | |
| TC-SEC-008 | Security | Export no remember_token | Superadmin | GET /superadmin/members/export | No "remember_token" | Pass | Pass | |
| TC-SEC-009 | Security | Public no draft data | None | GET /blogs | Status 200 | Pass | Pass | |
| TC-SEC-010 | Security | Invalid locale no 500 | None | GET /?lang=<script> | No 500 | Pass | Pass | |
| TC-SEC-011 | Security | Community-owner export no password | CO auth | GET /superadmin/community-owners/export | No "password" | Pass | Pass | |
| TC-SEC-012 | Security | Suggestion requires message | None | POST /contact/suggestions empty | Validation error | Pass | Pass | |

## UNIT TEST Results

| Test Case ID | Module | Scenario | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-UNIT-001 | RedirectService | Banned user → account.restricted | account.restricted route | Pass | Pass |
| TC-UNIT-002 | RedirectService | Suspended user → account.restricted | account.restricted route | Pass | Pass |
| TC-UNIT-003 | RedirectService | Banned status → account.restricted | account.restricted route | Pass | Pass |
| TC-UNIT-004 | RedirectService | Superadmin → superadmin dashboard | superadmin.dashboard route | Pass | Pass |
| TC-UNIT-005 | RedirectService | Platform admin → superadmin dashboard | superadmin.dashboard route | Pass | Pass |
| TC-UNIT-006 | RedirectService | Company owner → company dashboard | company-owner.dashboard route | Pass | Pass |
| TC-UNIT-007 | RedirectService | Brand owner → brand dashboard | brand.dashboard route | Pass | Pass |
| TC-UNIT-008 | RedirectService | Community owner → community dashboard | community.dashboard route | Pass | Pass |
| TC-UNIT-009 | RedirectService | Member → member dashboard | member.dashboard route | Pass | Pass |
| TC-UNIT-010 | RedirectService | No role → onboarding | onboarding route | Pass | Pass |
