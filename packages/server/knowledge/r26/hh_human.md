---
type: Reference
title: R26 hh_human
description: How the R26 client reads the figure strings the server sends, from the figure data files it downloads, and the one command its figure system registers and never sends, from hh_human's .ls scripts.
timestamp: 2026-11-09T18:15:30+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T17:51:41+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_human/`. Below, scripts of this cast are named by their file name, and scripts of
other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `11_Figure System Class.ls` | Downloads the figure data, and turns a figure string into the parts the client draws (`parseFigure`); registers 0 messages and 1 command |
| `9_Figure Data Class.ls` | The colours and the sets of the figure data, read from its `figuredata` XML |
| `2_Human Class EX.ls`, `3_Swimmer Class EX.ls`, `4_Bot Object Class.ls`, `6_Bodypart Class EX.ls`, `7_Swimpart Class EX.ls`, `12_Figure Preview Class.ls`, `13_Human Template Class.ls`, `15_Change Clothes Effect Class.ls` | Draw users, swimmers and bots from parsed figures; none reaches a connection |

`hh_entry_init/7_Login Component Class.ls` creates the figure system as the object `Figure_System`, and every cast
reads figures through it:

| Script | Figures it reads |
| --- | --- |
| `hh_entry_init/8_Login Handler Class.ls` | The user object's figure, in 5 ([hh_entry_init](/r26/hh_entry_init.md#the-user-object)) |
| `hh_room/5_Room Handler Class.ls`, `hh_room/4_Room Component Class.ls` | The room's users, as `user`, `pelle` for a user in swimwear, or `bot` (s1-06) |
| `hh_friend_list/12_Friend Online List View.ls`, `15_Friend Search Results View.ls`, `31_Friend Infobox Class.ls` | Friends and search results (s1-11) |
| `hh_instant_messenger/8_IM Tabs Class.ls` | The chat partner (s1-12) |
| `hh_ig/15_IGComponentUI Subcomponent Class.ls`, `hh_ig/71_IG PreGame Class.ls` | The players of a game (s1-21) |

# Messages from the server

None.

# Commands from the client

Registered by `11_Figure System Class.ls`.

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 9 | `GETAVAILABLESETS` | `#info` | `hh_shared/71_OLD Figure System Class.ls`: `getAvailableSetList`, no body | none | Never sent: no script creates that class, which registers the command too ([hh_shared](/r26/hh_shared.md#dead-code)), and this cast's figure system has no sender |

# Flows

## Loading the figure data

The figure system works from four files whose addresses are external variables. These are files the client
downloads, not messages: `plans/client/phases/c2-client-files.md` plans where they come from.

| Variable | File |
| --- | --- |
| `external.figurepartlist.txt` | The figure data, a `figuredata` XML of `colors` and `sets`. When the movie or the address is on `http://`, the client adds `graphcount=` with the number of members of its seven `hh_human_*` part casts. A failed download is the fatal error `part_list` |
| `figure.partsets.xml` | The part sets |
| `figure.draworder.xml` | The draw order |
| `figure.animation.xml` | The animations |

A missing variable of the last three is a critical error. Once all four are loaded, the figure system checks a receipt
from `fuse_client`'s special services and sets the variable `figurepartlist.loaded` to 1.

## Reading a figure

`parseFigure` takes a figure string, a sex and a class, `user` when none is given:

| Class | Form of the figure | Reading |
| --- | --- | --- |
| `user`, `pelle` | Digits only, a multiple of 5 long, which `integer()` reads as an integer | 5 characters per part: a set id of 3 digits, then a colour id of 2 |
| `user`, `pelle` | Anything else | Items separated by `.`, each `type-set-colour`, such as `hd-180-1.ch-210-66.lg-270-82.sh-290-80.hr-100-61`. An item with fewer than 3 parts is skipped, and parts after the third are ignored |
| `bot` | Items separated by `&`, each `part=model/colour` | The model loses its leading zeros. The colour is a palette index, 0 being `#EEEEEE`, or `r,g,b`; anything else, or a colour lighter than `#EEEEEE`, becomes `#EEEEEE` |
| any other | — | The string is returned as it is |

For `user` and `pelle`, each set id then gives the parts the figure data lists for that set:

- A part that takes colour gets the colour id's colour from the figure data, and the others `#EEEEEE`; so does every
  part when the colour id is unknown. A set without a colour id takes colour 1.
- A set id the figure data does not hold gives no parts, silently.
- A set's hidden layers remove those parts from the figure, in the order of the variable `human.parts.h`. The
  variable `human.parts.removeList` pairs parts: when the figure has the first of a pair, the second is removed.

# Notes

## Counts

`11_Figure System Class.ls` registers an empty `tMsgs` and 1 command, as
Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`) says.

## Ids other casts register too

- 9: `hh_shared/71_OLD Figure System Class.ls` registers `GETAVAILABLESETS` too, and it alone has a sender, in a class
  no script creates ([hh_shared](/r26/hh_shared.md#ids-other-casts-register-too)). No client sends 9.

## Dead code

- `GETAVAILABLESETS` is registered and never sent, and `pAvailableSetListLoadedFlag` is set to 0 and never read.

## Quirks

- The dotted form ignores each item's type: the figure data knows the type of each set id. Two items with the same
  set id leave the last one's colour.
- The sex plays no part in reading a figure.
- Whether a figure of digits is read as digits depends on `integer()` reading the whole string as one integer; the
  dotted form has no such condition. The site keeps figures in the dotted form (`avatars.figure`), so the server can
  send them as they are.
