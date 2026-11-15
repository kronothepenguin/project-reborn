---
type: Reference
title: R26 hh_instant_messenger
description: How the R26 client chats with friends in the instant messenger, invites friends to the room it is in, and shows the server's errors, from hh_instant_messenger's .ls scripts.
timestamp: 2026-11-09T18:34:17+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:34:17+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_instant_messenger/`. Below, scripts of this cast are named by their file name,
and scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Instant Messenger Interface Class.ls` | The chat window with a tab per friend, and the invitation window |
| `4_Instant Messenger Component Class.ls` | The chats, one per friend, and the sends |
| `5_Instant Messenger Handler Class.ls` | Registers 4 messages and 2 commands |
| `7_IM Chat Renderer Class.ls`, `8_IM Tabs Class.ls` | Draw the chat and the friends' tabs, with their figures |

Other casts open chats and invitations:

| Script | Why it is here |
| --- | --- |
| `hh_friend_list/3_Friend List Interface Class.ls` | Starts a chat with a friend, and invites the selected friends (s1-11) |
| `hh_room/4_Room Component Class.ls` | The chat command `:im <name> <text>` starts a chat with that friend (s1-06) |

A chat only opens with someone on the friend list, whose user id names the chat.

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 134 | `handleIMMessage` | `#info` | int sender's user id; string text | Added to that friend's chat |
| 135 | `handleIMInvitation` | `#info` | int sender's user id; string text | Added to that friend's chat after the text `im_invitation` |
| 261 | `handleIMError` | `#info` | int error; int user id of the chat | [Errors](#errors) |
| 262 | `handleInvitationError` | `#info` | int error | An alert with `friend_invitation_error`; the error is read and not used |

## Errors

| Error | Text in the chat |
| --- | --- |
| 3 | `im_error_receiver_muted` |
| 4 | `im_error_sender_muted` |
| 5 | `im_error_offline` |
| 6 | `im_error_not_friend` |
| 7 | `im_error_busy` |
| any other | `im_error_undefined` |

# Commands from the client

Registered by `5_Instant Messenger Handler Class.ls`. Both are sent with a typed list, which goes through `sendNew`
([fuse_client](/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 33 | `MESSENGER_SENDMSG` | `#info` | `4_Instant Messenger Component Class.ls`: `sendMessage`, typed | int friend's user id; string text, through `convertSpecialChars` | The client shows the text in the chat as it sends it |
| 34 | `FRIEND_INVITE` | `#info` | `4_Instant Messenger Component Class.ls`: `sendInvitation`, typed | int n, then n × int friend's user id; string text | [Inviting friends](#inviting-friends) |

# Flows

## Chatting

1. A chat opens from the friend list, or from `:im <name> <text>` in a room, and only for a friend. The first chat
   since the client started shows the text `im_notification_moderation`.
2. Each line sends `MESSENGER_SENDMSG` with the friend's user id, and shows in the chat at once.
3. The friend's lines arrive as 134; an undelivered line comes back as 261 with an error and the friend's user id.
4. When a friend in a chat comes online or goes offline, the chat shows `im_notification_online` or
   `im_notification_offline`.

## Inviting friends

1. The friend list's invite button opens the invitation window for the selected friends.
2. Its send button sends `FRIEND_INVITE` with their user ids and the text. An empty text shows
   `friend_invitation_empty_alert`, and the hotel view `friend_invitation_cannot_send`: an invitation is sent from a
   room only.
3. Each friend gets 135 with the inviter's user id and the text; a refused invitation answers 262.

# Notes

## Counts

`5_Instant Messenger Handler Class.ls` registers 4 messages and 2 commands, as
Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`) says. No other cast registers them.

## Quirks

- 262 reads its error and shows the same text for any.
- The component stops listening to `#startIMChat` when it is gone, and goes on listening to `#userlogin` and
  `#friendDataUpdated`.
- The component checks a receipt from `fuse_client`'s special services when it starts, and stops with "Invalid build
  structure" when it does not match.
