# 20 — REKOMENDASI UNTUK PROMPT 3

**Status:** Draft
**Last Updated:** 2026-06-25

---

## 1. Prioritas Migration

### Batch 1 — MVP (Wajib)

1. Create `companies` table
2. Alter `brands` — add `company_id`
3. Alter `profiles` — add `phone`, `social_link`
4. Create `blog_posts` table
5. Alter `communities` — add `approval_required`
6. Create `premium_settings` table

### Batch 2 — V2 (Should Have)

7. Create `friendships` table
8. Create `bookmarks` table
9. Create `member_galleries` table
10. Create `suggestions` table
11. Create `community_open_positions` + `community_position_applications`
12. Create `event_volunteer_positions` + `event_volunteer_applications`
13. Create `event_financial_transactions` table
14. Create `admin_chats` table
15. Create `trial_subscriptions` table
16. Alter `profiles` — add `privacy`

### Batch 3 — Phase 2 (Could Have)

17. Create `notifications` table
18. Create `cms_translations` table

---

## 2. Model Updates

### New Models

| Model | Table | Key Relationships |
|-------|-------|-------------------|
| Company | companies | belongsTo User(owner), hasMany Brand |
| BlogPost | blog_posts | belongsTo User(author) |
| Suggestion | suggestions | — |
| Friendship | friendships | belongsTo User(friend) |
| Bookmark | bookmarks | belongsTo User, belongsTo Community |
| MemberGallery | member_galleries | belongsTo User, Community, Event |
| CommunityOpenPosition | community_open_positions | belongsTo Community |
| CommunityPositionApplication | community_position_applications | belongsTo Position, User |
| EventVolunteerPosition | event_volunteer_positions | belongsTo Event |
| EventVolunteerApplication | event_volunteer_applications | belongsTo Position, User |
| EventFinancialTransaction | event_financial_transactions | belongsTo Event, User |
| AdminChat | admin_chats | belongsTo Sender, Receiver |
| TrialSubscription | trial_subscriptions | belongsTo User, ActivatedBy |

### Updated Models

| Model | Changes |
|-------|---------|
| Brand | Add `company_id` FK, `belongsTo(Company)` |
| Profile | Add `phone`, `social_link`, `privacy` fields |

---

## 3. Seeder Updates

- Create `CompanySeeder` — demo companies
- Create `BlogPostSeeder` — demo blog posts
- Update `RoleSeeder` if needed
- Update `DatabaseSeeder` with new demo data

---

## 4. Index Optimization

| Table | Index | Type |
|-------|-------|------|
| companies | owner_id | single |
| brands | company_id | single |
| friendships | user_id + friend_id | composite unique |
| bookmarks | user_id + community_id | composite unique |
| member_galleries | user_id | single |
| community_open_positions | community_id | single |
| event_volunteer_positions | event_id | single |
| event_financial_transactions | event_id | single |
| admin_chats | sender_id + receiver_id | composite |
| trial_subscriptions | user_id | single |
| trial_subscriptions | status | single |

---

## 5. ERD Update Summary

### New Entities

- Company (1) → (N) Brand
- User (1) → (N) Friendship
- User (1) → (N) Bookmark
- User (1) → (N) MemberGallery
- Community (1) → (N) CommunityOpenPosition
- CommunityOpenPosition (1) → (N) CommunityPositionApplication
- Event (1) → (N) EventVolunteerPosition
- EventVolunteerPosition (1) → (N) EventVolunteerApplication
- Event (1) → (N) EventFinancialTransaction
- User (1) → (N) AdminChat (as sender)
- User (1) → (N) TrialSubscription

### Updated Relations

- Brand → Company (nullable FK)
- Profile → privacy, phone, social_link

---

## 6. Test Considerations

- Backward compatibility dengan existing data
- Migration rollback testing
- Foreign key constraint testing
- Soft delete + restore testing
- Transfer ownership data integrity testing
