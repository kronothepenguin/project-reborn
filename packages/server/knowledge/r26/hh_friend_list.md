---
type: Reference
title: R26 hh_friend_list
description: How the R26 client loads the friend list after the login, keeps it up to date, sends, accepts and declines friend requests, removes friends, searches for users, follows a friend and hears of new mail, from hh_friend_list's .ls scripts.
timestamp: 2026-11-09T18:59:07+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:59:07+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_friend_list/`. Below, scripts of this cast are named by their file name, and
scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Friend List Interface Class.ls` | The friend list window: categories, friends online and offline, requests and the search, with the follow, accept, decline, remove, add friend, mail and search buttons |
| `4_Friend List Component Class.ls` | The friends, the requests and the search results, and the update timer; sends most commands |
| `5_Friend List Handler Class.ls` | Registers 11 messages and 10 commands, and maps category ids to slots |
| `7_Friend List Container.ls`, `8_Friend Request List Container.ls` | Hold the friends, with their limit, and the requests |
| `10_` to `15_` list views, `31_Friend Infobox Class.ls` | Draw the lists and a friend's details |

Other casts:

| Script | Why it is here |
| --- | --- |
| `hh_entry_init/8_Login Handler Class.ls` | Registers 3, the login's answer, which also starts the friend list ([hh_entry_init](/reference/r26/hh_entry_init.md#after-the-login)) |
| `hh_club/4_Club Handler Class.ls` | Also listens to 3 ([hh_club](/reference/r26/hh_club.md)) |
| `hh_navigator/5_Navigator Component Class.ls` | Sends `FOLLOW_FRIEND` with the variable `friend.id` ([hh_navigator](/reference/r26/hh_navigator.md)) |
| `hh_instant_messenger/3_Instant Messenger Interface Class.ls` | Sends `FOLLOW_FRIEND` from a chat's follow button ([s1-12](/tasks/s1-12-instant-messenger.md)) |
| `hh_room_ui/5_Room Object Displayer Class.ls` | Executes `#externalFriendRequest` with a user's name, which sends `FRIENDLIST_FRIENDREQUEST` ([s1-06](/tasks/s1-06-room.md)) |
| `hh_room_ui/34_Room Bar Extensions Manager.ls` | Accepts or declines a friend request from the room bar, through the component's `updateFriendRequest` |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 3 | `handleOk` | `#info` | none read | The login's answer: sends `FRIENDLIST_INIT`. `hh_entry_init` and `hh_club` listen to it too |
| 12 | `handleFriendListInit` | `#info` | int user limit; int normal limit; int extended limit; int category count; per category: int category id, string name; int friend count; per friend: a [friend](#a-friend); int friend request limit; int friend request count | The answer to `FRIENDLIST_INIT`. Only the user limit is used, as the most friends the list holds. Then the client sends `FRIENDLIST_GETFRIENDREQUESTS` and starts the updates ([After the login](#after-the-login)) |
| 13 | `handleFriendListUpdate` | `#info` | int category count; when not 0, per category: int category id, string name; int update count; per update: int type, then for −1 an int friend id, and for 0 or 1 a friend | The answer to `FRIENDLIST_UPDATE`: −1 removes a friend, 0 updates one and 1 adds one. 0 categories leaves the categories as they are |
| 132 | `handleFriendRequest` | `#info` | a [friend request](#a-friend-request) | A new request to the user |
| 260 | `handleError` | `#info` | int id of the command that failed; int error code; for code 37, int reason | [Errors](#errors) |
| 314 | `handleFriendRequestList` | `#info` | int total, unused; int count; per request: a friend request | The answer to `FRIENDLIST_GETFRIENDREQUESTS` |
| 315 | `handleFriendRequestResult` | `#info` | int failure count; per failure: string name, int error code | Read and never shown ([Dead code](#dead-code)) |
| 349 | `handleFollowFailed` | `#info` | int reason: 0 `console_follow_not_friend`, 1 `console_follow_offline`, 2 `console_follow_hotelview`, 3 `console_follow_prevented` | Shows the alert, after opening the navigator when the user is in no room. Any other reason does nothing |
| 363 | `handleMailNotification` | `#info` | string user id, unused | New mail: the mail icon lights and blinks, and the sound of the variable `fr.new.mail.sound` plays |
| 364 | `handleMailCountNotification` | `#info` | int unread mail count | Lights the mail icon while above 0, and turns it off at 0 |
| 435 | `handleHabboSearchResult` | `#info` | int friend count; per friend: a [search result](#a-search-result); int other count; per user: a search result | The answer to `MESSENGER_HABBOSEARCH`: friends first, then other users |

## A friend

In 12 and 13: int id; string name; int sex; int online, 0 offline; int can follow, 0 not; string figure; int category
id; string mission; string last access.

- Category 0 is the default one. Any other id takes one of `fr.window.max.free.categories` slots, 5 by default, the
  first time it comes; a category with no slot left is dropped, and its friends show in the default one.
- An offline friend shows under offline, whatever its category.

## A friend request

In 132 and 314: int request id; string name; string user id.

## A search result

In 435: int id; string name; string mission; int online; int can follow; string room name; int sex; string figure;
string last access. These are a friend's values in another order, with the room name and without the category.

# Commands from the client

Registered by `5_Friend List Handler Class.ls`. Every sender calls `send`: with no body it sends the id alone, and
with a typed list it goes through `sendNew` ([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 12 | `FRIENDLIST_INIT` | `#info` | `5_Friend List Handler Class.ls`: `handleOk`, no body | none | On 3; answered by 12 |
| 15 | `FRIENDLIST_UPDATE` | `#info` | `4_Friend List Component Class.ls`: `requestFriendListUpdate`, no body; `5_Friend List Handler Class.ls`: `handleError`, no body | none | Every `fr.update.interval` ms once 12 has come, and on error 37 with reason 42; answered by 13 |
| 32 | `FRIENDLIST_GETOFFLINEFRIENDS` | `#info` | no script | — | Registered only |
| 37 | `FRIENDLIST_ACCEPTFRIEND` | `#info` | `4_Friend List Component Class.ls`: `updateFriendRequest`, typed; `4_Friend List Component Class.ls`: `handleAllRequests`, typed | int count; per request: int request id | One request, from the list or the room bar, or Accept all |
| 38 | `FRIENDLIST_DECLINEFRIEND` | `#info` | `4_Friend List Component Class.ls`: `updateFriendRequest`, typed; `4_Friend List Component Class.ls`: `handleAllRequests`, typed | int 0; int count; per request: int request id | One request, from the list or the room bar, or Dismiss all |
| 39 | `FRIENDLIST_FRIENDREQUEST` | `#info` | `4_Friend List Component Class.ls`: `externalFriendRequest`, typed | string user name | The add friend buttons. Not sent while the list is full: `console_fr_limit_exceeded_error` |
| 40 | `FRIENDLIST_REMOVEFRIEND` | `#info` | `4_Friend List Component Class.ls`: `sendRemoveFriend`, typed | int count, always 1; int friend id | After a confirmation |
| 41 | `MESSENGER_HABBOSEARCH` | `#info` | `4_Friend List Component Class.ls`: `sendHabboSearch`, typed | string search text | Not sent when empty or the same as the last search; answered by 435 |
| 233 | `FRIENDLIST_GETFRIENDREQUESTS` | `#info` | `4_Friend List Component Class.ls`: `sendAskForFriendRequests`, no body | none | On 12; answered by 314 |
| 262 | `FOLLOW_FRIEND` | `#info` | `3_Friend List Interface Class.ls`: `handleListPanelEvent`, typed; `hh_instant_messenger/3_Instant Messenger Interface Class.ls`: `eventProcIM`, typed; `hh_navigator/5_Navigator Component Class.ls`: `followFriend`, typed | int friend id | Follow; 349 tells why it failed |

# Flows

## After the login

1. 3 makes the client send `FRIENDLIST_INIT`, and 12 brings the limits, the categories and the friends.
2. The client then sends `FRIENDLIST_GETFRIENDREQUESTS`, answered by 314, and from then on `FRIENDLIST_UPDATE` every
   `fr.update.interval` ms, answered by 13.

## Friend requests

1. Add friend, on a user in a room or on a search result, sends `FRIENDLIST_FRIENDREQUEST` with the user's name and
   tells the user that the request went, unless the list is full.
2. A request to the user comes as 132, or in 314's list. Accept and decline send its request id, and Accept all and
   Dismiss all the ids of every waiting request.
3. A friend added comes as 13's type 1, which also takes the name off the requests the user has sent.

## Errors

260 carries the id of the command that failed and an error code:

| Code | What the client does |
| --- | --- |
| 0 | Logs an undefined error |
| 2 | `console_target_friend_list_full` |
| 3 | `console_target_does_not_accept` |
| 4 | `console_friend_request_not_found` |
| 37 | Reads an int reason: 2 shows `console_buddylimit_requester`; 42 shows `console_buddylist_concurrency` and sends `FRIENDLIST_UPDATE`; 1 and any other reason do nothing |
| 39 | Nothing |
| 42 | `console_concurrency_error` |
| Any other | Logs the code and the command's id |

## Mail

The client only hears of mail: 363 when one comes, and 364 with the unread count. Writing one opens the web page of
the variable `link.format.mail.compose`, its `%recipientid%` replaced by the friend's id.

# Notes

## Counts

`5_Friend List Handler Class.ls` registers 11 messages and 10 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says.

## Ids other casts register too

- 3: `hh_entry_init`'s `handleLoginOK` and `hh_club`'s `handle_ok` also run.

## Dead code

- `FRIENDLIST_GETOFFLINEFRIENDS` (32) is registered, and no script sends it.
- 315: `setFriendRequestResult` loops over an empty list of its own instead of the failures it is given, so none is
  shown.
- 12's normal and extended limits and its friend request limit and count, 314's total and 363's user id are read and
  never used.

## Quirks

- `FRIENDLIST_DECLINEFRIEND` starts with a 0 that `FRIENDLIST_ACCEPTFRIEND` does not have: Accept all builds the same
  list as Dismiss all and deletes its first value.
- In 260, code 37's reason 1 and code 39 have case labels with no statements, so they do nothing. The decompiler
  prints a label of several values on one line, as `36, 76:` in `hh_navigator`, so these are labels of their own.
- A person's sex is an int in 12, 13 and 435. The friend list hands it to the figure parser with the figure, and the
  sex plays no part there ([hh_human](/reference/r26/hh_human.md)).
