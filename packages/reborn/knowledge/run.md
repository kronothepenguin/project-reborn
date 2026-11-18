---
type: Go Package
title: Run
description: What reborn.Run serves on an installed hotel and on a new one, how Move takes the hotel to a new address, and when the installer goes.
---

# Run

`reborn.New(cfg, db, c, h, i, g).Run(ctx)` serves the hotel until `ctx` ends
(`knowledge/decisions/reborn/0003-reborn-runs-the-hotel-in-one-process.md`,
`knowledge/decisions/reborn/0004-the-installer-inside-reborn.md`). The runner builds the programs, opens the database
and injects reborn into the installer as its `Listener` ([Programs](programs.md)).

1. `installer.Installed(ctx, db)` tells whether somebody holds `housekeeping.accessGroups`.
2. One `http.ServeMux`: the CMS at `/`, housekeeping at `/housekeeping/`. A hotel that is not installed gets the
   installer at `/installer/` too; an installed one never mounts it.
3. Installed: the game's `Start` opens its doors on `server.info` and `server.mus`, unless `game.closed` or
   `site.maintenance` is on; then they stay closed, and the rest of the hotel runs. Not installed: the game waits for
   `(*Installer).Done()`, then starts, and reborn logs the absolute paths of `config.json` and the database.
4. An `http.Server` on `cfg.Reborn.Host:cfg.Reborn.Port`, `localhost:16416` by default, and one log line: `reborn on
   http://<addr>`, or `reborn installs a new hotel on http://<addr>/installer/`.

A middleware in front of the mux reads `Done()` on each request:

- Before the administrator exists, a request outside `/installer/` asks the mux which pattern takes it
  (`(*http.ServeMux).Handler`). A route a program registered redirects to `/installer/` with 303. A request that falls
  to a static handler, the CMS's `/` or housekeeping's `/housekeeping/`, is served: the sites' files, and the dev
  server's own paths under `reborn-dev`.
- From then on, `/installer` and every path under `/installer/` answer 404, from the first request on an installed hotel
  and from the request after "Create administrator" on a new one.

When `ctx` ends, the HTTP server shuts down and `Run` returns nil. A listener that fails, or the game failing to start
after the install, ends `Run` with its error. The game's listeners stay open until the process ends; stopping in order
is platform 10. `Run` leaves `db` open: the runner owns it.

Under reborn, `cms.host`, `cms.port`, `housekeeping.host` and `housekeeping.port` go unused.

# Move

`Move(w, r, host, port)` implements `installer.Listener`:

1. It listens on `host:port`. An error goes back to the installer's form, and the hotel stays where it was.
2. The same handler serves the new listener.
3. It redirects the browser with 303 to the same path on the new address. With host `0.0.0.0` or `::`, the browser
   keeps its own host name.
4. The old server shuts down in the background: it closes its listener at once and ends after the response.

On the same port, a new address that covers the old one, such as `0.0.0.0` over `localhost`, cannot be bound while the
old one listens. On `EADDRINUSE` with the same port, the old server lets go of its listener first, then the new address
is bound; when that fails, the old address is served again and the error goes back to the form.

`config.Get()` keeps the address reborn started on; the installer saves the new one with `config.SaveReborn`.
