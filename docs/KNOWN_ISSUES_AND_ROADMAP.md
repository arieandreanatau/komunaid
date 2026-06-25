# KomunaID V2 — Known Issues & Roadmap

## Known Issues

| Issue ID | Module | Description | Severity | Workaround | Target Fix |
|----------|--------|-------------|----------|------------|------------|
| KI-001 | Testing | No automated test suite — only TestCase.php boilerplate exists | High | Manual testing only | Phase 2 Sprint 1 |
| KI-002 | Multilanguage | Only admin_chat.php lang file available. Most UI strings hardcoded in Blade | Medium | Use id/en fallback | Phase 2 Sprint 2 |
| KI-003 | Multilanguage | Sunda (su) language not implemented | Low | Use id/en | Phase 2 Sprint 2 |
| KI-004 | UI | Dashboard sidebar had duplicate member items (Role Request + Wallet) | Low | Fixed in Prompt 19 | Resolved |
| KI-005 | Community Owner | Only proposal views exist. Missing dedicated community management views | Medium | Use superadmin panel | Phase 2 Sprint 1 |
| KI-006 | Codebase | `source-code-laravel/` directory is stale duplicate | Low | Ignore per CLAUDE.md | Cleanup Sprint |
| KI-007 | UI | No real logo file — text-based logo fallback via Logo component | Low | Add logo.png to public/images/ | Phase 2 Sprint 1 |
| KI-008 | Storage | `storage/app/qa/` directory was missing | Low | Created in Prompt 19 | Resolved |
| KI-009 | Premium | No real payment gateway — trial managed manually | High | Manual superadmin approval | Phase 2 Sprint 3 |
| KI-010 | Chat | Admin chat not real-time — requires page refresh | Medium | Manual refresh | Phase 2 Sprint 2 |
| KI-011 | Export | CSV export limited — no advanced filtering | Low | Basic export available | Phase 2 Sprint 2 |
| KI-012 | Notification | No email/push notification system | Medium | Manual communication | Phase 2 Sprint 3 |
| KI-013 | SEO | No structured data, sitemap, or meta tags per page | Low | Basic meta in CMS | Phase 2 Sprint 2 |
| KI-014 | Performance | No caching layer for public pages | Medium | Page load acceptable | Phase 2 Sprint 1 |
| KI-015 | Auth | No two-factor authentication | Medium | Password-only auth | Phase 2 Sprint 3 |

---

## Phase 2 Roadmap

### Sprint 1 — Core Improvements
1. Automated test suite (PHPUnit/Pest)
2. Payment gateway integration (Midtrans/Xendit)
3. Logo and branding assets
4. Community owner dedicated views
5. Performance caching for public pages

### Sprint 2 — Feature Enhancement
6. Real-time chat (Laravel Reverb/Pusher)
7. Full multilanguage support (id/en/su)
8. Email notification system
9. Advanced CSV export with filtering
10. SEO optimization (structured data, sitemap)
11. QR attendance for events

### Sprint 3 — Business Features
12. Certificate generator
13. Advanced analytics dashboard
14. Two-factor authentication
15. Push notification (FCM)

### Sprint 4 — Platform Expansion
16. REST API for mobile app
17. Mobile app (React Native/Flutter)
18. Advanced recommendation engine
19. Community page builder
20. Bulk notification system

### Sprint 5 — Enterprise
21. Brand-community contract/invoice
22. Advanced premium billing
23. Multi-tenant support
24. White-label option
25. API rate limiting & documentation

---

## Priority Matrix

| Priority | Items |
|----------|-------|
| P0 — Critical | Payment gateway, automated tests |
| P1 — High | Real-time chat, email notifications, multilanguage |
| P2 — Medium | QR attendance, certificates, analytics, caching |
| P3 — Low | SEO, mobile app, advanced features |

---

> **Last Updated:** 2026-06-25
> **Next Review:** Phase 2 Sprint Planning
