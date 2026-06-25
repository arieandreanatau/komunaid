# Bug Report — KomunaID V2

| Bug ID | Module | Severity | Priority | Description | Steps to Reproduce | Expected Result | Actual Result | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| BUG-001 | Auth | High | P1 | Superadmin\LoginController missing `use App\Models\User` import | POST /admin/login | Login works | PHP FatalError: Undefined variable User | Fixed | Added use statement |
| BUG-002 | Auth | Medium | P2 | RedirectByRoleService references `admin_platform` role but seeder has `platform_admin` | Login as platform_admin | Redirect to superadmin dashboard | Redirect to onboarding (dead code) | Fixed | Changed to `platform_admin` |
| BUG-003 | Auth | Low | P3 | RedirectByRoleService references `community_pengurus` role which doesn't exist | Login as community_admin | Redirect to member dashboard | Redirect to onboarding (dead code) | Fixed | Changed to `community_admin` |
| BUG-004 | Migration | High | P1 | Migration `000021_alter_events_table_for_v2` references `is_featured` column not yet created | migrate:fresh | Migration succeeds | SQLSTATE[42S22] Column not found | Fixed | Added is_featured column creation |
| BUG-005 | Migration | Medium | P2 | Migration `000048_add_status_to_events_table` duplicates column additions | migrate:fresh | No error | Duplicate column error | Fixed | Added conditional checks |
| BUG-006 | Seeder | Medium | P2 | DemoUserSeeder missing admin_platform, banned, suspended demo users | db:seed --class=DemoUserSeeder | 7 users seeded | 5 users seeded | Fixed | Added platform_admin, banned, suspended |
| BUG-007 | Route | High | P1 | Duplicate communities route groups cause route name collision (`public.communities.index` overwritten) | GET / | Homepage loads | RouteNotFoundException | Fixed | Merged route groups |
| BUG-008 | Route | High | P1 | Views reference `communities.directory`, `communities.detail`, `public.events.index` but routes use different names | GET / | Public pages load | RouteNotFoundException | Fixed | Updated view references |
| BUG-009 | Route | Medium | P2 | Views reference `superadmin.cms.blogs`, `superadmin.cms.contact`, etc. but routes define `.index` suffix | GET /superadmin/cms | CMS loads | RouteNotFoundException | Fixed | Added alias route names |
| BUG-010 | View | High | P1 | Dashboard layout `$sidebarBg` undefined causing 500 on all dashboards | GET /member/dashboard | Dashboard loads | Undefined variable $sidebarBg 500 | Fixed | Added null coalescing defaults |
| BUG-011 | View | High | P1 | Dashboard layout `$activeBg`, `$sidebarActive`, `$sidebarHover` undefined | GET /member/dashboard | Dashboard loads | Undefined variable $activeBg 500 | Fixed | Added null coalescing defaults in @php block |
| BUG-012 | View | Medium | P2 | `member.galleries.index` view not found (controller references wrong view name) | GET /member/gallery | Gallery loads | ViewNotFoundException | Deferred | View file naming issue |
| BUG-013 | View | Medium | P2 | `events.index` route not defined in member view context | GET /member/my-registrations | Page loads | RouteNotFoundException | Deferred | View references public route |
| BUG-014 | Security | Low | P4 | EnsureActiveUser middleware only checks `banned_at`, not `status` field | Login as suspended user with no banned_at | Logout | Suspended user passes through | Deferred | Inconsistency noted |
| BUG-015 | Auth | Low | P4 | AuthenticatedSessionController logs in banned user briefly before logging out | Login as banned | No login | Brief session created then destroyed | Deferred | Security concern minor |

## Bug Summary

| Severity | Count | Fixed | Open |
|---|---|---|---|
| Critical | 0 | 0 | 0 |
| High | 5 | 5 | 0 |
| Medium | 6 | 4 | 2 |
| Low | 4 | 2 | 2 |
| **Total** | **15** | **11** | **4** |

## Blocking Issues

None. All critical and high severity bugs have been fixed.
