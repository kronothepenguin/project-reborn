---
type: Task
title: Map hh_room
description: Write /reference/r26/hh_room.md from the .ls scripts: every message hh_room receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_room/5_Room Handler Class.ls"]
timestamp: 2026-11-09T19:30:21+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:30:21+00:00"}
---

# Goal

`/reference/r26/hh_room.md` describes the protocol of `hh_room` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S4](/phases/s4-rooms.md) and [S5](/phases/s5-furni-catalogue.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_room/` through `tr '\r' '\n'`.
- [x] From `5_Room Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`5_Room Handler Class.ls`: 71 in, 72 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_room/5_Room Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 86 concepts, 0 problems.
- `5_Room Handler Class.ls`: 72 `tMsgs.setaProp` and 73 `tCmds.setaProp`, registered by one `registerListener` and
  one `registerCommands` on `connection.room.id`. [Registering scripts](/reference/client-r26.md#registering-scripts)
  counts 71 and 72: it leaves out the message -1 and the command `#room_directory`, whose name is a symbol. The
  document says so.

The handler was read in full through an LF copy, with the component's entering, building and teleport handlers, the
geometry's height map, the interface's furniture and trading, the room UI's buttons, and every outside script that
builds a text body. A script cross-checked the document against the handler: its two tables hold exactly the 72
messages, with their handlers, and the 73 commands, with their ids, that it registers, and each of the 174 places that
send them by name appears in its command's row with its script and handler. `CHAT`, `SHOUT` and `WHISPER` are sent by
the chat mode's name, so their rows were checked by reading `sendChat`.

# Notes

- Runs on the branch `s1-room`.
- The largest cast: its handler alone has 1,215 lines. The furni scripts of `hh_furni_classes` and the room UI of `hh_room_ui` send many of its commands.
- The document may group the messages by topic (habbos, chat, furni, trading, rights, events), as long as every id is in it.
