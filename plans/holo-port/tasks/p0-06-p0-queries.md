---
type: Task
title: Write the queries P0 needs
description: Named sqlc operations for auth, habbo creation, access and settings, with their OKF query concepts.
status: todo
phase: p0
depends_on: [p0-05]
packages: [packages/store]
holo: []
timestamp: 2026-10-27T20:48:19+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-10-27T20:48:19+00:00"}
---

# Goal

`packages/store/queries/` has every operation that auth, virtual settings and the installer use; later phases add
their own.

# Steps

- [ ] `auth.query.sql`:
  - login lookup by habbo name (habbo, user, password hash);
  - credentials upsert;
  - session create, get, touch, switch habbo, delete, delete by user, purge expired;
  - login attempts insert, failure counts per IP and per user in a window;
  - password resets create, get, delete.
- [ ] `users.query.sql` and `avatars.query.sql`: create a user and a habbo; get a habbo by id and by name; list a
      user's habbos; count users per IP in a window.
- [ ] `profiles.query.sql`, `homes.query.sql`, `economy.query.sql`: create a profile, a home and a wallet; insert a
      ledger row.
- [ ] `moderation.query.sql`: active ban for a user or an IP.
- [ ] `access.query.sql`:
  - create a group;
  - add and remove attributes and members;
  - the attributes of a user;
  - holders of an attribute.
- [ ] `settings.query.sql`: list, upsert, delete.
- [ ] Every list operation has an explicit `ORDER BY`; every time parameter is a `time.Time`.
- [ ] OKF `queries/<feature>.md` concepts and index.

# Verification

```sh
cd packages/store && go tool sqlc generate && go vet ./... && go test ./... && make check-docs && git status --short
```

The generated `*.query.sql.go` files are committed.

# Notes
