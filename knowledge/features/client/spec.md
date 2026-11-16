---
type: Spec
title: The client in the browser
description: A signed-in habbo opens the site's client page, where the R26 client runs on LibreShockwave; the CMS serves the client's files from the assets folder and its variables and texts from the database; later staff edit them, and the client runs in vanilla JavaScript.
status: active
projects: [packages/cms, packages/housekeeping, packages/installer, packages/assets, packages/store, packages/config, packages/settings, packages/auth, vendor/LibreShockwave]
---

# What

The game server takes the R26 client's connections over TCP and WebSocket.

Next:

The R26 client reaches the player's browser. The `.dcr` runs on LibreShockwave in the site's client page
([0012](/decisions/reborn/0012-the-client-page-ports-holos-on-libreshockwave.md)). The CMS serves the client's files
from the assets folder, and the client's variables and texts from the database. It comes first for
[the habbos feature](/features/habbos/spec.md).

After that staff edit the variables, the texts and the four XMLs in housekeeping, and later the client runs in vanilla
JavaScript ([client 0002](/decisions/client/0002-libreshockwave-first-then-javascript.md)).

# Behaviours

- A client connects over TCP or a WebSocket: bytes travel both ways, text frames carry their bytes, and a close on
  either side ends the session.
- A WebSocket without an Origin header connects: it is refused.

## Next

The client page:

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

The client's files:

- The client asks for a file of its folder (the `.dcr`, a cast, a furni, an XML): the CMS serves it from `assets/dcr/`
  of the folder `config.json` names, at `/dcr/`.
- The client asks for `/dcr/external_variables.txt`: it gets the stored variables, with the nine addresses pointing at
  this hotel and the client version equal to the game's setting.
- The client asks for `/dcr/external_texts.txt`: it gets the stored texts, with every "Habbo" written as the hotel's
  short name.

Importing:

- Staff with `housekeeping.dcr` press "Import client files": the database holds exactly the variables and texts of the
  two files in the folder.
- The folder lacks one of the two files: the import is refused, names the missing file, and the database stays as it
  was.
- A new hotel is installed while the folder holds the two files: the installer imports them.

# Open questions

Editing in housekeeping, the step after the client page:

- How the pages list, search and edit 140 variables and 5,518 texts.
- What an import does with rows staff changed, when a newer client file arrives.
- How the four XMLs are edited.

The JavaScript client:

- How it relates to `packages/client-r26` and `packages/director`, the translation of the client's scripts and the
  Director runtime the repository holds: whether it carries them on or starts again.
- Which source it is made from: the recent decompile of the client bundle's phase C1, or the `.ls` scripts of
  `packages/client-r26/src/game/`.
- What "vanilla" rules out: frameworks, a build step, or both.
- Whether the page changes to it at once, or offers both clients for a while.

The rest:

- Downloading the client's files at installation, and where the decompiled source goes, are
  [the assets feature](/features/assets/spec.md)'s.
