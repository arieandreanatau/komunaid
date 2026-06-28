# 12 — MVP SCOPE AND PHASED ROADMAP

## MVP (V3.0) — what must work
- All P0 + P1 items below.
- All P0 bugs fixed.
- Test suite green.
- Brand identity consistent.
- Live URL stable for public pages.

## P0 — Stabilization (must)
- Local project runs, `route:list`, `migrate:status`, `npm run build` succeed.
- `komunaid_test` database created and migrated (DONE in this audit).
- Test suite green (DONE — 201/201 pass).
- Live `/`, `/login`, `/register`, `/forgot-password`, `/about`, `/contact`, `/events`, `/admin/login` return 200.
- Add `/communities` and `/blog` public routes.
- Top-of-form error summary on register & login.
- Login throttling on `/login`.
- Seed roles + permissions on fresh `migrate --seed`.

## P1 — MVP Wajib
- Public website, register, login, forgot/reset, community directory, event directory, member dashboard, community owner registration/approval, community CRUD basic, community join/leave, event creation basic, event registration basic, brand/company profile basic, collaboration request basic, superadmin approval, basic notification, basic report/export, audit log, role/permission matrix implemented, CMS/blog basic.

## P2 — Enhancement penting
- Sub community, regional, pengurus/volunteer period, gallery, bookmark, friend system basic, campaign basic, product catalog basic, CSR request basic, event tap-in basic, platform fee rule basic, employee/staff management basic, dashboard metrics expanded, top-of-form error summary, premium/subscription UI.

## P3 — Advanced
- Wallet topup UI + payment gateway integration, donation payment, payout/settlement, invoice/receipt, realtime chat, thread/reply full, advanced campaign marketplace, lowongan/company hiring campaign, advanced moderation, advanced analytics, recommendation engine.

## P4 / Future
- Mobile app, AI matching, full marketplace, multi-tenant enterprise package, advanced CRM, public API ecosystem, subscription billing, complex financial ledger.
