# 13 — FEATURE BACKLOG PRIORITY

| Feature | Module | Priority | Phase | Source | Notes |
|---|---|---|---|---|---|
| Add `/communities` public route | Public | P1 | MVP | LIVE-001 | 404 on live |
| Add `/blog` public route | Public | P1 | MVP | LIVE-001 | 404 on live |
| Top-of-form error summary on auth views | Auth UX | P1 | MVP | LIVE-003 | Per-field only today |
| Login throttle 5/min | Auth | P1 | MVP | NFR-1 | Use `throttle:5,1` |
| Roles & permissions seeder | Admin | P1 | MVP | LOCAL-001 | Add to `database/seeders` |
| Brand max-3 rule | Brand | P1 | MVP | BR-006 | Check in `BrandController@store` |
| Community owner first-approval rule | Community | P1 | MVP | BR-005 | Check in `CommunityController@store` |
| Event status state machine helper | Event | P1 | MVP | BR-003 | `EventStatus` enum + helper |
| Member role request (community_staff) | Member | P1 | MVP | V3 | `RoleRequest` already exists |
| Collaboration proposal flow | Collab | P1 | MVP | V3 | `CollaborationProposal` model |
| Sub community + regional | Community | P1 | MVP | V2 | Tables exist, controller flow needs check |
| Event volunteer | Event | P1 | MVP | V2 | Tables exist |
| Event gallery | Event | P1 | MVP | V2 | Tables exist |
| Notification | Cross | P1 | MVP | V2 | `custom_notifications` ready |
| Audit log | Cross | P1 | MVP | V1 | `audit_logs` ready |
| Report / export | Cross | P1 | MVP | V2 | `exports` ready |
| Multilanguage | Cross | P1 | MVP | V2 | `translations` ready |
| Community chat | Community | P2 | P2 | V3 | Not yet |
| Brand product | Brand | P2 | P2 | V3 | Need `products` table |
| Company CSR | Company | P2 | P2 | V3 | Need `csr_campaigns` table |
| Event tap-in | Event | P2 | P2 | V3 | Need `event_tap_ins` table |
| Wallet topup UI | Finance | P2 | P2 | V3 | Schema only |
| Premium UI | Cross | P2 | P2 | V2 | Schema ready |
| Payment gateway | Finance | P3 | P3 | V3 | Midtrans / Xendit |
| Realtime chat | Cross | P3 | P3 | V3 | WebSocket |
| AI matching | Cross | P4 | Future | V3 | Future |
| Mobile app | Cross | P4 | Future | V3 | Future |
