---
type: Phase
title: S9 Changes from the site
description: Changes the CMS and housekeeping make to what the server holds reach players who are online at once, through commands like Holo's MUS, or directly under the orchestrator.
status: planned
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s9, server, cms, housekeeping]
---

# Goal

When the CMS or housekeeping changes something the server holds, such as a habbo's credits, look, badges or a ban, a
player who is online sees it at once ([0013](/decisions/0013-site-changes-like-mus.md)).

# Scope

- Commands like Holo's MUS (`plans/holo-port/reference/holo-protocols.md`), from the Holo source the user will add to
  `source/`.
- Under the orchestrator, the CMS and housekeeping change the virtual state directly.

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts, once the Holo source is in `source/`.

# Open questions

- The list of commands.
- How the commands travel while the programs run apart.
- How the server's writes keep what the site wrote, such as credits changed in both at once.
