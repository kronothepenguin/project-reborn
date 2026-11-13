---
type: Reference
title: The Holograph Emulator
description: What the Holograph Emulator in source/holoemu is, how its source is laid out, what its three MySQL dumps hold, which fuses it checks and ranks, how to read it, and when the server plan reads it.
timestamp: 2026-11-10T02:01:55+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:44:51+00:00"}
tags: [sources, emulator]
---

# What it is

- The Holograph Emulator (`namespace Holo`), a game server for the Shockwave client written in C# for .NET 3.5 with
  Visual Studio 2008 (`Holograph Emulator.sln`, `Holograph Emulator.csproj`), on MySQL through ODBC.
- This copy is "HoloEMU FULL V26", Vista4life's source with V26 support (`update.txt`). It is the emulator HoloCMS
  talked to: `knowledge/sources/holocms/protocols.md` describes the site's side.
- A reference only ([0016](/decisions/server/0016-holoemu-is-a-reference.md)): it is read when the client's `.ls` scripts
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

# Fuses

The analysis behind [0045](/decisions/server/0045-fuses-holos-club-set-and-every-checked-fuse.md) and
[0046](/decisions/server/0046-the-first-fuses-follow-holos-ranks.md).

- `Source/Managers/rankManager.cs` gives each rank, 1 to 7, the fuses of `system_fuserights` whose `minrank` it reaches,
  and the login sends them as `@B`, the client's 2 (`Source/Virtual/Users/virtualUser.cs`). Rank 1 is a normal user,
  rank 2 Habbo Club and ranks 3 to 7 staff (`knowledge/decisions/holo-port/0054-access-groups-are-holos-ranks.md`); the
  club itself changes nothing, only the rank does. `rankManager.containsRight` is every check the server makes.
- The code reads `system_fuserights` only. Every dump also holds `rank_fuserights`, with the same rows in
  `Resources/holodb.sql` and only the first 30 in the other two.
- The dumps' `system_fuserights` differ: `database.sql` and `holodb.sql` rank `fuse_room_alert` 3 and `fuse_guide` 7,
  and `fuse_chat_log` both 5 and 6; `Resources/holodb.sql` ranks `fuse_room_alert` 4, `fuse_chat_log` 5 and
  `fuse_credits` 6, and lacks `fuse_guide`. `database.sql` is the newest.
- `@U`, the navigator's room details, hides the owner from the holders of `fuse_see_all_roomowners`, the opposite of
  `@Q`, the search, and of its own comment.
- The last column names the client's packets by Holo's two-character headers, and the chat commands by their text.

| Fuse | Rank in `database.sql` | The client checks it in | Holo's server checks it in |
| --- | --- | --- | --- |
| `fuse_trade` | 1 | `hh_room_ui`, `hh_cat_code`, `hh_room` | |
| `fuse_buy_credits` | 1 | `hh_cat_code` | |
| `fuse_use_club_dance` | 2 | `hh_room_ui` | `A]`, a dance with a number, the club dances |
| `fuse_use_special_room_layouts` | 2 | `hh_kiosk_room` | |
| `fuse_habbo_chooser` | 2 | `hh_room`, `:chooser` | |
| `fuse_furni_chooser` | 2 | `hh_room`, `:furni` | |
| `fuse_room_alert` | 3 | | the mod tool's `IH`, `:roomalert` |
| `fuse_enter_full_rooms` | 3 | | `@B`, entering a full room |
| `fuse_alert` | 4 | `hh_shared`, a failed download from another domain | the mod tool's `HH`, `:alert`, `:ra` |
| `fuse_kick` | 4 | `hh_shared`, the mod tool's button | the mod tool's `HI`, `:kick` |
| `fuse_mute` | 4 | | `:shutup`, `:unmute` |
| `fuse_enter_locked_rooms` | 4 | | `@B`, past the club and staff locks; `@y`, past the doorbell and the password; `BV` and the favourites, hidden owners |
| `fuse_remove_stickies` | 5 | `hh_furni_classes`, the post-it | |
| `fuse_ban` | 5 | | the mod tool's `HJ`, `:ban` |
| `fuse_room_kick` | 5 | | the mod tool's `II`, `:roomkick` |
| `fuse_room_mute` | 5 | | `:roomshutup`, `:roomunmute` |
| `fuse_receive_calls_for_help` | 5 | | the lowest rank that receives calls; `CG` answer, `CF` delete, `EC` follow |
| `fuse_see_all_roomowners` | 5 | | `@Q`, hidden owners in the search; `@U`, inverted |
| `fuse_any_room_controller` | 6 | `hh_room`, `hh_room_ui`, `hh_room_utils`, `hh_furni_classes` | `@{`, owner in every room; owners cannot kick (`A_`) or ban (`E@`) the holder |
| `fuse_performance_panel` | 6 | `hh_room`, `:performance` | |
| `fuse_pick_up_any_furni` | 6 | `hh_furni_classes`, opening presents | hears the doorbell of rooms (`sendDataToRights`) |
| `fuse_superban` | 6 | | the IP ban of the mod tool's `HJ`, `:superban` |
| `fuse_moderator_access` | 6 | | `:commandlist`, `:teletome`, `:jatlook`, `:userinfo`, `:whosonline` |
| `fuse_teleport` | 6 | | `:teleport`, `:warp` |
| `fuse_see_flat_ids` | 7 | `hh_navigator`, `hh_shared` | |
| `fuse_administrator_access` | 7 | | `:refresh`, `:cat_transform`, `:ha`, `:offline`, `:mycoords`, `:masscredits` |
| `fuse_freeze` | 7 | | `:freeze`, `:unfreeze` |
| `fuse_credits` | none (6 in `Resources/holodb.sql`) | | `:credits` |
| `fuse_cancel_roomevent` | none | `hh_room_ui`, any room's event | |
| `fuse_catalog_editor` | none | `hh_room`, `:editcatalogue` | |
| `fuse_debug_window` | none | `hh_room`, `hh_room_ui`, `:copypaste`, `:petcontrol`, the connection's log | |
| `fuse_remove_photos` | none | `hh_photo` | |
| `fuse_see_chat_log_link` | none | `hh_shared`, the call for help | |

Nothing checks the other 11 names of `system_fuserights`: `default` (1), `fuse_login` (1), `fuse_room_queue_default`
(1), `fuse_extended_buddylist` (2), `fuse_room_queue_club` (2), `fuse_priority_access` (2), `fuse_mod` (6),
`fuse_ignore_room_owner` (6), `fuse_chat_log` (5), `fuse_hotelalert` (6) and `fuse_guide` (7).

# Reading it

- Lines end in CRLF and most files start with a UTF-8 byte order mark: read them through `tr -d '\r' < "<file>"`.
- Some paths hold spaces, such as `Source/Socket servers/` and `Holograph Emulator.csproj`: quote them.
- Git tracks the source, the project files and the dumps. The build output (`bin/`, `obj/`, `.exe`, `.pdb`), Visual
  Studio's user files (`.suo`, `.csproj.user`) and the signing key (`.pfx`) exist only in the main checkout, hidden by
  `source/holoemu/.gitignore`.
- `update.txt` lists the bugs this build still had: "landscape", "v25/26 console", "pathfinder big hc", "bb replay",
  "rollers", "snowstorm", "diving" and "wobble". What it does there is no evidence of what the client expects.
- Its MUS port is the site's channel, not the client's `#mus` connection
  (fuse_client (`packages/server/knowledge/r26/fuse_client.md`)), which Holo's client page sent to `game.habbohotel.co.uk:30001`.
