---
type: Task
title: Archive habbos
description: A user archives a habbo from /account/habbos, which hides it and frees a slot, and its name stays reserved.
status: todo
phase: fx
depends_on: [fx-04]
packages: [packages/store, packages/auth, packages/cms]
holo: []
timestamp: 2026-11-02T01:25:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-02T01:25:45+00:00"}
---

# Goal

A user can retire a habbo, and nothing about it is lost.

# Steps

- [ ] `avatars.archived_at`, and a filter on the queries that read habbos.
- [ ] `POST /account/habbos/{id}/archive`, with the password.
- [ ] Refuse the active habbo, and a habbo that owns a group.
- [ ] An archived habbo cannot sign in, and it leaves the limit, the lists and the promo.
- [ ] Its name stays reserved.

# Verification

```sh
# gofmt, go vet and go test -race in every module of go.work
pnpm --filter @project-reborn/components test
pnpm --filter @project-reborn/components check
make e2e
```

# Notes

- None yet.
