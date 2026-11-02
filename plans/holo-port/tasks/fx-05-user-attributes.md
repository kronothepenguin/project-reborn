---
type: Task
title: Give attributes to users
description: Direct attributes join group attributes in every check, the guard counts both, and private user data gets its own attribute.
status: done
phase: fx
depends_on: []
packages: [packages/store, packages/auth, packages/housekeeping]
holo: []
timestamp: 2026-11-02T01:57:44+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:57:44+00:00"}
---

# Goal

A user can hold an attribute without a group, and emails and IP history take `housekeeping.usersPrivate`.

# Steps

- [x] A table of direct attributes, with who granted them and when.
- [x] `auth.Attributes` returns groups and direct attributes together.
- [x] The guard counts holders of both keys, from groups or directly.
- [x] `housekeeping.usersPrivate` in the catalogue, and the dashboard's addresses behind it.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

Results (2026-11-02T01:57:44+00:00):

- `gofmt`, `go vet` and `go test -race` pass in `packages/store`, `packages/auth`, `packages/housekeeping`, `packages/cms` and
  `packages/installer`, and `make check-docs` passes.
- `make e2e` passed all 365 checks, with 19 attributes on the group page.
- Three breaks made on purpose were each caught: `ListUserAttributes` without direct attributes, `ListAttributeHolders` without
  them, and the dashboard's addresses behind `housekeeping.users`.

# Notes

- The page that gives direct attributes belongs to [HK-B](/phases/hk-b-users-moderation.md), so `AddUserAttribute` and
  `RemoveUserAttribute` have only tests as callers for now.
- `housekeeping.usersPrivate` joins the Administrators' attributes by itself, because the installer grants the whole catalogue.
