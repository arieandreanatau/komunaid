# 17 — PROCESS FLOW

## 17.1 Registration flow
```
[Guest] → /register → POST /register
   ↓
[RegisterRequest::rules]
   ├─ failed → back with errors → render with @error
   └─ passed → RegisteredUserController@store
                ├─ create User
                ├─ create Profile
                ├─ assign role 'member'
                ├─ Auth::login
                └─ redirect → /onboarding
```

## 17.2 Login flow
```
[User] → /login → POST /login
   ↓
[LoginRequest::rules]
   ├─ failed → back with errors
   └─ passed → AuthenticatedSessionController@store
                ├─ find user by email or username
                ├─ if !user → back with "Data login tidak sesuai."
                ├─ if wrong password → back with "Data login tidak sesuai."
                ├─ if superadmin → back with "Login via admin panel."
                ├─ if banned/suspended → redirect account.restricted
                ├─ Auth::login + session.regenerate
                ├─ last_login_at = now
                ├─ LoginLog::create
                └─ redirect per role
```

## 17.3 Community approval flow
```
[community_owner] → submit community (status=pending)
   ↓
[superadmin] review queue
   ├─ approve → status=active, notification
   └─ reject → status=rejected (with reason), notification
```

## 17.4 Event creation flow
```
[owner] → /events/create (status=draft)
   ↓
[owner] submit
   ├─ if paid → status=submitted (superadmin notified)
   └─ if free → status=published (if community approved)
   ↓
[superadmin] (if paid) review
   ├─ approve → status=published
   └─ reject → status=draft (with reason)
   ↓
[event] start time reached → status=ongoing
   ↓
[event] end time reached → status=completed
```

## 17.5 Collaboration proposal flow
```
[A] → submit proposal (status=submitted) → notify B
   ↓
[B] review
   ├─ accept → status=accepted → start execution
   ├─ reject → status=rejected (with reason)
   └─ counter → status=cancelled
   ↓
[execution] done → status=completed
```

## 17.6 Donation flow (P2/3)
```
[member] → donation page
   ↓
[confirm] → if gateway: redirect payment (P3)
            else: record donation in DB
   ↓
[done] → status=paid → notify recipient
```
