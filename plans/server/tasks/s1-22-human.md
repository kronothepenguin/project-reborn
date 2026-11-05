---
type: Task
title: Map hh_human
description: Write /reference/r26/hh_human.md from the .ls scripts: every message hh_human receives and every command it sends, with their fields, senders and flows.
status: todo
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_human/11_Figure System Class.ls"]
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`/reference/r26/hh_human.md` describes the protocol of `hh_human` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S2](/phases/s2-login.md) implement it without reading the Lingo again.

# Steps

- [ ] Read every `.ls` script of `packages/client-r26/src/game/hh_human/` through `tr '\r' '\n'`.
- [ ] From `11_Figure System Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [ ] For each message, the fields its handler reads, in order, with their types.
- [ ] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [ ] The flows: what the client sends, and what it waits for in return.
- [ ] Notes: dead code, quirks, and ids that other casts register too.
- [ ] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`11_Figure System Class.ls`: 0 in, 1 out), or the document says why they differ.
- [ ] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_human/11_Figure System Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

# Notes

- Runs on the branch `s1-human`.
