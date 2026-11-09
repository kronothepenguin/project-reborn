---
type: Reference
title: R26 hh_dynamic_downloader
description: How the R26 client asks the server, once, for the furniture aliases and revisions before it downloads a furniture class's cast, and which address it builds for the download, from hh_dynamic_downloader's .ls scripts.
timestamp: 2026-11-09T18:27:48+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T18:27:48+00:00"}
tags: [r26, protocol]
---

# Scripts

In `packages/client-r26/src/game/hh_dynamic_downloader/`. Below, scripts of this cast are named by their file name,
and scripts of other casts by `<cast>/<file>`.

| Script | What it holds |
| --- | --- |
| `3_Dynamic Downloader Component Class.ls` | The download queues, the aliases and revisions, the address of each download, and whether a class is there |
| `4_Dynamic Downloader Handler Class.ls` | Registers 2 messages and 2 commands, on `connection.room.id` |
| `5_Dynamic Download Instance.ls` | One download and the scripts to call back when it ends |

Other casts ask for downloads:

| Script | Why it is here |
| --- | --- |
| `hh_buffer/3_Buffer Component Class.ls` | Holds furniture as placeholders until its class arrives ([s1-08](/tasks/s1-08-buffer.md)) |
| `hh_cat_code/4_Catalogue Component Class.ls`, `hh_cat_code/15_Catalogue soundmachine Class.ls` | Download the classes shown in the catalogue ([s1-09](/tasks/s1-09-catalogue.md)) |
| `hh_room_utils/18_Container Hand Class.ls`, `hh_room_utils/3_Safe Trader Class.ls`, `hh_furni_classes/58_Package Card Class.ls` | Download the classes of the hand, a trade and a gift ([s1-07](/tasks/s1-07-room-utils.md)) |

# Messages from the server

Both come on `connection.room.id`, which is `#info`.

| Id | Handler | Connection | Fields, in order | Notes |
| --- | --- | --- | --- | --- |
| 295 | `handle_furni_revisions` | `#info` (room) | int n, then n × (string class; int revision); int m, then m × (string class; int revision) | The answer to `GET_FURNI_REVISIONS`. The client passes 1 with the first list and 0 with the second, and uses neither |
| 297 | `handle_alias_list` | `#info` (room) | int n, then n × (string class; string alias) | The answer to `GET_ALIAS_LIST`; then the client sends `GET_FURNI_REVISIONS` |

# Commands from the client

Registered by `4_Dynamic Downloader Handler Class.ls`. Each is sent with no body, so with its id alone
([fuse_client](/reference/r26/fuse_client.md#client-to-server)).

| Id | Name | Connection | Sent by | Fields, in order | Notes |
| --- | --- | --- | --- | --- | --- |
| 213 | `GET_FURNI_REVISIONS` | `#info`, as `connection.room.id` | `3_Dynamic Downloader Component Class.ls`: `tryNextDownload`, no body | none | Once, after 297, before the first download |
| 215 | `GET_ALIAS_LIST` | `#info`, as `connection.info.id` | `3_Dynamic Downloader Component Class.ls`: `tryNextDownload`, no body | none | Once, at the first download the client wants |

# Flows

## Before the first download

1. The first time a script asks for a class, the downloader sends `GET_ALIAS_LIST` and waits.
2. 297 gives the aliases: a class downloads under its alias's name. Each alias also holds for the class's small form,
   `s_<class>`, which gets `s_<alias>`.
3. The downloader then sends `GET_FURNI_REVISIONS` and waits.
4. 295 gives each class's revision. A class with a `*` keeps only what comes before it, and a class named twice keeps
   its highest revision.
5. Downloads start, one at a time, those asked with priority first. Neither list is asked again.

## The address of a download

The address is the variable `dynamic.download.url`, `dynamic_content/` by default, then the variable
`dynamic.download.name.template`, `hh_furni_xx_%typeid%.cct` by default, in which:

- `%typeid%` is the class, or its alias, with every space turned into `_`;
- `%revision%` is the class's revision from 295, without its `s_`; a poster takes the revision of `poster`, a sound
  sample its parent's, and a class with no revision an empty one.

A sound sample with a parent downloads from `dynamic.download.samples.template` instead, when that variable exists.
The variable `dynamic.download.delay` holds each download back that many milliseconds. A class in the variable
`dyn.download.bypass.list`, where `?` stands for any character, counts as downloaded and is never fetched.

These casts are files the hotel serves over HTTP, not messages: `plans/client/phases/c2-client-files.md` plans where
they come from.

# Notes

## Counts

`4_Dynamic Downloader Handler Class.ls` registers 2 messages and 2 commands, as
[Registering scripts](/reference/client-r26.md#registering-scripts) says. No other cast registers them.

## Quirks

- `GET_ALIAS_LIST` goes out on `connection.info.id` and `GET_FURNI_REVISIONS` on `connection.room.id`; both are `#info`.
- 295's two lists are read alike, and the flag that tells them apart is never used.
- A download that fails counts as downloaded, so the client never tries it again in the session.
