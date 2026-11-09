---
type: Reference
title: R26 hh_soundmachine
description: How the R26 client plays a sound machine's or jukebox's play list, edits, saves, deletes and burns songs with the sound sets in the machine, keeps the play list, and loads disks into a jukebox, from hh_soundmachine's .ls scripts.
timestamp: 2026-11-09T19:08:04+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:08:04+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_soundmachine/`. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_SoundMachine Interface Class.ls` | The play list editor, the song editor and the jukebox window |
| `4_SoundMachine Component Class.ls` | The song editor's state, the sound sets, saving songs, the user's disks; sends 8 of the commands |
| `5_SoundMachine Handler Class.ls` | Registers 17 messages and 19 commands |
| `7_Sound Machine Instance.ls`, `11_Song Controller Class.ls`, `12_Song Player Class.ls` | Play the play list from its play time on |
| `8_Song TimeLine Class.ls` | A song's channels and slots, and its text form |
| `9_SongList Manager Class.ls` | The user's songs and the play list; sends 8 of the commands |
| `10_Jukebox Manager Class.ls` | The jukebox's disks; sends 4 of the commands |
| `15_Furniture Sound Machine Class.ls`, `16_Furniture Song Disk Class.ls`, `17_Furniture Jukebox Class.ls` | The sound machine, the song disk and the jukebox as furniture; they start the flows below |

Other casts:

| Script | Why it is here |
| --- | --- |
| `hh_room_utils/3_Safe Trader Class.ls` | Executes `#listen_song` with a disk's song id during a trade, which sends `GET_SONG_INFO` ([s1-07](/tasks/s1-07-room-utils.md)) |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 300 | `handle_song_info` | `#info` | int song id; string name; string song | The answer to `GET_SONG_INFO`, and the song that `EDIT_SONG` opens ([A song](#a-song)) |
| 301 | `handle_machine_sound_packages` | `#info` | int slot count, unused; int filled count; per filled slot: int slot, int set id, int sample count, per sample an int sample id | The sound sets in the machine. Ends the wait that `INSERT_SOUND_PACKAGE` starts |
| 302 | `handle_user_sound_packages` | `#info` | int count; per set: int set id | The user's sound sets, to insert. Once 301 and 302 have both come to the song editor, their counts are added, and 0 shows `no_sound_sets` |
| 322 | `handle_song_list` | `#info` | int count; per song: int song id, int length, string name, int locked | The answer to `GET_SONG_LIST`: the user's songs. Parsed by `9_SongList Manager Class.ls` |
| 323 | `handle_play_list` | `#info` | int play time; int count; per song: int song id, int length, string name, string author | The answer to `GET_PLAY_LIST`: the machine's play list, played from the play time on. Parsed by `9_SongList Manager Class.ls` |
| 324 | `handle_song_missing_packages` | `#info` | int count; per set: int set id | The song needs sound sets that are not in the machine: the editor closes, and `missing_packages` names them |
| 325 | `handle_play_list_invalid` | `#info` | int count | `playlist_full`, with the count |
| 326 | `handle_song_list_full` | `#info` | int count | `no_more_songs`, with the count; the editor of a new song closes |
| 331 | `handle_new_song` | `#info` | int song id; string name | A new song saved: the editor takes its id and name, and shows it saved |
| 332 | `handle_invalid_song_name` | `#info` | none | `invalid_song_name` |
| 333 | `handle_user_song_disks` | `#info` | int count; per disk: int disk id, string name | The answer to `GET_USER_SONG_DISCS`. Parsed by `4_SoundMachine Component Class.ls` |
| 334 | `handle_jukebox_disks` | `#info` | int slot count; int disk count; per disk: int slot, int id, int length, string name, string author | The answer to `GET_JUKEBOX_DISCS`; a disk outside the slots is dropped. Parsed by `10_Jukebox Manager Class.ls` |
| 335 | `handle_jukebox_song_added` | `#info` | int song id; int length; string name; string author | A song added to the jukebox's play list; the client asks for it with `GET_SONG_INFO` |
| 336 | `handle_song_locked` | `#info` | none | `song_locked` |
| 337 | `handle_jukebox_playlist_full` | `#info` | none | `jukebox_list_full` |
| 338 | `handle_invalid_song_length` | `#info` | none | `invalid_song_length` |
| 339 | `handle_song_saved` | `#info` | none | An edited song saved: the editor shows it saved |

Names and authors go through `convertSpecialChars` as they are read. Alerts are text keys.

## A song

300's song, and the song that `SAVE_SONG_NEW` and `SAVE_SONG_EDIT` send, are text: each channel's number, `:`, its
samples, `:`, channel after channel. A channel's samples are `<sample id>,<length>`, joined by `;`. Sample 0 is
silence. `1:12,4;0,2;13,4:2:0,10:3:0,10:4:0,10:` is a song of four channels and 10 slots.

- The client writes 4 channels of up to 150 slots, every slot of the song's length covered, silence included, and
  joins a sample to the next when both are the same.
- When reading, the channels must come numbered 1, 2, 3 in order: a channel whose number is not the next one is
  skipped, and a sample with fewer than two values is skipped.

## Time

- A length, of a song or a sample, counts slots, and a slot lasts 2,000 ms.
- 323's play time counts tenths of a second since the play list started; the client starts from the song playing at
  that time.

# Commands from the client

Registered by `5_SoundMachine Handler Class.ls`. Every sender calls `send`: with no body it sends the id alone, and
with a typed list it goes through `sendNew` ([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 219 | `INSERT_SOUND_PACKAGE` | `#info` | `4_SoundMachine Component Class.ls`: `loadSoundSet`, typed | int set id; int slot, the first free one | One at a time: the next waits for 301 |
| 220 | `EJECT_SOUND_PACKAGE` | `#info` | `4_SoundMachine Component Class.ls`: `removeSoundSet`, typed | int slot | Asks first when the song uses the set |
| 221 | `GET_SONG_INFO` | `#info` | `9_SongList Manager Class.ls`: `downloadSong`, typed; `4_SoundMachine Component Class.ls`: `listenSong`, typed | int song id | Each song of a play list from 323 or 335, and a disk listened to in a trade; answered by 300 |
| 239 | `NEW_SONG` | `#info` | `9_SongList Manager Class.ls`: `newSong`, no body | none | New, in the play list editor: the song editor opens empty |
| 240 | `SAVE_SONG_NEW` | `#info` | `4_SoundMachine Component Class.ls`: `saveEditorSong`, typed | string name, through `convertSpecialChars`; string song | Saving a song with no id yet; 331 gives its id |
| 241 | `EDIT_SONG` | `#info` | `9_SongList Manager Class.ls`: `editSong`, typed | int song id | Edit, in the play list editor: the song editor opens and takes the song from the 300 with that id |
| 242 | `SAVE_SONG_EDIT` | `#info` | `4_SoundMachine Component Class.ls`: `saveEditorSong`, typed | int song id; string name, through `convertSpecialChars`; string song | Saving a song with an id |
| 243 | `UPDATE_PLAY_LIST` | `#info` | `9_SongList Manager Class.ls`: `savePlaylist`, typed | int count; per song: int song id | Saving the play list, after a confirmation |
| 244 | `GET_SONG_LIST` | `#info` | `9_SongList Manager Class.ls`: `getSongListData`, no body | none | Opening the play list editor; answered by 322 |
| 245 | `GET_PLAY_LIST` | `#info` | `9_SongList Manager Class.ls`: `getPlaylistData`, no body | none | A sound machine or a jukebox coming into the room, and a jukebox switched on; answered by 323 |
| 246 | `SONG_EDIT_CLOSE` | `#info` | `4_SoundMachine Component Class.ls`: `closeEdit`, no body | none | The song editor closing, unless 324 or 326 closed it |
| 248 | `DELETE_SONG` | `#info` | `9_SongList Manager Class.ls`: `deleteSong`, typed | int song id | After a confirmation |
| 254 | `BURN_SONG` | `#info` | `9_SongList Manager Class.ls`: `burnSong`, typed | int song id | After a confirmation |
| 255 | `ADD_JUKEBOX_DISC` | `#info` | `10_Jukebox Manager Class.ls`: `insertDisk`, typed | int disk id, from 333; int slot | An empty slot chosen, then a disk |
| 256 | `REMOVE_JUKEBOX_DISC` | `#info` | `10_Jukebox Manager Class.ls`: `removeDisk`, typed | int slot | Eject on a slot with a disk |
| 257 | `JUKEBOX_PLAYLIST_ADD` | `#info` | `10_Jukebox Manager Class.ls`: `addPlaylistDisk`, typed | int id, the one 334 gave the disk | A slot with a disk chosen |
| 258 | `GET_JUKEBOX_DISCS` | `#info` | `10_Jukebox Manager Class.ls`: `getJukeboxDisks`, no body | none | A jukebox coming into the room; answered by 334 |
| 259 | `GET_USER_SONG_DISCS` | `#info` | `4_SoundMachine Component Class.ls`: `getUserDisks`, no body | none | Opening the jukebox window; answered by 333 |
| 260 | `RESET_JUKEBOX` | `#info` | `4_SoundMachine Component Class.ls`: `resetJukebox`, no body | none | The jukebox window's reset button |

# Flows

## Playing

1. A sound machine coming into the room sends `GET_PLAY_LIST`, and a jukebox `GET_PLAY_LIST` and
   `GET_JUKEBOX_DISCS`.
2. 323 brings the play list and its play time. The client sends `GET_SONG_INFO` for each song, from the one playing at
   that time on, and plays them as 300 brings them. A sound machine's play list loops; a jukebox's does not.
3. Switched on, a sound machine plays its play list again from the start, and a jukebox sends `GET_PLAY_LIST` again.

## The play list editor and the song editor

1. Opening a sound machine's play list editor sends `GET_SONG_LIST`, answered by 322.
2. New sends `NEW_SONG`, and Edit `EDIT_SONG` with the chosen song; the song editor opens at once, and fills from 300
   when editing. The sound sets in the machine come as 301, and the user's own sets as 302.
3. Inserting a set sends `INSERT_SOUND_PACKAGE` into the first free slot, and ejecting one `EJECT_SOUND_PACKAGE`.
4. Save sends `SAVE_SONG_NEW` or `SAVE_SONG_EDIT`, asking first when the name is the song's current one. 331 gives a
   new song its id and 339 confirms an edited one, and both show the song saved. Closing the editor sends
   `SONG_EDIT_CLOSE`.
5. Delete and Burn send `DELETE_SONG` and `BURN_SONG` with the chosen song, and saving the play list
   `UPDATE_PLAY_LIST`.

## The jukebox

1. Opening the jukebox window sends `GET_USER_SONG_DISCS`, answered by 333 with the user's disks.
2. Choosing an empty slot, then a disk, sends `ADD_JUKEBOX_DISC`; Eject on a slot sends `REMOVE_JUKEBOX_DISC`; and
   choosing a slot with a disk sends `JUKEBOX_PLAYLIST_ADD`. 335 adds a song to the play list, and 337 shows
   `jukebox_list_full`.
3. The reset button sends `RESET_JUKEBOX`.

# Notes

## Counts

`5_SoundMachine Handler Class.ls` registers 17 messages and 19 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says.

## Ids other casts register too

None: no other cast registers these messages or these commands.

## Quirks

- 301's slot count is read and never used.
- 333's and 334's ids are both a disk's `#id` in the client: `ADD_JUKEBOX_DISC` sends one of 333's, and
  `JUKEBOX_PLAYLIST_ADD` one of 334's. Nothing in the client says whether the two are the same kind of id.
