# 07 — USE CASES

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Use Case Table

| UC ID | Actor | Trigger | Preconditions | Main Flow | Alternate Flow | Postconditions |
|-------|-------|---------|---------------|-----------|----------------|----------------|
| UC-001 | Guest | Navigate to registration page | Guest is not logged in | Fill form → Submit → Account created → Auto login → Redirect to home | Email exists → Error shown | Account created, user logged in |
| UC-002 | Guest | Navigate to login page | Guest is not logged in | Enter credentials → Submit → Login success → Redirect to home | Invalid credentials → Error shown | User session active |
| UC-003 | Member | Click logout | Member is logged in | Click logout → Tokens cleared → Redirect to home | — | Session terminated |
| UC-004 | Guest | Click "Forgot Password" | Guest is on login page | Enter email → Submit → Confirmation shown → Email sent | Email not found → Same confirmation (prevent enumeration) | Reset email queued |
| UC-005 | Guest | Click reset link from email | Valid reset token exists | Enter new password → Submit → Password updated → Redirect to login | Token invalid/expired → Error shown | Password updated |
| UC-006 | Member | Click "Create Community" | Member is logged in | Fill form → Submit → Community created (PENDING) → Owner auto-assigned | Name exists → Error shown | Community pending approval |
| UC-007 | Platform Admin | View pending communities | Admin is logged in | View list → Select community → Approve/Suspend | No pending → Empty state | Community status updated |
| UC-008 | Guest/Member | View community detail | Community is APPROVED | Navigate to slug → View profile, members, events | Community not found → 404 | — |
| UC-009 | Member | Click "Join Community" | Member is logged in, community APPROVED | OPEN → Auto-join. RESTRICTED → Submit request → PENDING | Already member → "Joined" status | Membership/request created |
| UC-010 | Community Admin | Manage join requests | Admin has community ADMIN+ role | View pending → Approve/Reject | No pending → Empty state | Request status updated |
| UC-011 | Member | Click "Create Organization" | Member is logged in | Fill form → Submit → Org created (PENDING) | Name exists → Error shown | Organization pending approval |
| UC-012 | Platform Admin | View pending organizations | Admin is logged in | View list → Approve/Suspend | No pending → Empty state | Organization status updated |
| UC-013 | Community/Org Admin | Create event | User has event creation role | Fill form → Validate dates/quota → Submit → Event created (PENDING) | Past date / invalid quota → Validation error | Event pending approval |
| UC-014 | Member | Register for event | Member is logged in, event APPROVED | Click Register → Capacity check → CONFIRMED or WAITLISTED | Already registered → Show status | Registration created |
| UC-015 | Member | Cancel event registration | Member is registered | Click Cancel → Status = CANCELLED | — | Registration cancelled |
| UC-016 | Member | Submit report | Member is logged in | Select target + reason → Submit → Report created (OPEN) | Duplicate report → Error | Report submitted |
| UC-017 | Platform Admin | Moderate reports | Admin is logged in | View list → Select → Resolve (SUSPENDED/DISMISSED) | No reports → Empty state | Report resolved |
| UC-018 | Super Admin | View audit logs | Super Admin is logged in | View filterable, paginated audit trail | — | — |
| UC-019 | Super Admin | Change user role | Super Admin is logged in | Select user → Choose role → Confirm → Role updated | — | Role updated, audit logged |
| UC-020 | Platform Admin | Manage categories | Admin is logged in | CRUD categories | Duplicate name → Error | Categories updated |

---

## Detailed Use Cases

### UC-001: Member Registration

**Actor:** Guest
**Trigger:** Navigate to `/register`
**Preconditions:** Guest is not logged in

**Main Flow:**
1. Guest navigates to registration page
2. Guest fills in name, email, password, confirm password
3. Guest clicks "Daftar"
4. System validates input (Zod schema)
5. System checks email uniqueness
6. System creates User + UserRole(MEMBER)
7. System generates JWT tokens
8. System sets cookie tokens
9. System creates audit log (USER_REGISTER)
10. System redirects to homepage

**Alternate Flow:**
- 3a. Email already exists → Return error "Email sudah terdaftar"
- 3b. Password < 8 chars → Return error "Password minimal 8 karakter"
- 3c. Passwords don't match → Return error "Password tidak cocok"

---

### UC-002: Member Login

**Actor:** Guest
**Trigger:** Navigate to `/login`
**Preconditions:** Guest is not logged in

**Main Flow:**
1. Guest navigates to login page
2. Guest enters email and password
3. Guest clicks "Masuk"
4. System validates input
5. System verifies credentials (bcrypt compare)
6. System generates JWT tokens
7. System sets cookie tokens
8. System creates audit log (USER_LOGIN)
9. System redirects to homepage

**Alternate Flow:**
- 3a. Invalid credentials → Return error "Email atau password salah"
- 3b. Account suspended → Return error "Akun telah ditangguhkan"

---

### UC-006: Create Community

**Actor:** Member
**Trigger:** Click "Create Community"
**Preconditions:** Member is logged in

**Main Flow:**
1. Member navigates to community creation form
2. Member fills in name, description, membership type
3. Member submits form
4. System validates input (Zod schema)
5. System checks name uniqueness
6. System creates Community (status=PENDING)
7. System creates CommunityMember (role=OWNER)
8. System creates audit log (COMMUNITY_CREATE)
9. System redirects to community dashboard

**Alternate Flow:**
- 3a. Name exists → Return error "Nama komunitas sudah digunakan"
- 3b. Validation fails → Return field errors

---

### UC-009: Join Community

**Actor:** Member
**Trigger:** Click "Join" on community page
**Preconditions:** Member is logged in, community is APPROVED

**Main Flow (OPEN):**
1. Member views community detail page
2. Member clicks "Join"
3. System checks membership type (OPEN)
4. System creates CommunityMember (status=ACTIVE)
5. System creates audit log (COMMUNITY_MEMBER_JOIN)
6. UI updates to show "Joined" status

**Main Flow (RESTRICTED):**
1. Member views community detail page
2. Member clicks "Join"
3. System checks membership type (RESTRICTED)
4. Member fills in join request message
5. System creates JoinRequest (status=PENDING)
6. UI shows "Request Pending" status

**Alternate Flow:**
- 2a. Already a member → Show "Joined" status (no action)

---

### UC-013: Create Event

**Actor:** Community/Org Event Manager
**Trigger:** Click "Create Event"
**Preconditions:** User has event creation role (Community EVENT_MANAGER+ or Org ADMIN+)

**Main Flow:**
1. User navigates to event creation form
2. User fills in title, description, date, quota, location
3. User submits form
4. System validates input (Zod schema)
5. System validates eventDate is in the future
6. System validates quota >= 1
7. System creates Event (status=PENDING)
8. System creates audit log (EVENT_CREATE)
9. System redirects to event detail

**Alternate Flow:**
- 3a. Past date → Return error "Tanggal event harus di masa depan"
- 3b. Invalid quota → Return error "Kuota minimal 1"

---

### UC-014: Register for Event

**Actor:** Member
**Trigger:** Click "Register" on event page
**Preconditions:** Member is logged in, event is APPROVED

**Main Flow:**
1. Member views event detail page
2. Member clicks "Register"
3. System checks event quota
4. If quota available → Create EventRegistration (status=CONFIRMED)
5. If quota full → Create EventRegistration (status=WAITLISTED)
6. System creates audit log (EVENT_REGISTER)
7. UI updates to show registration status

**Alternate Flow:**
- 2a. Already registered → Show current registration status

---

### UC-017: Moderate Reports

**Actor:** Platform Admin
**Trigger:** Click on report in admin panel
**Preconditions:** Admin is logged in, report exists with OPEN/UNDER_REVIEW status

**Main Flow:**
1. Admin views report list
2. Admin selects a report
3. Admin reviews report details
4. Admin chooses action (SUSPENDED or DISMISSED)
5. System updates Report status
6. System sets reviewedBy and reviewedAt
7. If SUSPENDED → System suspends target entity
8. System creates audit log
9. UI updates report status

**Alternate Flow:**
- 4a. DISMISSED → Report status = DISMISSED (no target action)
