---
type: Task
title: Map hh_kiosk_room
description: Write /reference/r26/hh_kiosk_room.md from the .ls scripts: every message hh_kiosk_room receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_kiosk_room/5_RoomKiosk Handler Class.ls"]
timestamp: 2026-11-09T18:54:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:54:04+00:00"}
---

# Goal

`/reference/r26/hh_kiosk_room.md` describes the protocol of `hh_kiosk_room` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S3](/phases/s3-navigator.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_kiosk_room/` through `tr '\r' '\n'`.
- [x] From `5_RoomKiosk Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`5_RoomKiosk Handler Class.ls`: 3 in, 1 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_kiosk_room/5_RoomKiosk Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 83 concepts, 0 problems.
- `5_RoomKiosk Handler Class.ls` registers in `construct`, with lists of its own: 3 `tMessages.setaProp`, 59, 33 and
  353, and an inline `["CREATEFLAT": 29]`, by one `registerListener` and one `registerCommands` on
  `connection.info.id`, as [Registering scripts](/reference/client-r26.md#registering-scripts) says.

The cast's 4 `.ls` files were read in full through an LF copy. A script cross-checked the document against them: its
two tables hold exactly the 3 messages, with their handlers, and the command, with its id, that the handler
registers, and the one place in any cast that sends `CREATEFLAT` appears in its row with its script and handler. The
`SETFLATINFO` and `SETFLATCAT` this cast sends are rows of [hh_navigator](/reference/r26/hh_navigator.md), which
registers them.

# Notes

- Runs on the branch `s1-kiosk-room`.
- The handler registers in `construct`, with a list of its own (`tMessages`), not in `regMsgList`.
