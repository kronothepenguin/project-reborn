# Queries

Concepts for the query files under `packages/store/queries/`.

## Smoke operations

- [ping.query.sql](ping.md) — Connectivity smoke query returning 1.

## Identity

- [users.query.sql](users.md) — User operations for creation, lookup by id or email, and registrations per IP.
- [avatars.query.sql](avatars.md) — Habbo operations for creation, lookup by id or name, the habbos of a user and random habbos, their badges, a badge for every habbo of a user, and their wardrobe outfits.
- [profiles.query.sql](profiles.md) — Profile operations for creating a habbo's profile and reading, adding and removing its tags.
- [homes.query.sql](homes.md) — Home operations for creating a profile's home, reading it, and placing, moving, skinning and removing its items.
- [home-inventory.query.sql](home-inventory.md) — Home inventory operations for adding bought items, listing them, and taking them out to place on a home.
- [home-store.query.sql](home-store.md) — Home store operations for the store's categories and items, and their upkeep from housekeeping.

## Authentication and access

- [auth.query.sql](auth.md) — Sign-in operations for the habbo-name login lookup, credentials, sessions, login attempts and password resets.
- [access.query.sql](access.md) — Access operations for groups, their attributes and members, a user's attributes and the holders of an attribute.
- [moderation.query.sql](moderation.md) — Moderation operations for bans, alerts and help tickets, from the active ban on a user or an IP to a habbo's new and waiting tickets and the help queue staff pick up and close.
- [staff-logs.query.sql](staff-logs.md) — Staff log operations to write a row, count the rows and list them newest first with the names of the actor and the target.

## Community

- [groups.query.sql](groups.md) — Group operations for buying, reading and changing groups, their members and requests, a habbo's groups and favourite, and the count for housekeeping's dashboard.
- [forums.query.sql](forums.md) — Forum operations for the board's pages with every sticky on each, a thread's pages of posts with their habbos, writing, editing and deleting posts and threads, thread settings, views and a habbo's last post.

## Economy

- [economy.query.sql](economy.md) — Wallet operations for reading and creating a user's wallet, adding credits and writing credit ledger rows, and voucher operations from creating to redeeming once.
- [club.query.sql](club.md) — Club operations for the end of a user's running membership and of their last period, whether they have any period, and a new period.
- [referrals.query.sql](referrals.md) — Referral operations, currently the creation of a referral at registration.

## Settings

- [settings.query.sql](settings.md) — Settings operations to list, upsert and delete the stored runtime settings.

## Updates

- [migrations.query.sql](migrations.md) — Update operations to list the applied updates, find one, and record one in the transaction that applies it.

## Content

- [news.query.sql](news.md) — News operations to write, edit and delete articles, and to list the archive, the newest ones and a category's.
- [site.query.sql](site.md) — Banner operations to add, edit and delete banners, and to list all of them or the enabled ones in the order they were added.
- [images.query.sql](images.md) — Image operations to store an uploaded picture and to read it back for serving.
- [navigator.query.sql](navigator.md) — Navigator operations: the categories, models and public rooms; a habbo's rooms, a category's, a search and random ones; creating, changing and deleting a room; and a habbo's favourite rooms.
