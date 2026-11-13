---
type: Reference
title: R26 hh_guide
description: How the R26 client's guide tool tells a guide whether it may help new users, lets the guide wait for invitations, and accepts or refuses a new user's invitation, from hh_guide's .ls scripts.
timestamp: 2026-11-09T18:47:41+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:41:14+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_guide/`. Below, scripts of this cast are named by their file name, and scripts
of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Guide Interface Class.ls` | The guide tool window, in its states: start, waiting, and an invitation |
| `4_Guide Component Class.ls` | The tool's state and the invitation; sends the five commands |
| `5_Guide Handler Class.ls` | Registers 5 messages and 5 commands |
| `7_Guide Tool Icon Class.ls` | The tool's icon |

Other casts:

| Script | Why it is here |
| --- | --- |
| `hh_room_ui/34_Room Bar Extensions Manager.ls` | Also sends `MSG_ACCEPT_TUTOR_INVITATION` and `MSG_REJECT_TUTOR_INVITATION`, for an invitation no script gives it ([Dead code](#dead-code)) |
| `hh_tutorial/15_NUH Handler Class.ls` | The new user's side: it registers 355 as a command, `MSG_GET_TUTORS_AVAILABLE` (s1-14) |

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 355 | `handleInvitation` | `#info` | string user id; string name | A new user invites the guide: the tool shows the invitation and plays its sound |
| 359 | `handleInvitationFollowFailed` | `#info` | none | An alert, `invitation_follow_failed` |
| 360 | `handleInvitationCancelled` | `#info` | none | The invitation is withdrawn, and the tool goes back to waiting |
| 425 | `handleInitTutorServiceStatus` | `#info` | int status: 1 enabled; 2 or 3 disabled | The answer to `MSG_INIT_TUTORSERVICE` |
| 426 | `handleEnableTutorServiceStatus` | `#info` | int status; int guide points | 2: `guide_tool_friendlist_full`, the tool stays enabled; 3: `guide_tool_service_disabled`; 4: `guide_tool_max_newbies`, both disabling it. The points are read and not used |

# Commands from the client

Registered by `5_Guide Handler Class.ls`. Every sender calls `send`: with no body it sends the id alone, and with a
typed list it goes through `sendNew` ([fuse_client](/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 357 | `MSG_ACCEPT_TUTOR_INVITATION` | `#info` | `4_Guide Component Class.ls`: `acceptInvitation`, typed; `hh_room_ui/34_Room Bar Extensions Manager.ls`: `acceptInvitation`, typed | string user id of the new user | Accept in the guide tool |
| 358 | `MSG_REJECT_TUTOR_INVITATION` | `#info` | `4_Guide Component Class.ls`: `rejectInvitation`, typed; `hh_room_ui/34_Room Bar Extensions Manager.ls`: `rejectInvitation`, typed | string user id of the new user | Refuse in the guide tool |
| 360 | `MSG_INIT_TUTORSERVICE` | `#info` | `4_Guide Component Class.ls`: `Init`, no body | none | On `#userlogin`; answered by 425 |
| 362 | `MSG_WAIT_FOR_TUTOR_INVITATIONS` | `#info` | `4_Guide Component Class.ls`: `startWaiting`, no body | none | Start in the guide tool |
| 363 | `MSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS` | `#info` | `4_Guide Component Class.ls`: `cancelWaiting`, no body | none | Cancel while waiting |

# Flows

## The guide tool

1. After the login, the client sends `MSG_INIT_TUTORSERVICE`. 425 enables the tool with status 1 and leaves it
   disabled otherwise.
2. Start sends `MSG_WAIT_FOR_TUTOR_INVITATIONS`, and the tool waits, animated; Cancel sends
   `MSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS` and puts it back to enabled. 426 shows an alert by its status: 2
   `guide_tool_friendlist_full`, leaving the tool enabled; 3 `guide_tool_service_disabled` or 4
   `guide_tool_max_newbies`, disabling it. No script ties 426 to a command.
3. A new user's invitation arrives as 355 with their user id and name, the user id as text. The tool shows it and
   plays its sound, unless the guide turned the sound off in the tool.
4. Accept sends `MSG_ACCEPT_TUTOR_INVITATION`, and Refuse `MSG_REJECT_TUTOR_INVITATION`, with that user id; either
   puts the tool back to enabled. 359 shows the alert `invitation_follow_failed`, and 360 withdraws the invitation
   and puts the tool back to waiting.

The new user's side, from asking which guides are there to inviting one, is `hh_tutorial`'s
(s1-14).

# Notes

## Counts

`5_Guide Handler Class.ls` registers 5 messages and 5 commands, as
Registering scripts (`packages/client-r26/knowledge/client-r26.md#registering-scripts`) says.

## Ids other casts register too

- 355: `hh_tutorial` registers the command `MSG_GET_TUTORS_AVAILABLE` with the id 355. Commands and messages are
  numbered apart, so it does not meet this message.
- 360 is both this cast's message `handleInvitationCancelled` and its command `MSG_INIT_TUTORSERVICE`, one for each
  direction.

## Dead code

- `hh_room_ui`'s Room Bar Extensions Manager sends `MSG_ACCEPT_TUTOR_INVITATION` and `MSG_REJECT_TUTOR_INVITATION`
  for an invitation that only its `registerInvitation` sets, which no script calls, so neither send goes out.
- 426's guide points are read and never used.

## Quirks

- 355 carries the user id as a string, and both answers send it back as a string.
