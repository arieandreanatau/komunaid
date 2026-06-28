# 04 — Unused File Candidates

| File | Why Suspected | Search Evidence | Risk If Deleted | Recommendation |
|---|---|---|---|---|
| `add_new_users.php` (root) | one-off script | No route/controller reference | low | archive |
| `check_users.php` (root) | one-off script | No reference | low | archive |
| `test_logins.php` (root) | one-off script | No reference | low | archive |
| `composer-setup.php` (root) | one-off installer | No reference | low | archive |
| `composer.phar` (root) | local binary | No reference | low | archive |
| `ChatGPT Image Jun 27, 2026, …png` (root) | unrelated artifact | No reference | low | archive |
| `app/Http/Controllers/Auth/OnboardingController.php` | replaced by v2 flow | Not in v2 routes | low (legacy masih hidup) | keep during transition, archive later |
| `app/Http/Controllers/Superadmin/RoleRequestController.php` | legacy approval | Only used by legacy flow | medium (admin masih pakai) | keep until v2 fully rolled out |
| `app/Http/Controllers/Member/RoleRequestController.php` | legacy role request | Only used by legacy flow | medium | keep until transition |
| `resources/views/auth/onboarding/*` | legacy onboarding views | Not used by v2 | low | keep until transition |

## Files in `.gitignore` (verify)
- `node_modules/`
- `vendor/`
- `.env*` (except `.env.example`)

## Files Kept (not candidates for deletion)
- `composer.json` / `composer.lock`
- `package.json` / `package-lock.json`
- `vite.config.js`
- `artisan`
- `bootstrap/app.php`
- `config/*` (semua config)
- `database/migrations/*` (semua sudah pernah dijalankan)
- `routes/web.php`
- `.env.example`
- `app/Models/*` (semua model dipakai; hanya test ke usage)
