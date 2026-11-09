---
type: Task
title: Map hh_photo
description: Write /reference/r26/hh_photo.md from the .ls scripts: every message hh_photo receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: [s1-01]
packages: []
client: ["packages/client-r26/src/game/hh_photo/4_Photo Handler Class.ls"]
timestamp: 2026-11-09T18:44:16+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:44:16+00:00"}
---

# Goal

`/reference/r26/hh_photo.md` describes the protocol of `hh_photo` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S7](/phases/s7-club-help-extras.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_photo/` through `tr '\r' '\n'`.
- [x] From `4_Photo Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`4_Photo Handler Class.ls`: 1 in, 0 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_photo/4_Photo Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 82 concepts, 0 problems.
- `4_Photo Handler Class.ls` registers in `construct`, with lists of its own: `[4: #handle_film]` on
  `connection.info.id`, and `["OK": #handle_ok, "FILM": #handle_film_mus]` with the Multiuser manager on
  `connection.mus.id`; no command. That is 1 in and 2 on `#mus`, and 0 out, as
  [Registering scripts](/reference/client-r26.md#registering-scripts) says.

The cast's 4 `.ls` files were read through an LF copy, the handler and the component in full, with the camera's save
and `fuse_client`'s `#mus` section. A script cross-checked the document against the handler: its table of messages on
`#info` holds exactly the message, with its handler, that the handler registers there, and no command.

# Notes

- Runs on the branch `s1-photo`.
- The handler registers in `construct`: one message on `#info`, and `OK` and `FILM` on `#mus` through the Multiuser manager, whose format [s1-01](/tasks/s1-01-fuse-client.md) describes.
- `fuse_client/42_Binary Manager Class.ls` also uses `#mus`.
