---
type: Task
title: Map hh_ig
description: Write /reference/r26/hh_ig.md from the .ls scripts: every message hh_ig receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_ig/3_IG Handler Class.ls"]
timestamp: 2026-11-09T19:35:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:35:41+00:00"}
---

# Goal

`/reference/r26/hh_ig.md` describes the protocol of `hh_ig` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S8](/phases/s8-instant-games.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_ig/` through `tr '\r' '\n'`.
- [x] From `3_IG Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`3_IG Handler Class.ls`: 28 in, 23 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_ig/3_IG Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 87 concepts, 0 problems.
- `3_IG Handler Class.ls`: 28 `tMsgs.setaProp` and 23 `tCmds.setaProp`, registered by one `registerListener` and one
  `registerCommands` on `connection.room.id`, as [Registering scripts](/reference/client-r26.md#registering-scripts)
  says.

The handler was read in full through an LF copy, with the game types, the game list, the level list, the room loader,
the asset import and the invitation classes, and every caller of the handler's `send_` handlers. A script
cross-checked the document against the handler: its two tables hold exactly the 28 messages, with their handlers, and
the 23 commands, with their ids, that it registers, and each of the 21 places that send them appears in its command's
row with its script and handler. The game's own casts, downloaded per game type, are not in the repository; S8 gained
the open question of where they come from.

# Notes

- Runs on the branch `s1-instant-games`.
- The cast has 79 `.ls` scripts: the game's own half lives in them, and the document's flows matter most here.
