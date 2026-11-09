---
type: Reference
title: R26 hh_recycler
description: How the R26 client loads the furniture recycler's rewards and status, recycles furniture from the hand, and takes or refuses the reward once the recycling is over, from hh_recycler's .ls scripts.
timestamp: 2026-11-09T18:33:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:33:05+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_recycler/`. Below, scripts of this cast are named by their file name, and scripts
of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Recycler Interface Class.ls` | The recycler window, the furniture given and the reward it brings, and its buttons |
| `4_Recycler Component Class.ls` | The configuration, the state, the furniture given; sends the five commands |
| `5_Recycler Handler Class.ls` | Registers 5 messages and 5 commands, on `connection.room.id` |
| `6_Recycler Progress Animation Class.ls`, `7_Recycler Status Icon Class.ls` | The animation while recycling, and the icon of the recycler's state |

Other casts start it:

| Script | Why it is here |
| --- | --- |
| `hh_entry_init/8_Login Handler Class.ls` | Executes `#userloggedin` after the login, on which the recycler asks for its configuration and status |
| `hh_cat_code/14_Catalogue recycler Class.ls` | The catalogue's recycler page opens the recycler ([s1-09](/tasks/s1-09-catalogue.md)) |

# Messages from the server

All come on `connection.room.id`, which is `#info`.

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 303 | `handle_recycler_configuration` | `#info` (room) | int enabled; int quarantine minutes; int recycling minutes; int minutes to time out; int n; then n × [a reward](#a-reward) | The answer to `GET_FURNI_RECYCLER_CONFIGURATION` |
| 304 | `handle_recycler_status` | `#info` (room) | int status; then by status: 0 nothing; 1 int reward type, string class, int minutes left; 2 int reward type, string class; 3 nothing | [The status](#the-status) |
| 305 | `handle_approve_recycling_result` | `#info` (room) | int result | Not 0: the client asks for the status |
| 306 | `handle_start_recycling_result` | `#info` (room) | int result | Not 0: the client asks for the status |
| 307 | `handle_confirm_recycling_result` | `#info` (room) | int result | Not 0: the recycler opens empty again |

## A reward

| Field | Notes |
| --- | --- |
| int furniture value | How many pieces to give for this reward |
| int type | 0 a floor item, 1 a wall item, 2 anything else |
| for type 0: string class; int default direction; int x size; int y size; string part colours | The name is the text `furni_<class>_name` |
| for type 1: string class | The name is the text `wallitem_<class>_name` |
| for type 2: string name | |

## The status

| Status | State | What the client does |
| --- | --- | --- |
| 0 | `open` | The user may give furniture from the hand; when the service is not enabled, the state is `disabled` |
| 1 | `progress` | Shows the reward, a floor item for reward type 0 and a wall item for any other, and the minutes left; asks for the status again a minute after they run out |
| 2 | `ready` | Shows the reward, which the user may take |
| 3 | `timeout` | The reward waited too long |

# Commands from the client

Registered by `5_Recycler Handler Class.ls`, on `connection.room.id`; the component sends them on
`connection.info.id`, the same `#info`. Every sender calls `send`: with no body it sends the id alone, and with a
typed list it goes through `sendNew` ([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 222 | `GET_FURNI_RECYCLER_CONFIGURATION` | `#info` | `4_Recycler Component Class.ls`: `Initialize`, no body | none | After the login; answered by 303 |
| 223 | `GET_FURNI_RECYCLER_STATUS` | `#info` | `4_Recycler Component Class.ls`: `requestRecyclerState`, no body | none | After the login, when the recycler opens, after 305 or 306, and when the minutes left run out; answered by 304 |
| 224 | `APPROVE_RECYCLED_FURNI` | `#info` | `4_Recycler Component Class.ls`: `acceptRecycling`, typed | int 1 | Only from the state `progress`, where the window never calls it ([Dead code](#dead-code)) |
| 225 | `START_FURNI_RECYCLING` | `#info` | `4_Recycler Component Class.ls`: `startRecycling`, typed | int n, then n × int floor item id; int m, then m × int wall item id | [Recycling](#recycling) |
| 226 | `CONFIRM_FURNI_RECYCLING` | `#info` | `4_Recycler Component Class.ls`: `acceptRecycling`, typed; `4_Recycler Component Class.ls`: `cancelRecycling`, typed | int 1 to take the reward, 0 to refuse it | Answered by 307 |

# Flows

## After the login

On `#userloggedin`, the client sends `GET_FURNI_RECYCLER_CONFIGURATION` and `GET_FURNI_RECYCLER_STATUS`.

## Recycling

1. The catalogue's recycler page opens the recycler, which asks for the status and opens on 304.
2. In the state `open`, the user moves furniture from the hand into the window. The window shows the best reward for
   that many pieces: the reward whose value equals the count, or else the highest below it.
3. The recycle button sends `START_FURNI_RECYCLING` with the first pieces given, as many as the reward's value, floor
   items and wall items apart. An open trade stops it with `recycler_trader_open_alert`.
4. The server answers 306; a result other than 0 asks for the status, which shows `progress` with the minutes left.
5. Once the status is `ready`, the accept button sends `CONFIRM_FURNI_RECYCLING` with 1; the cancel button sends it
   with 0 in the states `progress`, `ready` and `timeout`. 307 then opens the recycler empty again.

# Notes

## Counts

`5_Recycler Handler Class.ls` registers 5 messages and 5 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says. No other cast registers them.

## Dead code

- `APPROVE_RECYCLED_FURNI` is sent only by `acceptRecycling` in the state `progress`, and the window calls
  `acceptRecycling` only in the state `ready`, so it is never sent, and the server never needs 305, its answer.

## Quirks

- A result of 0 in 305, 306 or 307 does nothing: the window stays as it was.
- The reward type of 304 is 0 for a floor item and anything else for a wall item, where 303 numbers wall items 1 and
  other rewards 2.
