---
type: Task
title: Map hh_tutorial
description: Write /reference/r26/hh_tutorial.md from the .ls scripts: every message hh_tutorial receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_tutorial/5_Tutorial Handler Class.ls", "packages/client-r26/src/game/hh_tutorial/15_NUH Handler Class.ls"]
timestamp: 2026-11-09T18:53:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:53:14+00:00"}
---

# Goal

`/reference/r26/hh_tutorial.md` describes the protocol of `hh_tutorial` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S7](/phases/s7-club-help-extras.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_tutorial/` through `tr '\r' '\n'`.
- [x] From `5_Tutorial Handler Class.ls`, `15_NUH Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`5_Tutorial Handler Class.ls`: 5 in, 6 out; `15_NUH Handler Class.ls`: 7 in, 4 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_tutorial/5_Tutorial Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_tutorial/15_NUH Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 83 concepts, 0 problems.
- `5_Tutorial Handler Class.ls`: 5 `tMsgs.setaProp` and 6 `tCmds.setaProp`; `15_NUH Handler Class.ls`: 7 and 4; each
  registered by one `registerListener` and one `registerCommands` on `connection.info.id`, as
  [Registering scripts](/reference/client-r26.md#registering-scripts) says.

The cast's 11 `.ls` files were read through an LF copy, the two handlers and the two components in full, with the
NUH interface's windows, the tutorial's start in `hh_navigator`, its restart button in `hh_room_utils`, and
`hh_entry_init`'s notes on 308. A script cross-checked the document against the handlers: its two tables hold exactly
the 12 messages, with their handlers, and the 10 commands, with their ids, that the two handlers register, and each of
the 12 places that send them appears in its command's row with its script and handler.

# Notes

- Runs on the branch `s1-tutorial`.
- NUH is the new-user help.
