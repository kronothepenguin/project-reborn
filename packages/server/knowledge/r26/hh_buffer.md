---
type: Reference
title: R26 hh_buffer
description: How the R26 client holds back the updates of furniture whose graphics are still downloading and replays them through hh_room once they arrive, from hh_buffer's .ls scripts.
timestamp: 2026-11-09T18:26:26+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:26:26+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_buffer/`. Below, scripts of this cast are named by their file name, and scripts
of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Buffer Component Class.ls` | The placeholders of furniture whose class is still downloading, the messages held for them, and their replay |
| `4_Buffer Handler Class.ls` | Registers 5 messages and no command, on `connection.room.id` |
| `32_Furniture Placeholder Class.ls` | The animated object drawn in a placeholder's place |

Other casts hand furniture to the buffer and register the same messages:

| Script | Why it is here |
| --- | --- |
| `hh_room/5_Room Handler Class.ls` | Registers the same 5 ids and reads them in full (s1-06); passes each new active object through `processObject`; the buffer replays held messages through its handlers |
| `hh_room/4_Room Component Class.ls` | Passes each new item through `processObject` |
| `hh_dynamic_downloader` | Downloads a class's cast and says whether it is there (s1-20) |
| `hh_soundmachine/3_SoundMachine Interface Class.ls` | Asks for a download with `#downloadObject` |

# Messages from the server

All come on `connection.room.id`, which is `#info`. The buffer reads only what it needs to find the object; `hh_room`
reads each in full.

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 84 | `handle_removeitem` | `#info` (room) | raw: the item id, the first word | Drops the item's placeholder and its held messages |
| 85 | `handle_updateitem` | `#info` (room) | raw: the item id, the first word, then the rest of the item | Held while the item is a placeholder |
| 88 | `handle_stuffdataupdate` | `#info` (room) | string object id; then the rest of the update | Held while the active object is a placeholder |
| 94 | `handle_activeobject_remove` | `#info` (room) | raw: the object id, the first word | Drops the active object's placeholder and its held messages |
| 95 | `handle_activeobject_update` | `#info` (room) | [an active object](#an-active-object) | Held while the active object is a placeholder |

## An active object

`parseActiveObject` reads, in order:

| Field | Notes |
| --- | --- |
| string id | |
| string class | A `*` and what follows it name a variant: the class to download is the part before it |
| int x | |
| int y | |
| int width | |
| int height | |
| int direction | Taken modulo 8, and kept three times over |
| string altitude | A number with a decimal part, read by `getLocalFloat` |
| string colours | Empty becomes `0` |
| string runtime data | |
| int extra | |
| string stuff data | |

# Commands from the client

None.

# Flows

## Furniture still downloading

1. When `hh_room` creates an item or an active object, it passes it through `processObject`. When the object's class
   is not downloaded yet, the buffer keeps the object, gives `hh_room` a placeholder in its place,
   `active_placeholder` of 1 by 1 or `item_placeholder`, and asks `hh_dynamic_downloader` for the class.
2. While the placeholder stands, each 85, 88 or 95 about it is held, the latest of each id replacing the one before.
   An 84 or 94 drops the placeholder and what it held.
3. When the class arrives, the buffer puts the real object in the placeholder's place and replays the held messages
   through `hh_room`'s own handlers, in the order they were held, then executes `#objectFinalized` and
   `#activeObjectsUpdated` or `#itemObjectsUpdated`.
4. Leaving or changing rooms forgets every placeholder and held message.

The server needs nothing of its own for this: it sends the room's messages as usual, and the client holds them.

# Notes

## Counts

`4_Buffer Handler Class.ls` registers 5 messages and an empty `tCmds`, as
Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`) says.

## Ids other casts register too

- 84, 85, 88, 94 and 95: `hh_room/5_Room Handler Class.ls` registers them too, and both handlers run for each message.

## Quirks

- A class name for a room whose tiles are narrower than 64 pixels gets an `s_` in front, and a `poster` its type after
  a space, before the buffer asks whether it is downloaded.
- The variable `buffer.simulateddownload` holds every class back for that many milliseconds, as if it were
  downloading.
