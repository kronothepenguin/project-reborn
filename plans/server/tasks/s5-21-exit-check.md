---
type: Task
title: Check S5's exit criteria
description: From the merged work, check every exit criterion of S5 and close the phase.
status: todo
phase: s5
depends_on: [s5-01, s5-02, s5-03, s5-04, s5-05, s5-06, s5-07, s5-08, s5-09, s5-10, s5-11, s5-12, s5-13, s5-14, s5-15, s5-16, s5-17, s5-18, s5-19, s5-20, s5-22]
packages: [packages/server, packages/store, packages/virtual, packages/cms, packages/housekeeping]
client: []
timestamp: 2026-11-11T15:10:47+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-11T15:10:47+00:00"}
---

# Goal

S5 is done ([S5](/phases/s5-furni-catalogue.md#exit-criteria)).

# Steps

- [ ] Each exit criterion checked against the merged work, with a test that covers it end to end where none does.
- [ ] `make install` leaves no tracked change, and every gate passes.
- [ ] S5 is `done` in its phase file, the phase index and the bundle's index, and the next phase's open questions are
  ready to ask.

# Verification

```sh
make install && git status --short
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s5-exit-check`.
