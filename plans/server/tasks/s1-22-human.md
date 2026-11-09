---
type: Task
title: Map hh_human
description: Write /reference/r26/hh_human.md from the .ls scripts: every message hh_human receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_human/11_Figure System Class.ls"]
timestamp: 2026-11-09T18:15:30+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:15:30+00:00"}
---

# Goal

`/reference/r26/hh_human.md` describes the protocol of `hh_human` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S2](/phases/s2-login.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_human/` through `tr '\r' '\n'`.
- [x] From `11_Figure System Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`11_Figure System Class.ls`: 0 in, 1 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_human/11_Figure System Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 80 concepts, 0 problems, on the branch with `main` merged.
- `11_Figure System Class.ls`: an empty `tMsgs` and 1 `tCmds.setaProp`, `GETAVAILABLESETS` 9, registered by one
  `registerListener` and one `registerCommands` on `connection.info.id`, as
  [Registering scripts](/reference/client-r26.md#registering-scripts) says.

`grep` for `getConnection`, the `Get…From` readers, `.content`, the `connection.*` variables, `.send(` and the
registrations over an LF copy of the cast's 10 `.ls` files finds only `11_Figure System Class.ls`'s registration, which
was read in full with `9_Figure Data Class.ls`. A script cross-checked the document against them: it holds exactly
the command the script registers, with its id, and the one place in any cast that sends it,
`hh_shared/71_OLD Figure System Class.ls`, appears in its row with its handler.

# Notes

- Runs on the branch `s1-human`.
- No client sends `GETAVAILABLESETS`, so [S2](/phases/s2-login.md)'s scope row for `hh_human` now says so.
