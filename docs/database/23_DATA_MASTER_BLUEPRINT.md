# 23 — DATA MASTER BLUEPRINT

Master data is reference data that must be seeded. Listed in dependency order.

1. **roles** (Spatie) — superadmin, platform_admin, member, community_owner, community_admin, community_core_team, community_volunteer, event_volunteer, brand_owner, brand_admin, brand_employee, brand_intern, company_owner, company_admin, company_employee, company_intern.
2. **permissions** (Spatie) — see `20_ROLE_PERMISSION_MATRIX.md` for the action list.
3. **regions** — Indonesia provinces and cities (WIB/WITA/WIT timezone aware).
4. **master_regions** — alias table for legacy / lookup.
5. **community_categories** — Teknologi, Bisnis & Startup, Olahraga, Desain & Kreatif, Pendidikan, Sosial & Lingkungan, Seni & Budaya, Kesehatan, dll.
6. **interests** — sub-categories of community_categories.
7. **event_types** — free, paid, donation, info_only.
8. **event_visibilities** — public, member, invitation.
9. **event_statuses** — draft, submitted, approved, published, ongoing, completed, cancelled, suspended.
10. **collaboration_types** — sponsorship, co-host, tap-in, csr, ads.
11. **industries** — F&B, Fashion, Tech, FMCG, Education, Health, dll.
12. **product_categories** — derived from industries.
13. **campaign_types** — ads, product, hiring, donation.
14. **ads_placements** — feed, sidebar, event detail, community detail.
15. **csr_categories** — Lingkungan, Pendidikan, Kesehatan, Bencana, Sosial.
16. **company_types** — PT, CV, Yayasan, Komunitas, dll.
17. **brand_types** — produk, jasa, platform, hybrid.
18. **employee_positions** — manager, coordinator, staff, intern.
19. **payment_methods** — bank_transfer, e_wallet, virtual_account, gateway (P3).
20. **wallet_transaction_types** — credit, debit, hold, release.
21. **platform_fee_types** — event, withdraw, donation, subscription.
22. **report_types** — member, community, event, brand, company, finance, audit.
23. **suspension_reasons** — spam, harassment, fraud, other.
24. **notification_types** — role_request, role_approved, role_rejected, community_approved, brand_approved, event_invitation, donation_received, mention, system.
25. **cms_page_types** — about, terms, privacy, contact, faq.
26. **content_statuses** — draft, pending, published, archived.
27. **chat_room_types** — community, event, admin, direct.
28. **thread_categories** — announcement, question, discussion, feedback.
29. **payment_statuses** — pending, paid, failed, refunded, expired.
30. **approval_statuses** — pending, approved, rejected, cancelled.

All master tables have a `slug` and a `display_name` (i18n-ready via `translations`).
