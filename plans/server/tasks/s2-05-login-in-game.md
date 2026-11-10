---
type: Task
title: Log a habbo in and out in game
description: game logs a habbo in with an SSO ticket and out, holds the online habbo in virtual, and tells sessions through the interface each one implements, starting with a second login.
status: done
phase: s2
depends_on: [s2-02, s2-03]
packages: [packages/server, packages/virtual]
client: []
timestamp: 2026-11-10T02:12:40+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T22:15:00+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-10T02:12:40+00:00"}
---

# Goal

`game` logs a habbo in with a ticket and out again, holding the online habbo in `virtual`
([0009](/decisions/0009-virtual-holds-the-server-state.md)), and tells sessions about events through the interface each
one implements ([0039](/decisions/0039-rules-notify-sessions-through-an-interface.md)).

# Steps

- [x] `packages/virtual/habbo` gets the online habbos: loaded at login, dropped at logout
  ([0047](/decisions/0047-online-habbos-in-virtual-habbo.md)).
- [x] `game` defines the interface each session implements, as the one `virtual/habbo` declares
  ([0048](/decisions/0048-sessions-through-an-interface-virtual-declares.md)), and its first event: the end of a session
  that a second login replaces ([0029](/decisions/0029-a-second-login-closes-the-first.md)).
- [x] Logging in finds the valid ticket and spends it ([0030](/decisions/0030-sso-tickets-from-the-cms-sign-in.md)), loads the
  habbo, saves the machine id the session holds ([0035](/decisions/0035-the-machine-id-is-saved-per-habbo.md)) and the last time
  online ([0037](/decisions/0037-last-online-at-login-and-logout.md)). When the habbo is already online, the old session gets the
  event and is dropped.
- [x] Logging out writes the last time online and drops the habbo.
- [x] Tests, with the store and fake sessions: a valid ticket logs in once; a spent or unknown one does not; a second
  login ends the first session; a logout writes the last time online.

# Verification

```sh
cd packages/server && go test ./... -race
cd packages/virtual && go test ./... -race
make gates
```

Results:

- `packages/virtual/habbo` holds the online habbos ([0047](/decisions/0047-online-habbos-in-virtual-habbo.md)): `Get`;
  `Add`, which returns the habbo it replaces; and `Drop`, which takes a habbo offline only while the given session plays
  it. It declares `Session`, `Notify(event any)`
  ([0048](/decisions/0048-sessions-through-an-interface-virtual-declares.md)).
- `packages/server/game` starts with `Session`, the same interface, the event `ConcurrentLogin{}`, and the rules `Login`
  and `Logout`. In one transaction, `Login` spends the ticket, reads the habbo, and saves the machine id, when the session
  holds one, and the last time online; then it puts the habbo online and sends `ConcurrentLogin` to the session it
  replaces. An unknown, spent or dead ticket returns `ErrInvalidTicket`. `Logout` writes the last time online and drops
  the habbo, and does nothing for a session that a second login replaced.
- `go test ./... -race` passes in `packages/server`, with `TestATicketLogsItsHabboInOnce`,
  `TestLoginSavesTheMachineIDAndTheLastTimeOnline`, `TestASecondLoginEndsTheFirstSession` and
  `TestLogoutWritesTheLastTimeOnline`, and in `packages/virtual`, with
  `TestAHabboIsOnlineFromAddUntilItsSessionDropsIt`, `TestASecondLoginReplacesTheFirstSession` and
  `TestOnlineHabbosAreSafeForConcurrentUse`.
- The READMEs of `packages/server` and `packages/virtual` describe `game` and `virtual/habbo`, and
  [the architecture](/reference/architecture.md) says how a rule reaches its sessions.

# Notes

- Runs on the branch `s2-login-in-game`.
