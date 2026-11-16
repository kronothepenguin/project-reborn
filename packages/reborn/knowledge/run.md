---
type: Go Package
title: Run
description: What reborn.Run serves, in which order it builds the programs, and when it refuses to start.
---

# Run

`reborn.New(opts...).Run(ctx)` serves the hotel of the working directory until `ctx` ends
(`knowledge/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md`).

1. It checks the hotel is installed: `config.json` exists, and somebody holds `housekeeping.accessGroups`. Otherwise it
   returns `ErrNotInstalled`, which names what is missing. The installer replaces this refusal in platform 05.
2. `config.Load`, then one `store.Open` of `store.path`. The CMS, housekeeping and the game server share this `*sql.DB`.
3. `cms.New`, `housekeeping.New` and `server.New`, in that order, so that the CMS's automatic updates run before the
   game reads the database.
4. One `http.ServeMux`: the CMS at `/`, housekeeping at `/housekeeping/`.
5. `StartInfo` and `StartMus`: the game on `server.info` and `server.mus`.
6. An `http.Server` on `reborn.host:reborn.port`, `localhost:16416` by default, and one log line,
   `reborn on http://<addr>`.

When `ctx` ends, the HTTP server shuts down and `Run` returns nil. The game's listeners stay open until the process
ends; stopping in order is platform 10.

Under reborn, `cms.host`, `cms.port`, `housekeeping.host` and `housekeeping.port` go unused.
