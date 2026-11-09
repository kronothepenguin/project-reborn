---
type: Reference
title: R26 hh_ig
description: How the R26 client's instant games list, create, join, observe and start games in the lobby, load and enter the arena, and end a game with its scores, from hh_ig's .ls scripts; the game itself runs in casts the client downloads, which the repository does not hold.
timestamp: 2026-11-09T19:35:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:35:41+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_ig/`, 79 scripts. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_IG Handler Class.ls` | Registers 28 messages and 23 commands, parses the messages, and holds a `send_` handler for each command |
| `4_IG Component Class.ls`, `5_IG Interface Class.ls` | The games' state, from the lobby to after a game, and their windows |
| `27_IG GameTypes Class.ls`, `28_IG Snowwar GameType Class.ls`, `29_IG BB GameType Class.ls` | The game types: 0 SnowWar, 1 BattleBall, 2 GemHunt, which has no class here |
| `31_IG GameList Class.ls`, `41_IG LevelList Class.ls` | The list of games, joining and observing them, and the levels to create one from |
| `18_IG RoomLoader Class.ls`, `19_IG GameAssetImport Class.ls` | The arena's room, and the casts a game type downloads |
| `55_IG BottomBarUI Class.ls`, `59_IG GameChat Class.ls` | The game's bottom bar and its chat |
| `114_IG InviteResp Class.ls`, `115_IG InviteSend Class.ls` | Invitations, which no script reaches ([Dead code](#dead-code)) |
| The other scripts | The lobby's windows: the game list, the joined game, the pre-game, the queue, the after-game |

Every message and command is on `#info`: the handler registers them on `connection.room.id`, and its `send_`
handlers and `GAME_CHAT` send on `getConnection(#Info)`.

The game itself runs in casts the client downloads for its type, `hh_ig_gamesys` and, for SnowWar,
`hh_ig_game_snowwar`, `hh_ig_game_snowwar_ui` and `hh_ig_game_snowwar_room`, or for BattleBall, `hh_ig_game_bb`,
`hh_ig_game_bb_ui` and `hh_ig_game_bb_room`. None of them is in the repository, so the messages of a running game,
the player's input and the rest of 403 are not described here ([In-game](#in-game)).

Other casts:

| Script | Why it is here |
| --- | --- |
| `hh_room/5_Room Handler Class.ls` | Registers `QUIT`, which 400 sends ([s1-06](/tasks/s1-06-room.md)) |
| `hh_room/4_Room Component Class.ls` | Builds the arena's room as a room of type `#game` ([s1-06](/tasks/s1-06-room.md)) |
| `hh_shared/64_Statistics Broker Javascript Class.ls` | Takes the tracking points `/game/started/…`, `/game/ended/…`, `/game/created`, `/game/joined/…`, which reach no server ([hh_shared](/reference/r26/hh_shared.md)) |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 387 | `handle_directory_status` | `#info` | int code: 0 available | The answer to `IG_CHECK_DIRECTORY_STATUS`: 0 starts the lobby; any other code is only logged |
| 388 | `handle_ENTER_ARENA_FAILED` | `#info` | int code | `ig_error_enter_arena_<code>` |
| 389 | `handle_GAME_REJOIN` | `#info` | int time left | The after-game window's time to the next game |
| 390 | `handle_player_exited_game_arena` | `#info` | int room index | A player left the arena |
| 391 | `handle_level_hall_of_fame` | `#info` | int level id; string level name; int count; per player: string name, int score; int count; per team: int score, int player count, per player a string name | The answer to `IG_GET_LEVEL_HALL_OF_FAME` |
| 392 | `handle_start_failed` | `#info` | int code | `ig_error_start_failed_<code>` |
| 393 | `handle_join_failed` | `#info` | int code | `ig_error_join_failed_<code>`; the user is in no game |
| 394 | `handle_in_arena_queue` | `#info` | int position | The user waits for an arena: the queue window |
| 395 | `handle_stage_still_loading` | `#info` | int progress; int count; per player: int id | The players who have loaded |
| 396 | `handle_game_not_found` | `#info` | int game id; int observing | The game is gone; unless observing, `ig_error_game_deleted` |
| 399 | `handle_game_chat` | `#info` | int player id; string text | A line of the game's chat |
| 400 | `handle_enter_arena` | `#info` | int game type; int level id; int team count; int player count; per player: int id, string name, string figure, string sex, int team id | The game starts: the client sends `QUIT` to leave its room ([Playing](#playing)) |
| 401 | `handle_arena_entered` | `#info` | a [player](#game-data); int team id | A player is in the arena |
| 402 | `handle_load_stage` | `#info` | int game type | The client downloads the game type's casts and reports with `IG_LOAD_STAGE_READY` |
| 403 | `handle_stage_starting` | `#info` | int game type; string room marker; int time to running; then the arena's data, read by the downloaded `hh_ig_gamesys` | The arena's room is built |
| 404 | `handle_stage_running` | `#info` | int time | The game runs, for that time |
| 405 | `handle_stage_ending` | `#info` | int time to the next state | |
| 406 | `handle_game_ending` | `#info` | int time to the next state; then [the scores](#the-scores) | The after-game window |
| 407 | `handle_game_created` | `#info` | [long game data](#game-data) | The user's own game: the client sends `IG_ROOM_GAME_STATUS` with it |
| 408 | `handle_game_long_data` | `#info` | long game data | A game in the list, in full |
| 409 | `handle_create_game_info` | `#info` | int count; per level: string level id, string level name, int game type, int field type, then the type's own ([Game data](#game-data)) | The answer to `IG_GET_CREATE_GAME_INFO`: the levels to create a game from |
| 410 | `handle_game_list` | `#info` | int count; per game: [short game data](#game-data) | The answer to `IG_GET_GAME_LIST` |
| 413 | `handle_user_joined_game` | `#info` | int game id; a player; int team id; [players still needed](#game-data) | When the player is the user, the client sends `IG_ROOM_GAME_STATUS` |
| 414 | `handle_user_left_game` | `#info` | int game id; int player id; int kicked; players still needed | |
| 415 | `handle_game_observation_started_short` | `#info` | short game data | A game the user observes |
| 416 | `handle_game_cancelled` | `#info` | int game id; int reason | |
| 417 | `handle_game_long_data` | `#info` | long game data | As 408 |
| 418 | `handle_game_started` | `#info` | int game id | The game leaves the list; for the user's game, the client waits for the arena |

## Game data

- A player: int id; string name; string figure; string sex.
- Players still needed: int count; per team: int team id, int players it still needs.
- Short game data: int game id; string level name; int game type; int field type; int team count; int player count;
  int most players; string owner's name. The level's name shown is the text `sw_fieldname_<field type>` or
  `bb_fieldname_<field type>`.
- Long game data: short game data; int level id; int team count; per team: int player count, per player a player;
  players still needed; then the type's own: SnowWar int duration; BattleBall int power-up count, per power-up an
  int.
- A level in 409 adds the type's own: BattleBall int power-ups allowed; SnowWar nothing.

## The scores

406 after its first int: int team count; per team: int team id, int score, int high score, int player count, per
player int room index, int score, int high score, int experience gained, int experience today, int experience this
month, int experience in all; then int count, per player of the level's top scores string name, int score, int room
index; then int count, per team of the level's top team scores int score, int id, int player count, per player a
string name.

# Commands from the client

Registered by `3_IG Handler Class.ls`. Every sender calls `send`: with no body it sends the id alone, and with a typed
list it goes through `sendNew` ([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 288 | `IG_CHECK_DIRECTORY_STATUS` | `#info` | `3_IG Handler Class.ls`: `send_CHECK_DIRECTORY_STATUS`, no body | none | When the games start, from `4_IG Component Class.ls`'s `Initialize`; answered by 387 |
| 289 | `IG_ROOM_GAME_STATUS` | `#info` | `3_IG Handler Class.ls`: `send_ROOM_GAME_STATUS`, typed | int in a game: 1, then int game id, int game type; or 0 alone | 1 on 407 and on 413 for the user; 0 when the lobby learns the user is in no game |
| 290 | `IG_PLAY_AGAIN` | `#info` | `3_IG Handler Class.ls`: `send_PLAY_AGAIN`, no body | none | The after-game window's play again; not while the hotel is closing |
| 291 | `IG_GET_LEVEL_HALL_OF_FAME` | `#info` | `3_IG Handler Class.ls`: `send_GET_LEVEL_HALL_OF_FAME`, typed | int level id | Answered by 391 |
| 292 | `IG_ACCEPT_INVITE_REQUEST` | `#info` | `3_IG Handler Class.ls`: `send_ACCEPT_INVITE_REQUEST`, typed | int game id | No script calls its sender ([Dead code](#dead-code)) |
| 293 | `IG_DECLINE_INVITE_REQUEST` | `#info` | `3_IG Handler Class.ls`: `send_DECLINE_INVITE_REQUEST`, typed | int game id | Called only by handlers no script reaches |
| 295 | `IG_LOAD_STAGE_READY` | `#info` | `3_IG Handler Class.ls`: `send_LOAD_STAGE_READY`, typed | int percent loaded, 0 to 100 | While the game's casts download, and 100 once done |
| 296 | `MSG_PLAYER_INPUT` | `#info` | no script | — | Registered here; its senders would be in the downloaded casts |
| 298 | `GAME_CHAT` | `#info` | `55_IG BottomBarUI Class.ls`: `eventProcRoomBar`, typed | string text | The bottom bar's chat field |
| 299 | `IG_EXIT_GAME` | `#info` | `3_IG Handler Class.ls`: `send_EXIT_GAME`, typed | int redirect: 1 by default | The arena's queue and the component send 0, the after-game window 1 |
| 300 | `IG_CREATE_GAME` | `#info` | `3_IG Handler Class.ls`: `send_CREATE_GAME`, typed | string level id; then the type's values ([Creating a game](#creating-a-game)) | Not while the hotel is closing |
| 301 | `IG_GET_GAME_LIST` | `#info` | `3_IG Handler Class.ls`: `send_GET_GAME_LIST`, typed | int observe the first game: 0 or 1; int most results | Answered by 410 |
| 302 | `IG_GET_CREATE_GAME_INFO` | `#info` | `3_IG Handler Class.ls`: `send_GET_CREATE_GAME_INFO`, no body | none | Answered by 409 |
| 303 | `IG_CHANGE_PARAMETERS` | `#info` | no script | — | Registered only |
| 304 | `IG_LIST_POSSIBLE_INVITEES` | `#info` | `3_IG Handler Class.ls`: `send_LIST_POSSIBLE_INVITEES`, typed | int filter less one; int 10 | No script reaches its callers |
| 305 | `IG_INVITE_USER` | `#info` | `3_IG Handler Class.ls`: `send_INVITE_USER`, typed | string user name; string message | No script reaches its callers |
| 306 | `IG_KICK_USER` | `#info` | `3_IG Handler Class.ls`: `send_KICK_USER`, typed | int player id | The joined game's window |
| 307 | `IG_START_GAME` | `#info` | `3_IG Handler Class.ls`: `send_START_GAME`, no body | none | Not while the hotel is closing; 392 tells a failure |
| 308 | `IG_CANCEL_GAME` | `#info` | no script | — | Registered only |
| 309 | `IG_JOIN_GAME` | `#info` | `3_IG Handler Class.ls`: `send_JOIN_GAME`, typed | int game id; int team id, -1 for any | Not while the hotel is closing; 413 tells each player who joins, and 393 a failure |
| 310 | `IG_LEAVE_GAME` | `#info` | `3_IG Handler Class.ls`: `send_LEAVE_GAME`, no body | none | |
| 311 | `IG_START_OBSERVING_GAME` | `#info` | `3_IG Handler Class.ls`: `send_START_OBSERVING_GAME`, typed | int game id; int long data: 1 | |
| 312 | `IG_STOP_OBSERVING_GAME` | `#info` | `3_IG Handler Class.ls`: `send_STOP_OBSERVING_GAME`, typed | int game id | Not sent for -1, no game |

The client holds back `IG_PLAY_AGAIN`, `IG_CREATE_GAME`, `IG_START_GAME` and `IG_JOIN_GAME` while
`#getHotelClosingStatus` says the hotel is closing ([hh_entry_init](/reference/r26/hh_entry_init.md)).

# Flows

## The lobby

1. When the games start, the client sends `IG_CHECK_DIRECTORY_STATUS`, and 387 with 0 opens the lobby.
2. `IG_GET_GAME_LIST` lists the games, answered by 410. Observing one sends `IG_START_OBSERVING_GAME`, and
   `IG_STOP_OBSERVING_GAME` ends it. 408, 415, 416, 417 and 418 keep the list up to date.
3. `IG_GET_LEVEL_HALL_OF_FAME` brings a level's best scores as 391.

## Creating a game

`IG_GET_CREATE_GAME_INFO` brings the levels as 409. Creating sends `IG_CREATE_GAME` with the level id, then the type's
values, each an int, in this order:

- SnowWar: private, 0 by default; team count, 1 to 4, 2 by default; duration, 120 by default.
- BattleBall: private; team count, 2 to 4; the count of power-ups, then each power-up, 1 to 8 by default.

407 brings the created game, and the client sends `IG_ROOM_GAME_STATUS` 1 with its id and type.

## Joining

`IG_JOIN_GAME` joins a team, or any team with -1. 413 tells each player who joins, and 414 who leaves or is kicked
(`IG_KICK_USER`); `IG_LEAVE_GAME` leaves. The game's owner sends `IG_START_GAME`.

## Playing

1. 400 takes the players to the arena: the client sends `QUIT` to leave its room, and 394 may put the user in the
   arena's queue.
2. 402 names the game type: the client downloads its casts and reports `IG_LOAD_STAGE_READY` as they come, up to
   100; 395 tells who has loaded.
3. 403 builds the arena's room, 404 runs the game, and 405 ends its stage. What happens between them belongs to the
   downloaded casts.
4. 406 brings the scores. `IG_PLAY_AGAIN` asks for another game, 389 tells the time to it, and `IG_EXIT_GAME` leaves.

## In-game

The game's own half is in the downloaded casts. The rest of 403 goes to `hh_ig_gamesys` as `#msgstruct_gamereset`,
`MSG_PLAYER_INPUT` is registered but sent by no script here, and any message a running game exchanges besides those
above is registered there.

# Notes

## Counts

`3_IG Handler Class.ls` registers 28 messages and 23 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says.

## Ids other casts register too

None: no other cast registers these messages or these commands.

## Dead code

- `IG_CHANGE_PARAMETERS` (303) and `IG_CANCEL_GAME` (308) are registered, and no script sends them.
- The invitations: no script calls `send_ACCEPT_INVITE_REQUEST`, and `IG_LIST_POSSIBLE_INVITEES`, `IG_INVITE_USER`
  and `IG_DECLINE_INVITE_REQUEST` are sent only from handlers of `114_IG InviteResp Class.ls` and
  `115_IG InviteSend Class.ls` that no script calls. No message brings an invitation. The downloaded casts are not in
  the repository, so they could still call them.

## Quirks

- `IG_LIST_POSSIBLE_INVITEES` sends its filter less one.
- `IG_LOAD_STAGE_READY` sends the share loaded times 100.
