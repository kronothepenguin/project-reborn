---
type: Task
title: Declare the server's listeners in config.json
description: packages/config gains the server's listeners, each a TCP address or a WebSocket path with the name of the protocol it speaks.
status: todo
phase: s0
depends_on: [s0-03]
packages: [packages/config]
client: []
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`config.json` names the server's listeners and the protocol of each ([0007](/decisions/0007-protocols-per-listener.md)).
They are startup keys: the server needs them before it opens the database
(`plans/holo-port/decisions/0023-config-holds-startup-keys.md`).

# Steps

- [x] Ask the user S0's open question for this task: the keys, the default TCP port and the default WebSocket path.
  Record the answer as a decision: [0019](/decisions/0019-info-and-mus-listeners.md).
- [ ] Add the section with the `adding-config-sections` skill: `server.info` and `server.mus`, each with an optional
  `port` and an optional `path`, by default 30000 with `/client/info` and 30001 with `/client/mus`.
- [ ] Validation refuses a connection with neither a port nor a path, a port outside 1 to 65535, a path that does not
  start with `/`, and a port or a path that both connections share.
- [ ] The installer and the new-keys update follow what the skill says for a new section.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s0`.
