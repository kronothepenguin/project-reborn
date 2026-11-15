---
type: Decision
title: The client's plan lives in plans/client
description: plans/client plans how the R26 client reaches the player's browser, as a bundle of its own beside holo-port and server, because only its client page comes from HoloCMS.
status: superseded
superseded_by: knowledge/workflow.md
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [process, plans]
---

# Decision

- `plans/client/` holds the decisions, phases, tasks, reference documents and log of how the R26 client reaches the
  player's browser: the CMS's client page on LibreShockwave, one program that serves the client's files, and a vanilla
  JavaScript client. It is an OKF 0.2 bundle in the format of `plans/server`, worked through the `tracking-plans`
  skill.
- It is not a phase of `plans/holo-port`.
- Its phases are planned with their open questions, and get their tasks when the user starts them.

# Context

The user: "in my idea i want to use libreshockwave to serve dcr for now in the cms client, i don't know if it is worth
to plan it in isolate or just add as an extension in @plans/holo-port/ ."

Offered a plan of its own, a phase of holo-port, the page in holo-port and the rest in a plan of its own, or a line in
`plans/later.md` until the work starts, the user chose a plan of its own. Of this work only the client page comes from
HoloCMS, and Holo's `client.php` printed no more than an `<object>` tag for Adobe's Shockwave plugin, pointing at a
`.dcr` hosted elsewhere. LibreShockwave, serving the client's files and the JavaScript client are new.

# Consequences

- The client page that holo-port deferred (`knowledge/decisions/holo-port/0013-defer-game-server-features.md`,
  `knowledge/sources/holocms/pages.md`) is planned in C1.
- `plans/index.md` and the `tracking-plans` skill list the plan.
