---
type: Task
title: Map hh_entry_init: login and opening hours
description: Write /reference/r26/hh_entry_init.md from the .ls scripts: every message hh_entry_init receives and every command it sends, with their fields, senders and flows.
status: done
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls", "packages/client-r26/src/game/hh_entry_init/13_Opening Hours Handler Class.ls"]
timestamp: 2026-11-06T23:35:35+00:00
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T23:35:35+00:00"}
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`/reference/r26/hh_entry_init.md` describes the protocol of `hh_entry_init` in the
[protocol reference format](/reference/client-r26.md#protocol-reference-format), so that [S2](/phases/s2-login.md) implement it without reading the Lingo again.

# Steps

- [x] Read every `.ls` script of `packages/client-r26/src/game/hh_entry_init/` through `tr '\r' '\n'`.
- [x] From `8_Login Handler Class.ls`, `13_Opening Hours Handler Class.ls`: every message id with its handler, and every command name with its id, with their connection.
- [x] For each message, the fields its handler reads, in order, with their types.
- [x] For each command, every script that sends it, in any cast (`grep -rn '"<NAME>"' packages/client-r26/src/game --include='*.ls'`), whether it uses `send` or `sendNew`, and its fields in order.
- [x] The flows: what the client sends, and what it waits for in return.
- [x] Notes: dead code, quirks, and ids that other casts register too.
- [x] The counts match [Registering scripts](/reference/client-r26.md#registering-scripts) (`8_Login Handler Class.ls`: 21 in, 21 out; `13_Opening Hours Handler Class.ls`: 5 in, 1 out), or the document says why they differ.
- [x] List the document in `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
tr '\r' '\n' < "packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
tr '\r' '\n' < "packages/client-r26/src/game/hh_entry_init/13_Opening Hours Handler Class.ls" | grep -nE 'setaProp|register(Listener|Commands)'
```

Results:

- The bundle check: 70 concepts, 0 problems.
- `8_Login Handler Class.ls`: 22 `tMsgs.setaProp`, 21 messages and `-1`, and 21 `tCmds.setaProp`, registered by one
  `registerListener` and one `registerCommands` on `connection.info.id`. The other four `setaProp` lines (213, 240,
  261, 430) fill lists and properties, not registrations.
- `13_Opening Hours Handler Class.ls`: 5 `tMsgs.setaProp` and 1 `tCmds.setaProp`.
- Both match [Registering scripts](/reference/client-r26.md#registering-scripts): 21 in and 21 out, 5 in and 1 out.

A script cross-checked the document against the scripts: its two tables hold exactly the 26 messages and 22 commands
the two handler classes register, with the same handlers and ids, and every one of the 23 places that send one of the
22 commands, found with `grep` over an LF copy of all 414 `.ls` files, appears in its command's row with its script
and handler. Every frame in the document was computed with literal Python ports of `send`, `sendNew`,
`registerCommands`, `GetIntFrom`, `GetStrFrom` and `GetBoolFrom`, read back with them, and agrees with
[fuse_client](/reference/r26/fuse_client.md)'s examples. The four hosts in `startNewSession` were decoded with a port
of `deobfuscate`.

# Notes

- Runs on the branch `s1-entry-init`.
- The handshake that [0012](/decisions/0012-no-encryption.md) relies on holds, step by step
  ([hh_entry_init](/reference/r26/hh_entry_init.md#the-handshake)): `HELLO`, `INIT_CRYPTO`, `CRYPTOPARAMETERS` 0,
  `GENERATEKEY`, `ENDOFCRYPTOPARAMS`, then `VERSIONCHECK`, `UNIQUEID` and `GET_SESSION_PARAMETERS`, the session
  parameters, and `SSO`. Nothing is enciphered, since only `SERVERSECRETKEY` turns encryption on. The client withholds
  `GENERATEKEY` in three cases, among them a key shorter than 2 characters where `the platform` lacks `windows`.
- `-1` (`handleDisconnect`) is the connection manager's signal for a lost connection, not a message.
- S0's sessions wait for it: it comes right after s1-01.
- 308 has a second reader, `hh_tutorial`, which asks for it with the same id 228. [S2](/phases/s2-login.md) gains the
  open question of what the session parameters carry, the tutorial among them.
- The Holograph Emulator was read only for 308, which it never sends; its login differs from these scripts.
