---
type: Task
title: Map hh_shared
description: Write /reference/r26/hh_shared.md from the .ls scripts: every message hh_shared receives and every command it sends, with their fields, senders and flows.
status: todo
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_shared/5_Hobba Handler Class.ls", "packages/client-r26/src/game/hh_shared/7_Server Date Class.ls", "packages/client-r26/src/game/hh_shared/57_Error Report Handler Class.ls", "packages/client-r26/src/game/hh_shared/63_Statistics Broker Class.ls", "packages/client-r26/src/game/hh_shared/64_Statistics Broker Javascript Class.ls", "packages/client-r26/src/game/hh_shared/71_OLD Figure System Class.ls"]
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`/reference/r26/hh_shared.md` describes the protocol of `hh_shared` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S2](/phases/s2-login.md) and [S7](/phases/s7-club-help-extras.md) implement it without reading the Lingo again.

# Steps

- [ ] Read every `.ls` script of `packages/client-r26/src/game/hh_shared/` through `tr '\r' '\n'`.
- [ ] From `5_Hobba Handler Class.ls`, `7_Server Date Class.ls`, `57_Error Report Handler Class.ls`, `63_Statistics Broker Class.ls`, `64_Statistics Broker Javascript Class.ls`, `71_OLD Figure System Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [ ] For each message, the fields its handler reads, in order, with their types.
- [ ] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [ ] The flows: what the client sends, and what it waits for in return.
- [ ] Notes: dead code, quirks, and ids that other casts register too.
- [ ] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`5_Hobba Handler Class.ls`: 4 in, 6 out; `7_Server Date Class.ls`: 1 in, 1 out; `57_Error Report Handler Class.ls`: 1 in, 0 out; `63_Statistics Broker Class.ls`: 1 in, 0 out; `64_Statistics Broker Javascript Class.ls`: 1 in, 0 out; `71_OLD Figure System Class.ls`: 0 in, 1 out), or the document says why they differ.
- [ ] List the document in `/reference/r26/index.md`.

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

# Notes

- Runs on the branch `s1-shared`.
- Hobba is the call for help and moderation.
