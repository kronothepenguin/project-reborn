---
type: Task
title: Hand reborn the programs its runner builds
description: reborn's main.go builds the CMS, housekeeping, the installer and the game with their own constructors, and reborn.New(cfg, db, c, h, i, g) mounts them on one HTTP server and starts the game; the Site options go.
scope: [packages/reborn, apps/reborn]
depends_on: []
skills: [applying-go-patterns, testing-behaviours, documenting-with-okf, use-modern-go]
---

# Goal

reborn has the shape the user chose ([Plan](/features/platform/plan.md), the decision "reborn runs the programs its
runner builds"). The behaviour of the spec stays, with its test:

- reborn starts in the folder of an installed hotel: the site answers at `/`, housekeeping at `/housekeeping/` and the
  game on its two ports, on the address of the `reborn` section.

# Context

- [Spec](/features/platform/spec.md)
- [Plan](/features/platform/plan.md)
- `packages/reborn/knowledge/index.md`: what task 03 built.
- `apps/cms/cmd/cms/main.go`: the model of a production runner.
- `.agents/skills/applying-go-patterns/SKILL.md`, its Design list: two runners, options only for the static handler
  and the page resolver, what a package requires is an argument.

# Steps

- [ ] `apps/reborn/cmd/reborn/main.go` takes the shape the user approved:

  ```go
  cfg := config.Get()
  db := store.FromConfig()

  c := cms.New(db, cms.WithResolver(cmsPages), cms.WithStatic(cmsFiles))
  h := housekeeping.New(db, housekeeping.WithResolver(hkPages), housekeeping.WithStatic(hkFiles))
  i := installer.New(installer.WithResolver(inPages), installer.WithStatic(inFiles))
  g := server.New(db)

  r := reborn.New(cfg, db, c, h, i, g)
  log.Fatalln(r.Run(ctx))
  ```

  Each pair of pages and files comes from the package's `DistFS`, as the CMS's runner builds its own. The CMS is built
  first, so its automatic updates run before the game reads the database.
- [ ] `reborn.New(cfg, db, c, h, i, g)` takes what it requires as arguments. `Site`, `Option`, `WithCMS`,
  `WithHousekeeping` and `WithInstaller` go. `Run(ctx)` mounts the CMS and housekeeping on one mux, starts the game's
  listeners and serves on the address of `cfg.Reborn`.
- [ ] A hotel where nobody holds `housekeeping.accessGroups` still stops with the error of task 03, a stopgap with no
  test: [platform 05](/features/platform/tasks/05-reborn-installs-a-new-hotel.md) replaces it with the installer.
  `Run` leaves the installer unmounted until then.
- [ ] The test of the behaviour builds the programs as the runner does and passes its own `cfg`.
- [ ] Update `packages/reborn/knowledge` and `README.md` to the new shape.

# Checks

```sh
make -C packages/reborn check
make -C apps/reborn check
make build
```

Then `make check` in every project that `make dependants project=<folder>` prints for `packages/reborn`, `apps/reborn`.
