# Schemas

Concepts for the schema files under `packages/store/schema/`. They are applied in
lexicographic filename order on every `store.Open`.

## Identity

- [users.schema.sql](users.md) — Declares the users table, the person behind one or more habbos.
- [avatars.schema.sql](avatars.md) — Declares the habbo tables for avatars, their badges and their wardrobe outfits.
- [referrals.schema.sql](referrals.md) — Declares the referrals table, which records the habbo that referred each new user.

## Authentication and access

- [auth.schema.sql](auth.md) — Declares the authentication tables for credentials, sessions, login attempts, password resets and SSO tickets.
- [access.schema.sql](access.md) — Declares the attribute-based access tables for access groups, their attributes and their members.

## Settings

- [settings.schema.sql](settings.md) — Declares the settings table, the runtime settings keyed by declared key path.

## Profiles and homes

- [profiles.schema.sql](profiles.md) — Declares the habbo profiles and their tags.
- [homes.schema.sql](homes.md) — Declares the home pages of profiles and groups and the items placed on them.
- [home-store.schema.sql](home-store.md) — Declares the home store catalogue and the inventory of bought, unplaced items.

## Community

- [groups.schema.sql](groups.md) — Declares the groups habbos create and their memberships.
- [forums.schema.sql](forums.md) — Declares the site-wide discussion board threads and posts.
- [news.schema.sql](news.md) — Declares the news articles written in housekeeping.
- [site.schema.sql](site.md) — Declares the promotional banners shown on the Me and community pages.

## Economy

- [economy.schema.sql](economy.md) — Declares habbo wallets, the credit ledger and vouchers.
- [club.schema.sql](club.md) — Declares the Habbo Club subscription periods of habbos.

## Moderation

- [moderation.schema.sql](moderation.md) — Declares bans, staff alerts, help tickets and the staff log.
