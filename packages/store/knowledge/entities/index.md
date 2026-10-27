# Entities

Domain entities represented by the store's tables: their meaning, invariants, lifecycle and relations.

## Identity

- [User](user.md) — The person who owns habbos, signs in with a password and receives access attributes.
- [Habbo](habbo.md) — An in-hotel identity owned by a user, with its name, look, motto, badges and wardrobe.
- [Referral](referral.md) — The record that a habbo's referral link brought in a new user, and whether the reward was paid.

## Authentication and access

- [Credential](credential.md) — A user's argon2id password hash and the single-use tokens that reset it.
- [Session](session.md) — A signed-in browser of a user with its active habbo, together with the login-attempt history and game-client tickets.
- [Access group](access-group.md) — An admin-defined group of users that grants attributes; code checks attributes, never group names.

## Settings

- [Setting](setting.md) — A runtime override of one config value, edited from housekeeping and merged over config.json.
