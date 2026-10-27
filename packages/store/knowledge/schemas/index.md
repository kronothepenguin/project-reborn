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

- [settings.schema.sql](settings.md) — Declares the settings table, runtime overrides of config values keyed by config key path.
