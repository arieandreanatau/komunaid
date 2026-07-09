# 06 — USER STORIES

**Date:** 2026-07-09
**Version:** 1.0.0

---

## Module: Authentication

### US-AUTH-001: Member Registration

**As a** Guest
**I want to** register with my email and password
**So that** I can create an account and access member features.

**Acceptance Criteria:**

```gherkin
Given I am on the registration page
When I fill in name, email, password, confirm password and click "Daftar"
Then my account is created and I am logged in automatically

Given I enter an existing email
When I submit the registration form
Then I see an error message "Email sudah terdaftar"

Given I enter a password shorter than 8 characters
When I submit the form
Then I see an error message "Password minimal 8 karakter"

Given passwords do not match
When I submit the form
Then I see an error message "Password tidak cocok"
```

---

### US-AUTH-002: Member Login

**As a** Member
**I want to** log in with my email and password
**So that** I can access my account and member features.

**Acceptance Criteria:**

```gherkin
Given I am on the login page
When I enter valid credentials and click "Masuk"
Then I am redirected to the homepage with an active session

Given I enter invalid credentials
When I submit the login form
Then I see an error message "Email atau password salah"
```

---

### US-AUTH-003: Member Logout

**As a** Member
**I want to** log out of my account
**So that** my session is terminated securely.

**Acceptance Criteria:**

```gherkin
Given I am logged in
When I click the logout button
Then my tokens are cleared and I am redirected to the homepage
```

---

### US-AUTH-004: Forgot Password

**As a** Member
**I want to** request a password reset
**So that** I can regain access to my account.

**Acceptance Criteria:**

```gherkin
Given I am on the forgot password page
When I enter my email and submit
Then I see a confirmation message "Link reset password telah dikirim"

Given I enter a non-registered email
When I submit the form
Then the system still shows the same confirmation message (prevent email enumeration)
```

---

### US-AUTH-005: Reset Password

**As a** Member
**I want to** reset my password using the token from my email
**So that** I can set a new password and regain access.

**Acceptance Criteria:**

```gherkin
Given I click the reset password link from email
When I enter new password and confirm password
Then my password is updated and I am redirected to login

Given the token is expired or invalid
When I submit the form
Then I see an error message "Token tidak valid atau sudah kedaluwarsa"
```

---

## Module: Member Profile

### US-MEM-001: View & Edit Profile

**As a** Member
**I want to** view and edit my profile information
**So that** others can see accurate information about me.

**Acceptance Criteria:**

```gherkin
Given I am logged in
When I navigate to my profile
Then I see my name, email, bio, location, avatar, and phone

Given I edit my profile fields
When I save the changes
Then my profile is updated and I see a success message
```

---

### US-MEM-002: Manage Interests

**As a** Member
**I want to** set my interests
**So that** I can discover relevant communities and events.

**Acceptance Criteria:**

```gherkin
Given I am on my profile settings
When I add or remove interests
Then my interests are saved and reflected in my profile
```

---

### US-MEM-003: View Notifications

**As a** Member
**I want to** view my notifications
**So that** I stay informed about community and event activities.

**Acceptance Criteria:**

```gherkin
Given I have new notifications
When I open the notification list
Then I see unread notifications marked distinctly

Given I click a notification
Then it is marked as read and I am navigated to the related content
```

---

### US-MEM-004: View Activity History

**As a** Member
**I want to** view my activity history
**So that** I can track my actions on the platform.

**Acceptance Criteria:**

```gherkin
Given I am on my profile
When I view activity history
Then I see a chronological list of my actions with timestamps
```

---

### US-MEM-005: Report Abuse

**As a** Member
**I want to** report inappropriate content, users, communities, or events
**So that** the platform remains safe and trustworthy.

**Acceptance Criteria:**

```gherkin
Given I encounter inappropriate content
When I click "Report" and select a reason (SPAM, HARASSMENT, etc.)
Then a report is submitted and I see a confirmation

Given I try to report the same target twice
When I submit a duplicate report
Then I see an error "Anda sudah melaporkan target ini"
```

---

## Module: Community

### US-COM-001: Create Community

**As a** Member
**I want to** create a new community
**So that** I can build a group around a shared interest.

**Acceptance Criteria:**

```gherkin
Given I am logged in
When I fill in community name, description, and membership type and submit
Then the community is created with PENDING status

Given community name already exists
When I submit the form
Then I see an error "Nama komunitas sudah digunakan"

After creation, I am automatically set as OWNER
```

---

### US-COM-002: Community Approval

**As a** Platform Admin
**I want to** review and approve or suspend communities
**So that** only quality communities are listed on the platform.

**Acceptance Criteria:**

```gherkin
Given there are communities with PENDING status
When I view the pending communities list
Then I see paginated list with community details and owner info

Given I click "Approve" on a community
Then its status changes to APPROVED and an audit log is created

Given I click "Suspend" on a community
Then its status changes to SUSPENDED and an audit log is created
```

---

### US-COM-003: View Community Profile

**As a** Guest/Member
**I want to** view a community's profile
**So that** I can learn about the community before joining.

**Acceptance Criteria:**

```gherkin
Given I navigate to a community page by slug
Then I see community name, description, cover image, logo, location, membership type, member count, and events
```

---

### US-COM-004: Join Community

**As a** Member
**I want to** join a community
**So that** I can participate in its activities.

**Acceptance Criteria:**

```gherkin
Given the community membership type is OPEN
When I click "Join"
Then I am immediately added as a member with ACTIVE status

Given the community membership type is RESTRICTED
When I click "Join" and submit a message
Then a JoinRequest is created with PENDING status

Given I am already a member
When I view the community
Then I see "Joined" status instead of "Join"
```

---

### US-COM-005: Leave Community

**As a** Member
**I want to** leave a community
**So that** I can stop participating in a community.

**Acceptance Criteria:**

```gherkin
Given I am an active member (not OWNER)
When I click "Leave"
Then my membership is removed and an audit log is created
```

---

### US-COM-006: Manage Join Requests

**As a** Community Admin
**I want to** approve or reject join requests
**So that** I control who joins the community.

**Acceptance Criteria:**

```gherkin
Given there are pending join requests
When I view the join requests list
Then I see paginated pending requests with user info and message

Given I approve a request
Then the user is added as a member and the request status becomes APPROVED

Given I reject a request
Then the request status becomes REJECTED
```

---

### US-COM-007: Manage Community Members

**As a** Community Admin
**I want to** manage members (change role, ban, remove)
**So that** I maintain a healthy community.

**Acceptance Criteria:**

```gherkin
Given I view the members list
When I change a member's role
Then the role is updated and an audit log is created

Given I ban a member
Then their status changes to BANNED
```

---

## Module: Organization

### US-ORG-001: Create Organization

**As a** Member
**I want to** register a new organization
**So that** my organization can host events on the platform.

**Acceptance Criteria:**

```gherkin
Given I am logged in
When I fill in organization name, description, industry, and location
Then the organization is created with PENDING status
```

---

### US-ORG-002: Organization Approval

**As a** Platform Admin
**I want to** review and approve or suspend organizations
**So that** only legitimate organizations are listed.

**Acceptance Criteria:**

```gherkin
Given there are organizations with PENDING status
When I approve one
Then its status changes to APPROVED and an audit log is created
```

---

## Module: Event

### US-EVT-001: Create Event

**As a** Community Event Manager / Org Admin
**I want to** create an event
**So that** members can discover and register for it.

**Acceptance Criteria:**

```gherkin
Given I have appropriate permissions
When I fill in title, date, quota, location, and submit
Then the event is created with PENDING status

Given eventDate is in the past
When I submit the form
Then I see validation error "Tanggal event harus di masa depan"

Given quota is 0 or negative
When I submit the form
Then I see validation error "Kuota minimal 1"
```

---

### US-EVT-002: Register for Event

**As a** Member
**I want to** register for an event
**So that** I can attend.

**Acceptance Criteria:**

```gherkin
Given event has available quota
When I click "Register"
Then I am registered with CONFIRMED status

Given event is full (quota reached)
When I click "Register"
Then I am placed on WAITLISTED status

Given I am already registered
When I view the event
Then I see "Registered" status and can cancel
```

---

### US-EVT-003: Cancel Event Registration

**As a** Member
**I want to** cancel my event registration
**So that** my spot is freed for others.

**Acceptance Criteria:**

```gherkin
Given I am registered for an event
When I click "Cancel Registration"
Then my registration status changes to CANCELLED
```

---

## Module: Administration

### US-ADM-001: Admin Dashboard

**As a** Platform Admin
**I want to** see a dashboard with platform statistics
**So that** I can monitor platform health at a glance.

**Acceptance Criteria:**

```gherkin
Given I am a Platform Admin
When I access the admin dashboard
Then I see total users, communities, organizations, events, pending approvals, active users
```

---

### US-ADM-002: User Management

**As a** Platform Admin
**I want to** manage users (search, suspend, activate)
**So that** I can maintain platform integrity.

**Acceptance Criteria:**

```gherkin
Given I view the user list
When I search by name or email
Then I see filtered results

Given I suspend a user
Then their status changes to SUSPENDED and an audit log is created
```

---

### US-ADM-003: Role Management

**As a** Super Admin
**I want to** change user platform roles
**So that** I can grant administrative privileges.

**Acceptance Criteria:**

```gherkin
Given I select a user
When I change their role
Then the role is updated and an audit log is created with before/after data
```

---

### US-ADM-004: Report Moderation

**As a** Platform Admin
**I want to** review and resolve reports
**So that** platform violations are addressed.

**Acceptance Criteria:**

```gherkin
Given there are OPEN or UNDER_REVIEW reports
When I view the report list
Then I see paginated reports with reporter info and details

Given I resolve a report as SUSPENDED
Then the target is suspended and an audit log is created

Given I dismiss a report
Then the report status becomes DISMISSED
```

---

### US-ADM-005: Audit Log Viewer

**As a** Super Admin
**I want to** view the audit log
**So that** I can track all administrative actions.

**Acceptance Criteria:**

```gherkin
Given I am a Super Admin
When I access the audit log
Then I see a paginated, filterable list of all audit entries with user, action, resource, timestamps, before/after data
```

---

### US-ADM-006: Category Management

**As a** Platform Admin
**I want to** manage categories
**So that** communities and events can be properly categorized.

**Acceptance Criteria:**

```gherkin
Given I am a Platform Admin
When I create/edit/delete a category
Then the changes are reflected in the category list
```

---

## Summary

| Module | User Stories | Total |
|--------|-------------|-------|
| Authentication | US-AUTH-001 to US-AUTH-005 | 5 |
| Member Profile | US-MEM-001 to US-MEM-005 | 5 |
| Community | US-COM-001 to US-COM-007 | 7 |
| Organization | US-ORG-001 to US-ORG-002 | 2 |
| Event | US-EVT-001 to US-EVT-003 | 3 |
| Administration | US-ADM-001 to US-ADM-006 | 6 |
| **Total** | | **28** |
