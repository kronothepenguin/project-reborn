---
type: Task
title: Build the dashboard and the shared note
description: GET /housekeeping/ shows the counts, the holders of housekeeping.accessGroups and the note, and POST /note saves it with settings.Set.
status: done
phase: hk-a
depends_on: [hk-a-05]
packages: [packages/housekeeping, packages/store, packages/virtual]
holo: [source/holo/housekeeping/dashboard.php]
timestamp: 2026-11-01T21:37:51+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:37:51+00:00"}
---

# Goal

Staff land on Holo's dashboard, without what needs the game server.

# Steps

- [x] Declare `housekeeping.note`.
- [x] `CountGroups`, `CountActiveBans` and `ListAttributeHolderDetails` in `packages/store`, with their documentation.
- [x] `GET /{$}`: habbos, groups, active bans and log rows; the holders; the note.
- [x] `POST /note` writes the setting and its staff log row.
- [x] A holder's address shows only to those holding `housekeeping.users`, which grants seeing emails
  ([0015](/decisions/0015-attribute-names-and-fuses.md)).
- [x] Tests, and a broken staff log write must fail one.

# Verification

```sh
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
cd packages/virtual && gofmt -l . && go vet ./... && go test ./... -race
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store` (43 tests), `packages/virtual` (22) and
  `packages/housekeeping` (27), `sqlc generate` changes nothing and `make check-docs` passes.
- Eleven breaks, one at a time, were each caught by a named test: no staff log row, no `settings.Set`, a row with nothing
  changed, the actor and the address dropped, addresses shown to everyone, the route outside `Staff`, the holders of another
  attribute, and lifted, expired and future bans counted as active.
- On the production binaries, in a real Chromium, a note with `<`, `&` and `"` was saved and came back as typed, the staff
  log showed its row, the previous login appeared, and the computed style of a served table has its padding and stripes,
  which is the check [hk-a-04](/tasks/hk-a-04-layout.md) left for a browser.

# Notes

- Holo's `Server Setup` pane, `Rooms`, `Furniture` and `online` need the game server
  ([0013](/decisions/0013-defer-game-server-features.md)). `HoloCMS Updater`, `Support HoloCMS`, `Need assistance?` and the
  version row are about Holo itself and are not ported ([0021](/decisions/0021-dropped-and-kept-features.md)).
- `settings.Set` cannot join a transaction, so the staff log row of a note goes first.
