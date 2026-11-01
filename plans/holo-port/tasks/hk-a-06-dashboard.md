---
type: Task
title: Build the dashboard and the shared note
description: GET /housekeeping/ shows the counts, the holders of housekeeping.accessGroups and the note, and POST /note saves it with settings.Set.
status: todo
phase: hk-a
depends_on: [hk-a-05]
packages: [packages/housekeeping, packages/store, packages/virtual]
holo: [source/holo/housekeeping/dashboard.php]
timestamp: 2026-11-01T21:07:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
---

# Goal

Staff land on Holo's dashboard, without what needs the game server.

# Steps

- [ ] Declare `housekeeping.note`.
- [ ] `CountGroups`, `CountActiveBans` and `ListAttributeHolderDetails` in `packages/store`, with their documentation.
- [ ] `GET /{$}`: habbos, groups, active bans and log rows; the holders; the note.
- [ ] `POST /note` writes the setting and its staff log row.
- [ ] A holder's address shows only to those holding `housekeeping.users`, which grants seeing emails
  ([0015](/decisions/0015-attribute-names-and-fuses.md)).
- [ ] Tests, and a broken staff log write must fail one.

# Verification

```sh
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- None yet.
