---
type: Decision
title: reborn stops in order
description: On Ctrl-C or SIGTERM reborn stops taking requests, logs every player out and closes the game's listeners, stops the scheduled tasks and closes the database, with new Shutdown and Stop functions in the game server and the scheduler.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [platform, orchestrator, server, scheduler]
---

# Decision

On Ctrl-C or SIGTERM, reborn:

1. stops taking requests on its web port and lets the open ones finish, for up to 10 seconds;
2. closes the game's listeners and logs every player out, which saves each one's last time online:
   `(*server.Server).Shutdown(ctx)`;
3. stops the scheduled tasks, so that none starts again, and waits for the running ones: `scheduler.Stop()`;
4. closes the database.

The game server's runner does steps 2 to 4 in place of its `select {}`. The runners of the CMS, housekeeping and the
installer stay as they are.

# Context

Asked whether a shutdown in order belongs to the first version, the user chose "Yes, now", and then "This order" for the
sequence above.

# Consequences

- `packages/server` gains `Shutdown`, and `packages/scheduler` gains `Stop`.
- The change to `apps/server/cmd/server/main.go` is the user's file: it is shown and asked.
