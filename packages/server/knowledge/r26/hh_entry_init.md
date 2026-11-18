---
type: Reference
title: R26 hh_entry_init
description: How the R26 client logs in, from the handshake without encryption to the user object, and what it does with rights, badges, achievements, alerts, pings, latency tests, logouts and opening hours, from hh_entry_init's .ls scripts.
timestamp: 2026-11-09T21:38:46+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T23:28:02+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_entry_init/`. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `1_thread.index.txt` | Two threads, `login` and `openinghours`, each with an interface, a component and a handler class |
| `2_variable.index.txt` | `latencytest.interval` 20000, `latencytest.report.index` 15 and `latencytest.report.delta` 100; a cast's variables only fill those that are not set yet |
| `6_Login Interface Class.ls` | The login box (`login_b`), `tryLogin`, and the window shown when the connection drops |
| `7_Login Component Class.ls` | `initA` and `initB`, which choose SSO or the login box; `connect`; `sendLogin` (`SSO`, `TRY_LOGIN`); the latency test (`TEST_LATENCY`, `REPORT_LATENCY`); `sendGetBadges` (`GETSELECTEDBADGES`); the disconnect state |
| `8_Login Handler Class.ls` | Registers 21 messages, `-1` and 21 commands: the handshake, the session parameters, the user object, rights, badges, achievements, alerts, the ping and the logout |
| `9_Login Subscript.ls`, `10_Login Subscript 2.ls` | The Diffie–Hellman arithmetic behind `GENERATEKEY` (`doPowmodMathCs`, `str2bigInt`, `bigInt2str`, …). Their handlers did not decompile: each body is `-- unk26` |
| `11_Opening Hours Interface Class.ls` | The windows of a hotel that is closing, is closed, or refused a login |
| `12_Opening Hours Component Class.ls` | The closing state, which other casts ask for with `#getHotelClosingStatus`, and `GET_AVAILABILITY_TIME` |
| `13_Opening Hours Handler Class.ls` | Registers 5 messages and 1 command |

Other casts send four of these commands and listen to some of the same ids:

| Script | Why it is here |
| --- | --- |
| `hh_shared/10_CLangTest.ls` | Sends `LANGCHECK` |
| `hh_shared/20_Ticket Window Manager Class.ls`, `hh_shared/60_Game Oneclick Buy Window Manager Class.ls` | Send `BTCKS` |
| `hh_club/3_Club Component Class.ls` | Sends `GETAVAILABLEBADGES` |
| `hh_room_ui/3_Room Bar Class.ls` | Sends `SET_SOUND_SETTING` |
| `hh_club/4_Club Handler Class.ls`, `hh_friend_list/5_Friend List Handler Class.ls` | Also listen to 3 |
| `hh_navigator/6_Navigator Handler Class.ls`, `hh_kiosk_room/5_RoomKiosk Handler Class.ls`, `hh_room/5_Room Handler Class.ls` | Also listen to 33, and `hh_room` to `-1` |
| `hh_tutorial/5_Tutorial Handler Class.ls` | Also listens to 308, and registers 228 as `GET_ACCOUNT_PREFERENCES` |

# Messages from the server

The handlers are in `8_Login Handler Class.ls`, except those of 290 to 294, in `13_Opening Hours Handler Class.ls`.

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| -1 | `handleDisconnect` | `#info` | none | Not a message on the wire: `fuse_client` delivers it when `#info` drops ([A lost connection](#a-lost-connection)) |
| 0 | `handleHello` | `#info` | none | Sets the disconnect state to `init_crypto` and sends `INIT_CRYPTO` ([The handshake](#the-handshake)) |
| 1 | `handleServerSecretKey` | `#info` | raw: the server's public key in hexadecimal | Turns encryption on ([fuse_client](/r26/fuse_client.md#encryption)); the server never sends it (0012 (`knowledge/decisions/server/0012-no-encryption.md`)) |
| 2 | `handleRights` | `#info` | string right, repeated up to an empty string or the end of the body | Replaces the session's `user_rights` ([Rights](#rights)) |
| 3 | `handleLoginOK` | `#info` | none | Sends five commands and starts the latency test ([After the login](#after-the-login)) |
| 5 | `handleUserObj` | `#info` | string user id; string name; string figure; string sex; string custom data; int pool tickets; string pool figure; int photo film; int direct mail | [The user object](#the-user-object) |
| 33 | `handleErr` | `#info` | raw: the error text | [Error texts](#error-texts) |
| 35 | `handleUserBanned` | `#info` | raw: the ban text | A dialog with `Alert_YouAreBanned` and the text, then the client closes `#info` |
| 50 | `handlePing` | `#info` | none | Answers `PONG` ([Ping and latency](#ping-and-latency)) |
| 52 | `handleEPSnotify` | `#info` | raw: lines `t=<type>` and `p=<data>` | [Notifications](#notifications) |
| 139 | `handleSystemBroadcast` | `#info` | raw: the text | An alert; the two characters `\r` and the text `<br>` become line breaks |
| 141 | `handleCheckSum` | `#info` | raw: the checksum | Stored as `user_checksum`, which the club, the catalogue and the dialogs add as `&sum=` to the pages they open |
| 161 | `handleModAlert` | `#info` | string message; string URL | An alert titled `alert_warning`, with a link when the URL starts with `http://` or `https://` |
| 229 | `handleAvailableBadges` | `#info` | int n, then n × string badge; int m, then m × (int slot; string badge) | [Badges and achievements](#badges-and-achievements) |
| 257 | `handleSessionParameters` | `#info` | int n, then n × (int id; int or string value, by id) | Then sends the login ([Session parameters](#session-parameters)) |
| 277 | `handleCryptoParameters` | `#info` | int: not 0 asks for server-to-client encryption | Always answers `GENERATEKEY` ([The handshake](#the-handshake)) |
| 278 | `handleEndOfCryptoParams` | `#info` | none | Starts the session: `VERSIONCHECK`, `UNIQUEID`, `GET_SESSION_PARAMETERS` |
| 287 | `handleHotelLogout` | `#info` | int reason | [Logout reasons](#logout-reasons) |
| 290 | `handleAvailabilityStatus` | `#info` | int open; int shutting down | Sets the closing state ([Opening hours](#opening-hours)) |
| 291 | `handleInfoHotelClosing` | `#info` | int minutes until the hotel closes | An alert |
| 292 | `handleInfoHotelClosed` | `#info` | int opening hour; int opening minute; int disconnect | A notice, or the closed state when disconnect is not 0 |
| 293 | `handleAvailabilityTime` | `#info` | int open; int time until | Executes `#hotelAvailabilityTime`, which no script listens to |
| 294 | `handleLoginFailedHotelClosed` | `#info` | int opening hour; int opening minute | The closed state; by its name, the answer to a login while the hotel is closed |
| 308 | `handleSoundSetting` | `#info` | int sound state: 0 off, any other value on | `hh_tutorial` reads the same message otherwise ([Ids other casts register too](#ids-other-casts-register-too)) |
| 354 | `handleLatencyTest` | `#info` | int test id | [Ping and latency](#ping-and-latency) |
| 436 | `handlePossibleAchievements` | `#info` | int n, then n × (int type; int level; string badge) | [Badges and achievements](#badges-and-achievements) |
| 437 | `handleAchievementNotification` | `#info` | int type; int level; string badge; string removed badge | Then sends `GETSELECTEDBADGES` |

`-1` is not a message: `fuse_client` delivers it when `#info` drops without the client closing it
([A lost connection](#a-lost-connection)).

## The user object

`handleUserObj` stores each field in the session as `user_<field>`:

| Field | Session key | What the client does with it |
| --- | --- | --- |
| string user id | `user_user_id` | Kept as text; `fuse_client`'s Binary Manager logs in to `#mus` with it |
| string name | `user_name`, and `#userName` | |
| string figure | `user_figure_string` as sent, `user_figure` as `Figure_System` parses it | |
| string sex | `user_sex` | `F` when it contains `F` or `f`, otherwise `M` |
| string custom data | `user_customData` | Shown with the name in the entry bar (`hh_entry_base`) |
| int pool tickets | `user_ph_tickets` | Shown by the purse and the ticket window |
| string pool figure | `user_ph_figure` | |
| int photo film | `user_photo_film` | Shown by the purse; `hh_photo` changes it too |
| int direct mail | `user_directMail` | |

Every 5 updates the session and executes `#updateFigureData`. Only the first one also hides the login box and
executes `#userlogin` ([After the login](#after-the-login)).

`#updateFigureData` reaches `hh_entry_base`'s Entry Interface while the hotel view shows its entry bar: `updateEntryBar`
shows `user_customData` as the motto and draws the habbo's head from `user_figure` through `Figure_Preview`. It is the
one place outside a room that shows the habbo's own figure at once; `Figure_Preview` and `hh_ig`'s game list read
`user_figure` when they next draw. In a room the entry bar is hidden and the message changes nothing. So a 5 sent
again shows a new look and motto in the hotel view, and keeps them in the session for the next room.

## Rights

Each 2 replaces the session's `user_rights` with the strings it carries, up to the first empty one. No command asks
for it: the client takes it whenever it comes. The casts check these names: `fuse_alert`, `fuse_any_room_controller`,
`fuse_buy_credits`, `fuse_cancel_roomevent`, `fuse_catalog_editor`, `fuse_debug_window`, `fuse_furni_chooser`,
`fuse_habbo_chooser`, `fuse_kick`, `fuse_performance_panel`, `fuse_pick_up_any_furni`, `fuse_remove_photos`,
`fuse_remove_stickies`, `fuse_see_chat_log_link`, `fuse_see_flat_ids`, `fuse_trade`, `fuse_use_club_dance`,
`fuse_use_special_room_layouts` and `can_buy_credits`.

## Session parameters

`handleSessionParameters` reads n pairs, keeps each value, and then sends the login, whatever the pairs held.

| Id | Value | Session key | Read by |
| --- | --- | --- | --- |
| 0 | int | `conf_coppa`: above 0; `conf_strong_coppa_required`: above 1 | no script |
| 1 | int | `conf_voucher`: above 0 | no script |
| 2 | int | `conf_parent_email_request`: above 0 | no script |
| 3 | int | `conf_parent_email_request_reregistration`: above 0 | no script |
| 4 | int | `conf_allow_direct_mail`: above 0 | no script |
| 5 | string | none: the format `#dateFormatter` (`hh_shared/22_Date Class.ls`) writes dates in, with `dd`, `mm` and `yyyy`; `dd-mm-yyyy` until one comes | `hh_cat_code/11_Catalogue trophies Class.ls` |
| 6 | int | `conf_partner_integration`: above 0 | no script |
| 7 | int | `allow_profile_editing`: above 0 | `hh_entry_base/3_Entry Interface Class.ls`, `hh_room_ui/5_Room Object Displayer Class.ls` |
| 8 | string | `tracking_header` | `hh_shared/64_Statistics Broker Javascript Class.ls` |
| 9 | int | `tutorial_enabled`, as it is | `hh_tutorial/4_Tutorial Component Class.ls`, `hh_room_utils/6_Dialog Thread Class.ls` |

- An id outside 0 to 9 reads no value, so every pair after it is read from the wrong place.
- An id the server leaves out leaves its session key unset.

## Error texts

`handleErr` logs the text, then checks, in this order, whether it contains:

| Text | What the client does |
| --- | --- |
| `login incorrect` | Closes `#info` and stops logging in. The first time, it shows the login box and `Alert_WrongNameOrPassword`; after that, it opens `login_forgottenPassword_url` and shows the login box |
| `mod_warn` | An alert titled `alert_warning` with the text after the first `/` |
| `Version not correct` | The alert `alert_old_client` |
| `Duplicate session` | Closes `#info`, stops logging in, and shows the login box and `alert_duplicatesession` |

Any other text does nothing here. `hh_navigator`, `hh_kiosk_room` and `hh_room` also listen to 33
([Ids other casts register too](#ids-other-casts-register-too)).

## Logout reasons

| Reason | What the client does |
| --- | --- |
| −1 | Closes `#info` and shows the disconnect window |
| 1 | Opens `url_logged_out`, an external text, in the same browser window |
| 2 | Opens `url_logout_concurrent` |
| 3 | Opens `url_logout_timeout` |

Any other reason does nothing.

## Notifications

`handleEPSnotify` splits the body into lines, and each line at `=`: `t` gives the type, an integer, and `p` the data.

- Type 580 opens `hh_shared`'s language test (`CLangTest`), which shows the data as the word to type; the player's
  answer goes back as `LANGCHECK`.
- Any other type goes to `#notify`, with the type, the data and the connection's id. `hh_club/2_Club Interface Class.ls`
  shows an alert for 551 (`club_extend_failed`), 552 (`Alert_no_credits`) and 1001 (`epsnotify_1001`, after which it
  closes `#info`). `hh_room_ui/3_Room Bar Class.ls` registers `#notify` but has no `notify` handler.

# Commands from the client

All are registered by `8_Login Handler Class.ls`, except `GET_AVAILABILITY_TIME`, registered by
`13_Opening Hours Handler Class.ls`. Every sender calls `send`: with no body it sends the id alone, and with a typed
list it goes through `sendNew` ([fuse_client](/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 7 | `GET_INFO` | `#info` | `8_Login Handler Class.ls`: `handleLoginOK`, no body | none | [After the login](#after-the-login) |
| 8 | `GET_CREDITS` | `#info` | `8_Login Handler Class.ls`: `handleLoginOK`, no body | none | |
| 47 | `GET_PASSWORD` | `#info` | no script | — | Registered only |
| 58 | `LANGCHECK` | `#info` | `hh_shared/10_CLangTest.ls`: `testWord`, typed | string word | The word the player typed in the language test ([Notifications](#notifications)) |
| 105 | `BTCKS` | `#info` | `hh_shared/20_Ticket Window Manager Class.ls`: `buyGameTickets`, typed; `hh_shared/60_Game Oneclick Buy Window Manager Class.ls`: `sendBuyTwoCredits`, typed | int choice; string receiver | The ticket window sends 1 or 2, by its two boxes, and the player's own name or, with its gift box ticked, the name typed in it; the one-click window sends 1 and the player's own name. The scripts never open either window by themselves ([Dead code](#dead-code)) |
| 157 | `GETAVAILABLEBADGES` | `#info` | `8_Login Handler Class.ls`: `handleLoginOK`, no body; `hh_club/3_Club Component Class.ls`: `askforBadgeUpdate`, no body | none | No script calls `askforBadgeUpdate` |
| 159 | `GETSELECTEDBADGES` | `#info` | `7_Login Component Class.ls`: `sendGetBadges`, no body, from `handleAchievementNotification` | none | |
| 196 | `PONG` | `#info` | `8_Login Handler Class.ls`: `handlePing`, no body | none | |
| 204 | `SSO` | `#info` | `7_Login Component Class.ls`: `sendLogin`, typed | string ticket | The `sso.ticket` variable, when `use.sso.ticket` is on |
| 206 | `INIT_CRYPTO` | `#info` | `8_Login Handler Class.ls`: `handleHello`, no body | none | |
| 207 | `SECRETKEY` | `#info` | `8_Login Handler Class.ls`: `makeServerToClientKey`, typed | string key | Only after 1 with server-to-client encryption: never with this server |
| 212 | `GET_AVAILABILITY_TIME` | `#info` | `12_Opening Hours Component Class.ls`: `sendGetAvailabilityTime`, no body | none | On `#getAvailabilityTime`, which no script executes ([Dead code](#dead-code)) |
| 228 | `GET_SOUND_SETTING` | `#info` | `8_Login Handler Class.ls`: `handleLoginOK`, no body | none | `hh_tutorial` registers 228 as `GET_ACCOUNT_PREFERENCES` |
| 229 | `SET_SOUND_SETTING` | `#info`, as `connection.room.id` | `hh_room_ui/3_Room Bar Class.ls`: `eventProcRoomBar`, typed | int sound state: 1 on, 0 off | On a click on the room bar's sound icon, after the client turned its sound on or off |
| 315 | `TEST_LATENCY` | `#info` | `7_Login Component Class.ls`: `sendLatencyTest`, typed | int test id | [Ping and latency](#ping-and-latency) |
| 316 | `REPORT_LATENCY` | `#info` | `7_Login Component Class.ls`: `handleLatencyTest`, typed | int mean round trip in ms; int mean of the round trips below twice the mean; int number of answers | [Ping and latency](#ping-and-latency) |
| 370 | `GET_POSSIBLE_ACHIEVEMENTS` | `#info` | `8_Login Handler Class.ls`: `handleLoginOK`, no body | none | |
| 756 | `TRY_LOGIN` | `#info` | `7_Login Component Class.ls`: `sendLogin`, typed | string name; string password | From the login box |
| 813 | `UNIQUEID` | `#info` | `8_Login Handler Class.ls`: `startNewSession`, typed | string machine id | Up to 24 letters and digits, kept in the player's preferences under the name `6FEB4C10` (`pref.value.id`), and made the first time from the milliseconds, the time and the date |
| 1170 | `VERSIONCHECK` | `#info` | `8_Login Handler Class.ls`: `startNewSession`, typed | int version; string client URL; string external variables URL | [The handshake](#the-handshake) |
| 1817 | `GET_SESSION_PARAMETERS` | `#info` | `8_Login Handler Class.ls`: `startNewSession`, no body | none | |
| 2002 | `GENERATEKEY` | `#info` | `8_Login Handler Class.ls`: `responseWithPublicKey`, typed | string public key | [The handshake](#the-handshake) |

`VERSIONCHECK`'s fields:

- The version is the variable `client.version.id`, which no cast sets: it comes from the site's external variables.
- The client URL is the movie's path. It is empty when `connection.info.host` contains `localhost`, `127.0.0.`,
  `192.168.` or `10.0.0.`, four obfuscated strings in `startNewSession`. It is `3` in a browser plugin when
  `the moviePath` differs from the path the client saved the first time it asked for it.
- The external variables URL is the address the external variables came from.
- Outside a browser plugin, when `the runMode` does not contain `Plugin`, both URLs are empty.
- The server compares the version alone and reads the two URLs without checking them
  ([The handshake and the login](/handshake-and-login.md)).

# Flows

## Opening the connection

1. `fuse_client`'s core thread loads the entry casts, constructs every thread, so that `login` and `openinghours`
   register their ids, and executes `#Initialize`.
2. `initA` waits while `figurepartlist.loaded` is 0, checking every 250 ms, and calls `initB` 1000 ms later.
3. `initB`:
   - with `use.sso.ticket` on and an `sso.ticket` longer than 1 character, it keeps the ticket in the session and opens
     `#info`;
   - with `use.sso.ticket` off or missing, it shows the login box, whose OK button or Return key keeps the name and the
     password in the session and opens `#info`. When `xxx.username` and `xxx.password` are both set, the box logs in
     with them at once;
   - with `use.sso.ticket` on and no ticket, it shows `Alert_generic_login_error` and opens nothing.
4. `connect` opens `#info` on `connection.info.host` and `connection.info.port`
   ([fuse_client](/r26/fuse_client.md#connections)). It also creates `hh_shared`'s Server Date Class and
   Connection Problem Class and starts its `hobba` thread (s1-03). The Connection Problem
   Class shows a dialog after `failed.connection.delay` ms, 20,000 when unset, unless `sendLogin` removes it first.

The client sends nothing until the server's `HELLO`.

## The handshake

This confirms 0012 (`knowledge/decisions/server/0012-no-encryption.md`) step by step.

| Step | From | Message or command | What the client does, and what it waits for |
| --- | --- | --- | --- |
| 1 | server | `HELLO` (0), empty | `handleHello` sets the disconnect state to `init_crypto` and sends `INIT_CRYPTO` |
| 2 | client | `INIT_CRYPTO` (206), no body | Waits for 277 |
| 3 | server | `CRYPTOPARAMETERS` (277), int 0 | `handleCryptoParameters` takes client-to-server encryption as on, always, and server-to-client as off, for 0; `responseWithPublicKey` sends `GENERATEKEY` |
| 4 | client | `GENERATEKEY` (2002), string public key | Waits for 278, or for 1 |
| 5 | server | `ENDOFCRYPTOPARAMS` (278), empty | `handleEndOfCryptoParams` calls `startNewSession`, which sets the disconnect state to `start_session` and sends three commands at once |
| 6 | client | `VERSIONCHECK` (1170), `UNIQUEID` (813), `GET_SESSION_PARAMETERS` (1817) | Waits for 257 |
| 7 | server | `SESSION_PARAMETERS` (257) | `handleSessionParameters` stores them and calls `sendLogin`, which sets the disconnect state to `login` and removes the connection-problem dialog |
| 8 | client | `SSO` (204), string ticket, or `TRY_LOGIN` (756), string name; string password | Waits for 3 |
| 9 | server | `LOGIN_OK` (3), empty | [After the login](#after-the-login) |

- Nothing is enciphered, either way: on `#info`, only `handleServerSecretKey` (1) calls `setEncryption`, and the
  server never sends 1. The integer in 277 then changes nothing, since only `handleServerSecretKey` reads it.
- The key: the client draws a private number of 80 hexadecimal digits, computes its public key in hexadecimal, tries
  again while that key is shorter than 72 characters, 4 times at most, and sends what it has. The server reads it and
  ignores it.
- `responseWithPublicKey` returns without sending `GENERATEKEY` when `_player.traceScript` or `_movie.traceScript` is
  on, or when `Login Subscript 2` is not in the Login Handler's cast or is not that script. Where `the platform` does
  not contain `windows`, a key shorter than 2 characters opens `rosetta.warning.page.url` in place of `GENERATEKEY`.
  In these cases the handshake of 0012 stops at step 4.
- `handleEndOfCryptoParams` checks nothing: 278 starts the session whenever it arrives.
- `sendLogin` sends `SSO` when the session holds a ticket and `TRY_LOGIN` otherwise, both only while the component
  allows a login (`pOkToLogin`). With neither a ticket nor a name and a password, it closes `#info` instead.
- The client has handlers for four outcomes of a login: 3 when it succeeds, 33 with `login incorrect`, 35 for a ban,
  and 294 while the hotel is closed. For a habbo already online it has 33 with `Duplicate session` and 287 with
  reason 2, `url_logout_concurrent`; S2 asks what happens then.

## The handshake in bytes

Computed with literal ports of `send`, `sendNew`, `registerCommands`, `GetIntFrom` and `GetStrFrom`
([fuse_client](/r26/fuse_client.md#framing)). `␁` is `0x01` and `␂` is `0x02`.

| Step | Frame | Characters | Bytes |
| --- | --- | --- | --- |
| 1 | `HELLO` | `@@␁` | `40 40 01` |
| 2 | `INIT_CRYPTO` | `@@BCN` | `40 40 42 43 4E` |
| 3 | `CRYPTOPARAMETERS`, int 0 | `DUH␁` | `44 55 48 01` |
| 4 | `GENERATEKEY`, with the example key `ab` | `@@F_R@Bab` | `40 40 46 5F 52 40 42 61 62` |
| 5 | `ENDOFCRYPTOPARAMS` | `DV␁` | `44 56 01` |
| 6 | `VERSIONCHECK`, with the example version 1 and two empty strings | `@@GRRI@@@@` | `40 40 47 52 52 49 40 40 40 40` |
| 6 | `UNIQUEID`, with the example machine id `abc` | `@@GLm@Cabc` | `40 40 47 4C 6D 40 43 61 62 63` |
| 6 | `GET_SESSION_PARAMETERS` | `@@B\Y` | `40 40 42 5C 59` |
| 7 | `SESSION_PARAMETERS`, with the example pairs 5 `dd-mm-yyyy` and 9 0 | `DAJQAdd-mm-yyyy␂QBH␁` | `44 41 4A 51 41 64 64 2D 6D 6D 2D 79 79 79 79 02 51 42 48 01` |
| 8 | `SSO`, with the example ticket `abc` | `@@GCL@Cabc` | `40 40 47 43 4C 40 43 61 62 63` |
| 9 | `LOGIN_OK` | `@C␁` | `40 43 01` |

## After the login

On 3, three listeners run, in the order they registered:

- `handleLoginOK` sends, one after another and without waiting, `GET_INFO` (7), `GET_CREDITS` (8),
  `GETAVAILABLEBADGES` (157), `GET_POSSIBLE_ACHIEVEMENTS` (370) and `GET_SOUND_SETTING` (228). It then starts the
  latency test, sets the session's `userLoggedIn`, executes `#userloggedin`, on which `hh_ig` and `hh_recycler` start,
  and reports `/client/loggedin` to the statistics broker, outside `#info`.
- `hh_club`'s `handle_ok` sends `SCR_GET_USER_INFO` with `club_habbo` (s1-10).
- `hh_friend_list`'s `handleOk` sends `FRIENDLIST_INIT` (s1-11).

The scripts pair no command with its answer. These are the messages whose handlers store what each command asks for:

| Command | Message |
| --- | --- |
| `GET_INFO` | 5, `handleUserObj` |
| `GET_CREDITS` | 6, `hh_cat_code`'s `handle_purse`, which takes the credits from the first word of its body (s1-09) |
| `GETAVAILABLEBADGES` | 229, `handleAvailableBadges` |
| `GET_POSSIBLE_ACHIEVEMENTS` | 436, `handlePossibleAchievements` |
| `GET_SOUND_SETTING` | 308, `handleSoundSetting`, and `hh_tutorial`'s `handleAccountPreferences` |

The first 5 executes `#userlogin`, on which `hh_entry_base` shows the entry bar, and `hh_navigator`, `hh_guide`,
`hh_instant_messenger`, `hh_kiosk_room` and `hh_room_utils`'s ignore list act; their documents map what they send.

## Ping and latency

- `PING` (50) carries nothing, and the client answers `PONG` (196) at once: `@r␁` (`40 72 01`), then `@@BCD`
  (`40 40 42 43 44`). No script expects pings at any rate.
- The latency test starts with `LOGIN_OK` when `latencytest.interval` is above 0. Every 20,000 ms
  (`latencytest.interval`), the client sends `TEST_LATENCY` with the ids 1, 2, 3 and on, and notes the time. The
  server answers 354 with the same id: for id 1, `@@CD{I` (`40 40 43 44 7B 49`) and `EbI␁` (`45 62 49 01`). An id the
  client did not send is ignored.
- After every 15 answers (`latencytest.report.index`), the client computes two means over every answer so far: of all
  the round trips, in ms, and of those below twice the overall mean at the report that counted them. It sends both,
  with the number of answers, in `REPORT_LATENCY` the first time, and then whenever the overall mean has moved more
  than 100 ms (`latencytest.report.delta`) from the last one it sent.

## Badges and achievements

- 229 replaces `available_badges`, a list of badge ids, and `chosen_badges`, slot to badge id. No script reads
  `chosen_badges`.
- 436 replaces `possible_achievements`, keyed by badge id, each with its type and level.
- 437: the client removes from `possible_achievements` every achievement of that type up to that level
  (`#achievementsUpdated`), adds the badge to `available_badges` (`#badgeReceived`), removes the removed badge if it
  holds it (`#badgeRemoved`), and sends `GETSELECTEDBADGES`. It reads the lists that 229 and 436 stored, so it comes
  after them.

## Opening hours

`handleAvailabilityStatus` (290) sets the component's closing state:

| Open | Shutting down | State |
| --- | --- | --- |
| not 0 | any | 0, open |
| 0 | not 0 | 1, closing |
| 0 | 0 | 2, closed |

- While the state is 1, `#getHotelClosingStatus` answers 1: the catalogue, the club window, the ticket window, the
  trade button, safe trading, and the instant games' create, join, start and replay refuse, and show
  `opening_hours_text_disabled`.
- 291 shows `opening_hours_text_shutdown` with `%d%` as the minutes.
- 292 with disconnect 0 shows `opening_hours_text_closed` with `%h%` and `%m%` as the opening hour and minute, padded
  to 2 digits.
- 292 with disconnect not 0, and 294, set the state to 2 and show `opening_hours_text_opening_time` with the opening
  time. The client does not close `#info` itself, and when it drops, the disconnect window stays hidden
  ([A lost connection](#a-lost-connection)).
- The server sends 292 with the opening time 00:00 and disconnect 1 to every session when the game stops
  ([A connection](/connection.md#the-doors)). The client shows "Disconnected" and "The Hotel will open again at 00:00.
  We look forward to welcoming you back!" while the connection stays open. Once it drops, `handleDisconnect` calls
  `fatalError` all the same, and the player goes to the fatal error page: with the connection closed right after
  292, LibreShockwave draws no frame of the notice (checked in Chromium on 2026-11-18). Every text of 292 and 294
  holds a time.
- No command asks for 290, 291, 292 or 294. `GET_AVAILABILITY_TIME`, whose name matches 293's handler, is sent only
  on `#getAvailabilityTime`, which no script executes ([Dead code](#dead-code)).

## A lost connection

When `#info` drops without the client closing it, `fuse_client` delivers `-1`
([fuse_client](/r26/fuse_client.md#closing-and-the--1-message)), and `handleDisconnect`:

- before `LOGIN_OK`, calls `fatalError` with the disconnect state as its `error`, and the host and the port. The state
  tells the step the login reached: `socket_init` before `HELLO`, `init_crypto` after it, `start_session` after 278,
  and `login` after 257;
- after `LOGIN_OK`, shows the window `Alert_ConnectionFailure` with `Alert_ConnectionDisconnected`, unless the hotel
  closed with a disconnect, and calls `fatalError` with `disconnect`. The window's close button calls `resetClient()`.

`hh_room`'s `handle_disconnect` runs too (s1-06). The client closes `#info` itself, with no
`-1`, on `login incorrect`, `Duplicate session`, a ban, logout reason −1, `#notify` type 1001, and a login with no
ticket and no name or password.

# Notes

## Counts

`8_Login Handler Class.ls` registers 22 ids in `tMsgs`, 21 messages and `-1`, and 21 commands.
`13_Opening Hours Handler Class.ls` registers 5 messages and 1 command. Both match
Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`), which leaves `-1` out as well. No other cast
registers a command name of this cast.

## Ids other casts register too

- 3: `hh_club`'s `handle_ok` and `hh_friend_list`'s `handleOk` also run ([After the login](#after-the-login)).
- 33: `hh_navigator`, `hh_kiosk_room` and `hh_room` each compare the whole text with texts of their own, such as
  `Only 10 favorite rooms allowed!`, `Error creating a private room` and `Incorrect flat password`
  (s1-04, s1-05, s1-06).
- `-1`: `hh_room`'s `handle_disconnect`.
- 308: `hh_tutorial`'s `handleAccountPreferences` reads the same body from its start: a bool, which it ignores, then an
  int, the tutorial mode (s1-14). It asks for it with `GET_ACCOUNT_PREFERENCES`, which is
  228, the id of `GET_SOUND_SETTING`, and only when session parameter 9 is on. A bool, and a VL64 from −3 to 3, are
  one character each, so both handlers get their values from `int sound state; int tutorial mode`, and also from
  `bool sound state; int tutorial mode`, since `GetIntFrom` reads `@` or `A` as 0 or 1 and consumes nothing:
  `DtIH␁` and `DtAH␁` both read as sound 1 and tutorial 0. A sound state outside −3 to 3 would shift the tutorial
  mode, and a body with the sound state alone reads as tutorial 0.
- Command 228: the server cannot tell `GET_SOUND_SETTING` from `GET_ACCOUNT_PREFERENCES`, and both handlers run on
  every 308.

## Dead code

- `GET_PASSWORD` (47) is registered, and no script sends it.
- `GET_AVAILABILITY_TIME` (212) is sent only on `#getAvailabilityTime`, which no script executes, and the
  `#hotelAvailabilityTime` that 293 executes has no listener. `hh_tutorial` executes messages named by the server's
  tutorial data and by the variables `NUH.invitation.option.<n>`, so only those could reach it.
- `BTCKS`: the one-click window opens on `#openOneClickGameBuyWindow`, which no script executes, and the ticket window
  on `#show_ticketWindow`, which only the one-click window executes. As with `#getAvailabilityTime`, only the server's
  tutorial data or those variables could open them.
- `hh_club`'s `askforBadgeUpdate`, which sends `GETAVAILABLEBADGES`, is called by no script.
- Server-to-client encryption: `makeServerToClientKey` creates `x3hSfgRdzsh7CfHKUPwqjndo3bOVnl`, which is in no
  cast's `Members.csv`, and after `SECRETKEY` only a later 278 would start the session.
- `handleCryptoParameters` takes client-to-server encryption as always on, so its other branch, with the error
  "Server to client encryption only is not supported.", never runs.
- The Login Component registers `#loginIsOk` to `setLoginOk`, which it does not have, its handler being
  `setAllowLogin`. No script executes `#loginIsOk`, `#openConnection`, `#closeConnection` or `#performLogin`.
- The Opening Hours Component's `getHotelAvailabilityStatus` is called by no script, and its `deconstruct` unregisters
  `#getOpeningHours`, which it never registered. The interface's `showHotelClosingAlert` calls
  `hideHotelClosingStatusAlert`, which does not exist, when its window cannot merge.
- `responseWithPublicKey` and `handleServerSecretKey` set `tFakeBigJob`, `tFakeServerPublic`, `_ob38729_p` and
  `_ob38729_g` and never use them: the arithmetic is in the subscripts.

## Quirks

- `handleRights` stops at the first empty string, so an empty right hides every right after it.
- `handleEPSnotify` keeps only the text between the first and the second `=` of a line.
- `handleErr` matches texts it contains, the first match winning; the other casts compare whole texts.
- `handleSystemBroadcast` turns the two characters `\r` into a line break, not the byte `0x0D`.
- `responseWithPublicKey` draws its hexadecimal digits from `012345679abcdef`, which lacks `8`.
- `handleModAlert` reads the body into `tTest` and never uses it.
- The latency means are kept over every answer since the client started, not since the last report.

## The Holograph Emulator

Read for the question 308 leaves open (0016 (`knowledge/decisions/server/0016-holoemu-is-a-reference.md`)), it never sends 308, nor
278. It answers `GENERATEKEY` with a 257 of its own, so the client sends `SSO` without `VERSIONCHECK`, `UNIQUEID` or
`GET_SESSION_PARAMETERS`, and its 229 and 436 have other layouts than these handlers read. Its login does not show
what these scripts expect.
