---
type: Decision
title: The deleted server is the model for the structure
description: The packages/server removed in commit 2ea51d7b is the model for the new server's structure, with separate receive and send interfaces for TCP and WebSocket, the encoding, and a protocol package with one part per client cast.
status: accepted
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [server, history]
---

# Decision

- The game server that commit `2ea51d7b` ("chore: remove out of date code to prevent llm hallucination", 2026-09-11)
  removed from `packages/server` is the model for the structure: TCP and WebSocket behind the same interfaces to receive
  and send, the encoding on its own, and a protocol package with one part per client cast, each part small and in the
  Go way.
- Tasks read it with `git show 2ea51d7b^:packages/server/<path>`; [The old server](/reference/old-server.md) describes
  it and what the decisions of this plan change.

# Context

The user: "there was a server once in this project, but i don't remember the commit where i deleted that (without
claude's help). i liked the structure because it had the same segragated interfaces to receive and send data for tcp
and websockets, the encoding and a package for the protocol, everything modular and simple as the golangs way, if you
can find it, that will help you planning".

The commit was found while planning. The same server had lived in `server/internal/habbo`, `internal/app/game` and
`apps/server` before `packages/server` ([The old server](/reference/old-server.md#where-it-is)).

# Consequences

- The structure decisions that follow it: [0005](/decisions/0005-package-layout.md),
  [0006](/decisions/0006-transport.md) and [0007](/decisions/0007-protocols-per-listener.md).
