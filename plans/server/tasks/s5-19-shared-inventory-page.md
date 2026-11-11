---
type: Task
title: Show the shared inventory on the site
description: The CMS lists the furni of a user that no habbo holds, with a Take button that moves it to the active habbo's hand, and archiving a habbo sends its hand there.
status: todo
phase: s5
depends_on: [s5-04]
packages: [packages/store, packages/cms]
client: []
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

A user reaches the furni that none of its habbos holds ([0095](/decisions/0095-s5-builds-four-site-pieces.md),
`plans/holo-port/decisions/0057-furni-and-rooms.md`).

# Steps

- [ ] The page lists the user's shared furni, and Take moves a furni to the active habbo's hand.
- [ ] Archiving a habbo moves its hand to the shared inventory, in the same transaction
  (`plans/holo-port/decisions/0057-furni-and-rooms.md`).
- [ ] Tests.

# Verification

```sh
cd packages/store && go vet ./... && go test ./... && make check-docs
cd packages/cms && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-shared-inventory-page`.
- To settle before it starts:
  - Where the page goes on the site and how it looks; HoloCMS has no such page.
  - Whether Take moves one furni or several at once.
  - What an archived habbo's rooms do; `plans/holo-port/decisions/0057-furni-and-rooms.md` moves them to the active
    habbo, and nothing does yet.
