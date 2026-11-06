---
type: Task
title: Declare the hosts and ports of info and mus in config.json
description: packages/config gains server.info and server.mus, a host and a port each, on which the server runs its WebSocket listeners.
status: todo
phase: s0
depends_on: [s0-03]
packages: [packages/config]
client: []
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
---

# Goal

`config.json` gives the server's two connections, `info` and `mus`, a host and a port each
([0020](/decisions/0020-info-and-mus-websocket-ports.md)). They are startup keys: the server needs them before it opens
the database (`plans/holo-port/decisions/0023-config-holds-startup-keys.md`).

# Steps

- [x] Ask the user S0's open question for this task: the keys and their defaults. Recorded as
  [0019](/decisions/0019-info-and-mus-listeners.md); asked how a connection is switched off, the user answered with
  [0020](/decisions/0020-info-and-mus-websocket-ports.md), which supersedes it.
- [ ] Add the section with the `adding-config-sections` skill: `server.info` and `server.mus`, each with a `host` and a
  `port`, by default `localhost` and 30000, and `localhost` and 30001.
- [ ] Validation checks each `host` as `cms.host` is checked, refuses a port outside 1 to 65535, and refuses `info`
  and `mus` on the same port.
- [ ] Key paths of three levels, such as `server.info.port`, work with `Differences()` and `Rewrite()`.
- [ ] The README's declared keys list the four keys.
- [ ] The installer and the new-keys update follow what the skill says for a new section.

# Verification

```sh
cd packages/config && gofmt -l . && go vet ./... && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s0`.
