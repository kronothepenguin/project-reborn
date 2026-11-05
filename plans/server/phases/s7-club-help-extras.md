---
type: Phase
title: S7 Club, help and extras
description: The smaller casts: club purchases and gifts, the tutorial and new-user help, guides, polls, photos, the sound machine, the room dimmer, pets, the call for help and error reports.
status: planned
timestamp: 2026-11-05T20:57:45+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s7, server]
---

# Goal

Every remaining cast with a protocol works: club purchases and gifts, the tutorial and new-user help, guides, polls,
photos, the sound machine, the room dimmer, pets, the call for help and error reports.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_club` | [s1-10](/tasks/s1-10-club.md) | Buying club and its gifts |
| `hh_tutorial` | [s1-14](/tasks/s1-14-tutorial.md) | The tutorial and new-user help |
| `hh_guide` | [s1-13](/tasks/s1-13-guide.md) | Guides |
| `hh_poll` | [s1-15](/tasks/s1-15-poll.md) | Polls |
| `hh_photo` | [s1-16](/tasks/s1-16-photo.md) | Photos and the `#mus` connection |
| `hh_soundmachine` | [s1-18](/tasks/s1-18-soundmachine.md) | Songs and the sound machine |
| `hh_roomdimmer` | [s1-19](/tasks/s1-19-roomdimmer.md) | The room dimmer |
| `hh_dynamic_downloader` | [s1-20](/tasks/s1-20-dynamic-downloader.md) | Downloads the client asks for |
| `hh_shared` | [s1-03](/tasks/s1-03-shared.md) | The call for help and moderation (Hobba) |
| `hh_cat_code`, `hh_room` | [s1-09](/tasks/s1-09-catalogue.md), [s1-06](/tasks/s1-06-room.md) | Pets |

The order inside the phase, and whether it splits, is settled when it starts.

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- What is saved and what lives only in memory for each part: tutorial progress, poll answers, photos, songs, dimmer
  presets, pets and their needs, guide invitations.
- How club bought in the client meets club bought on the site (`plans/holo-port/phases/p6-economy.md`).
- Which moderation tools the client offers and which stay in housekeeping.
- How to learn the byte format of the `#mus` connection, which the Multiuser Xtra writes and no `.ls` script holds
  ([fuse_client](/reference/r26/fuse_client.md#the-mus-connection)), given that
  [0008](/decisions/0008-reverse-engineer-ls-only.md) reads only `.ls` files.
