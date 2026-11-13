---
type: Spec
title: Moderation
description: "Staff moderate the hotel from the client and from housekeeping: chat commands, the word filter, calls for help, bans and alerts that reach the game at once, and staff tools for groups."
status: planned
projects: [packages/server, packages/virtual, packages/store, packages/housekeeping, packages/cms, packages/auth]
---

# What

Staff ban users and lift the bans, and alert one habbo or every habbo, from housekeeping. A habbo asks for help or
reports a forum post in Holo's Help Tool window, and staff pick up and close the request in Help Queries. Staff read
what habbos said in rooms in the Chat Log Viewer.

Next:

Staff keep the hotel in order, from the client and from housekeeping.

It builds on [platform](/features/platform/spec.md).

# Behaviours

## Bans

- Staff with `housekeeping.bans` ban a habbo by name, or a user by id, for one of Holo's lengths, with a reason and an
  optional address: the ban is listed with its end. Permanent is a real date 25 years away.
- Staff open the ban form from a habbo's page: the habbo is filled in.
- A ban starts: the user's sessions end at once, and their next sign-in shows the reason and the expiry.
- Staff ban a user at or above their own level: the ban is refused and logged (decision holo-port/0055).
- Staff ban an unknown user, with a bad length or a bad address: Holo's message refuses it.
- Staff lift a ban: it leaves the list, stays in the table as history, and the user signs in again (decision
  holo-port/0063).
- Staff lift the bans of users below their level, and any ban on an address alone (decision holo-port/0055).

## Alerts

- Staff with `housekeeping.alerts` alert a habbo by name, whatever its user's level: "Gave alert to user.", and the
  habbo reads the alert on its page of the site.
- Staff send a blank alert, or alert an unknown habbo: Holo's message refuses it.
- Staff with `housekeeping.alertsBroadcast` send a mass alert: every habbo reads it.
- Staff open Alerts: the alerts not dismissed yet, in pages.

## Help requests and post reports

- A visitor who is not signed in opens `/help`: they go to sign in (decision holo-port/0108).
- A habbo clicks the header's Help: `/help` opens in Holo's Help Tool window.
- A habbo sends a blank field: "Please do not leave any fields blank", and the form again, empty.
- A habbo sends a subject over 50 characters, or a question over `help.messageMaxLength`, 65535 by default: the
  request is refused, with the form again (decision holo-port/0109).
- A habbo presses Proceed: the request waits for staff, and the window offers Close.
- A habbo with a request staff have not picked up opens `/help`: the form shows, and sending it answers Holo's refusal
  and writes nothing (decision holo-port/0090).
- A habbo reports a forum post: the Help Tool window asks first, and Proceed sends a request with the post's text and
  its address, then answers "Thank you for reporting this post." (decision holo-port/0090).
- A waiting help request or report stops the next one, help and reports alike, per habbo (decision holo-port/0090).
- Staff pick a request up: the habbo can ask again.

## Help Queries

- Staff with `housekeeping.help` open Help Queries: the requests not closed, newest first, in pages, with Holo's
  columns.
- Staff open a request: who asked, from where and what, with the address for holders of `housekeeping.usersPrivate`.
- Staff pick a request up, then close it: it leaves the queue and stays readable (decision holo-port/0063).
- Staff close a request nobody picked up: "Invalid ID specified or not picked up yet. Please note that all queries must
  be picked up before they can be closed."
- Staff with `housekeeping.alerts` press Quick Reply: the request is picked up, and the alert form opens with Holo's
  text.

## Chat Log Viewer

- Staff with `housekeeping.chatLogs` search by a room's id or a habbo's name: the lines, newest first, 100 a page, with
  Newer and Older links (decision server/0085).
- The Room ID column shows `101` for habbo room 101 and `Public 101` for public room 101, and a search for 101 lists
  both. A deleted room's lines show `-` (decision server/0086).
- The game server deletes the lines older than `game.chatHistoryDays`, 30 by default, when it starts and every hour
  (decision server/0084).

# Open questions

From the server's phase S7, as written there:

- "Which moderation tools the client offers and which stay in housekeeping."
- "Who receives the calls for help, and where a staff member who follows one is taken: the client checks no right before
  it shows a call (148), and after `FOLLOW_CRYFORHELP` it waits for the server to move it, as 286 does".

And from [later](/features/moderation/later.md): which of Holo's chat commands the hotel keeps, and where the word
filter's words live.
