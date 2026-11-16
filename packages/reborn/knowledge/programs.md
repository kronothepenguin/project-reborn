---
type: Go Package
title: Programs
description: The runner builds the CMS, housekeeping, the installer and the game with their own constructors, and reborn.New takes them as arguments.
---

# Programs

reborn runs the programs its runner builds. `apps/reborn/cmd/reborn/main.go` opens the database and builds each program
with its own constructor and options, as the CMS's runner does:

```go
cfg := config.Get()
db := store.FromConfig()

c := cms.New(db, cms.WithResolver(cmsPages), cms.WithStatic(cmsFiles))
h := housekeeping.New(db, housekeeping.WithResolver(hkPages), housekeeping.WithStatic(hkFiles))
i, err := installer.New(ctx, installer.WithResolver(inPages), installer.WithStatic(inFiles))
g := server.New(db)

r := reborn.New(cfg, db, c, h, i, g)
log.Fatalln(r.Run(ctx))
```

- Each pair of pages and files comes from the package's `DistFS`: `astro.MakeFSResolver` and `http.FileServerFS` of its
  `dist/`.
- The CMS is built first, so its automatic updates run before the game reads the database.
- `reborn.New(cfg, db, c, h, i, g)` takes what it requires as arguments. reborn has no option of its own.
- `installer.New` takes a context and returns an error, and opens the database `config.json` names on its own handle.
