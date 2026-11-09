---
type: Task
title: Save the last time online, the machine id and the sound setting
description: Habbos keep their last time online, the machine id of their last login and their sound setting in the store.
status: done
phase: s2
depends_on: []
packages: [packages/store]
client: []
timestamp: 2026-11-09T22:26:25+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:26:25+00:00"}
---

# Goal

The store holds what S2 saves of a habbo: the last time online ([0037](/decisions/0037-last-online-at-login-and-logout.md)), the
machine id of the last login ([0035](/decisions/0035-the-machine-id-is-saved-per-habbo.md)) and the sound setting
([0038](/decisions/0038-the-sound-setting-is-saved.md)).

# Steps

- [x] Add them with the `adding-data-persistence` skill, with their queries and OKF documents.
- [x] Tests of the queries.

# Verification

```sh
cd packages/store && go test ./... -race
make gates
```

Results:

- `avatar_game_data` keeps, one row per habbo, the last time online, the machine id of the last game login and the
  sound setting, `TRUE` by default ([0035](/decisions/0035-the-machine-id-is-saved-per-habbo.md),
  [0037](/decisions/0037-last-online-at-login-and-logout.md), [0038](/decisions/0038-the-sound-setting-is-saved.md)).
  It is a table of its own, not columns of `avatars` ([0044](/decisions/0044-game-login-data-has-its-own-table.md)), in
  `packages/store/schema/avatars.schema.sql` and the update `0007-game-login-data.sql`. `sqlc.yaml` keeps its Go name,
  `AvatarGameData`.
- `GetAvatarGameData` reads it, and `SetAvatarLastOnline`, `SetAvatarMachineID` and `SetAvatarSoundEnabled` write it,
  each making the row when it is missing.
- In `packages/store`, `go vet ./...` and `go test ./...` pass, with `TestAHabbosGameLoginDataIsSaved` and
  `TestTheUpdatesBuildTheDatabaseTheSchemaFilesDescribe`; `make check-docs` exits 0; regenerating with
  `go tool sqlc generate` leaves the generated files unchanged.
- The update is not automatic, and the CMS and housekeeping suites pass, the update page's tests among them: nothing
  that reads `avatars` changes while it waits.
- The OKF concepts of the new table, the queries, the habbo entity, the schema, the update and `store.md` are updated
  or added.

# Notes

- Runs on the branch `s2-saved-login-data`.
