---
type: Task
title: Build access groups
description: Create and edit access groups, tick their attributes, add and remove members with a display habbo, and refuse to leave nobody who can manage them.
status: todo
phase: hk-a
depends_on: [hk-a-07]
packages: [packages/housekeeping, packages/store]
holo: [source/holo/housekeeping/ranktool.php, source/holo/housekeeping/usermenu.php]
timestamp: 2026-11-01T21:07:47+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:07:47+00:00"}
---

# Goal

Staff with `housekeeping.accessGroups` manage who can do what
([0014](/decisions/0014-attribute-based-access.md), [0019](/decisions/0019-staff-page-display-habbo.md)).

# Steps

- [ ] The queries `packages/store` lacks, with their documentation.
- [ ] `GET/POST /access-groups`: the groups, a new group and Holo's staff members table.
- [ ] `GET/POST /access-groups/{id}`: name, description, `staff_listed` and the attribute checkboxes, only from the
  catalogue.
- [ ] `POST /users/{id}/access-groups`: add a member, change the display habbo, which must be the member's own, and remove
  a member. The group's page finds the user by habbo name or id, as Holo's tool does.
- [ ] Every change runs in one transaction with its staff log row, and the guard refuses a change that leaves nobody who
  can manage access groups. A refusal is logged, as Holo logs the refusals of its rank tool.
- [ ] Tests, including the guard broken on purpose.

# Verification

```sh
cd packages/store && go tool sqlc generate && git diff --exit-code -- db.go models.go '*.query.sql.go' && make check-docs
cd packages/store && gofmt -l . && go vet ./... && go test ./... -race
cd packages/housekeeping && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

# Notes

- The guard counts users who hold both `housekeeping.accessGroups` and `housekeeping.access`. Holding the first alone
  opens nothing, so a guard on it alone would let the last manager lose the way in, and nobody edits the database by hand.
- The phase has no route to delete a group, so none is built.
