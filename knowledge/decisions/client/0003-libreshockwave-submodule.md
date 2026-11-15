---
type: Decision
title: LibreShockwave is a submodule at vendor/LibreShockwave
description: LibreShockwave is a git submodule at vendor/LibreShockwave, pinned at commit 3f90480, the one the game server's plan read, and the plans read it there instead of a clone of their own.
status: accepted
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [client, sources]
---

# Decision

- LibreShockwave (`https://github.com/LibreShockwave/LibreShockwave`) is a git submodule at `vendor/LibreShockwave`,
  beside `vendor/HabboWidgets`.
- It is pinned at `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b`, the commit
  `knowledge/decisions/server/0015-client-on-libreshockwave.md` read, which was also its `master` when it was added.
- Every plan reads LibreShockwave there, not in a clone of its own.

# Context

The user: "btw i also want to clone as a git submodule https://github.com/LibreShockwave/LibreShockwave into @vendor/
and will add dcr later to decompile them and have a recent r26 source using libreshockwave."

# Consequences

- A fresh worktree runs `git submodule update --init vendor/LibreShockwave` before reading it.
- The game server's task that framed `#mus` reads the Multiuser Xtra in the submodule.
- Decompiling the R26 `.dcr` with LibreShockwave's asset extractor is part of
  C1, once the user has added the `.dcr`.
- LibreShockwave is licensed under the AGPL-3.0 ([LibreShockwave](/sources/libreshockwave.md#licence)).
