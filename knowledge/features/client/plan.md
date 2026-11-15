---
type: Plan
title: "The client in the browser: how"
description: The CMS ports Holo's client page onto LibreShockwave; the client's files and the JavaScript client follow.
---

# Architecture

| Part | Planned in |
| --- | --- |
| The client page on LibreShockwave | The client bundle's phase C1, and [0011](/decisions/reborn/0011-no-habbo-files-in-the-repository.md) and [0012](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md) |
| The client's files | The client bundle's phase C2, which runs inside reborn ([platform](/features/platform/spec.md)) |
| The JavaScript client | The client bundle's phase C3 |

The client's reference documents are [LibreShockwave](/sources/libreshockwave.md) and
`packages/client-r26/knowledge/client-r26.md`.

# Decisions

- [No Habbo files in the repository; a tool fetches them](/decisions/reborn/0011-no-habbo-files-in-the-repository.md) —
  Sulake's files, from the client's .dcr and casts to images and decompiled scripts, leave the repository and its
  history; a tool fetches them, pinned, into ignored folders, and the programs serve them from disk; LibreShockwave
  stays a submodule and its player is built from it.
- [The client page ports Holo's, with LibreShockwave in place of Adobe's
  plugin](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md) — The CMS serves Holo's client.php,
  clientutils.php and unloadclient.php ported exactly, with the R26 .dcr on LibreShockwave; the game's addresses come
  from config.json, the external texts and variables from the client files, and Holo's other client settings become
  settings; a spike proves the client logs in first.
