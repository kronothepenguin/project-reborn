---
type: Plan
title: "The client in the browser: how"
description: The CMS ports Holo's client page onto LibreShockwave and serves the client's folder; packages/assets/dcr keeps the variables and texts in the database; housekeeping and the installer import them.
---

# Architecture

Built:

| Project | Part |
| --- | --- |
| `packages/server` | The info and mus listeners take TCP and WebSocket connections |
| `packages/assets` | A new module, the shared package for everything about assets. Its first part is `packages/assets/dcr`: it copies `external_variables.txt` and `external_texts.txt` into the database and writes them out for the client |
| `packages/store` | The tables `dcr_variables` and `dcr_texts` and their queries |
| `packages/config` | `assets.path`, the assets folder, `assets` by default |
| `packages/cms` | The client page, its utility and unload pages; `/dcr/`, the client's folder and the two written files; the make target that builds the player |
| `packages/settings` | The page's settings: the wide screen and the loader |
| `packages/housekeeping`, `packages/auth` | The "Import client files" action and the attribute `housekeeping.dcr` |
| `packages/installer` | Imports the two files of a new hotel |
| `vendor/LibreShockwave` | The player's source, built with Emscripten |

Later, in `packages/assets`: `packages/assets/astro` (today's `packages/astro`, moved) and `packages/assets/download`
(the downloader with checksums), with [the assets feature](/features/assets/spec.md).

The client's reference documents are [LibreShockwave](/sources/libreshockwave.md) and
`packages/client-r26/knowledge/client-r26.md`.

# Decisions

- [No Habbo files in the repository; a tool fetches them](/decisions/reborn/0011-no-habbo-files-in-the-repository.md) —
  Sulake's files, from the client's .dcr and casts to images and decompiled scripts, leave the repository and its
  history; a tool fetches them, pinned, into ignored folders, and the programs serve them from disk; LibreShockwave
  stays a submodule and its player is built from it.
- [The client page ports Holo's, with LibreShockwave in place of Adobe's
  plugin](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md) — The CMS serves Holo's client.php,
  clientutils.php and unloadclient.php ported exactly, with the R26 .dcr on LibreShockwave; the game's addresses come
  from config.json, the external texts and variables from the client files, and Holo's other client settings become
  settings; a spike proves the client logs in first.
- The spike of 2026-11-15 proved the client page: the R26 client logs in on LibreShockwave and reaches the hotel view.
  It needs `embuilder build zlib libjpeg` once, the build flag `-DLIBRESHOCKWAVE_REQUIRE_ZLIB=ON`, external variables
  that point at files that exist, and a client version equal to the game's setting.
- The page comes first, editing next. The user chose "The page first, editing next": step one is the page with the
  variables and texts served by Go; step two is the housekeeping pages that edit them.
- The CMS serves the client's files. The user chose "The CMS" over a program of its own.
- The assets sit in a folder beside `config.json`, named in it: `assets.path`, `assets` by default. The client's folder
  is `assets/dcr/`, served at `/dcr/`. The user chose "A folder beside `config.json`, named in it" and "`assets/dcr/`
  served at `/dcr/`".
- `packages/assets` holds everything about assets. The user: "`packages/assets`: the shared package to manage
  everything about assets - `packages/assets/dcr`: everything about dcr, .dcr, .cct, external variables & texts .txt,
  four .xml - `packages/assets/astro`: move the current `packages/astro` because that has helpers for dev vs prod
  script assets - `packages/assets/downloader` or `packages/assets/download`: the downloader helper", and "for me
  "dcr" is all the .cct, .dcr, external variables & texts, the xml (that i eventually want to modify in housekeeping
  the same way as the external variables & texts)". Images such as `c_images` are plain assets: files in the folder.
- The assets are downloaded at installation and served with `http.FileServer`, and an administrator may provide their
  own. The user: "it would be better to download assets during installation, this way we can allow the user to provide
  their own assets, making it scalable and customizable."
- The variables and texts live in the database, in `dcr_variables` and `dcr_texts`. The user chose "Everything lives
  in the database": the files are where the rows come from, and the client is served from the rows.
- The installer imports them for a new hotel, and housekeeping has an "Import client files" action for a hotel that
  exists and for a newer client file. The user chose "The installer, plus an action in housekeeping". The action takes
  a new attribute, `housekeeping.dcr`.
- Go always writes ten lines of the variables: the nine addresses (`external.figurepartlist.txt` and its `.secure`,
  `figure.draworder.xml` and its `.secure`, `figure.animation.xml`, `figure.partsets.xml`, `dynamic.download.url`,
  `image.library.url`, `private.image.library.url`) from the hotel's address, and `client.version.id` from
  `game.clientVersion`. The user chose "Go always writes them".
- The word "Habbo" of the texts, with "Habbos" and "Habbo's", is written as the hotel's short name when the file is
  served; a longer word that starts with it ("Habboween", "Habbowood", "Habbolympic") stays, so the texts match the
  pictures that carry those names. The user first chose "Every "Habbo"", saw the result on the real texts, and then
  chose "Whole words only": "I'm ok leave as habboween, habbowood and so on, because we also have images with these
  kind of text, but at the same time i want the system to use the hotel name the user decided". The rows keep the
  original words. The user chose "Every "Habbo"", and on the shape: "you might need hotel for Texts too, some of the texts of
  the hotel have even "habbo" or "holo", the site name."
- The shape of `packages/assets/dcr`, shown to the user:

  ```go
  func Import(ctx context.Context, q *store.Queries, files fs.FS) error

  type Hotel struct {
      URL       string // the site's address
      ShortName string // the site's short name
      Version   int    // game.clientVersion
  }

  func Variables(ctx context.Context, q *store.Queries, hotel Hotel) ([]byte, error)
  func Texts(ctx context.Context, q *store.Queries, hotel Hotel) ([]byte, error)
  ```

- The client page links to LibreShockwave's source: a line on the page names the player and its AGPL-3.0 licence and
  links to the commit it was built from. The user chose "A link on the client page".
- The Emscripten libraries are a step of the setup notes; the make target fails with a clear message without them.
  The user chose "The setup notes say to run it".
