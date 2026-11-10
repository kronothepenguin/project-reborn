---
type: Task
title: Keep the session alive and end it
description: The server pings and the client answers, the latency test is answered and its reports logged, and a closed connection logs the habbo out.
status: done
phase: s2
depends_on: [s2-06]
packages: [packages/server]
client: ["packages/client-r26/src/game/hh_entry_init/8_Login Handler Class.ls", "packages/client-r26/src/game/hh_entry_init/7_Login Component Class.ls", "packages/client-r26/src/game/hh_shared/57_Error Report Handler Class.ls"]
timestamp: 2026-11-10T02:54:50+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:54:50+00:00"}
---

# Goal

The session stays alive with pings until the habbo leaves, and its end logs the habbo out ([hh_entry_init](/reference/r26/hh_entry_init.md), Ping and latency).

# Steps

- [x] Ask the user how often the server pings and how long it waits for `PONG`; the answers become decisions:
  [0042](/decisions/0042-ping-every-30-seconds.md).
- [x] The two settings of [0042](/decisions/0042-ping-every-30-seconds.md), `game.pingSeconds` and
  `game.pongTimeoutSeconds`, in the catalogue and housekeeping's Game form.
- [x] `PING` (50) at that rate, and `PONG` (196) awaited; a session that stops answering is closed.
- [x] `TEST_LATENCY` gets 354 with its id, and `REPORT_LATENCY` is logged ([0036](/decisions/0036-latency-reports-are-logged.md)).
- [x] A connection that closes, from either end, logs the habbo out through `game`.
- [x] Tests with the Go test client.

# Verification

```sh
cd packages/server && go test ./... -race
make gates
```

Results:

- The settings `game.pingSeconds`, 30, and `game.pongTimeoutSeconds`, 90, both between 1 and 3600, with a rule that the
  timeout is longer than the interval, are in the catalogue and in housekeeping's Game form
  ([0042](/decisions/0042-ping-every-30-seconds.md)).
- Every session, from `HELLO` on, gets `PING` (50) at that rate; `PONG` (196) keeps it alive, and a session without one
  for the timeout is closed when its time is up, logged as `closed: no PONG for …`, and its habbo logged out.
- `TEST_LATENCY` gets 354 with its id, and `REPORT_LATENCY` is logged, never saved
  ([0036](/decisions/0036-latency-reports-are-logged.md)).
- A connection that closes from either end logs its habbo out through `game.Logout`, as s2-06 made it, now also when
  the server closes a silent client.
- The step on `hh_shared`'s error reports went to S7 ([0054](/decisions/0054-error-reports-wait-for-s7.md)).
- `go test ./... -race` passes in `packages/server`, with `TestTheServerPingsAndKeepsAClientThatAnswers`,
  `TestASilentClientIsClosedAndItsHabboLoggedOut`, `TestTheLatencyTestInBytes` and `TestALatencyReportIsLogged`; in
  `packages/virtual`, with `TestTheGameSettingsHoldTheirDefaults` and `TestThePingTimeoutIsLongerThanTheInterval`; and in
  `packages/housekeeping`, after `make frontends`, with `TestTheGameFormHoldsTheClientsSettings`.
- The README of `packages/server` describes it.

# Notes

- Runs on the branch `s2-keeping-the-session-alive`.
- Its step on `hh_shared`'s error reports went to S7 ([0054](/decisions/0054-error-reports-wait-for-s7.md)): the
  client sends none.
