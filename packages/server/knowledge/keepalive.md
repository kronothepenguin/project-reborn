---
type: Reference
title: Keeping the session alive
description: How the server pings every session, closes a silent one and logs the latency reports.
tags: [server]
---

Every session, from `HELLO` on, is pinged
(`knowledge/decisions/server/0042-ping-every-30-seconds.md`):

- The server sends `PING` (50) every `game.pingSeconds`, 30 by default, and
  the client answers `PONG` (196) at once.
- A session that goes `game.pongTimeoutSeconds`, 90 by default, without a
  `PONG` is closed and logged, `r26 127.0.0.1:53422 closed: no PONG for 1m30s`,
  and its habbo logged out. The timeout must be longer than the interval.
- Both settings are read again each time the session wakes, for its next
  `PING` or for its timeout, whichever comes first.
- `TEST_LATENCY` (315) gets 354 with the id it carries, and `REPORT_LATENCY`
  (316) is logged, never saved
  (`knowledge/decisions/server/0036-latency-reports-are-logged.md`):
  `r26 127.0.0.1:53422 latency: mean 120 ms, 110 ms below twice the mean, 15 answers`.
- The server sends no error report (299) yet: S7 decides when it does
  (`knowledge/decisions/server/0054-error-reports-wait-for-s7.md`).
