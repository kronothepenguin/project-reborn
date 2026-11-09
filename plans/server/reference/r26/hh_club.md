---
type: Reference
title: R26 hh_club
description: How the R26 client asks for its club status after the login and shows it, buys club periods in the club window, and accepts or refuses the club's gifts, from hh_club's .ls scripts.
timestamp: 2026-11-09T17:50:34+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T17:48:52+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_club/`. Below, scripts of this cast are named by their file name, and scripts of
other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `2_Club Interface Class.ls` | The club window, in its buy, status and ended forms, the gift dialog, and the alerts of three notifications |
| `3_Club Component Class.ls` | The club status, which it keeps in the session as `club_status`; `subscribe` (`SCR_BUY`), the gifts (`SCR_GIFT_APPROVAL`), and `askforBadgeUpdate` (`GETAVAILABLEBADGES`) |
| `4_Club Handler Class.ls` | Registers 3 messages and 3 commands |

Other casts open the window, show the status and send the notifications:

| Script | Why it is here |
| --- | --- |
| `hh_entry_base/3_Entry Interface Class.ls` | Its bottom bar shows the club days from `club_status`, on `#updateClubStatus`, and its club icon executes `#show_clubinfo`, which opens the club window |
| `hh_room_ui/5_Room Object Displayer Class.ls` | Redraws on `#updateClubStatus` |
| `hh_entry_init/8_Login Handler Class.ls` | Also listens to 3, and passes the notifications of 52 on as `#notify` ([hh_entry_init](/reference/r26/hh_entry_init.md#notifications)) |
| `hh_friend_list/5_Friend List Handler Class.ls` | Also listens to 3 |
| `hh_cat_code/5_Catalogue Handler Class.ls` | Keeps the credits in the session as `user_walletbalance`, which the club's question shows |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 3 | `handle_ok` | `#info` | none | The login is done: sends `SCR_GET_USER_INFO` ([After the login](#after-the-login)) |
| 7 | `handle_scr_sinfo` | `#info` | string product; int days left; int elapsed periods; int prepaid periods; int response | [The club status](#the-club-status) |
| 280 | `handle_gift` | `#info` | int gifts | [Gifts](#gifts) |

## The club status

`handle_scr_sinfo` keeps the first four fields as the club status, in the session as `club_status`, and executes
`#updateClubStatus` with it:

| Field | What the client does with it |
| --- | --- |
| string product | Kept as `#productName`; no script reads it |
| int days left | The days left of the current period. The bottom bar shows days left plus 31 for each prepaid period. The status window moves its arrow 5 pixels for each day below 31 |
| int elapsed periods | The periods the user has had. With days left, it chooses the window ([The club window](#the-club-window)), and the status and ended windows show it, unless it is 0 |
| int prepaid periods | The periods bought after the current one. The status window shows it, unless it is 0. -1 hides the days: the bottom bar says `club_member`, and the status window shows `club_isp_change` and `club_isp_icon` in place of the extend button |
| int response | Not kept: it tells the client which window to open now ([Responses](#responses)) |

## Responses

| Response | What the client does |
| --- | --- |
| 2 | Opens the status window. When the status before this one had 0 days left and 0 elapsed periods, it says `club_thanks_title` and `club_thanks_text` |
| 3 | Opens the ended window, modal, with the elapsed periods |
| Any other | Opens nothing: the status is kept and the bottom bar shows it |

## The club window

The club icon of the bottom bar executes `#show_clubinfo`, which opens the club window, or closes it when it is open.
It opens nothing while the hotel is closing (`#getHotelClosingStatus`,
[hh_entry_init](/reference/r26/hh_entry_init.md#opening-hours)). By the status:

| Days left | Elapsed periods | Window |
| --- | --- | --- |
| 0 | 0 | The buy window, `habbo_club_buy`, or `habbo_club_buy_jp` when the text `club_paybycash_url` starts with `http` |
| 0 | above 0 | The ended window |
| any other | any | The status window, whose extend button opens the buy window with `club_extend_title` and `club_extend_text` |

When the variable `club.subscription.disabled` is above 0, buying and extending open the page `club_buy_url` instead,
and the client never sends `SCR_BUY`.

# Commands from the client

All are registered by `4_Club Handler Class.ls`. Every sender calls `send` with a typed list, which goes through
`sendNew` ([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 26 | `SCR_GET_USER_INFO` | `#info` | `4_Club Handler Class.ls`: `handle_ok`, typed | string product: `club_habbo` | On every 3 ([After the login](#after-the-login)) |
| 190 | `SCR_BUY` | `#info` | `3_Club Component Class.ls`: `subscribe`, typed | string product: `club_habbo`; int choice: 1, 2 or 3 | The buy window's three buttons; the client sends which one, not a number of months ([Buying](#buying)) |
| 210 | `SCR_GIFT_APPROVAL` | `#info` | `3_Club Component Class.ls`: `sendAcceptGift`, typed | int gifts accepted | [Gifts](#gifts) |

# Flows

## After the login

1. The server sends 3 once the login is done ([hh_entry_init](/reference/r26/hh_entry_init.md#after-the-login)).
2. `handle_ok` answers `SCR_GET_USER_INFO` with `club_habbo`.
3. The server sends 7 with the club status. The bottom bar shows the days, or `club_habbo.bottombar.text.notmember`
   and `club_habbo.bottombar.link.notmember` when they add up to 0.

## Buying

1. In the buy window, the buttons `club_button_1_period`, `club_button_2_period` and `club_button_3_period` choose 1,
   2 or 3, and the question that follows shows the text `club_confirm_text1`, `2` or `3`, with `%credits%` replaced by
   the credits the client holds.
2. OK sends `SCR_BUY` with `club_habbo` and the choice, and closes the window. The client waits for nothing in
   particular.
3. By the client's handlers, a purchase that went through comes back as 7 with response 2, which opens the status
   window; a refused one as a notification of 52, which `hh_entry_init` passes on as `#notify`: 551 shows
   `club_extend_failed`, and 552 `Alert_no_credits`. The new credits come from `hh_cat_code`'s messages
   ([s1-09](/tasks/s1-09-catalogue.md)).

## Gifts

1. The server sends 280 with the number of gifts waiting. Above 0, the client opens a modal dialog with
   `club_confirm_gift_title` and `club_confirm_gift_text`, one gift at a time.
2. OK accepts one gift. While more are waiting, the dialog comes back after one second; after the last, the client
   sends `SCR_GIFT_APPROVAL` with the number accepted.
3. Cancel refuses the rest: the client sends `SCR_GIFT_APPROVAL` with the number accepted so far, or nothing when it
   is 0.
4. Closing the dialog with its close button forgets the gifts and sends nothing.

# Notes

## Counts

`4_Club Handler Class.ls` registers 3 messages and 3 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says. No other cast registers 7, 280 or a command
of this cast.

## Ids other casts register too

- 3: `hh_entry_init`'s `handleLoginOK` and `hh_friend_list`'s `handleOk` also run
  ([hh_entry_init](/reference/r26/hh_entry_init.md#ids-other-casts-register-too)).
- 157: `askforBadgeUpdate` sends `GETAVAILABLEBADGES`, which `hh_entry_init` registers.

## Dead code

- `askforBadgeUpdate` is called by no script
  ([hh_entry_init](/reference/r26/hh_entry_init.md#dead-code)).
- No script reads the product the club status keeps.

## Quirks

- The notification 1001 shows `epsnotify_1001` and then closes the `#info` connection.
- After Cancel with no gift accepted, the client sends nothing, so the server cannot tell a refusal from a dialog
  still open.
