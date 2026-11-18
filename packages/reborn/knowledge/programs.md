---
type: Go Package
title: Programs
description: The runner builds the CMS, housekeeping, the installer and the game with their own constructors, injects the game into the CMS and housekeeping, and reborn.New takes them as arguments.
---

# Programs

reborn runs the programs its runner builds. `apps/reborn/cmd/reborn/main.go` opens the database and builds each program
with its own constructor and options, as the CMS's runner does:

```go
cfg := config.Get()
db := store.FromConfig()

c := cms.New(db, cms.WithResolver(cmsPages), cms.WithStatic(cmsFiles))
h := housekeeping.New(db, housekeeping.WithResolver(hkPages), housekeeping.WithStatic(hkFiles))
i, err := installer.New(ctx, db, installer.WithResolver(inPages), installer.WithStatic(inFiles))
g := server.New(db)

c.Inject(cms.Services{Habbos: g, Hotel: g})
h.Inject(housekeeping.Services{Habbos: g, Hotel: g})

r := reborn.New(cfg, db, c, h, i, g)
i.Inject(installer.Services{Listener: r})
if err := r.Run(ctx); err != nil {
	log.Fatalln(err)
}
```

- Each pair of pages and files comes from the package's `DistFS`: `astro.MakeFSResolver` and `http.FileServerFS` of its
  `dist/`. `apps/reborn/cmd/reborn-dev` builds the programs the same way, with each pair from the dev server of
  [Dev server](dev-server.md).
- The CMS is built first, so its automatic updates run before the game reads the database.
- The runner injects the game server, which satisfies `services.Habbos` and `services.Hotel`, into the CMS and
  housekeeping, after the constructors and before `reborn.New`: a look or motto saved on the site or in housekeeping
  reaches the game in the same process, and so do the questions of who is in the hotel and the start and the stop. `Run` mounts them, and `Mount` hands the router the services they hold then.
- `reborn.New(cfg, db, c, h, i, g)` takes what it requires as arguments. reborn has no option of its own.
- `installer.New` takes the runner's database, so the whole hotel works on one handle. In an empty folder
  `config.Get()` has written `config.json` with its defaults and `store.FromConfig()` has created the database, so every
  program is built before the hotel is installed.
- The runner injects reborn into the installer as its `Listener`, after `reborn.New` and before `Run` mounts it.
- A Ctrl-C ends the program with status 0; it ends with an error only when `Run` returns one.

# Tests

`TestMain` starts one installed hotel for the whole package, on free ports in a folder of its own, with the programs built
and injected as the runner does: `config.Get` loads `config.json` once per process. Each test makes habbos with names of
its own, unique across the test files.

`install_test.go` installs a new hotel in a process of its own: the test binary, started with `REBORN_TEST_NEW_HOTEL`
set, runs reborn in its working directory instead of the tests, until an interrupt. The folder holds only a
`config.json` with free ports. `habbos_test.go` speaks R26 to the game over a WebSocket with a small client of its own, since the game's test
client lives in the tests of `packages/server`.
