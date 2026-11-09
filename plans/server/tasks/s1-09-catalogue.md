---
type: Task
title: Map hh_cat_code
description: Write /reference/r26/hh_cat_code.md from the .ls scripts: every message hh_cat_code receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_cat_code/5_Catalogue Handler Class.ls", "packages/client-r26/src/game/hh_cat_code/12_Catalogue pets Class.ls"]
timestamp: 2026-11-09T19:03:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:03:02+00:00"}
---

# Goal

`/reference/r26/hh_cat_code.md` describes the protocol of `hh_cat_code` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S5](/phases/s5-furni-catalogue.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_cat_code/` through `tr '\r' '\n'`.
- [x] From `5_Catalogue Handler Class.ls`, `12_Catalogue pets Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`5_Catalogue Handler Class.ls`: 7 in, 3 out; `12_Catalogue pets Class.ls`: 1 in, 1 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_cat_code/5_Catalogue Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_cat_code/12_Catalogue pets Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 84 concepts, 0 problems.
- `5_Catalogue Handler Class.ls`: 7 `tMsgs.setaProp` and 3 `tCmds.setaProp`; `12_Catalogue pets Class.ls`: 1 and 1,
  registered in its `construct`; each by one `registerListener` and one `registerCommands` on `connection.info.id`, as
  [Registering scripts](/reference/client-r26.md#registering-scripts) says.

The cast's 14 `.ls` files were read through an LF copy, the handler, the component and the pet page in full, with
the interface's index, order dialog and page scripts, and every page that gives an extra value. A script
cross-checked the document against the two registering scripts: its two tables hold exactly the 8 messages, with
their handlers, and the 4 commands, with their ids, that they register, and each of the 4 places that send them
appears in its command's row with its script and handler.

# Notes

- Runs on the branch `s1-catalogue`.
