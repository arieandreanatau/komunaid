# 06 — FRD / FSD: FUNCTIONAL REQUIREMENT DOCUMENT (V1 + V2 + V3)

For each module: Input → Validation → Output → Error message → Page behavior → Approval flow → Notification flow → Data CRUD → Export/Import → Role access.

## M01 Authentication
- **Register member** — Input: `name?`, `username?`, `email?`, `password`, `password_confirmation`. Validation: at least one of email/username; unique; password min 8; confirmed. Output: user + profile + `member` role. Error: per-field `@error` + global summary. Role: guest.
- **Login** — Input: `login` (email or username), `password`, `remember?`. Validation: required. Output: session, redirect per role. Error: "Data login tidak sesuai." (login field). Role: guest.
- **Logout** — Input: POST. Output: session invalidated, redirect to `/login`. Role: authenticated.
- **Forgot password** — Input: `email`. Output: status (always neutral). Role: guest.
- **Reset password** — Input: `token`, `email`, `password`, `password_confirmation`. Output: password updated, login. Role: guest with valid token.
- **Superadmin login** — Input: `email`, `password`. Output: dashboard or "wrong credentials". Role: superadmin candidate.
- **Rate limit** — `/login`: 5 attempts per minute per IP/email.
- **Error message rendering** — All auth views must show per-field `@error` AND a top-of-form `<x-alert type="error">` summary when `$errors->any()` is true (added in this V3 audit).

## M02 Member
- Profile CRUD (name, username, email, bio, photo, social links, privacy).
- Interest selection.
- Friend add / remove / block.
- Bookmark community.
- Wallet screen (read-only of `wallets` + `wallet_transactions`).
- Donation to event / community.
- Event registration (free / paid / donation).
- Report content / user / event.
- Role request (community_staff, brand_staff, company_staff).
- Download own report (CSV).

## M03 Community
- Owner registers, submits community, awaits approval.
- Owner can only create 2nd community after 1st is approved.
- Add sub community, regional.
- Add / remove / ban member.
- Change member internal role.
- Open / close membership.
- Add event (draft → submitted → approved → published → ongoing → completed → cancelled → suspended).
- Add volunteer campaign.
- Receive / send collaboration proposal.
- Receive donation.
- Moderation: announcement, gallery, internal chat (P2).

## M04 Event
- Polymorphic organizer: `community`, `brand`, `company`, `platform`.
- Type: free / paid / donation / info-only.
- Visibility: public / member / invitation.
- Capacity + waitlist + cutoff + cancellation policy.
- Volunteer request + approval.
- Tap-in request from brand/company.
- Gallery upload.
- Chat + sub thread.
- Attendance check-in.
- Finance summary (gross, fee, net).

## M05 Brand
- Owner registers, submits brand, awaits approval.
- Max 3 brands per owner.
- Add staff.
- Add product (P2).
- Create campaign (ads / product / job) (job = P2).
- Create event.
- Apply tap-in to community event (P2).
- View campaign performance, leads, finance.

## M06 Company
- Owner registers, submits company, awaits approval.
- Add brand (existing or new) under company.
- Add staff.
- Brand ownership transfer.
- CSR program (P2).
- Hiring campaign (P2).
- Brand portfolio dashboard.
- Multi-brand finance roll-up.

## M07 Collaboration
- Generic `collaboration_proposals` with `context_type` (community, brand, company, event).
- Lifecycle: `draft → submitted → accepted / rejected / cancelled → completed / expired`.
- Counter-party message thread (lightweight, not realtime).

## M08 Campaign
- `campaigns` (master) + `community_campaigns` (community-side) + `community_campaign_applications` (brand→community).
- Status: draft, active, paused, completed, expired.
- Performance: impressions, clicks, conversions (placeholder until analytics service).

## M09 Finance
- `wallets` (per user), `wallet_transactions` (credit / debit / hold / release).
- `donations` and `event_donations` (community or event recipient).
- `platform_fees` (configurable per transaction type).
- `event_finance_transactions` + `event_finance_summaries` for event-level roll-up.
- `payouts` (Phase 3).

## M10 Notification
- `custom_notifications` per user.
- Types: role_request, role_approved, role_rejected, community_approved, brand_approved, event_invitation, donation_received, mention.
- Channels: DB (always), email (if `MAIL_*` configured), broadcast (Phase 3).

## M11 CMS
- `cms_pages` (static pages: about, contact, terms, privacy).
- `blogs` (rich-text articles).
- `homepage_sections` (dynamic blocks on landing).
- `contact_settings` (contact form recipients + auto-reply).
- `suggestions` (user-submitted suggestions).

## M12 Admin
- Dashboard with platform KPIs.
- Approve / reject community / brand / company / role request.
- Suspend / freeze / delete user / community / brand / company / event.
- Master data CRUD.
- Audit log viewer.
- Login log viewer.
- Feature lock / usage control (premium).
- Admin chat with owners and members.
- Health check page.

## M13 Reporting
- Per-role dashboards.
- CSV export per role.
- Scheduled report (Phase 3).

## M14 Audit log
- Every state-changing action by `superadmin` / `platform_admin` and every approval/rejection decision recorded.
- Fields: actor, action, target_type, target_id, before, after, ip, user_agent, created_at.

## M15 Master data
- `roles`, `permissions`, `regions`, `community_categories`, `interests`, `event_types`, `event_visibilities`, `collaboration_types`, `industries`, `product_categories`, `campaign_types`, `csr_categories`, `company_types`, `brand_types`, `employee_positions`, `payment_methods`, `wallet_transaction_types`, `platform_fee_types`, `report_types`, `suspension_reasons`, `notification_types`, `cms_page_types`, `content_statuses`, `chat_room_types`, `event_statuses`, `payment_statuses`, `approval_statuses`.

## Cross-cutting non-functional requirements
See `07_NFR_NON_FUNCTIONAL_REQUIREMENT.md`.
