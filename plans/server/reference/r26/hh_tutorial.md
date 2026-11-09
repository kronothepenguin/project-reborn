---
type: Reference
title: R26 hh_tutorial
description: How the R26 client's tutorial asks for its preferences, configuration, topics and status and reports a finished topic, and how the new-user help shows its help items and invites guides to a new user's room, from hh_tutorial's .ls scripts.
timestamp: 2026-11-09T18:53:14+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:53:14+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_tutorial/`. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`. NUH is the new-user help.

| Script | What it holds |
| --- | --- |
| `3_Tutorial Interface Class.ls` | The tutor, its bubbles, the topic menu and the exit menu |
| `4_Tutorial Component Class.ls` | Starts the tutorial, asks for its preferences, configuration and topics, runs a topic's steps and reports a finished topic; sends the six tutorial commands |
| `5_Tutorial Handler Class.ls` | Registers 5 messages and 6 commands: the tutorial |
| `7_Tutor Character Class.ls`, `8_Bubble Class.ls`, `9_Link Bubble Class.ls`, `10_Static Bubble Class.ls`, `11_Update Bubble Class.ls` | Draw the tutor and the bubbles |
| `13_NUH Interface Class.ls` | The help items' bubbles, the window that offers guides, and the window that follows the invitation |
| `14_NUH Component Class.ls` | Which help items show and when, closing them, and inviting guides; sends the four NUH commands |
| `15_NUH Handler Class.ls` | Registers 7 messages and 4 commands: the new-user help |

Other casts:

| Script | Why it is here |
| --- | --- |
| `hh_entry_init/8_Login Handler Class.ls` | Keeps session parameter 9 as `tutorial_enabled`, and registers 308 and 228 too ([hh_entry_init](/reference/r26/hh_entry_init.md#ids-other-casts-register-too)) |
| `hh_navigator/5_Navigator Component Class.ls` | Executes `#updateAvailableFlatCategories`, which starts the tutorial, when the navigator opens before its categories have come ([hh_navigator](/reference/r26/hh_navigator.md)) |
| `hh_room_utils/6_Dialog Thread Class.ls` | The help window's restart button, hidden while `tutorial_enabled` is 0, executes `#restart_tutorial` ([s1-07](/tasks/s1-07-room-utils.md)) |
| `hh_room_ui/3_Room Bar Class.ls` | Executes `#NUH_close` for the help items `chat`, `hand`, `games`, `events` and `friends` ([s1-06](/tasks/s1-06-room.md)) |
| `hh_shared/64_Statistics Broker Javascript Class.ls` | Takes the tutorial's tracking points, `/client/tutorial/…`, to a JavaScript function, behind the session's `tracking_header`; none reaches the server ([hh_shared](/reference/r26/hh_shared.md)) |

The guides' side of an invitation is `hh_guide`'s ([s1-13](/tasks/s1-13-guide.md)).

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 308 | `handleAccountPreferences` (`5_Tutorial Handler Class.ls`) | `#info` | bool sound state, ignored; int tutorial mode | The answer to `GET_ACCOUNT_PREFERENCES`: a mode other than 0 lets the tutorial run. `hh_entry_init`'s `handleSoundSetting` reads the same message |
| 327 | `handleTutorialConfig` (`5_Tutorial Handler Class.ls`) | `#info` | int tutorial id; string tutorial name; int topic count; per topic: int topic id, string topic name, int status | The answer to `GET_TUTORIAL_CONFIGURATION`: shows the tutor and the topic menu. A status other than 0 checks the topic as done |
| 328 | `handleTopicConfig` (`5_Tutorial Handler Class.ls`) | `#info` | int topic id; int step count; per step: int step id, string step name, int prerequisite count, per prerequisite a string message and a string parameter, int trigger count, per trigger a string message, int restriction count, per restriction a string message, int content count, per content six strings: text key, target id, direction, offset x, offset y, special | The answer to `GET_TUTORIAL_TOPIC_CONFIGURATION`: starts the topic's first step ([A topic](#a-topic)) |
| 329 | `handleTutorialStatus` (`5_Tutorial Handler Class.ls`) | `#info` | int tutorial id, unused; int count; per topic: int topic id, int status | The answer to `GET_TUTORIAL_STATUS`: the topics' statuses, as in 327 |
| 330 | `handleTopicResult` (`5_Tutorial Handler Class.ls`) | `#info` | int user rewarded, unused | Sends `GET_TUTORIAL_STATUS` |
| 352 | `handleHelpItems` (`15_NUH Handler Class.ls`) | `#info` | int count; per item: int item id | The help items to show, by their ids in the variable `NUH.ids`; an id it does not hold is skipped. No command is tied to it |
| 356 | `handleTutorsAvailable` (`15_NUH Handler Class.ls`) | `#info` | int available: 0 none | The answer to `MSG_GET_TUTORS_AVAILABLE`: any other value opens the window that offers guides |
| 357 | `handleInvitingCompleted` (`15_NUH Handler Class.ls`) | `#info` | int count of guides who accepted | Ends the invitation: 0 shows `nuh_invitation_failure`, any other count `nuh_invitation_success`, which closes after 3 s |
| 358 | `handleInvitationExists` (`15_NUH Handler Class.ls`) | `#info` | none | An alert, `invitation_exists` |
| 421 | `handleInvitationSent` (`15_NUH Handler Class.ls`) | `#info` | none | Opens the window that follows the invitation, its count of guides at 0 |
| 423 | `handleGuideFound` (`15_NUH Handler Class.ls`) | `#info` | none | Adds one guide to that window's count |
| 424 | `handleInviterLeftRoom` (`15_NUH Handler Class.ls`) | `#info` | int room id | Ends the invitation and opens `nuh_room_left`, whose back button enters that room as a private room |

# Commands from the client

Registered by `5_Tutorial Handler Class.ls` (228 to 253) and `15_NUH Handler Class.ls` (313 to 359). Every sender
calls `send`: with no body it sends the id alone, and with a typed list it goes through `sendNew`
([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 228 | `GET_ACCOUNT_PREFERENCES` | `#info` | `4_Tutorial Component Class.ls`: `startTutorial`, no body | none | Answered by 308. The same id as `hh_entry_init`'s `GET_SOUND_SETTING` |
| 249 | `SET_TUTORIAL_MODE` | `#info` | `4_Tutorial Component Class.ls`: `restartTutorial`, typed; `4_Tutorial Component Class.ls`: `exitTutorial`, typed | int mode: 1 on a restart, 0 on quitting | [Quitting and restarting](#quitting-and-restarting) |
| 250 | `GET_TUTORIAL_CONFIGURATION` | `#info` | `4_Tutorial Component Class.ls`: `startTutorial`, typed | string tutorial name | Answered by 327 |
| 251 | `GET_TUTORIAL_TOPIC_CONFIGURATION` | `#info` | `4_Tutorial Component Class.ls`: `selectTopic`, typed | int topic id | A topic chosen in the menu, or a link to the next topic; answered by 328 |
| 252 | `GET_TUTORIAL_STATUS` | `#info` | `4_Tutorial Component Class.ls`: `completeTopic`, typed; `4_Tutorial Component Class.ls`: `setTopicResult`, typed | int tutorial id | Answered by 329 |
| 253 | `COMPLETE_TUTORIAL_TOPIC` | `#info` | `4_Tutorial Component Class.ls`: `completeTopic`, typed | int topic id | On a topic's last step, just before `GET_TUTORIAL_STATUS` |
| 313 | `MSG_REMOVE_ACCOUNT_HELP_TEXT` | `#info` | `14_NUH Component Class.ls`: `setHelpItemClosed`, typed | int item id, from `NUH.ids` | A help item closed ([The new-user help](#the-new-user-help)) |
| 355 | `MSG_GET_TUTORS_AVAILABLE` | `#info` | `14_NUH Component Class.ls`: `checkHelpers`, no body | none | The `invite` help item, in the user's own room; answered by 356 |
| 356 | `MSG_INVITE_TUTORS` | `#info` | `14_NUH Component Class.ls`: `sendInvitations`, no body | none | Yes in the window that offers guides, sent only while the user owns the room |
| 359 | `MSG_CANCEL_TUTOR_INVITATIONS` | `#info` | `14_NUH Component Class.ls`: `cancelInvitations`, no body | none | Cancel or close in the window that follows the invitation |

# Flows

## Starting the tutorial

1. At the login, `hh_entry_init` keeps session parameter 9 as `tutorial_enabled`. While it is 0 the tutorial never
   starts, and the help window hides its restart button.
2. The tutorial starts on `#updateAvailableFlatCategories`, which the navigator executes when it opens before its
   categories have come. It runs the tutorial named by the variable `tutorial.name.new_user_flow`.
3. The first start sends `GET_ACCOUNT_PREFERENCES` and waits. A 308 with a tutorial mode other than 0 starts it
   again, and it sends `GET_TUTORIAL_CONFIGURATION` with the tutorial's name; with 0 it stays stopped. Every 308 sets
   the mode, the answer to the login's `GET_SOUND_SETTING` too, and starts the tutorial only while a start waits for
   it.
4. 327 shows the tutor and the menu of topics, each checked when its status is not 0.

## A topic

1. Choosing a topic opens the page of the text `<topic key>_url`, when the client's texts hold one, and sends
   `GET_TUTORIAL_TOPIC_CONFIGURATION` with the topic's id.
2. 328 brings the topic's steps, shown one at a time. In each step:
   - each prerequisite is a client message, executed with its parameter;
   - each trigger is a client message that moves to the next step, and each restriction one that brings the
     off-topic menu;
   - the contents are the bubbles, placed on the element named by the target id; the content whose target id is
     `tutor` is what the tutor says.
3. The server sends names, and the client builds the text keys: `<tutorial name>_<topic name>` for the topic,
   `<topic key>_<step name>_<content's text key>` for a bubble, and `<topic key>_<step name>_tutor` for the tutor.
4. The last step links to the next topic and to the menu, and sends `COMPLETE_TUTORIAL_TOPIC` with the topic's id and
   then `GET_TUTORIAL_STATUS` with the tutorial's id; 329 brings the statuses back. 330 also makes the client send
   `GET_TUTORIAL_STATUS`.

## Quitting and restarting

- Quit, confirmed in the exit menu, sends `SET_TUTORIAL_MODE` 0 and shows the navigator.
- The help window's restart button sends `SET_TUTORIAL_MODE` 1 and starts the tutorial again. If no 308 has started
  it yet, the client sends `GET_ACCOUNT_PREFERENCES` first and goes on only when that 308's mode is not 0; otherwise it
  sends `GET_TUTORIAL_CONFIGURATION` at once.

## The new-user help

1. 352 says which help items to show; the client keeps the last list it got.
2. On entering a room whose owner has the user's name, each listed item shows after the time of the variable
   `NUH.<item>.timeout`, or of `NUH.<item>.default.timeout`. `friends` shows only while friend requests are waiting, and
   `hand` and `invite` only for the room's owner, as the session holds it.
3. Closing an item that was showing, from its bubble or from the room bar (`#NUH_close`), sends
   `MSG_REMOVE_ACCOUNT_HELP_TEXT` with the item's id from `NUH.ids`, and marks it off in the list.

## Inviting guides

1. The `invite` item sends `MSG_GET_TUTORS_AVAILABLE`; a 356 other than 0 opens the window that offers guides.
2. Yes sends `MSG_INVITE_TUTORS`. No closes the window. Never closes the `invite` item with
   `MSG_REMOVE_ACCOUNT_HELP_TEXT`.
3. 421 opens the window that follows the invitation, 423 adds each guide found to its count, and 357 ends it with the
   count of guides who accepted. Cancel or close in that window sends `MSG_CANCEL_TUTOR_INVITATIONS`.
4. 358 shows the alert `invitation_exists`. 424 ends the invitation and offers to go back to the room it names.

# Notes

## Counts

`5_Tutorial Handler Class.ls` registers 5 messages and 6 commands, and `15_NUH Handler Class.ls` 7 and 4, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says.

## Ids other casts register too

- 308 and 228: `hh_entry_init`'s Login Handler registers 308 as `handleSoundSetting` and 228 as `GET_SOUND_SETTING`.
  [hh_entry_init](/reference/r26/hh_entry_init.md#ids-other-casts-register-too) shows how one body serves both
  handlers, and both run on every 308.
- The NUH commands 355 and 359 have the numbers of `hh_guide`'s messages 355 and 359, and the NUH messages 357 and 358
  those of `hh_guide`'s commands 357 and 358. Commands and messages are numbered apart, so none of them meet.

## Data that names client messages

328's prerequisites, triggers and restrictions, and the variables `NUH.invitation.option.<n>` that the options of the
window following an invitation execute, name client messages. These are the only ways to reach a client message that
no script executes ([hh_entry_init](/reference/r26/hh_entry_init.md#dead-code)), such as four of the tutorial's own:
`#tutorial_open_guestrooms_tab` and `#tutorial_open_publicrooms_tab`, which open the navigator on a tab,
`#tutorial_send_console_message` and `#exit_tutorial`, which quits the tutorial.

## Dead code

- `sendConsoleMessage`, on `#tutorial_send_console_message`, returns before doing anything.
- 329's tutorial id and 330's value are read and never used.

## Quirks

- 328 sends a content's direction and offsets as strings.
- A step with no `tutor` content gets the tutor of the step before it, the same list, so `setTopicConfig` gives both
  steps the later step's tutor text key. A first step with none has no tutor, and `setTopicConfig` then sets a text
  key on nothing.
- A help item whose timeout variable is 0, or not a number, counts as showing and never shows.
- `15_NUH Handler Class.ls`'s `deconstruct` never unregisters its messages and commands.
