---
type: Decision
title: Changes from the site reach the server like Holo's MUS commands
description: When the CMS or housekeeping changes something the server holds, the server is told, as Holo told its emulator with MUS commands, and under the orchestrator the CMS and housekeeping change the virtual state directly.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, cms, housekeeping, orchestrator]
---

# Decision

- When the CMS or housekeeping changes something the server holds, housekeeping giving credits to a habbo who is online
  for example, the server is told, as Holo told its emulator with MUS commands (`UPRC`: refresh credits).
- Under the orchestrator, the CMS, housekeeping and the server run in one process, and the CMS and housekeeping change
  the virtual state directly.
- The user will add a Holo source to `source/`. The commands, and how they travel between programs that run apart, are
  settled from it in [S9](/phases/s9-site-changes.md).

# Context

Asked how a change made by the CMS or housekeeping reaches a player who is online, the user answered: "i like Holo's MUS
commands idea, that's the way to go, i'll add a holo source code to the source folder, but, as i want to have
orchestractor, the same process will have cms+housekeeping+game server, so cms and housekeeping can modify the virtual
state directly."

Holo's MUS commands: `plans/holo-port/reference/holo-protocols.md`.

# Consequences

- The virtual state must be safe to change from the CMS and housekeeping as well as from the server.
- `plans/later.md` records it among what is decided for the orchestrator.
