---
type: Task
title: Wear five badges
description: The store keeps a slot 1 to 5 per worn badge; SETBADGE sets them, 228 and the user lines show them, and the site's badge page keeps working.
status: todo
phase: s4
depends_on: [s4-03]
packages: [packages/store, packages/server, packages/cms]
client: []
timestamp: 2026-11-10T19:40:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-10T19:40:12+00:00"}
---

# Goal

A habbo wears up to five badges in slots ([0083](/decisions/0083-a-habbo-wears-five-badges-in-slots.md)).

# Steps

- [ ] The store keeps a slot, 1 to 5, for each worn badge, in place of one worn badge, with an update that puts the
  worn badge in slot 1.
- [ ] `SETBADGE` (158) sets the five slots of badges the habbo has; 228 and the user lines show them, and the login's
  229 and the online habbo carry them.
- [ ] The site's badge page and every reader of the worn badge keep working; showing five there is asked as a
  `plans/holo-port` task.
- [ ] Tests.

# Verification

```sh
cd packages/store && go test ./... && make check-docs
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s4-five-badge-slots`.
- Split from [s4-07](/tasks/s4-07-room-extras.md).
