# KomunaID V2 — Handover Document

## 1. Executive Summary

KomunaID adalah platform komunitas digital yang menghubungkan komunitas, brand, dan member dalam satu ekosistem kolaborasi. V2 merupakan enhancement besar dari V1 dengan penambahan modul premium, multilanguage, admin chat, documentation generator, dan peningkatan UI/UX secara menyeluruh.

**Status:** MVP siap demo untuk stakeholder
**Version:** v2.0.0-mvp
**Date:** 2026-06-25

---

## 2. Project Scope

| Area | Scope |
|------|-------|
| Platform | Web-based community platform |
| Target Users | Member, Community Owner, Brand Owner, Company Owner, Superadmin |
| Core Modules | Public Website, Auth, Member, Community, Event, Brand/Company, Collaboration, Premium, CMS, Admin Chat, Documentation |
| Deployment | Local (XAMPP), Vercel (production-ready config) |

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 11, PHP 8.2+ |
| Frontend | Blade Templates, Vite 5, Tailwind CSS 4 |
| Database | MySQL 8.0 |
| Auth | Laravel Breeze (session-based) |
| Permission | Spatie Laravel Permission v6 |
| API | Laravel Sanctum |
| Build | Vite with Tailwind CSS plugin |

---

## 4. Environment

| Environment | URL | APP_ENV | APP_DEBUG |
|-------------|-----|---------|-----------|
| Local | http://127.0.0.1:8000 | local | true |
| Staging | (TBD) | staging | false |
| Production | (TBD) | production | false |

---

## 5. Role & Access

| Role | Dashboard | Key Access | Restricted From |
|------|-----------|------------|-----------------|
| superadmin | /superadmin | Full admin, CMS, users, master data, audit | — |
| platform_admin | /superadmin | Limited admin (users, communities, events) | CMS, master data, audit |
| member | /member | Profile, communities, events, friends, bookmarks, gallery | Admin, community mgmt |
| community_owner | /community-own | CRUD communities, members, events, wallet, collaborations | Brand/company mgmt |
| community_admin | /member | Limited community management | Event creation |
| community_volunteer | /member | Volunteer activities | Event creation |
| brand_owner | /brand | CRUD brands, proposals, campaigns, community discovery | Community/company mgmt |
| company_owner | /company-owner | CRUD companies, manage brands, proposals | Community mgmt |
| brand_staff | /brand | Limited brand operations | Proposal creation |
| event_volunteer | /member | Volunteer activities | Event creation |

---

## 6. Module Summary

| Module | Status | Controllers | Views | Notes |
|--------|--------|-------------|-------|-------|
| Public Website | Complete | 2 | 13+ | Homepage, communities, events, blog, about, contact |
| Auth & Login | Complete | 6 | 8 | Register, login, password reset, onboarding, role request |
| Superadmin | Complete | 20+ | 75+ | Full admin panel with CMS, chat, documentation |
| Member | Complete | 15 | 26 | Dashboard, profile, communities, events, friends, gallery |
| Community Owner | Complete | 12 | 2+ | Community CRUD, members, events, wallet, collaborations |
| Brand Owner | Complete | 9 | 14 | Brand CRUD, campaigns, proposals, community discovery |
| Company Owner | Complete | 5 | 10 | Company CRUD, brand management, proposals |
| Event | Complete | (within modules) | — | CRUD, registration, volunteers, donations, finance |
| Premium/Trial | Complete | (integrated) | — | Feature locks, plans, trial subscriptions |
| Multilanguage | Partial | — | — | id/en supported, su optional. Lang files limited to admin_chat |
| Admin Chat | Complete | 1 | 5+ | Conversations, messages, participants, search, archive |
| Documentation | Complete | 1 | 5+ | BRD/FRD/SRS generator, preview, download |
| CMS | Complete | (within superadmin) | — | Homepage, blogs, pages, contact, suggestions |

---

## 7. Database Summary

| Category | Tables | Migrations |
|----------|--------|------------|
| Users/Auth | users, profiles, role_requests, login_logs, roles, permissions | 8 |
| Communities | communities, community_members, community_managements, community_volunteers, community_campaigns, community_regions, community_subgroups, community_bans, community_internal_roles, community_member_roles, community_ownership_transfers, community_bookmarks | 12 |
| Events | events, event_registrations, event_volunteer_campaigns, event_volunteer_applications, event_volunteers, event_donations, event_finance_transactions, event_finance_summaries, event_galleries, event_chats, event_chat_threads, event_types, event_payment_confirmations | 13 |
| Brands/Companies | brands, brand_members, brand_ownership_transfers, companies, company_brand_members, campaigns | 6 |
| Collaborations | collaboration_proposals, collaboration_requests, collaboration_types, community_campaign_applications | 4 |
| Finance | wallets, wallet_transactions, donations, platform_fees, premium_plans, subscriptions | 6 |
| CMS | cms_pages, blogs, homepage_sections, contact_settings, suggestions, custom_notifications | 6 |
| System | feature_locks, feature_usages, translations, documentation_files, audit_logs, approval_logs | 6 |
| Gallery | member_galleries, member_histories, member_join_histories | 3 |
| Admin Chat | admin_conversations, admin_conversation_participants, admin_messages | 3 |
| Region | regions, master_regions, community_regions | 3 |
| Friendship | friendships, interests, interest_user | 3 |
| **Total** | **~69 models** | **98 migrations** |

---

## 8. Seeder Summary

### Master Seeders (always run)

| Seeder | Data | Idempotent |
|--------|------|------------|
| RoleSeeder | 11 roles (Spatie) | Yes (firstOrCreate) |
| SuperadminSeeder | 1 superadmin user | Yes (updateOrCreate) |
| CommunityCategorySeeder | 10 categories | Yes (updateOrCreate) |
| InterestSeeder | 15 interests | Yes (firstOrCreate) |
| RegionSeeder | 6 provinces + 9 cities | Yes (updateOrCreate) |
| EventTypeSeeder | 9 event types | Yes (updateOrCreate) |
| CollaborationTypeSeeder | 7 collaboration types | Yes (updateOrCreate) |
| ContactSettingSeeder | 3 contact settings | Yes (updateOrCreate) |
| FeatureLockSeeder | 17 feature locks | Yes (updateOrCreate) |
| PremiumPlanSeeder | 3 premium plans | Yes (updateOrCreate) |
| CmsPageSeeder | 1 about page (id) | Yes (updateOrCreate) |
| HomepageSectionSeeder | 6 homepage sections (id) | Yes (updateOrCreate) |

### Demo Seeders (local only)

| Seeder | Data | Depends On |
|--------|------|------------|
| DemoUserSeeder | 8 demo users (all roles) | RoleSeeder |
| DemoCommunitySeeder | 5 communities + members | DemoUserSeeder, CommunityCategorySeeder |
| DemoEventSeeder | 5 events + registrations + donations | DemoCommunitySeeder |
| DemoBrandCompanySeeder | 2 companies + 3 brands | DemoUserSeeder |
| DemoCollaborationSeeder | 3 collaboration proposals | DemoBrandCompanySeeder, DemoCommunitySeeder |
| DemoPremiumTrialSeeder | 3 trial subscriptions | DemoUserSeeder, PremiumPlanSeeder |
| DemoCmsContentSeeder | 6 homepage sections + 4 CMS pages + 5 blogs | DemoUserSeeder |
| DemoAdminChatSeeder | 1 conversation + 3 messages | DemoUserSeeder |

---

## 9. Demo Data Summary

### Demo Users

| Email | Password | Role | Status |
|-------|----------|------|--------|
| superadmin@komuna.test | password | superadmin | active |
| admin@komuna.test | password | platform_admin | active |
| member@komuna.test | password | member | active |
| community.owner@komuna.test | password | community_owner | active |
| brand.owner@komuna.test | password | brand_owner | active |
| company.owner@komuna.test | password | company_owner | active |
| banned@komuna.test | password | member | banned |
| suspended@komuna.test | password | member | suspended |

**WARNING:** Password `password` hanya untuk local/staging. JANGAN gunakan di production.

### Demo Communities

1. Jakarta Book Party (Pendidikan, Jakarta, public)
2. Komunitas Urban Runner (Olahraga, Jakarta, public)
3. Bandung Creative Circle (Kreatif, Bandung, public)
4. Komunitas Volunteer Sosial (Sosial, Tangerang, public)
5. Komunitas Private Demo (Teknologi, Jakarta, private)

### Demo Events

1. Book Party Mingguan (free, offline, +7 days)
2. Workshop Menulis Review Buku (free, offline, +14 days)
3. Volunteer Trip Demo (volunteer, offline, +21 days, open donation)
4. Charity Run Demo (charity, offline, +30 days, open donation)
5. Draft Event Demo (draft, not visible publicly)

### Demo Brands/Companies

- PT Komuna Demo Indonesia (company)
- PT Brand Nusantara Demo (company)
- Kopi Komunitas (brand, F&B, under PT Komuna Demo)
- BukuKita (brand, Buku, standalone)
- Sportify Local (brand, Sport, under PT Brand Nusantara)

### Demo Collaborations

1. Proposal Sponsorship Book Party (sent)
2. Proposal Product Support Charity Run (accepted)
3. Proposal Media Partner Volunteer Trip (draft)

### Demo Premium/Trial

- community.owner: active trial (14 days)
- brand.owner: expired trial
- company.owner: active trial (14 days)

---

## 10. Test Summary

| Test Type | Status | Notes |
|-----------|--------|-------|
| Unit Tests | Not implemented | Only TestCase.php boilerplate exists |
| Feature Tests | Not implemented | No test files in tests/Feature/ |
| Manual Testing | Partial | Basic smoke test completed |
| php artisan test | Passes (0 tests) | No assertions |

**Known Issue:** No automated test suite. See Known Issues document.

---

## 11. Deployment Summary

### Local Setup (Fresh)
```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
npm run build
php artisan optimize:clear
php artisan serve
```

### Local Update
```bash
php artisan optimize:clear
php artisan migrate
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=FeatureLockSeeder
php artisan db:seed --class=PremiumPlanSeeder
npm run build
php artisan serve
```

### Production (Vercel)
```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 12. Security Summary

| Item | Status |
|------|--------|
| .env not in docs | ✅ |
| APP_DEBUG false in production | ✅ (checklist) |
| Superadmin route protected | ✅ (EnsureSuperadmin middleware) |
| Member route protected | ✅ (auth + active_user middleware) |
| CSRF active | ✅ (Laravel default) |
| Delete/archive not via GET | ✅ |
| Upload validation | ✅ |
| Banned/suspended user blocked | ✅ (ActiveUser middleware) |
| Public hides private/draft | ✅ |
| No production credentials in docs | ✅ |
| Password hidden in model | ✅ ($hidden array) |
| Spatie permission middleware | ✅ |

---

## 13. Known Issues

1. No automated test suite (only boilerplate)
2. Multilanguage limited to admin_chat.php lang file
3. Su (Sunda) language not implemented
4. Dashboard sidebar had duplicate member items (fixed)
5. Some community-owner views are minimal (only proposals)
6. `source-code-laravel/` directory is stale duplicate
7. No real logo file (text-based logo fallback)
8. `storage/app/qa/` directory did not exist (created)

---

## 14. Blocking Issues

None identified. All critical features functional for demo.

---

## 15. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| No test suite | High | Certain | Implement tests in Phase 2 |
| Demo password in code | Medium | Low | Only for local, documented warning |
| No payment gateway | Medium | Certain | Planned for Phase 2 |
| No realtime chat | Low | Certain | Admin chat available, real-time planned |
| Limited multilanguage | Low | Medium | id/en sufficient for MVP |

---

## 16. Maintenance Notes

1. Run `php artisan optimize:clear` after any config/view changes
2. Run `php artisan migrate` after pulling new migrations
3. Demo seeders are idempotent — safe to re-run
4. Backup database before production migration
5. Monitor `storage/logs/laravel.log` for errors
6. Clear Spatie permission cache: `php artisan permission:cache-reset`

---

## 17. Future Roadmap

See [KNOWN_ISSUES_AND_ROADMAP.md](KNOWN_ISSUES_AND_ROADMAP.md) for full Phase 2 roadmap.

Priority items:
1. Payment gateway integration
2. Real-time chat (Laravel Reverb/Pusher)
3. QR attendance for events
4. Certificate generator
5. Full multilanguage (id/en/su)
6. Automated test suite
7. API for mobile app
8. Advanced analytics dashboard

---

## 18. Next Development Recommendations

1. Implement automated tests (PHPUnit/Pest)
2. Add payment gateway (Midtrans/Xendit)
3. Build REST API for mobile app
4. Implement real-time chat
5. Add email notifications
6. Build advanced analytics
7. Add QR attendance
8. Implement certificate generator
9. Full multilanguage support
10. Performance optimization (caching, query optimization)

---

## 19. Handover Checklist

- [x] All modules functional
- [x] Demo data seeded
- [x] README updated
- [x] Handover document created
- [x] Known issues documented
- [x] Release notes created
- [x] Readiness matrix completed
- [x] No production credentials exposed
- [x] All seeders idempotent
- [x] Security checklist passed
- [ ] Automated tests (known gap)
- [ ] Full multilanguage (known gap)
- [ ] Payment integration (Phase 2)

---

## 20. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | _________________ | _______ | _________ |
| Tech Lead | _________________ | _______ | _________ |
| QA Lead | _________________ | _______ | _________ |

---

> **Document Version:** 1.0
> **Last Updated:** 2026-06-25
> **Author:** KomunaID Development Team
