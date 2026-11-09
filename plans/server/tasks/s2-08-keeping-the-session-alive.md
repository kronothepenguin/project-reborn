---
type: Task
title: Keep the session alive and end it
description: The server pings and the client answers, the latency test is answered and its reports logged, error reports are logged, and a closed connection logs the habbo out.
status: todo
phase: s2
depends_on: [s2-06]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls", "packages/client-r26/src/game/hh_entry_init/7_Login Component Class.ls", "packages/client-r26/src/game/hh_shared/57_Error Report Handler Class.ls"]
timestamp: 2026-11-09T22:15:00+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
---

# Goal

The session stays alive with pings until the habbo leaves, and its end logs the habbo out ([hh_entry_init](/reference/r26/hh_entry_init.md), Ping and latency).

# Steps

- [x] Ask the user how often the server pings and how long it waits for `PONG`; the answers become decisions:
  [0042](/decisions/0042-ping-every-30-seconds.md).
- [ ] `PING` (50) at that rate, and `PONG` (196) awaited; a session that stops answering is closed.
- [ ] `TEST_LATENCY` gets 354 with its id, and `REPORT_LATENCY` is logged ([0036](/decisions/0036-latency-reports-are-logged.md)).
- [ ] `hh_shared`'s error reports are logged.
- [ ] A connection that closes, from either end, logs the habbo out through `game`.
- [ ] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

# Notes

- Runs on the branch `s2-keeping-the-session-alive`.
