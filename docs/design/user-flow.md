# User Flow — KomunaID

## Flow 1: Registration & Onboarding

```
Landing Page
  │
  ▼
Click "Daftar"
  │
  ▼
Register Page (Step 1: Account Info)
  ├── Email
  ├── Password
  ├── Confirm Password
  └── Username
  │
  ▼ [Validate]
Register Page (Step 2: Profile Info)
  ├── First Name
  ├── Last Name
  ├── Location (optional)
  └── Phone (optional)
  │
  ▼ [Validate]
Register Page (Step 3: Interest Selection)
  └── Select categories/tags
  │
  ▼ [Submit]
Email Verification Sent
  │
  ▼ [Click verification link]
Email Verified → Redirect to Dashboard
```

### Error Paths

- Email already exists → Show error, suggest login
- Username taken → Show error, suggest alternatives
- Invalid email → Show validation error
- Password too weak → Show requirements
- Verification link expired → Resend verification

## Flow 2: Login

```
Login Page
  ├── Email input
  ├── Password input
  └── "Lupa Password?" link
  │
  ▼ [Submit]
Valid Credentials
  │
  ├── [Email verified] → Dashboard
  └── [Email not verified] → Show "Verify email" prompt
      │
      ▼ [Resend]
Verification email sent
```

### Error Paths

- Invalid credentials → Show error message
- Account suspended → Show suspension reason
- Account deleted → Show "contact support"

## Flow 3: Forgot & Reset Password

```
Login Page → Click "Lupa Password?"
  │
  ▼
Forgot Password Page
  ├── Email input
  └── Submit button
  │
  ▼ [Submit]
Email Sent Page
  │
  ▼ [Click link in email]
Reset Password Page
  ├── New password
  └── Confirm password
  │
  ▼ [Submit]
Password Reset → Redirect to Login
```

## Flow 4: Browse Public Communities

```
Landing Page → Click "Komunitas"
  │
  ▼
Communities Directory
  ├── Search bar
  ├── Category filter
  ├── Location filter
  └── Membership type filter
  │
  ▼ [Apply filters]
Community List (paginated)
  │
  ▼ [Click community card]
Community Detail Page
  ├── Banner & logo
  ├── Description
  ├── Stats (members, posts, events)
  ├── Membership type badge
  └── [Join/Request button]
  │
  ├── [Logged out] → Redirect to login
  ├── [Open membership] → Join immediately
  └── [Request membership] → Submit request → Pending approval
```

## Flow 5: Browse Public Events

```
Landing Page → Click "Event"
  │
  ▼
Events Directory
  ├── Search bar
  ├── Category filter
  ├── Date range filter
  └── Online/Offline filter
  │
  ▼ [Apply filters]
Event List (paginated)
  │
  ▼ [Click event card]
Event Detail Page
  ├── Banner
  ├── Title & description
  ├── Date/time
  ├── Location / Online link
  ├── Capacity info
  ├── Community/Organization info
  └── [Register button]
  │
  ├── [Logged out] → Redirect to login
  ├── [Has capacity] → Register → Confirmation
  └── [Full] → Join waitlist
```

## Flow 6: Member Dashboard

```
Login → Dashboard
  │
  ▼
Dashboard Overview
  ├── Stats cards (communities, events, notifications)
  ├── Recent activity feed
  └── Upcoming events
  │
  ├── → Profile
  │     ├── View profile
  │     ├── Edit personal info
  │     ├── Upload avatar
  │     └── Update bio
  │
  ├── → My Communities
  │     ├── List of joined communities
  │     ├── List of owned communities
  │     └── [Click] → Community management
  │
  ├── → My Events
  │     ├── Registered events
  │     ├── Created events
  │     └── [Click] → Event detail
  │
  ├── → Notifications
  │     ├── Notification list
  │     └── [Click] → Mark as read
  │
  └── → Activity
        └── Activity timeline
```

## Flow 7: Community Management

```
Dashboard → My Communities → [Select Community]
  │
  ▼
Community Overview
  ├── Stats (members, posts, events)
  ├── Recent posts
  └── Upcoming events
  │
  ├── → Members
  │     ├── View member list
  │     ├── Search members
  │     ├── Change member role
  │     └── Remove member
  │
  ├── → Join Requests
  │     ├── View pending requests
  │     ├── [Approve] → Member added
  │     └── [Reject] → Request denied
  │
  ├── → Roles
  │     ├── View role definitions
  │     ├── Edit permissions
  │     └── Assign roles
  │
  ├── → Events
  │     ├── View community events
  │     ├── Create new event
  │     └── Manage event
  │
  ├── → Posts
  │     ├── View posts
  │     ├── Create post
  │     ├── Edit post
  │     ├── Delete post
  │     └── Moderate flagged posts
  │
  └── → Settings
        ├── Edit community info
        ├── Update logo & banner
        ├── Change membership type
        └── Delete community (danger zone)
```

## Flow 8: Organization Management

```
Dashboard → My Organizations → [Select Organization]
  │
  ▼
Organization Overview
  ├── Stats (members, events)
  ├── Recent activity
  └── Team overview
  │
  ├── → Team
  │     ├── View team members
  │     ├── Invite member
  │     ├── Change member role
  │     └── Remove member
  │
  ├── → Events
  │     ├── View organization events
  │     ├── Create new event
  │     └── Manage event
  │
  ├── → Content
  │     ├── View content list
  │     ├── Create content
  │     └── Manage content
  │
  ├── → Insight
  │     ├── View analytics
  │     ├── Engagement metrics
  │     └── Growth metrics
  │
  └── → Settings
        ├── Edit organization info
        ├── Update logo & banner
        └── Delete organization (danger zone)
```

## Flow 9: Admin Panel

```
Login (as Admin) → Admin Dashboard
  │
  ▼
Admin Dashboard
  ├── Platform stats
  ├── Recent activity
  └── Quick actions
  │
  ├── → Users
  │     ├── User list (paginated, searchable)
  │     ├── [Click user] → User detail
  │     │     ├── View profile
  │     │     ├── Assign role
  │     │     ├── Suspend user
  │     │     └── Ban user
  │     └── Bulk actions
  │
  ├── → Community Approval
  │     ├── Pending communities list
  │     ├── [Click] → Review details
  │     │     ├── View community info
  │     │     ├── [Approve] → Community published
  │     │     ├── [Reject] → Community rejected + reason
  │     │     └── [Suspend] → Community suspended
  │     └── Filter by status
  │
  ├── → Organization Approval
  │     ├── Pending organizations list
  │     ├── [Click] → Review details
  │     │     ├── View org info
  │     │     ├── [Approve] → Organization published
  │     │     ├── [Reject] → Organization rejected + reason
  │     │     └── [Suspend] → Organization suspended
  │     └── Filter by status
  │
  ├── → Events
  │     ├── All events list
  │     ├── [Click] → Event detail
  │     │     ├── [Approve] → Event published
  │     │     ├── [Reject] → Event rejected + reason
  │     │     └── [Cancel] → Event cancelled
  │     └── Filter by status
  │
  ├── → Reports
  │     ├── Reported content list
  │     ├── [Click] → Review report
  │     │     ├── View reported content
  │     │     ├── [Resolve] → Issue addressed
  │     │     ├── [Dismiss] → Report dismissed
  │     │     └── [Ban] → User banned
  │     └── Filter by type, status
  │
  ├── → Analytics
  │     ├── Platform metrics
  │     ├── Growth charts
  │     └── Engagement data
  │
  ├── → Audit Log
  │     ├── Log list (paginated)
  │     ├── Filter by action
  │     ├── Filter by user
  │     └── Filter by date range
  │
  └── → Settings
        ├── Platform settings
        ├── Email templates
        └── System config
```

## Flow 10: Report Content

```
[Any page with content]
  │
  ▼ [Click "Report"]
Report Dialog
  ├── Report type (dropdown)
  │   ├── Spam
  │   ├── Inappropriate content
  │   ├── Harassment
  │   ├── Violence
  │   └── Other
  ├── Description (textarea)
  └── [Submit] [Cancel]
  │
  ▼ [Submit]
Report Submitted → Toast notification
  │
  ▼
Admin Reviews Report (Flow 9)
```

## Flow 11: Create Community

```
Dashboard → Click "Buat Komunitas"
  │
  ▼
Create Community Form
  ├── Step 1: Basic Info
  │     ├── Name
  │     ├── Description
  │     ├── Category
  │     └── Location
  │
  ├── Step 2: Details
  │     ├── Short description
  │     ├── Website
  │     ├── Contact email
  │     └── Contact phone
  │
  ├── Step 3: Settings
  │     ├── Membership type (Open/Request/Invite Only)
  │     ├── Max members (optional)
  │     └── Logo & banner upload
  │
  └── Step 4: Review & Submit
        ├── Preview
        └── [Submit for approval]
  │
  ▼ [Submit]
Community Created → Status: PENDING
  │
  ▼
Admin Reviews (Flow 9)
  │
  ├── [Approved] → Community published
  └── [Rejected] → Creator notified with reason
```

## Flow 12: Create Event

```
Dashboard → Click "Buat Event"
  │
  ▼
Create Event Form
  ├── Step 1: Basic Info
  │     ├── Title
  │     ├── Description
  │     ├── Category
  │     └── Short description
  │
  ├── Step 2: Schedule
  │     ├── Start date & time
  │     ├── End date & time
  │     └── Registration deadline
  │
  ├── Step 3: Location
  │     ├── Online/Offline toggle
  │     ├── [Online] Online URL
  │     ├── [Offline] Location & address
  │     └── Location URL (maps)
  │
  ├── Step 4: Settings
  │     ├── Capacity (optional)
  │     ├── Community (optional)
  │     └── Organization (optional)
  │
  └── Step 5: Review & Submit
        ├── Preview
        └── [Submit for approval]
  │
  ▼ [Submit]
Event Created → Status: PENDING
  │
  ▼
Admin Reviews (Flow 9)
  │
  ├── [Approved] → Event published
  └── [Rejected] → Creator notified with reason
```

## Navigation Flows

### Public → Auth

```
Click "Masuk" → /login
Click "Daftar" → /register
```

### Auth → Dashboard

```
Login success → /app
Register success → /app (after email verification)
```

### Dashboard → Community Context

```
/app/communities → Select community → /app/community/[id]/overview
/app/community/[id] → Switch tab → /app/community/[id]/members
```

### Dashboard → Organization Context

```
/app/organizations → Select org → /app/organization/[id]/overview
/app/organization/[id] → Switch tab → /app/organization/[id]/team
```

### Dashboard → Admin

```
/admin (if admin role) → /admin/dashboard
```

### Logout

```
Click avatar → "Keluar" → Clear tokens → / (landing page)
```

## Flow 13: Search Communities & Events

```
Click "Komunitas" / "Event" in navbar
  │
  ▼
Directory Page (/communities or /events)
  ├── Search input (debounced, 300ms)
  ├── Category filter (dropdown)
  ├── Location filter (dropdown) [communities only]
  ├── Date range filter (date picker) [events only]
  ├── Online/Offline filter (toggle) [events only]
  ├── Membership type filter (dropdown) [communities only]
  └── Sort (newest, oldest, name, popular)
  │
  ▼ [Apply filters]
Results (paginated grid)
  ├── Results count "Menampilkan X komunitas/event"
  ├── Grid of cards
  └── Pagination
  │
  ▼ [Click card]
Detail page (/communities/[slug] or /events/[slug])
  │
  ▼ [Clear filters]
Reset to all results
```

### Error Flow

- No results → EmptyState "Tidak ditemukan"
- Server error → ErrorState with retry
- Search timeout → Show partial results

## Flow 14: Change Password

```
/app/settings
  │
  ▼
Settings Page
  ├── Password section
  │     ├── Current password input
  │     ├── New password input
  │     ├── Confirm new password input
  │     └── [Simpan] button
  │
  ▼ [Click "Simpan"]
Validate
  ├── [Current password wrong] → Error: "Password saat ini salah"
  ├── [New password weak] → Error: "Password harus minimal 8 karakter"
  ├── [Passwords don't match] → Error: "Password tidak cocok"
  └── [Valid] → Submit to API
  │
  ▼ [API success]
Password Updated → Toast "Password berhasil diubah"
  │
  ▼
Re-login required → Redirect to /login
```

### Error Flow

- API error → Toast error "Gagal mengubah password"
- Network error → Retry button

## Flow 15: Bookmark Community

```
Community Detail Page (/communities/[slug])
  │
  ▼ [Click "Bookmark" icon]
  │
  ├── [Logged out] → Redirect to /login
  ├── [Not bookmarked] → Add bookmark → Toast "Komunitas ditambahkan ke bookmark"
  └── [Already bookmarked] → Remove bookmark → Toast "Komunitas dihapus dari bookmark"

/app/bookmarks
  │
  ▼
Bookmarks Page
  ├── List of bookmarked communities
  │     ├── Community card
  │     ├── [Remove] button
  │     └── [Visit] link → /communities/[slug]
  └── Empty state if no bookmarks
```

## Flow 16: Create Post in Community

```
/app/community/[id]/posts
  │
  ▼ [Click "Buat Postingan"]
Create Post Form
  ├── Title input
  ├── Content (textarea / rich text)
  ├── Category (optional dropdown)
  └── [Draft] [Publish] buttons
  │
  ├── [Draft] → Post saved as DRAFT
  └── [Publish] → Post saved as PUBLISHED
  │
  ▼ [Submit]
Post Created → Redirect to /app/community/[id]/posts
  │
  ▼
Toast "Postingan berhasil dibuat"
```

### Error Flow

- Validation error → Show field errors
- Server error → Toast error

## Flow 17: Create Organization

```
/app/organizations/create
  │
  ▼
Create Organization Form
  ├── Step 1: Basic Info
  │     ├── Name
  │     ├── Description
  │     ├── Industry
  │     └── Location
  │
  ├── Step 2: Details
  │     ├── Short description
  │     ├── Website
  │     ├── Contact email
  │     ├── Founded date
  │     └── Size
  │
  ├── Step 3: Branding
  │     ├── Logo upload
  │     └── Banner upload
  │
  └── Step 4: Review & Submit
        ├── Preview
        └── [Submit for approval]
  │
  ▼ [Submit]
Organization Created → Status: PENDING
  │
  ▼
Admin Reviews (Flow 9)
  │
  ├── [Approved] → Organization published → Owner notified
  └── [Rejected] → Creator notified with reason
```

## Flow 18: Admin User Detail

```
/admin/users → Click user row
  │
  ▼
User Detail Page (/admin/users/[id])
  ├── User info card
  │     ├── Avatar, name, email
  │     ├── Status badge (active/suspended/banned)
  │     ├── Joined date, last login
  │     └── Location, bio
  │
  ├── Role assignments
  │     ├── List of roles with scope
  │     ├── [Assign Role] button
  │     └── [Revoke] button per role
  │
  ├── Activity log
  │     └── Recent actions
  │
  └── Actions
        ├── [Suspend] → Confirm dialog → User suspended
        ├── [Activate] → Confirm dialog → User activated
        ├── [Ban] → Confirm dialog → User banned
        └── [Send Email] → Future scope
```

### Error Flow

- User not found → 404 state
- Cannot suspend self → Error message

## Flow 19: Admin Community Approval

```
/admin/community-approval
  │
  ▼
Pending Communities List
  ├── Filter by status (pending/approved/rejected)
  ├── Sort by date
  └── Paginated list
  │
  ▼ [Click community]
Review Detail (/admin/community-approval/[id])
  ├── Community info
  │     ├── Name, description, category
  │     ├── Owner info
  │     ├── Membership type
  │     └── Logo & banner preview
  │
  └── Actions
        ├── [Approve] → Confirm dialog → Status: APPROVED → Owner notified
        ├── [Reject] → Rejection reason input → Status: REJECTED → Owner notified
        └── [Suspend] → Suspension reason input → Status: SUSPENDED
```

## Flow 20: Admin Organization Approval

```
/admin/organization-approval
  │
  ▼
Pending Organizations List
  ├── Filter by status
  ├── Sort by date
  └── Paginated list
  │
  ▼ [Click organization]
Review Detail (/admin/organization-approval/[id])
  ├── Organization info
  │     ├── Name, description, industry
  │     ├── Owner info
  │     ├── Location, website
  │     └── Logo & banner preview
  │
  └── Actions
        ├── [Approve] → Status: APPROVED → Owner notified
        ├── [Reject] → Rejection reason → Status: REJECTED
        └── [Suspend] → Suspension reason → Status: SUSPENDED
```

## Flow 21: Event Check-in

```
/app/community/[id]/participants → Select event
  │
  ▼
Participant List
  ├── Search participant
  ├── Filter by status (registered/checked-in)
  └── List of participants
  │
  ▼ [Click "Check-in" button or scan QR]
Check-in Process
  ├── [Manual] → Enter participant ID → Confirm
  └── [QR Scan] → Scan QR code → Auto confirm
  │
  ▼ [Success]
Participant marked as CHECKED_IN → Toast "Check-in berhasil"
  │
  ▼
Stats updated: X/Y checked in
```

### Error Flow

- Participant not found → Error message
- Already checked-in → Warning "Sudah check-in"
- Network error → Retry

## Flow 22: Member Leave Community

```
/app/community/[id]/overview → Click "Keluar"
  │
  ▼
Confirm Dialog
  ├── "Apakah Anda yakin ingin keluar dari komunitas ini?"
  ├── [Batal] [Keluar]
  │
  ├── [Batal] → Close dialog
  └── [Keluar] → Submit
  │
  ▼ [API success]
Membership = LEFT → Redirect to /app/communities
  │
  ▼
Toast "Anda telah keluar dari komunitas"
```

## Flow 23: Cancel Event Registration

```
/app/events → Select event
  │
  ▼
Event Detail → Click "Batalkan Registrasi"
  │
  ▼
Confirm Dialog
  ├── "Apakah Anda yakin ingin membatalkan registrasi?"
  ├── [Batal] [Batalkan]
  │
  ├── [Batal] → Close dialog
  └── [Batalkan] → Submit
  │
  ▼ [API success]
Registration = CANCELLED → Event detail updated
  │
  ▼
Toast "Registrasi berhasil dibatalkan"
```
