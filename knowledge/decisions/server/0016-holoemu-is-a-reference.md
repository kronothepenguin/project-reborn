---
type: Decision
title: The Holograph Emulator is a reference, never a port
description: The Holograph Emulator's source in source/holoemu is read only when the client's .ls scripts are not enough for reverse engineering; the server neither translates it nor follows its structure.
status: accepted
timestamp: 2026-11-06T15:44:51+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:44:51+00:00"}
tags: [protocol, sources]
---

# Decision

- `source/holoemu/` holds the Holograph Emulator for V26, a C# game server of 2008, with three MySQL dumps
  ([The Holograph Emulator](/sources/holoemu.md)).
- It is a reference only. When reverse engineering the client's `.ls` scripts
  ([0008](/decisions/server/0008-reverse-engineer-ls-only.md)), by reading them or with the `rea` skill, leaves a question
  open, an agent may read the emulator to see how a server of the time answered it.
- The server is not a port of it: nothing is translated from it, and the structure stays that of the deleted
  `packages/server` ([0004](/decisions/server/0004-old-server-is-the-model.md)).
- Git tracks its source, its project files and the three dumps. Its build output, Visual Studio's user files and its
  signing key stay on disk in the main checkout, hidden by `source/holoemu/.gitignore`.

# Context

The user: "btw i just added @"source/Holo V26/" as a reference for @plans/server/ , it's not a port with enchancements
like @plans/holo-port/ but rather just a reference if for some reason the client source at
@packages/client-r26/src/game/ isn't enough for reverse engineering purposes /rea ."

Offered names, the user chose `source/holoemu` (`knowledge/decisions/holo-port/0099-holocms-source-folder.md`). Offered
what the folder holds, the user chose to track the sources and the dumps, with the folder `HoloEMU FULL V26` lifted
out so that a path reads `source/holoemu/Source/Core/Core.cs`, and to keep the rest on disk, hidden from git, because
agents work in worktrees, which hold only committed files.

# Consequences

- The `.ls` scripts stay the protocol's source. [0015](/decisions/server/0015-client-on-libreshockwave.md) made
  LibreShockwave's source the one other source, for the `#mus` framing; the emulator is a second one, for what the
  scripts leave open.
- The emulator's `musSocketServer` received HoloCMS's commands, not the client's `#mus` connection, which Holo's client
  page pointed at Habbo's own server.
