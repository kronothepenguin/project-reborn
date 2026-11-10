---
type: Task
title: Wear five badges
description: The store keeps a slot 1 to 5 per worn badge; SETBADGE sets them, 228 and the user lines show them, and the site's badge page keeps working.
status: done
phase: s4
depends_on: [s4-03]
packages: [packages/store, packages/server, packages/cms]
client: []
timestamp: 2026-11-10T20:56:49+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:40:12+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T20:56:49+00:00"}
---

# Goal

A habbo wears up to five badges in slots ([0083](/decisions/0083-a-habbo-wears-five-badges-in-slots.md)).

# Steps

- [x] The store keeps a slot, 1 to 5, for each worn badge, in place of one worn badge, with an update that puts the
  worn badge in slot 1.
- [x] `SETBADGE` (158) sets the five slots of badges the habbo has; 228 and the user lines show them, and the login's
  229 and the online habbo carry them.
- [x] The site's pages and every reader of the worn badge keep working; showing five on the site waits in
  `plans/later.md`, since every phase of the HoloCMS port is done.
- [x] Tests.

# Verification

```sh
cd packages/store && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

Results:

- `avatar_badges` keeps `slot`, 0 to 5, in place of `worn`, with one badge at most in each slot
  ([0083](/decisions/0083-a-habbo-wears-five-badges-in-slots.md)); the update `0012-badge-slots.sql`, not automatic,
  makes the table again and puts the badge a habbo wore in slot 1.
- The site keeps working with one badge: its club purchase and housekeeping's badge tool wear a badge in slot 1, in
  place of the one there, keeping the other slots (`TakeOffAvatarBadge`, `WearAvatarBadge`, `GrantAvatarBadge`); its
  homes, forum posts and staff page show the badge of the first slot filled (`GetWornAvatarBadge`, `ListStaff`, the
  forum's posts); housekeeping's habbo page says Yes for a badge worn in any slot. How the site shows the five waits in
  `plans/later.md`, since every phase of the HoloCMS port is done.
- `SETBADGE` (158) reads five slots and codes and wears each badge the habbo has, once, in the first slot that names
  it: `TakeOffAvatarBadges` then `WearAvatarBadgeInSlot` in one transaction, then the online habbo's `Worn`, five
  codes by slot, and the room gets 228 with the habbo's web id and its badges by slot. The login's 229 lists the
  badges worn with their slots, and the user lines write them `<slot>:<code>`, comma-separated, as the reference says.
  Holo's handler served an older client, with one badge and an on/off flag.
- In `packages/store`, `TestHabboWearsOneBadgeASlot` and `TestBadgeSlots`, with the update test; in `packages/server`,
  `TestWearingFiveBadges`. The store, server, virtual, CMS and housekeeping suites pass with `-race`, and
  `make check-docs` exits 0.

# Notes

- Runs on the branch `s4-five-badge-slots`.
- Split from [s4-07](/tasks/s4-07-room-extras.md).
