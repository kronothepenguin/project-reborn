# Queries

Concepts for the query files under `packages/store/queries/`.

## Smoke operations

- [ping.query.sql](ping.md) — Connectivity smoke query returning 1.

## Identity

- [users.query.sql](users.md) — User operations for creation, lookup by id or email, and registrations per IP.
- [avatars.query.sql](avatars.md) — Habbo operations for creation, lookup by id or name, the habbos of a user and random habbos.
- [profiles.query.sql](profiles.md) — Profile operations, currently the creation of a habbo's profile.
- [homes.query.sql](homes.md) — Home operations, currently the creation of a profile's home.

## Authentication and access

- [auth.query.sql](auth.md) — Sign-in operations for the habbo-name login lookup, credentials, sessions, login attempts and password resets.
- [access.query.sql](access.md) — Access operations for groups, their attributes and members, a user's attributes and the holders of an attribute.
- [moderation.query.sql](moderation.md) — Moderation operations for the active ban on a user or an IP, the count of active bans, a habbo's alerts and the count of open help tickets.
- [staff-logs.query.sql](staff-logs.md) — Staff log operations to write a row, count the rows and list them newest first with the names of the actor and the target.

## Community

- [groups.query.sql](groups.md) — Group operations, currently the count of groups for housekeeping's dashboard.

## Economy

- [economy.query.sql](economy.md) — Wallet operations for reading and creating a user's wallet, adding credits and writing credit ledger rows.
- [club.query.sql](club.md) — Club operations, currently the end of a user's running membership.
- [referrals.query.sql](referrals.md) — Referral operations, currently the creation of a referral at registration.

## Settings

- [settings.query.sql](settings.md) — Settings operations to list, upsert and delete the stored runtime settings.
