# 02 — Register Member Only

## Route
- `GET /v2/register`
- `POST /v2/register`

## Controller
`App\Http\Controllers\Simplified\Auth\RegisterController`

## Form Request
`App\Http\Requests\Simplified\Auth\RegisterRequest`

## Service
`App\Services\Simplified\Auth\RegisterMemberService`

## View
`resources/views/simplified/auth/register.blade.php`

## Field

| Field | Rule |
|---|---|
| name | required, string, max 255 |
| username | required, alpha_dash, min 4, max 30, unique:users |
| email | required, email, unique:users |
| phone | nullable, string, max 30 |
| password | required, confirmed, min 8 (Password rule) |
| agree_terms | accepted |

## Flow Sukses
1. Buat `User` dengan password di-hash.
2. `default_role = 'member'`, `status = 'active'`, `onboarding_completed = true`.
3. Buat `Profile` (firstOrCreate by user_id).
4. Assign Spatie role `member`.
5. Audit log `user_registered`.
6. Auto-login.
7. Redirect ke `/v2/dashboard` dengan pesan sukses.

## Tabel Terdampak
- `users`
- `profiles`
- `model_has_roles` (Spatie)
- `audit_logs`

## Validasi Error Tampil
- Validation errors ditampilkan di atas form (lihat `register.blade.php`).

## Security
- CSRF aktif (`@csrf`).
- Password di-hash via `Hash::make`.
- Tidak ada bypass auth.
