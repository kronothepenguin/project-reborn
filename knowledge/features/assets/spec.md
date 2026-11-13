---
type: Spec
title: Assets out of the repository
description: Every Habbo file leaves the repository and its history, and a tool fetches them, pinned, into ignored folders the programs serve from disk.
status: planned
projects: [tools, packages/cms, packages/housekeeping, packages/client-r26, packages/server]
---

# What

The repository and its releases hold only the project's own code
([0011](/decisions/reborn/0011-no-habbo-files-in-the-repository.md)).

The user: "i've thinking for so long about removing these assets from the repo and just create a tool that get assets
from h4bbo.net/archive/ including the dcr. this way we are not distributing habbo stuff and prevent problems of
copyrighted stuff."

# Behaviours

Written with the user when the feature is planned.

# Open questions

- The tool's form and name, and when it runs: `make install`, a release step, by hand.
- The files and the archive addresses, and how each is pinned.
- Where the files go, and how each program finds them: a `config.json` key, or a folder beside it.
- Whether the client's scripts are fetched or regenerated from the `.dcr` with LibreShockwave's extractor, and where the
  decompiled source goes (the client bundle's phase C1).
- What of Holo's sources and of HabboWidgets leaves the repository.
- How the hotel offers LibreShockwave's source to the players who receive its player (AGPL-3.0).
- The history rewrite: which paths, when, and the force-push to GitHub.
