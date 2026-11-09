---
type: Task
title: Map hh_room_utils
description: Write /reference/r26/hh_room_utils.md from the .ls scripts: every message hh_room_utils receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_room_utils/7_Dialog Handler Class.ls", "packages/client-r26/src/game/hh_room_utils/23_OneWayDoor Manager Class.ls", "packages/client-r26/src/game/hh_room_utils/25_Chat Manager.ls"]
timestamp: 2026-11-09T18:43:01+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:43:01+00:00"}
---

# Goal

`/reference/r26/hh_room_utils.md` describes the protocol of `hh_room_utils` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S4](/phases/s4-rooms.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_room_utils/` through `tr '\r' '\n'`.
- [x] From `7_Dialog Handler Class.ls`, `23_OneWayDoor Manager Class.ls`, `25_Chat Manager.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`7_Dialog Handler Class.ls`: 3 in, 2 out; `23_OneWayDoor Manager Class.ls`: 1 in, 1 out; `25_Chat Manager.ls`: 3 in, 3 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_room_utils/7_Dialog Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_room_utils/23_OneWayDoor Manager Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_room_utils/25_Chat Manager.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 82 concepts, 0 problems.
- `7_Dialog Handler Class.ls`: 3 `tMsgs.setaProp` and 2 `tCmds.setaProp`; `23_OneWayDoor Manager Class.ls`: 1 and 1;
  `25_Chat Manager.ls`: 3 and 3, the first two on `connection.info.id` and the chat on `connection.room.id`, as
  [Registering scripts](/reference/client-r26.md#registering-scripts) says.

The three registering scripts and the help dialogs of `6_Dialog Thread Class.ls` were read in full through an LF
copy, with the one-way door's furniture class and `hh_room`'s `sendChat`. A script cross-checked the document
against them: its two tables hold exactly the 7 messages, with their handlers, and the 6 commands, with their ids,
that the three scripts register, and each of the 5 places that send one of them by name appears in its command's row
with its script and handler. `sendChat` names `CHAT`, `SHOUT` and `WHISPER` through a variable, so their rows were
checked by reading it.

# Notes

- Runs on the branch `s1-room-utils`.
