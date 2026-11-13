---
type: Phase
title: S6 Friends and messenger
description: Habbos keep a friends list, send and answer friend requests, search habbos, follow friends and chat with them in the messenger.
status: moved
moved_to: plans/reborn/slices/friends.md
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s6, server]
---

Moved on 2026-11-13: this work is the slice `plans/reborn/slices/friends.md`, and its last open question went to
`plans/reborn/slices/presence-and-rooms.md`.

# Goal

Habbos keep a friends list in categories, send and answer friend requests, search for habbos, follow friends into
rooms, and chat with friends who are online.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_friend_list` | [s1-11](/tasks/s1-11-friend-list.md) | The list and its categories, requests, search, follow, mail notices |
| `hh_instant_messenger` | [s1-12](/tasks/s1-12-instant-messenger.md) | Messages and invitations |

- Saved: friend requests and the last time online. Only in memory: who is online and instant messages, which reach only
  friends who are online ([0011](/decisions/0011-saved-and-memory-only-data.md)).

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- Whether friendships and friend categories are saved.
- The friend and request limits, for members and for club members.
- Who can be followed.
- Where the mail that the client's mail notices count comes from.
- How the site shows who is online while it runs apart from the server
  ([0011](/decisions/0011-saved-and-memory-only-data.md)).
