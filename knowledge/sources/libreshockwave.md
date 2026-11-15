---
type: Reference
title: LibreShockwave
description: What LibreShockwave in vendor/LibreShockwave holds, its browser player, its decompiler and its licence, and which plan reads it for what.
timestamp: 2026-11-06T15:50:54+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [sources, libreshockwave]
---

# What it is

- A C++20 project that reads Director and Shockwave files (`.dir`, `.dxr`, `.dcr`, `.cct`, `.cst`) and plays them. It
  calls itself "An open-source SDK, decompiler and web player for Adobe/Macromedia Shockwave".
- A git submodule at `vendor/LibreShockwave`, pinned at `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b`
  ([0003](/decisions/client/0003-libreshockwave-submodule.md)). A fresh worktree runs
  `git submodule update --init vendor/LibreShockwave` before reading it.

# Layout

| Path | What it holds |
| --- | --- |
| `cpp/` | The library (`cpp/include/`, `cpp/src/`), the programs (`cpp/apps/tools/`, `cpp/apps/wasm/`) and the tests (`cpp/tests/`) |
| `cpp/src/player/xtra/queued_multiuser_bridge.cpp` | The Multiuser Xtra, which frames the client's `#mus` connection (`knowledge/decisions/server/0015-client-on-libreshockwave.md`) |
| `cpp/src/player/movie_properties.cpp` | `the productVersion`, which it reports as `"10.1"` |
| `web/` | The browser player's page and scripts: `index.html`, `libreshockwave-cpp-player.js`, `libreshockwave-cpp-worker.js` and `test-harness.html` |
| `debugger/` | The Qt desktop debugger |
| `docs/` | Adobe's Director manuals, as PDF and as text |
| `build.sh`, `CMakeLists.txt`, `cmake/` | The build |

# The browser player

- `./build.sh --wasm --release` builds it with Emscripten into `cmake-build-wasm/cpp/wasm-dist/`: `index.html`,
  `libreshockwave-cpp-player.js`, `libreshockwave-cpp-worker.js`, `libreshockwave-cpp-wasm.js` and
  `libreshockwave-cpp-wasm.wasm`. Native builds need CMake 3.20, a C++20 compiler and zlib, and `./build.sh --deps`
  prints the packages of the machine's Linux distribution.
- A weekly workflow (`.github/workflows/nightly-wasm.yml`) publishes the same files as a zip in the GitHub release
  `nightly`.
- The page gives the player the movie's address (`url`), its parameters (`params`, the `sw1` to `sw9` that Holo's
  client page gave Adobe's plugin) and the WebSocket path (`websocketPath`). The player's own defaults are a Habbo
  client's parameters.
- Each `connectToNetServer` of the movie opens one WebSocket, `ws(s)://<host>:<port><websocketPath>`.

# The decompiler

`libreshockwave_asset_extractor <files> <output>` writes, for each Director file, its `manifest.tsv` and
`file_info.tsv`, its bitmaps, texts, sounds, palettes and raw chunks, and `scripts/`: decompiled Lingo (`.ls`) and
bytecode listings (`.lsasm`).

# Licence

GNU Affero General Public License v3.0 (`vendor/LibreShockwave/LICENCE`). Besides the GPL's terms, it asks that people
who use a modified version over a network can get its source.

# Who reads it

| Reader | For |
| --- | --- |
| The game server | The `#mus` framing only |
| [The client feature](/features/client/spec.md) | The browser player and the decompiler |
