---
type: Reference
title: The R26 client
description: Where the R26 client's protocol lives in packages/client-r26, how its scripts register and send messages, its wire format and handshake, and the format of the per-cast protocol references.
timestamp: 2026-11-09T21:38:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [client, protocol, r26]
---

# The package

`@project-reborn/client-r26`, a Vite project that depends on `@project-reborn/director` (`packages/director`).

| Path | Holds |
| --- | --- |
| `src/game/<cast>/` | The 63 folders of the client: `habbo`, the movie, with its `Casts.csv` of 73 cast slots; `fuse_client`; and the `hh_*` casts |
| `src/game/habbo/index.js`, `src/game/fuse_client/index.js` | Movie and cast packs that `packages/director/scripts/generate-pack.mjs` generated from `Casts.csv` and `Members.csv` |
| `src/main.js`, `src/worker.js` | Empty files; `src/main.js` is the entry of `index.html` and of the library build |
| `index.html` | An `<x-object>` of 720 × 540 whose `src` is `/src/game/habbo/index.js`, with `<x-param>`s `sw1` to `sw9`: the external variables, `connection.info.port=30000` and `connection.mus.port=30001` among them |
| `vite.config.js` | Vite's library mode: `src/main.js` into `dist/main.es.js` and `dist/main.umd.js`, whose global name is `_director`; and `define`s that read `VITE_*` variables of the environment |
| `vitest.config.js` | The jsdom environment and vitest's globals, with vitest's default test files |
| `public/` | `favicon.svg` and `icons.svg` |

The cast folders hold 414 `.ls` scripts, each beside its `.js` translation, and the casts' media: bitmaps (`.png`),
sounds (`.wav`) and texts (`.txt`, `.rtf`, `.htm`).

Commands, from `packages/client-r26`: `pnpm dev`, `pnpm build` and `pnpm preview`. `make check` runs the `build`
script and the `test` script, `vitest run --passWithNoTests`, which passes while the package holds no test file.

# Where it is

`packages/client-r26/src/game/` holds the R26 Shockwave client, one folder per cast: the decompiled Lingo scripts
(`.ls`), their JavaScript translations (`.js`, ignored here: 0008 (`knowledge/decisions/server/0008-reverse-engineer-ls-only.md`)),
window and variable texts (`.txt`) and each cast's `Members.csv`.

- 295 of the 414 `.ls` files end their lines with CR alone: read them through `tr '\r' '\n' < "<file>"`.
- File names hold spaces (`8_Login Handler Class.ls`), so quote them.
- The numbers in the file names are the cast member numbers.

# Connections

From the variable texts:

| Variable | Value | Used by |
| --- | --- | --- |
| `connection.info.id` | `#info` | the game: almost every cast |
| `connection.room.id` | `#info` | the room casts; the same connection as `#info` |
| `connection.mus.id` | `#mus` | `hh_photo` and `fuse_client/42_Binary Manager Class.ls`, through the Multiuser manager |

The `#mus` connection has a text format of its own, for example `send("LOGIN" && tUserID && tMachineID)` in
`fuse_client`. fuse_client (`packages/server/knowledge/r26/fuse_client.md#the-mus-connection`) describes it.

# How a cast registers

A cast's Handler Class registers, when it is constructed, the messages it receives and the commands it sends:

```lingo
on regMsgList me, tBool
  tMsgs = [:]
  tMsgs.setaProp(316, #handle_poll_offer)    -- message id from the server -> handler
  tCmds = [:]
  tCmds.setaProp("POLL_START", 234)          -- command name -> id sent to the server
  if tBool then
    registerListener(getVariable("connection.info.id"), me.getID(), tMsgs)
    registerCommands(getVariable("connection.info.id"), me.getID(), tCmds)
  ...
```

Some register in `construct` instead, with a list of their own (`5_RoomKiosk Handler Class.ls`) or inline
(`4_Photo Handler Class.ls`). A handler reads its fields in order with `tMsg.connection.GetIntFrom()`,
`GetStrFrom()`, `GetBoolFrom()` and `GetByteFrom()`, or takes the whole body as `tMsg.content`. Scripts send commands
by name with `getConnection(...).send("NAME", ...)`, from any cast.

# Registering scripts

Counted while planning, from the `tMsgs` and `tCmds` lists and the inline lists; S1 confirmed every number and
corrected `hh_room`'s commands from 72 to 73, one of them registered under a symbol, `#room_directory` (2). "In" is
messages from the server, "Out" commands from the client.

| Cast | Script | In | Out | Connection |
| --- | --- | --- | --- | --- |
| `fuse_client` | `42_Binary Manager Class.ls` | — | — | `#mus` |
| `hh_buffer` | `4_Buffer Handler Class.ls` | 5 | 0 | `#info` (room) |
| `hh_cat_code` | `5_Catalogue Handler Class.ls` | 7 | 3 | `#info` |
| `hh_cat_code` | `12_Catalogue pets Class.ls` | 1 | 1 | `#info` |
| `hh_club` | `4_Club Handler Class.ls` | 3 | 3 | `#info` |
| `hh_dynamic_downloader` | `4_Dynamic Downloader Handler Class.ls` | 2 | 2 | `#info` (room) |
| `hh_entry_init` | `8_Login Handler Class.ls` | 21 | 21 | `#info` |
| `hh_entry_init` | `13_Opening Hours Handler Class.ls` | 5 | 1 | `#info` |
| `hh_friend_list` | `5_Friend List Handler Class.ls` | 11 | 10 | `#info` |
| `hh_guide` | `5_Guide Handler Class.ls` | 5 | 5 | `#info` |
| `hh_human` | `11_Figure System Class.ls` | 0 | 1 | `#info` |
| `hh_ig` | `3_IG Handler Class.ls` | 28 | 23 | `#info` (room) |
| `hh_instant_messenger` | `5_Instant Messenger Handler Class.ls` | 4 | 2 | `#info` |
| `hh_kiosk_room` | `5_RoomKiosk Handler Class.ls` | 3 | 1 | `#info` |
| `hh_navigator` | `6_Navigator Handler Class.ls` | 18 | 18 | `#info` |
| `hh_photo` | `4_Photo Handler Class.ls` | 1, and 2 on `#mus` | 0 | `#info`, `#mus` |
| `hh_poll` | `5_Poll Handler Class.ls` | 3 | 3 | `#info` |
| `hh_recycler` | `5_Recycler Handler Class.ls` | 5 | 5 | `#info` (room) |
| `hh_room` | `5_Room Handler Class.ls` | 71 | 73 | `#info` (room) |
| `hh_room_utils` | `7_Dialog Handler Class.ls` | 3 | 2 | `#info` |
| `hh_room_utils` | `23_OneWayDoor Manager Class.ls` | 1 | 1 | `#info` |
| `hh_room_utils` | `25_Chat Manager.ls` | 3 | 3 | `#info` (room) |
| `hh_roomdimmer` | `6_Roomdimmer Handler Class.ls` | 1 | 3 | `#info` |
| `hh_shared` | `5_Hobba Handler Class.ls` | 4 | 6 | `#info` |
| `hh_shared` | `7_Server Date Class.ls` | 1 | 1 | `#info` |
| `hh_shared` | `57_Error Report Handler Class.ls` | 1 | 0 | `#info` |
| `hh_shared` | `63_Statistics Broker Class.ls` | 1 | 0 | `#info` |
| `hh_shared` | `64_Statistics Broker Javascript Class.ls` | 1 | 0 | `#info` |
| `hh_shared` | `71_OLD Figure System Class.ls` | 0 | 1 | `#info` |
| `hh_soundmachine` | `5_SoundMachine Handler Class.ls` | 17 | 19 | `#info` |
| `hh_tutorial` | `5_Tutorial Handler Class.ls` | 5 | 6 | `#info` |
| `hh_tutorial` | `15_NUH Handler Class.ls` | 7 | 4 | `#info` |

`fuse_client/12_Connection API.ls` and `33_Connection Manager Class.ls` define `registerListener` and
`registerCommands`; `-1` (`handleDisconnect` in the Login Handler) is the manager's own signal for a lost connection,
not a message on the wire.

Scripts in these casts send commands without registering any: `hh_furni_classes` (86 calls), `hh_room_ui` (19) and
`hh_pets_common` (1). Every command's senders are therefore searched across all casts.

# Wire format

From `fuse_client/51_Connection Instance Class.ls` (`send`, `sendNew`, `msghandler`, `GetIntFrom`, `GetStrFrom`,
`GetBoolFrom`, `GetByteFrom`). fuse_client (`packages/server/knowledge/r26/fuse_client.md`) writes it out in full.

- B64: each character is 64 plus 6 bits of the value, the most significant first.
- VL64 (`GetIntFrom`, `sendNew #integer`): the first character holds 64, the number of characters × 8, 4 when the
  value is negative, and the value's lowest 2 bits; each next character holds 64 plus the next 6 bits, the least
  significant first. Up to 6 characters.
- Client to server: 3 B64 characters of length, then 2 B64 characters of the command id, then the body. The length
  counts the id and the body. `send` appends a plain text body; `sendNew` builds it from typed values: `#string` as
  2 B64 characters of length and the bytes, `#short` as 2 B64 characters, `#integer` as VL64, `#boolean` as one
  character, 64 or 65.
- Server to client: 2 B64 characters of the message id, then the body, then `chr(1)`. In the body, an integer is VL64,
  a string ends with `chr(2)`, a boolean or a byte is one character whose low 6 bits are the value, and a handler may
  take the whole body as text.
- Text is UTF-8 only when the external variable `client.textdata.utf8` is true; otherwise each byte is one character
  of the client's locale (fuse_client (`packages/server/knowledge/r26/fuse_client.md#text`)). The server sets it and speaks UTF-8
  (0014 (`knowledge/decisions/server/0014-text-is-utf8.md`)).

# Handshake

As the old server did it, without encryption (0012 (`knowledge/decisions/server/0012-no-encryption.md`));
hh_entry_init (`packages/server/knowledge/r26/hh_entry_init.md#the-handshake`) confirms it step by step, with its bytes:

1. Server: `HELLO` (0), empty.
2. Client: `INIT_CRYPTO` (206).
3. Server: `CRYPTOPARAMETERS` (277) with the integer 0.
4. Client: `GENERATEKEY` (2002) with its public key as a string.
5. Server: `ENDOFCRYPTOPARAMS` (278).
6. Client: `startNewSession`, which goes on with the version check and the login.

# Protocol reference format

S1 wrote one document per cast, `packages/server/knowledge/r26/<cast>.md`, listed in
`packages/server/knowledge/r26/index.md`:

```markdown
---
type: Reference
title: R26 <cast>
description: One sentence on what the cast does.
timestamp: <ISO 8601>
generated: {by: <producer>/<version>, at: "<ISO 8601>"}
tags: [r26, protocol]
---

# Scripts

The cast's scripts that register, receive or send, by repository path.

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 316 | `handle_poll_offer` | `#info` | int poll id; string description | |

# Commands from the client

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 234 | `POLL_START` | `#info` | `<script>`: `<handler>` | int poll id (`sendNew`) | |

# Flows

What the client sends, and what it waits for in return, step by step.

# Notes

Dead code, quirks, and ids that other casts also register.
```

- Field types: `int` (VL64), `string`, `bool`, `byte`, `short` (2 B64 characters), `raw` (the rest of the body as
  text). A repeated group is written `int n, then n × (int id; string name)`.
- "Sent by" lists every script and handler that sends the command, found with `grep -rn '"<NAME>"'` over every cast,
  `hh_furni_classes` and `hh_room_ui` included, and says whether it uses `send` (plain text) or `sendNew` (typed).
