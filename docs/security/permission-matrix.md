# KomunaID Permission Matrix

This document defines the complete permission matrix for all roles in the KomunaID platform.

## Legend

| Symbol | Meaning                                            |
| ------ | -------------------------------------------------- |
| ✅     | Allowed — role has this permission                 |
| ❌     | Denied — role does not have this permission        |
| 🔶     | Conditional — allowed only within the role's scope |

---

## 1. Authentication

| Permission      | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| --------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| register        | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ✅    |
| login           | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| logout          | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| forgot-password | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ✅    |

---

## 2. Profile

| Permission          | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ------------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| view-public-profile | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ✅    |
| update-own-profile  | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| view-own-profile    | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |

---

## 3. Role Management

| Permission           | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| -------------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| request-role-upgrade | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| assign-roles         | ✅          | 🔶             | 🔶        | 🔶        | 🔶              | ❌              | ❌            | ❌     | ❌    |
| review-role-requests | ✅          | ✅             | 🔶        | ❌        | 🔶              | ❌              | ❌            | ❌     | ❌    |

**Scope notes for Role Management:**

- `PLATFORM_ADMIN` — can assign roles within their scope; cannot assign SUPER_ADMIN
- `ORG_OWNER` — can assign roles within their organization (up to ORG_ADMIN)
- `ORG_ADMIN` — can assign EVENT_MANAGER within their organization
- `COMMUNITY_OWNER` — can assign roles within their community (up to COMMUNITY_ADMIN)
- `review-role-requests` — ORG_OWNER reviews org-scoped requests; COMMUNITY_OWNER reviews community-scoped requests

---

## 4. Community

| Permission        | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ----------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| create-community  | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| view-community    | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ✅    |
| update-community  | ✅          | ✅             | 🔶        | 🔶        | 🔶              | ❌              | ❌            | ❌     | ❌    |
| delete-community  | ✅          | 🔶             | 🔶        | ❌        | 🔶              | ❌              | ❌            | ❌     | ❌    |
| approve-community | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |
| suspend-community | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |

**Scope notes for Community:**

- `ORG_OWNER` — can update/delete communities within their organization
- `ORG_ADMIN` — can update communities within their organization
- `COMMUNITY_OWNER` — can update/delete their own community
- `PLATFORM_ADMIN` — can delete communities but not suspend SUPER_ADMIN-owned ones

---

## 5. Community Members

| Permission          | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ------------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| join-community      | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| leave-community     | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| view-members        | ✅          | ✅             | 🔶        | 🔶        | 🔶              | 🔶              | 🔶            | 🔶     | ❌    |
| approve-member      | ✅          | ✅             | 🔶        | 🔶        | 🔶              | 🔶              | ❌            | ❌     | ❌    |
| reject-member       | ✅          | ✅             | 🔶        | 🔶        | 🔶              | 🔶              | ❌            | ❌     | ❌    |
| ban-member          | ✅          | ✅             | 🔶        | ❌        | 🔶              | ❌              | ❌            | ❌     | ❌    |
| manage-member-roles | ✅          | ✅             | 🔶        | 🔶        | 🔶              | ❌              | ❌            | ❌     | ❌    |

**Scope notes for Community Members:**

- `view-members` — MEMBER can view members only in communities they belong to
- `approve-member` — ORG_OWNER/ORG_ADMIN for org-level communities; COMMUNITY_OWNER/ADMIN for their community
- `ban-member` — only owners (ORG_OWNER, COMMUNITY_OWNER) and platform admins

---

## 6. Organization

| Permission           | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| -------------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| create-organization  | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| view-organization    | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ✅    |
| update-organization  | ✅          | ✅             | 🔶        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |
| delete-organization  | ✅          | 🔶             | 🔶        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |
| approve-organization | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |
| suspend-organization | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |

**Scope notes for Organization:**

- `ORG_OWNER` — full control within their organization
- `PLATFORM_ADMIN` — can delete organizations but not suspend SUPER_ADMIN-owned ones

---

## 7. Organization Members

| Permission          | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ------------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| join-organization   | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| leave-organization  | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| view-members        | ✅          | ✅             | 🔶        | 🔶        | ❌              | ❌              | ❌            | 🔶     | ❌    |
| manage-organization | ✅          | ✅             | 🔶        | 🔶        | ❌              | ❌              | ❌            | ❌     | ❌    |

**Scope notes for Organization Members:**

- `view-members` — MEMBER can view members of organizations they belong to
- `manage-organization` — ORG_OWNER/ORG_ADMIN within their organization scope

---

## 8. Events

| Permission          | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ------------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| create-event        | ✅          | ✅             | 🔶        | 🔶        | 🔶              | 🔶              | 🔶            | ❌     | ❌    |
| view-event          | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ✅    |
| update-event        | ✅          | ✅             | 🔶        | 🔶        | 🔶              | 🔶              | 🔶            | ❌     | ❌    |
| delete-event        | ✅          | ✅             | 🔶        | ❌        | 🔶              | ❌              | ❌            | ❌     | ❌    |
| register-event      | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| cancel-registration | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| approve-event       | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |

**Scope notes for Events:**

- `create-event` — requires role within a community or organization
- `update-event` — EVENT_MANAGER can update only assigned events
- `register-event` — MEMBER and above; GUEST cannot register
- `approve-event` — only platform admins can approve events for listing

---

## 9. Posts

| Permission  | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ----------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| create-post | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| update-post | ✅          | ✅             | 🔶        | 🔶        | 🔶              | 🔶              | ❌            | 🔶     | ❌    |
| delete-post | ✅          | ✅             | 🔶        | 🔶        | 🔶              | 🔶              | ❌            | 🔶     | ❌    |
| view-post   | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ✅    |

**Scope notes for Posts:**

- `update-post` — MEMBER can update only own posts; admin roles can update any post within scope
- `delete-post` — MEMBER can delete only own posts; admin roles can delete any post within scope
- `view-post` — public posts are visible to GUEST; private posts only to community members

---

## 10. Notifications

| Permission         | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ------------------ | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| view-notifications | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| mark-read          | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| mark-all-read      | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |

---

## 11. Reports

| Permission     | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| -------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| submit-report  | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| view-reports   | ✅          | ✅             | 🔶        | ❌        | 🔶              | ❌              | ❌            | ❌     | ❌    |
| resolve-report | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |
| dismiss-report | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |

**Scope notes for Reports:**

- `submit-report` — any authenticated user can report
- `view-reports` — ORG_OWNER can view reports about their org; COMMUNITY_OWNER about their community

---

## 12. Admin

| Permission               | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ------------------------ | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| view-dashboard           | ✅          | ✅             | 🔶        | ❌        | 🔶              | ❌              | ❌            | ❌     | ❌    |
| manage-users             | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |
| suspend-user             | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |
| manage-platform-settings | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |
| view-audit-logs          | ✅          | ✅             | ❌        | ❌        | ❌              | ❌              | ❌            | ❌     | ❌    |

**Scope notes for Admin:**

- `view-dashboard` — ORG_OWNER sees org dashboard; COMMUNITY_OWNER sees community dashboard
- `manage-platform-settings` — only platform-level administrators

---

## 13. Media Upload

| Permission       | SUPER_ADMIN | PLATFORM_ADMIN | ORG_OWNER | ORG_ADMIN | COMMUNITY_OWNER | COMMUNITY_ADMIN | EVENT_MANAGER | MEMBER | GUEST |
| ---------------- | ----------- | -------------- | --------- | --------- | --------------- | --------------- | ------------- | ------ | ----- |
| upload-media     | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| delete-own-media | ✅          | ✅             | ✅        | ✅        | ✅              | ✅              | ✅            | ✅     | ❌    |
| delete-any-media | ✅          | ✅             | 🔶        | 🔶        | 🔶              | 🔶              | ❌            | ❌     | ❌    |

**Scope notes for Media Upload:**

- `upload-media` — authenticated users can upload; file type and size limits apply
- `delete-any-media` — admin roles can delete media within their scope

---

## Summary Counts

| Role            | Total ✅ | Total ❌ | Total 🔶 |
| --------------- | -------- | -------- | -------- |
| SUPER_ADMIN     | 59       | 0        | 0        |
| PLATFORM_ADMIN  | 56       | 0        | 3        |
| ORG_OWNER       | 27       | 11       | 21       |
| ORG_ADMIN       | 27       | 19       | 13       |
| COMMUNITY_OWNER | 25       | 17       | 17       |
| COMMUNITY_ADMIN | 25       | 26       | 8        |
| EVENT_MANAGER   | 25       | 31       | 3        |
| MEMBER          | 27       | 28       | 4        |
| GUEST           | 7        | 52       | 0        |
