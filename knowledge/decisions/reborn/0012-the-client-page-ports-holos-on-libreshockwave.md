---
type: Decision
title: The client page ports Holo's, with LibreShockwave in place of Adobe's plugin
description: The CMS serves Holo's client.php, clientutils.php and unloadclient.php ported exactly, with the R26 .dcr on LibreShockwave; the game's addresses come from config.json, the external texts and variables from the client files, and Holo's other client settings become settings; a spike proves the client logs in first.
status: accepted
timestamp: 2026-11-13T15:20:00-05:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-13T15:20:00-05:00"}
tags: [client, cms, libreshockwave]
---

# Decision

- The CMS serves the client page: Holo's `client.php`, `clientutils.php` and `unloadclient.php` ported exactly
  (`knowledge/decisions/holo-port/0034-behaviour-matches-holo.md`), with LibreShockwave's player running the R26 `.dcr`
  in place of Adobe's plugin, and the SSO ticket the page gives the client.
- The game's hosts and ports the page passes come from `config.json`, `server.info` and `server.mus`. The external
  texts and variables come from the client files. Holo's other settings of the page (the reload address, the loader,
  the wide screen) become settings.
- A spike comes first: the `.dcr` on LibreShockwave's player logs in to the game server, which tells whether
  LibreShockwave runs the client's login-key code
  (`plans/client/phases/c1-client-page-on-libreshockwave.md`, the last open question).
- How the hotel offers LibreShockwave's source to players waits for the assets slice (`plans/reborn/slices/assets.md`).

# Context

The user chose "Port Holo's pages" for the client page. The `.dcr`, its casts, the external texts and variables and the
figure files are in `packages/cms/public/r26/`, which the user added
([0011](/decisions/reborn/0011-no-habbo-files-in-the-repository.md)).

# Consequences

- Answers the client page's questions of `plans/client/phases/c1-client-page-on-libreshockwave.md` about where the
  files live, which package serves the page, how the player is built, whether the pages are Holo's, and where its
  settings come from. Where the decompiled source goes is the assets slice's.
