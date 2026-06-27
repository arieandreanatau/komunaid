# KomunaID V1 + V2 Coverage Matrix

Status legend:
- ✅ Stable
- 🟡 Exists but bug/partial
- 🔁 Duplicate/conflict
- ❌ Missing
- ⏸ Phase 2

| # | Module | V1 Status | V2 Status | Current | Gap | Action |
|---|---|---|---|---|---|---|
| 1 | Public Website (home/communities/events/blogs/about/contact/lang switch) | ✅ | 🟡 | 🟡 | lang switch only on admin_chat; public pages hard-coded | Extract public strings to `lang/{id,en}/messages.php` (Phase 2) |
| 2 | Auth / Login / Register / Onboarding / Role Request | ✅ | ✅ | ✅ | none | None |
| 3 | Role Request flow | ✅ | 🟡 | ✅ | V2 `cancelled` status enum in DB; UI surfaces it | Verified |
| 4 | Superadmin dashboard + modules | ✅ | 🟡 | ✅ | `dashboard` route name collision fixed in R1 | Verified |
| 5 | Member dashboard | ✅ | ✅ | ✅ | `dashboard` collision fixed | Verified |
| 6 | Community Owner | ✅ | ✅ | ✅ | `dashboard` collision fixed | Verified |
| 7 | Event Management | ✅ | ✅ | ✅ | `events.index` ×4 deduped; V2 status enum (draft/published/ongoing/done/cancelled) in DB | Verified |
| 8 | Volunteer (event-level) | — | ✅ | ✅ | event_volunteers, event_volunteer_applications, event_volunteer_campaigns all present | Verified |
| 9 | Donation (event-level) | ✅ | ✅ | ✅ | `donations.index` ×3 deduped | Verified |
| 10 | Finance Report | ✅ | ✅ | ✅ | EventFinanceService, finance_summaries, finance_transactions all present | Smoke-tested |
| 11 | Brand Owner | ✅ | ✅ | ✅ | `dashboard` collision fixed | Verified |
| 12 | Company Owner | ✅ | ✅ | ✅ | `dashboard` collision fixed | Verified |
| 13 | Collaboration (legacy + new) | ✅ | ✅ | 🟡 | V1 `collaboration_requests` coexists with V2 `collaboration_proposals`. Brand owner still uses V1 route `brand.collaborations.*`; Community owner uses V2 `community.proposals.*` | Marked in DATABASE_REVIEW as deprecated; do not drop V1 yet |
| 14 | Premium / Trial | — | ✅ | ✅ | premium_plans, subscriptions, feature_locks, feature_usages, PremiumAccessService, SubscriptionService present. premium-locked component in views | Verified |
| 15 | CMS / Blog | 🟡 | ✅ | ✅ | cms_pages (V1 + V2 alters), blogs, homepage_sections, contact_settings, suggestions, Superadmin\Cms\* subcontrollers all present | Verified |
| 16 | Multilanguage | 🟡 | 🟡 | 🟡 | Only `admin_chat` is translated | ⏸ Phase 2 |
| 17 | Admin Chat | — | ✅ | ✅ | models, service (AdminChat/), policy, tests, controller, routes all present | Smoke-tested |
| 18 | Documentation Generator | — | ✅ | ✅ | model, service, policy, tests, controller, routes, FormRequest present | Smoke-tested |
| 19 | Testing / QA | ✅ | ✅ | ✅ | 24 pre-existing + 2 new (R10) = 26 feature tests + 1 unit | 196/196 pass |
| 20 | Deployment | 🟡 | 🟡 | ✅ | Vercel-hardened (R9) + Forge fallback documented (R11) | Done |
| 21 | Seeder / Demo Data | ✅ | ✅ | ✅ | Master/Demo split present; idempotency added in R6 | Verified |
| 22 | UI/UX Theme | 🟡 | 🟡 | ✅ | 7 layouts + 9 components + premium-locked + language-switcher present; sidebar route name collisions fixed in R1 | Verified |
| 23 | Security (CSRF/role/banned/upload/export) | ✅ | ✅ | ✅ | all middleware in place; banned tests added in R10 | Verified |
| 24 | Audit Log | ✅ | ✅ | ✅ | audit_logs + AuditLogController (superadmin) | Smoke-tested |

## Summary

- ✅ Stable: 17 modules
- 🟡 Exists but partial: 6 modules (mostly multilingual gaps — Phase 2)
- 🔁 Duplicate/conflict: 0 modules (all fixed in R1)
- ❌ Missing: 0 modules (all 24 in master prompt have at least skeleton)
- ⏸ Phase 2: 1 module (multilingual extraction)

## Conclusion

All MVP functionality is present. The only material gap is multilingual coverage beyond `admin_chat`. All other "yellow" entries are non-blocking and documented as Phase 2 work.
