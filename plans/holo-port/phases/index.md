# Phases

Phases run in this order. The housekeeping phases need sessions and attributes, so they start after P1 and run in
parallel with P2, on feature branches ([0046](/decisions/0046-main-and-feature-branches.md)).

## Order

1. [P0 Foundations](/phases/p0-foundations.md) — Store, config, virtual settings, auth, the complete schema, the installer and the CMS wiring that every later phase builds on. **Done.**
2. [P1 Signed-out site](/phases/p1-signed-out.md) — Landing and login, registration with referrals, logout, forgot and reset password, legal pages and maintenance. **Done.**
3. [P2 Me and account](/phases/p2-me-account.md) — The community layout and header, the Me page, account settings and owning several habbos. **Done.**
4. [HK-A Housekeeping core](/phases/hk-a-housekeeping-core.md) — Housekeeping scaffold and layout, dashboard, settings editor, access groups and the staff log. **Done.**
5. [FX Review follow-ups](/phases/fx-review-follow-ups.md) — The changes the user decided in the review of P2 and HK-A, before HK-B builds on them. **Done.**
6. [HK-B Users and moderation](/phases/hk-b-users-moderation.md) — Housekeeping search and editing of users and habbos, credits, badges, bans, alerts and the help queue. **Done.**
7. [P3 Homes](/phases/p3-homes.md) — Habbo home pages with stickers, notes and widgets, the home editor, the home store and inventory, profile tags, and the store seed and admin.
8. [P4 Community](/phases/p4-community.md) — Community page, news, tags with the tag cloud and tag fight, the staff page and banners, with their housekeeping editors.
9. [P5 Groups and forum](/phases/p5-groups-forum.md) — Groups with group homes, membership management, the badge editor and renderer, and the site-wide discussion board.
10. [P6 Economy](/phases/p6-economy.md) — Credits page with purse and vouchers, transaction history, Habbo Club subscriptions and the club wardrobe, with voucher management in housekeeping.
11. [P7 Help](/phases/p7-help.md) — The help tool where habbos open a help ticket that staff handle in housekeeping.

## Deferred

Everything that needs the game server: see [0013](/decisions/0013-defer-game-server-features.md).
