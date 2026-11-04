---
type: Task
title: Show the staff page
description: GET /staff lists the staff in one list, as Holo, and shows the two BBCode boxes, while features.staffPage is on.
status: todo
phase: p4
depends_on: [p4-02]
packages: [packages/cms, packages/store, tests/e2e]
holo: [source/holo/staff.php]
timestamp: 2026-11-04T01:28:29+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-04T01:28:29+00:00"}
---

# Goal

Anyone sees the staff team, as in Holo's `staff.php` ([0076](/decisions/0076-one-staff-list.md)).

# Steps

- [ ] The list: every member of a listed group once, sorted by habbo name, with avatar, home link, online state, motto (`No motto`), `Rank:` and `Last Visit:`, and the worn badge.
- [ ] The two boxes with their headings, BBCode bodies and colours.
- [ ] With `features.staffPage` off, the page sends visitors to the landing page, as Holo's did.
- [ ] The store's staff operation and its docs.
- [ ] Tests and a browser suite `staff`.

# Verification

```sh
# gofmt, go vet and go test -race in packages/cms and packages/store
cd tests/e2e && pnpm test staff
```

# Notes

- The group badge waits for [P5](/phases/p5-groups-forum.md).
