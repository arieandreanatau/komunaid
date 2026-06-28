# 38 — POSITIVE & NEGATIVE TEST CASES

| # | Type | Description | Expectation |
|---|---|---|---|
| P-01 | Positive | Register with email + password | Success |
| P-02 | Positive | Register with username + password | Success |
| P-03 | Positive | Login with email | Success |
| P-04 | Positive | Login with username | Success |
| P-05 | Positive | Member joins community | Member added |
| P-06 | Positive | Community owner creates event | Draft |
| P-07 | Positive | Superadmin approves community | Active |
| P-08 | Positive | Brand owner creates brand (≤3) | Pending |
| P-09 | Positive | Company owner creates company | Pending |
| P-10 | Positive | Brand sends collaboration | Submitted |
| N-01 | Negative | Register with empty email AND username | Error |
| N-02 | Negative | Register with duplicate email | Error |
| N-03 | Negative | Register with short password | Error |
| N-04 | Negative | Login with wrong password | Error |
| N-05 | Negative | Login with banned user | Redirected |
| N-06 | Negative | Superadmin login via /login | Rejected |
| N-07 | Negative | Member login via /admin/login | Rejected |
| N-08 | Negative | Brand 4th creation | Blocked |
| N-09 | Negative | Community 2nd creation (1st pending) | Blocked |
| N-10 | Negative | Member joins 4th time same community | Blocked |
| N-11 | Negative | Non-superadmin accesses /superadmin/* | 403 |
| N-12 | Negative | Member accesses /community-owner/* | 403 |
| N-13 | Negative | Public access to /member/* | 302 to /login |
| N-14 | Negative | CSRF token missing | 419 |
| N-15 | Negative | 5+ failed logins in 1 min | 429 |
| N-16 | Negative | Forgot password 4+ times in 1 min | 429 |
| N-17 | Negative | Upload .exe as photo | Rejected |
| N-18 | Negative | SQL injection in search | Sanitized |
| N-19 | Negative | XSS in profile bio | Sanitized |
| N-20 | Negative | File upload > 2MB | Rejected |
