---
type: Task
title: Map hh_navigator
description: Write /reference/r26/hh_navigator.md from the .ls scripts: every message hh_navigator receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls"]
timestamp: 2026-11-09T18:19:28+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:19:28+00:00"}
---

# Goal

`/reference/r26/hh_navigator.md` describes the protocol of `hh_navigator` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S3](/phases/s3-navigator.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_navigator/` through `tr '\r' '\n'`.
- [x] From `6_Navigator Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`6_Navigator Handler Class.ls`: 18 in, 18 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_navigator/6_Navigator Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 80 concepts, 0 problems.
- `6_Navigator Handler Class.ls`: 18 `tMsgs.setaProp` and 18 `tCmds.setaProp`, registered by one `registerListener`
  and one `registerCommands` on `connection.info.id`, as
  [Registering scripts](/reference/client-r26.md#registering-scripts) says.

The cast's 5 `.ls` files were read through an LF copy: the handler and the info broker in full, and the component's
and the room list's sends, their callers, the state after the login and room entry. A script cross-checked the
document against them: its two tables hold exactly the 18 messages, with their handlers, and the 18 commands, with
their ids, that the handler registers, and each of the 19 places in any cast that sends one of them appears in its
command's row with its script and handler.

# Notes

- Runs on the branch `s1-navigator`.
