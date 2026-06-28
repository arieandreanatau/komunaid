# 15 — USE CASES (UC-)

## UC-01 Register member
- **Actor**: guest
- **Pre**: no session
- **Flow**: open `/register` → submit form (email/username, password) → server validates → create user + profile + `member` role → login → redirect to `/onboarding`
- **Alt**: validation error → show per-field + top-of-form error
- **Post**: user is logged in, `last_login_at` set

## UC-02 Login
- **Actor**: any
- **Pre**: not authenticated
- **Flow**: POST `/login` with login+password → server validates → looks up by email or username → checks hash → checks `isBannedOrSuspended` → checks role → `Auth::login` + regenerate → redirect per role
- **Alt**: wrong creds → "Data login tidak sesuai." → log to `login_logs`
- **Post**: session active, login log created

## UC-03 Logout
- **Actor**: authenticated
- **Pre**: session active
- **Flow**: POST `/logout` → invalidate session, regenerate token → redirect to `/login`
- **Post**: no session

## UC-04 Forgot password
- **Actor**: guest
- **Flow**: POST `/forgot-password` with email → always show "If email exists, we sent a link" → if user exists, send reset link
- **Post**: status flash

## UC-05 Reset password
- **Actor**: guest with token
- **Flow**: GET `/reset-password/{token}` → POST new password → server validates token + password rules → update → login
- **Post**: password changed, login

## UC-06 Community owner submits community
- **Actor**: `community_owner`
- **Pre**: role + verified
- **Flow**: open "Buat Komunitas" → fill form → submit → status = `pending` → superadmin notified
- **Alt**: already has pending community → blocked
- **Post**: notification to superadmin

## UC-07 Superadmin approves community
- **Actor**: `superadmin` / `platform_admin`
- **Flow**: open queue → click approve / reject → if approve, status `active`; if reject, status `rejected` with reason → community owner notified
- **Post**: `approval_logs` entry

## UC-08 Member joins community
- **Actor**: `member`
- **Pre**: community approved, member not banned from it
- **Flow**: click "Gabung" → server checks rules → create `community_members` row → log to `member_join_histories` → notify owner
- **Alt**: community in `closed` mode → block; user already joined 3x → block

## UC-09 Member leaves community
- **Actor**: `member`
- **Pre**: is member
- **Flow**: click "Keluar" → confirm → soft delete / set `left_at` → log to `member_join_histories` → notify owner

## UC-10 Brand owner submits brand
- **Actor**: `brand_owner`
- **Pre**: ≤ 3 brands, role active
- **Flow**: "Tambah Brand" → fill form → submit → status `pending` → superadmin notified

## UC-11 Event creation
- **Actor**: community_owner / brand_owner / company_owner
- **Pre**: organizer approved
- **Flow**: "Buat Event" → fill (title, type, start, end, capacity, fee, visibility) → save as `draft` → submit → superadmin notified if paid

## UC-12 Event registration
- **Actor**: member (or guest if visibility allows)
- **Pre**: event in `published` status
- **Flow**: click "Daftar" → if free → confirm; if paid → payment; if donation → donation flow → server creates `event_registrations`

## UC-13 Collaboration proposal
- **Actor**: community_owner / brand_owner / company_owner
- **Pre**: both approved
- **Flow**: "Ajukan Kolaborasi" → fill (counterparty, context, terms) → submit → status `submitted` → counter-party notified
- **Alt**: counter accepts / rejects

## UC-14 Wallet topup (placeholder, P3)
- **Actor**: member
- **Flow**: "Isi Saldo" → choose amount + method → redirect to gateway (P3)

## UC-15 Report content
- **Actor**: any
- **Flow**: click "Laporkan" → fill reason → submit → admin queue
