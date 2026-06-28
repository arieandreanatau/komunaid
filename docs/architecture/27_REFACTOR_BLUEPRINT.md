# 27 — REFACTOR BLUEPRINT

## Goal
Move from a flat controller layout to a **modular monolith** without rewriting from scratch. Each module is a folder containing: `Http/Controllers`, `Http/Requests`, `Models`, `Services`, `Policies`, `Routes`, `Views`, `Livewire` (if any), `Tests`.

## Target module layout
```
app/Modules/
  Auth/
  PublicWebsite/
  Member/
  Community/
  Event/
  Brand/
  Company/
  Collaboration/
  Campaign/
  Finance/
  Notification/
  Cms/
  Admin/
  Reporting/
  AuditLog/
  MasterData/
```

## Strategy
1. **No big-bang migration**. Move files gradually.
2. **Composer PSR-4**: add `App\Modules\\` to `composer.json` autoload.
3. **Routes**: split `routes/web.php` into `app/Modules/*/routes.php` and require them from a single file.
4. **Tests**: keep them in `tests/` (Laravel convention) but group by feature name.
5. **Backwards compat**: keep `App\Http\Controllers\Auth\X` until the equivalent `App\Modules\Auth\Http\Controllers\X` is verified.

## Phase 1 (P1)
- Auth, Member, Community, Event, Brand, Company, Admin.
- Move one model + controller at a time.
- Run `php artisan test` after each move.

## Phase 2 (P2)
- Collaboration, Campaign, Finance, Notification, CMS, Reporting, Audit, Master.
