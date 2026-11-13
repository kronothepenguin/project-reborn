---
type: Task
title: Spike: the R26 client logs in on LibreShockwave
description: LibreShockwave's player, built from the submodule, runs the user's habbo.dcr in a bare page with Holo's parameters and an SSO ticket, and the spike reports whether the client reaches the game server and logs in.
status: todo
slice: client
depends_on: []
packages: []
sources: ["source/holocms/client.php", "plans/client/reference/libreshockwave.md", "plans/server/reference/r26/hh_entry_init.md", "vendor/LibreShockwave"]
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
---

# Goal

Know whether the R26 client logs in on LibreShockwave before the client page is built
([0012](/decisions/0012-the-client-page-ports-holos-on-libreshockwave.md)): whether LibreShockwave runs the client's
login-key code, which the decompiled scripts show only as `-- unk26`
(`plans/client/phases/c1-client-page-on-libreshockwave.md`).

# Steps

- [ ] Build the player from `vendor/LibreShockwave` with `./build.sh --wasm --release` into a folder git ignores, and
  note the command, its time and its output files.
- [ ] Copy the client files from the main checkout's `packages/cms/public/r26/` (ignored, never committed,
  [0011](/decisions/0011-no-habbo-files-in-the-repository.md)) into the worktree's same folder.
- [ ] A throwaway page outside the repository's tracked files loads the player with `habbo.dcr` and Holo's parameters
  `sw1` to `sw9` (`source/holocms/client.php`): the game's info and mus hosts and ports, the external texts and
  variables, and an SSO ticket made with `packages/auth` for a habbo of a temporary hotel.
- [ ] The game server runs alone on that temporary hotel, on free ports (one program, so its own runner). The page is
  opened in Playwright's Chromium (`tests/e2e`'s), and the game's log shows how far the client goes: the handshake,
  `GENERATEKEY`, the SSO login, the hotel view.
- [ ] Write the findings here: what the client reached, screenshots kept in the scratchpad, the browser console's
  errors, and what the client page will need. Nothing of the spike is committed but this task file.

# Verification

The findings above, with the game server's log lines that prove each step.

# Notes

- Runs on the branch `client-01`.
- Needs Emscripten, which is not installed: the coordinator asks the user to install it (on Arch,
  `sudo pacman -S emscripten`) before the task starts.
- If the client never sends `GENERATEKEY`, the task is `blocked` with the findings, and the coordinator asks the user.
