---
type: Reference
title: R26 hh_poll
description: How the R26 client is offered a poll, accepts or refuses it, receives its questions and answers them one by one, from hh_poll's .ls scripts.
timestamp: 2026-11-09T18:31:12+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:31:12+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_poll/`. Below, scripts of this cast are named by their file name.

| Script | What it holds |
| --- | --- |
| `3_Poll Interface Class.ls` | The offer window and the question window, with its open field or its choices |
| `4_Poll Component Class.ls` | The questions held, their checks and the answers; sends the commands |
| `5_Poll Handler Class.ls` | Registers 3 messages and 3 commands |

No other cast registers these ids or sends these commands.

# Messages from the server

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 316 | `handle_poll_offer` | `#info` | int poll id; string description | Opens the offer window with the description |
| 317 | `handle_poll_contents` | `#info` | int poll id; string headline; string thanks; int n; then n × [a question](#a-question) | The answer to `POLL_START` |
| 318 | `handle_poll_error` | `#info` | none | Closes the poll's windows and shows the alert `server_error` |

## A question

| Field | Notes |
| --- | --- |
| int question id | |
| int question number | Shown as the question's number |
| int type | 1 or 2: choices; 3 or 4: an open answer |
| string text | |
| for types 1 and 2: int n; int least to choose; int most to choose; then n × string choice | |

A question is dropped when one of its fields is missing, when it has no choice, or when the most to choose is below 1
or below the least to choose. The thanks text shows after the last answer.

# Commands from the client

Registered by `5_Poll Handler Class.ls`. Every sender calls `send` with a typed list, which goes through `sendNew`
([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 234 | `POLL_START` | `#info` | `4_Poll Component Class.ls`: `acceptPoll`, typed | int poll id | OK in the offer window; answered by 317 |
| 235 | `POLL_REJECT` | `#info` | `4_Poll Component Class.ls`: `rejectPoll`, typed | int poll id | Cancel or the close box in the offer window |
| 236 | `POLL_ANSWER` | `#info` | `4_Poll Component Class.ls`: `sendAnswer`, typed | int poll id; int question id; then for choices: int how many chosen, and the number of each choice chosen, from 1; for an open answer: string answer | [Answering](#answering) |

# Flows

## Being offered a poll

1. The server sends 316 with a poll id and its description.
2. OK sends `POLL_START`, and Cancel or the close box `POLL_REJECT`, with that id.
3. After `POLL_START` the server sends 317 with the questions, which the client keeps in order and shows one at a
   time.

## Answering

1. Each question shows its text, and an open field for types 3 and 4, or its choices for types 1 and 2.
2. OK sends `POLL_ANSWER` for the question shown: an empty open answer, or fewer choices than the least to choose,
   shows `answer_missing` and sends nothing. When the most to choose is 1, a choice replaces the one before; otherwise
   a choice past the most shows `invalid_selection`.
3. The next question then shows, and after the last one the poll's thanks text.
4. Cancelling the questions, after a confirmation, would send `POLL_CANCEL`, which no cast registers, so the client
   logs "Unrecognized command!" and sends nothing ([fuse_client](/reference/r26/fuse_client.md#client-to-server));
   the questions are dropped.

# Notes

## Counts

`5_Poll Handler Class.ls` registers 3 messages and 3 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says.

## Dead code

- `POLL_CANCEL` is never registered, so it never reaches the server.

## Quirks

- Types 1 and 2 are handled alike, and so are 3 and 4.
