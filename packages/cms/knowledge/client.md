---
type: Reference
title: The client page
description: How the CMS serves Holo's client.php, clientutils.php and unloadclient.php, with LibreShockwave's player built by make player in place of Adobe's plugin, and the client's folder at /dcr/.
---

# Routes

| Route | Holo's file | Handler |
| --- | --- | --- |
| `GET /client` | `client.php` | `HandleClientView` in `internal/router/client.go` |
| `GET /client/utils?key=` | `clientutils.php` | `HandleClientUtilsView` in `internal/router/client_utils.go` |
| `POST /client/unload` | `unloadclient.php` | `HandleClientUnload` in `internal/router/client_unload.go` |
| `GET /dcr/external_variables.txt` | | `HandleExternalVariablesText` in `internal/router/dcr_external_variables.go` |
| `GET /dcr/external_texts.txt` | | `HandleExternalTextsText` in `internal/router/dcr_external_texts.go` |
| `GET /dcr/` | | `HandleDCRFile` in `internal/router/dcr.go` |

- A guest who opens `/client` goes to `/client/utils?key=LogInPlease`. `/client/utils` shows a guest the sign-in page
  whatever the key.
- A habbo gets `true` for the keys `cacheCheck` and `cache`, Holo's pages for `connection_failed` and `error`, and an
  empty answer for any other key.
- `/client/unload` answers a habbo with nothing and sends a guest to `/`. The page calls it with `sendBeacon` as it
  closes.

# The page

- The page passes Holo's `sw1` to `sw9` to the player as `params`, in `#client-params`, and the movie's address in
  `#clientembed`'s `data-movie`. The addresses start with `site.url`, and the client's files are at `/dcr/`.
- `sw2` and `sw3` come from `config.json`'s `server.info` and `server.mus`. A visitor from `127.0.0.1` gets
  `127.0.0.1` as the info host, as Holo's `$ip` did.
- `sw8` carries `auth.SSOTicket`: the game spends it at login, so the reload address, `/client?x=reauthenticate`,
  gets a fresh one.
- `sw9`, `forward.id`, is there when the address holds `roomId` and `forwardId=2` and the room exists.
- The client is 960 by 540 when the address says `wide=true`, or holds no `wide` while `features.clientWideScreen` is
  on; otherwise 720 by 540. The top bar's width follows the setting alone, as Holo's `body.wide` did.
- `features.clientLoader` shows "opening <short name>..." until the player has loaded the movie.
- The player follows the client's connection failed, fatal error and reload addresses itself, with the window's
  location.
- The island `client/hotel-client` holds what Holo's `habboclient.js` did: the top bar on a screen taller than 600
  pixels, the window fitted when the site opened it, Close Hotel, the window's name `client`, and the unload call.

# Enter

- The community layout's header gives a signed-in habbo Holo's `Enter <site name>`
  (`header/enter-hotel.astro`), a link to `/client` aimed at the window named `client`. A guest's header keeps
  `<site name> is offline`.
- The island `client/open-client` holds Holo's `openOrFocusHabbo`: a click on a link aimed at `client` opens that
  window with Holo's features, 980 by 597, or 740 by 597 with `wide=false` on a screen narrower than 990 pixels. A
  window that already shows `/client` comes forward without loading again.

# The player

- `make player` at the root builds LibreShockwave's player from `vendor/LibreShockwave` with Emscripten, in
  `tmp/libreshockwave`, and copies its four files to `public/libreshockwave/`, which git ignores. It stops with a
  message when the submodule, Emscripten or its `zlib` and `libjpeg` are missing.
- It writes `public/libreshockwave/source.txt`, the address of the commit it built. `client.astro` reads it at build
  time and links the page's LibreShockwave line to it, or to the repository before the player is built.
- Astro copies `public/` into `dist/`, so the CMS embeds the player once it is built.

# The client's files

- `/dcr/` serves `<assets.path>/dcr/` of `config.json` (`packages/assets/knowledge/assets.md`) with `http.FileServerFS`.
  The handler opens the folder as an `os.Root` on each request, so a path or a link never leaves it, and files added
  while the CMS runs are served at once.
- A missing file, a folder, a link out of the folder and a missing assets folder answer 404. No folder is listed.
- The folder stands outside the middleware chain, as the static files do.
- `/dcr/external_variables.txt` and `/dcr/external_texts.txt` are written from the database by `dcr.Variables` and
  `dcr.Texts` (`packages/assets/knowledge/dcr.md`), with `site.url`, `site.shortName` and `game.clientVersion` read on
  each request. They answer `text/plain; charset=utf-8`, and files of those names in the folder are never served.
- The two written files keep `router.UpdateFailed` and the session layers of the chain, and skip the ban and
  maintenance checks.
