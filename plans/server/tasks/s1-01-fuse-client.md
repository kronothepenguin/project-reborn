---
type: Task
title: Describe fuse_client's connections, framing and values
description: Write /reference/r26/fuse_client.md: how the client opens its #info and #mus connections, frames packets both ways, encodes every value, and registers listeners and commands.
status: todo
phase: s1
depends_on: []
packages: []
client: ["packages/client-r26/src/game/fuse_client/12_Connection API.ls", "packages/client-r26/src/game/fuse_client/33_Connection Manager Class.ls", "packages/client-r26/src/game/fuse_client/51_Connection Instance Class.ls", "packages/client-r26/src/game/fuse_client/24_Multiuser API.ls", "packages/client-r26/src/game/fuse_client/45_Multiuser Manager Class.ls", "packages/client-r26/src/game/fuse_client/52_Multiuser Instance Class.ls", "packages/client-r26/src/game/fuse_client/42_Binary Manager Class.ls"]
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`/reference/r26/fuse_client.md` describes the connection layer every cast stands on, so that
[s0-06](/tasks/s0-06-encoding.md) writes the encoding and [s0-07](/tasks/s0-07-r26-sessions.md) the framing from it,
byte for byte.

# Steps

- [ ] Read the scripts in `client:` through `tr '\r' '\n'`.
- [ ] Connections: how `#info` and `#mus` open (host and port variables, retries), close, and report a lost
  connection (the `-1` message), and that `connection.room.id` is `#info`.
- [ ] Framing, both ways, with a worked example of a whole packet in bytes for each direction.
- [ ] Values: B64, VL64, strings both ways, `#short`, booleans, bytes and raw bodies, each with worked examples,
  among them negative numbers, the largest VL64 and UTF-8 text.
- [ ] How `registerListener` and `registerCommands` map ids and names, and what the manager does with an id that no
  script registered.
- [ ] The `#mus` connection's format, as the Multiuser and Binary Manager scripts write and read it.
- [ ] Encryption: what the client would do if the server sent `SERVERSECRETKEY`, in a short note, since the server
  skips it ([0012](/decisions/0012-no-encryption.md)).
- [ ] The document follows the [protocol reference format](/reference/client-r26.md#protocol-reference-format) where it
  fits, with `# Connections`, `# Framing` and `# Values` in place of the message tables, and is listed in
  `/reference/r26/index.md`.

# Verification

```sh
python3 -I .agents/skills/tracking-plans/scripts/check_bundle.py plans/server
```

Each worked example is checked by hand against the Lingo it comes from.

# Notes

- Runs on the branch `s1-fuse-client`. S0's encoding waits for it.
