---
type: Task
title: Build access groups
description: Create and edit access groups, tick their attributes, add and remove members with a display habbo, and refuse to leave nobody who can manage them.
status: done
phase: hk-a
depends_on: [hk-a-07]
packages: [packages/housekeeping, packages/store]
holo: [source/holo/housekeeping/ranktool.php, source/holo/housekeeping/usermenu.php]
timestamp: 2026-11-01T22:06:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T22:06:41+00:00"}
---

# Goal

Staff with `housekeeping.accessGroups` manage who can do what
([0014](/decisions/0014-attribute-based-access.md), [0019](/decisions/0019-staff-page-display-habbo.md)).

# Steps

- [x] The queries `packages/store` lacks, with their documentation.
- [x] `GET/POST /access-groups`: the groups, a new group and Holo's staff members table.
- [x] `GET/POST /access-groups/{id}`: name, description, `staff_listed` and the attribute checkboxes, only from the
  catalogue.
- [x] `POST /users/{id}/access-groups`: add a member, change the display habbo, which must be the member's own, and remove
  a member. The group's page finds the user by habbo name or id, as Holo's tool does.
- [x] Every change runs in one transaction with its staff log row, and the guard refuses a change that leaves nobody who
  can manage access groups. A refusal is logged, as Holo logs the refusals of its rank tool.
- [x] Tests, including the guard broken on purpose.

# Verification

```sh
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
cd packages/store && gofmt -l . && go vet ./... && go test ./... -race
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Results (2026-11-01):

- `gofmt`, `go vet` and `go test -race` pass in `packages/housekeeping`, with 72 tests. `sqlc generate` changes nothing and
  `make check-docs` passes.
- Twenty-two breaks, one at a time, from a passing baseline, were each caught by a named test, five of them on the guard:
  the save and the removal unguarded, a holder who cannot enter counting, the guard refusing everything, and a refused
  change committed.
- Removing a member with no log row survived at first: no test read that row. `TestEveryMutationWritesOneRow` now holds the
  promise for every mutation: one row, with the action, the actor, the address and the targets.
- On the production binaries, in a real Chromium, 53 access checks and 34 checks of the whole flow passed: creating a group,
  ticking attributes, finding a user, adding them under a display habbo, changing it, removing them, and all three
  refusals of the guard, each logged.

# Notes

- The guard counts users who hold both `housekeeping.accessGroups` and `housekeeping.access`. Holding the first alone
  opens nothing, so a guard on it alone would let the last manager lose the way in, and nobody edits the database by hand.
- The phase has no route to delete a group, so none is built.
- The display habbo is picked from the user's own habbos, so the group's page finds the user first with `?habbo=`, a name
  or an id as in Holo's tool, and only then posts to `POST /users/{id}/access-groups`.
- A refusal is written after the transaction rolled back, through `inTx`, whose error return ends the transaction before
  the handler goes on. Written inside it, through the pool, the request would wait forever for the one connection.
- `saveMember` answered 500 to a `habbo` too long for an int64, as `strconv.ErrRange` is not `ErrSyntax`. Reading the code
  found it, and the test now posts one.
