---
type: Task
title: Map hh_friend_list
description: Write /reference/r26/hh_friend_list.md from the .ls scripts: every message hh_friend_list receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_friend_list/5_Friend List Handler Class.ls"]
timestamp: 2026-11-09T18:59:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:59:07+00:00"}
---

# Goal

`/reference/r26/hh_friend_list.md` describes the protocol of `hh_friend_list` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S6](/phases/s6-friends.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_friend_list/` through `tr '\r' '\n'`.
- [x] From `5_Friend List Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`5_Friend List Handler Class.ls`: 11 in, 10 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_friend_list/5_Friend List Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 83 concepts, 0 problems.
- `5_Friend List Handler Class.ls`: 11 `tMsgs.setaProp` and 10 `tCmds.setaProp`, registered by one `registerListener`
  and one `registerCommands` on `connection.info.id`, as
  [Registering scripts](/reference/client-r26.md#registering-scripts) says.

The cast's 12 `.ls` files were read through an LF copy, the handler and the component in full and the interface's
buttons, with the outside senders in `hh_navigator`, `hh_instant_messenger` and `hh_room_ui`. A script cross-checked
the document against them: its two tables hold exactly the 11 messages, with their handlers, and the 10 commands,
with their ids, that the handler registers, and each of the 14 places that send them appears in its command's row
with its script and handler. A search of every cast's `case` labels showed that the decompiler prints a label of
several values on one line, so 260's empty labels are labels of their own.

# Notes

- Runs on the branch `s1-friend-list`.
