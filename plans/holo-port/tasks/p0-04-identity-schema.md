---
type: Task
title: Write the identity schema
description: Schema files and OKF concepts for users, auth, avatars, access, settings and referrals.
status: done
phase: p0
depends_on: [p0-02, p0-03]
packages: [packages/store]
holo: [source/holo/install.php, source/holo/upgrade.php, source/holo/register.php, source/holo/core.php]
timestamp: 2026-10-27T21:19:55+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T21:19:55+00:00"}
---

# Goal

`packages/store/schema/` declares the identity tables of the [new schema](/reference/holo-database.md#new-schema).

# Steps

- [x] `users.schema.sql`: `users`.
- [x] `auth.schema.sql`: `credentials`, `sessions`, `login_attempts`, `password_resets`, `sso_tickets`.
- [x] `avatars.schema.sql`: `avatars`, `avatar_badges`, `wardrobe_outfits`.
- [x] `access.schema.sql`: `access_groups`, `access_group_attributes`, `access_group_members`.
- [x] `settings.schema.sql`: `settings`.
- [x] `referrals.schema.sql`: `referrals`.
- [x] Remove the placeholder `store.schema.sql` and its concept, now that real schema files exist.
- [x] OKF:
  - `schemas/<feature>.md` and `tables/<table>.md` for each file and table;
  - `entities/` concepts for User, Credential, Session, Habbo, Access group (with the attribute catalogue of
    [0015](/decisions/0015-attribute-names-and-fuses.md)), Setting and Referral;
  - every `index.md` updated.
- [x] Confirm sqlc accepts the `key` column (`settings`); quote it if generation fails.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs
```

A test opens a temporary database with `store.Open` and applies every schema file without error.

Results (2026-10-27T21:19:55+00:00):

- `go tool sqlc generate` succeeds; `key` needed no quoting (generated as `Setting.Key`). A second generation leaves
  `db.go`, `models.go` and `ping.query.sql.go` byte-identical.
- `gofmt -l .` and `go vet ./...`: no output. `go test ./... -race -count=1`: ok.
- `make check-docs`: exit 0.
- New `schema_test.go` on a fresh database (all pass):
  - the 14 identity tables exist;
  - habbo names and user emails are unique ignoring case;
  - a habbo wears at most one badge;
  - gender `X` is rejected;
  - deleting a user deletes their habbos, credential, sessions and memberships but keeps the group;
  - deleting a display habbo keeps the membership with `display_avatar_id` NULL.
- Hand checks of what `make check-docs` does not cover: every concept is listed in its `index.md`, every
  bundle-absolute link resolves, every declared table has a `tables/` concept, and every frontmatter block parses.

# Notes

Added beyond the listed steps, on purpose:

- `idx_sessions_avatar_id`, so deleting a habbo does not scan every session; also added to
  [the schema reference](/reference/holo-database.md#new-schema).
- `initialisms: ["id", "ip", "sso", "url"]` in `packages/store/sqlc.yaml`, so generated names follow Go style
  (`CreatedIP`, `SSOTicket`, later `ImageURL`) before any code uses them. It is documented in
  `knowledge/store.md`.
- `schema_test.go` checks the constraints the design relies on, not only that the files apply.

Other notes:

- `models.go` now holds the 14 table structs; there are still no queries besides `Ping`. Those come in
  [p0-06](/tasks/p0-06-p0-queries.md).
- `packages/store/testdata/schema/*.sql` is still unused and untouched (open question to the user).
