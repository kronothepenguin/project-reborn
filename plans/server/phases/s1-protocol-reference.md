---
type: Phase
title: S1 R26 protocol reference
description: Every message the R26 client receives and every command it sends, reverse engineered from the .ls scripts into one reference document per cast, which the later phases implement from.
status: active
timestamp: 2026-11-06T14:59:31+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T20:57:45+00:00"}
tags: [s1, protocol, r26]
---

# Goal

A complete map of the R26 protocol, taken from the client's `.ls` scripts
([0008](/decisions/0008-reverse-engineer-ls-only.md)): one document per cast under `/reference/r26/`, so that no later
phase reads the Lingo again to learn a message.

# Scope

Every cast that registers messages or commands ([The R26 client](/reference/client-r26.md#registering-scripts)), one
task each, plus the connection layer of `fuse_client`. Each document follows the
[protocol reference format](/reference/client-r26.md#protocol-reference-format):

- every message from the server: id, handler, connection, fields in order;
- every command from the client: id, name, connection, every script that sends it, fields in order;
- the flows the scripts expect;
- quirks, dead code and ids that several casts register.

The tasks only read the client and write documents, so each runs on its own branch, `s1-<slug>`, beside S0 and beside
each other ([Branches](/rules.md#branches)).

# Exit criteria

- One document per cast in the task list, listed in `/reference/r26/index.md`.
- Every id that any script registers appears in a document, with its fields in order, and the counts of each document
  match the registrations in its scripts.
- Every command lists its senders from every cast, `hh_furni_classes` and `hh_room_ui` included.
- The `fuse_client` document describes the framing, the value encodings, the handshake and both connections.

# Tasks

1. [s1-01 Describe fuse_client's connections, framing and values](/tasks/s1-01-fuse-client.md) **done**
2. [s1-02 Map hh_entry_init: login and opening hours](/tasks/s1-02-entry-init.md) **done**
3. [s1-03 Map hh_shared](/tasks/s1-03-shared.md) **done**
4. [s1-04 Map hh_navigator](/tasks/s1-04-navigator.md) **done**
5. [s1-05 Map hh_kiosk_room](/tasks/s1-05-kiosk-room.md) **done**
6. [s1-06 Map hh_room](/tasks/s1-06-room.md)
7. [s1-07 Map hh_room_utils](/tasks/s1-07-room-utils.md) **done**
8. [s1-08 Map hh_buffer](/tasks/s1-08-buffer.md) **done**
9. [s1-09 Map hh_cat_code](/tasks/s1-09-catalogue.md) **done**
10. [s1-10 Map hh_club](/tasks/s1-10-club.md) **done**
11. [s1-11 Map hh_friend_list](/tasks/s1-11-friend-list.md) **done**
12. [s1-12 Map hh_instant_messenger](/tasks/s1-12-instant-messenger.md) **done**
13. [s1-13 Map hh_guide](/tasks/s1-13-guide.md) **done**
14. [s1-14 Map hh_tutorial](/tasks/s1-14-tutorial.md) **done**
15. [s1-15 Map hh_poll](/tasks/s1-15-poll.md) **done**
16. [s1-16 Map hh_photo](/tasks/s1-16-photo.md) **done**
17. [s1-17 Map hh_recycler](/tasks/s1-17-recycler.md) **done**
18. [s1-18 Map hh_soundmachine](/tasks/s1-18-soundmachine.md)
19. [s1-19 Map hh_roomdimmer](/tasks/s1-19-roomdimmer.md) **done**
20. [s1-20 Map hh_dynamic_downloader](/tasks/s1-20-dynamic-downloader.md) **done**
21. [s1-21 Map hh_ig](/tasks/s1-21-instant-games.md)
22. [s1-22 Map hh_human](/tasks/s1-22-human.md) **done**
23. [s1-24 Describe the MUS framing of the #mus connection](/tasks/s1-24-mus-framing.md)
24. [s1-23 Check S1's exit criteria](/tasks/s1-23-exit-check.md)

s1-01 and s1-02 come first, because S0's encoding and sessions wait for them. The others may run in any order, many
at once.
