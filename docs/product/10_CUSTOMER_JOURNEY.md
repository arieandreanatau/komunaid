# 10 — CUSTOMER JOURNEY (V3)

## Journey 1 — Member joins a community and attends an event
1. **Discover** — finds KomunaID via Instagram bio link → landing.
2. **Browse** — opens `/events`, filters by city + free.
3. **Register** — creates account with email.
4. **Onboard** — chooses interests.
5. **Join community** — joins "Laravel Indonesia" (now part of it).
6. **Bookmark** — bookmarks the community.
7. **Event register** — registers for "Laravel Conf 2026" (free).
8. **Donate** — donates IDR 50k because free event.
9. **Attend** — receives check-in QR, attends.
10. **Rate** — gives 5-star, follows community on social.
11. **Renew** — re-attends next year.

## Journey 2 — Brand owner runs a tap-in to a community event
1. **Sign up** — registers as `brand_owner`, submits brand.
2. **Approval wait** — admin approves in 1 working day.
3. **Create event** — creates "Tech Demo Day" (free, member-only).
4. **Find community** — browses `/communities`, finds "Laravel Indonesia".
5. **Tap-in** — sends tap-in request to event.
6. **Negotiate** — proposes free booth + IDR 2M co-fund.
7. **Accept** — community owner accepts.
8. **Co-run** — both parties run event together.
9. **Report** — receives combined report.

## Journey 3 — Community owner gets sponsored
1. **Submit community** — submits "Komunitas Bersih Sungai".
2. **Approved** — admin approves.
3. **Create event** — "Bersih Sungai Ciliwung".
4. **Open collaboration** — submits collaboration proposal to 3 brands.
5. **Brand accepts** — Aqua accepts, sponsors IDR 5M.
6. **Run event** — 80 attendees, 5 volunteers.
7. **Donations** — receives IDR 1.2M from members.
8. **Settle** — submits finance summary to admin.
9. **Reapply** — submits next quarter's proposal to 2 more brands.

## Journey 4 — Platform admin moderates a report
1. **Receive report** — member reports community for spam.
2. **Triage** — opens admin queue, sees priority high.
3. **Inspect** — reads chat, screenshots, audit log.
4. **Action** — issues 7-day suspension with note.
5. **Notify** — community owner receives email + dashboard alert.
6. **Log** — entry in `audit_logs` + `approval_logs`.
7. **Follow-up** — auto-check after 7 days; auto-reinstate or escalate.
