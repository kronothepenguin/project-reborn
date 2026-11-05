---
type: Task
title: Check S1's exit criteria
description: Cross-check the R26 reference against every registration in the client's scripts, so that no message, command or sender is missing, and close the phase.
status: todo
phase: s1
depends_on: [s1-01, s1-02, s1-03, s1-04, s1-05, s1-06, s1-07, s1-08, s1-09, s1-10, s1-11, s1-12, s1-13, s1-14, s1-15, s1-16, s1-17, s1-18, s1-19, s1-20, s1-21, s1-22]
packages: []
client: []
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

S1 meets its [exit criteria](/phases/s1-protocol-reference.md#exit-criteria) on `main`.

# Steps

- [ ] Every script in [Registering scripts](/reference/client-r26.md#registering-scripts) is covered by a document.
- [ ] Every message id and command name that any `.ls` script registers appears in exactly one document's tables,
  and ids that several casts register are cross-linked in their notes.
- [ ] Every `send(` and `sendNew(` call in every cast, `hh_furni_classes`, `hh_room_ui` and `hh_pets_common`
  included, is listed as a sender of its command.
- [ ] The counts of [Registering scripts](/reference/client-r26.md#registering-scripts) are corrected where a document
  found them different.
- [ ] S1 is `done`; `/index.md` names the active phases.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
```

The cross-checks are scripted in the task, and their output is written here.

# Notes

- Runs on the branch `s1-exit-check`.
