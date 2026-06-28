# 16 — USER STORIES AND ACCEPTANCE CRITERIA

## US-01 Register member
**As** a guest
**I want** to register a KomunaID account with my email or username
**So that** I can join communities and attend events.

**Acceptance criteria**
- AC-1: `/register` returns 200.
- AC-2: Form requires at least one of email / username.
- AC-3: Password min 8 chars, must match confirmation.
- AC-4: On success, user is logged in and redirected to `/onboarding`.
- AC-5: On validation error, both per-field error AND top-of-form summary are visible.
- AC-6: Role `member` is assigned automatically.
- AC-7: Username must be unique if provided.
- AC-8: Email must be unique if provided.
- AC-9: Profile is auto-created with `display_name`.

## US-02 Login
**As** any user
**I want** to log in with email or username
**So that** I access my dashboard.

**Acceptance criteria**
- AC-1: `/login` returns 200.
- AC-2: Wrong credentials → error "Data login tidak sesuai.".
- AC-3: Banned user → redirected to `account.restricted`.
- AC-4: Superadmin → redirected to `superadmin.dashboard`.
- AC-5: Member → redirected to `member.dashboard`.
- AC-6: Login attempt (success or failure) is logged in `login_logs`.
- AC-7: After 5 failed attempts within 1 minute, request is throttled.

## US-03 Join community
**As** a member
**I want** to join an approved community
**So that** I get updates and can attend private events.

**Acceptance criteria**
- AC-1: Join button is visible on community detail if community is approved.
- AC-2: After join, member appears in community member list (if privacy allows).
- AC-3: Rejoin is blocked after 3 leave-join cycles within 90 days.
- AC-4: Owner is notified.

## US-04 Create event
**As** a community owner
**I want** to create an event (free / paid / donation / info-only)
**So that** I can gather members and accept registrations.

**Acceptance criteria**
- AC-1: Draft can be saved without validation strict.
- AC-2: Submit requires all mandatory fields.
- AC-3: Paid events have `registration_fee` > 0 and platform fee applied.
- AC-4: Donation events have fee 0.
- AC-5: Info-only events have no registration button.
- AC-6: Status transitions are: draft → submitted → approved → published → ongoing → completed / cancelled / suspended.

## US-05 Submit brand
**As** a brand owner
**I want** to submit my brand for approval
**So that** I can run campaigns and host events.

**Acceptance criteria**
- AC-1: Max 3 brands per owner.
- AC-2: Required fields: name, industry, logo, description.
- AC-3: Status `pending` until superadmin approves.

## US-06 Approve community
**As** a superadmin
**I want** to approve or reject a community
**So that** only legitimate communities appear in the directory.

**Acceptance criteria**
- AC-1: Pending list shows all `pending` communities.
- AC-2: Approve sets status `active`, rejects sets `rejected` with reason.
- AC-3: Owner receives notification.
- AC-4: Action recorded in `approval_logs` and `audit_logs`.

## US-07 Collaboration proposal
**As** a brand owner
**I want** to send a collaboration proposal to a community
**So that** I can run a joint campaign.

**Acceptance criteria**
- AC-1: Counter-party is searchable.
- AC-2: Proposal lifecycle respected.
- AC-3: Both parties can cancel before acceptance.
- AC-4: Status updates notify both parties.
