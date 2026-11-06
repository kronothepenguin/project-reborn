---
type: Task
title: Add LibreShockwave as a submodule
description: Add LibreShockwave as a git submodule at vendor/LibreShockwave, pinned at commit 3f90480, describe it, and point the game server's MUS framing task at it.
status: done
phase: c0
depends_on: []
packages: [vendor/LibreShockwave, .gitmodules]
sources: [vendor/LibreShockwave/README.md, vendor/LibreShockwave/web/libreshockwave-cpp-player.js, vendor/LibreShockwave/.github/workflows/nightly-wasm.yml]
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
verified:
  - {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
---

# Goal

LibreShockwave's source is in the repository, at the commit the plans read
([0003](/decisions/0003-libreshockwave-submodule.md)).

# Steps

- [x] `git submodule add https://github.com/LibreShockwave/LibreShockwave vendor/LibreShockwave`, checked out at
  `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b`.
- [x] [LibreShockwave](/reference/libreshockwave.md) describes what it holds, its player, its decompiler, its licence
  and who reads it.
- [x] `plans/server/tasks/s1-24-mus-framing.md` reads the submodule instead of a clone of its own.

# Verification

```sh
git submodule status vendor/LibreShockwave
git -C vendor/LibreShockwave rev-parse HEAD
git config -f .gitmodules --get submodule.vendor/LibreShockwave.url
```

Results (2026-11-06):

- `git submodule status vendor/LibreShockwave`: ` 3f9048009ff4bc9bf4bedb4a44f875c2ab36645b vendor/LibreShockwave
  (debugger-20260810-032921-104-g3f904800)`.
- `git -C vendor/LibreShockwave rev-parse HEAD`: `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b`, also the `master` of
  `git ls-remote` that day.
- `.gitmodules`: `https://github.com/LibreShockwave/LibreShockwave`.
- Every path [LibreShockwave](/reference/libreshockwave.md) names exists in the submodule, and what it says matches the
  source: `the productVersion` is `"10.1"` (`cpp/src/player/movie_properties.cpp:231`), the Multiuser Xtra handles
  `connectToNetServer` (`cpp/src/lingo/xtra/multiuser_xtra.cpp:133`), the worker opens a `WebSocket` on
  `${scheme}://${host}:${port}${websocketPath}` (`web/libreshockwave-cpp-worker.js:465`, `:520`), and the extractor is
  `cpp/apps/tools/asset_extractor.cpp`.

# Notes

- The main checkout gets the folder's files with `git submodule update --init vendor/LibreShockwave` once this
  reaches `main`.
