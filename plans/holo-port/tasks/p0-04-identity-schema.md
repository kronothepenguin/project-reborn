---
type: Task
title: Write the identity schema
description: Schema files and OKF concepts for users, auth, avatars, access, settings and referrals.
status: todo
phase: p0
depends_on: [p0-02, p0-03]
packages: [packages/store]
holo: [source/holo/install.php, source/holo/upgrade.php, source/holo/register.php, source/holo/core.php]
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

`packages/store/schema/` declares the identity tables of the [new schema](/reference/holo-database.md#new-schema).

# Steps

- [ ] `users.schema.sql`: `users`.
- [ ] `auth.schema.sql`: `credentials`, `sessions`, `login_attempts`, `password_resets`, `sso_tickets`.
- [ ] `avatars.schema.sql`: `avatars`, `avatar_badges`, `wardrobe_outfits`.
- [ ] `access.schema.sql`: `access_groups`, `access_group_attributes`, `access_group_members`.
- [ ] `settings.schema.sql`: `settings`.
- [ ] `referrals.schema.sql`: `referrals`.
- [ ] Remove the placeholder `store.schema.sql` and its concept, now that real schema files exist.
- [ ] OKF:
  - `schemas/<feature>.md` and `tables/<table>.md` for each file and table;
  - `entities/` concepts for User, Credential, Session, Habbo, Access group (with the attribute catalogue of
    [0015](/decisions/0015-attribute-names-and-fuses.md)), Setting and Referral;
  - every `index.md` updated.
- [ ] Confirm sqlc accepts the `key` column (`settings`); quote it if generation fails.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs
```

A test opens a temporary database with `store.Open` and applies every schema file without error.

# Notes
