# 40 — TEST EXECUTION RESULT (LIVE VERCEL)

Date: 2026-06-27
URL: https://komunaidv2-komuna.vercel.app/
Method: HTTP GET (no credentials used for safety).

| Test Case ID | Module | URL | Expected | Actual | Status | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| TC-PUB-01 | Public | `/` | 200 + hero + brand | 200 | PASS | curl | landing, communities, blog, footer all present |
| TC-PUB-02 | Public | `/login` | 200 + form | 200 | PASS | curl | form fields present |
| TC-PUB-03 | Public | `/register` | 200 + form | 200 | PASS | curl | form fields present |
| TC-PUB-04 | Public | `/forgot-password` | 200 + form | 200 | PASS | curl | — |
| TC-PUB-05 | Public | `/reset-password/x` | 200 template | 200 | PASS | curl | token check happens on submit |
| TC-PUB-06 | Public | `/communities` | 200 | **404** | FAIL | curl | LIVE-001 |
| TC-PUB-07 | Public | `/events` | 200 | 200 | PASS | curl | — |
| TC-PUB-08 | Public | `/blog` | 200 | **404** | FAIL | curl | LIVE-001 |
| TC-PUB-09 | Public | `/about` | 200 | 200 | PASS | curl | — |
| TC-PUB-10 | Public | `/contact` | 200 | 200 | PASS | curl | — |
| TC-PUB-11 | Public | `/admin/login` | 200 | 200 | PASS | curl | superadmin login form |
| TC-PUB-12 | Public | `/superadmin/login` | 200 | **404** | FAIL | curl | documented: actual URL is `/admin/login` |
| TC-PUB-13 | Public | `/onboarding` (guest) | 302 to /login | 302 → /login | PASS | curl | auth enforced |

## Verdict
- **9/12 public smoke checks pass.**
- **3/12 fail with 404**, all explainable by missing public routes or by URL aliasing.
- **No full UAT** was performed because no production credentials were provided. To complete UAT, request from the project owner:
  - 1 superadmin demo account
  - 1 community_owner demo account
  - 1 brand_owner demo account
  - 1 company_owner demo account
  - 1 member demo account
- All credentials, once received, must be stored in `.env` and never committed.
