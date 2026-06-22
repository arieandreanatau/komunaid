# KomunaID — Data Flow Diagram (DFD)

## DFD Level 0 (Context Diagram)

DFD Level 0 menunjukkan interaksi utama antara sistem KomunaID dengan entitas eksternal.

```mermaid
graph LR
    Guest((Guest))
    Member((Member))
    CommunityOwner((Community<br/>Owner))
    BrandOwner((Brand<br/>Owner))
    Superadmin((Superadmin))

    Guest -->|Register, Browse| KOMUNAID((KomunaID<br/>System))
    Member -->|Join Community, RSVP Event, Request Role| KOMUNAID
    CommunityOwner -->|Manage Community, Create Event| KOMUNAID
    BrandOwner -->|Manage Brand| KOMUNAID
    Superadmin -->|Approve Roles, Moderate Content, Manage Users| KOMUNAID

    KOMUNAID -->|Public Pages| Guest
    KOMUNAID -->|Dashboard, Notifications| Member
    KOMUNAID -->|Dashboard, Member Management| CommunityOwner
    KOMUNAID -->|Dashboard, Brand Profile| BrandOwner
    KOMUNAID -->|Reports, Approval Queue| Superadmin
```

---

## DFD Level 1

### Proses Utama

| Proses | ID | Deskripsi |
|--------|----|-----------|
| Register / Login | P1 | Registrasi akun baru dan autentikasi pengguna |
| Role Request | P2 | Member mengajukan upgrade role ke Community Owner atau Brand Owner |
| Community Approval | P3 | Superadmin menyetujui atau menolak komunitas |
| Brand Approval | P4 | Superadmin menyetujui atau menolak brand |
| Join Community | P5 | Member bergabung dengan komunitas, approval oleh Community Owner |
| Create Event | P6 | Community Owner membuat dan mengelola event |
| Register Event | P7 | Member mendaftar (RSVP) ke event |
| Collaboration Request | P8 | Brand mengajukan kolaborasi dengan komunitas (Fase 2) |
| Manual Payment | P9 | Pembayaran manual untuk event berbayar (Fase 2) |
| Dashboard Reporting | P10 | Menampilkan data dan statistik di dashboard per role |

---

### DFD Level 1 — Register / Login (P1)

```mermaid
graph TD
    A[Guest] -->|Input: name, email, phone, password| B(P1: Register / Login)
    B -->|Validate input| C{Valid?}
    C -->|Yes| D[Create User Record]
    C -->|No| E[Return Validation Error]
    D --> F[Assign Default Role: Member]
    F --> G[Generate Session]
    G --> H[Redirect to Member Dashboard]

    B -->|Login: email, password| I{Credentials Valid?}
    I -->|Yes| J[Create Session]
    I -->|No| K[Return Error: Invalid Credentials]
    J --> L{User Active?}
    L -->|Yes| M[Redirect to Dashboard by Role]
    L -->|No| N[Return Error: Account Disabled]

    B -.->|Data Store| O[(users)]
    B -.->|Data Store| P[(roles)]
```

---

### DFD Level 1 — Role Request (P2)

```mermaid
graph TD
    A[Member] -->|Select: community_owner or brand_owner| B(P2: Role Request)
    B --> C[Check: No Pending Request?]
    C -->|Yes| D[Create role_approval Record]
    C -->|No| E[Return Error: Request Already Pending]
    D --> F[Status: pending]
    F --> G[Notify Superadmin]
    G --> H[Superadmin Reviews]
    H --> I{Decision?}
    I -->|Approve| J[Update role_approval: approved]
    J --> K[Update User Role]
    K --> L[Flash Message: Role Approved]
    I -->|Reject| M[Update role_approval: rejected]
    M --> N[Add Review Notes]
    N --> O[Flash Message: Role Rejected]

    B -.->|Data Store| P[(role_approvals)]
    K -.->|Data Store| Q[(users)]
```

---

### DFD Level 1 — Community Approval (P3)

```mermaid
graph TD
    A[Superadmin] -->|View Pending Communities| B(P3: Community Approval)
    B --> C[(communities where is_active = false)]
    C --> D[Display Community List]
    D --> E{Approve or Reject?}
    E -->|Approve| F[Set is_active = true]
    F --> G[Notify Community Owner]
    E -->|Reject| H[Set is_active = false]
    H --> I[Add Rejection Reason]
    I --> J[Notify Community Owner]

    B -.->|Data Store| K[(communities)]
```

---

### DFD Level 1 — Brand Approval (P4)

```mermaid
graph TD
    A[Superadmin] -->|View Pending Brands| B(P4: Brand Approval)
    B --> C[(brands where is_active = false)]
    C --> D[Display Brand List]
    D --> E{Approve or Reject?}
    E -->|Approve| F[Set is_active = true]
    F --> G[Notify Brand Owner]
    E -->|Reject| H[Set is_active = false]
    H --> I[Add Rejection Reason]
    I --> J[Notify Brand Owner]

    B -.->|Data Store| K[(brands)]
```

---

### DFD Level 1 — Join Community (P5)

```mermaid
graph TD
    A[Member] -->|Click Join| B(P5: Join Community)
    B --> C{Already Member?}
    C -->|Yes| D[Return Error: Already a Member]
    C -->|No| E[Create community_member Record]
    E --> F[Status: pending]
    F --> G[Notify Community Owner]
    G --> H[Community Owner Reviews]
    H --> I{Approve or Reject?}
    I -->|Approve| J[Update Status: approved]
    J --> K[Set joined_at timestamp]
    K --> L[Notify Member: Welcome]
    I -->|Reject| M[Update Status: rejected]
    M --> N[Notify Member: Rejected]

    B -.->|Data Store| O[(community_members)]
```

---

### DFD Level 1 — Create Event (P6)

```mermaid
graph TD
    A[Community Owner] -->|Input: title, description, time, location| B(P6: Create Event)
    B --> C[Validate Input]
    C -->|Valid| D{Belongs to Owner's Community?}
    D -->|Yes| E[Create Event Record]
    D -->|No| F[Return Error: Unauthorized]
    E --> G{Auto-publish?}
    G -->|Yes| H[is_published = true]
    G -->|No| I[is_published = false, Draft]
    H --> J[Event Live]
    I --> K[Owner Can Publish Later]

    B -.->|Data Store| L[(events)]
```

---

### DFD Level 1 — Register Event (P7)

```mermaid
graph TD
    A[Member] -->|Click RSVP| B(P7: Register Event)
    B --> C{Is Community Member?}
    C -->|No| D[Return Error: Must Join Community First]
    C -->|Yes| E{Already RSVP'd?}
    E -->|Yes| F[Update Existing RSVP]
    E -->|No| G[Create event_attendee Record]
    G --> H[Status: going / maybe]
    H --> I[Update Attendee Count]
    I --> J[Notify Community Owner]

    B -.->|Data Store| K[(event_attendees)]
```

---

### DFD Level 1 — Collaboration Request (P8)

```mermaid
graph TD
    A[Brand Owner] -->|Select Community| B(P8: Collaboration Request)
    B --> C[Create collaboration Record]
    C --> D[Status: pending]
    D --> E[Notify Community Owner]
    E --> F[Community Owner Reviews]
    F --> G{Decision?}
    G -->|Accept| H[Status: accepted]
    H --> I[Open Collaboration Channel]
    G -->|Decline| J[Status: declined]
    J --> K[Notify Brand Owner: Declined]

    B -.->|Data Store| L[(collaborations)]
```

---

### DFD Level 1 — Manual Payment (P9)

```mermaid
graph TD
    A[Member] -->|Select Paid Event| B(P9: Manual Payment)
    B --> C[Display Payment Info]
    C --> D[Member Uploads Payment Proof]
    D --> E[Create payment Record]
    E --> F[Status: pending_verification]
    F --> G[Community Owner Reviews Proof]
    G --> H{Verified?}
    H -->|Yes| I[Status: paid]
    I --> J[Confirm Registration]
    J --> K[Notify Member: Payment Confirmed]
    H -->|No| L[Status: rejected]
    L --> M[Notify Member: Payment Rejected]

    B -.->|Data Store| N[(payments)]
```

---

### DFD Level 1 — Dashboard Reporting (P10)

```mermaid
graph TD
    A[User Login] --> B(P10: Dashboard Reporting)
    B --> C{User Role?}
    C -->|Member| D[Fetch: Joined Communities, Upcoming Events, Activity]
    C -->|Community Owner| E[Fetch: Communities, Members, Events, Stats]
    C -->|Brand Owner| F[Fetch: Brands, Collaborations, Stats]
    C -->|Superadmin| G[Fetch: Users, Communities, Brands, Events, Approvals]
    D --> H[Render Member Dashboard]
    E --> I[Render Community Dashboard]
    F --> J[Render Brand Dashboard]
    G --> K[Render Superadmin Dashboard]

    B -.->|Data Store| L[(all tables)]
```

---

## DFD Summary Table

| ID | Process | Input | Output | Data Store |
|----|---------|-------|--------|------------|
| P1 | Register / Login | Guest credentials | Auth session | users, roles |
| P2 | Role Request | Role type, notes | Approval status | role_approvals, users |
| P3 | Community Approval | Community ID | Active status | communities |
| P4 | Brand Approval | Brand ID | Active status | brands |
| P5 | Join Community | Community ID | Membership status | community_members |
| P6 | Create Event | Event data | Published event | events |
| P7 | Register Event | Event ID, RSVP type | Attendance record | event_attendees |
| P8 | Collaboration Request | Brand + Community | Collaboration status | collaborations |
| P9 | Manual Payment | Payment proof | Payment status | payments |
| P10 | Dashboard Reporting | User role | Dashboard data | all tables |
