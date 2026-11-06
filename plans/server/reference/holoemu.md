---
type: Reference
title: The Holograph Emulator
description: What the Holograph Emulator in source/holoemu is, how its source is laid out, what its three MySQL dumps hold, how to read it, and when the server plan reads it.
timestamp: 2026-11-06T15:44:51+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:44:51+00:00"}
tags: [sources, emulator]
---

# What it is

- The Holograph Emulator (`namespace Holo`), a game server for the Shockwave client written in C# for .NET 3.5 with
  Visual Studio 2008 (`Holograph Emulator.sln`, `Holograph Emulator.csproj`), on MySQL through ODBC.
- This copy is "HoloEMU FULL V26", Vista4life's source with V26 support (`update.txt`). It is the emulator HoloCMS
  talked to: `plans/holo-port/reference/holo-protocols.md` describes the site's side.
- A reference only ([0016](/decisions/0016-holoemu-is-a-reference.md)): it is read when the client's `.ls` scripts
  leave a question open, and the server neither ports it nor follows its structure.

# Layout

| Path | What it holds |
| --- | --- |
| `Source/Core/Core.cs` | `Eucalypt`, the start: MySQL from `bin\config.ini`, the game and MUS ports and the language from the `system_config` table, then both socket servers |
| `Source/Socket servers/gameSocketServer.cs` | The TCP listener of the game, which makes one `virtualUser` per connection |
| `Source/Socket servers/musSocketServer.cs` | The TCP listener of HoloCMS's commands: `HKTM`, `HKMW`, `HKUK`, `HKAR`, `HKSB`, `HKRC`, `UPRA`, `UPRC`, `UPRT`, `UPRS` and `UPRH` |
| `Source/Virtual/Users/virtualUser.cs` | One connection: every packet the client sends, dispatched on its two-character header in a `switch`, about 157 cases before and after login |
| `Source/Virtual/Rooms/` | `virtualRoom.cs`, the floor and wall items (`Items/`) and the pathfinders (`Pathfinder/`) |
| `Source/Virtual/Users/` | The user in a room, its statuses and the song editor |
| `Source/Managers/` | Catalogue, events, ranks, recycler, rooms, sound machine, staff, strings and users |
| `Source/Messenger/` | The friends list: `virtualMessenger` and `virtualBuddy` |
| `Source/Games/` | Game lobbies, games and their players |
| `Source/Bots/virtualBot.cs` | Room bots |
| `Source/Encoding/JeaxEncoding.cs` | B64 and VL64, encoded and decoded |
| `Source/Encryption/Habbo_V24_Crypto.cs` | The V24 client's encryption |
| `Source/DB/DB.cs`, `Source/Console/` | Database access, the console and the INI reader |

# The dumps

Each dump holds the emulator's tables and HoloCMS's `cms_*` tables together.

| File | Made | Tables |
| --- | --- | --- |
| `database.sql` | 2008-10-11, phpMyAdmin | 75 |
| `holodb.sql` | 2008-09-01, a MySQL data transfer | 78 |
| `Resources/holodb.sql` | 2008-08-21, a MySQL data transfer | 73 |

# Reading it

- Lines end in CRLF and most files start with a UTF-8 byte order mark: read them through `tr -d '\r' < "<file>"`.
- Some paths hold spaces, such as `Source/Socket servers/` and `Holograph Emulator.csproj`: quote them.
- Git tracks the source, the project files and the dumps. The build output (`bin/`, `obj/`, `.exe`, `.pdb`), Visual
  Studio's user files (`.suo`, `.csproj.user`) and the signing key (`.pfx`) exist only in the main checkout, hidden by
  `source/holoemu/.gitignore`.
- `update.txt` lists the bugs this build still had: "landscape", "v25/26 console", "pathfinder big hc", "bb replay",
  "rollers", "snowstorm", "diving" and "wobble". What it does there is no evidence of what the client expects.
- Its MUS port is the site's channel, not the client's `#mus` connection
  ([fuse_client](/reference/r26/fuse_client.md)), which Holo's client page sent to `game.habbohotel.co.uk:30001`.
