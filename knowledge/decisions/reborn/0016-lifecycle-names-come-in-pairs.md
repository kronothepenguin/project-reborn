---
type: Decision
title: Lifecycle names come in pairs, and the scheduler has no stop
description: What starts has Start and Stop, what is initialised has Init and Destroy, what is opened has Open and Close; a package that only mounts routes has neither, and the scheduler's tasks run until the process ends.
status: accepted
timestamp: 2026-11-20T19:15:37-05:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-20T19:15:37-05:00"}
tags: [platform, go, scheduler]
---

# Decision

- A thing that runs has `Start` and `Stop`: the game, reborn.
- A thing that is initialised has `Init` and `Destroy`.
- A thing that is opened has `Open` and `Close`: the database.
- The site, housekeeping and the installer build a struct with `New` and mount routes. They have no `Start` and no
  `Stop`, and their runner owns the HTTP server, so three of them share one server.
- `packages/scheduler` stays as it is: `Every` runs a task until the process ends. It gets no `Start`, no `Stop` and no
  context.

# Context

On 2026-11-20 the master asked the shape of a `scheduler.Stop()`, which
[0007](/decisions/reborn/0007-reborn-stops-in-order.md) named. The user: "yeah, Start + Stop, Init + Destroy. What do we
have now?" Then, of the list of what each package has:

- "Why do still need scheduler?"
- "Does scheduler really needs stop? Isn't the context just enough?"
- "cms, housekeeping, installer have New to build the struct, they only mount routes so they don't need start/stop. Are
  you suggesting starting http servers on packages? even though that breaks our flexibility to have three apps in the
  same http server?"
- "reborn, i don't even know why it has "Run". the running code should live in `apps/reborn` cmds. If it needs to start
  server, then follow the same structure, Start+Stop in `packages/reborn`"
- "`packages/store` is ok with Open+Close, we open and close the database, but we start and stop something like game
  server, or reborn..."

The scheduler runs five clean-ups, each one `DELETE`: old chat lines every hour, and ended room bans, expired password
resets and expired sessions every minute. SQLite finishes a `DELETE` whole or drops it whole, so the end of the process
is a clean stop. Asked "keep it as it is, with no `Start`, no `Stop` and no context?", the user answered "yes".

# Consequences

- [0007](/decisions/reborn/0007-reborn-stops-in-order.md) loses its scheduler step.
