---
type: Slice
title: Assets out of the repository
description: Every Habbo file leaves the repository and its history, and a tool fetches them, pinned, into ignored folders the programs serve from disk.
status: planned
projects: [tools, cms, housekeeping, client, server, repository]
depends_on: []
from: []
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [assets, repository, client]
---

# Goal

The repository and its releases hold only the project's own code
([0011](/decisions/0011-no-habbo-files-in-the-repository.md)).

The user: "i've thinking for so long about removing these assets from the repo and just create a tool that get assets
from h4bbo.net/archive/ including the dcr. this way we are not distributing habbo stuff and prevent problems of
copyrighted stuff."

# Scope

| Part | What |
| --- | --- |
| A tool | Fetches each file, pinned by address and checksum, into ignored folders |
| The programs | Serve Habbo's images and the client files from disk instead of embedding them |
| The client's scripts | `packages/client-r26/src/game/`, which the game server's protocol work reads (`plans/server/decisions/0008-reverse-engineer-ls-only.md`), fetched or regenerated |
| Holo's sources | `source/holocms` and `source/holoemu`, where they carry Habbo's images |
| The history | Rewritten once without the files, and pushed with force |

# Exit criteria

Written with the slice's tasks, once its open questions are answered.

# Tasks

Written when the slice starts.

# Open questions

- The tool's form and name, and when it runs: `make install`, a release step, by hand.
- The files and the archive addresses, and how each is pinned.
- Where the files go, and how each program finds them: a `config.json` key, or a folder beside it.
- Whether the client's scripts are fetched or regenerated from the `.dcr` with LibreShockwave's extractor, and where the
  decompiled source goes (`plans/client/phases/c1-client-page-on-libreshockwave.md`).
- What of Holo's sources and of HabboWidgets leaves the repository.
- How the hotel offers LibreShockwave's source to the players who receive its player (AGPL-3.0).
- The history rewrite: which paths, when, and the force-push to GitHub.
