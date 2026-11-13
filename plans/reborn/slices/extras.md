---
type: Slice
title: Extras: the client's smaller features
description: The remaining casts with a protocol: the tutorial and new-user help, guides, polls, photos, the sound machine, the room dimmer, pets, the dynamic downloader and error reports, each with the catalogue pages that sell it.
status: planned
projects: [server, virtual, store, cms]
depends_on: []
from: ["plans/server/phases/s7-club-help-extras.md"]
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-fable-5-2, at: "2026-11-13T00:42:05+00:00"}
tags: [extras]
---

# Goal

Every remaining cast with a protocol works. It was the server's phase S7, without club, which is [credits and
club](/slices/credits-and-club.md)'s, and without the call for help, which is [moderation](/slices/moderation.md)'s.

# Scope

| Client | Reference | Parts |
| --- | --- | --- |
| `hh_tutorial` | `plans/server/reference/r26/hh_tutorial.md` | The tutorial and new-user help |
| `hh_guide` | `plans/server/reference/r26/hh_guide.md` | Guides |
| `hh_poll` | `plans/server/reference/r26/hh_poll.md` | Polls |
| `hh_photo` | `plans/server/reference/r26/hh_photo.md` | Photos and the `#mus` connection |
| `hh_soundmachine` | `plans/server/reference/r26/hh_soundmachine.md` | Songs and the sound machine |
| `hh_roomdimmer` | `plans/server/reference/r26/hh_roomdimmer.md` | The room dimmer |
| `hh_dynamic_downloader` | `plans/server/reference/r26/hh_dynamic_downloader.md` | Downloads the client asks for |
| `hh_cat_code`, `hh_room` | `plans/server/reference/r26/hh_cat_code.md`, `plans/server/reference/r26/hh_room.md` | Pets |

The catalogue's pages that S5's seed left out come back with what they sell
(`plans/server/decisions/0101-the-pages-of-s7s-furni-wait-for-s7.md`): Pets, Camera, the five Trax pages and the Club
Shop with its Mood Light.

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- From `plans/server/phases/s7-club-help-extras.md`, as written there: "What is saved and what lives only in memory for
  each part: tutorial progress, poll answers, photos, songs, dimmer presets, pets and their needs, guide invitations."
- Whether this stays one slice or each feature becomes its own, started one at a time. The phase said: "The order inside
  the phase, and whether it splits, is settled when it starts."
