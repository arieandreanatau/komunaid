# 35 — TEST SCENARIO

| # | Scenario | Roles | Pre | Steps (summary) | Expected |
|---|---|---|---|---|---|
| TS-01 | Register member | guest | no session | /register → submit valid form | User created, role member, redirected to /onboarding |
| TS-02 | Register fails with empty form | guest | no session | /register → submit empty | Per-field + top-of-form error |
| TS-03 | Register with duplicate email | guest | existing user | /register → submit with same email | Email error shown |
| TS-04 | Register with duplicate username | guest | existing user | /register → submit with same username | Username error shown |
| TS-05 | Login with email | member | no session | /login with email | Redirected to member dashboard |
| TS-06 | Login with username | member | no session | /login with username | Redirected to member dashboard |
| TS-07 | Login with wrong password | any | no session | /login with wrong password | Error, login log written |
| TS-08 | Login with throttled IP | any | 5 failed in 1 min | /login again | 429 throttled |
| TS-09 | Login banned user | banned | — | /login | Redirected to /account/restricted |
| TS-10 | Superadmin login | superadmin | — | /admin/login | Redirected to superadmin dashboard |
| TS-11 | Superadmin tries /login | superadmin | — | /login | Rejected with "login via admin panel" |
| TS-12 | Member tries /admin/login | member | — | /admin/login | 403 or login error |
| TS-13 | Logout | any | logged in | POST /logout | Session invalidated, redirected to /login |
| TS-14 | Forgot password | any | — | /forgot-password with email | Status message |
| TS-15 | Reset password with valid token | any | token in email | /reset-password/{token} → submit new password | Password changed, login |
| TS-16 | Community owner submits community | community_owner | role | /community-owner/communities/create | Status pending, admin notified |
| TS-17 | Superadmin approves community | superadmin | pending | /superadmin/communities/{id}/approve | Status active, owner notified |
| TS-18 | Superadmin rejects community | superadmin | pending | /superadmin/communities/{id}/reject with reason | Status rejected, owner notified |
| TS-19 | Member joins community | member | community approved | /communities/{slug} → Gabung | Member added, join history logged |
| TS-20 | Member re-joins 4 times | member | already joined 3x | /communities/{slug} → Gabung | Blocked with reason |
| TS-21 | Member leaves community | member | member | /communities/{slug} → Keluar | Soft leave, history logged |
| TS-22 | Community owner creates event | community_owner | community approved | /community-owner/events/create | Event draft → submit |
| TS-23 | Superadmin approves paid event | superadmin | event submitted | /superadmin/events/{id}/approve | Status published |
| TS-24 | Member registers for free event | member | event published | /events/{slug} → Daftar | Registration created |
| TS-25 | Member registers for paid event | member | event published, fee > 0 | /events/{slug} → Daftar | Payment flow |
| TS-26 | Member donates to event | member | event donation mode | /events/{slug} → Donasi | Donation recorded |
| TS-27 | Member applies volunteer | member | event volunteer open | /events/{slug} → Volunteer | Application created |
| TS-28 | Brand owner submits brand | brand_owner | role | /brand-owner/brands/create | Status pending |
| TS-29 | Brand limit | brand_owner | already 3 brands | /brand-owner/brands/create | Blocked |
| TS-30 | Brand owner creates event | brand_owner | brand approved | /brand-owner/events/create | Event draft |
| TS-31 | Company owner creates company | company_owner | role | /company-owner/companies/create | Status pending |
| TS-32 | Company owner adds brand | company_owner | company approved | /company-owner/brands/create | Brand created under company |
| TS-33 | Brand sends collaboration proposal | brand_owner | brand approved | /brand-owner/collaborations/create | Proposal submitted |
| TS-34 | Community accepts collaboration | community_owner | proposal submitted | /community-owner/collaborations/{id}/accept | Status accepted |
| TS-35 | Community cancels collaboration | community_owner | proposal submitted | /community-owner/collaborations/{id}/cancel | Status cancelled |
| TS-36 | Member reports content | member | — | /reports → submit | Report recorded |
| TS-37 | Superadmin views audit log | superadmin | — | /superadmin/audit-logs | List of actions |
| TS-38 | Superadmin views login log | superadmin | — | /superadmin/login-logs | List of login events |
| TS-39 | Member downloads own report | member | — | /member/reports | CSV download |
| TS-40 | Superadmin exports all members | superadmin | — | /superadmin/reports/members | CSV |
| TS-41 | Public landing | guest | — | GET / | 200, hero, communities, blog, footer |
| TS-42 | Public /communities | guest | — | GET /communities (post fix) | 200 + list |
| TS-43 | Public /blog | guest | — | GET /blog (post fix) | 200 + list |
| TS-44 | Public /events | guest | — | GET /events | 200 + list |
| TS-45 | Public /about | guest | — | GET /about | 200 |
| TS-46 | Public /contact | guest | — | GET /contact | 200 |
| TS-47 | Locale switch | guest | — | click EN | Page re-renders in English |
| TS-48 | Mobile responsive | any | — | resize to 375px | Layout adapts |
| TS-49 | Brand identity colors | any | — | inspect button | Uses `--color-komuna-blue` |
| TS-50 | Logo present in navbar | any | — | inspect | Yes, on every page |
