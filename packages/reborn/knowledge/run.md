---
type: Go Package
title: Run
description: What reborn.Run serves, and when it refuses to start.
---

# Run

`reborn.New(cfg, db, c, h, i, g).Run(ctx)` serves the hotel until `ctx` ends
(`knowledge/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md`). The runner builds the programs and opens
the database ([Programs](programs.md)).

1. It checks the hotel is installed: somebody holds `housekeeping.accessGroups` in `db`. Otherwise it returns
   `ErrNotInstalled`. The installer replaces this refusal in platform 05; until then `Run` leaves the installer
   unmounted.
2. One `http.ServeMux`: the CMS at `/`, housekeeping at `/housekeeping/`.
3. `StartInfo` and `StartMus`: the game on `server.info` and `server.mus`.
4. An `http.Server` on `cfg.Reborn.Host:cfg.Reborn.Port`, `localhost:16416` by default, and one log line,
   `reborn on http://<addr>`.

When `ctx` ends, the HTTP server shuts down and `Run` returns nil. The game's listeners stay open until the process
ends; stopping in order is platform 10. `Run` leaves `db` open: the runner owns it.

Under reborn, `cms.host`, `cms.port`, `housekeeping.host` and `housekeeping.port` go unused.
