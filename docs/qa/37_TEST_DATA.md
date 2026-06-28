# 37 — TEST DATA

> Credentials must never be committed to a public repo. The values below are for **local / staging** only.

## Roles / accounts (local)
| Role | Login | Password |
|---|---|---|
| superadmin | superadmin@komunaid.test | (seeded) |
| platform_admin | platform.admin@komunaid.test | (seeded) |
| community_owner | owner.community@komunaid.test | (seeded) |
| brand_owner | owner.brand@komunaid.test | (seeded) |
| company_owner | owner.company@komunaid.test | (seeded) |
| member | member@komunaid.test | (seeded) |

> For automated tests, use `actingAs($user)` with the in-memory DB (`RefreshDatabase` style or `DatabaseTransactions` with seeded roles). The `TestCase` already seeds the role set.

## Master data (already seeded by migrations)
- 4 community categories (Teknologi, Bisnis & Startup, Olahraga, Desain & Kreatif, Pendidikan, Sosial & Lingkungan, Seni & Budaya, Kesehatan).
- 6 communities (Laravel Indonesia, React Jakarta, Startup Bandung, UI/UX Surabaya, Running Jakarta, DevOps Indonesia).
- 3 blog posts.
- Regions, event types, collaboration types, etc.

## Test-specific data (create in test setUp)
- New user: `name=tester, username=tester1, email=tester1@x.io, password=password123`.
- Banned user: same as above but `users.banned_at = now()`.
- Suspended user: same but `users.status = 'suspended'`.
- Community with 3+ join history for a member.
- Brand with 3 existing brands for a brand_owner.
- Pending community / brand / company for approval tests.
- Submitted event for approval tests.
- Donation with known donor + recipient.
