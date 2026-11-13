---
type: Reference
title: Sources
description: The outside code and files the project reads, and what each is read for.
---

# Sources

| Source | What it is | Read for |
| --- | --- | --- |
| `source/holocms/` | HoloCMS, the site and housekeeping of 2008, in PHP on MySQL | The site's pages, which behave exactly as Holo's ([0034](/decisions/holo-port/0034-behaviour-matches-holo.md)), and Holo's client page |
| `source/holoemu/` | The Holograph Emulator for V26, a game server of 2008, in C# on MySQL | The game server, only when the client's `.ls` scripts are not enough ([0016](/decisions/server/0016-holoemu-is-a-reference.md)) |
| `packages/client-r26/src/game/` | The R26 client's casts: their Lingo scripts (`.ls`) beside their JavaScript translations | The game's protocol, which comes from the `.ls` scripts only ([0008](/decisions/server/0008-reverse-engineer-ls-only.md)) |
| `vendor/LibreShockwave/` | LibreShockwave, a Shockwave player, decompiler and SDK in C++ with a WebAssembly player, under the AGPL-3.0, a git submodule | The `#mus` framing ([0015](/decisions/server/0015-client-on-libreshockwave.md)), and the client, which runs the `.dcr` on it ([0003](/decisions/client/0003-libreshockwave-submodule.md)) |
| `vendor/HabboWidgets/` | Habbo's Flash widgets ported to HTML5, a git submodule | The landing promo, the registration's look editor and the group badge editor |
