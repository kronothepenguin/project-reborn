---
type: Task
title: Map hh_room_utils
description: Write /reference/r26/hh_room_utils.md from the .ls scripts: every message hh_room_utils receives and every command it sends, with their fields, senders and flows.
status: todo
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_room_utils/7_Dialog Handler Class.ls", "packages/client-r26/src/game/hh_room_utils/23_OneWayDoor Manager Class.ls", "packages/client-r26/src/game/hh_room_utils/25_Chat Manager.ls"]
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`/reference/r26/hh_room_utils.md` describes the protocol of `hh_room_utils` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S4](/phases/s4-rooms.md) implement it without reading the Lingo again.

# Steps

- [ ] Read every `.ls` script of `packages/client-r26/src/game/hh_room_utils/` through `tr '\r' '\n'`.
- [ ] From `7_Dialog Handler Class.ls`, `23_OneWayDoor Manager Class.ls`, `25_Chat Manager.ls`: every message id with its handler, and every command name with its id, with their connection.
- [ ] For each message, the fields its handler reads, in order, with their types.
- [ ] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [ ] The flows: what the client sends, and what it waits for in return.
- [ ] Notes: dead code, quirks, and ids that other casts register too.
- [ ] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`7_Dialog Handler Class.ls`: 3 in, 2 out; `23_OneWayDoor Manager Class.ls`: 1 in, 1 out; `25_Chat Manager.ls`: 3 in, 3 out), or the document says why they differ.
- [ ] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_room_utils/7_Dialog Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_room_utils/23_OneWayDoor Manager Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_room_utils/25_Chat Manager.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

# Notes

- Runs on the branch `s1-room-utils`.
