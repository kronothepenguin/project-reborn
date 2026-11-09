---
type: Task
title: Map hh_guide
description: Write /reference/r26/hh_guide.md from the .ls scripts: every message hh_guide receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_guide/5_Guide Handler Class.ls"]
timestamp: 2026-11-09T18:41:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:41:14+00:00"}
---

# Goal

`/reference/r26/hh_guide.md` describes the protocol of `hh_guide` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S7](/phases/s7-club-help-extras.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_guide/` through `tr '\r' '\n'`.
- [x] From `5_Guide Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`5_Guide Handler Class.ls`: 5 in, 5 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_guide/5_Guide Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 82 concepts, 0 problems.
- `5_Guide Handler Class.ls`: 5 `tMsgs.setaProp` and 5 `tCmds.setaProp`, registered by one `registerListener` and one
  `registerCommands` on `connection.info.id`, as [Registering scripts](/reference/client-r26.md#registering-scripts)
  says.

The cast's 4 `.ls` files were read through an LF copy, the handler and the component in full and the window's
states and buttons, with `hh_room_ui`'s Room Bar Extensions Manager. A script cross-checked the document against
them: its two tables hold exactly the 5 messages, with their handlers, and the 5 commands, with their ids, that the
handler registers, and each of the 7 places that send them appears in its command's row with its script and handler.

# Notes

- Runs on the branch `s1-guide`.
