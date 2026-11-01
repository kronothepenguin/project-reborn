---
type: Task
title: Own several habbos
description: Let a user add habbos up to registration.maxHabbosPerUser and switch the active one.
status: done
phase: p2
depends_on: [p2-04]
packages: [packages/virtual, packages/auth, packages/cms]
holo: []
timestamp: 2026-11-01T21:24:08+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-01T20:58:04+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-01T21:24:08+00:00"}
---

# Goal

Implement [0001](/decisions/0001-user-owns-many-habbos.md) on the site. Holo has no such page.

# Steps

- [x] `registration.maxHabbosPerUser`.
- [x] `GET /account/habbos`: the user's habbos with the active one marked, and the form to add one.
- [x] `POST /account/habbos`, with the name rules of `/register` and the editor.
- [x] `POST /account/habbos/{id}/switch`, refusing a habbo of another user.
- [x] Tests.

# Verification

```sh
pnpm --filter @project-reborn/cms build
cd packages/store && go tool sqlc generate && git diff --exit-code . && make check-docs && go test ./... -race
cd packages/auth && gofmt -l . && go vet ./... && go test ./... -race
cd packages/cms && gofmt -l *.go internal && go vet ./... && go test ./... -race
```

Then add and switch habbos in a real Chromium.

Results (2026-11-01T21:24:08+00:00):

- The CMS builds, and `gofmt`, `go vet` and `go test -race` pass in `packages/virtual` and `packages/cms`.
- A script drove the production binary in a real Chromium through 13 checks with no failure, no script error and an empty
  server log: the list, a taken name, a new habbo with the editor's look and no credits, the header's switch link, and
  switching, with the tab and `/me` following.
- Mutation checks: each of these, applied on purpose, failed a test:
  - no limit;
  - the limit counted outside the transaction;
  - the welcome credits repeating;
  - the look not validated;
  - the name not validated;
  - a switch to another user's habbo not refused;
  - no default look.

# Notes

- Holo has no such page, so the texts `<name> is ready to use.`, `You can have <n> habbos at most.` and the page itself are new.
- The limit is `registration.maxHabbosPerUser`, 5 by default, which is the agent's choice.
- A habbo added here starts with no credits, which is the agent's choice: otherwise one account could collect the welcome
  credits once for each habbo.
- A session keeps its active habbo after a switch, and signing in by a habbo's name makes that habbo active.
