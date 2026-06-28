# 43 — NEW DEVELOPMENT PLAN

Backlog is the union of `13_FEATURE_BACKLOG_PRIORITY.md` and `41_BUG_DEFECT_LOG.md`. Each item has a unique Feature ID.

| Feature ID | Module | Source | Priority | Description | Acceptance Criteria | Files / DB Impact | Risk | Status |
|---|---|---|---|---|---|---|---|---|
| F-001 | Public | LIVE-001 | P1 | Add `/communities` and `/blog` public routes | 200 on both routes | `routes/web.php` + 2 controllers | Low | PLANNED |
| F-002 | Auth UX | LIVE-003 | P1 | Top-of-form error on auth views | `<x-alert>` visible when `$errors->any()` | `register.blade.php`, `login.blade.php` | Low | PLANNED |
| F-003 | Auth | SEC-01 | P1 | Login throttle | 6th attempt in 1 min → 429 | `routes/web.php` | Low | PLANNED |
| F-004 | Auth | SEC-06 | P1 | Forgot password throttle | 4th attempt in 1 min → 429 | `routes/web.php` | Low | PLANNED |
| F-005 | Ops | LOCAL-001 | P1 | Roles/permissions seeder | `migrate --seed` produces all roles + master | `database/seeders/*` | Medium | PLANNED |
| F-006 | Brand | BR-006 | P1 | Brand max-3 rule | 4th brand creation blocked | `StoreBrandRequest` | Medium | PLANNED |
| F-007 | Community | BR-005 | P1 | Community 1st-approval rule | 2nd community creation blocked while 1st pending | `StoreCommunityRequest` | Medium | PLANNED |
| F-008 | Community | BR-R-08 | P1 | 3x join/leave rule | 4th join blocked | `Member/CommunityController@join` | Medium | PLANNED |
| F-009 | Event | BR-003 | P1 | Event state machine helper | `Event::transitionTo($status)` | `app/Models/Event.php` | Low | PLANNED |
| F-010 | Security | SEC-08,09,10 | P1 | CSP/HSTS/Referrer headers | Headers present in response | new `SecureHeaders` middleware | Low | PLANNED |
| F-011 | Security | SEC-12 | P1 | Audit log coverage | All admin actions logged | `AuditService` | Medium | PLANNED |
| F-012 | Security | SEC-05 | P1 | File upload MIME validation | Reject non-image | `StoreEventGalleryRequest` etc. | Low | PLANNED |
| F-013 | Finance | BR-R-15 | P2 | Wallet topup UI (placeholder) | UI exists, gateway pending | `member/wallet/topup.blade.php` + route | Medium | PLANNED |
| F-014 | Event | V3 | P2 | Event tap-in | `event_tap_ins` table + flow | new migration + model | Medium | PLANNED |
| F-015 | Brand | V3 | P2 | Brand product | `products` + `product_categories` tables | new migration + model + controller | Medium | PLANNED |
| F-016 | Company | V3 | P2 | CSR program | `csr_campaigns` table | new migration + model + controller | Medium | PLANNED |
| F-017 | Finance | V3 | P3 | Payment gateway | Midtrans / Xendit integration | service + webhook | High | PLANNED |
| F-018 | Cross | V3 | P3 | Realtime chat | WebSocket | new infrastructure | High | PLANNED |
| F-019 | Cross | V3 | P4 | Mobile app | n/a | n/a | n/a | DEFERRED |
| F-020 | Cross | V3 | P4 | AI matching | n/a | n/a | n/a | DEFERRED |

## 43.1 Plan order (for the next sprint)
1. F-005 (seeder) — must run before any other test.
2. F-003, F-004 (throttle).
3. F-002 (UX alert).
4. F-001 (public routes).
5. F-006, F-007, F-008, F-009 (business rules).
6. F-010, F-011, F-012 (security).
7. F-013 (wallet UI placeholder).
8. F-014, F-015, F-016 (new entities).
9. F-017, F-018 (Phase 3).
