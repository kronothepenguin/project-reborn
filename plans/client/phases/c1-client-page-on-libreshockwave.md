---
type: Phase
title: C1 The client page on LibreShockwave
description: A signed-in habbo opens the CMS's client page, where the R26 .dcr runs on LibreShockwave with an SSO ticket and connects to the game server, and the .dcr is decompiled into a recent R26 source.
status: moved
moved_to: plans/reborn/slices/client.md
timestamp: 2026-11-13T00:42:05+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-06T15:50:54+00:00"}
tags: [c1, client]
---

Moved on 2026-11-13: this work is the slice `plans/reborn/slices/client.md`. Its scope and its open questions stand as
written here.

# Goal

A signed-in habbo opens the CMS's client page, and the R26 `.dcr` runs there in the browser on LibreShockwave, with
the SSO ticket and the parameters the page gives it, and connects to the game server
([0002](/decisions/0002-libreshockwave-first-then-javascript.md)). The `.dcr` is also decompiled with LibreShockwave
into a recent R26 source.

# Scope

| Part | Source |
| --- | --- |
| The R26 `.dcr` and its casts, which the user will add | the user |
| A recent R26 source, decompiled from them by LibreShockwave's asset extractor | `vendor/LibreShockwave` ([LibreShockwave](/reference/libreshockwave.md#the-decompiler)) |
| LibreShockwave's browser player | `vendor/LibreShockwave/web/` ([LibreShockwave](/reference/libreshockwave.md#the-browser-player)) |
| The client page, its utility page and its unload page | `source/holocms/client.php`, `source/holocms/clientutils.php`, `source/holocms/unloadclient.php`, `source/holocms/templates/client/` |
| The SSO ticket the page gives the client | `plans/holo-port/decisions/0013-defer-game-server-features.md`, the `sso_tickets` table |
| The parameters `sw1` to `sw9`: the game and MUS hosts and ports, the external variables and texts, the site, the ticket, the reload and error pages, and a room to go to | `source/holocms/client.php` |

- Holo's settings of the page, which holo-port deferred: `cms_system`'s `enable_sso`, `ip`, `port`, `texts`,
  `variables`, `dcr`, `reload_url`, `localhost` and `loader` (`plans/holo-port/reference/holo-database.md`), and the
  content setting `client-widescreen`, 960 by 540 pixels instead of 720 by 540.
- `clientutils.php` answers the keys `cacheCheck`, `connection_failed`, `error` and `LogInPlease`.

# Exit criteria

Written with the phase's tasks, once its open questions are answered.

# Tasks

Written when the phase starts.

# Open questions

- Where the `.dcr` and its `.cct` casts live in the repository, and whether git tracks them.
- Where the decompiled source goes, and whether it takes the place of the `.ls` scripts in
  `packages/client-r26/src/game/`, which the game server reads
  (`plans/server/decisions/0008-reverse-engineer-ls-only.md`), or sits beside them.
- Whether the player is built from the submodule with Emscripten (`./build.sh --wasm --release`) or taken from
  LibreShockwave's weekly prebuilt zip, and whether that happens in `make install`, in the release, or by hand.
- Which package serves the page, the player and the `.dcr` until [C2](/phases/c2-client-files.md)'s program exists.
- Whether the pages are Holo's `client.php`, `clientutils.php` and `unloadclient.php` ported exactly
  (`plans/holo-port/decisions/0034-behaviour-matches-holo.md`), with LibreShockwave in the place of Adobe's plugin.
- Which of Holo's settings stay settings, which give way to the game server's listeners
  (`plans/server/tasks/s0-04-listener-config.md`), and where `external_variables.txt` and `external_texts.txt` come
  from until C2.
- How the hotel offers LibreShockwave's source to the players whose browsers receive its player, since LibreShockwave is
  licensed under the AGPL-3.0 ([LibreShockwave](/reference/libreshockwave.md#licence)).
- Whether LibreShockwave runs the code behind the client's login key. Before it sends `GENERATEKEY`,
  `responseWithPublicKey` computes the key with handlers of `hh_entry_init`'s `9_Login Subscript.ls` and
  `10_Login Subscript 2.ls` and of `fuse_client`'s `83_JSBigInt.ls`, which the decompiled scripts show only as
  `-- unk26`, as they show `fuse_client`'s `84_JavaScript Proxy.ls`, through which the client calls the page's
  JavaScript (all in `packages/client-r26/src/game/`). LibreShockwave runs the `.dcr`'s bytecode, not the `.ls`
  scripts, so that code may still run there. If it does not, the client never sends `GENERATEKEY`
  (`plans/server/reference/r26/hh_entry_init.md`, The handshake).
