---
type: Task
title: Own several habbos
description: Let a user add habbos up to registration.maxHabbosPerUser and switch the active one.
status: todo
phase: p2
depends_on: [p2-04]
packages: [packages/virtual, packages/auth, packages/cms]
holo: []
timestamp: 2026-11-01T20:58:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
---

# Goal

Implement [0001](/decisions/0001-user-owns-many-habbos.md) on the site. Holo has no such page.

# Steps

- [ ] `registration.maxHabbosPerUser`.
- [ ] `GET /account/habbos`: the user's habbos with the active one marked, and the form to add one.
- [ ] `POST /account/habbos`, with the name rules of `/register` and the editor.
- [ ] `POST /account/habbos/{id}/switch`, refusing a habbo of another user.
- [ ] Tests.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then add and switch habbos in a real Chromium.

# Notes

- None yet.
