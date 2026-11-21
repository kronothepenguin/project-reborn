---
type: Reference
title: Rules of a run
description: How a run of the browser suites keeps clear of development servers and what makes a suite fail.
---

# Rules

- A run builds the CMS, housekeeping, the installer, the game server and reborn.
- The CMS, housekeeping and the game server's `info`, `mus` and `/api/` listen on free ports, so a run does not disturb
  a development server. The run writes the game server's ports into the hotel's `config.json`, under `server.info`,
  `server.mus` and `server.api`, and the CMS and housekeeping find its `/api/` there.
- The game server starts first in every suite with an installed hotel, and stops with the other programs.
- reborn listens on the port its hotel's `config.json` names under `reborn.port`. The `reborn` suite writes a free port
  there, with the game's, before reborn starts, and the installer moves it to another.
- The installer's port, 17306, is baked in its runners. A run refuses to start while it is busy, and it never talks to
  a server it did not start.
- The runner passes everything to the suites as arguments, the helpers of their default export.
- Each suite gets a fresh copy of the installed hotel.
- The suites read the database with `node:sqlite`.
- A program has started once its ports listen. The game server's are its `/api/`, `info` and `mus`; while the hotel's
  `game.closed` or `site.maintenance` is on, the game keeps `info` and `mus` closed, and its `/api/` alone counts.
- A suite fails if a program logs anything beyond its start-up lines and the lines its `logs` export expects. The game
  server's start-up lines name its `/api/`, `info` and `mus` listeners, or say that the hotel is closed and its doors
  stay closed. reborn's start-up line is `reborn on http://...`, and the game inside it logs the game server's lines.
- Screenshots and server logs stay in `.run/`, which is git-ignored.
