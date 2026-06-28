# 14 — BUSINESS RULES

| ID | Rule | Implementation |
|---|---|---|
| BR-R-01 | New registration → role `member` automatically | `RegisteredUserController@store` |
| BR-R-02 | Superadmin cannot log in via `/login` | `AuthenticatedSessionController@store` |
| BR-R-03 | Member cannot log in via `/admin/login` | `Superadmin\LoginController@showLoginForm` |
| BR-R-04 | Banned / suspended user is redirected to `account.restricted` | `User::isBannedOrSuspended()` |
| BR-R-05 | Login attempt is logged in `login_logs` | Same as above |
| BR-R-06 | Community owner cannot create community N+1 until community N is approved | `CommunityController@store` (TO DO) |
| BR-R-07 | Brand owner cannot create brand N+1 if N ≥ 3 | `BrandController@store` (TO DO) |
| BR-R-08 | A user can leave & rejoin a community at most 3 times (then blocked for X days) | `MemberJoinHistory` (TO DO controller check) |
| BR-R-09 | A community in `closed` mode does not accept new join requests | `communities.membership_mode` |
| BR-R-10 | An event with `requires_payment` must have `registration_fee` > 0 and platform fee applied | `Event` model |
| BR-R-11 | An event with `donation` mode has fee 0 but encourages donation | `Event` model |
| BR-R-12 | An event with `info_only` mode has no registration | `Event` model |
| BR-R-13 | Tap-in request must be approved by community owner to be active | `EventTapIn` (P2) |
| BR-R-14 | Collaboration proposal lifecycle: draft → submitted → accepted / rejected / cancelled → completed / expired | `CollaborationProposal` |
| BR-R-15 | Wallet cannot go negative | Service layer (P3) |
| BR-R-16 | Donation must be linked to a community or event | `donations.recipient_type` |
| BR-R-17 | Audit log entries are immutable | DB-level; never UPDATE / DELETE |
| BR-R-18 | Soft delete only; hard delete is admin action with reason | `users.deleted_at` |
| BR-R-19 | Role change must be in `audit_logs` with old/new role | Admin action |
| BR-R-20 | Export must be rate-limited (1 export / 5 min / user) | `ExportController` |
