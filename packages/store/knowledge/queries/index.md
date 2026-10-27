# Queries

Concepts for the query files under `packages/store/queries/`.

## Smoke operations

- [ping.query.sql](ping.md) — Connectivity smoke query returning 1.

## Identity

- [users.query.sql](users.md) — User operations for creation, lookup by id or email, and registrations per IP.
- [avatars.query.sql](avatars.md) — Habbo operations for creation, lookup by id or name, and the habbos of a user.
- [profiles.query.sql](profiles.md) — Profile operations, currently the creation of a habbo's profile.
- [homes.query.sql](homes.md) — Home operations, currently the creation of a profile's home.

## Authentication and access

- [auth.query.sql](auth.md) — Sign-in operations for the habbo-name login lookup, credentials, sessions, login attempts and password resets.
- [access.query.sql](access.md) — Access operations for groups, their attributes and members, a user's attributes and the holders of an attribute.
- [moderation.query.sql](moderation.md) — Moderation operations, currently the lookup of the active ban on a user or an IP.

## Economy

- [economy.query.sql](economy.md) — Wallet operations for creating a habbo's wallet and writing credit ledger rows.

## Settings

- [settings.query.sql](settings.md) — Settings operations to list, upsert and delete the stored runtime settings.
