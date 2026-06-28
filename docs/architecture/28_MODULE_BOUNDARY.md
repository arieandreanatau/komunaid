# 28 — MODULE BOUNDARY

| Module | Belongs | Does NOT belong |
|---|---|---|
| Auth | login, register, password reset, role redirect | profile management (→Member) |
| Member | profile, interest, friend, wallet, donation, report | organization management |
| Community | community CRUD, members, sub, region, event hosting | brand/company |
| Event | event CRUD, registration, gallery, chat, finance summary, volunteer | organizer-specific concerns |
| Brand | brand CRUD, staff, campaign, event | community / company management |
| Company | company CRUD, brand portfolio, CSR, employees | community / event |
| Collaboration | proposals, status, history | event / campaign internals |
| Campaign | ads / product / job campaigns, placements | donation (→Finance) |
| Finance | wallet, donation, platform fee, payout (P3) | reporting exports |
| Notification | custom_notifications, templates, channels | analytics |
| CMS | pages, blogs, homepage_sections, contact | admin moderation |
| Admin | queues, audit log, master, reports, dashboard | any user-facing feature |
| Reporting | CSV exports, scheduled reports | analytics |
| Audit | audit log writes, login log writes | domain logic |
| Master | region, category, interest, event_type, … | anything else |
