---
type: Phase
title: C3 The JavaScript client
description: The client page runs the R26 client in vanilla JavaScript, without LibreShockwave or the .dcr.
status: planned
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [c3, client]
---

# Goal

The client page runs the R26 client in vanilla JavaScript, without LibreShockwave or the `.dcr`
([0002](/decisions/0002-libreshockwave-first-then-javascript.md)).

# Scope

The user: "later i plan to remake dcr into vanilla js."

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- How it relates to `packages/client-r26` and `packages/director`, the translation of the client's scripts and the
  Director runtime the repository holds: whether it carries them on or starts again.
- Which source it is made from: the recent decompile of [C1](/phases/c1-client-page-on-libreshockwave.md), or the
  `.ls` scripts of `packages/client-r26/src/game/`.
- What "vanilla" rules out: frameworks, a build step, or both.
- Whether the page changes to it at once, or offers both clients for a while.
