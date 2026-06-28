# 03 — Unified Login Flow

## Route
- `GET /v2/login`
- `POST /v2/login`
- `POST /v2/logout`

## Controller
`App\Http\Controllers\Simplified\Auth\LoginController`

## Form Request
`App\Http\Requests\Simplified\Auth\LoginRequest`

## Service
`App\Services\Simplified\Auth\LoginService`

## View
`resources/views/simplified/auth/login.blade.php`

## Form

| Field | Rule |
|---|---|
| login | required, string, max 255 (email atau username) |
| password | required |
| remember | nullable, boolean |

## Algoritma
1. Cari user dengan `where('email', $login)->orWhere('username', $login)->first()`.
2. Jika tidak ada → error "Email/username atau password salah." + log `LoginLog(success=false)`.
3. Cek password via `Hash::check`.
4. Cek status banned/suspended via `User::isBannedOrSuspended()`.
5. Jika suspended → redirect ke `account.restricted` + log.
6. Jika sukses → `Auth::login`, regenerate session, update `last_login_at/ip`, log `user_logged_in`.

## Audit Log
- `user_logged_in` (audit_logs) dengan IP dan user-agent.

## LoginLog
- Tiap percobaan (gagal/berhasil) dicatat di tabel `login_logs`.

## Tabel Terdampak
- `users` (update last_login_at/ip)
- `login_logs`
- `audit_logs`
- `sessions` (regenerate)

## Banned/Suspended
- Akun suspended akan diarahkan ke halaman `account.restricted` (route dari legacy flow; fallback).

## Auto Redirect
- `redirect()->intended(route('simplified.dashboard'))`.
