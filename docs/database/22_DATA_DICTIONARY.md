# 22 — DATA DICTIONARY (key tables)

| Table | Column | Type | Null | Default | Notes |
|---|---|---|---|---|---|
| users | id | bigint | NO | auto | PK |
| users | name | string | YES | NULL | display name |
| users | username | string | YES | NULL | unique (when not null) |
| users | email | string | YES | NULL | unique (when not null) |
| users | email_verified_at | timestamp | YES | NULL | reserved |
| users | password | string | NO | — | bcrypt |
| users | status | enum('active','suspended','banned','pending') | NO | active | — |
| users | banned_at | timestamp | YES | NULL | — |
| users | last_login_at | timestamp | YES | NULL | — |
| users | last_login_ip | string | YES | NULL | — |
| users | remember_token | string | YES | NULL | — |
| users | deleted_at | timestamp | YES | NULL | soft delete |
| profiles | user_id | FK | NO | — | unique |
| profiles | display_name | string | YES | NULL | — |
| profiles | bio | text | YES | NULL | — |
| profiles | photo_path | string | YES | NULL | — |
| profiles | phone | string | YES | NULL | — |
| profiles | address | string | YES | NULL | — |
| profiles | privacy | json | YES | NULL | {show_email, show_phone, …} |
| communities | id | bigint | NO | auto | PK |
| communities | owner_id | FK users | NO | — | — |
| communities | name | string | NO | — | — |
| communities | slug | string | NO | — | unique |
| communities | description | text | YES | NULL | — |
| communities | category_id | FK | YES | NULL | — |
| communities | status | enum | NO | pending | — |
| communities | membership_mode | enum | NO | open | open/closed/approval |
| communities | region_id | FK | YES | NULL | — |
| communities | logo_path | string | YES | NULL | — |
| community_members | community_id | FK | NO | — | — |
| community_members | user_id | FK | NO | — | — |
| community_members | internal_role | enum | NO | member | — |
| community_members | joined_at | timestamp | NO | now | — |
| community_members | left_at | timestamp | YES | NULL | — |
| community_members | banned_at | timestamp | YES | NULL | — |
| events | id | bigint | NO | auto | PK |
| events | organizer_type | string | NO | — | community/brand/company/platform |
| events | organizer_id | bigint | NO | — | — |
| events | title | string | NO | — | — |
| events | description | text | YES | NULL | — |
| events | event_type | enum | NO | free | free/paid/donation/info_only |
| events | visibility | enum | NO | public | public/member/invitation |
| events | status | enum | NO | draft | draft/submitted/approved/published/ongoing/completed/cancelled/suspended |
| events | start_at | timestamp | NO | — | — |
| events | end_at | timestamp | NO | — | — |
| events | capacity | int | YES | NULL | — |
| events | registration_cutoff | timestamp | YES | NULL | — |
| events | registration_fee | decimal | YES | 0 | — |
| events | accepts_donation | bool | NO | false | — |
| brands | id | bigint | NO | auto | PK |
| brands | owner_id | FK users | NO | — | — |
| brands | company_id | FK companies | YES | NULL | — |
| brands | name | string | NO | — | — |
| brands | slug | string | NO | — | unique |
| brands | industry | string | YES | NULL | — |
| brands | status | enum | NO | pending | — |
| brands | logo_path | string | YES | NULL | — |
| companies | id | bigint | NO | auto | PK |
| companies | owner_id | FK users | NO | — | — |
| companies | name | string | NO | — | — |
| companies | slug | string | NO | — | unique |
| companies | industry | string | YES | NULL | — |
| companies | status | enum | NO | pending | — |
| companies | logo_path | string | YES | NULL | — |
| wallets | id | bigint | NO | auto | PK |
| wallets | user_id | FK users | NO | — | unique |
| wallets | balance | decimal | NO | 0 | — |
| wallets | currency | string | NO | IDR | — |
| wallet_transactions | id | bigint | NO | auto | PK |
| wallet_transactions | wallet_id | FK | NO | — | — |
| wallet_transactions | type | enum | NO | — | credit/debit/hold/release |
| wallet_transactions | amount | decimal | NO | — | — |
| wallet_transactions | ref_type | string | YES | NULL | — |
| wallet_transactions | ref_id | bigint | YES | NULL | — |
| donations | id | bigint | NO | auto | PK |
| donations | donor_id | FK users | YES | NULL | — |
| donations | recipient_type | string | NO | — | community/event |
| donations | recipient_id | bigint | NO | — | — |
| donations | amount | decimal | NO | — | — |
| donations | message | text | YES | NULL | — |
| donations | status | enum | NO | pending | — |
| platform_fees | id | bigint | NO | auto | PK |
| platform_fees | ref_type | string | NO | — | — |
| platform_fees | ref_id | bigint | NO | — | — |
| platform_fees | type | enum | NO | — | event/withdraw/donation |
| platform_fees | percent | decimal | YES | 0 | — |
| platform_fees | fixed | decimal | YES | 0 | — |
| platform_fees | currency | string | NO | IDR | — |
| collaboration_proposals | id | bigint | NO | auto | PK |
| collaboration_proposals | requester_type | string | NO | — | community/brand/company |
| collaboration_proposals | requester_id | bigint | NO | — | — |
| collaboration_proposals | target_type | string | NO | — | community/brand/company |
| collaboration_proposals | target_id | bigint | NO | — | — |
| collaboration_proposals | context_type | string | YES | NULL | event/campaign/general |
| collaboration_proposals | context_id | bigint | YES | NULL | — |
| collaboration_proposals | status | enum | NO | submitted | submitted/accepted/rejected/cancelled/completed/expired |
| collaboration_proposals | terms | json | YES | NULL | — |
| audit_logs | id | bigint | NO | auto | PK |
| audit_logs | actor_id | FK users | YES | NULL | — |
| audit_logs | action | string | NO | — | — |
| audit_logs | target_type | string | YES | NULL | — |
| audit_logs | target_id | bigint | YES | NULL | — |
| audit_logs | before | json | YES | NULL | — |
| audit_logs | after | json | YES | NULL | — |
| audit_logs | ip | string | YES | NULL | — |
| audit_logs | user_agent | string | YES | NULL | — |
| login_logs | id | bigint | NO | auto | PK |
| login_logs | user_id | FK users | YES | NULL | — |
| login_logs | ip_address | string | YES | NULL | — |
| login_logs | user_agent | string | YES | NULL | — |
| login_logs | success | bool | NO | false | — |
| approval_logs | id | bigint | NO | auto | PK |
| approval_logs | approver_id | FK users | NO | — | — |
| approval_logs | target_type | string | NO | — | — |
| approval_logs | target_id | bigint | NO | — | — |
| approval_logs | action | enum | NO | — | approved/rejected |
| approval_logs | reason | text | YES | NULL | — |
| exports | id | bigint | NO | auto | PK |
| exports | user_id | FK users | NO | — | — |
| exports | type | string | NO | — | — |
| exports | params | json | YES | NULL | — |
| exports | status | enum | NO | queued | queued/processing/ready/failed |
| exports | file_path | string | YES | NULL | — |
| custom_notifications | id | bigint | NO | auto | PK |
| custom_notifications | user_id | FK users | NO | — | — |
| custom_notifications | type | string | NO | — | — |
| custom_notifications | title | string | NO | — | — |
| custom_notifications | body | text | YES | NULL | — |
| custom_notifications | read_at | timestamp | YES | NULL | — |

Sensitive data flags and encryption are detailed in `25_DATA_SECURITY_PRIVACY_POLICY.md`.
