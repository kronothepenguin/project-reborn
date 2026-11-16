---
type: Task
title: Port Holo's client page onto LibreShockwave
description: The CMS serves Holo's client page, utility page and unload page ported exactly, with LibreShockwave's player built from the submodule in place of Adobe's plugin, an SSO ticket, the game's addresses from config.json, and the wide screen and the loader as settings.
scope: [packages/cms, packages/settings, Makefile, .gitignore]
depends_on: []
skills: [applying-go-patterns, templating-astro-pages, building-astro-components, adding-svelte-interactivity, testing-behaviours, use-modern-go]
---

# Goal

A signed-in habbo opens the site's client page and the R26 client starts there
([0012](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md)). The behaviours of the spec:

- A signed-in habbo opens the client page: the R26 client runs on LibreShockwave's player and logs in to the game with
  the page's SSO ticket.
- A guest opens the client page: Holo's "please log in" page shows.
- The wide-screen setting is on, or the address says `wide=true`: the client is 960 by 540; otherwise 720 by 540.
- The loader setting is on: "opening <short name>..." shows while the client loads.
- A habbo opens the client page with a room to go to, and the room exists: the client opens in that room; an unknown
  room opens the hotel as usual.
- The client cannot connect: Holo's "Connection to <site name> failed." page shows, with the game's address and port.
- The client reports a fatal error: Holo's "Fatal Error" page shows.
- The client asks to reload: the page opens again with a fresh ticket.
- Anyone opens the client page: it names LibreShockwave with its licence and links to the source of the exact build.
- The player is built from `vendor/LibreShockwave` by a make target, into a folder git ignores.

# Context

- [Spec](/features/client/spec.md)
- [Plan](/features/client/plan.md)
- `source/holocms/client.php`, `source/holocms/clientutils.php`, `source/holocms/unloadclient.php` and
  `source/holocms/templates/client` (Latin-1 with CRLF: read them through `tr -d '\r' | iconv -f latin1 -t utf8`).
- [The client page ports Holo's, with LibreShockwave in place of Adobe's
  plugin](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md)
- [LibreShockwave](/sources/libreshockwave.md)
- The spike's findings: the player builds with `embuilder build zlib libjpeg` once, then
  `./build.sh --wasm --release --build-dir <ignored folder> -- -DLIBRESHOCKWAVE_REQUIRE_ZLIB=ON`, in about three
  minutes; its files are `libreshockwave-cpp-player.js`, `libreshockwave-cpp-worker.js`,
  `libreshockwave-cpp-wasm.js` and `libreshockwave-cpp-wasm.wasm`, loaded from one folder. The page passes Holo's
  `sw1` to `sw9` as the player's `params`, with `websocketPath` empty. The spike's page and its notes are in
  `/tmp/claude-1000/-mnt-media-Projects-habbo/5838a8a3-d542-499e-90bf-949c857d87fb/scratchpad/client-01/` while that folder lasts.
- The client's files are served at `/dcr/` by [client 04](/features/client/tasks/04-serve-the-clients-files.md): the
  page names `/dcr/habbo.dcr`, `/dcr/external_variables.txt` and `/dcr/external_texts.txt`.
- The game's info and mus hosts and ports come from `config.json`'s `server.info` and `server.mus`.
- The list of settings lives in `packages/settings`: this task declares the wide screen and the loader there, and it is
  the only task changing that list now.
- The root `Makefile` and `.gitignore` are shared files: this task is the one changing them now.

# Steps

- [ ] A make target builds the player from `vendor/LibreShockwave` into a folder of the CMS's `public/` that git
  ignores. It stops with a clear message when Emscripten or its two libraries are missing, and the setup notes of the
  root `README.md` say how to get them (`embuilder build zlib libjpeg`).
- [ ] The CMS's client page, utility page and unload page are Holo's, ported exactly
  ([holo-port 0034](/decisions/holo-port/0034-behaviour-matches-holo.md)), with the player in place of Adobe's plugin:
  signed-in only, an SSO ticket from `packages/auth`, and Holo's parameters.
- [ ] The wide screen and the loader become declared settings, with Holo's defaults.
- [ ] The page's line on LibreShockwave links to the commit of the submodule the player was built from.
- [ ] One test per behaviour of the goal that a router shows. The first behaviour, a client that logs in, is proven by
  hand in [the habbos exit check](/features/habbos/tasks/06-exit-check.md): say so in the report.
- [ ] Report the behaviours of the three Holo pages that the goal leaves out, as proposed spec lines.
- [ ] Update `packages/cms/knowledge`.

# Checks

```sh
make -C packages/cms check
make -C packages/settings check
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/cms`,
`packages/settings`.
