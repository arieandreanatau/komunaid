# 07 — NFR: NON-FUNCTIONAL REQUIREMENT

## 1. Security
- All passwords hashed with `bcrypt` (Laravel default).
- CSRF active on all state-changing forms.
- Login throttled: 5 attempts / minute per (IP, login).
- Forgot/reset password: 1 email per minute per recipient.
- Sensitive data classification in `25_DATA_SECURITY_PRIVACY_POLICY.md`.
- `APP_DEBUG=false` in production.
- Secrets never committed; `.env` ignored by VCS.
- File upload validation: image only, ≤ 2 MB, MIME sniffed.
- Export limited to caller's role scope.

## 2. Performance
- Public landing TTFB ≤ 600 ms on Vercel.
- Directory list page ≤ 1.5 s at 100 items.
- `php artisan test` ≤ 120 s.
- `npm run build` ≤ 30 s.

## 3. Availability
- Target 99.5% monthly uptime for production.
- Vercel for marketing surface, dedicated host (Forge / Ploi / VPS) for app surface.
- Daily DB backup, weekly full snapshot.

## 4. Scalability
- Modular monolith: feature modules isolated under `app/Http/Controllers/{Module}` + `app/Models/{Module}`.
- Database indexes on `users.status`, `communities.status`, `events.start_at`, `community_members.user_id` (already present in V2).
- Cache file driver is fine for MVP; Redis for Phase 3.

## 5. Maintainability
- PSR-12 coding style.
- FormRequest for every state-changing request.
- Policy or Gate for every authorization.
- No logic in Blade — controllers / services / policies only.

## 6. Usability
- Tailwind v4 inline theme; Komuna palette only.
- Mobile-first responsive.
- Indonesian-first copy with English toggle.
- All forms have a visible label, helper text, and per-field error.

## 7. Accessibility
- All images have `alt`.
- All form fields have `<label for="…">`.
- Color contrast ≥ 4.5:1 for body text.
- Focus ring visible (`focus:ring-komuna-blue`).
- Keyboard navigable; modals trap focus.

## 8. Auditability
- `audit_logs` for state changes.
- `login_logs` for auth events.
- `approval_logs` for approval flows.
- Every admin action traceable to `user_id`, IP, UA, timestamp.

## 9. Backup / restore
- Daily `mysqldump`.
- 30-day retention for application data.
- 90-day retention for audit logs.
- Quarterly restore drill.

## 10. Data privacy
- UU PDP (Indonesia) compliance.
- Data minimization at every endpoint.
- Right to delete (soft then hard).
- Right to export (CSV / JSON).
- Right to correct (profile edit).
- Consent for non-essential cookies / analytics.
