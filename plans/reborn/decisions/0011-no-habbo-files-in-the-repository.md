---
type: Decision
title: No Habbo files in the repository; a tool fetches them
description: Sulake's files, from the client's .dcr and casts to images and decompiled scripts, leave the repository and its history; a tool fetches them, pinned, into ignored folders, and the programs serve them from disk; LibreShockwave stays a submodule and its player is built from it.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [assets, client, repository]
---

# Decision

- No file of Habbo's goes into the repository: the client's `.dcr` and casts, its external texts and variables, figure
  data, images, the decompiled scripts, and Holo's sources where they carry Habbo's images.
- A tool fetches them from an archive such as h4bbo.net/archive/, each file pinned by its address and checksum, into
  folders git ignores. The programs serve them from disk instead of embedding them.
- The history is rewritten once to remove them, and pushed with force. That is the work of [the assets
  slice](/slices/assets.md).
- Until then, the client files the user copied to `packages/cms/public/r26/` stay there, ignored by git.
- LibreShockwave is open-source code, not Habbo's, and stays a submodule: its pinned source is what is read and what its
  AGPL-3.0 licence obliges the hotel to offer players. Its player is built from that submodule with Emscripten
  (`./build.sh --wasm --release`) by a make target.
- HabboWidgets falls under the rule if it carries Habbo's images.

# Context

The user: "i'm wondering about adding it to git or create a "downloader" tool. we already have habbo assets in our repo,
but i've thinking for so long about removing these assets from the repo and just create a tool that get assets from
h4bbo.net/archive/ including the dcr. this way we are not distributing habbo stuff and prevent problems of copyrighted
stuff. [...] if you think it is better to have copyrighted files out of the repo, then the downloader tool is the way to
go as well as ignore assets. we end up rewriting full repo history." And: "i would prefer to have a strong opinion over
assets. either have all of them in the repo, or have none of them and create a tool to build it up."

The user chose "None, a tool fetches them" and, for the player, "Build from the submodule".

# Consequences

- A takedown over Sulake's files would remove the whole repository; releases would otherwise carry Habbo's images in
  every binary, since the CMS embeds its built `public/` folder.
- Every commit id changes once the history is rewritten; open worktrees and branches are made again from the new
  history.
- The game server's protocol keeps being read from the client's scripts
  (`plans/server/decisions/0008-reverse-engineer-ls-only.md`), which the tool fetches or regenerates.
