# KomunaID — API Specification

> **Note:** MVP menggunakan Blade + Livewire (server-rendered). API ini disiapkan untuk future mobile app dan integrasi pihak ketiga.

## Base URL

```
Development: http://localhost:8000/api/v1
Production:  https://komunaid.com/api/v1
```

## Authentication

Semua endpoint yang ditandai **Auth: Yes** memerlukan header:

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## Response Format

### Success

```json
{
    "success": true,
    "message": "Resource retrieved successfully",
    "data": { ... }
}
```

### Error

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "field": ["Error message"]
    }
}
```

### Paginated

```json
{
    "success": true,
    "data": [ ... ],
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 73
    }
}
```

---

## 1. Authentication

### POST /auth/register

| Property | Value |
|----------|-------|
| Auth | No |
| Role | — |
| Description | Register akun baru |

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "john@email.com",
    "phone": "08123456789",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Response 201:**

```json
{
    "success": true,
    "message": "Registration successful",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@email.com",
        "role": "member"
    },
    "token": "1|abc123..."
}
```

**Response 422:**

```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["The email has already been taken."]
    }
}
```

### POST /auth/login

| Property | Value |
|----------|-------|
| Auth | No |
| Role | — |
| Description | Login |

**Request Body:**

```json
{
    "email": "john@email.com",
    "password": "password123"
}
```

**Response 200:**

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@email.com",
        "role": "member",
        "is_active": true
    },
    "token": "1|abc123..."
}
```

### POST /auth/logout

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | Any |
| Description | Logout & revoke token |

**Response 200:**

```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

---

## 2. User / Profile

### GET /user/profile

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | Any |
| Description | Get current user profile |

**Response 200:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@email.com",
        "phone": "08123456789",
        "avatar": "/storage/avatars/avatar.jpg",
        "role": {
            "id": 2,
            "name": "Member",
            "slug": "member"
        },
        "is_active": true,
        "created_at": "2026-06-20T10:00:00Z"
    }
}
```

### PUT /user/profile

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | Any |
| Description | Update profile |

**Request Body:**

```json
{
    "name": "John Doe Updated",
    "email": "john.new@email.com",
    "phone": "08129999999",
    "avatar": "(file upload)"
}
```

**Response 200:**

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "data": { ... }
}
```

---

## 3. Role Approval

### GET /user/role-approvals

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | Any |
| Description | Get user's role approval history |

**Response 200:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "requested_role": "community_owner",
            "status": "pending",
            "notes": "Ingin membuat komunitas developer",
            "created_at": "2026-06-20T10:00:00Z"
        }
    ]
}
```

### POST /user/role-approvals

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | member |
| Description | Submit role upgrade request |

**Request Body:**

```json
{
    "requested_role": "community_owner",
    "notes": "Ingin membuat komunitas developer di Surabaya"
}
```

**Response 201:**

```json
{
    "success": true,
    "message": "Role approval request submitted",
    "data": {
        "id": 1,
        "requested_role": "community_owner",
        "status": "pending"
    }
}
```

---

## 4. Communities

### GET /communities

| Property | Value |
|----------|-------|
| Auth | No |
| Role | — |
| Description | List public communities |

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name |
| `category` | string | Filter by category |
| `location` | string | Filter by location |
| `page` | int | Page number |
| `per_page` | int | Items per page (default: 15) |

**Response 200:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Komunitas Teknologi Indonesia",
            "slug": "komunitas-teknologi-indonesia",
            "description": "Komunitas untuk para pegiat teknologi...",
            "category": "Teknologi",
            "location": "Jakarta",
            "logo": "/storage/logos/logo.jpg",
            "banner": "/storage/banners/banner.jpg",
            "member_count": 230,
            "event_count": 12,
            "owner": {
                "id": 2,
                "name": "Ahmad Fauzi"
            }
        }
    ],
    "meta": { ... }
}
```

### GET /communities/{slug}

| Property | Value |
|----------|-------|
| Auth | No |
| Role | — |
| Description | Get community detail |

**Response 200:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Komunitas Teknologi Indonesia",
        "slug": "komunitas-teknologi-indonesia",
        "description": "...",
        "category": "Teknologi",
        "location": "Jakarta",
        "website": "https://komunitastekno.id",
        "logo": "/storage/logos/logo.jpg",
        "banner": "/storage/banners/banner.jpg",
        "is_public": true,
        "member_count": 230,
        "event_count": 12,
        "owner": {
            "id": 2,
            "name": "Ahmad Fauzi",
            "avatar": "/storage/avatars/avatar.jpg"
        },
        "is_member": false,
        "member_status": null
    }
}
```

### POST /communities (Community Owner only)

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | community_owner |
| Description | Create new community |

**Request Body:**

```json
{
    "name": "Komunitas Baru",
    "description": "Deskripsi komunitas",
    "category": "Teknologi",
    "location": "Bandung",
    "website": "https://example.com",
    "is_public": true,
    "banner": "(file)",
    "logo": "(file)"
}
```

**Response 201:**

```json
{
    "success": true,
    "message": "Community created successfully",
    "data": {
        "id": 3,
        "name": "Komunitas Baru",
        "slug": "komunitas-baru",
        "status": "active"
    }
}
```

### PUT /communities/{slug}

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | community_owner (owner only) |
| Description | Update community |

**Request Body:** Same as POST, all fields optional.

### DELETE /communities/{slug}

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | community_owner (owner only) |
| Description | Delete community |

**Response 200:**

```json
{
    "success": true,
    "message": "Community deleted successfully"
}
```

---

## 5. Community Members

### POST /communities/{slug}/join

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | member |
| Description | Request to join community |

**Response 201:**

```json
{
    "success": true,
    "message": "Join request sent",
    "data": {
        "status": "pending"
    }
}
```

### DELETE /communities/{slug}/join

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | member |
| Description | Leave community |

**Response 200:**

```json
{
    "success": true,
    "message": "Left community successfully"
}
```

### GET /communities/{slug}/members

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | community_owner (owner only) |
| Description | List community members |

**Response 200:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "user": {
                "id": 5,
                "name": "Budi Santoso",
                "avatar": "/storage/avatars/avatar.jpg"
            },
            "role": "member",
            "status": "approved",
            "joined_at": "2026-06-20T10:00:00Z"
        }
    ]
}
```

### POST /communities/{slug}/members/{userId}/approve

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | community_owner (owner only) |
| Description | Approve member request |

**Response 200:**

```json
{
    "success": true,
    "message": "Member approved"
}
```

### POST /communities/{slug}/members/{userId}/reject

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | community_owner (owner only) |
| Description | Reject member request |

**Response 200:**

```json
{
    "success": true,
    "message": "Member rejected"
}
```

---

## 6. Events

### GET /communities/{slug}/events

| Property | Value |
|----------|-------|
| Auth | No |
| Role | — |
| Description | List events for a community |

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `upcoming` or `past` |
| `page` | int | Page number |

**Response 200:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "title": "Meetup Teknologi #24",
            "slug": "meetup-teknologi-24",
            "description": "...",
            "location": "Jakarta Convention Center",
            "start_time": "2026-07-15T14:00:00Z",
            "end_time": "2026-07-15T17:00:00Z",
            "banner": "/storage/banners/event.jpg",
            "is_published": true,
            "attendee_count": 45,
            "created_by": {
                "id": 2,
                "name": "Ahmad Fauzi"
            }
        }
    ],
    "meta": { ... }
}
```

### GET /communities/{slug}/events/{eventSlug}

| Property | Value |
|----------|-------|
| Auth | No |
| Role | — |
| Description | Get event detail |

**Response 200:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Meetup Teknologi #24",
        "slug": "meetup-teknologi-24",
        "description": "...",
        "location": "Jakarta Convention Center",
        "start_time": "2026-07-15T14:00:00Z",
        "end_time": "2026-07-15T17:00:00Z",
        "banner": "/storage/banners/event.jpg",
        "is_published": true,
        "attendee_count": 45,
        "community": {
            "id": 1,
            "name": "Komunitas Teknologi Indonesia",
            "slug": "komunitas-teknologi-indonesia"
        },
        "attendees": [
            {
                "id": 5,
                "name": "Budi Santoso",
                "avatar": "/storage/avatars/avatar.jpg",
                "status": "going"
            }
        ]
    }
}
```

### POST /communities/{slug}/events (Community Owner only)

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | community_owner (owner only) |
| Description | Create event |

**Request Body:**

```json
{
    "title": "Meetup Teknologi #25",
    "description": "Deskripsi event",
    "location": "Online (Zoom)",
    "start_time": "2026-07-20T14:00:00",
    "end_time": "2026-07-20T17:00:00",
    "is_published": true,
    "banner": "(file)"
}
```

**Response 201:**

```json
{
    "success": true,
    "message": "Event created successfully",
    "data": {
        "id": 2,
        "title": "Meetup Teknologi #25",
        "slug": "meetup-teknologi-25"
    }
}
```

### POST /events/{eventId}/rsvp

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | member |
| Description | RSVP to event |

**Request Body:**

```json
{
    "status": "going"
}
```

**Response 201:**

```json
{
    "success": true,
    "message": "RSVP recorded",
    "data": {
        "status": "going"
    }
}
```

### DELETE /events/{eventId}/rsvp

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | member |
| Description | Cancel RSVP |

**Response 200:**

```json
{
    "success": true,
    "message": "RSVP cancelled"
}
```

---

## 7. Brands

### GET /brands

| Property | Value |
|----------|-------|
| Auth | No |
| Role | — |
| Description | List public brands |

**Query Parameters:** Same as communities.

**Response 200:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "TechCorp Indonesia",
            "slug": "techcorp-indonesia",
            "description": "...",
            "industry": "Teknologi",
            "logo": "/storage/logos/brand.jpg",
            "banner": "/storage/banners/brand.jpg",
            "website": "https://techcorp.id",
            "owner": {
                "id": 3,
                "name": "Sari Dewi"
            }
        }
    ],
    "meta": { ... }
}
```

### GET /brands/{slug}

| Property | Value |
|----------|-------|
| Auth | No |
| Role | — |
| Description | Get brand detail |

### POST /brands (Brand Owner only)

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | brand_owner |
| Description | Create brand |

**Request Body:**

```json
{
    "name": "Brand Baru",
    "description": "Deskripsi brand",
    "industry": "Fashion",
    "website": "https://brandbaru.com",
    "logo": "(file)",
    "banner": "(file)"
}
```

### PUT /brands/{slug}

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | brand_owner (owner only) |
| Description | Update brand |

### DELETE /brands/{slug}

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | brand_owner (owner only) |
| Description | Delete brand |

---

## 8. Superadmin

### GET /superadmin/dashboard

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | superadmin |
| Description | Platform statistics |

**Response 200:**

```json
{
    "success": true,
    "data": {
        "total_users": 1234,
        "total_communities": 48,
        "total_brands": 15,
        "total_events": 120,
        "pending_role_approvals": 3,
        "pending_community_approvals": 2,
        "recent_users": [ ... ]
    }
}
```

### GET /superadmin/users

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | superadmin |
| Description | List all users |

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name/email |
| `role` | string | Filter by role slug |
| `is_active` | boolean | Filter by active status |
| `page` | int | Page number |

### GET /superadmin/users/{userId}

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | superadmin |
| Description | Get user detail |

### PATCH /superadmin/users/{userId}/toggle-active

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | superadmin |
| Description | Activate/deactivate user |

**Response 200:**

```json
{
    "success": true,
    "message": "User deactivated",
    "data": {
        "is_active": false
    }
}
```

### GET /superadmin/role-approvals

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | superadmin |
| Description | List pending role approvals |

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `pending`, `approved`, `rejected` |
| `page` | int | Page number |

### POST /superadmin/role-approvals/{id}/approve

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | superadmin |
| Description | Approve role request |

**Response 200:**

```json
{
    "success": true,
    "message": "Role approved",
    "data": {
        "id": 1,
        "status": "approved",
        "reviewed_at": "2026-06-22T10:00:00Z"
    }
}
```

### POST /superadmin/role-approvals/{id}/reject

| Property | Value |
|----------|-------|
| Auth | Yes |
| Role | superadmin |
| Description | Reject role request |

**Request Body:**

```json
{
    "notes": "Mohon lampirkan portofolio komunitas yang pernah dikelola"
}
```

**Response 200:**

```json
{
    "success": true,
    "message": "Role rejected",
    "data": {
        "id": 1,
        "status": "rejected",
        "notes": "Mohon lampirkan portofolio...",
        "reviewed_at": "2026-06-22T10:00:00Z"
    }
}
```

---

## API Endpoint Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register` | No | — | Register |
| POST | `/auth/login` | No | — | Login |
| POST | `/auth/logout` | Yes | Any | Logout |
| GET | `/user/profile` | Yes | Any | Get profile |
| PUT | `/user/profile` | Yes | Any | Update profile |
| GET | `/user/role-approvals` | Yes | Any | Role approval history |
| POST | `/user/role-approvals` | Yes | member | Submit role request |
| GET | `/communities` | No | — | List communities |
| GET | `/communities/{slug}` | No | — | Community detail |
| POST | `/communities` | Yes | community_owner | Create community |
| PUT | `/communities/{slug}` | Yes | community_owner | Update community |
| DELETE | `/communities/{slug}` | Yes | community_owner | Delete community |
| POST | `/communities/{slug}/join` | Yes | member | Join community |
| DELETE | `/communities/{slug}/join` | Yes | member | Leave community |
| GET | `/communities/{slug}/members` | Yes | community_owner | List members |
| POST | `/communities/{slug}/members/{id}/approve` | Yes | community_owner | Approve member |
| POST | `/communities/{slug}/members/{id}/reject` | Yes | community_owner | Reject member |
| GET | `/communities/{slug}/events` | No | — | List events |
| GET | `/communities/{slug}/events/{slug}` | No | — | Event detail |
| POST | `/communities/{slug}/events` | Yes | community_owner | Create event |
| PUT | `/communities/{slug}/events/{slug}` | Yes | community_owner | Update event |
| DELETE | `/communities/{slug}/events/{slug}` | Yes | community_owner | Delete event |
| POST | `/events/{id}/rsvp` | Yes | member | RSVP event |
| DELETE | `/events/{id}/rsvp` | Yes | member | Cancel RSVP |
| GET | `/brands` | No | — | List brands |
| GET | `/brands/{slug}` | No | — | Brand detail |
| POST | `/brands` | Yes | brand_owner | Create brand |
| PUT | `/brands/{slug}` | Yes | brand_owner | Update brand |
| DELETE | `/brands/{slug}` | Yes | brand_owner | Delete brand |
| GET | `/superadmin/dashboard` | Yes | superadmin | Platform stats |
| GET | `/superadmin/users` | Yes | superadmin | List users |
| GET | `/superadmin/users/{id}` | Yes | superadmin | User detail |
| PATCH | `/superadmin/users/{id}/toggle-active` | Yes | superadmin | Toggle user status |
| GET | `/superadmin/role-approvals` | Yes | superadmin | List role approvals |
| POST | `/superadmin/role-approvals/{id}/approve` | Yes | superadmin | Approve role |
| POST | `/superadmin/role-approvals/{id}/reject` | Yes | superadmin | Reject role |
