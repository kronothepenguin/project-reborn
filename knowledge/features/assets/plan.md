---
type: Plan
title: "Assets out of the repository: how"
description: A tool fetches Habbo's files into ignored folders, the programs serve them from disk, and the history is rewritten.
---

# Architecture

| Part | What |
| --- | --- |
| A tool | Fetches each file, pinned by address and checksum, into ignored folders |
| The programs | Serve Habbo's images and the client files from disk instead of embedding them |
| The client's scripts | `packages/client-r26/src/game/`, which the game server's protocol work reads ([server 0008](/decisions/server/0008-reverse-engineer-ls-only.md)), fetched or regenerated |
| Holo's sources | `source/holocms-1.3.1` and `source/holoemu`, where they carry Habbo's images |
| The history | Rewritten once without the files, and pushed with force |

# Decisions

- [No Habbo files in the repository; a tool fetches them](/decisions/reborn/0011-no-habbo-files-in-the-repository.md) —
  Sulake's files, from the client's .dcr and casts to images and decompiled scripts, leave the repository and its
  history; a tool fetches them, pinned, into ignored folders, and the programs serve them from disk; LibreShockwave
  stays a submodule and its player is built from it.
