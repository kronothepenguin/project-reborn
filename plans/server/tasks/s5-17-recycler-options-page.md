---
type: Task
title: Port housekeeping's Recycler Options
description: Housekeeping gets HoloCMS's Recycler Options page, which saves the recycler's four settings and writes the staff log.
status: todo
phase: s5
depends_on: [s5-16]
packages: [packages/housekeeping]
client: []
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

Staff set the recycler's rules as in HoloCMS ([0095](/decisions/0095-s5-builds-four-site-pieces.md)).

# Steps

- [ ] The page of `source/holocms/housekeeping/recycler.php`, with its fields, Enable recycler, Minimum owned time,
  Session length and Session expire length, and its texts, saving [s5-16](/tasks/s5-16-recycler.md)'s settings and
  writing the staff log.
- [ ] `plans/holo-port/reference/holo-housekeeping.md` lists the page as ported.
- [ ] Tests.

# Verification

```sh
cd packages/housekeeping && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-recycler-options-page`.
- To settle before it starts:
  - The attribute that opens the page, and its place in housekeeping's menu.
