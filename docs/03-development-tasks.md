# KomunaID — Development Tasks (MVP Phase 1)

## Sprint 1: Project Setup & Foundation (Day 1-2)

### Task 1.1: Initialize Laravel Project
- [ ] Install Laravel via Composer
- [ ] Configure `.env` (database, app name, timezone)
- [ ] Set up Git repository
- [ ] Install and configure Tailwind CSS + Vite
- [ ] Install Laravel Breeze for auth scaffolding

### Task 1.2: Database Setup
- [ ] Create MySQL database
- [ ] Run default Laravel migrations
- [ ] Create custom migrations (roles, role_approvals, communities, community_members, events, event_attendees, brands)
- [ ] Create seeders for roles

### Task 1.3: Base Models & Relationships
- [ ] Create UserRole enum
- [ ] Create ApprovalStatus enum
- [ ] Create Role model
- [ ] Create User model (update with relationships)
- [ ] Create RoleApproval model
- [ ] Create Community model
- [ ] Create CommunityMember model
- [ ] Create Event model
- [ ] Create EventAttendee model
- [ ] Create Brand model

---

## Sprint 2: Authentication & Role Management (Day 3-5)

### Task 2.1: Auth System
- [ ] Customize Laravel Breeze registration (add name, phone fields)
- [ ] Implement login/logout
- [ ] Implement email verification (optional for MVP)
- [ ] Implement password reset

### Task 2.2: Role Middleware
- [ ] Create `RoleMiddleware` - check user role
- [ ] Create `ApprovalMiddleware` - check if role is approved
- [ ] Create `ActiveMiddleware` - check if user is active
- [ ] Register middleware in `bootstrap/app.php`

### Task 2.3: Role Approval System
- [ ] Create `RoleApprovalController`
- [ ] Create form request for role application
- [ ] Create view for role application form
- [ ] Create notification when role is approved/rejected (basic flash message)
- [ ] Create Superadmin approval queue page

### Task 2.4: Superadmin Setup
- [ ] Create seeder for superadmin user
- [ ] Create Superadmin dashboard controller
- [ ] Create base layout for superadmin
- [ ] Create user management page (list, view, activate/deactivate)
- [ ] Create role approval queue page

---

## Sprint 3: Community Module (Day 6-10)

### Task 3.1: Community CRUD
- [ ] Create `CommunityController` (index, create, store, show, edit, update, destroy)
- [ ] Create community form request validation
- [ ] Create community views (create, edit, show)
- [ ] Implement slug generation
- [ ] Implement file upload for banner/logo

### Task 3.2: Community Membership
- [ ] Create `CommunityMemberController` (join, leave, approve, reject)
- [ ] Create join community request view
- [ ] Create member management page for community owner
- [ ] Implement member status workflow (pending → approved)

### Task 3.3: Community Dashboard
- [ ] Create Community Owner dashboard
- [ ] Show list of owned communities
- [ ] Show member count, event count
- [ ] Quick actions (create community, view members)

### Task 3.4: Public Community Pages
- [ ] Create community listing page (browse all public communities)
- [ ] Implement search functionality
- [ ] Create community detail page (public view)
- [ ] Show basic info: name, description, member count

---

## Sprint 4: Brand Module (Day 11-13)

### Task 4.1: Brand CRUD
- [ ] Create `BrandController` (index, create, store, show, edit, update, destroy)
- [ ] Create brand form request validation
- [ ] Create brand views (create, edit, show)
- [ ] Implement slug generation
- [ ] Implement file upload for logo/banner

### Task 4.2: Brand Dashboard
- [ ] Create Brand Owner dashboard
- [ ] Show list of owned brands
- [ ] Quick actions (create brand, edit brand)

### Task 4.3: Public Brand Pages
- [ ] Create brand listing page
- [ ] Create brand detail page (public view)

---

## Sprint 5: Event Module (Day 14-16)

### Task 5.1: Event CRUD
- [ ] Create `EventController` (index, create, store, show, edit, update, destroy)
- [ ] Create event form request validation
- [ ] Create event views (create, edit, show)
- [ ] Implement date/time handling
- [ ] Implement file upload for banner

### Task 5.2: Event RSVP
- [ ] Create RSVP functionality (going, maybe, not going)
- [ ] Show attendee list on event detail page
- [ ] Show attendee count

### Task 5.3: Community Events
- [ ] Show events on community detail page
- [ ] Show upcoming events for community owner
- [ ] Filter events by status (upcoming, past)

---

## Sprint 6: Landing Page & Polish (Day 17-20)

### Task 6.1: Landing Page
- [ ] Create hero section with CTA
- [ ] Create features section
- [ ] Create "Browse Communities" preview section
- [ ] Create footer with links

### Task 6.2: Navigation & Layout
- [ ] Create main navigation (responsive)
- [ ] Create footer component
- [ ] Implement mobile menu
- [ ] Add breadcrumbs for navigation

### Task 6.3: Member Dashboard
- [ ] Create member dashboard
- [ ] Show joined communities
- [ ] Show upcoming events
- [ ] Profile management page

### Task 6.4: Search & Filter
- [ ] Implement community search
- [ ] Implement brand search
- [ ] Filter by category, location

### Task 6.5: Flash Messages & UX
- [ ] Implement flash message component
- [ ] Add loading states
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add form validation feedback

---

## Sprint 7: QA & Bug Fixing (Day 21-25)

### Task 7.1: Testing
- [ ] Write feature tests for auth flows
- [ ] Write feature tests for community CRUD
- [ ] Write feature tests for brand CRUD
- [ ] Write feature tests for event CRUD
- [ ] Write feature tests for role approval

### Task 7.2: Security Review
- [ ] Check authorization (can user X do action Y?)
- [ ] Check input validation on all forms
- [ ] Check file upload security
- [ ] Check SQL injection prevention
- [ ] Check XSS prevention

### Task 7.3: Bug Fixing
- [ ] Fix all bugs found during testing
- [ ] Fix UI/UX issues
- [ ] Fix responsive design issues

---

## Sprint 8: Deployment (Day 26-28)

### Task 8.1: Production Setup
- [ ] Set up hosting (VPS/Shared)
- [ ] Configure domain
- [ ] Set up SSL certificate
- [ ] Configure environment variables

### Task 8.2: Deployment
- [ ] Set up Git deployment workflow
- [ ] Run migrations on production
- [ ] Seed superadmin user
- [ ] Test all critical flows on production

### Task 8.3: Documentation
- [ ] Update README.md
- [ ] Document deployment process
- [ ] Document environment variables

---

## Backlog (Fase 2+)

| Priority | Feature | Estimasi |
|----------|---------|----------|
| High | Wallet System | 5-7 hari |
| High | Donation System | 3-5 hari |
| Medium | Campaign Management | 5-7 hari |
| Medium | Collaboration Hub | 7-10 hari |
| Medium | Notification System | 3-5 hari |
| Low | Chat/Messaging | 10-15 hari |
| Low | Social Feed | 10-15 hari |
| Low | Mobile App | 30+ hari |
