---
type: Task
title: Map hh_shared
description: Write /reference/r26/hh_shared.md from the .ls scripts: every message hh_shared receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_shared/5_Hobba Handler Class.ls", "packages/client-r26/src/game/hh_shared/7_Server Date Class.ls", "packages/client-r26/src/game/hh_shared/57_Error Report Handler Class.ls", "packages/client-r26/src/game/hh_shared/63_Statistics Broker Class.ls", "packages/client-r26/src/game/hh_shared/64_Statistics Broker Javascript Class.ls", "packages/client-r26/src/game/hh_shared/71_OLD Figure System Class.ls"]
timestamp: 2026-11-09T17:46:18+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T17:46:18+00:00"}
---

# Goal

`/reference/r26/hh_shared.md` describes the protocol of `hh_shared` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S2](/phases/s2-login.md) and [S7](/phases/s7-club-help-extras.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_shared/` through `tr '\r' '\n'`.
- [x] From `5_Hobba Handler Class.ls`, `7_Server Date Class.ls`, `57_Error Report Handler Class.ls`, `63_Statistics Broker Class.ls`, `64_Statistics Broker Javascript Class.ls`, `71_OLD Figure System Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`5_Hobba Handler Class.ls`: 4 in, 6 out; `7_Server Date Class.ls`: 1 in, 1 out; `57_Error Report Handler Class.ls`: 1 in, 0 out; `63_Statistics Broker Class.ls`: 1 in, 0 out; `64_Statistics Broker Javascript Class.ls`: 1 in, 0 out; `71_OLD Figure System Class.ls`: 0 in, 1 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_shared/5_Hobba Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_shared/7_Server Date Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_shared/57_Error Report Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_shared/63_Statistics Broker Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_shared/64_Statistics Broker Javascript Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_shared/71_OLD Figure System Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 78 concepts, 0 problems.
- `5_Hobba Handler Class.ls`: 4 `tMsgs.setaProp` and 6 `tCmds.setaProp`; `7_Server Date Class.ls`: 1 and 1;
  `57_Error Report Handler Class.ls`: 1 and none, with an empty `tCmds` registered; `63_Statistics Broker Class.ls`
  and `64_Statistics Broker Javascript Class.ls`: one inline `[166: …]` list each, given to `registerListener`;
  `71_OLD Figure System Class.ls`: an empty `tMsgs` and 1 `tCmds.setaProp`. All on `connection.info.id`, and all match
  [Registering scripts](/reference/client-r26.md#registering-scripts).

`grep` for `getConnection`, the `Get…From` readers, `.content` and the `connection.*` variables over an LF copy of the
cast's 28 `.ls` files finds 11 scripts that reach a connection, and the other 17 reach none. The 8 this document
covers were read in full; the other 3 send `LANGCHECK` and `BTCKS`, as [hh_entry_init](/reference/r26/hh_entry_init.md)
says. A script then cross-checked the document against the scripts: its two tables hold exactly the 7 messages,
with their handlers, and the 8 commands, with their ids, that the six scripts register, and each of the 8 places in
any cast that sends one of the 8 commands appears in its command's row with its script and handler.

# Notes

- Runs on the branch `s1-shared`.
- Hobba is the call for help and moderation.
