---
type: Task
title: Add the fuse catalogue
description: A habbo's fuses are the default set, the club fuses for club members, and the staff fuses their access groups grant, from a fuse catalogue beside the site's attributes.
status: todo
phase: s2
depends_on: []
packages: [packages/auth, packages/housekeeping]
client: []
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
---

# Goal

A habbo's fuses follow [0031](/decisions/0031-fuses-defaults-club-and-access-groups.md): the default set, the club fuses for club
members, and the staff fuses their access groups grant.

# Steps

- [ ] A fuse catalogue in `packages/auth`, beside the site's attributes, with the 14 staff fuses of
  [0031](/decisions/0031-fuses-defaults-club-and-access-groups.md), each with its name and what it allows in the client.
- [ ] Access groups grant fuses as they grant attributes, and housekeeping's access groups show them as checkboxes.
- [ ] A function returns a habbo's fuses: `fuse_trade` and `fuse_buy_credits`; `fuse_use_club_dance` and
  `fuse_use_special_room_layouts` while the habbo's club is active; and the fuses of its user's access groups.
- [ ] Tests: the catalogue, the checkboxes, and a habbo's fuses with and without club and groups.

# Verification

```sh
cd packages/auth && go test ./... -race
cd packages/housekeeping && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s2-fuse-catalogue`.
