---
type: Task
title: Write the queries P0 needs
description: Named sqlc operations for auth, habbo creation, access and settings, with their OKF query concepts.
status: done
phase: p0
depends_on: [p0-05]
packages: [packages/store]
holo: []
timestamp: 2026-10-27T21:46:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-10-27T21:46:44+00:00"}
---

# Goal

`packages/store/queries/` has every operation that auth, virtual settings and the installer use; later phases add
their own.

# Steps

- [x] `auth.query.sql`:
  - login lookup by habbo name (habbo, user, password hash);
  - credentials upsert;
  - session create, get, touch, switch habbo, delete, delete by user, purge expired;
  - login attempts insert, failure counts per IP and per user in a window;
  - password resets create, get, delete.
- [x] `users.query.sql` and `avatars.query.sql`: create a user and a habbo; get a habbo by id and by name; list a
      user's habbos; count users per IP in a window.
- [x] `profiles.query.sql`, `homes.query.sql`, `economy.query.sql`: create a profile, a home and a wallet; insert a
      ledger row.
- [x] `moderation.query.sql`: active ban for a user or an IP.
- [x] `access.query.sql`:
  - create a group;
  - add and remove attributes and members;
  - the attributes of a user;
  - holders of an attribute.
- [x] `settings.query.sql`: list, upsert, delete.
- [x] Every list operation has an explicit `ORDER BY`; every time parameter is a `time.Time`.
- [x] OKF `queries/<feature>.md` concepts and index.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs && git status --short
```

The generated `*.query.sql.go` files are committed.

Results (2026-10-27T21:46:44+00:00):

- Generation: nine query files produce 41 operations plus `Ping`. A second generation is byte-identical.
- `gofmt -l .` and `go vet ./...`: no output. `go test ./... -race -count=1`: ok (36 tests).
- New `queries_test.go` drives the generated API against a real database:
  - registration rows written in one transaction;
  - the login lookup ignoring case;
  - `SwitchSessionAvatar` refusing another user's habbo;
  - session expiry and purge;
  - the ban rules (expired, lifted, not yet started, permanent first, IP-only for an unknown habbo);
  - failed-login counts per IP and per user within the window;
  - attributes as the union of groups, and holders of an attribute;
  - settings upsert, order and delete;
  - password-reset expiry and deletion.
- `make check-docs`: exit 0. Every `:many` query has an `ORDER BY`, and no parameter struct holds a nullable time.
- Hand checks: all nine query files have a concept, every concept is indexed, every bundle-absolute link resolves,
  and all 83 frontmatter blocks parse.
- The generated `*.query.sql.go` files are ready; committing is left to the user, as with the earlier tasks.

# Notes

Added beyond the listed steps, on purpose:

- `_timezone=UTC` in the `store.Open` connection string: modernc converts every written time to UTC, so the
  `expires_at > now` comparisons hold whatever zone a caller uses. Covered by `TestOpenStoresTimesInUTC`;
  `knowledge/store.md` updated.
- sqlc gave four parameters the nullability of the column they touch (`CountFailedLoginsByUser.UserID`,
  `CreateProfileHome.ProfileID`, and `GetActiveBan`'s `IP` and `Now`):
  - `CAST(sqlc.arg(x) AS INTEGER|TEXT)` fixes the integer and text ones.
  - `GetActiveBan` first compares `now` with the non-null `created_at`. That also adds a real rule: a ban counts only
    once it has started.
  - The workaround is a new gotcha in `adding-data-persistence` and is explained in the query concepts.
- Operations the consumers need but the step list did not name: `DeleteOtherUserSessions` (password change keeps the
  current session), `PurgeExpiredPasswordResets`, `GetUser`, `GetUserByEmail` (password reset).
- Ownership and expiry live in SQL:
  - `SwitchSessionAvatar` changes nothing for a habbo of another user;
  - `GetActiveSession` and `GetActivePasswordReset` take `now`.
- Table and entity concepts now link the query concepts that touch them.
