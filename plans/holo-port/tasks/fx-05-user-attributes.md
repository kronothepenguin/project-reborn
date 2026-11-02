---
type: Task
title: Give attributes to users
description: Direct attributes join group attributes in every check, the guard counts both, and private user data gets its own attribute.
status: todo
phase: fx
depends_on: []
packages: [packages/store, packages/auth, packages/housekeeping]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

A user can hold an attribute without a group, and emails and IP history take `housekeeping.usersPrivate`.

# Steps

- [ ] A table of direct attributes, with who granted them and when.
- [ ] `auth.Attributes` returns groups and direct attributes together.
- [ ] The guard counts holders of both keys, from groups or directly.
- [ ] `housekeeping.usersPrivate` in the catalogue, and the dashboard's addresses behind it.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
