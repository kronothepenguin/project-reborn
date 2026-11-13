---
type: Task
title: "Spike: the R26 client logs in on LibreShockwave"
description: LibreShockwave's player, built from the submodule, runs the user's habbo.dcr in a bare page with Holo's parameters and an SSO ticket, and the spike reports whether the client reaches the game server and logs in.
scope: []
depends_on: []
skills: []
---

# Goal

Know whether the R26 client logs in on LibreShockwave before the client page is built
([0012](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md)): whether LibreShockwave runs the
client's login-key code, which the decompiled scripts show only as `-- unk26` (the client bundle's phase C1).

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `source/holocms/client.php`
- [LibreShockwave](/sources/libreshockwave.md)
- `packages/server/knowledge/r26/hh_entry_init.md`
- `vendor/LibreShockwave`
- [The client page ports Holo's, with LibreShockwave in place of Adobe's
  plugin](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md)
- Needs Emscripten, which is not installed: the master asks the user to install it (on Arch,
  `sudo pacman -S emscripten`) before the task starts.
- If the client never sends `GENERATEKEY`, the slave stops and reports the findings, and the master asks the user.

# Steps

- [ ] Build the player from `vendor/LibreShockwave` with `./build.sh --wasm --release` into a folder git ignores, and
  note the command, its time and its output files.
- [ ] Copy the client files from the main checkout's `packages/cms/public/r26/` (ignored, never committed,
  [0011](/decisions/reborn/0011-no-habbo-files-in-the-repository.md)) into the worktree's same folder.
- [ ] A throwaway page outside the repository's tracked files loads the player with `habbo.dcr` and Holo's parameters
  `sw1` to `sw9` (`source/holocms/client.php`): the game's info and mus hosts and ports, the external texts and
  variables, and an SSO ticket made with `packages/auth` for a habbo of a temporary hotel.
- [ ] The game server runs alone on that temporary hotel, on free ports (one program, so its own runner). The page is
  opened in Playwright's Chromium (`tests/e2e`'s), and the game's log shows how far the client goes: the handshake,
  `GENERATEKEY`, the SSO login, the hotel view.
- [ ] Write the findings in the report: what the client reached, screenshots kept in the scratchpad, the browser
  console's errors, and what the client page will need. Nothing of the spike is committed but the removal of this task
  file.

# Checks

The findings in the report, with the game server's log lines that prove each step.
